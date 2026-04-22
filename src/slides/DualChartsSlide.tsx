import type { ReactNode } from 'react'
import { TextCard } from '@/components/cards/TextCard'
import { Card } from '@/components/ui/Card'
import { ChartPlaceholder, type ChartType } from '@/components/cards/ChartPlaceholder'
import { CapacityLimitChart } from '@/components/charts/CapacityLimitChart'
import { DisponibleVsEtapasChart } from '@/components/charts/DisponibleVsEtapasChart'
import './DualChartsSlide.css'

interface DualChartsSlideProps {
  eyebrow?: string
  title: string
  description?: string
  highlights?: string[]
  chart1: { title: string; chartType: ChartType; unit?: string; component?: 'capacity-limit' }
  chart2: { title: string; chartType: ChartType; unit?: string; component?: 'disponible-vs-etapas' }
}

function renderChart2(chart2: DualChartsSlideProps['chart2']): ReactNode {
  if (chart2.component === 'disponible-vs-etapas') {
    return (
      <Card
        padding="md"
        className="dual-charts__chart dual-charts__chart--secondary dual-charts__chart--custom"
      >
        <DisponibleVsEtapasChart title={chart2.title} />
      </Card>
    )
  }
  return (
    <ChartPlaceholder
      title={chart2.title}
      chartType={chart2.chartType}
      unit={chart2.unit}
      className="dual-charts__chart dual-charts__chart--secondary"
    />
  )
}

function renderChart1(chart1: DualChartsSlideProps['chart1']): ReactNode {
  if (chart1.component === 'capacity-limit') {
    return (
      <Card
        padding="md"
        className="dual-charts__chart dual-charts__chart--primary dual-charts__chart--custom"
      >
        <CapacityLimitChart title={chart1.title} />
      </Card>
    )
  }
  return (
    <ChartPlaceholder
      title={chart1.title}
      chartType={chart1.chartType}
      unit={chart1.unit}
      className="dual-charts__chart dual-charts__chart--primary"
    />
  )
}

export function DualChartsSlide({
  eyebrow,
  title,
  description,
  highlights,
  chart1,
  chart2,
}: DualChartsSlideProps) {
  return (
    <div className="dual-charts">
      <div className="dual-charts__top">
        <div className="dual-charts__text">
          <TextCard
            eyebrow={eyebrow}
            title={title}
            description={description}
            highlights={highlights}
          />
        </div>
        {renderChart2(chart2)}
      </div>
      {renderChart1(chart1)}
    </div>
  )
}
