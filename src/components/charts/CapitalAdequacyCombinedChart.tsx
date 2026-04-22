import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as d3 from 'd3'
import './CapitalAdequacyCombinedChart.css'

interface CapitalAdequacyPoint {
  period: string
  ratio: number
  activosAjustados: number
  patrimonio: number
}

interface CapitalAdequacyCombinedChartProps {
  data: CapitalAdequacyPoint[]
  title?: string
}

const COLOR_RATIO = 'var(--color-accent, #c1121f)'
const COLOR_ACTIVOS = '#48cae4'
const COLOR_PATRIMONIO = '#adb5bd'

const VB_WIDTH = 860
const VB_HEIGHT = 400

export function CapitalAdequacyCombinedChart({
  data,
  title,
}: CapitalAdequacyCombinedChartProps) {
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
  const margin = { top: 24, right: 62, bottom: 40, left: 58 }
  const innerW = Math.max(10, width - margin.left - margin.right)
  const innerH = Math.max(10, height - margin.top - margin.bottom)

  const x = useMemo(
    () =>
      d3
        .scaleBand<string>()
        .domain(data.map((d) => d.period))
        .range([0, innerW])
        .padding(0.25),
    [data, innerW],
  )

  const xInner = useMemo(
    () =>
      d3
        .scaleBand<string>()
        .domain(['activos', 'patrimonio'])
        .range([0, x.bandwidth()])
        .padding(0.15),
    [x],
  )

  const maxBar = d3.max(data, (d) =>
    Math.max(d.activosAjustados, d.patrimonio),
  ) ?? 0
  const maxRatio = d3.max(data, (d) => d.ratio) ?? 0
  const minRatio = d3.min(data, (d) => d.ratio) ?? 0

  const yBar = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, maxBar * 1.1])
        .nice()
        .range([innerH, 0]),
    [maxBar, innerH],
  )

  const yLine = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([Math.max(0, minRatio - 10), maxRatio + 10])
        .nice()
        .range([innerH, 0]),
    [minRatio, maxRatio, innerH],
  )

  const linePath = useMemo(
    () =>
      d3
        .line<CapitalAdequacyPoint>()
        .x((d) => (x(d.period) ?? 0) + x.bandwidth() / 2)
        .y((d) => yLine(d.ratio))
        .curve(d3.curveMonotoneX),
    [x, yLine],
  )

  const yBarTicks = yBar.ticks(5)
  const yLineTicks = yLine.ticks(5)

  const hovered = hoverIdx !== null ? data[hoverIdx] : null
  const hoverX =
    hovered != null ? (x(hovered.period) ?? 0) + x.bandwidth() / 2 : 0

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
      const center = (x(d.period) ?? 0) + x.bandwidth() / 2
      const dx = Math.abs(center - vbX)
      if (dx < closestD) {
        closestD = dx
        closest = i
      }
    })
    setHoverIdx(closest)
  }

  const fmt1 = (n: number) =>
    n.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  const fmt3 = (n: number) =>
    n.toLocaleString('es-AR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })

  const tooltipLeftPct =
    hovered != null ? ((margin.left + hoverX) / width) * 100 : 0
  const tooltipTopPct =
    hovered != null ? ((margin.top + yLine(hovered.ratio)) / height) * 100 : 0

  const chartNode = (
    <div className={`cap-combo ${fullscreen ? 'cap-combo--fullscreen' : ''}`}>
      <header className="cap-combo__header">
        {title && <span className="cap-combo__title">{title}</span>}
        <div className="cap-combo__legend">
          <span className="cap-combo__legend-item">
            <span className="cap-combo__legend-swatch" style={{ background: COLOR_ACTIVOS }} />
            Activos ajustados por riesgo
          </span>
          <span className="cap-combo__legend-item">
            <span className="cap-combo__legend-swatch" style={{ background: COLOR_PATRIMONIO }} />
            Patrimonio
          </span>
          <span className="cap-combo__legend-item">
            <span
              className="cap-combo__legend-line"
              style={{ background: COLOR_RATIO }}
            />
            Ratio de Adecuación
          </span>
        </div>
        <button
          type="button"
          className="cap-combo__fs-btn"
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
      </header>
      <div className="cap-combo__surface">
        <svg
          ref={svgRef}
          className="cap-combo__svg"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          onPointerMove={handleMove}
          onPointerLeave={() => setHoverIdx(null)}
        >
          <g transform={`translate(${margin.left},${margin.top})`}>
            {/* Grid (bar axis) */}
            {yBarTicks.map((t) => (
              <line
                key={`g-${t}`}
                x1={0}
                x2={innerW}
                y1={yBar(t)}
                y2={yBar(t)}
                className="cap-combo__grid"
              />
            ))}

            {/* Left axis labels (Ratio %) */}
            {yLineTicks.map((t) => (
              <text
                key={`yl-${t}`}
                x={-8}
                y={yLine(t)}
                dy="0.32em"
                textAnchor="end"
                className="cap-combo__axis-label cap-combo__axis-label--line"
              >
                {t}%
              </text>
            ))}

            {/* Right axis labels (USD MM) */}
            {yBarTicks.map((t) => (
              <text
                key={`yr-${t}`}
                x={innerW + 8}
                y={yBar(t)}
                dy="0.32em"
                textAnchor="start"
                className="cap-combo__axis-label cap-combo__axis-label--bar"
              >
                {d3.format('~s')(t)}
              </text>
            ))}

            {/* X-axis labels */}
            {data.map((d) => (
              <text
                key={`x-${d.period}`}
                x={(x(d.period) ?? 0) + x.bandwidth() / 2}
                y={innerH + 20}
                textAnchor="middle"
                className="cap-combo__axis-label"
              >
                {d.period}
              </text>
            ))}

            {/* Hover guide */}
            {hovered && (
              <line
                x1={hoverX}
                x2={hoverX}
                y1={0}
                y2={innerH}
                className="cap-combo__hover-guide"
              />
            )}

            {/* Grouped bars */}
            {data.map((d) => {
              const bx = x(d.period) ?? 0
              return (
                <g key={`bars-${d.period}`} transform={`translate(${bx},0)`}>
                  <rect
                    x={xInner('activos') ?? 0}
                    y={yBar(d.activosAjustados)}
                    width={xInner.bandwidth()}
                    height={Math.max(0, innerH - yBar(d.activosAjustados))}
                    fill={COLOR_ACTIVOS}
                    rx={1.5}
                  />
                  <rect
                    x={xInner('patrimonio') ?? 0}
                    y={yBar(d.patrimonio)}
                    width={xInner.bandwidth()}
                    height={Math.max(0, innerH - yBar(d.patrimonio))}
                    fill={COLOR_PATRIMONIO}
                    rx={1.5}
                  />
                </g>
              )
            })}

            {/* Ratio line */}
            <path
              d={linePath(data) ?? ''}
              fill="none"
              stroke={COLOR_RATIO}
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Ratio data labels */}
            {data.map((d) => (
              <text
                key={`rl-${d.period}`}
                x={(x(d.period) ?? 0) + x.bandwidth() / 2}
                y={yLine(d.ratio) - 10}
                textAnchor="middle"
                className="cap-combo__ratio-label"
              >
                {fmt1(d.ratio)}%
              </text>
            ))}

            {/* Ratio dots */}
            {data.map((d, i) => (
              <circle
                key={`rd-${d.period}`}
                cx={(x(d.period) ?? 0) + x.bandwidth() / 2}
                cy={yLine(d.ratio)}
                r={hoverIdx === i ? 5.5 : 3.5}
                fill={COLOR_RATIO}
                stroke="var(--color-surface, #fff)"
                strokeWidth={1.5}
              />
            ))}
          </g>
        </svg>

        {hovered && (
          <div
            className="cap-combo__tooltip"
            role="status"
            aria-live="polite"
            style={{ left: `${tooltipLeftPct}%`, top: `${tooltipTopPct}%` }}
          >
            <div className="cap-combo__tooltip-date">{hovered.period}</div>
            <div className="cap-combo__tooltip-row">
              <span
                className="cap-combo__tooltip-swatch"
                style={{ background: COLOR_RATIO }}
              />
              <span className="cap-combo__tooltip-label">Ratio</span>
              <strong>{fmt1(hovered.ratio)}%</strong>
            </div>
            <div className="cap-combo__tooltip-row">
              <span
                className="cap-combo__tooltip-swatch"
                style={{ background: COLOR_ACTIVOS }}
              />
              <span className="cap-combo__tooltip-label">Activos aj.</span>
              <strong>{fmt3(hovered.activosAjustados)}</strong>
            </div>
            <div className="cap-combo__tooltip-row">
              <span
                className="cap-combo__tooltip-swatch"
                style={{ background: COLOR_PATRIMONIO }}
              />
              <span className="cap-combo__tooltip-label">Patrimonio</span>
              <strong>{fmt3(hovered.patrimonio)}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return fullscreen ? createPortal(chartNode, document.body) : chartNode
}

export type { CapitalAdequacyPoint }
