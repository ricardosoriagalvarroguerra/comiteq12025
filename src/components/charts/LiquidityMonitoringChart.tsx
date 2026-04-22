import { useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import './LiquidityMonitoringChart.css'

interface LiquidityPoint {
  date: string
  minimaRequerida: number
  liquidez: number
}

interface LiquidityMonitoringChartProps {
  data: LiquidityPoint[]
  unit?: string
}

const COLOR_LIQ = '#55a630'
const COLOR_MIN = 'var(--color-accent, #c1121f)'

const VB_WIDTH = 720
const VB_HEIGHT = 320

export function LiquidityMonitoringChart({
  data,
  unit = 'USD MM',
}: LiquidityMonitoringChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const width = VB_WIDTH
  const height = VB_HEIGHT
  const margin = { top: 28, right: 16, bottom: 32, left: 52 }
  const innerW = Math.max(10, width - margin.left - margin.right)
  const innerH = Math.max(10, height - margin.top - margin.bottom)

  const x = useMemo(
    () =>
      d3
        .scalePoint<string>()
        .domain(data.map((d) => d.date))
        .range([0, innerW])
        .padding(0.5),
    [data, innerW],
  )

  const yMin = d3.min(data, (d) => Math.min(d.minimaRequerida, d.liquidez)) ?? 0
  const yMax = d3.max(data, (d) => Math.max(d.minimaRequerida, d.liquidez)) ?? 1
  const pad = (yMax - yMin) * 0.18
  const y = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([Math.max(0, yMin - pad), yMax + pad])
        .nice()
        .range([innerH, 0]),
    [yMin, yMax, pad, innerH],
  )

  const lineLiq = useMemo(
    () =>
      d3
        .line<LiquidityPoint>()
        .x((d) => x(d.date) ?? 0)
        .y((d) => y(d.liquidez))
        .curve(d3.curveMonotoneX),
    [x, y],
  )
  const lineMin = useMemo(
    () =>
      d3
        .line<LiquidityPoint>()
        .x((d) => x(d.date) ?? 0)
        .y((d) => y(d.minimaRequerida))
        .curve(d3.curveMonotoneX),
    [x, y],
  )

  const yTicks = y.ticks(5)
  const xTicks = data.filter((_, i) => i % 2 === 0)

  const fmt = (n: number) => n.toLocaleString('es-AR', { maximumFractionDigits: 0 })

  const hovered = hoverIdx !== null ? data[hoverIdx] : null
  const hoverX = hovered ? (x(hovered.date) ?? 0) : 0

  const handleMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const vbX = ((e.clientX - rect.left) / rect.width) * width - margin.left
    if (vbX < 0 || vbX > innerW) {
      setHoverIdx(null)
      return
    }
    let closest = 0
    let closestD = Infinity
    data.forEach((d, i) => {
      const dx = Math.abs((x(d.date) ?? 0) - vbX)
      if (dx < closestD) {
        closestD = dx
        closest = i
      }
    })
    setHoverIdx(closest)
  }

  const tooltipLeftPct =
    hovered != null ? ((margin.left + hoverX) / width) * 100 : 0
  const tooltipTopPct =
    hovered != null
      ? ((margin.top +
          Math.min(y(hovered.liquidez), y(hovered.minimaRequerida))) /
          height) *
        100
      : 0

  return (
    <div className="liq-chart">
      <svg
        ref={svgRef}
        className="liq-chart__svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        onPointerMove={handleMove}
        onPointerLeave={() => setHoverIdx(null)}
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Grid */}
          {yTicks.map((t) => (
            <g key={t} transform={`translate(0,${y(t)})`}>
              <line
                x1={0}
                x2={innerW}
                className="liq-chart__grid"
              />
              <text
                x={-8}
                y={0}
                dy="0.32em"
                textAnchor="end"
                className="liq-chart__axis-label"
              >
                {fmt(t)}
              </text>
            </g>
          ))}

          {/* X axis labels */}
          {xTicks.map((d) => (
            <text
              key={d.date}
              x={x(d.date) ?? 0}
              y={innerH + 18}
              textAnchor="middle"
              className="liq-chart__axis-label"
            >
              {d.date}
            </text>
          ))}

          {/* Hover capture rect */}
          <rect
            x={0}
            y={0}
            width={innerW}
            height={innerH}
            fill="transparent"
          />

          {/* Hover guide line */}
          {hovered && (
            <line
              x1={hoverX}
              x2={hoverX}
              y1={0}
              y2={innerH}
              className="liq-chart__hover-guide"
            />
          )}

          {/* Lines */}
          <path
            d={lineLiq(data) ?? ''}
            fill="none"
            stroke={COLOR_LIQ}
            strokeWidth={2}
            strokeDasharray="5 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={lineMin(data) ?? ''}
            fill="none"
            stroke={COLOR_MIN}
            strokeWidth={2}
            strokeDasharray="5 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data labels */}
          {data.map((d) => (
            <g key={`lbl-${d.date}`}>
              <text
                x={x(d.date) ?? 0}
                y={y(d.liquidez) - 8}
                textAnchor="middle"
                className="liq-chart__data-label liq-chart__data-label--liq"
              >
                {fmt(d.liquidez)}
              </text>
              <text
                x={x(d.date) ?? 0}
                y={y(d.minimaRequerida) + 14}
                textAnchor="middle"
                className="liq-chart__data-label liq-chart__data-label--min"
              >
                {fmt(d.minimaRequerida)}
              </text>
            </g>
          ))}

          {/* Dots */}
          {data.map((d, i) => (
            <g key={`pt-${d.date}`}>
              <circle
                cx={x(d.date) ?? 0}
                cy={y(d.liquidez)}
                r={hoverIdx === i ? 5 : 3}
                fill={COLOR_LIQ}
                stroke="var(--color-surface, #fff)"
                strokeWidth={1.5}
              />
              <circle
                cx={x(d.date) ?? 0}
                cy={y(d.minimaRequerida)}
                r={hoverIdx === i ? 5 : 3}
                fill={COLOR_MIN}
                stroke="var(--color-surface, #fff)"
                strokeWidth={1.5}
              />
            </g>
          ))}
        </g>
      </svg>

      {/* Legend */}
      <div className="liq-chart__legend">
        <span className="liq-chart__legend-item">
          <span
            className="liq-chart__legend-swatch"
            style={{ background: COLOR_MIN }}
          />
          Mínima requerida
        </span>
        <span className="liq-chart__legend-item">
          <span
            className="liq-chart__legend-swatch"
            style={{ background: COLOR_LIQ }}
          />
          Liquidez
        </span>
        <span className="liq-chart__legend-unit">{unit}</span>
      </div>

      {/* Tooltip */}
      {hovered && (
        <div
          className="liq-chart__tooltip"
          role="status"
          aria-live="polite"
          style={{
            left: `${tooltipLeftPct}%`,
            top: `${tooltipTopPct}%`,
          }}
        >
          <div className="liq-chart__tooltip-date">{hovered.date}</div>
          <div className="liq-chart__tooltip-row">
            <span
              className="liq-chart__tooltip-swatch"
              style={{ background: COLOR_MIN }}
            />
            <span className="liq-chart__tooltip-label">Mínima requerida</span>
            <strong>{fmt(hovered.minimaRequerida)}</strong>
          </div>
          <div className="liq-chart__tooltip-row">
            <span
              className="liq-chart__tooltip-swatch"
              style={{ background: COLOR_LIQ }}
            />
            <span className="liq-chart__tooltip-label">Liquidez</span>
            <strong>{fmt(hovered.liquidez)}</strong>
          </div>
        </div>
      )}
    </div>
  )
}

export type { LiquidityPoint }
