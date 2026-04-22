import type { TopicGroup } from '@/slides/ContentsSlide'

export interface SlideConfig {
  id: string
  type: string
  variant: 'hero' | 'navigation' | 'content' | 'grid' | 'section'
}

export const slides: SlideConfig[] = [
  // 1. Home
  { id: 'home', type: 'home', variant: 'hero' },
  // 2. Navigation
  { id: 'navigation-contenidos', type: 'contents', variant: 'navigation' },

  // ── Situación Financiera ──
  { id: 'section-situacion-financiera', type: 'section-title', variant: 'section' },
  { id: 'cambios-activos-pasivos', type: 'cambios-activos-pasivos', variant: 'content' },
  { id: 'generacion-ingresos', type: 'generacion-ingresos', variant: 'content' },
  { id: 'estado-resultados', type: 'estado-resultados', variant: 'content' },

  // ── Cartera ──
  { id: 'section-cartera', type: 'section-title', variant: 'section' },
  { id: 'cartera-estado-pais', type: 'portfolio-country', variant: 'grid' },
  { id: 'proporciones-por-pais', type: 'donut-matrix', variant: 'grid' },
  { id: 'capacidad-prestable-riesgo', type: 'risk-capacity', variant: 'grid' },
  { id: 'vigencia-activacion', type: 'vigencia', variant: 'content' },
  { id: 'analisis-tasas', type: 'rate-analysis', variant: 'content' },
  { id: 'flujos-pais', type: 'flujos-netos', variant: 'grid' },
  { id: 'proyecciones-desembolsos', type: 'debt-sources-proyecciones', variant: 'content' },
  { id: 'aprobaciones-y-cancelaciones', type: 'line-cards-aprobaciones', variant: 'grid' },

  // ── Monitoreo de Riesgos ──
  { id: 'section-monitoreo', type: 'section-title', variant: 'section' },
  { id: 'exposicion-cartera-riesgo', type: 'dual-charts', variant: 'content' },
  { id: 'exposicion-cartera-riesgo-cards', type: 'country-exposure', variant: 'grid' },
  { id: 'tablero-liquidez-4-cards', type: 'line-cards-liquidez', variant: 'grid' },
  { id: 'prevision-perdida-cartera-prestamos', type: 'prevision', variant: 'content' },
  { id: 'adecuacion-del-capital', type: 'capital-adequacy', variant: 'grid' },
  { id: 'slide-14', type: 'debt-authorization', variant: 'content' },

  // ── Inversiones ──
  { id: 'section-inversiones', type: 'section-title', variant: 'section' },
  { id: 'cartera-inversiones-fonplata', type: 'investment-fonplata', variant: 'content' },
  { id: 'slide-7', type: 'liquidity-activity', variant: 'content' },
  { id: 'cartera-inversiones-focem', type: 'investment-focem', variant: 'content' },

  // ── Endeudamiento ──
  { id: 'section-endeudamiento', type: 'section-title', variant: 'section' },
  { id: 'deuda-por-fuente', type: 'debt-sources', variant: 'content' },
  { id: 'analisis-endeudamiento', type: 'debt-analysis', variant: 'content' },
  { id: 'perfil-amortizacion', type: 'amortization', variant: 'content' },
]

export const navigationTopics: TopicGroup[] = [
  {
    id: 'section-situacion-financiera',
    tag: '01',
    title: 'Situación Financiera',
    description: 'Balance, ingresos y resultados',
    items: [
      { id: 'cambios-activos-pasivos', label: 'Cambios en activos y pasivos financieros' },
      { id: 'generacion-ingresos', label: '¿Cómo se generan los ingresos?' },
      { id: 'estado-resultados', label: 'Estado de Resultados' },
    ],
  },
  {
    id: 'section-cartera',
    tag: '02',
    title: 'Cartera',
    description: 'Préstamos, proyecciones y activaciones',
    items: [
      { id: 'cartera-estado-pais', label: 'Evolución y Proyecciones' },
      { id: 'proporciones-por-pais', label: 'País y Categorías' },
      { id: 'capacidad-prestable-riesgo', label: 'Capacidad Prestable por País' },
      { id: 'vigencia-activacion', label: 'Proyección de Cartera' },
      { id: 'analisis-tasas', label: 'Tasas Activas' },
      { id: 'flujos-pais', label: 'Flujo Neto por País' },
      { id: 'proyecciones-desembolsos', label: 'Proyecciones de Desembolsos' },
      { id: 'aprobaciones-y-cancelaciones', label: 'Aprobaciones y Cancelaciones' },
    ],
  },
  {
    id: 'section-monitoreo',
    tag: '03',
    title: 'Monitoreo de Riesgos y Política Financiera',
    description: 'Exposición, liquidez, capital y previsión',
    items: [
      { id: 'exposicion-cartera-riesgo', label: 'Exposición de Cartera al Riesgo' },
      { id: 'exposicion-cartera-riesgo-cards', label: 'Exposición por País' },
      { id: 'tablero-liquidez-4-cards', label: 'Riesgo de Liquidez' },
      { id: 'prevision-perdida-cartera-prestamos', label: 'Previsión de Pérdidas' },
      { id: 'adecuacion-del-capital', label: 'Adecuación del Capital' },
      { id: 'slide-14', label: 'Monitoreo del Endeudamiento' },
    ],
  },
  {
    id: 'section-inversiones',
    tag: '04',
    title: 'Inversiones',
    description: 'Portafolios FONPLATA, FOCEM y liquidez',
    items: [
      { id: 'cartera-inversiones-fonplata', label: 'Cartera FONPLATA' },
      { id: 'slide-7', label: 'Actividad del Trimestre' },
      { id: 'cartera-inversiones-focem', label: 'Cartera FOCEM' },
    ],
  },
  {
    id: 'section-endeudamiento',
    tag: '05',
    title: 'Endeudamiento',
    description: 'Tasas pasivas, instrumentos y emisiones',
    items: [
      { id: 'deuda-por-fuente', label: 'Endeudamiento por Instrumento' },
      { id: 'analisis-endeudamiento', label: 'Tasas Pasivas' },
      { id: 'perfil-amortizacion', label: 'Evolución y Proyecciones' },
    ],
  },
]
