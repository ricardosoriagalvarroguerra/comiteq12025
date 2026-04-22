import { useMemo, useState } from 'react'
import * as d3 from 'd3'
import { TextCard } from '@/components/cards/TextCard'
import { Card } from '@/components/ui/Card'
import './DebtAuthorizationSlide.css'

interface Row {
  period: string
  endeudamiento: number
  envelope: number
  limite: number
}

const ROWS: Row[] = [
  { period: '2020', endeudamiento: 548, envelope: 1200, limite: 2658 },
  { period: '2021', endeudamiento: 918, envelope: 2500, limite: 3043 },
  { period: '2022', endeudamiento: 1021, envelope: 2500, limite: 3214 },
  { period: '2023', endeudamiento: 1030, envelope: 2500, limite: 3830 },
  { period: '2024', endeudamiento: 1405, envelope: 2500, limite: 4269 },
  { period: '2025', endeudamiento: 2079, envelope: 2500, limite: 5161 },
  { period: '2026', endeudamiento: 2518, envelope: 2500, limite: 5445 },
  { period: 'Q1-2026', endeudamiento: 2090, envelope: 2500, limite: 5210 },
  { period: 'Q2-2026', endeudamiento: 2369, envelope: 5000, limite: 5449 },
  { period: 'Q3-2026', endeudamiento: 2320, envelope: 5000, limite: 5412 },
  { period: 'Q4-2026', endeudamiento: 2520, envelope: 5000, limite: 5578 },
  { period: 'Q1-2027', endeudamiento: 2676, envelope: 5000, limite: 5741 },
]

const COLOR_ENDEUDAMIENTO = '#48cae4'
const COLOR_ENVELOPE = '#c1121f'
const COLOR_LIMITE = '#adb5bd'

const SERIES: Array<{
  id: keyof Omit<Row, 'period'>
  label: string
  color: string
}> = [
  { id: 'limite', label: 'Límite de política', color: COLOR_LIMITE },
  { id: 'envelope', label: 'Envelope autorizado DEJ', color: COLOR_ENVELOPE },
  { id: 'endeudamiento', label: 'Endeudamiento bruto', color: COLOR_ENDEUDAMIENTO },
]

const nf0 = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

interface DebtAuthorizationSlideProps {
  eyebrow?: string
  title: string
  description?: string
}

export function DebtAuthorizationSlide({
  eyebrow,
  title,
  description,
}: DebtAuthorizationSlideProps) {
  const [hover, setHover] = useState<number | null>(null)

  const W = 1100
  const H = 420
  const margin = { top: 20, right: 28, bottom: 44, left: 56 }
  const innerW = W - margin.left - margin.right
  const innerH = H - margin.top - margin.bottom

  const x = useMemo(
    () =>
      d3
        .scalePoint<string>()
        .domain(ROWS.map((r) => r.period))
        .range([0, innerW])
        .padding(0.2),
    [innerW],
  )

  const maxY = useMemo(
    () => (d3.max(ROWS, (r) => Math.max(r.endeudamiento, r.envelope, r.limite)) ?? 1) * 1.1,
    [],
  )

  const y = useMemo(
    () => d3.scaleLinear().domain([0, maxY]).nice().range([innerH, 0]),
    [maxY, innerH],
  )

  const yTicks = y.ticks(5)

  const areaFor = (id: keyof Omit<Row, 'period'>) => {
    const gen = d3
      .area<Row>()
      .x((r) => x(r.period) ?? 0)
      .y0(innerH)
      .y1((r) => y(r[id]))
      .curve(d3.curveMonotoneX)
    return gen(ROWS) ?? ''
  }

  const lineFor = (id: keyof Omit<Row, 'period'>) => {
    const gen = d3
      .line<Row>()
      .x((r) => x(r.period) ?? 0)
      .y((r) => y(r[id]))
      .curve(d3.curveMonotoneX)
    return gen(ROWS) ?? ''
  }

  const hovered = hover !== null ? ROWS[hover] : null

  return (
    <div className="debt-auth">
      <div className="debt-auth__head">
        <TextCard eyebrow={eyebrow} title={title} description={description} />
      </div>
      <Card padding="md" className="debt-auth__chart-card">
        <div className="debt-auth__chart-head">
          <span className="debt-auth__chart-title">Monitoreo del Endeudamiento</span>
          <span className="debt-auth__chart-unit">USD MM</span>
        </div>

        <div className="debt-auth__chart-wrap" onMouseLeave={() => setHover(null)}>
          <div className="debt-auth__legend">
            <span className="debt-auth__legend-period">
              {hovered ? hovered.period : 'Leyenda'}
            </span>
            {SERIES.map((s) => {
              const v = hovered ? hovered[s.id] : null
              return (
                <span key={s.id} className="debt-auth__legend-row">
                  <span
                    className="debt-auth__legend-swatch"
                    style={{ background: s.color }}
                  />
                  <span className="debt-auth__legend-name">{s.label}</span>
                  {v !== null && (
                    <strong className="debt-auth__legend-value">{nf0.format(v)}</strong>
                  )}
                </span>
              )
            })}
          </div>

          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="debt-auth__svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <g transform={`translate(${margin.left},${margin.top})`}>
              {yTicks.map((t) => (
                <g key={t}>
                  <line
                    x1={0}
                    x2={innerW}
                    y1={y(t)}
                    y2={y(t)}
                    className="debt-auth__grid"
                  />
                  <text
                    x={-8}
                    y={y(t)}
                    dy="0.32em"
                    textAnchor="end"
                    className="debt-auth__axis-label"
                  >
                    {nf0.format(t)}
                  </text>
                </g>
              ))}

              <line
                x1={0}
                x2={innerW}
                y1={innerH}
                y2={innerH}
                className="debt-auth__axis-line"
              />

              {/* Areas: largest first (back), smallest last (front) */}
              <path d={areaFor('limite')} fill={COLOR_LIMITE} opacity={0.22} />
              <path d={areaFor('envelope')} fill={COLOR_ENVELOPE} opacity={0.22} />
              <path d={areaFor('endeudamiento')} fill={COLOR_ENDEUDAMIENTO} opacity={0.32} />

              {/* Lines on top */}
              <path
                d={lineFor('limite')}
                stroke={COLOR_LIMITE}
                fill="none"
                strokeWidth={2}
                className="debt-auth__line"
              />
              <path
                d={lineFor('envelope')}
                stroke={COLOR_ENVELOPE}
                fill="none"
                strokeWidth={2}
                className="debt-auth__line"
              />
              <path
                d={lineFor('endeudamiento')}
                stroke={COLOR_ENDEUDAMIENTO}
                fill="none"
                strokeWidth={2}
                className="debt-auth__line"
              />

              {/* Dots at hovered column */}
              {hovered && (
                <>
                  <line
                    x1={x(hovered.period) ?? 0}
                    x2={x(hovered.period) ?? 0}
                    y1={0}
                    y2={innerH}
                    className="debt-auth__hover-line"
                  />
                  {SERIES.map((s) => (
                    <circle
                      key={s.id}
                      cx={x(hovered.period) ?? 0}
                      cy={y(hovered[s.id])}
                      r={4.5}
                      fill={s.color}
                      stroke="var(--color-surface)"
                      strokeWidth={1.5}
                    />
                  ))}
                </>
              )}

              {/* X labels */}
              {ROWS.map((r) => (
                <text
                  key={`xt-${r.period}`}
                  x={x(r.period) ?? 0}
                  y={innerH + 20}
                  textAnchor="middle"
                  className="debt-auth__axis-label"
                >
                  {r.period}
                </text>
              ))}

              {/* Hit areas */}
              {ROWS.map((r, i) => {
                const cx = x(r.period) ?? 0
                const prev = i > 0 ? x(ROWS[i - 1].period) ?? 0 : cx
                const next = i < ROWS.length - 1 ? x(ROWS[i + 1].period) ?? 0 : cx
                const left = (prev + cx) / 2
                const right = (cx + next) / 2
                return (
                  <rect
                    key={`hit-${r.period}`}
                    x={left}
                    y={0}
                    width={Math.max(1, right - left)}
                    height={innerH}
                    fill="transparent"
                    onMouseEnter={() => setHover(i)}
                    style={{ cursor: 'pointer' }}
                  />
                )
              })}
            </g>
          </svg>
        </div>
      </Card>
    </div>
  )
}
