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
  { year: 2026, fonplata: 152 },
]

const SP_COVERAGE_DATA: SpCoveragePoint[] = [
  { year: 2021, fonplata: 1.5 },
  { year: 2022, fonplata: 1.0 },
  { year: 2023, fonplata: 1.0 },
  { year: 2024, fonplata: 1.3 },
  { year: 2025, fonplata: 1.6 },
  { year: 2026, fonplata: 1.52 },
]

const ASSET_STRUCTURE_DATA: AssetPoint[] = [
  { year: 2021, ratio: 29.3 },
  { year: 2022, ratio: 23.8 },
  { year: 2023, ratio: 27.7 },
  { year: 2024, ratio: 24.2 },
  { year: 2025, ratio: 35.6 },
  { year: 2026, ratio: 34.9 },
]

const LIQUIDITY_DATA: LiquidityPoint[] = [
  { date: '31/12/25', minimaRequerida: 726, liquidez: 1367 },
  { date: '31/1/26', minimaRequerida: 781, liquidez: 1396 },
  { date: '28/2/26', minimaRequerida: 791, liquidez: 1368 },
  { date: '31/3/26', minimaRequerida: 779, liquidez: 1328 },
  { date: '30/4/26', minimaRequerida: 784, liquidez: 1283 },
  { date: '31/5/26', minimaRequerida: 847, liquidez: 1276 },
  { date: '30/6/26', minimaRequerida: 884, liquidez: 1232 },
  { date: '31/7/26', minimaRequerida: 860, liquidez: 1174 },
  { date: '31/8/26', minimaRequerida: 904, liquidez: 1180 },
  { date: '30/9/26', minimaRequerida: 694, liquidez: 930 },
  { date: '31/10/26', minimaRequerida: 637, liquidez: 896 },
  { date: '30/11/26', minimaRequerida: 837, liquidez: 867 },
  { date: '31/12/26', minimaRequerida: 837, liquidez: 826 },
]

export function LiquidityDashboardSlide({
  eyebrow,
  title,
  description,
  cards,
  columns = 2,
}: LiquidityDashboardSlideProps) {
  const [first, second, third, fourth, ...rest] = cards

  return (
    <div className="line-cards-slide">
      <div className="line-cards-slide__header">
        <TextCard
          eyebrow={eyebrow}
          title={title}
          description={description}
          variant="default"
        />
      </div>
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
              <LiquidityCoverageChart data={COVERAGE_DATA} />
            </div>
          </Card>
        )}
        {third && (
          <Card padding="md" className="liq-dashboard__card">
            <header className="liq-dashboard__card-header">
              <span className="liq-dashboard__card-title">{third.title}</span>
            </header>
            <div className="liq-dashboard__card-body">
              <LiquidityCoverageSpChart data={SP_COVERAGE_DATA} />
            </div>
          </Card>
        )}
        {fourth && (
          <Card padding="md" className="liq-dashboard__card">
            <header className="liq-dashboard__card-header">
              <span className="liq-dashboard__card-title">{fourth.title}</span>
            </header>
            <div className="liq-dashboard__card-body">
              <AssetStructureChart data={ASSET_STRUCTURE_DATA} />
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
