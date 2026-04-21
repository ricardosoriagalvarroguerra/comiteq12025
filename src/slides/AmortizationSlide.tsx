import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import * as d3 from 'd3'
import { TextCard } from '@/components/cards/TextCard'
import { Card } from '@/components/ui/Card'
import './AmortizationSlide.css'

interface AmortRow {
  anio: string
  resto: number
  adq2026: number
}

const AMORT_DATA: AmortRow[] = [
  { anio: 'Q2-Q426', resto: 279.00, adq2026: 0.00 },
  { anio: '2027', resto: 334.44, adq2026: 3.18 },
  { anio: '2028', resto: 342.37, adq2026: 6.36 },
  { anio: '2029', resto: 271.02, adq2026: 6.66 },
  { anio: '2030', resto: 304.27, adq2026: 6.97 },
  { anio: '2031', resto: 156.55, adq2026: 6.97 },
  { anio: '2032', resto: 72.59, adq2026: 6.97 },
  { anio: '2033', resto: 21.68, adq2026: 0.60 },
  { anio: '2034', resto: 18.82, adq2026: 0.60 },
  { anio: '2035', resto: 66.88, adq2026: 0.60 },
  { anio: '2036', resto: 16.57, adq2026: 0.60 },
  { anio: '2037', resto: 15.77, adq2026: 0.60 },
  { anio: '2038', resto: 15.77, adq2026: 0.60 },
  { anio: '2039', resto: 15.34, adq2026: 0.60 },
  { anio: '2040', resto: 74.67, adq2026: 0.60 },
  { anio: '2041', resto: 11.29, adq2026: 0.30 },
  { anio: '2042', resto: 10.00, adq2026: 0.00 },
  { anio: '2043', resto: 5.00, adq2026: 0.00 },
  { anio: '2044', resto: 5.00, adq2026: 0.00 },
  { anio: '2045', resto: 5.00, adq2026: 0.00 },
  { anio: '2046', resto: 5.00, adq2026: 0.00 },
]

const COLOR_HASTA = '#adb5bd'
const COLOR_2025 = '#c1121f'

const nf2 = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: true,
})
const nf0 = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

interface AmortChartProps {
  width: number
  height: number
}

function AmortChart({ width, height }: AmortChartProps) {
  const [hover, setHover] = useState<number | null>(null)

  const margin = { top: 24, right: 16, bottom: 36, left: 56 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  const totals = useMemo(
    () => AMORT_DATA.map((r) => r.resto + r.adq2026),
    [],
  )
  const maxY = d3.max(totals) ?? 1

  const x = useMemo(
    () =>
      d3
        .scaleBand<string>()
        .domain(AMORT_DATA.map((r) => r.anio))
        .range([0, innerW])
        .padding(0.18),
    [innerW],
  )
  const y = useMemo(
    () => d3.scaleLinear().domain([0, maxY * 1.1]).nice().range([innerH, 0]),
    [maxY, innerH],
  )
  const yTicks = y.ticks(5)

  const hovered = hover !== null ? AMORT_DATA[hover] : null
  const xTickEvery = Math.max(1, Math.ceil(AMORT_DATA.length / 12))

  return (
    <div className="amort-chart" onMouseLeave={() => setHover(null)}>
      <div
        className={`amort-chart__panel ${hovered ? 'amort-chart__panel--hover' : ''}`}
        role="status"
        aria-live="polite"
      >
        {hovered && (
          <span className="amort-chart__panel-period">
            {hovered.anio}
          </span>
        )}
        <span className="amort-chart__panel-row">
          <span className="amort-chart__panel-swatch" style={{ background: COLOR_HASTA }} />
          <span className="amort-chart__panel-name">Deuda contratada hasta 2025</span>
          {hovered && (
            <strong className="amort-chart__panel-value">
              {nf2.format(hovered.resto)} MM
            </strong>
          )}
        </span>
        <span className="amort-chart__panel-row">
          <span className="amort-chart__panel-swatch" style={{ background: COLOR_2025 }} />
          <span className="amort-chart__panel-name">Deuda contratada en 2026</span>
          {hovered && (
            <strong className="amort-chart__panel-value">
              {nf2.format(hovered.adq2026)} MM
            </strong>
          )}
        </span>
        {hovered && (
          <span className="amort-chart__panel-row amort-chart__panel-row--total">
            <span className="amort-chart__panel-name">Total</span>
            <strong className="amort-chart__panel-value">
              {nf2.format(hovered.resto + hovered.adq2026)} MM
            </strong>
          </span>
        )}
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="amort-chart__svg"
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
                className="amort-chart__grid"
              />
              <text
                x={-8}
                y={y(t)}
                dy="0.32em"
                textAnchor="end"
                className="amort-chart__axis-label"
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
            className="amort-chart__axis-line"
          />
          {AMORT_DATA.map((r, i) => {
            const bx = x(r.anio) ?? 0
            const bw = x.bandwidth()
            const isHover = hover === i
            const op = hover === null ? 0.85 : isHover ? 0.95 : 0.25
            const yResto = y(r.resto)
            const yTop = y(r.resto + r.adq2026)
            return (
              <g key={`bar-${r.anio}`}>
                <rect
                  x={bx}
                  y={yResto}
                  width={bw}
                  height={Math.max(0, innerH - yResto)}
                  fill={COLOR_HASTA}
                  opacity={op}
                  rx={1.5}
                />
                <rect
                  x={bx}
                  y={yTop}
                  width={bw}
                  height={Math.max(0, yResto - yTop)}
                  fill={COLOR_2025}
                  opacity={op}
                  rx={1.5}
                />
              </g>
            )
          })}
          {AMORT_DATA.map((r) => {
            const total = r.resto + r.adq2026
            if (total <= 0) return null
            const bx = x(r.anio) ?? 0
            const bw = x.bandwidth()
            const yTop = y(total)
            return (
              <text
                key={`total-${r.anio}`}
                x={bx + bw / 2}
                y={yTop - 4}
                textAnchor="middle"
                className="amort-chart__bar-total"
              >
                {nf0.format(total)}
              </text>
            )
          })}
          {AMORT_DATA.map((r, i) =>
            i % xTickEvery === 0 || i === AMORT_DATA.length - 1 ? (
              <text
                key={`xt-${r.anio}`}
                x={(x(r.anio) ?? 0) + x.bandwidth() / 2}
                y={innerH + 18}
                textAnchor="middle"
                className="amort-chart__axis-label"
              >
                {r.anio}
              </text>
            ) : null,
          )}
          {AMORT_DATA.map((r, i) => (
            <rect
              key={`hit-${r.anio}`}
              x={x(r.anio) ?? 0}
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

function PerfilCard() {
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

  const w = fullscreen ? 1500 : 1100
  const h = fullscreen ? 720 : 320

  const card = (
    <Card
      padding="md"
      className={`amort-slide__chart-card ${
        fullscreen ? 'amort-slide__chart-card--fullscreen' : ''
      }`}
    >
      <div className="amort-slide__chart-header">
        <span className="amort-slide__chart-title">Perfil de Amortización</span>
        <span className="amort-slide__chart-unit">USD MM</span>
        <button
          type="button"
          className="amort-slide__fs-btn"
          onClick={() => setFullscreen((f) => !f)}
          aria-label={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          title={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          <FsIcon fullscreen={fullscreen} />
        </button>
      </div>
      <div className="amort-slide__chart-body">
        <AmortChart width={w} height={h} />
      </div>
    </Card>
  )

  return fullscreen ? createPortal(card, document.body) : card
}

// ─────────── Stock & Flujos charts (shared IFD/Mercado bar) ───────────

interface IfdMercadoRow {
  anio: string
  ifd: number
  mercado: number
  ifdProy?: number
  mercadoProy?: number
}

const STOCK_DATA: IfdMercadoRow[] = [
  { anio: '2020', ifd: 398.97, mercado: 148.81 },
  { anio: '2021', ifd: 281.54, mercado: 635.95 },
  { anio: '2022', ifd: 384.63, mercado: 635.95 },
  { anio: '2023', ifd: 357.05, mercado: 673.30 },
  { anio: '2024', ifd: 429.47, mercado: 974.85 },
  { anio: '2025', ifd: 514.70, mercado: 1563.49 },
  { anio: '2026', ifd: 444, mercado: 1324, ifdProy: 50, mercadoProy: 700 },
]

const FLUJOS_DATA: IfdMercadoRow[] = [
  { anio: '2020', ifd: 292.88, mercado: 0 },
  { anio: '2021', ifd: 17.90, mercado: 487.14 },
  { anio: '2022', ifd: 169.11, mercado: 0 },
  { anio: '2023', ifd: 60.34, mercado: 54.02 },
  { anio: '2024', ifd: 180.34, mercado: 483.69 },
  { anio: '2025', ifd: 96.39, mercado: 621.98 },
  { anio: '2026', ifd: 42.22, mercado: 0, ifdProy: 7.78, mercadoProy: 700 },
]

const COLOR_IFD = '#adb5bd'
const COLOR_MERCADO = '#c1121f'

interface IfdMercadoChartProps {
  data: IfdMercadoRow[]
  width: number
  height: number
}

function IfdMercadoChart({ data, width, height }: IfdMercadoChartProps) {
  const [hover, setHover] = useState<number | null>(null)

  const margin = { top: 24, right: 60, bottom: 32, left: 56 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  const totals = useMemo(
    () => data.map((r) => r.ifd + r.mercado + (r.ifdProy ?? 0) + (r.mercadoProy ?? 0)),
    [data],
  )
  const maxY = d3.max(totals) ?? 1

  const x = useMemo(
    () =>
      d3
        .scaleBand<string>()
        .domain(data.map((r) => r.anio))
        .range([0, innerW])
        .padding(0.22),
    [data, innerW],
  )
  const y = useMemo(
    () => d3.scaleLinear().domain([0, maxY * 1.1]).nice().range([innerH, 0]),
    [maxY, innerH],
  )
  const yTicks = y.ticks(4)

  const hovered = hover !== null ? data[hover] : null

  return (
    <div className="amort-chart" onMouseLeave={() => setHover(null)}>
      <div
        className={`amort-chart__panel ${hovered ? 'amort-chart__panel--hover' : ''}`}
        role="status"
        aria-live="polite"
      >
        {hovered && (
          <span className="amort-chart__panel-period">
            {hovered.anio}
          </span>
        )}
        <span className="amort-chart__panel-row">
          <span className="amort-chart__panel-swatch" style={{ background: COLOR_IFD }} />
          <span className="amort-chart__panel-name">IFD</span>
          {hovered && (
            <strong className="amort-chart__panel-value">
              {nf2.format(hovered.ifd)} MM
            </strong>
          )}
        </span>
        <span className="amort-chart__panel-row">
          <span className="amort-chart__panel-swatch" style={{ background: COLOR_MERCADO }} />
          <span className="amort-chart__panel-name">Mercado</span>
          {hovered && (
            <strong className="amort-chart__panel-value">
              {nf2.format(hovered.mercado)} MM
            </strong>
          )}
        </span>
        <span className="amort-chart__panel-row">
          <span
            className="amort-chart__panel-swatch amort-chart__panel-swatch--proy"
            style={{ background: COLOR_IFD }}
          />
          <span className="amort-chart__panel-name">IFD proy.</span>
          {hovered && (
            <strong className="amort-chart__panel-value">
              {nf2.format(hovered.ifdProy ?? 0)} MM
            </strong>
          )}
        </span>
        <span className="amort-chart__panel-row">
          <span
            className="amort-chart__panel-swatch amort-chart__panel-swatch--proy"
            style={{ background: COLOR_MERCADO }}
          />
          <span className="amort-chart__panel-name">Mercado proy.</span>
          {hovered && (
            <strong className="amort-chart__panel-value">
              {nf2.format(hovered.mercadoProy ?? 0)} MM
            </strong>
          )}
        </span>
        {hovered && (
          <span className="amort-chart__panel-row amort-chart__panel-row--total">
            <span className="amort-chart__panel-name">Total</span>
            <strong className="amort-chart__panel-value">
              {nf2.format(
                hovered.ifd +
                  hovered.mercado +
                  (hovered.ifdProy ?? 0) +
                  (hovered.mercadoProy ?? 0),
              )}{' '}
              MM
            </strong>
          </span>
        )}
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="amort-chart__svg"
        preserveAspectRatio="xMinYMid meet"
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {yTicks.map((t) => (
            <g key={t}>
              <line
                x1={0}
                x2={innerW}
                y1={y(t)}
                y2={y(t)}
                className="amort-chart__grid"
              />
              <text
                x={-8}
                y={y(t)}
                dy="0.32em"
                textAnchor="end"
                className="amort-chart__axis-label"
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
            className="amort-chart__axis-line"
          />
          {data.map((r, i) => {
            const bx = x(r.anio) ?? 0
            const bw = x.bandwidth()
            const isHover = hover === i
            const op = hover === null ? 0.85 : isHover ? 0.95 : 0.25
            const opProy = hover === null ? 0.4 : isHover ? 0.55 : 0.12
            const ifdProy = r.ifdProy ?? 0
            const merProy = r.mercadoProy ?? 0
            const yIfd = y(r.ifd)
            const yIfdProyTop = y(r.ifd + ifdProy)
            const yMerBase = y(r.ifd + ifdProy + r.mercado)
            const yTop = y(r.ifd + ifdProy + r.mercado + merProy)
            return (
              <g key={`bar-${r.anio}`}>
                {r.ifd > 0 && (
                  <rect
                    x={bx}
                    y={yIfd}
                    width={bw}
                    height={Math.max(0, innerH - yIfd)}
                    fill={COLOR_IFD}
                    opacity={op}
                    rx={1.5}
                  />
                )}
                {ifdProy > 0 && (
                  <rect
                    x={bx}
                    y={yIfdProyTop}
                    width={bw}
                    height={Math.max(0, yIfd - yIfdProyTop)}
                    fill={COLOR_IFD}
                    opacity={opProy}
                    stroke={COLOR_IFD}
                    strokeDasharray="3 2"
                    strokeWidth={0.8}
                    rx={1.5}
                  />
                )}
                {r.mercado > 0 && (
                  <rect
                    x={bx}
                    y={yMerBase}
                    width={bw}
                    height={Math.max(0, yIfdProyTop - yMerBase)}
                    fill={COLOR_MERCADO}
                    opacity={op}
                    rx={1.5}
                  />
                )}
                {merProy > 0 && (
                  <rect
                    x={bx}
                    y={yTop}
                    width={bw}
                    height={Math.max(0, yMerBase - yTop)}
                    fill={COLOR_MERCADO}
                    opacity={opProy}
                    stroke={COLOR_MERCADO}
                    strokeDasharray="3 2"
                    strokeWidth={0.8}
                    rx={1.5}
                  />
                )}
              </g>
            )
          })}
          {data.map((r) => {
            const total = r.ifd + r.mercado + (r.ifdProy ?? 0) + (r.mercadoProy ?? 0)
            if (total <= 0) return null
            return (
              <text
                key={`total-${r.anio}`}
                x={(x(r.anio) ?? 0) + x.bandwidth() / 2}
                y={y(total) - 4}
                textAnchor="middle"
                className="amort-chart__bar-total"
              >
                {nf0.format(total)}
              </text>
            )
          })}
          {data.map((r) => (
            <text
              key={`xt-${r.anio}`}
              x={(x(r.anio) ?? 0) + x.bandwidth() / 2}
              y={innerH + 16}
              textAnchor="middle"
              className="amort-chart__axis-label"
            >
              {r.anio}
            </text>
          ))}
          {data.map((r, i) => (
            <rect
              key={`hit-${r.anio}`}
              x={x(r.anio) ?? 0}
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

function IfdMercadoCard({ title, data }: { title: string; data: IfdMercadoRow[] }) {
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

  const w = fullscreen ? 1500 : 700
  const h = fullscreen ? 720 : 320

  const card = (
    <Card
      padding="md"
      className={`amort-slide__chart-card ${
        fullscreen ? 'amort-slide__chart-card--fullscreen' : ''
      }`}
    >
      <div className="amort-slide__chart-header">
        <span className="amort-slide__chart-title">{title}</span>
        <span className="amort-slide__chart-unit">USD MM</span>
        <button
          type="button"
          className="amort-slide__fs-btn"
          onClick={() => setFullscreen((f) => !f)}
          aria-label={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          title={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          <FsIcon fullscreen={fullscreen} />
        </button>
      </div>
      <div className="amort-slide__chart-body">
        <IfdMercadoChart data={data} width={w} height={h} />
      </div>
    </Card>
  )

  return fullscreen ? createPortal(card, document.body) : card
}

export function AmortizationSlide() {
  return (
    <div className="amort-slide">
      <TextCard
        eyebrow="4 · ENDEUDAMIENTO"
        title="Endeudamiento: Evolución y Proyecciones"
      />
      <PerfilCard />
      <div className="amort-slide__bottom">
        <IfdMercadoCard title="Flujos" data={FLUJOS_DATA} />
        <IfdMercadoCard title="Stock" data={STOCK_DATA} />
      </div>
    </div>
  )
}
