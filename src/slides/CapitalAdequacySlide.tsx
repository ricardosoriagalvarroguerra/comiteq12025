import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import {
  CapitalAdequacyCombinedChart,
  type CapitalAdequacyPoint,
} from '@/components/charts/CapitalAdequacyCombinedChart'
import {
  RacSpChart,
  type RacPoint,
} from '@/components/charts/RacSpChart'
import './CapitalAdequacySlide.css'

const RAC_SP_DATA: RacPoint[] = [
  { year: 2020, rac: 26.4 },
  { year: 2021, rac: 23.0 },
  { year: 2022, rac: 21.0 },
  { year: 2023, rac: 24.1 },
  { year: 2024, rac: 21.6 },
  { year: 2025, rac: 38.2 },
  { year: 2026, rac: 35.5, projected: true },
  { year: 2027, rac: 34.0, projected: true },
]

const CAPITAL_ADEQUACY_DATA: CapitalAdequacyPoint[] = [
  { period: '12/20', ratio: 80.19, activosAjustados: 1388.467, patrimonio: 1113.397 },
  { period: '12/21', ratio: 57.71, activosAjustados: 2088.083, patrimonio: 1205.006 },
  { period: '12/22', ratio: 53.14, activosAjustados: 2500.855, patrimonio: 1328.891 },
  { period: '12/23', ratio: 50.76, activosAjustados: 3052.712, patrimonio: 1549.550 },
  { period: '12/24', ratio: 47.43, activosAjustados: 3690.107, patrimonio: 1750.171 },
  { period: '12/25', ratio: 51.0, activosAjustados: 3628.435, patrimonio: 1852.300 },
  { period: '03/26', ratio: 51.9, activosAjustados: 3607.276, patrimonio: 1871.128 },
  { period: '12/26 (e)', ratio: 46.3, activosAjustados: 4220.241, patrimonio: 1954.854, projected: true },
  { period: '12/27 (e)', ratio: 45.0, activosAjustados: 4764.471, patrimonio: 2141.812, projected: true },
]

interface CapitalAdequacySlideProps {
  eyebrow?: string
  title: string
  description?: string
  policyHighlights?: string[]
  detailTitle?: string
  detailDescription?: ReactNode
}

export function CapitalAdequacySlide({
  title,
  description,
  policyHighlights,
  detailTitle,
  detailDescription,
}: CapitalAdequacySlideProps) {
  return (
    <div className="capital-adequacy">
      <div className="capital-adequacy__top">
        <div className="capital-adequacy__chart-main">
          <Card padding="md" className="capital-adequacy__combo-card">
            <CapitalAdequacyCombinedChart
              data={CAPITAL_ADEQUACY_DATA}
              title={title}
            />
          </Card>
        </div>
        <div className="capital-adequacy__policy">
          <Card padding="md" className="capital-adequacy__policy-card">
            <span className="capital-adequacy__policy-label">Política financiera</span>
            <p className="capital-adequacy__policy-text">{description}</p>
            {policyHighlights && (
              <ul className="capital-adequacy__policy-list">
                {policyHighlights.map((h, i) => (
                  <li key={i} className="capital-adequacy__policy-item">{h}</li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
      <div className="capital-adequacy__bottom">
        <div className="capital-adequacy__chart-detail">
          <Card padding="md" className="capital-adequacy__combo-card">
            <div className="capital-adequacy__detail-header">
              <span className="capital-adequacy__detail-title">
                {detailTitle ?? 'Ratio de Capital Ajustado por Riesgo (RAC) S&P'}
              </span>
            </div>
            <RacSpChart data={RAC_SP_DATA} />
          </Card>
        </div>
        <div className="capital-adequacy__detail-text">
          <Card padding="md" className="capital-adequacy__detail-card">
            <span className="capital-adequacy__detail-label">Detalle</span>
            <div className="capital-adequacy__detail-desc">
              {detailDescription ?? 'Niveles de adecuación del capital según metodología S&P y proyecciones.'}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
