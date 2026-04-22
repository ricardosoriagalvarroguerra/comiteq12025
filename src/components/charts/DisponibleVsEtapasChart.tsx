import { useMemo } from 'react'
import * as d3 from 'd3'
import { CAPACIDAD_PRESTABLE } from '@/data/capacidadPrestable'
import './DisponibleVsEtapasChart.css'

const COLOR_ETAPAS = '#adb5bd'
const ETAPAS_POR_ACTIVAR = 654.79

const fmt1 = (n: number) =>
  n.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

const fmt0 = (n: number) =>
  n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

interface DisponibleVsEtapasChartProps {
  title?: string
}

export function DisponibleVsEtapasChart({
  title = 'Capacidad disponible vs. etapas por activar',
}: DisponibleVsEtapasChartProps) {
  const q1_2027 = CAPACIDAD_PRESTABLE.find((d) => d.period === 'Q1-2027')!
  const disponible = q1_2027.capacidadMax - q1_2027.utilizadaTotal

  const data = [
    { key: 'disponible', label: 'Capacidad disponible', sub: 'Q1-2027', value: disponible },
    { key: 'etapas', label: 'Etapas por activar', sub: 'Cartera', value: ETAPAS_POR_ACTIVAR },
  ]

  const W = 560
  const H = 260
  const margin = { top: 40, right: 24, bottom: 44, left: 52 }
  const innerW = W - margin.left - margin.right
  const innerH = H - margin.top - margin.bottom

  const x = useMemo(
    () =>
      d3
        .scaleBand<string>()
        .domain(data.map((d) => d.key))
        .range([0, innerW])
        .padding(0.45),
    [innerW],
  )

  const maxY = Math.max(...data.map((d) => d.value)) * 1.18

  const y = useMemo(
    () => d3.scaleLinear().domain([0, maxY]).range([innerH, 0]).nice(),
    [maxY, innerH],
  )

  const yTicks = y.ticks(4)

  return (
    <div className="disp-etapas-chart">
      <div className="disp-etapas-chart__head">
        <span className="disp-etapas-chart__title">{title}</span>
        <div className="disp-etapas-chart__legend">
          <span className="disp-etapas-chart__legend-item">
            <span className="disp-etapas-chart__legend-swatch disp-etapas-chart__legend-swatch--dashed" />
            Disponible
          </span>
          <span className="disp-etapas-chart__legend-item">
            <span
              className="disp-etapas-chart__legend-swatch"
              style={{ background: COLOR_ETAPAS }}
            />
            Etapas por activar
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="disp-etapas-chart__svg"
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
                className="disp-etapas-chart__grid"
              />
              <text
                x={-8}
                y={y(t)}
                dy="0.32em"
                textAnchor="end"
                className="disp-etapas-chart__axis-label"
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
            className="disp-etapas-chart__axis-line"
          />

          {data.map((d) => {
            const cx = x(d.key) ?? 0
            const bw = x.bandwidth()
            const yTop = y(d.value)
            const h = innerH - yTop
            const isDisponible = d.key === 'disponible'
            return (
              <g key={d.key}>
                <rect
                  x={cx + (isDisponible ? 0.5 : 0)}
                  y={yTop}
                  width={Math.max(0, bw - (isDisponible ? 1 : 0))}
                  height={Math.max(0, h)}
                  fill={isDisponible ? undefined : COLOR_ETAPAS}
                  className={
                    isDisponible ? 'disp-etapas-chart__bar--disponible' : undefined
                  }
                  opacity={isDisponible ? 1 : 0.95}
                />
                <text
                  className="disp-etapas-chart__bar-label"
                  x={cx + bw / 2}
                  y={yTop - 8}
                  textAnchor="middle"
                >
                  {fmt1(d.value)}
                </text>
                <text
                  className="disp-etapas-chart__axis-label"
                  x={cx + bw / 2}
                  y={innerH + 18}
                  textAnchor="middle"
                >
                  {d.label}
                </text>
                <text
                  className="disp-etapas-chart__bar-sublabel"
                  x={cx + bw / 2}
                  y={innerH + 32}
                  textAnchor="middle"
                >
                  {d.sub}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}
