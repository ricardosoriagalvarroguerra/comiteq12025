import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import * as d3 from 'd3'
import { TextCard } from '@/components/cards/TextCard'
import { Card } from '@/components/ui/Card'
import {
  CARTERA_DATA,
  type CarteraCategory,
  type CarteraCountry,
} from '@/data/carteraPorPais'
import './DonutMatrixSlide.css'

const COUNTRIES: CarteraCountry[] = ['ARG', 'BOL', 'BRA', 'PAR', 'URU', 'RNS']

const COLORS: Record<CarteraCountry, string> = {
  ARG: '#48cae4',
  BOL: '#70e000',
  BRA: '#ffdd00',
  PAR: '#f94144',
  URU: '#61a5c2',
  RNS: '#bbbaba',
}

const ROWS: Array<{ key: CarteraCategory; label: string }> = [
  { key: 'porCobrar', label: 'Por cobrar' },
  { key: 'porDesembolsar', label: 'Por desembolsar' },
  { key: 'aprobadoNoVigente', label: 'Aprobado no vigente' },
]

interface PeriodDef {
  id: string
  label: string
  year: number
  quarter: 1 | 2 | 3 | 4
}

const PERIODS: PeriodDef[] = [
  { id: 'Q1-26', label: '1Q26', year: 2026, quarter: 1 },
  { id: 'Q4-26', label: '4Q26 (Proy.)', year: 2026, quarter: 4 },
  { id: 'Q1-27', label: '1Q27 (Proy.)', year: 2027, quarter: 1 },
]

interface Slice {
  country: CarteraCountry
  value: number
  color: string
}

function getSlices(category: CarteraCategory, period: PeriodDef): Slice[] {
  return COUNTRIES.map((c) => {
    const row = CARTERA_DATA.find(
      (r) => r.country === c && r.year === period.year && r.quarter === period.quarter,
    )
    return { country: c, value: row?.[category] ?? 0, color: COLORS[c] }
  })
}

const fmt = (n: number) =>
  n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })

interface DonutProps {
  category: CarteraCategory
  period: PeriodDef
  size: number
}

function Donut({ category, period, size }: DonutProps) {
  const [hover, setHover] = useState<CarteraCountry | null>(null)
  const data = useMemo(() => getSlices(category, period), [category, period])
  const total = data.reduce((s, d) => s + d.value, 0)

  const r = size / 2
  const innerR = r * 0.62

  const pie = useMemo(
    () =>
      d3
        .pie<Slice>()
        .value((d) => d.value)
        .padAngle(0.012)
        .sort(null)(data),
    [data],
  )
  const arc = useMemo(
    () =>
      d3
        .arc<d3.PieArcDatum<Slice>>()
        .innerRadius(innerR)
        .outerRadius(r)
        .cornerRadius(2),
    [innerR, r],
  )

  const hovered = hover ? data.find((d) => d.country === hover) : null

  return (
    <div
      className="donut-cell"
      onMouseLeave={() => setHover(null)}
      style={{ width: size, height: size }}
    >
      {hovered && (
        <div className="donut-cell__tooltip" role="status" aria-live="polite">
          <span className="donut-cell__tooltip-head">
            <span
              className="donut-cell__tooltip-swatch"
              style={{ background: hovered.color }}
            />
            {hovered.country}
          </span>
          <span className="donut-cell__tooltip-value">
            {fmt(hovered.value)} USD MM
          </span>
          <span className="donut-cell__tooltip-pct">
            {total > 0 ? ((hovered.value / total) * 100).toFixed(1) : '0.0'}%
          </span>
        </div>
      )}
      <svg
        viewBox={`${-r} ${-r} ${size} ${size}`}
        className="donut-cell__svg"
        width={size}
        height={size}
      >
        {pie.map((slice) => {
          const d = arc(slice) ?? ''
          const isHover = hover === slice.data.country
          const faded = hover !== null && !isHover
          return (
            <path
              key={slice.data.country}
              className="donut-cell__slice"
              d={d}
              fill={slice.data.color}
              opacity={faded ? 0.15 : 0.72}
              onMouseEnter={() => setHover(slice.data.country)}
              style={{ cursor: 'pointer' }}
            />
          )
        })}
        {pie.map((slice) => {
          const pct = total > 0 ? (slice.data.value / total) * 100 : 0
          if (pct < 5) return null
          const [cx, cy] = arc.centroid(slice)
          return (
            <text
              key={`t-${slice.data.country}`}
              x={cx}
              y={cy}
              textAnchor="middle"
              dy="0.32em"
              className="donut-cell__label"
            >
              {Math.round(pct)}%
            </text>
          )
        })}
        <text
          x={0}
          y={-4}
          textAnchor="middle"
          className="donut-cell__total-value"
          style={{ fontSize: Math.max(14, size * 0.11) }}
        >
          {fmt(total)}
        </text>
        <text
          x={0}
          y={size * 0.09}
          textAnchor="middle"
          className="donut-cell__total-unit"
          style={{ fontSize: Math.max(9, size * 0.055) }}
        >
          USD MM
        </text>
      </svg>
    </div>
  )
}

interface CategoryRowProps {
  category: CarteraCategory
  label: string
}

function CategoryRow({ category, label }: CategoryRowProps) {
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

  const donutSize = fullscreen ? 360 : 118

  const card = (
    <Card
      padding="md"
      className={`donut-matrix__row-card ${
        fullscreen ? 'donut-matrix__row-card--fullscreen' : ''
      }`}
    >
      <div className="donut-matrix__row-header">
        <span className="donut-matrix__row-title">{label}</span>
        <button
          type="button"
          className="donut-matrix__fs-btn"
          onClick={() => setFullscreen((f) => !f)}
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
      </div>
      <div className="donut-matrix__row-values">
        {PERIODS.map((p) => (
          <div key={p.id} className="donut-matrix__cell">
            <Donut category={category} period={p} size={donutSize} />
            <span className="donut-matrix__cell-year">{p.label}</span>
          </div>
        ))}
      </div>
    </Card>
  )

  return fullscreen ? createPortal(card, document.body) : card
}

export function DonutMatrixSlide() {
  return (
    <div className="donut-matrix">
      <TextCard
        eyebrow="2 · CARTERA"
        title="Cartera de Préstamos - País y Categorías"
        description="USD Millones"
      />
      <div className="donut-matrix__rows">
        {ROWS.map((r) => (
          <CategoryRow key={r.key} category={r.key} label={r.label} />
        ))}
      </div>
      <div className="donut-matrix__legend" aria-label="Leyenda de países">
        {COUNTRIES.map((c) => (
          <div key={c} className="donut-matrix__legend-item">
            <span
              className="donut-matrix__legend-swatch"
              style={{ background: COLORS[c] }}
            />
            <span className="donut-matrix__legend-label">{c}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
