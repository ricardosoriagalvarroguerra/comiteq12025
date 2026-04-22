import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as d3 from 'd3'
import { TextCard } from '@/components/cards/TextCard'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { MultiSelect } from '@/components/ui/MultiSelect'
import {
  CARTERA_CATEGORIES,
  CARTERA_COUNTRIES,
  CARTERA_DATA,
  type CarteraCategory,
  type CarteraCountry,
  type CarteraRow,
} from '@/data/carteraPorPais'
import './PortfolioCountrySlide.css'

type ViewMode = 'general' | 'desglose'
type Granularity = 'Q' | 'Y'
type ChartKind = 'stacked' | 'line'

interface AggregatedPoint {
  period: string
  sortKey: number
  porCobrar: number
  porDesembolsar: number
  aprobadoNoVigente: number
  porActivar: number
  total: number
}

interface TooltipState {
  title: string
  period: string
  rows: Array<{ key: string; label: string; value: string; color: string }>
  total?: string
}

const CATEGORY_COLOR: Record<CarteraCategory, string> = Object.fromEntries(
  CARTERA_CATEGORIES.map((c) => [c.key, c.color]),
) as Record<CarteraCategory, string>

const COUNTRY_ORDER = CARTERA_COUNTRIES

const PROJECTED_PERIODS = new Set([
  'Q2-26',
  'Q3-26',
  'Q4-26',
  'Q1-27',
  '2026',
  '2027',
])

function formatPeriodLabel(period: string) {
  const m = /^Q([1-4])-(\d{2})$/.exec(period)
  return m ? `${m[1]}Q${m[2]}` : period
}

function quarterSort(row: CarteraRow) {
  return row.year * 10 + row.quarter
}

function aggregate(
  rows: CarteraRow[],
  granularity: Granularity,
): AggregatedPoint[] {
  const bucket = new Map<string, AggregatedPoint>()
  for (const r of rows) {
    const key =
      granularity === 'Q' ? r.period : String(r.year)
    const sortKey =
      granularity === 'Q' ? quarterSort(r) : r.year * 10 + 4
    const existing =
      bucket.get(key) ??
      {
        period: key,
        sortKey,
        porCobrar: 0,
        porDesembolsar: 0,
        aprobadoNoVigente: 0,
        porActivar: 0,
        total: 0,
      }
    if (granularity === 'Y') {
      if (r.quarter === 4) {
        existing.porCobrar = r.porCobrar
        existing.porDesembolsar = r.porDesembolsar
        existing.aprobadoNoVigente = r.aprobadoNoVigente
        existing.porActivar = r.porActivar
      }
    } else {
      existing.porCobrar += r.porCobrar
      existing.porDesembolsar += r.porDesembolsar
      existing.aprobadoNoVigente += r.aprobadoNoVigente
      existing.porActivar += r.porActivar
    }
    bucket.set(key, existing)
  }
  const list = Array.from(bucket.values()).sort(
    (a, b) => a.sortKey - b.sortKey,
  )
  for (const p of list) {
    p.total =
      p.porCobrar + p.porDesembolsar + p.aprobadoNoVigente + p.porActivar
  }
  return list
}

function formatNumber(n: number) {
  return n.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })
}

export function PortfolioCountrySlide() {
  const [view, setView] = useState<ViewMode>('general')
  const [granularity, setGranularity] = useState<Granularity>('Q')
  const [chartKind, setChartKind] = useState<ChartKind>('stacked')
  const [activeCategories, setActiveCategories] = useState<
    Set<CarteraCategory>
  >(new Set(CARTERA_CATEGORIES.map((c) => c.key)))
  const [activeCountries, setActiveCountries] = useState<Set<CarteraCountry>>(
    new Set(COUNTRY_ORDER),
  )
  const [hoveredLegend, setHoveredLegend] = useState<TooltipState | null>(null)
  const filteredRows = useMemo(
    () => CARTERA_DATA.filter((r) => activeCountries.has(r.country)),
    [activeCountries],
  )
  const rowsByCountry = useMemo(() => {
    const map = {} as Record<CarteraCountry, CarteraRow[]>
    for (const country of COUNTRY_ORDER) {
      map[country] = CARTERA_DATA.filter((r) => r.country === country)
    }
    return map
  }, [])

  const handleViewChange = (v: ViewMode) => {
    setHoveredLegend(null)
    setView(v)
  }
  const handleGranularityChange = (v: Granularity) => {
    setHoveredLegend(null)
    setGranularity(v)
  }
  const handleChartKindChange = (v: ChartKind) => {
    setHoveredLegend(null)
    setChartKind(v)
  }
  const handleCategoriesChange = (next: Set<CarteraCategory>) => {
    setHoveredLegend(null)
    setActiveCategories(next)
  }
  const handleCountriesChange = (next: Set<CarteraCountry>) => {
    setHoveredLegend(null)
    setActiveCountries(next)
  }

  const desgloseYMax = useMemo(() => {
    const activeCats = CARTERA_CATEGORIES.filter((c) =>
      activeCategories.has(c.key),
    ).map((c) => c.key)
    let max = 0
    for (const country of COUNTRY_ORDER) {
      if (!activeCountries.has(country)) continue
      const agg = aggregate(
        CARTERA_DATA.filter((r) => r.country === country),
        granularity,
      )
      for (const p of agg) {
        const s = activeCats.reduce((a, k) => a + p[k], 0)
        if (s > max) max = s
      }
    }
    return max
  }, [activeCategories, activeCountries, granularity])

  const categoryOptions = CARTERA_CATEGORIES.map((c) => ({
    value: c.key,
    label: c.label,
    color: c.color,
  }))
  const countryOptions = COUNTRY_ORDER.map((c) => ({ value: c, label: c }))

  return (
    <div className="portfolio-country">
      <div className="portfolio-country__header">
        <TextCard
          eyebrow="2 · CARTERA"
          title="Cartera de Préstamos: Evolución y Proyecciones"
          description="USD Millones"
          variant="default"
        />
        <div
          className="portfolio-country__legend"
          aria-label="Leyenda de categorías"
        >
          {hoveredLegend ? (
            <div className="portfolio-country__legend-head">
              <span className="portfolio-country__legend-context">
                {`${hoveredLegend.title} · ${hoveredLegend.period}`}
              </span>
            </div>
          ) : null}

          <div className="portfolio-country__legend-grid">
            {CARTERA_CATEGORIES.map((c) => (
              <div
                key={c.key}
                className={`portfolio-country__legend-item ${
                  activeCategories.has(c.key) ? '' : 'is-muted'
                }`}
              >
                <div className="portfolio-country__legend-item-label">
                  <span
                    className="portfolio-country__legend-dot"
                    style={{ background: c.color }}
                  />
                  <span>{c.label}</span>
                </div>
                {hoveredLegend ? (
                  <strong className="portfolio-country__legend-value">
                    {hoveredLegend.rows.find((r) => r.key === c.key)?.value ?? '—'}
                  </strong>
                ) : null}
              </div>
            ))}
            {hoveredLegend?.rows
              .filter((r) => !CARTERA_CATEGORIES.some((c) => c.key === r.key))
              .map((r) => (
                <div
                  key={r.key}
                  className="portfolio-country__legend-item portfolio-country__legend-item--metric"
                >
                  <div className="portfolio-country__legend-item-label">
                    <span
                      className="portfolio-country__legend-dot"
                      style={{ background: r.color }}
                    />
                    <span>{r.label}</span>
                  </div>
                  <strong className="portfolio-country__legend-value">{r.value}</strong>
                </div>
              ))}
          </div>

          {hoveredLegend?.total ? (
            <div className="portfolio-country__legend-total">
              <span>Total</span>
              <strong>{hoveredLegend.total}</strong>
            </div>
          ) : null}
        </div>
      </div>

      <div className="portfolio-country__toolbar">
        <SegmentedControl
          options={[
            { value: 'Q', label: 'Q' },
            { value: 'Y', label: 'Y' },
          ]}
          value={granularity}
          onChange={(v) => handleGranularityChange(v as Granularity)}
        />
        <MultiSelect
          label="Países"
          options={countryOptions}
          selected={activeCountries}
          onChange={(next) =>
            handleCountriesChange(next as Set<CarteraCountry>)
          }
        />
        <MultiSelect
          label="Categorías"
          options={categoryOptions}
          selected={activeCategories}
          onChange={(next) =>
            handleCategoriesChange(next as Set<CarteraCategory>)
          }
        />
        <SegmentedControl
          options={[
            { value: 'stacked', label: 'Barras' },
            { value: 'line', label: 'Línea YoY' },
          ]}
          value={chartKind}
          onChange={(v) => handleChartKindChange(v as ChartKind)}
        />
        <SegmentedControl
          options={[
            { value: 'general', label: 'General' },
            { value: 'desglose', label: 'Desglosar' },
          ]}
          value={view}
          onChange={(v) => handleViewChange(v as ViewMode)}
        />
      </div>

      <div className="portfolio-country__body">
        {view === 'general' ? (
          <D3Chart
            rows={filteredRows}
            granularity={granularity}
            chartKind={chartKind}
            activeCategories={activeCategories}
            title="Cartera total"
            onHoverChange={setHoveredLegend}
          />
        ) : (
          <div className="portfolio-country__grid">
            {COUNTRY_ORDER.filter((c) => activeCountries.has(c)).map(
              (country) => (
                <div
                  key={country}
                  className="portfolio-country__grid-card"
                >
                  <D3Chart
                    rows={rowsByCountry[country]}
                    granularity={granularity}
                    chartKind={chartKind}
                    activeCategories={activeCategories}
                    compact
                    title={country}
                    yMaxOverride={chartKind === 'stacked' ? desgloseYMax : undefined}
                    onHoverChange={setHoveredLegend}
                  />
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface D3ChartProps {
  rows: CarteraRow[]
  granularity: Granularity
  chartKind: ChartKind
  activeCategories: Set<CarteraCategory>
  compact?: boolean
  title: string
  yMaxOverride?: number
  onHoverChange?: (next: TooltipState | null) => void
}

function D3Chart({
  rows,
  granularity,
  chartKind,
  activeCategories,
  compact,
  title,
  yMaxOverride,
  onHoverChange,
}: D3ChartProps) {
  const ref = useRef<SVGSVGElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ width: 600, height: 320 })
  const [fullscreen, setFullscreen] = useState(false)
  const [localTip, setLocalTip] = useState<TooltipState | null>(null)
  const [lineTip, setLineTip] = useState<{
    left: number
    top: number
    title: string
    period: string
    rows: TooltipState['rows']
  } | null>(null)
  const notifyHover = useCallback(
    (next: TooltipState | null) => {
      setLocalTip(next)
      onHoverChange?.(next)
    },
    [onHoverChange],
  )

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

  useEffect(() => {
    if (!wrapRef.current) return
    const r = wrapRef.current.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) {
      setSize({ width: r.width, height: r.height })
    }
  }, [fullscreen])

  const data = useMemo(
    () => aggregate(rows, granularity),
    [rows, granularity],
  )

  const categoriesOrder = useMemo(
    () =>
      CARTERA_CATEGORIES.filter((c) => activeCategories.has(c.key)).map(
        (c) => c.key,
      ),
    [activeCategories],
  )

  useEffect(() => {
    if (!wrapRef.current) return
    const el = wrapRef.current
    let rafId: number | null = null
    let pending: { width: number; height: number } | null = null
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width, height } = e.contentRect
        if (width > 0 && height > 0) {
          pending = { width, height }
        }
      }
      if (pending && rafId === null) {
        rafId = requestAnimationFrame(() => {
          rafId = null
          if (pending) {
            setSize(pending)
            pending = null
          }
        })
      }
    })
    obs.observe(el)
    return () => {
      obs.disconnect()
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  useEffect(() => {
    const svg = d3.select(ref.current)
    svg.selectAll('*').remove()
    if (!data.length) return
    if (!ref.current) return

    const { width, height } = size
    const margin = compact
      ? { top: 8, right: 8, bottom: 28, left: 38 }
      : { top: 12, right: 16, bottom: 40, left: 56 }
    const innerW = Math.max(10, width - margin.left - margin.right)
    const innerH = Math.max(10, height - margin.top - margin.bottom)

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3
      .scaleBand<string>()
      .domain(data.map((d) => d.period))
      .range([0, innerW])
      .padding(chartKind === 'line' ? 0.5 : 0.2)

    const localMax =
      d3.max(data, (d) =>
        categoriesOrder.reduce((acc, k) => acc + d[k], 0),
      ) ?? 0
    const maxValue = yMaxOverride ?? localMax

    const y = d3
      .scaleLinear()
      .domain([0, maxValue * 1.08 || 1])
      .nice()
      .range([innerH, 0])

    // Axis X
    const tickEvery = compact
      ? Math.max(1, Math.ceil(data.length / 6))
      : Math.max(1, Math.ceil(data.length / 12))
    const xAxis = d3
      .axisBottom(x)
      .tickValues(data.map((d) => d.period).filter((_, i) => i % tickEvery === 0))
      .tickFormat((d) => formatPeriodLabel(d as string))
      .tickSize(0)
      .tickPadding(8)

    g.append('g')
      .attr('class', 'pc-axis pc-axis--x')
      .attr('transform', `translate(0,${innerH})`)
      .call(xAxis)
      .call((sel) => sel.select('.domain').remove())
      .selectAll('text')
      .style('font-size', compact ? '10px' : '11px')

    // Axis Y
    const yAxis = d3
      .axisLeft(y)
      .ticks(compact ? 4 : 6)
      .tickFormat((d) => d3.format('~s')(d as number))
      .tickSize(-innerW)

    g.append('g')
      .attr('class', 'pc-axis pc-axis--y')
      .call(yAxis)
      .call((sel) => sel.select('.domain').remove())
      .selectAll('text')
      .style('font-size', compact ? '10px' : '11px')

    g.selectAll('.pc-axis--y line')
      .attr('stroke', 'var(--pc-grid)')
      .attr('stroke-dasharray', '2 3')

    if (chartKind === 'stacked') {
      const stackGen = d3
        .stack<AggregatedPoint, CarteraCategory>()
        .keys(categoriesOrder)
        .value((d, k) => d[k])

      const series = stackGen(data)

      const groups = g
        .selectAll('g.pc-series')
        .data(series)
        .join('g')
        .attr('class', 'pc-series')
        .attr('fill', (d) => CATEGORY_COLOR[d.key as CarteraCategory])

      const rects = groups
        .selectAll<SVGRectElement, { v: d3.SeriesPoint<AggregatedPoint>; key: CarteraCategory }>('rect')
        .data((d) => d.map((v) => ({ v, key: d.key as CarteraCategory })))
        .join('rect')
        .attr('class', 'pc-rect')
        .attr('x', (d) => x(d.v.data.period) ?? 0)
        .attr('y', (d) => y(d.v[1]))
        .attr('height', (d) => Math.max(0, y(d.v[0]) - y(d.v[1])))
        .attr('width', x.bandwidth())
        .attr('rx', 1.5)
        .attr('opacity', 1)
        .attr('fill-opacity', (d) =>
          PROJECTED_PERIODS.has(d.v.data.period) ? 0.3 : 1,
        )
        .attr('stroke', (d) =>
          PROJECTED_PERIODS.has(d.v.data.period)
            ? CATEGORY_COLOR[d.key]
            : 'none',
        )
        .attr('stroke-width', (d) =>
          PROJECTED_PERIODS.has(d.v.data.period) ? 1 : 0,
        )
        .attr('stroke-dasharray', (d) =>
          PROJECTED_PERIODS.has(d.v.data.period) ? '3 2' : null,
        )
        .style('cursor', 'pointer')

      const clearHover = () => {
        rects
          .transition('pc-hover')
          .duration(450)
          .ease(d3.easeCubicInOut)
          .attr('opacity', 1)
        notifyHover(null)
      }

      rects
        .on('mousemove', (_event, d) => {
          const hoveredPeriod = d.v.data.period
          rects
            .transition('pc-hover')
            .duration(320)
            .ease(d3.easeCubicInOut)
            .attr('opacity', (r) =>
              r.v.data.period === hoveredPeriod ? 1 : 0.3,
            )
          const point = d.v.data
          const rows: TooltipState['rows'] = CARTERA_CATEGORIES.filter((c) =>
            activeCategories.has(c.key),
          ).map((c) => ({
            key: c.key,
            label: c.label,
            value: `${formatNumber(point[c.key])} USD MM`,
            color: c.color,
          }))
          const total = rows.reduce(
            (acc, _r, i) => acc + point[categoriesOrder[i]],
            0,
          )
          notifyHover({
            title,
            period: point.period,
            rows,
            total: `${formatNumber(total)} USD MM`,
          })
        })
        .on('mouseleave', clearHover)

      const wrap = d3.select(wrapRef.current)
      wrap.on('mouseleave.clear-hover', clearHover)
      wrap.on('pointerleave.clear-hover', clearHover)
    } else {
      const yoyCategories = (
        ['porCobrar', 'porDesembolsar'] as CarteraCategory[]
      ).filter((k) => activeCategories.has(k))

      const step = granularity === 'Q' ? 4 : 1
      interface YoyPoint {
        period: string
        raw: AggregatedPoint
        prev: AggregatedPoint | null
        yoy: Partial<Record<CarteraCategory, number>>
      }
      const yoyData: YoyPoint[] = data.map((d, idx) => {
        const prev = idx >= step ? data[idx - step] : null
        const yoy: Partial<Record<CarteraCategory, number>> = {}
        if (prev) {
          for (const k of yoyCategories) {
            if (prev[k] !== 0) {
              yoy[k] = ((d[k] - prev[k]) / prev[k]) * 100
            }
          }
        }
        return { period: d.period, raw: d, prev, yoy }
      })

      let yMin = 0
      let yMax = 0
      for (const p of yoyData) {
        for (const k of yoyCategories) {
          const v = p.yoy[k]
          if (v === undefined) continue
          if (v < yMin) yMin = v
          if (v > yMax) yMax = v
        }
      }
      const spread = Math.max(Math.abs(yMin), Math.abs(yMax), 5)
      const pad = spread * 0.15

      const yPct = d3
        .scaleLinear()
        .domain([yMin - pad, yMax + pad])
        .nice()
        .range([innerH, 0])

      // Replace USD axis with percentage axis
      g.selectAll('.pc-axis--y').remove()
      const yAxisPct = d3
        .axisLeft(yPct)
        .ticks(compact ? 4 : 6)
        .tickFormat((d) => `${d}%`)
        .tickSize(-innerW)

      g.append('g')
        .attr('class', 'pc-axis pc-axis--y')
        .call(yAxisPct)
        .call((sel) => sel.select('.domain').remove())
        .selectAll('text')
        .style('font-size', compact ? '10px' : '11px')

      g.selectAll('.pc-axis--y line')
        .attr('stroke', 'var(--pc-grid)')
        .attr('stroke-dasharray', '2 3')

      // Zero reference line
      g.append('line')
        .attr('class', 'pc-zero')
        .attr('x1', 0)
        .attr('x2', innerW)
        .attr('y1', yPct(0))
        .attr('y2', yPct(0))
        .attr('stroke', 'var(--pc-line)')
        .attr('stroke-width', 1)
        .attr('opacity', 0.55)

      // Vertical hover guide (hidden by default)
      const hoverGuide = g
        .append('line')
        .attr('class', 'pc-hover-guide')
        .attr('y1', 0)
        .attr('y2', innerH)
        .attr('stroke', 'var(--color-text-muted, #6b7280)')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2 3')
        .attr('opacity', 0)
        .style('pointer-events', 'none')

      // Lines + markers per YoY category
      for (const cat of yoyCategories) {
        const pts = yoyData.filter((p) => p.yoy[cat] !== undefined)
        if (!pts.length) continue

        const catLine = d3
          .line<YoyPoint>()
          .x((d) => (x(d.period) ?? 0) + x.bandwidth() / 2)
          .y((d) => yPct(d.yoy[cat] as number))
          .curve(d3.curveMonotoneX)

        // Split into historical and projected segments
        const firstProjIdx = pts.findIndex((p) =>
          PROJECTED_PERIODS.has(p.period),
        )
        const historicalPts =
          firstProjIdx === -1 ? pts : pts.slice(0, firstProjIdx)
        const projectedPts =
          firstProjIdx === -1
            ? []
            : firstProjIdx > 0
              ? pts.slice(firstProjIdx - 1)
              : pts.slice(firstProjIdx)

        if (historicalPts.length > 1) {
          g.append('path')
            .datum(historicalPts)
            .attr('fill', 'none')
            .attr('stroke', CATEGORY_COLOR[cat])
            .attr('stroke-width', compact ? 1.75 : 2.25)
            .attr('d', catLine as never)
        }

        if (projectedPts.length > 1) {
          g.append('path')
            .datum(projectedPts)
            .attr('fill', 'none')
            .attr('stroke', CATEGORY_COLOR[cat])
            .attr('stroke-width', compact ? 1.75 : 2.25)
            .attr('stroke-dasharray', '4 3')
            .attr('d', catLine as never)
        }

        // Markers — hidden by default, shown on hover
        g.selectAll(`circle.pc-pt-${cat}`)
          .data(pts)
          .join('circle')
          .attr('class', `pc-pt pc-pt-${cat}`)
          .attr('data-period', (d) => d.period)
          .attr('cx', (d) => (x(d.period) ?? 0) + x.bandwidth() / 2)
          .attr('cy', (d) => yPct(d.yoy[cat] as number))
          .attr('r', compact ? 3 : 4)
          .attr('fill', CATEGORY_COLOR[cat])
          .attr('stroke', 'var(--color-surface, #fff)')
          .attr('stroke-width', 1.5)
          .attr('opacity', 0)
          .style('pointer-events', 'none')
      }

      const allPts = g.selectAll<SVGCircleElement, YoyPoint>('circle.pc-pt')

      const clearLineHover = () => {
        hoverGuide.attr('opacity', 0)
        allPts.attr('opacity', 0).attr('r', compact ? 3 : 4)
        notifyHover(null)
        setLineTip(null)
      }

      // Hover capture rects — show YoY per category in tooltip
      g.selectAll('rect.pc-hit')
        .data(yoyData)
        .join('rect')
        .attr('class', 'pc-hit')
        .attr('x', (d) => x(d.period) ?? 0)
        .attr('y', 0)
        .attr('width', x.bandwidth())
        .attr('height', innerH)
        .attr('fill', 'transparent')
        .style('cursor', 'pointer')
        .on('mousemove', (_event, d) => {
          const cx = (x(d.period) ?? 0) + x.bandwidth() / 2
          hoverGuide
            .attr('opacity', 1)
            .attr('x1', cx)
            .attr('x2', cx)

          allPts
            .attr('opacity', (c) => (c.period === d.period ? 1 : 0))
            .attr('r', (c) =>
              c.period === d.period ? (compact ? 5 : 6) : compact ? 3 : 4,
            )

          const rows: TooltipState['rows'] = yoyCategories
            .filter((k) => d.yoy[k] !== undefined)
            .map((k) => {
              const cat = CARTERA_CATEGORIES.find((c) => c.key === k)
              const v = d.yoy[k] as number
              return {
                key: k,
                label: cat ? cat.label : k,
                value: `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`,
                color: cat ? cat.color : 'var(--pc-line)',
              }
            })
          if (!rows.length) {
            rows.push({
              key: 'yoy-empty',
              label: 'YoY',
              value: 'Sin período previo',
              color: 'var(--pc-line)',
            })
          }
          notifyHover({
            title,
            period: d.period,
            rows,
          })

          // Local tooltip positioned below the lowest marker
          const yValues = yoyCategories
            .map((k) => d.yoy[k])
            .filter((v): v is number => v !== undefined)
            .map((v) => yPct(v))
          const maxY = yValues.length ? Math.max(...yValues) : innerH / 2
          setLineTip({
            left: margin.left + cx,
            top: margin.top + maxY + 14,
            title,
            period: d.period,
            rows,
          })
        })
        .on('mouseleave', clearLineHover)

      const wrap = d3.select(wrapRef.current)
      wrap.on('mouseleave.clear-hover', clearLineHover)
      wrap.on('pointerleave.clear-hover', clearLineHover)
    }

    const svgEl = ref.current
    const wrapEl = wrapRef.current
    return () => {
      if (svgEl) d3.select(svgEl).selectAll('*').interrupt()
      if (wrapEl) {
        const w = d3.select(wrapEl)
        w.on('mouseleave.clear-hover', null)
        w.on('pointerleave.clear-hover', null)
      }
    }
  }, [
    data,
    size,
    chartKind,
    categoriesOrder,
    compact,
    activeCategories,
    granularity,
    title,
    yMaxOverride,
    notifyHover,
  ])

  useEffect(() => () => notifyHover(null), [notifyHover])

  useEffect(() => {
    setLineTip(null)
  }, [chartKind, data, activeCategories])

  const chartNode = (
    <div
      className={`portfolio-country__chart ${
        compact && !fullscreen ? 'is-compact' : ''
      } ${fullscreen ? 'portfolio-country__chart--fullscreen' : ''}`}
      onMouseLeave={() => notifyHover(null)}
    >
      <header
        className="portfolio-country__chart-bar"
        aria-live="polite"
      >
        <span className="portfolio-country__chart-bar-title">{title}</span>
        <button
          type="button"
          className="portfolio-country__fs-btn"
          onClick={() => setFullscreen((f) => !f)}
          aria-label={fullscreen ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
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
      </header>
      <div className="portfolio-country__chart-surface" ref={wrapRef}>
        <svg ref={ref} width="100%" height="100%" />
        {chartKind === 'line' && lineTip && (!compact || fullscreen) && (
          <div
            className="portfolio-country__line-tip"
            role="status"
            aria-live="polite"
            style={{ left: lineTip.left, top: lineTip.top }}
          >
            <div className="portfolio-country__line-tip-period">
              {formatPeriodLabel(lineTip.period)}
            </div>
            {lineTip.rows.map((r) => (
              <div key={r.key} className="portfolio-country__line-tip-row">
                <span
                  className="portfolio-country__line-tip-swatch"
                  style={{ background: r.color }}
                />
                <span className="portfolio-country__line-tip-label">
                  {r.label}
                </span>
                <strong>{r.value}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
      {fullscreen && localTip && (
        <div className="portfolio-country__fs-tip" role="status" aria-live="polite">
          <div className="portfolio-country__fs-tip-title">
            {localTip.title} · {localTip.period}
          </div>
          <div className="portfolio-country__fs-tip-rows">
            {localTip.rows.map((r) => (
              <span key={r.key} className="portfolio-country__fs-tip-row">
                <span
                  className="portfolio-country__fs-tip-swatch"
                  style={{ background: r.color }}
                />
                <span className="portfolio-country__fs-tip-label">{r.label}</span>
                <strong>{r.value}</strong>
              </span>
            ))}
            {localTip.total && (
              <span className="portfolio-country__fs-tip-row portfolio-country__fs-tip-row--total">
                <span className="portfolio-country__fs-tip-label">Total</span>
                <strong>{localTip.total}</strong>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )

  return fullscreen ? createPortal(chartNode, document.body) : chartNode
}
