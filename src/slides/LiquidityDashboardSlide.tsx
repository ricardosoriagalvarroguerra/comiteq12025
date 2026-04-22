import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChartPlaceholder, type ChartType, type ChartSeries } from '@/components/cards/ChartPlaceholder'
import { Card } from '@/components/ui/Card'
import { TextCard } from '@/components/cards/TextCard'
import {
  LiquidityMonitoringChart,
  type LiquidityPoint,
} from '@/components/charts/LiquidityMonitoringChart'
import {
  LiquidityCoverageChart,
  type CoveragePoint,
} from '@/components/charts/LiquidityCoverageChart'
import {
  LiquidityCoverageSpChart,
  type SpCoveragePoint,
} from '@/components/charts/LiquidityCoverageSpChart'
import {
  AssetStructureChart,
  type AssetPoint,
} from '@/components/charts/AssetStructureChart'
import './LineCardsSlide.css'
import './LiquidityDashboardSlide.css'

interface LiquidityCard {
  id: string
  title: string
  subtitle?: string
  chartType?: ChartType
  data?: { labels?: string[]; series: ChartSeries[] }
}

interface LiquidityDashboardSlideProps {
  eyebrow?: string
  title: string
  description?: string
  cards: LiquidityCard[]
  columns?: 2 | 3 | 4 | 6
}

const COVERAGE_DATA: CoveragePoint[] = [
  { year: 2021, fonplata: 162 },
  { year: 2022, fonplata: 150 },
  { year: 2023, fonplata: 103 },
  { year: 2024, fonplata: 160 },
  { year: 2025, fonplata: 159 },
  { year: 2026, fonplata: 168, projected: true },
  { year: 2027, fonplata: 192, projected: true },
]

const SP_COVERAGE_DATA: SpCoveragePoint[] = [
  { year: 2021, fonplata: 1.5 },
  { year: 2022, fonplata: 1.0 },
  { year: 2023, fonplata: 1.0 },
  { year: 2024, fonplata: 1.3 },
  { year: 2025, fonplata: 1.6 },
  { year: 2026, fonplata: 1.63, projected: true },
  { year: 2027, fonplata: 1.60, projected: true },
]

const ASSET_STRUCTURE_DATA: AssetPoint[] = [
  { year: 2021, ratio: 29.3 },
  { year: 2022, ratio: 23.8 },
  { year: 2023, ratio: 27.7 },
  { year: 2024, ratio: 24.2 },
  { year: 2025, ratio: 35.6 },
  { year: 2026, ratio: 36.5, projected: true },
  { year: 2027, ratio: 36.4, projected: true },
]

// DPP Promedio overrides projections for 2026/2027 only
const DPP_COVERAGE_DATA: CoveragePoint[] = COVERAGE_DATA.map((d) =>
  d.year === 2026 ? { ...d, fonplata: 134 } : d.year === 2027 ? { ...d, fonplata: 153 } : d,
)
const DPP_SP_COVERAGE_DATA: SpCoveragePoint[] = SP_COVERAGE_DATA.map((d) =>
  d.year === 2026 ? { ...d, fonplata: 1.34 } : d.year === 2027 ? { ...d, fonplata: 1.34 } : d,
)
const DPP_ASSET_STRUCTURE_DATA: AssetPoint[] = ASSET_STRUCTURE_DATA.map((d) =>
  d.year === 2026 ? { ...d, ratio: 32.2 } : d.year === 2027 ? { ...d, ratio: 30.5 } : d,
)

const LIQUIDITY_DATA: LiquidityPoint[] = [
  { date: 'mar-26', minimaRequerida: 632.41, liquidez: 1387.89 },
  { date: 'abr-26', minimaRequerida: 674.09, liquidez: 1378.78 },
  { date: 'may-26', minimaRequerida: 682.41, liquidez: 1513.11 },
  { date: 'jun-26', minimaRequerida: 745.80, liquidez: 1590.64 },
  { date: 'jul-26', minimaRequerida: 745.37, liquidez: 1551.70 },
  { date: 'ago-26', minimaRequerida: 791.22, liquidez: 1555.01 },
  { date: 'sept-26', minimaRequerida: 569.85, liquidez: 1290.26 },
  { date: 'oct-26', minimaRequerida: 537.91, liquidez: 1253.11 },
  { date: 'nov-26', minimaRequerida: 750.12, liquidez: 1211.94 },
  { date: 'dic-26', minimaRequerida: 792.24, liquidez: 1191.62 },
  { date: 'ene-27', minimaRequerida: 816.78, liquidez: 1192.08 },
  { date: 'feb-27', minimaRequerida: 876.45, liquidez: 1186.50 },
  { date: 'mar-27', minimaRequerida: 944.07, liquidez: 1203.25 },
  { date: 'abr-27', minimaRequerida: 930.67, liquidez: 1151.41 },
  { date: 'may-27', minimaRequerida: 914.60, liquidez: 1079.32 },
  { date: 'jun-27', minimaRequerida: 860.51, liquidez: 995.35 },
  { date: 'jul-27', minimaRequerida: 873.25, liquidez: 958.74 },
  { date: 'ago-27', minimaRequerida: 882.55, liquidez: 918.10 },
  { date: 'sept-27', minimaRequerida: 915.06, liquidez: 876.63 },
  { date: 'oct-27', minimaRequerida: 889.28, liquidez: 907.98 },
  { date: 'nov-27', minimaRequerida: 719.12, liquidez: 656.50 },
  { date: 'dic-27', minimaRequerida: 874.60, liquidez: 592.48 },
]

export function LiquidityDashboardSlide({
  eyebrow,
  title,
  description,
  cards,
  columns = 2,
}: LiquidityDashboardSlideProps) {
  const [first, second, third, fourth, ...rest] = cards
  const [showInfo, setShowInfo] = useState(false)
  const [scenario, setScenario] = useState<'vpo' | 'dpp'>('vpo')
  const [scenarioOpen, setScenarioOpen] = useState(false)

  useEffect(() => {
    if (!scenarioOpen) return
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.liq-dashboard__scenario')) {
        setScenarioOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [scenarioOpen])

  const scenarioOptions: Array<{ value: 'vpo' | 'dpp'; label: string }> = [
    { value: 'vpo', label: 'Escenario VPO' },
    { value: 'dpp', label: 'Escenario DPP Promedio' },
  ]
  const currentScenario = scenarioOptions.find((o) => o.value === scenario)!

  useEffect(() => {
    if (!showInfo) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowInfo(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [showInfo])

  return (
    <div className="line-cards-slide">
      <div className="line-cards-slide__header liq-dashboard__header">
        <TextCard
          eyebrow={eyebrow}
          title={title}
          description={description}
          variant="default"
        />
        <div className="liq-dashboard__scenario">
          <button
            type="button"
            className="liq-dashboard__scenario-btn"
            onClick={() => setScenarioOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={scenarioOpen}
          >
            <span>{currentScenario.label}</span>
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>
          {scenarioOpen && (
            <ul className="liq-dashboard__scenario-menu" role="listbox">
              {scenarioOptions.map((o) => (
                <li key={o.value} role="option" aria-selected={o.value === scenario}>
                  <button
                    type="button"
                    className={`liq-dashboard__scenario-option ${o.value === scenario ? 'liq-dashboard__scenario-option--active' : ''}`}
                    onClick={() => {
                      setScenario(o.value)
                      setScenarioOpen(false)
                    }}
                  >
                    {o.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          className="liq-dashboard__info-btn"
          onClick={() => setShowInfo(true)}
          aria-label="Información sobre las proyecciones"
          title="Supuestos de proyecciones"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="6.5" />
            <path d="M8 11V7.5" />
            <circle cx="8" cy="5" r="0.6" fill="currentColor" />
          </svg>
        </button>
      </div>
      {showInfo &&
        createPortal(
          <div
            className="liq-dashboard__info-overlay"
            onClick={() => setShowInfo(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="liq-dashboard__info-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="liq-dashboard__info-header">
                <span className="liq-dashboard__info-eyebrow">Supuestos</span>
                <button
                  type="button"
                  className="liq-dashboard__info-close"
                  onClick={() => setShowInfo(false)}
                  aria-label="Cerrar"
                  title="Cerrar"
                >
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
              </div>
              <p className="liq-dashboard__info-text">
                Las proyecciones de liquidez para 2026 y 2027 consideran como
                supuesto de desembolsos las proyecciones de la Vicepresidencia
                de Operaciones:{' '}
                <strong>USD 543M en 2026</strong>,{' '}
                <strong>USD 658M en 2027</strong> y{' '}
                <strong>USD 766M en 2028</strong>.
              </p>
            </div>
          </div>,
          document.body,
        )}
      <div
        className="line-cards-slide__grid"
        style={{ '--card-columns': columns } as React.CSSProperties}
      >
        {first && (
          <Card padding="md" className="liq-dashboard__card">
            <header className="liq-dashboard__card-header">
              <span className="liq-dashboard__card-title">{first.title}</span>
            </header>
            <div className="liq-dashboard__card-body">
              <LiquidityMonitoringChart data={LIQUIDITY_DATA} unit="USD MM" />
            </div>
          </Card>
        )}
        {second && (
          <Card padding="md" className="liq-dashboard__card">
            <header className="liq-dashboard__card-header">
              <span className="liq-dashboard__card-title">{second.title}</span>
            </header>
            <div className="liq-dashboard__card-body">
              <LiquidityCoverageChart data={scenario === 'dpp' ? DPP_COVERAGE_DATA : COVERAGE_DATA} />
            </div>
          </Card>
        )}
        {third && (
          <Card padding="md" className="liq-dashboard__card">
            <header className="liq-dashboard__card-header">
              <span className="liq-dashboard__card-title">{third.title}</span>
            </header>
            <div className="liq-dashboard__card-body">
              <LiquidityCoverageSpChart data={scenario === 'dpp' ? DPP_SP_COVERAGE_DATA : SP_COVERAGE_DATA} />
            </div>
          </Card>
        )}
        {fourth && (
          <Card padding="md" className="liq-dashboard__card">
            <header className="liq-dashboard__card-header">
              <span className="liq-dashboard__card-title">{fourth.title}</span>
            </header>
            <div className="liq-dashboard__card-body">
              <AssetStructureChart data={scenario === 'dpp' ? DPP_ASSET_STRUCTURE_DATA : ASSET_STRUCTURE_DATA} />
            </div>
          </Card>
        )}
        {rest.map((card) => (
          <ChartPlaceholder
            key={card.id}
            title={card.title}
            subtitle={card.subtitle}
            chartType={card.chartType ?? 'line'}
            data={card.data}
          />
        ))}
      </div>
    </div>
  )
}
