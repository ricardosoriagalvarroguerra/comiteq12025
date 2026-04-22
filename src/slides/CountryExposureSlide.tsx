import { useMemo, useState } from 'react'
import * as d3 from 'd3'
import { TextCard } from '@/components/cards/TextCard'
import { Card } from '@/components/ui/Card'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import {
  CAPACIDAD_COUNTRIES,
  CAPACIDAD_PRESTABLE,
  limiteActivos,
  limiteCapacidad,
  type CapacidadCountry,
} from '@/data/capacidadPrestable'
import '@/components/charts/CapacityLimitChart.css'
import './CountryExposureSlide.css'

const COLOR_UTILIZADA = '#c1121f'
const COLOR_POR_COBRAR = '#48cae4'
const COLOR_ETAPAS = '#adb5bd'

const fmt1 = (n: number) =>
  n.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

const fmt0 = (n: number) =>
  n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

// ─── Generic country-scoped stacked chart ───
interface LimitStackedChartProps {
  country: CapacidadCountry
  title: string
  barColor: string
  valueLabel: string
  getUsado: (p: (typeof CAPACIDAD_PRESTABLE)[number], c: CapacidadCountry) => number
  getLimite: (p: (typeof CAPACIDAD_PRESTABLE)[number], c: CapacidadCountry) => number
}

function LimitStackedChart({
  country,
  title,
  barColor,
  valueLabel,
  getUsado,
  getLimite,
}: LimitStackedChartProps) {
  const data = CAPACIDAD_PRESTABLE

  const W = 560
  const H = 280
  const margin = { top: 34, right: 14, bottom: 32, left: 46 }
  const innerW = W - margin.left - margin.right
  const innerH = H - margin.top - margin.bottom

  const rows = data.map((p) => ({
    period: p.period,
    usado: getUsado(p, country),
    limite: getLimite(p, country),
  }))

  const x = useMemo(
    () =>
      d3
        .scaleBand<string>()
        .domain(rows.map((d) => d.period))
        .range([0, innerW])
        .padding(0.34),
    [rows, innerW],
  )

  const maxY = useMemo(
    () => (d3.max(rows, (d) => d.limite) ?? 1) * 1.16,
    [rows],
  )

  const y = useMemo(
    () => d3.scaleLinear().domain([0, maxY]).range([innerH, 0]).nice(),
    [maxY, innerH],
  )

  const yTicks = y.ticks(4)

  return (
    <div className="capacity-limit-chart">
      <div className="capacity-limit-chart__head">
        <span className="capacity-limit-chart__title">
          {title} · {country}
        </span>
        <div className="capacity-limit-chart__legend">
          <span className="capacity-limit-chart__legend-item">
            <span
              className="capacity-limit-chart__legend-swatch"
              style={{ background: barColor }}
            />
            {valueLabel}
          </span>
          <span className="capacity-limit-chart__legend-item">
            <span className="capacity-limit-chart__legend-swatch capacity-limit-chart__legend-swatch--dashed" />
            Disponible
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="capacity-limit-chart__svg"
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
                className="capacity-limit-chart__grid"
              />
              <text
                x={-6}
                y={y(t)}
                dy="0.32em"
                textAnchor="end"
                className="capacity-limit-chart__axis-label"
              >
                {fmt0(t)}
              </text>
            </g>
          ))}

          <line
            x1={0}
            x2={innerW}
            y1={innerH}
            y2={innerH}
            className="capacity-limit-chart__axis-line"
          />

          {rows.map((d) => {
            const cx = x(d.period) ?? 0
            const bw = x.bandwidth()
            const disp = Math.max(0, d.limite - d.usado)
            const yUsadoTop = y(Math.min(d.usado, d.limite))
            const hUsado = innerH - yUsadoTop
            const yDispTop = y(d.limite)
            const hDisp = y(Math.min(d.usado, d.limite)) - y(d.limite)

            return (
              <g key={d.period}>
                <rect
                  x={cx}
                  y={yUsadoTop}
                  width={bw}
                  height={Math.max(0, hUsado)}
                  fill={barColor}
                  opacity={0.92}
                />
                <rect
                  x={cx + 0.5}
                  y={yDispTop}
                  width={Math.max(0, bw - 1)}
                  height={Math.max(0, hDisp)}
                  className="capacity-limit-chart__bar--disponible"
                />
                {hUsado > 16 && (
                  <text
                    className="capacity-limit-chart__segment-label"
                    x={cx + bw / 2}
                    y={yUsadoTop + hUsado / 2}
                    dy="0.32em"
                    textAnchor="middle"
                  >
                    {fmt1(d.usado)}
                  </text>
                )}
                {hDisp > 14 && (
                  <text
                    className="capacity-limit-chart__segment-label capacity-limit-chart__segment-label--disponible"
                    x={cx + bw / 2}
                    y={yDispTop + hDisp / 2}
                    dy="0.32em"
                    textAnchor="middle"
                  >
                    {fmt1(disp)}
                  </text>
                )}
                <text
                  className="capacity-limit-chart__max-label"
                  x={cx + bw / 2}
                  y={yDispTop - 5}
                  textAnchor="middle"
                >
                  {fmt1(d.limite)}
                </text>
              </g>
            )
          })}

          {rows.map((d) => (
            <text
              key={`xt-${d.period}`}
              x={(x(d.period) ?? 0) + x.bandwidth() / 2}
              y={innerH + 16}
              textAnchor="middle"
              className="capacity-limit-chart__axis-label"
            >
              {d.period}
            </text>
          ))}
        </g>
      </svg>
    </div>
  )
}

// ─── Brecha chart ───
interface BrechaChartProps {
  country: CapacidadCountry
}

function BrechaChart({ country }: BrechaChartProps) {
  const data = CAPACIDAD_PRESTABLE

  const W = 1120
  const H = 260
  const margin = { top: 32, right: 16, bottom: 32, left: 52 }
  const innerW = W - margin.left - margin.right
  const innerH = H - margin.top - margin.bottom

  const rows = data.map((p) => {
    const brechaCap = Math.max(0, limiteCapacidad(p, country) - p.utilizadaPorPais[country])
    const brechaAct = Math.max(0, limiteActivos(p, country) - p.porCobrarPorPais[country])
    const tighter = brechaCap <= brechaAct ? 'capacidad' : 'activos'
    const brecha = Math.min(brechaCap, brechaAct)
    const etapas = p.porActivarPorPais[country]
    return {
      period: p.period,
      etapas,
      brecha,
      brechaColor: tighter === 'capacidad' ? COLOR_UTILIZADA : COLOR_POR_COBRAR,
      tighter,
    }
  })

  const x0 = useMemo(
    () =>
      d3
        .scaleBand<string>()
        .domain(rows.map((d) => d.period))
        .range([0, innerW])
        .padding(0.32),
    [rows, innerW],
  )

  const x1 = useMemo(
    () =>
      d3
        .scaleBand<string>()
        .domain(['etapas', 'brecha'])
        .range([0, x0.bandwidth()])
        .padding(0.18),
    [x0],
  )

  const maxY = useMemo(
    () =>
      (d3.max(rows, (d) => Math.max(d.etapas, d.brecha)) ?? 1) * 1.18,
    [rows],
  )

  const y = useMemo(
    () => d3.scaleLinear().domain([0, Math.max(maxY, 10)]).range([innerH, 0]).nice(),
    [maxY, innerH],
  )

  const yTicks = y.ticks(4)

  return (
    <div className="capacity-limit-chart">
      <div className="capacity-limit-chart__head">
        <span className="capacity-limit-chart__title">
          Brecha frente a límites · {country}
        </span>
        <div className="capacity-limit-chart__legend">
          <span className="capacity-limit-chart__legend-item">
            <span
              className="capacity-limit-chart__legend-swatch"
              style={{ background: COLOR_ETAPAS }}
            />
            Etapas por activar
          </span>
          <span className="capacity-limit-chart__legend-item">
            <span
              className="capacity-limit-chart__legend-swatch"
              style={{ background: COLOR_UTILIZADA }}
            />
            Brecha capacidad
          </span>
          <span className="capacity-limit-chart__legend-item">
            <span
              className="capacity-limit-chart__legend-swatch"
              style={{ background: COLOR_POR_COBRAR }}
            />
            Brecha activos
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="capacity-limit-chart__svg"
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
                className="capacity-limit-chart__grid"
              />
              <text
                x={-8}
                y={y(t)}
                dy="0.32em"
                textAnchor="end"
                className="capacity-limit-chart__axis-label"
              >
                {fmt0(t)}
              </text>
            </g>
          ))}
          <line
            x1={0}
            x2={innerW}
            y1={innerH}
            y2={innerH}
            className="capacity-limit-chart__axis-line"
          />

          {rows.map((d) => {
            const gx = x0(d.period) ?? 0
            const bw = x1.bandwidth()
            const etX = gx + (x1('etapas') ?? 0)
            const brX = gx + (x1('brecha') ?? 0)
            const etY = y(d.etapas)
            const etH = innerH - etY
            const brY = y(d.brecha)
            const brH = innerH - brY

            return (
              <g key={d.period}>
                <rect
                  x={etX}
                  y={etY}
                  width={bw}
                  height={Math.max(0, etH)}
                  fill={COLOR_ETAPAS}
                  opacity={0.95}
                />
                <rect
                  x={brX}
                  y={brY}
                  width={bw}
                  height={Math.max(0, brH)}
                  fill={d.brechaColor}
                  opacity={0.92}
                />
                {d.etapas > 0 && (
                  <text
                    className="capacity-limit-chart__max-label"
                    x={etX + bw / 2}
                    y={etY - 5}
                    textAnchor="middle"
                  >
                    {fmt1(d.etapas)}
                  </text>
                )}
                <text
                  className="capacity-limit-chart__max-label"
                  x={brX + bw / 2}
                  y={brY - 5}
                  textAnchor="middle"
                >
                  {fmt1(d.brecha)}
                </text>
              </g>
            )
          })}

          {rows.map((d) => (
            <text
              key={`xt-${d.period}`}
              x={(x0(d.period) ?? 0) + x0.bandwidth() / 2}
              y={innerH + 18}
              textAnchor="middle"
              className="capacity-limit-chart__axis-label"
            >
              {d.period}
            </text>
          ))}
        </g>
      </svg>
    </div>
  )
}

// ─── Main slide ───
interface CountryExposureSlideProps {
  eyebrow?: string
  title: string
  description?: string
}

export function CountryExposureSlide({
  eyebrow,
  title,
  description,
}: CountryExposureSlideProps) {
  const [country, setCountry] = useState<CapacidadCountry>('ARG')

  return (
    <div className="country-exposure">
      <div className="country-exposure__header">
        <TextCard eyebrow={eyebrow} title={title} description={description} />
        <div className="country-exposure__country-selector">
          <span>País</span>
          <SegmentedControl
            size="sm"
            options={CAPACIDAD_COUNTRIES.map((c) => ({ value: c, label: c }))}
            value={country}
            onChange={(v) => setCountry(v as CapacidadCountry)}
          />
        </div>
      </div>

      <div className="country-exposure__top">
        <Card padding="md" className="country-exposure__chart-card">
          <LimitStackedChart
            country={country}
            title="Límite de Capacidad Prestable"
            barColor={COLOR_UTILIZADA}
            valueLabel="Utilizada"
            getUsado={(p, c) => p.utilizadaPorPais[c]}
            getLimite={limiteCapacidad}
          />
        </Card>
        <Card padding="md" className="country-exposure__chart-card">
          <LimitStackedChart
            country={country}
            title="Límite de Activos Totales"
            barColor={COLOR_POR_COBRAR}
            valueLabel="Por cobrar"
            getUsado={(p, c) => p.porCobrarPorPais[c]}
            getLimite={limiteActivos}
          />
        </Card>
      </div>

      <Card padding="md" className="country-exposure__chart-card country-exposure__chart-card--wide">
        <BrechaChart country={country} />
      </Card>
    </div>
  )
}
