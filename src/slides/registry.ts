import type { ComponentType } from 'react'

import { HomeSlide } from './HomeSlide'
import { ContentsSlide } from './ContentsSlide'
import { SectionTitleSlide } from './SectionTitleSlide'
import { PortfolioCountrySlide } from './PortfolioCountrySlide'
import { DonutMatrixSlide } from './DonutMatrixSlide'
import { RiskCapacitySlide } from './RiskCapacitySlide'
import { VigenciaSlide } from './VigenciaSlide'
import { LiquidityActivitySlide } from './LiquidityActivitySlide'
import { RateAnalysisSlide } from './RateAnalysisSlide'
import { DebtAnalysisSlide } from './DebtAnalysisSlide'
import { DebtSourcesSlide } from './DebtSourcesSlide'
import { ProyeccionesDesembolsosSlide } from './ProyeccionesDesembolsosSlide'
import { ApprovalsByCountrySlide } from './ApprovalsByCountrySlide'
import { AmortizationSlide } from './AmortizationSlide'
import { EmissionsSlide } from './EmissionsSlide'
import { FonplataInvestmentSlide } from './FonplataInvestmentSlide'
import { FocemPortfolioSlide } from './FocemPortfolioSlide'
import { TextTableSlide } from './TextTableSlide'
import { LineCardsSlide } from './LineCardsSlide'
import { LiquidityDashboardSlide } from './LiquidityDashboardSlide'
import { CambiosActivosPasivosSlide } from './CambiosActivosPasivosSlide'
import { EstadoResultadosSlide } from './EstadoResultadosSlide'
import { GeneracionIngresosSlide } from './GeneracionIngresosSlide'
import { CapitalAdequacySlide } from './CapitalAdequacySlide'
import { DualChartsSlide } from './DualChartsSlide'
import { DebtAuthorizationSlide } from './DebtAuthorizationSlide'
import { PrevisionSlide } from './PrevisionSlide'
import { PlaceholderSlide } from './PlaceholderSlide'
import { FlujosPorPaisSlide } from './FlujosPorPaisSlide'
import { CountryExposureSlide } from './CountryExposureSlide'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const slideRegistry: Record<string, ComponentType<any>> = {
  'home': HomeSlide,
  'contents': ContentsSlide,
  'section-title': SectionTitleSlide,
  'portfolio-country': PortfolioCountrySlide,
  'donut-matrix': DonutMatrixSlide,
  'risk-capacity': RiskCapacitySlide,
  'vigencia': VigenciaSlide,
  'investment-fonplata': FonplataInvestmentSlide,
  'liquidity-activity': LiquidityActivitySlide,
  'investment-focem': FocemPortfolioSlide,
  'rate-analysis': RateAnalysisSlide,
  'debt-analysis': DebtAnalysisSlide,
  'debt-sources': DebtSourcesSlide,
  'debt-sources-proyecciones': ProyeccionesDesembolsosSlide,
  'amortization': AmortizationSlide,
  'emissions': EmissionsSlide,
  'text-table': TextTableSlide,
  'line-cards': LineCardsSlide,
  'line-cards-aprobaciones': ApprovalsByCountrySlide,
  'line-cards-riesgo': LineCardsSlide,
  'country-exposure': CountryExposureSlide,
  'line-cards-liquidez': LiquidityDashboardSlide,
  'capital-adequacy': CapitalAdequacySlide,
  'dual-charts': DualChartsSlide,
  'debt-authorization': DebtAuthorizationSlide,
  'prevision': PrevisionSlide,
  'placeholder': PlaceholderSlide,
  'flujos-netos': FlujosPorPaisSlide,
  'cambios-activos-pasivos': CambiosActivosPasivosSlide,
  'estado-resultados': EstadoResultadosSlide,
  'generacion-ingresos': GeneracionIngresosSlide,
}
