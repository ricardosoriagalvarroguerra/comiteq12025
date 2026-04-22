import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as d3 from 'd3'
import './RacSpChart.css'

interface RacPoint {
  year: number
  rac: number
}

interface RacSpChartProps {
  data: RacPoint[]
}

const LINE_COLOR = 'var(--color-accent, #c1121f)'

interface Band {
  label: string
  min: number
  max: number
  color: string
  opacity: number
}

const RAC_BANDS: Band[] = [
  { label: 'Very Weak', min: 0, max: 3, color: '#c1121f', opacity: 0.22 },
  { label: 'Weak', min: 3, max: 5, color: '#e85d4c', opacity: 0.22 },
  { label: 'Moderate', min: 5, max: 7, color: '#f48c06', opacity: 0.22 },
  { label: 'Adequate', min: 7, max: 10, color: '#f9c74f', opacity: 0.28 },
  { label: 'Strong', min: 10, max: 15, color: '#90be6d', opacity: 0.3 },
  { label: 'Very Strong', min: 15, max: 23, color: '#55a630', opacity: 0.28 },
  { label: 'Extremely Strong', min: 23, max: 45, color: '#2d6a4f', opacity: 0.3 },
]

const VB_WIDTH = 760
const VB_HEIGHT = 380

export function RacSpChart({ data }: RacSpChartProps) {
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
  const margin = { top: 24, right: 128, bottom: 36, left: 52 }
  const innerW = Math.max(10, width - margin.left - margin.right)
  const innerH = Math.max(10, height - margin.top - margin.bottom)

  const yMin = 0
  const yMax = 45

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
        .line<RacPoint>()
        .x((d) => x(d.year) ?? 0)
        .y((d) => y(d.rac))
        .curve(d3.curveMonotoneX),
    [x, y],
  )

  const yTicks = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45]

  const hovered = hoverIdx !== null ? data[hoverIdx] : null
  const hoverX = hovered ? (x(hovered.year) ?? 0) : 0

  function getCategory(v: number): string {
    for (let i = RAC_BANDS.length - 1; i >= 0; i--) {
      if (v >= RAC_BANDS[i].min) return RAC_BANDS[i].label
    }
    return 'Very Weak'
  }

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
    hovered != null ? ((margin.top + y(hovered.rac)) / height) * 100 : 0

  const chartNode = (
    <div className={`rac-sp ${fullscreen ? 'rac-sp--fullscreen' : ''}`}>
      <button
        type="button"
        className="rac-sp__fs-btn"
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
        className="rac-sp__svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        onPointerMove={handleMove}
        onPointerLeave={() => setHoverIdx(null)}
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Rating bands */}
          {RAC_BANDS.map((band) => {
            const yTop = y(Math.min(band.max, yMax))
            const yBot = y(Math.max(band.min, yMin))
            const h = Math.max(0, yBot - yTop)
            if (h <= 0) return null
            return (
              <g key={band.label}>
                <rect
                  x={0}
                  y={yTop}
                  width={innerW}
                  height={h}
                  fill={band.color}
                  fillOpacity={band.opacity}
                />
                <text
                  x={innerW + 6}
                  y={yTop + h / 2}
                  dy="0.32em"
                  textAnchor="start"
                  className="rac-sp__band-label"
                  style={{ fill: band.color }}
                >
                  {band.label}
                </text>
              </g>
            )
          })}

          {/* Grid + Y-axis */}
          {yTicks.map((t) => (
            <g key={t} transform={`translate(0,${y(t)})`}>
              <line x1={0} x2={innerW} className="rac-sp__grid" />
              <text
                x={-8}
                y={0}
                dy="0.32em"
                textAnchor="end"
                className="rac-sp__axis-label"
              >
                {t}%
              </text>
            </g>
          ))}

          {/* X-axis */}
          {data.map((d) => (
            <text
              key={d.year}
              x={x(d.year) ?? 0}
              y={innerH + 20}
              textAnchor="middle"
              className="rac-sp__axis-label"
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
              className="rac-sp__hover-guide"
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
              y={y(d.rac) - 10}
              textAnchor="middle"
              className="rac-sp__data-label"
            >
              {d.rac.toFixed(1)}%
            </text>
          ))}

          {/* Dots */}
          {data.map((d, i) => (
            <circle
              key={`pt-${d.year}`}
              cx={x(d.year) ?? 0}
              cy={y(d.rac)}
              r={hoverIdx === i ? 5.5 : 3.5}
              fill={LINE_COLOR}
              stroke="var(--color-surface, #fff)"
              strokeWidth={1.5}
            />
          ))}
        </g>
      </svg>

      {hovered && (
        <div
          className="rac-sp__tooltip"
          role="status"
          aria-live="polite"
          style={{ left: `${tooltipLeftPct}%`, top: `${tooltipTopPct}%` }}
        >
          <div className="rac-sp__tooltip-date">{hovered.year}</div>
          <div className="rac-sp__tooltip-row">
            <span
              className="rac-sp__tooltip-swatch"
              style={{ background: LINE_COLOR }}
            />
            <span className="rac-sp__tooltip-label">RAC S&amp;P</span>
            <strong>{hovered.rac.toFixed(1)}%</strong>
          </div>
          <div className="rac-sp__tooltip-row">
            <span className="rac-sp__tooltip-label">Categoría</span>
            <strong>{getCategory(hovered.rac)}</strong>
          </div>
        </div>
      )}
    </div>
  )

  return fullscreen ? createPortal(chartNode, document.body) : chartNode
}

export type { RacPoint }
