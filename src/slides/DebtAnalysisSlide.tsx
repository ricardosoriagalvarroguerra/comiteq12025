import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as d3 from 'd3'
import { TextCard } from '@/components/cards/TextCard'
import { Card } from '@/components/ui/Card'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import './DebtAnalysisSlide.css'

interface Row {
  period: string
  ifdStock: number | null
  merStock: number | null
  totalStock: number
  ifdSpread: number | null
  merSpread: number | null
  totalSpread: number | null
}

const QUARTERLY: Row[] = [
  { period: '1Q20', ifdStock: 111.42, merStock: 148.81, totalStock: 260.23, ifdSpread: 146.52, merSpread: 159.80, totalSpread: 154.12 },
  { period: '2Q20', ifdStock: 352.75, merStock: 148.81, totalStock: 501.56, ifdSpread: 139.52, merSpread: 159.80, totalSpread: 145.53 },
  { period: '3Q20', ifdStock: 373.75, merStock: 148.81, totalStock: 522.56, ifdSpread: 140.44, merSpread: 159.80, totalSpread: 145.95 },
  { period: '4Q20', ifdStock: 398.97, merStock: 148.81, totalStock: 547.78, ifdSpread: 139.11, merSpread: 159.80, totalSpread: 144.73 },
  { period: '1Q21', ifdStock: 398.97, merStock: 371.48, totalStock: 770.44, ifdSpread: 142.87, merSpread: 162.33, totalSpread: 152.25 },
  { period: '2Q21', ifdStock: 378.20, merStock: 471.48, totalStock: 849.68, ifdSpread: 142.09, merSpread: 161.38, totalSpread: 152.79 },
  { period: '3Q21', ifdStock: 384.20, merStock: 471.48, totalStock: 855.68, ifdSpread: 141.88, merSpread: 161.38, totalSpread: 152.62 },
  { period: '4Q21', ifdStock: 281.54, merStock: 635.95, totalStock: 917.49, ifdSpread: 146.84, merSpread: 152.02, totalSpread: 150.43 },
  { period: '1Q22', ifdStock: 281.54, merStock: 635.95, totalStock: 917.49, ifdSpread: 138.73, merSpread: 152.02, totalSpread: 147.94 },
  { period: '2Q22', ifdStock: 233.68, merStock: 635.95, totalStock: 869.63, ifdSpread: 131.31, merSpread: 152.02, totalSpread: 146.46 },
  { period: '3Q22', ifdStock: 232.77, merStock: 635.95, totalStock: 868.72, ifdSpread: 135.42, merSpread: 152.02, totalSpread: 147.57 },
  { period: '4Q22', ifdStock: 384.63, merStock: 635.95, totalStock: 1020.58, ifdSpread: 125.90, merSpread: 152.02, totalSpread: 142.17 },
  { period: '1Q23', ifdStock: 381.22, merStock: 689.97, totalStock: 1071.19, ifdSpread: 127.32, merSpread: 155.79, totalSpread: 145.66 },
  { period: '2Q23', ifdStock: 300.67, merStock: 689.97, totalStock: 990.64, ifdSpread: 117.41, merSpread: 155.79, totalSpread: 144.14 },
  { period: '3Q23', ifdStock: 350.55, merStock: 689.97, totalStock: 1040.52, ifdSpread: 118.49, merSpread: 155.79, totalSpread: 143.23 },
  { period: '4Q23', ifdStock: 357.05, merStock: 673.30, totalStock: 1030.36, ifdSpread: 118.31, merSpread: 155.74, totalSpread: 142.77 },
  { period: '1Q24', ifdStock: 428.64, merStock: 524.49, totalStock: 953.14, ifdSpread: 126.54, merSpread: 154.59, totalSpread: 141.98 },
  { period: '2Q24', ifdStock: 413.77, merStock: 713.58, totalStock: 1127.35, ifdSpread: 127.41, merSpread: 163.32, totalSpread: 150.14 },
  { period: '3Q24', ifdStock: 434.94, merStock: 713.58, totalStock: 1148.52, ifdSpread: 126.72, merSpread: 163.32, totalSpread: 149.46 },
  { period: '4Q24', ifdStock: 429.47, merStock: 974.85, totalStock: 1404.32, ifdSpread: 126.04, merSpread: 170.79, totalSpread: 157.10 },
  { period: '1Q25', ifdStock: 425.85, merStock: 1184.85, totalStock: 1610.70, ifdSpread: 125.97, merSpread: 165.53, totalSpread: 155.07 },
  { period: '2Q25', ifdStock: 475.29, merStock: 1368.18, totalStock: 1843.48, ifdSpread: 126.96, merSpread: 162.36, totalSpread: 153.23 },
  { period: '3Q25', ifdStock: 483.05, merStock: 1478.70, totalStock: 1961.75, ifdSpread: 126.56, merSpread: 159.05, totalSpread: 151.05 },
  { period: '4Q25', ifdStock: 514.70, merStock: 1563.49, totalStock: 2078.20, ifdSpread: 124.80, merSpread: 159.68, totalSpread: 151.04 },
  { period: '1Q26', ifdStock: 526.14, merStock: 1563.49, totalStock: 2089.63, ifdSpread: 121.63, merSpread: 159.68, totalSpread: 150.10 },
]

const ANNUAL: Row[] = [
  { period: '2020', ifdStock: 398.97, merStock: 148.81, totalStock: 547.78, ifdSpread: 139.11, merSpread: 159.80, totalSpread: 144.73 },
  { period: '2021', ifdStock: 281.54, merStock: 635.95, totalStock: 917.49, ifdSpread: 146.84, merSpread: 152.02, totalSpread: 150.43 },
  { period: '2022', ifdStock: 384.63, merStock: 635.95, totalStock: 1020.58, ifdSpread: 125.90, merSpread: 152.02, totalSpread: 142.17 },
  { period: '2023', ifdStock: 357.05, merStock: 673.30, totalStock: 1030.36, ifdSpread: 118.31, merSpread: 155.74, totalSpread: 142.77 },
  { period: '2024', ifdStock: 429.47, merStock: 974.85, totalStock: 1404.32, ifdSpread: 126.04, merSpread: 170.79, totalSpread: 157.10 },
  { period: '2025', ifdStock: 514.70, merStock: 1563.49, totalStock: 2078.20, ifdSpread: 124.80, merSpread: 159.68, totalSpread: 151.04 },
  { period: '1Q26', ifdStock: 526.14, merStock: 1563.49, totalStock: 2089.63, ifdSpread: 121.63, merSpread: 159.68, totalSpread: 150.10 },
]

const MARGINAL_ANNUAL: Row[] = [
  { period: '2020', ifdStock: 292.88, merStock: 0, totalStock: 292.88, ifdSpread: 138.91, merSpread: null, totalSpread: 138.91 },
  { period: '2021', ifdStock: 17.90, merStock: 487.14, totalStock: 505.04, ifdSpread: 129.46, merSpread: 149.64, totalSpread: 148.93 },
  { period: '2022', ifdStock: 169.11, merStock: 0, totalStock: 169.11, ifdSpread: 113.93, merSpread: null, totalSpread: 113.93 },
  { period: '2023', ifdStock: 60.34, merStock: 54.02, totalStock: 114.36, ifdSpread: 106.68, merSpread: 200.19, totalSpread: 150.83 },
  { period: '2024', ifdStock: 180.34, merStock: 483.69, totalStock: 664.03, ifdSpread: 141.72, merSpread: 187.46, totalSpread: 175.04 },
  { period: '2025', ifdStock: 96.39, merStock: 621.98, totalStock: 718.37, ifdSpread: 119.54, merSpread: 135.89, totalSpread: 133.70 },
  { period: '1Q26', ifdStock: 42.22, merStock: 0, totalStock: 42.22, ifdSpread: 115.62, merSpread: null, totalSpread: 115.62 },
]

const COLOR_IFD = '#adb5bd'
const COLOR_MER = '#c1121f'
const COLOR_TOTAL_BAR = '#6c757d'
const COLOR_IFD_LINE = '#495057'
const COLOR_MER_LINE = '#9d0208'
const COLOR_TOTAL_LINE = '#48cae4'

type Mode = 'ponderado' | 'marginal'

interface SeriesDef {
  id: 'ifdStock' | 'merStock' | 'totalStock' | 'ifdSpread' | 'merSpread' | 'totalSpread'
  label: string
  color: string
  unit: 'MM' | 'bps'
  shape: 'bar' | 'line'
}

const SERIES_PONDERADO: SeriesDef[] = [
  { id: 'ifdStock', label: 'IFD Stock', color: COLOR_IFD, unit: 'MM', shape: 'bar' },
  { id: 'merStock', label: 'Mercado Stock', color: COLOR_MER, unit: 'MM', shape: 'bar' },
  { id: 'ifdSpread', label: 'IFD Spread', color: COLOR_IFD_LINE, unit: 'bps', shape: 'line' },
  { id: 'merSpread', label: 'Mercado Spread', color: COLOR_MER_LINE, unit: 'bps', shape: 'line' },
  { id: 'totalSpread', label: 'Total Spread', color: COLOR_TOTAL_LINE, unit: 'bps', shape: 'line' },
]

const nf1 = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  useGrouping: true,
})
const nf0 = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function valueOf(row: Row, id: SeriesDef['id']): number | null {
  return row[id]
}

interface SpreadChartProps {
  rows: Row[]
  mode: Mode
  fullscreen: boolean
}

function SpreadChart({ rows, mode, fullscreen }: SpreadChartProps) {
  const [hover, setHover] = useState<number | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ w: 1100, h: 720 })

  useEffect(() => {
    if (!wrapRef.current) return
    const el = wrapRef.current
    let rafId: number | null = null
    const update = () => {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) {
        setSize((prev) =>
          Math.abs(prev.w - r.width) < 0.5 && Math.abs(prev.h - r.height) < 0.5
            ? prev
            : { w: r.width, h: r.height },
        )
      }
    }
    update()
    const obs = new ResizeObserver(() => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        update()
      })
    })
    obs.observe(el)
    return () => {
      obs.disconnect()
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [fullscreen])

  const W = size.w
  const H = size.h
  const margin = { top: 32, right: 52, bottom: 56, left: 52 }
  const innerW = W - margin.left - margin.right
  const innerH = H - margin.top - margin.bottom

  const showTotalSpread = mode === 'ponderado'
  const stockLabel = mode === 'marginal' ? 'Flujo' : 'Stock'
  const baseSeries = showTotalSpread
    ? SERIES_PONDERADO
    : SERIES_PONDERADO.filter((s) => s.id !== 'totalSpread')
  const series = baseSeries.map((s) =>
    s.id === 'ifdStock'
      ? { ...s, label: `IFD ${stockLabel}` }
      : s.id === 'merStock'
      ? { ...s, label: `Mercado ${stockLabel}` }
      : s,
  )

  const maxStock = useMemo(() => {
    const vals = rows.map((r) => r.totalStock)
    return d3.max(vals) ?? 1
  }, [rows])

  const spreadValues = useMemo(
    () =>
      rows.flatMap((r) =>
        [r.ifdSpread, r.merSpread, r.totalSpread].filter(
          (v): v is number => v !== null,
        ),
      ),
    [rows],
  )
  const minSpread = d3.min(spreadValues) ?? 0
  const maxSpread = d3.max(spreadValues) ?? 1

  const x = useMemo(
    () =>
      d3
        .scaleBand<string>()
        .domain(rows.map((r) => r.period))
        .range([0, innerW])
        .padding(0.2),
    [rows, innerW],
  )
  const yLeft = useMemo(
    () => d3.scaleLinear().domain([0, maxStock * 1.1]).nice().range([innerH, 0]),
    [maxStock, innerH],
  )
  const yRight = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([Math.max(0, minSpread - 15), maxSpread + 15])
        .nice()
        .range([innerH, 0]),
    [minSpread, maxSpread, innerH],
  )

  const yLeftTicks = yLeft.ticks(5)
  const yRightTicks = yRight.ticks(5)

  const makeLine = (field: 'ifdSpread' | 'merSpread' | 'totalSpread') => {
    const gen = d3
      .line<Row>()
      .defined((r) => r[field] !== null)
      .x((r) => (x(r.period) ?? 0) + x.bandwidth() / 2)
      .y((r) => yRight((r[field] as number) ?? 0))
      .curve(d3.curveMonotoneX)
    return gen(rows) ?? ''
  }

  const ifdLine = useMemo(() => makeLine('ifdSpread'), [rows, x, yRight])
  const merLine = useMemo(() => makeLine('merSpread'), [rows, x, yRight])
  const totalLine = useMemo(() => makeLine('totalSpread'), [rows, x, yRight])

  const xTickEvery = Math.max(1, Math.ceil(rows.length / (fullscreen ? 20 : 13)))
  const hovered = hover !== null ? rows[hover] : null

  return (
    <div className="spread-chart" ref={wrapRef} onMouseLeave={() => setHover(null)}>
      <div className="spread-chart__panel" role="status" aria-live="polite">
        <span className="spread-chart__panel-period">
          {hovered ? hovered.period : 'Leyenda'}
        </span>
        {series.map((s) => {
          const value = hovered ? valueOf(hovered, s.id) : null
          const formatted =
            hovered && value !== null
              ? s.unit === 'MM'
                ? `${nf1.format(value)} MM`
                : `${nf0.format(value)} bps`
              : hovered
              ? '—'
              : null
          return (
            <span key={s.id} className="spread-chart__panel-row">
              <span className="spread-chart__panel-swatch-wrap">
                {s.shape === 'bar' ? (
                  <span
                    className="spread-chart__panel-swatch"
                    style={{ background: s.color, opacity: 0.6 }}
                  />
                ) : (
                  <span
                    className="spread-chart__panel-line"
                    style={{ background: s.color }}
                  />
                )}
              </span>
              <span className="spread-chart__panel-name">{s.label}</span>
              {formatted ? (
                <strong className="spread-chart__panel-value">{formatted}</strong>
              ) : null}
            </span>
          )
        })}
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="spread-chart__svg"
        preserveAspectRatio="none"
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {yLeftTicks.map((t) => (
            <g key={`yl-${t}`}>
              <line
                x1={0}
                x2={innerW}
                y1={yLeft(t)}
                y2={yLeft(t)}
                className="spread-chart__grid"
              />
              <text
                x={-10}
                y={yLeft(t)}
                dy="0.32em"
                textAnchor="end"
                className="spread-chart__axis-label"
              >
                {nf0.format(t)}
              </text>
            </g>
          ))}
          {yRightTicks.map((t) => (
            <text
              key={`yr-${t}`}
              x={innerW + 10}
              y={yRight(t)}
              dy="0.32em"
              textAnchor="start"
              className="spread-chart__axis-label"
            >
              {nf0.format(t)}
            </text>
          ))}
          <text
            x={-margin.left + 8}
            y={-12}
            className="spread-chart__axis-title"
          >
            USD MM
          </text>
          <text
            x={innerW + 8}
            y={-12}
            className="spread-chart__axis-title"
          >
            bps
          </text>
          <line
            x1={0}
            x2={innerW}
            y1={innerH}
            y2={innerH}
            className="spread-chart__axis-line"
          />
          {rows.map((r, i) => {
            const bx = x(r.period) ?? 0
            const bw = x.bandwidth()
            const isHover = hover === i
            const baseOpacity = 0.55
            const opacity = hover === null ? baseOpacity : isHover ? 0.85 : 0.2
            if (r.ifdStock !== null && r.merStock !== null) {
              const yIfd0 = yLeft(r.ifdStock)
              const yMer0 = yLeft(r.ifdStock + r.merStock)
              const yMer1 = yIfd0
              return (
                <g key={`bar-${r.period}`}>
                  <rect
                    x={bx}
                    y={yIfd0}
                    width={bw}
                    height={innerH - yIfd0}
                    fill={COLOR_IFD}
                    opacity={opacity}
                    rx={1.5}
                  />
                  <rect
                    x={bx}
                    y={yMer0}
                    width={bw}
                    height={yMer1 - yMer0}
                    fill={COLOR_MER}
                    opacity={opacity}
                    rx={1.5}
                  />
                </g>
              )
            }
            const y0 = yLeft(r.totalStock)
            return (
              <rect
                key={`bar-${r.period}`}
                x={bx}
                y={y0}
                width={bw}
                height={innerH - y0}
                fill={COLOR_TOTAL_BAR}
                opacity={opacity}
                rx={1.5}
              />
            )
          })}
          <path
            d={ifdLine}
            className="spread-chart__line"
            stroke={COLOR_IFD_LINE}
            fill="none"
            opacity={hover === null ? 1 : 0.3}
          />
          <path
            d={merLine}
            className="spread-chart__line"
            stroke={COLOR_MER_LINE}
            fill="none"
            opacity={hover === null ? 1 : 0.3}
          />
          {showTotalSpread && (
            <path
              d={totalLine}
              className="spread-chart__line"
              stroke={COLOR_TOTAL_LINE}
              fill="none"
              opacity={hover === null ? 1 : 0.3}
            />
          )}
          {rows.map((r, i) => {
            const cx = (x(r.period) ?? 0) + x.bandwidth() / 2
            const isHover = hover === i
            const rad = isHover ? 6 : 3.8
            const dotOpacity = hover === null ? 1 : isHover ? 1 : 0.2
            return (
              <g key={`pts-${r.period}`}>
                {r.ifdSpread !== null && (
                  <circle
                    cx={cx}
                    cy={yRight(r.ifdSpread)}
                    r={rad}
                    fill={COLOR_IFD_LINE}
                    opacity={dotOpacity}
                    className="spread-chart__dot"
                  />
                )}
                {r.merSpread !== null && (
                  <circle
                    cx={cx}
                    cy={yRight(r.merSpread)}
                    r={rad}
                    fill={COLOR_MER_LINE}
                    opacity={dotOpacity}
                    className="spread-chart__dot"
                  />
                )}
                {showTotalSpread && r.totalSpread !== null && (
                  <circle
                    cx={cx}
                    cy={yRight(r.totalSpread)}
                    r={rad}
                    fill={COLOR_TOTAL_LINE}
                    opacity={dotOpacity}
                    className="spread-chart__dot"
                  />
                )}
              </g>
            )
          })}
          {rows.map((r, i) =>
            i % xTickEvery === 0 || i === rows.length - 1 ? (
              <text
                key={`xt-${r.period}`}
                x={(x(r.period) ?? 0) + x.bandwidth() / 2}
                y={innerH + 22}
                textAnchor="middle"
                className="spread-chart__axis-label"
              >
                {r.period}
              </text>
            ) : null,
          )}
          {rows.map((r, i) => (
            <rect
              key={`hit-${r.period}`}
              x={x(r.period) ?? 0}
              y={0}
              width={x.bandwidth()}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </g>
      </svg>
    </div>
  )
}

function FsIcon({ fullscreen }: { fullscreen: boolean }) {
  return (
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
  )
}

export function DebtAnalysisSlide() {
  const [mode, setMode] = useState<Mode>('ponderado')
  const [frequency, setFrequency] = useState<'quarterly' | 'annual'>('quarterly')
  const [fullscreen, setFullscreen] = useState(false)

  const rows =
    mode === 'marginal'
      ? MARGINAL_ANNUAL
      : frequency === 'quarterly'
      ? QUARTERLY
      : ANNUAL

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

  const card = (
    <Card
      padding="md"
      className={`debt-analysis__card ${fullscreen ? 'debt-analysis__card--fullscreen' : ''}`}
    >
      <div className="debt-analysis__controls">
        <span className="debt-analysis__chart-title">Spread s/SOFR</span>
        <SegmentedControl
          options={[
            { value: 'ponderado', label: 'Prom. ponderado' },
            { value: 'marginal', label: 'Prom. ponderado Marginal' },
          ]}
          value={mode}
          onChange={(v) => setMode(v as Mode)}
        />
        {mode === 'ponderado' && (
          <SegmentedControl
            options={[
              { value: 'quarterly', label: 'Trimestral' },
              { value: 'annual', label: 'Anual' },
            ]}
            value={frequency}
            onChange={(v) => setFrequency(v as 'quarterly' | 'annual')}
          />
        )}
        <button
          type="button"
          className="debt-analysis__fs-btn"
          onClick={() => setFullscreen((f) => !f)}
          aria-label={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          title={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          <FsIcon fullscreen={fullscreen} />
        </button>
      </div>
      <SpreadChart rows={rows} mode={mode} fullscreen={fullscreen} />
    </Card>
  )

  return (
    <div className="debt-analysis">
      <TextCard
        eyebrow="4 · ENDEUDAMIENTO"
        title="Análisis de Endeudamiento"
        description="Stock y Spread sobre SOFR por fuente de fondeo"
      />
      <div className="debt-analysis__chart">
        {fullscreen ? createPortal(card, document.body) : card}
      </div>
    </div>
  )
}
