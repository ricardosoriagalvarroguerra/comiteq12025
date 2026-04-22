import { useMemo, useState } from 'react'
import * as d3 from 'd3'
import type { CarteraCountry } from '@/data/carteraPorPais'
import './CountryDonut.css'

export const COUNTRY_COLORS: Record<CarteraCountry, string> = {
  ARG: '#48cae4',
  BOL: '#70e000',
  BRA: '#ffdd00',
  PAR: '#f94144',
  URU: '#61a5c2',
  RNS: '#bbbaba',
}

export const COUNTRY_ORDER: CarteraCountry[] = [
  'ARG',
  'BOL',
  'BRA',
  'PAR',
  'URU',
  'RNS',
]

interface Slice {
  country: CarteraCountry
  value: number
  color: string
}

interface CountryDonutProps {
  values: Record<CarteraCountry, number>
  size: number
  hoveredCountry?: CarteraCountry | null
  onHoverChange?: (c: CarteraCountry | null) => void
}

const fmt = (n: number) =>
  n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })

export function CountryDonut({
  values,
  size,
  hoveredCountry,
  onHoverChange,
}: CountryDonutProps) {
  const [localHover, setLocalHover] = useState<CarteraCountry | null>(null)
  const hover = hoveredCountry !== undefined ? hoveredCountry : localHover
  const setHover = (c: CarteraCountry | null) => {
    if (hoveredCountry === undefined) setLocalHover(c)
    onHoverChange?.(c)
  }

  const data = useMemo<Slice[]>(
    () =>
      COUNTRY_ORDER.map((c) => ({
        country: c,
        value: values[c] ?? 0,
        color: COUNTRY_COLORS[c],
      })),
    [values],
  )

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
      className="country-donut"
      onMouseLeave={() => setHover(null)}
      style={{ width: size, height: size }}
    >
      {hovered && (
        <div className="country-donut__tooltip" role="status" aria-live="polite">
          <span className="country-donut__tooltip-head">
            <span
              className="country-donut__tooltip-swatch"
              style={{ background: hovered.color }}
            />
            {hovered.country}
          </span>
          <span className="country-donut__tooltip-value">
            {fmt(hovered.value)} USD MM
          </span>
          <span className="country-donut__tooltip-pct">
            {total > 0 ? ((hovered.value / total) * 100).toFixed(1) : '0.0'}%
          </span>
        </div>
      )}
      <svg
        viewBox={`${-r} ${-r} ${size} ${size}`}
        className="country-donut__svg"
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
              className="country-donut__slice"
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
              className="country-donut__label"
            >
              {Math.round(pct)}%
            </text>
          )
        })}
        <text
          x={0}
          y={-4}
          textAnchor="middle"
          className="country-donut__total-value"
          style={{ fontSize: Math.max(14, size * 0.11) }}
        >
          {fmt(total)}
        </text>
        <text
          x={0}
          y={size * 0.09}
          textAnchor="middle"
          className="country-donut__total-unit"
          style={{ fontSize: Math.max(9, size * 0.055) }}
        >
          USD MM
        </text>
      </svg>
    </div>
  )
}
