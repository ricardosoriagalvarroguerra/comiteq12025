import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as d3 from 'd3'
import './AssetStructureChart.css'

interface AssetPoint {
  year: number
  ratio: number
}

interface AssetStructureChartProps {
  data: AssetPoint[]
}

const LINE_COLOR = 'var(--color-accent, #c1121f)'

const VB_WIDTH = 720
const VB_HEIGHT = 360

export function AssetStructureChart({ data }: AssetStructureChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.classList.add('is-chart-fullscreen')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      document.body.classList.remove('is-chart-fullscreen')
    }
  }, [fullscreen])

  const width = VB_WIDTH
  const height = VB_HEIGHT
  const margin = { top: 24, right: 24, bottom: 36, left: 52 }
  const innerW = Math.max(10, width - margin.left - margin.right)
  const innerH = Math.max(10, height - margin.top - margin.bottom)

  const yMin = 20
  const yMax = 40

  const x = useMemo(
    () =>
      d3
        .scalePoint<number>()
        .domain(data.map((d) => d.year))
        .range([0, innerW])
        .padding(0.5),
    [data, innerW],
  )

  const y = useMemo(
    () => d3.scaleLinear().domain([yMin, yMax]).range([innerH, 0]),
    [innerH],
  )

  const line = useMemo(
    () =>
      d3
        .line<AssetPoint>()
        .x((d) => x(d.year) ?? 0)
        .y((d) => y(d.ratio))
        .curve(d3.curveMonotoneX),
    [x, y],
  )

  const yTicks = [20, 25, 30, 35, 40]

  const hovered = hoverIdx !== null ? data[hoverIdx] : null
  const hoverX = hovered ? (x(hovered.year) ?? 0) : 0

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
      const dx = Math.abs((x(d.year) ?? 0) - vbX)
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
    hovered != null ? ((margin.top + y(hovered.ratio)) / height) * 100 : 0

  const chartNode = (
    <div className={`asset-struct ${fullscreen ? 'asset-struct--fullscreen' : ''}`}>
      <button
        type="button"
        className="asset-struct__fs-btn"
        onClick={() => setFullscreen((f) => !f)}
        aria-label={fullscreen ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
        title={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
      >
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {fullscreen ? (
            <>
              <path d="M6 2v4H2" />
              <path d="M10 2v4h4" />
              <path d="M6 14v-4H2" />
              <path d="M10 14v-4h4" />
            </>
          ) : (
            <>
              <path d="M2 6V2h4" />
              <path d="M14 6V2h-4" />
              <path d="M2 10v4h4" />
              <path d="M14 10v4h-4" />
            </>
          )}
        </svg>
      </button>
      <svg
        ref={svgRef}
        className="asset-struct__svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        onPointerMove={handleMove}
        onPointerLeave={() => setHoverIdx(null)}
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Grid + Y axis */}
          {yTicks.map((t) => (
            <g key={t} transform={`translate(0,${y(t)})`}>
              <line
                x1={0}
                x2={innerW}
                className="asset-struct__grid"
              />
              <text
                x={-8}
                y={0}
                dy="0.32em"
                textAnchor="end"
                className="asset-struct__axis-label"
              >
                {t}%
              </text>
            </g>
          ))}

          {/* X axis labels */}
          {data.map((d) => (
            <text
              key={d.year}
              x={x(d.year) ?? 0}
              y={innerH + 20}
              textAnchor="middle"
              className="asset-struct__axis-label"
            >
              {d.year}
            </text>
          ))}

          {/* Hover guide */}
          {hovered && (
            <line
              x1={hoverX}
              x2={hoverX}
              y1={0}
              y2={innerH}
              className="asset-struct__hover-guide"
            />
          )}

          {/* Line */}
          <path
            d={line(data) ?? ''}
            fill="none"
            stroke={LINE_COLOR}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data labels */}
          {data.map((d) => (
            <text
              key={`lbl-${d.year}`}
              x={x(d.year) ?? 0}
              y={y(d.ratio) - 10}
              textAnchor="middle"
              className="asset-struct__data-label"
            >
              {d.ratio.toFixed(1)}%
            </text>
          ))}

          {/* Dots */}
          {data.map((d, i) => (
            <circle
              key={`pt-${d.year}`}
              cx={x(d.year) ?? 0}
              cy={y(d.ratio)}
              r={hoverIdx === i ? 5.5 : 3.5}
              fill={LINE_COLOR}
              stroke="var(--color-surface, #fff)"
              strokeWidth={1.5}
            />
          ))}
        </g>
      </svg>

      {/* Tooltip */}
      {hovered && (
        <div
          className="asset-struct__tooltip"
          role="status"
          aria-live="polite"
          style={{
            left: `${tooltipLeftPct}%`,
            top: `${tooltipTopPct}%`,
          }}
        >
          <div className="asset-struct__tooltip-date">{hovered.year}</div>
          <div className="asset-struct__tooltip-row">
            <span
              className="asset-struct__tooltip-swatch"
              style={{ background: LINE_COLOR }}
            />
            <span className="asset-struct__tooltip-label">Ratio</span>
            <strong>{hovered.ratio.toFixed(1)}%</strong>
          </div>
        </div>
      )}
    </div>
  )

  return fullscreen ? createPortal(chartNode, document.body) : chartNode
}

export type { AssetPoint }
