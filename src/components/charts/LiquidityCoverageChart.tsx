import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as d3 from 'd3'
import './LiquidityCoverageChart.css'

interface CoveragePoint {
  year: number
  fonplata: number
}

interface LiquidityCoverageChartProps {
  data: CoveragePoint[]
}

const RATING_BANDS: Array<{ label: string; min: number; max: number; fillOpacity: number }> = [
  { label: 'A3', min: 75, max: 90, fillOpacity: 0.08 },
  { label: 'A2', min: 90, max: 105, fillOpacity: 0.14 },
  { label: 'A1', min: 105, max: 120, fillOpacity: 0.22 },
  { label: 'AA3', min: 120, max: 147, fillOpacity: 0.3 },
  { label: 'AA2', min: 147, max: 173, fillOpacity: 0.4 },
  { label: 'AA1', min: 173, max: 200, fillOpacity: 0.52 },
  { label: 'AAA', min: 200, max: 240, fillOpacity: 0.65 },
]

const BAND_COLOR = '#55a630'
const LINE_COLOR = 'var(--color-accent, #c1121f)'

const VB_WIDTH = 720
const VB_HEIGHT = 360

export function LiquidityCoverageChart({ data }: LiquidityCoverageChartProps) {
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
  const margin = { top: 24, right: 42, bottom: 36, left: 52 }
  const innerW = Math.max(10, width - margin.left - margin.right)
  const innerH = Math.max(10, height - margin.top - margin.bottom)

  const yMin = 60
  const yMax = 230

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
        .line<CoveragePoint>()
        .x((d) => x(d.year) ?? 0)
        .y((d) => y(d.fonplata))
        .curve(d3.curveMonotoneX),
    [x, y],
  )

  const yTicks = [75, 100, 125, 150, 175, 200, 225]

  const hovered = hoverIdx !== null ? data[hoverIdx] : null
  const hoverX = hovered ? (x(hovered.year) ?? 0) : 0

  function getRating(v: number): string {
    for (let i = RATING_BANDS.length - 1; i >= 0; i--) {
      if (v >= RATING_BANDS[i].min) return RATING_BANDS[i].label
    }
    return 'Sub A3'
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
    hovered != null ? ((margin.top + y(hovered.fonplata)) / height) * 100 : 0

  const chartNode = (
    <div className={`liq-cov ${fullscreen ? 'liq-cov--fullscreen' : ''}`}>
      <button
        type="button"
        className="liq-cov__fs-btn"
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
        className="liq-cov__svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        onPointerMove={handleMove}
        onPointerLeave={() => setHoverIdx(null)}
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Rating bands */}
          {RATING_BANDS.map((band) => {
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
                  fill={BAND_COLOR}
                  fillOpacity={band.fillOpacity}
                />
                <text
                  x={innerW + 6}
                  y={yTop + h / 2}
                  dy="0.32em"
                  textAnchor="start"
                  className="liq-cov__band-label"
                >
                  {band.label}
                </text>
              </g>
            )
          })}

          {/* Grid + Y-axis labels */}
          {yTicks.map((t) => (
            <g key={t} transform={`translate(0,${y(t)})`}>
              <line
                x1={0}
                x2={innerW}
                className="liq-cov__grid"
              />
              <text
                x={-8}
                y={0}
                dy="0.32em"
                textAnchor="end"
                className="liq-cov__axis-label"
              >
                {t}%
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {data.map((d) => (
            <text
              key={d.year}
              x={x(d.year) ?? 0}
              y={innerH + 20}
              textAnchor="middle"
              className="liq-cov__axis-label"
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
              className="liq-cov__hover-guide"
            />
          )}

          {/* FONPLATA line */}
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
              y={y(d.fonplata) - 10}
              textAnchor="middle"
              className="liq-cov__data-label"
            >
              {d.fonplata}%
            </text>
          ))}

          {/* Dots */}
          {data.map((d, i) => (
            <circle
              key={`pt-${d.year}`}
              cx={x(d.year) ?? 0}
              cy={y(d.fonplata)}
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
          className="liq-cov__tooltip"
          role="status"
          aria-live="polite"
          style={{
            left: `${tooltipLeftPct}%`,
            top: `${tooltipTopPct}%`,
          }}
        >
          <div className="liq-cov__tooltip-date">{hovered.year}</div>
          <div className="liq-cov__tooltip-row">
            <span
              className="liq-cov__tooltip-swatch"
              style={{ background: LINE_COLOR }}
            />
            <span className="liq-cov__tooltip-label">FONPLATA</span>
            <strong>{hovered.fonplata}%</strong>
          </div>
          <div className="liq-cov__tooltip-row">
            <span className="liq-cov__tooltip-label">Rating (Moody's)</span>
            <strong>{getRating(hovered.fonplata)}</strong>
          </div>
        </div>
      )}
    </div>
  )

  return fullscreen ? createPortal(chartNode, document.body) : chartNode
}

export type { CoveragePoint }
