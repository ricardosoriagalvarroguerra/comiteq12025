import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import * as d3 from 'd3'
import { TextCard } from '@/components/cards/TextCard'
import { Card } from '@/components/ui/Card'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import {
  CountryDonut,
  COUNTRY_COLORS,
  COUNTRY_ORDER,
} from '@/components/charts/CountryDonut'
import {
  CARTERA_DATA,
  type CarteraCountry,
} from '@/data/carteraPorPais'
import './RiskCapacitySlide.css'

type Bucket = 'GI1' | 'GI2' | 'Superior' | 'Intermedia' | 'Básica'

interface PeriodDef {
  id: string
  label: string
  year: number
  quarter: 1 | 2 | 3 | 4
}

const PERIODS: PeriodDef[] = [
  { id: 'Q4-25', label: '4Q25', year: 2025, quarter: 4 },
  { id: 'Q1-26', label: '1Q26', year: 2026, quarter: 1 },
  { id: 'Q1-27', label: '1Q27 (Proy.)', year: 2027, quarter: 1 },
]

const BUCKETS: Bucket[] = ['GI1', 'GI2', 'Superior', 'Intermedia', 'Básica']

const BUCKET_BY_COUNTRY: Record<CarteraCountry, Bucket> = {
  ARG: 'Básica',
  BOL: 'Básica',
  BRA: 'Superior',
  PAR: 'GI2',
  URU: 'GI1',
  RNS: 'Intermedia',
}

function getCapacidadPorPais(period: PeriodDef): Record<CarteraCountry, number> {
  const out = {} as Record<CarteraCountry, number>
  for (const c of COUNTRY_ORDER) {
    const row = CARTERA_DATA.find(
      (r) => r.country === c && r.year === period.year && r.quarter === period.quarter,
    )
    out[c] =
      (row?.porCobrar ?? 0) +
      (row?.porDesembolsar ?? 0) +
      (row?.aprobadoNoVigente ?? 0)
  }
  return out
}

const fmt = (n: number) =>
  n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

function useFullscreen(): [boolean, (v: boolean | ((p: boolean) => boolean)) => void] {
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
  return [fullscreen, setFullscreen]
}

function FsButton({ fullscreen, onToggle, className = '' }: { fullscreen: boolean; onToggle: () => void; className?: string }) {
  return (
    <button
      type="button"
      className={`risk-capacity__fs-btn ${className}`}
      onClick={onToggle}
      aria-label={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
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
  )
}

// ─── Fullscreen-capable donut ───
function FsDonut({
  period,
  hoveredCountry,
  onHoverChange,
}: {
  period: PeriodDef
  hoveredCountry: CarteraCountry | null
  onHoverChange: (c: CarteraCountry | null) => void
}) {
  const [fullscreen, setFullscreen] = useFullscreen()
  const values = useMemo(() => getCapacidadPorPais(period), [period])
  const size = fullscreen ? 360 : 140

  const content = (
    <div className={`fs-chart ${fullscreen ? 'fs-chart--fullscreen' : ''}`}>
      <div className="fs-chart__head">
        <span className="fs-chart__label">{period.label}</span>
        <FsButton fullscreen={fullscreen} onToggle={() => setFullscreen((f) => !f)} />
      </div>
      <div className="fs-chart__body">
        <CountryDonut
          values={values}
          size={size}
          hoveredCountry={hoveredCountry}
          onHoverChange={onHoverChange}
        />
      </div>
    </div>
  )

  return fullscreen ? createPortal(content, document.body) : content
}

// ─── Fullscreen-capable bar chart ───
function FsBarChart({
  period,
  unit,
  hoveredCountry,
  onHoverChange,
}: {
  period: PeriodDef
  unit: 'mm' | 'pct'
  hoveredCountry: CarteraCountry | null
  onHoverChange: (c: CarteraCountry | null) => void
}) {
  const [fullscreen, setFullscreen] = useFullscreen()
  const w = fullscreen ? 1200 : 360
  const h = fullscreen ? 520 : 210

  const content = (
    <div className={`fs-chart ${fullscreen ? 'fs-chart--fullscreen' : ''}`}>
      <div className="fs-chart__head">
        <span className="fs-chart__label">
          {period.label} · Utilizada por calificación crediticia
        </span>
        <FsButton fullscreen={fullscreen} onToggle={() => setFullscreen((f) => !f)} />
      </div>
      <div className="fs-chart__body">
        <RatingBarChart
          period={period}
          width={w}
          height={h}
          unit={unit}
          hoveredCountry={hoveredCountry}
          onHoverChange={onHoverChange}
        />
      </div>
    </div>
  )

  return fullscreen ? createPortal(content, document.body) : content
}

// ─── Bar chart: capacidad por bucket de rating, segmentada por país ───

interface RatingBarChartProps {
  period: PeriodDef
  width: number
  height: number
  unit: 'mm' | 'pct'
  hoveredCountry?: CarteraCountry | null
  onHoverChange?: (c: CarteraCountry | null) => void
}

function RatingBarChart({
  period,
  width,
  height,
  unit,
  hoveredCountry,
  onHoverChange,
}: RatingBarChartProps) {
  const [hover, setHover] = useState<{ bucket: Bucket; country: CarteraCountry } | null>(null)

  const effectiveCountry = hoveredCountry ?? hover?.country ?? null
  const handleEnterSegment = (bucket: Bucket, country: CarteraCountry) => {
    setHover({ bucket, country })
    onHoverChange?.(country)
  }
  const handleLeave = () => {
    setHover(null)
    onHoverChange?.(null)
  }

  const cap = useMemo(() => getCapacidadPorPais(period), [period])
  const yearTotal = useMemo(
    () => Object.values(cap).reduce((s, v) => s + v, 0),
    [cap],
  )

  const bucketData = useMemo(
    () =>
      BUCKETS.map((b) => {
        const segments = COUNTRY_ORDER.filter(
          (c) => BUCKET_BY_COUNTRY[c] === b,
        ).map((c) => {
          const v = cap[c]
          return {
            country: c,
            rawValue: v,
            value: unit === 'pct' && yearTotal > 0 ? (v / yearTotal) * 100 : v,
          }
        })
        const total = segments.reduce((s, d) => s + d.value, 0)
        const rawTotal = segments.reduce((s, d) => s + d.rawValue, 0)
        return { bucket: b, segments, total, rawTotal }
      }),
    [cap, unit, yearTotal],
  )

  const margin = { top: 8, right: 12, bottom: 28, left: 44 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  const maxY = d3.max(bucketData, (d) => d.total) ?? 1
  const x = d3.scaleBand<Bucket>().domain(BUCKETS).range([0, innerW]).padding(0.25)
  const y = d3.scaleLinear().domain([0, maxY * 1.1]).nice().range([innerH, 0])

  const yTicks = y.ticks(4)

  const hoveredSegment = hover
    ? bucketData
        .find((b) => b.bucket === hover.bucket)
        ?.segments.find((s) => s.country === hover.country)
    : null

  return (
    <div
      className="risk-bar-chart"
      onMouseLeave={handleLeave}
    >
      {hover && hoveredSegment && (
        <div className="risk-bar-chart__tooltip" role="status" aria-live="polite">
          <span className="risk-bar-chart__tooltip-head">
            <span
              className="risk-bar-chart__tooltip-swatch"
              style={{ background: COUNTRY_COLORS[hover.country] }}
            />
            {hover.country} · {hover.bucket}
          </span>
          <span className="risk-bar-chart__tooltip-value">
            {unit === 'pct'
              ? `${hoveredSegment.value.toFixed(1)}%`
              : `${fmt(hoveredSegment.rawValue)} USD MM`}
          </span>
        </div>
      )}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        className="risk-bar-chart__svg"
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {yTicks.map((t) => (
            <g key={t}>
              <line
                x1={0}
                x2={innerW}
                y1={y(t)}
                y2={y(t)}
                className="risk-bar-chart__grid"
              />
              <text
                x={-6}
                y={y(t)}
                dy="0.32em"
                textAnchor="end"
                className="risk-bar-chart__axis-label"
              >
                {unit === 'pct' ? `${t}%` : fmt(t)}
              </text>
            </g>
          ))}
          <line
            x1={0}
            x2={innerW}
            y1={innerH}
            y2={innerH}
            className="risk-bar-chart__axis-line"
          />
          {bucketData.map((bd) => {
            let acc = 0
            return bd.segments.map((s) => {
              const yTop = y(acc + s.value)
              const yBottom = y(acc)
              acc += s.value
              const isFaded =
                effectiveCountry !== null && effectiveCountry !== s.country
              return (
                <rect
                  key={`${bd.bucket}-${s.country}`}
                  className="risk-bar-chart__bar"
                  x={x(bd.bucket) ?? 0}
                  y={yTop}
                  width={x.bandwidth()}
                  height={Math.max(0, yBottom - yTop)}
                  fill={COUNTRY_COLORS[s.country]}
                  opacity={isFaded ? 0.15 : 0.72}
                  onMouseEnter={() => handleEnterSegment(bd.bucket, s.country)}
                  style={{ cursor: 'pointer' }}
                />
              )
            })
          })}
          {bucketData.map((bd) => {
            if (bd.total === 0) return null
            return (
              <text
                key={`tot-${bd.bucket}`}
                x={(x(bd.bucket) ?? 0) + x.bandwidth() / 2}
                y={y(bd.total) - 4}
                textAnchor="middle"
                className="risk-bar-chart__bar-total"
              >
                {unit === 'pct' ? `${bd.total.toFixed(1)}%` : fmt(bd.total)}
              </text>
            )
          })}
          {BUCKETS.map((b) => (
            <text
              key={`xt-${b}`}
              x={(x(b) ?? 0) + x.bandwidth() / 2}
              y={innerH + 16}
              textAnchor="middle"
              className="risk-bar-chart__axis-label"
            >
              {b}
            </text>
          ))}
        </g>
      </svg>
    </div>
  )
}

// ─── Unified card: 3 donuts + shared title + 3 bar charts ───

function UnifiedCard() {
  const [unit, setUnit] = useState<'mm' | 'pct'>('mm')
  const [sharedHover, setSharedHover] = useState<{
    periodId: string
    country: CarteraCountry
  } | null>(null)

  const makeHandlers = (periodId: string) => ({
    hoveredCountry:
      sharedHover?.periodId === periodId ? sharedHover.country : null,
    onHoverChange: (c: CarteraCountry | null) => {
      if (c === null) {
        setSharedHover((prev) =>
          prev?.periodId === periodId ? null : prev,
        )
      } else {
        setSharedHover({ periodId, country: c })
      }
    },
  })

  return (
    <Card padding="md" className="risk-capacity__unified">
      <div className="risk-capacity__year-labels">
        {PERIODS.map((p) => (
          <span key={p.id} className="risk-capacity__year-label">
            {p.label}
          </span>
        ))}
      </div>
      <div className="risk-capacity__donut-row">
        {PERIODS.map((p) => (
          <div key={p.id} className="risk-capacity__donut-wrap">
            <FsDonut period={p} {...makeHandlers(p.id)} />
          </div>
        ))}
      </div>
      <div className="risk-capacity__bar-header">
        <span className="risk-capacity__bar-title">
          Utilizada por calificación crediticia
        </span>
        <SegmentedControl
          size="sm"
          options={[
            { value: 'mm', label: 'USD MM' },
            { value: 'pct', label: '%' },
          ]}
          value={unit}
          onChange={(v) => setUnit(v as 'mm' | 'pct')}
        />
      </div>
      <div className="risk-capacity__bar-row">
        {PERIODS.map((p) => (
          <div key={p.id} className="risk-capacity__bar-wrap">
            <FsBarChart period={p} unit={unit} {...makeHandlers(p.id)} />
          </div>
        ))}
      </div>
    </Card>
  )
}

const RATING_GRID: Array<{ moodys: string; sp: string; fitch: string; estandar: string }> = [
  { moodys: 'Aaa', sp: 'AAA', fitch: 'AAA', estandar: 'Grado Inversor 1' },
  { moodys: 'Aa1', sp: 'AA+', fitch: 'AA+', estandar: 'Grado Inversor 1' },
  { moodys: 'Aa2', sp: 'AA', fitch: 'AA', estandar: 'Grado Inversor 1' },
  { moodys: 'Aa3', sp: 'AA-', fitch: 'AA-', estandar: 'Grado Inversor 1' },
  { moodys: 'A1', sp: 'A+', fitch: 'A+', estandar: 'Grado Inversor 1' },
  { moodys: 'A2', sp: 'A', fitch: 'A', estandar: 'Grado Inversor 1' },
  { moodys: 'A3', sp: 'A-', fitch: 'A-', estandar: 'Grado Inversor 1' },
  { moodys: 'Baa1', sp: 'BBB+', fitch: 'BBB+', estandar: 'Grado Inversor 1' },
  { moodys: 'Baa2', sp: 'BBB', fitch: 'BBB', estandar: 'Grado Inversor 2' },
  { moodys: 'Baa3', sp: 'BBB-', fitch: 'BBB-', estandar: 'Grado Inversor 2' },
  { moodys: 'Ba1', sp: 'BB+', fitch: 'BB+', estandar: 'Superior' },
  { moodys: 'Ba2', sp: 'BB', fitch: 'BB', estandar: 'Superior' },
  { moodys: 'Ba3', sp: 'BB-', fitch: 'BB-', estandar: 'Superior' },
  { moodys: 'B1', sp: 'B+', fitch: 'B+', estandar: 'Intermedia' },
  { moodys: 'B2', sp: 'B', fitch: 'B', estandar: 'Intermedia' },
  { moodys: 'B3', sp: 'B-', fitch: 'B-', estandar: 'Intermedia' },
  { moodys: 'Caa1', sp: 'CCC+', fitch: 'CCC+', estandar: 'Básica' },
  { moodys: 'Caa2', sp: 'CCC', fitch: 'CCC', estandar: 'Básica' },
  { moodys: 'Caa3', sp: 'CCC-', fitch: 'CCC-', estandar: 'Básica' },
  { moodys: 'Ca', sp: 'CC', fitch: 'CC', estandar: 'Básica' },
  { moodys: 'C', sp: 'C', fitch: 'C', estandar: 'Básica' },
  { moodys: 'D', sp: 'D', fitch: 'D', estandar: 'Básica' },
]

function RatingGridPopup({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return createPortal(
    <div className="rating-grid__overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="rating-grid__modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rating-grid__header">
          <div>
            <span className="rating-grid__eyebrow">Referencia</span>
            <h3 className="rating-grid__title">Grilla de Ratings y Estandarización</h3>
          </div>
          <button
            type="button"
            className="rating-grid__close"
            onClick={onClose}
            aria-label="Cerrar"
            title="Cerrar"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>
        <div className="rating-grid__body">
          <table className="rating-grid__table">
            <thead>
              <tr>
                <th>MOODY'S</th>
                <th>S&P</th>
                <th>FITCH</th>
                <th>ESTÁNDAR</th>
              </tr>
            </thead>
            <tbody>
              {RATING_GRID.map((r, i) => (
                <tr key={i} className={`rating-grid__row rating-grid__row--${r.estandar.toLowerCase().replace(/\s+/g, '-').replace(/\d/, (d) => `n${d}`)}`}>
                  <td>{r.moodys}</td>
                  <td>{r.sp}</td>
                  <td>{r.fitch}</td>
                  <td>{r.estandar}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function RiskCapacitySlide() {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <div className="risk-capacity">
      <div className="risk-capacity__header">
        <TextCard
          eyebrow="Capacidad prestable"
          title="Uso de la Capacidad Prestable por País"
          description="USD Millones"
        />
        <button
          type="button"
          className="risk-capacity__info-btn"
          onClick={() => setShowInfo(true)}
          aria-label="Ver grilla de ratings"
          title="Grilla de Ratings y Estandarización"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="6.5" />
            <path d="M8 11V7.5" />
            <circle cx="8" cy="5" r="0.6" fill="currentColor" />
          </svg>
        </button>
        <div className="risk-capacity__legend">
          {COUNTRY_ORDER.map((c) => (
            <div key={c} className="risk-capacity__legend-item">
              <span
                className="risk-capacity__legend-swatch"
                style={{ background: COUNTRY_COLORS[c] }}
              />
              <span className="risk-capacity__legend-label">{c}</span>
            </div>
          ))}
        </div>
      </div>
      <UnifiedCard />
      {showInfo && <RatingGridPopup onClose={() => setShowInfo(false)} />}
    </div>
  )
}
