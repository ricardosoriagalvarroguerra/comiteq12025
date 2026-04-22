import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import * as d3 from 'd3'
import { TextCard } from '@/components/cards/TextCard'
import { Card } from '@/components/ui/Card'
import {
  FLUJO_PAISES,
  FLUJO_PERIODOS,
  FLUJOS_DATA,
  getFlujosByPais,
  type FlujoPais,
  type FlujoRow,
} from '@/data/flujosPorPais'
import './FlujosPorPaisSlide.css'

const COLOR_DESEMBOLSOS = '#c1121f'
const COLOR_AMORTIZACION = '#6c757d'
const COLOR_INTERESES = '#1d3557'
const COLOR_COMISIONES = '#f77f00'
const COLOR_APORTE = '#a8dadc'
const COLOR_COMP_RC = '#48cae4'
const COLOR_SERV_PC = '#70e000'
const COLOR_MORA = '#9d0208'
const COLOR_FLUJO_LINE = '#000'

interface Series {
  id: keyof FlujoRow
  label: string
  color: string
  sign: 1 | -1
}

const STACK_SERIES: Series[] = [
  { id: 'desembolsos', label: 'Desembolsos', color: COLOR_DESEMBOLSOS, sign: 1 },
  { id: 'amortizacion', label: 'Amortización', color: COLOR_AMORTIZACION, sign: -1 },
  { id: 'intereses', label: 'Intereses', color: COLOR_INTERESES, sign: -1 },
  { id: 'comisiones', label: 'Comisiones', color: COLOR_COMISIONES, sign: -1 },
  { id: 'aporteVoluntario', label: 'Aporte Voluntario', color: COLOR_APORTE, sign: -1 },
  { id: 'compensacionReservaCredito', label: 'Comp. Reserva Crédito', color: COLOR_COMP_RC, sign: -1 },
  { id: 'servicioPagoCuenta', label: 'Servicio Pago Cuenta', color: COLOR_SERV_PC, sign: -1 },
  { id: 'mora', label: 'Mora', color: COLOR_MORA, sign: -1 },
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

// ── Compute min/max for a specific country (independent scales) ──
function usePaisExtent(pais: FlujoPais): [number, number] {
  return useMemo(() => {
    const allowed = new Set<string>(FLUJO_PERIODOS as unknown as string[])
    const rows = FLUJOS_DATA.filter((r) => r.pais === pais && allowed.has(r.anio))
    let maxPos = 0
    let minNeg = 0
    for (const row of rows) {
      const pos = Math.max(0, row.desembolsos)
      const neg =
        (row.amortizacion || 0) +
        (row.intereses || 0) +
        (row.comisiones || 0) +
        (row.aporteVoluntario || 0) +
        (row.compensacionReservaCredito || 0) +
        (row.servicioPagoCuenta || 0) +
        (row.mora || 0)
      maxPos = Math.max(maxPos, pos, row.flujoNeto)
      minNeg = Math.min(minNeg, -neg, row.flujoNeto)
    }
    return [minNeg * 1.1, maxPos * 1.1]
  }, [pais])
}

interface FlujoHoverInfo {
  label: string
  period: string
  flujoNeto: number
  rows: Array<{ id: string; label: string; value: number; color: string; sign: 1 | -1 }>
}

interface FlujoChartProps {
  pais: FlujoPais
  width: number
  height: number
  yDomain: [number, number]
  compact?: boolean
  label?: string
  onHoverChange?: (info: FlujoHoverInfo | null) => void
}

function FlujoChart({ pais, width, height, yDomain, compact = true, label, onHoverChange }: FlujoChartProps) {
  const [hover, setHover] = useState<number | null>(null)
  const rows = useMemo(() => getFlujosByPais(pais), [pais])

  useEffect(() => {
    if (!onHoverChange) return
    if (hover === null) {
      onHoverChange(null)
      return
    }
    const r = rows[hover]
    onHoverChange({
      label: label ?? String(pais),
      period: r.anio,
      flujoNeto: r.flujoNeto,
      rows: STACK_SERIES.filter((s) => (r[s.id] as number) !== 0).map((s) => ({
        id: String(s.id),
        label: s.label,
        value: r[s.id] as number,
        color: s.color,
        sign: s.sign,
      })),
    })
  }, [hover, rows, label, pais, onHoverChange])

  const margin = compact
    ? { top: 12, right: 8, bottom: 28, left: 44 }
    : { top: 20, right: 16, bottom: 40, left: 60 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  const x = useMemo(
    () =>
      d3
        .scaleBand<string>()
        .domain(FLUJO_PERIODOS as unknown as string[])
        .range([0, innerW])
        .padding(0.18),
    [innerW],
  )
  const y = useMemo(
    () => d3.scaleLinear().domain(yDomain).nice().range([innerH, 0]),
    [yDomain, innerH],
  )
  const yTicks = y.ticks(compact ? 4 : 6)

  const linePath = useMemo(() => {
    const gen = d3
      .line<FlujoRow>()
      .x((r) => (x(r.anio) ?? 0) + x.bandwidth() / 2)
      .y((r) => y(r.flujoNeto))
      .curve(d3.curveMonotoneX)
    return gen(rows) ?? ''
  }, [rows, x, y])

  const xTickEvery = compact ? 2 : 1

  return (
    <div className="flujo-chart" onMouseLeave={() => setHover(null)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="flujo-chart__svg"
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
                className={t === 0 ? 'flujo-chart__zero' : 'flujo-chart__grid'}
              />
              <text
                x={-6}
                y={y(t)}
                dy="0.32em"
                textAnchor="end"
                className="flujo-chart__axis-label"
              >
                {nf0.format(t)}
              </text>
            </g>
          ))}

          {rows.map((r, i) => {
            const bx = x(r.anio) ?? 0
            const bw = x.bandwidth()
            const isHover = hover === i
            const baseOpacity = 0.7
            const op = hover === null ? baseOpacity : isHover ? 0.95 : 0.25

            // Positive stack: Desembolsos
            const posY = y(r.desembolsos)
            const posH = y(0) - posY
            const desembolsoBar =
              r.desembolsos > 0 ? (
                <rect
                  x={bx}
                  y={posY}
                  width={bw}
                  height={Math.max(0, posH)}
                  fill={COLOR_DESEMBOLSOS}
                  opacity={op}
                  rx={1}
                />
              ) : null

            // Negative stack: outflows below zero
            let accNeg = 0
            const negBars = STACK_SERIES.filter((s) => s.sign < 0).map((s) => {
              const val = r[s.id] as number
              if (!val) return null
              const top = accNeg
              accNeg += val
              const yTop = y(-top)
              const yBot = y(-accNeg)
              return (
                <rect
                  key={`${r.anio}-${s.id}`}
                  x={bx}
                  y={yTop}
                  width={bw}
                  height={Math.max(0, yBot - yTop)}
                  fill={s.color}
                  opacity={op}
                  rx={1}
                />
              )
            })

            return (
              <g key={`bar-${r.anio}`}>
                {desembolsoBar}
                {negBars}
              </g>
            )
          })}

          {/* Zero line always on top */}
          <line
            x1={0}
            x2={innerW}
            y1={y(0)}
            y2={y(0)}
            className="flujo-chart__axis-line"
          />

          {/* Flujo neto line */}
          <path d={linePath} className="flujo-chart__line" stroke={COLOR_FLUJO_LINE} fill="none" />
          {rows.map((r, i) => {
            const cx = (x(r.anio) ?? 0) + x.bandwidth() / 2
            const isHover = hover === i
            const rad = isHover ? 4.5 : 2.8
            const dotOpacity = hover === null ? 1 : isHover ? 1 : 0.3
            return (
              <circle
                key={`pt-${r.anio}`}
                cx={cx}
                cy={y(r.flujoNeto)}
                r={rad}
                fill={COLOR_FLUJO_LINE}
                opacity={dotOpacity}
                className="flujo-chart__dot"
              />
            )
          })}

          {/* X axis labels (thinned) */}
          {rows.map((r, i) =>
            i % xTickEvery === 0 || i === rows.length - 1 ? (
              <text
                key={`xt-${r.anio}`}
                x={(x(r.anio) ?? 0) + x.bandwidth() / 2}
                y={innerH + 16}
                textAnchor="middle"
                className="flujo-chart__axis-label flujo-chart__axis-label--x"
              >
                {r.anio}
              </text>
            ) : null,
          )}

          {/* Hover hit areas */}
          {rows.map((r, i) => (
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

interface CountryChartCardProps {
  pais: FlujoPais
  label: string
  onHoverChange?: (info: FlujoHoverInfo | null) => void
}

function CountryChartCard({ pais, label, onHoverChange }: CountryChartCardProps) {
  const yDomain = usePaisExtent(pais)
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

  const width = fullscreen ? 1400 : 420
  const height = fullscreen ? 680 : 220

  const card = (
    <Card
      padding="md"
      className={`flujos-slide__chart-card ${
        fullscreen ? 'flujos-slide__chart-card--fullscreen' : ''
      }`}
    >
      <div className="flujos-slide__chart-header">
        <span className="flujos-slide__chart-title">{label}</span>
        <button
          type="button"
          className="flujos-slide__fs-btn"
          onClick={() => setFullscreen((f) => !f)}
          aria-label={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          title={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          <FsIcon fullscreen={fullscreen} />
        </button>
      </div>
      <div className="flujos-slide__chart-body">
        <FlujoChart
          pais={pais}
          width={width}
          height={height}
          yDomain={yDomain}
          compact={!fullscreen}
          label={label}
          onHoverChange={onHoverChange}
        />
      </div>
    </Card>
  )

  return fullscreen ? createPortal(card, document.body) : card
}

export function FlujosPorPaisSlide() {
  const [hoverTip, setHoverTip] = useState<FlujoHoverInfo | null>(null)

  return (
    <div className="flujos-slide">
      <div className="flujos-slide__header">
        <TextCard
          eyebrow="2 · CARTERA"
          title="Flujo Neto por País"
          description="USD Millones"
        />
        <aside
          className="flujos-slide__header-panel"
          aria-label="Leyenda de categorías"
        >
          {hoverTip ? (
            <>
              <div className="flujos-slide__header-context">
                {`${hoverTip.label} · ${hoverTip.period}`}
              </div>
              <div className="flujos-slide__header-grid">
                {STACK_SERIES.map((s) => {
                  const row = hoverTip.rows.find((r) => r.id === s.id)
                  return (
                    <div
                      key={s.id}
                      className="flujos-slide__header-item"
                    >
                      <span className="flujos-slide__header-item-label">
                        <span
                          className="flujos-slide__legend-swatch"
                          style={{ background: s.color }}
                        />
                        {s.label}
                      </span>
                      <strong className="flujos-slide__header-value">
                        {row
                          ? `${s.sign < 0 ? '−' : ''}${nf1.format(row.value)}`
                          : '—'}
                      </strong>
                    </div>
                  )
                })}
                <div className="flujos-slide__header-item flujos-slide__header-item--total">
                  <span className="flujos-slide__header-item-label">
                    <span
                      className="flujos-slide__legend-line"
                      style={{ background: COLOR_FLUJO_LINE }}
                    />
                    Flujo Neto
                  </span>
                  <strong className="flujos-slide__header-value">
                    {nf1.format(hoverTip.flujoNeto)}
                  </strong>
                </div>
              </div>
            </>
          ) : (
            <div className="flujos-slide__header-grid">
              {STACK_SERIES.map((s) => (
                <div key={s.id} className="flujos-slide__header-item">
                  <span className="flujos-slide__header-item-label">
                    <span
                      className="flujos-slide__legend-swatch"
                      style={{ background: s.color }}
                    />
                    {s.label}
                  </span>
                </div>
              ))}
              <div className="flujos-slide__header-item">
                <span className="flujos-slide__header-item-label">
                  <span
                    className="flujos-slide__legend-line"
                    style={{ background: COLOR_FLUJO_LINE }}
                  />
                  Flujo Neto
                </span>
              </div>
            </div>
          )}
        </aside>
      </div>
      <div className="flujos-slide__grid">
        {FLUJO_PAISES.map((p) => (
          <CountryChartCard
            key={p.id}
            pais={p.id}
            label={p.label}
            onHoverChange={setHoverTip}
          />
        ))}
      </div>
    </div>
  )
}
