import { useState, type ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import './ChartPlaceholder.css'

export type ChartType =
  | 'bar'
  | 'line'
  | 'stacked-bar'
  | 'donut'
  | 'scatter'
  | 'grouped-bar'

export interface ChartSeries {
  name: string
  values: number[]
  color?: string
}

interface ChartPlaceholderProps {
  title: string
  subtitle?: string
  chartType: ChartType
  unit?: string
  height?: 'auto' | 'full'
  surface?: 'card' | 'bare'
  actions?: ReactNode
  className?: string
  /**
   * Optional data. When supplied, ChartPlaceholder renders a real lightweight
   * SVG chart. When omitted, it falls back to the iconographic placeholder.
   */
  data?: { labels?: string[]; series: ChartSeries[] }
}

const chartIcons: Record<ChartType, string> = {
  bar: 'M4 20V10h4v10H4zm6 0V4h4v16h10zm6 0V8h4v12h16z',
  'stacked-bar': 'M4 20V10h4v10H4zm0-12V4h4v4H4zm6 12V8h4v12h10zm0-14V4h4v4h-4zm6 14V6h4v14h16zm0-16V4h4v2h-4z',
  line: 'M3 17l5-5 4 4 8-10',
  donut: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z',
  scatter: 'M7 14a2 2 0 100-4 2 2 0 000 4zm5-6a2 2 0 100-4 2 2 0 000 4zm5 8a2 2 0 100-4 2 2 0 000 4zm-3-5a2 2 0 100-4 2 2 0 000 4z',
  'grouped-bar': 'M3 20V12h2v8H3zm3 0V8h2v12H6zm5 0V14h2v6h-2zm3 0V6h2v14h-2zm5 0V10h2v10h-2zm3 0V4h2v16h-2z',
}

const chartLabels: Record<ChartType, string> = {
  bar: 'Gráfico de barras',
  'stacked-bar': 'Gráfico de barras apiladas',
  line: 'Gráfico de líneas',
  donut: 'Gráfico de dona',
  scatter: 'Gráfico de dispersión',
  'grouped-bar': 'Gráfico de barras agrupadas',
}

const SERIES_COLORS = [
  'var(--color-series-1)',
  'var(--color-series-2)',
  'var(--color-series-3)',
  'var(--color-series-4)',
  'var(--color-series-5)',
  'var(--color-series-6)',
]

interface RenderProps {
  data: NonNullable<ChartPlaceholderProps['data']>
  chartType: ChartType
  onHoverIndex?: (index: number | null) => void
  hoveredIndex?: number | null
}

function MiniChart({ data, chartType, onHoverIndex, hoveredIndex }: RenderProps) {
  const W = 600
  const H = 220
  const PAD = 24
  const innerW = W - PAD * 2
  const innerH = H - PAD * 2

  const series = data.series
  const labels = data.labels ?? series[0]?.values.map((_, i) => String(i + 1)) ?? []
  const all = series.flatMap((s) => s.values)
  const max = Math.max(1, ...all)
  const min = Math.min(0, ...all)

  if (chartType === 'line') {
    const stepX = innerW / Math.max(1, labels.length - 1)
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-placeholder__svg" role="img">
        {[0.25, 0.5, 0.75].map((p) => (
          <line
            key={p}
            x1={PAD} x2={W - PAD}
            y1={PAD + innerH * p} y2={PAD + innerH * p}
            stroke="var(--color-border-soft)" strokeDasharray="2 4"
          />
        ))}
        {series.map((s, si) => {
          const color = s.color ?? SERIES_COLORS[si % SERIES_COLORS.length]
          const d = s.values
            .map((v, i) => {
              const x = PAD + i * stepX
              const y = PAD + innerH * (1 - (v - min) / (max - min))
              return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
            })
            .join(' ')
          return (
            <g key={s.name}>
              <path d={d} fill="none" stroke={color} strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
              {s.values.map((v, i) => {
                const x = PAD + i * stepX
                const y = PAD + innerH * (1 - (v - min) / (max - min))
                return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />
              })}
            </g>
          )
        })}
      </svg>
    )
  }

  if (chartType === 'bar' || chartType === 'grouped-bar') {
    const groupCount = labels.length
    const groupW = innerW / Math.max(1, groupCount)
    const barW = (groupW * 0.7) / Math.max(1, series.length)
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-placeholder__svg" role="img">
        {labels.map((_, gi) => series.map((s, si) => {
          const v = s.values[gi] ?? 0
          const h = innerH * ((v - min) / (max - min))
          const x = PAD + gi * groupW + groupW * 0.15 + si * barW
          const y = PAD + (innerH - h)
          return (
            <rect key={`${gi}-${si}`} x={x} y={y} width={barW * 0.95} height={h}
              fill={s.color ?? SERIES_COLORS[si % SERIES_COLORS.length]} rx="2" />
          )
        }))}
      </svg>
    )
  }

  if (chartType === 'stacked-bar') {
    const groupCount = labels.length
    const groupW = innerW / Math.max(1, groupCount)
    const totals = labels.map((_, gi) =>
      series.reduce((sum, s) => sum + Math.max(0, s.values[gi] ?? 0), 0),
    )
    const maxTotal = Math.max(1, ...totals)
    return (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="chart-placeholder__svg"
        role="img"
        preserveAspectRatio="none"
        onMouseLeave={() => onHoverIndex?.(null)}
      >
        {labels.map((_, gi) => {
          let acc = 0
          return series.map((s, si) => {
            const v = Math.max(0, s.values[gi] ?? 0)
            const h = (innerH * v) / maxTotal
            const y = PAD + innerH - acc - h
            acc += h
            const isHovered = hoveredIndex === gi
            return (
              <rect key={`${gi}-${si}`}
                x={PAD + gi * groupW + groupW * 0.18}
                y={y}
                width={groupW * 0.64}
                height={h}
                fill={s.color ?? SERIES_COLORS[si % SERIES_COLORS.length]}
                opacity={hoveredIndex === null || hoveredIndex === undefined ? 0.92 : isHovered ? 1 : 0.45}
              />
            )
          })
        })}
        {onHoverIndex && labels.map((_, gi) => (
          <rect
            key={`hit-${gi}`}
            x={PAD + gi * groupW}
            y={PAD}
            width={groupW}
            height={innerH}
            fill="transparent"
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => onHoverIndex(gi)}
          />
        ))}
      </svg>
    )
  }

  // Fallback: render simple bar
  return null
}

export function ChartPlaceholder({
  title,
  subtitle,
  chartType,
  unit,
  height = 'auto',
  surface = 'card',
  actions,
  className = '',
  data,
}: ChartPlaceholderProps) {
  const hasData = !!data && data.series.length > 0
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const enableTooltip = hasData && chartType === 'stacked-bar'
  const hoveredLabel =
    enableTooltip && hoveredIndex !== null ? data!.labels?.[hoveredIndex] : null
  const hoveredTotal =
    enableTooltip && hoveredIndex !== null
      ? data!.series.reduce((s, serie) => s + (serie.values[hoveredIndex] ?? 0), 0)
      : 0
  const content = (
    <>
      <div className="chart-placeholder__header">
        <div className="chart-placeholder__header-text">
          {subtitle && <span className="chart-placeholder__subtitle">{subtitle}</span>}
          <h3 className="chart-placeholder__title">{title}</h3>
          {unit && <span className="chart-placeholder__unit">{unit}</span>}
        </div>
        {enableTooltip && hoveredIndex !== null && (
          <div className="chart-placeholder__tooltip" role="status" aria-live="polite">
            <span className="chart-placeholder__tooltip-label">{hoveredLabel}</span>
            {[...data!.series].reverse().map((s) => (
              <span key={s.name} className="chart-placeholder__tooltip-item">
                <span
                  className="chart-placeholder__tooltip-swatch"
                  style={{ background: s.color ?? 'var(--color-series-1)' }}
                />
                <span className="chart-placeholder__tooltip-name">{s.name}</span>
                <span className="chart-placeholder__tooltip-value">
                  {(s.values[hoveredIndex] ?? 0).toFixed(2)}
                  {unit ? ` ${unit}` : ''}
                </span>
              </span>
            ))}
            <span className="chart-placeholder__tooltip-item chart-placeholder__tooltip-item--total">
              <span className="chart-placeholder__tooltip-name">Total</span>
              <span className="chart-placeholder__tooltip-value">
                {hoveredTotal.toFixed(2)}
                {unit ? ` ${unit}` : ''}
              </span>
            </span>
          </div>
        )}
        {actions && <div className="chart-placeholder__actions">{actions}</div>}
      </div>
      <div className="chart-placeholder__canvas">
        {hasData ? (
          <MiniChart
            data={data}
            chartType={chartType}
            onHoverIndex={enableTooltip ? setHoveredIndex : undefined}
            hoveredIndex={enableTooltip ? hoveredIndex : undefined}
          />
        ) : (
          <div className="chart-placeholder__icon-wrap">
            <svg
              className="chart-placeholder__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={chartIcons[chartType]} />
            </svg>
            <span className="chart-placeholder__label">{chartLabels[chartType]}</span>
          </div>
        )}
      </div>
    </>
  )

  if (surface === 'bare') {
    return (
      <div className={`chart-placeholder chart-placeholder--${height} ${className}`}>
        {content}
      </div>
    )
  }

  return (
    <Card
      padding="md"
      className={`chart-placeholder chart-placeholder--${height} ${className}`}
    >
      {content}
    </Card>
  )
}
