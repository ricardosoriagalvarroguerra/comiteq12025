import { useMemo } from 'react'
import { PresentationProvider } from '@/context/PresentationProvider'
import { useSlideNavigation } from '@/hooks/useSlideNavigation'
import { useTheme } from '@/hooks/useTheme'
import { AppShell } from '@/layouts/AppShell'
import { Deck } from '@/layouts/Deck'
import { SlideWrapper } from '@/slides/SlideWrapper'
import { SlideControls } from '@/components/navigation/SlideControls'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { slideRegistry } from '@/slides/registry'
import { slides, navigationTopics } from '@/data/slides'
import { CARTERA_COUNTRIES } from '@/data/carteraPorPais'

// ── Tasas activas (Slide 12) ──
const tasasLabels = [
  'ene-24', 'feb-24', 'mar-24', 'abr-24', 'may-24', 'jun-24',
  'jul-24', 'ago-24', 'sept-24', 'oct-24', 'nov-24', 'dic-24',
  'ene-25', 'feb-25', 'mar-25', 'abr-25', 'may-25', 'jun-25',
  'jul-25', 'ago-25', 'sept-25', 'oct-25', 'nov-25', 'dic-25',
  'ene-26', 'feb-26', 'mar-26',
]
const sobMargen = [
  2.58, 2.56, 2.51, 2.51, 2.51, 2.51, 2.51, 2.51, 2.49, 2.47, 2.46, 2.45,
  2.43, 2.42, 2.42, 2.42, 2.41, 2.41, 2.41, 2.40, 2.39, 2.39, 2.39, 2.38,
  2.37, 2.36, 2.35,
]
const sobFocom = [
  0.29, 0.27, 0.31, 0.31, 0.31, 0.31, 0.31, 0.30, 0.31, 0.34, 0.35, 0.35,
  0.36, 0.37, 0.37, 0.38, 0.38, 0.38, 0.38, 0.39, 0.40, 0.40, 0.40, 0.41,
  0.41, 0.41, 0.42,
]
const sobSofr = [
  5.36, 5.39, 5.39, 5.35, 5.37, 5.39, 5.44, 5.43, 5.22, 4.89, 4.69, 4.57,
  4.38, 4.41, 4.38, 4.37, 4.33, 4.34, 4.38, 4.40, 4.36, 4.21, 4.01, 3.78,
  3.71, 3.71, 3.69,
]
const nsobMargen = [
  3.05, 3.03, 3.04, 3.05, 3.04, 3.03, 3.06, 3.09, 3.09, 3.09, 3.08, 3.08,
  3.28, 3.28, 3.27, 3.23, 3.23, 3.23, 3.23, 3.23, 3.24, 3.24, 3.24, 3.24,
  3.25, 3.25, 3.26,
]
const nsobSofr = [
  5.36, 5.37, 5.40, 5.41, 5.41, 5.47, 5.47, 5.45, 5.26, 4.90, 4.70, 4.64,
  4.35, 4.40, 4.37, 4.38, 4.36, 4.44, 4.41, 4.44, 4.35, 4.22, 3.98, 3.79,
  3.72, 3.73, 3.67,
]

const sovereignRateDescription = (
  <>
    <strong>Base SOFR:</strong> Continúa la tendencia decreciente iniciada en septiembre de 2024,
    aunque a un ritmo más moderado. La tasa pasó de 3.78% al cierre de 2025 a 3.69% en marzo
    de 2026, mostrando señales de estabilización tras la fuerte caída observada en el último
    trimestre de 2025.
    <br />
    <br />
    <strong>Margen neto:</strong> Se mantiene la tendencia decreciente sostenida desde inicios de
    2024, con una reducción adicional de 3 pbs en el trimestre (de 2.38% a 2.35%).
    <br />
    <br />
    <strong>FOCOM:</strong> Persiste la tendencia creciente de los últimos dos años. La
    compensación de tasa alcanzó 42 bps en marzo de 2026, consolidando el incremento acumulado
    desde los 27 bps de febrero de 2024.
  </>
)

const nonSovereignRateDescription = (
  <>
    <strong>Base SOFR:</strong> Refleja el mismo comportamiento que el Riesgo Soberano, con una
    caída desde 3.79% en diciembre de 2025 hasta 3.67% en marzo de 2026, en línea con la
    trayectoria descendente de la curva desde septiembre de 2024.
    <br />
    <br />
    <strong>Margen neto:</strong> Se estabiliza en torno a 3.25%–3.26%, consolidando el nivel
    alcanzado tras el incremento en escalón registrado a inicios de 2025.
  </>
)

// ── FONPLATA Investment data ──
const fonplataDonut = [
  { id: 'bonos', label: 'Bonos', value: 71, color: 'var(--color-series-1)' },
  { id: 'cds', label: 'CDs', value: 24, color: 'var(--color-series-2)' },
  { id: 'etfs', label: 'ETFs', value: 4, color: 'var(--color-series-3)' },
  { id: 'ecps', label: 'ECPs', value: 1, color: 'var(--color-series-4)' },
]
const fonplataTableCols = [
  { key: 'periodo', label: 'Período', align: 'left' as const },
  { key: 'aum', label: 'AUM (MM)', align: 'right' as const },
  { key: 'ret', label: 'Ret. Mensual', align: 'right' as const },
  { key: 'ytd', label: 'YTD', align: 'right' as const },
  { key: 'rating', label: 'Rating', align: 'center' as const },
]
const fonplataTableRows = [
  { periodo: 'Jun 2023', aum: '548.0', ret: '0.42%', ytd: '2.45%', rating: 'AA+' },
  { periodo: 'Dic 2023', aum: '562.0', ret: '0.38%', ytd: '4.80%', rating: 'AA+' },
  { periodo: 'Jun 2024', aum: '575.0', ret: '0.40%', ytd: '2.35%', rating: 'AA+' },
  { periodo: 'Dic 2024', aum: '588.0', ret: '0.36%', ytd: '4.72%', rating: 'AA+' },
  { periodo: 'Dic 2025', aum: '601.0', ret: '0.33%', ytd: '4.42%', rating: 'AA+' },
]

const countries = CARTERA_COUNTRIES

function SlideRenderer() {
  useSlideNavigation()

  const slideProps = useMemo<Record<string, Record<string, unknown>>>(() => ({
    home: {
      title: 'Comité de Finanzas',
      eyebrow: 'Información al 31 de Marzo de 2026',
      description: 'Viernes 24 de Abril',
      body: 'FONPLATA BANCO DE DESARROLLO',
    },
    contents: {
      title: 'Contenidos',
      description: 'Seleccione una categoría o una diapositiva específica para navegar rápidamente.',
      topics: navigationTopics,
    },
    // Section titles
    'section-cartera': { title: 'Cartera' },
    'section-monitoreo': { title: 'Monitoreo de Riesgos y Política Financiera' },
    'section-inversiones': { title: 'Inversiones' },
    'section-endeudamiento': { title: 'Endeudamiento' },
    // Line cards
    'flujos-pais': {
      eyebrow: '2 · CARTERA',
      title: 'Flujo Neto por País',
      description: 'USD Millones',
      cards: countries.map((c, i) => ({
        id: `flujo-${c}`, title: c,
        data: {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          series: [{
            name: 'USD MM',
            values: [12 + i * 4, 18 + i * 3, 8 + i * 5, 22 + i * 2],
          }],
        },
      })),
      columns: 3,
    },
    'aprobaciones-y-cancelaciones': {
      eyebrow: '2 · CARTERA',
      title: 'Aprobaciones y Cancelaciones',
      description: 'USD Millones',
      cards: countries.map((c, i) => ({
        id: `aprob-${c}`, title: c,
        chartType: 'bar' as const,
        data: {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          series: [
            { name: 'Aprobado', values: [30 + i * 2, 42, 28 + i, 50 + i * 3] },
            { name: 'Cancelado', values: [5, 8, 4, 7], color: 'var(--color-accent)' },
          ],
        },
      })),
      columns: 3,
    },
    'exposicion-cartera-riesgo-cards': {
      eyebrow: 'Monitoreo de riesgos',
      title: 'Exposición de Cartera al Riesgo',
      description: 'Métricas de exposición por país.',
      cards: countries.map((c) => ({ id: `expo-${c}`, title: c })),
      columns: 3,
    },
    'tablero-liquidez-4-cards': {
      eyebrow: 'Monitoreo de riesgos',
      title: 'Riesgo de Liquidez',
      cards: [
        { id: 'ratio-liq', title: 'Monitoreo Liquidez (Política Financiera)' },
        { id: 'cobertura-liq', title: 'Disponibilidad de Recursos Líquidos (Moodys)' },
        { id: 'activos-liq', title: 'Cobertura de liquidez a 12 meses (S&P)' },
        { id: 'reservas', title: 'Ratio de Estructura de Activos' },
      ],
      columns: 2,
    },
    // Proyecciones desembolsos (reuses DebtSourcesSlide pattern)
    'proyecciones-desembolsos': {
      eyebrow: '2 · CARTERA',
      title: 'Proyecciones de Desembolsos',
      description: 'Programación mensual 2026 por riesgo soberano y no soberano.',
    },
    // Investment
    'investment-fonplata': {
      eyebrow: 'Cartera de inversiones',
      title: 'Cartera de Inversiones FONPLATA',
      description: 'Composición, perfil de vencimientos y rendimiento histórico.',
      highlights: ['AUM: USD 601.0 MM al 31/12/2025', 'Bonos representan 71% del portafolio', 'Rating promedio: AA+'],
      donutData: fonplataDonut,
      tableTitle: 'Rendimiento histórico',
      tableColumns: fonplataTableCols,
      tableRows: fonplataTableRows,
    },
    'rate-analysis': {
      eyebrow: 'Tasas activas',
      title: 'Tasas Activas (Cartera): Evolución Reciente',
      charts: [
        {
          id: 'soberana',
          label: 'Riesgo soberano',
          unit: '%',
          description: sovereignRateDescription,
          data: {
            labels: tasasLabels,
            series: [
              { name: 'SOFR', values: sobSofr, color: '#adb5bd' },
              { name: 'Margen neto', values: sobMargen, color: '#c1121f' },
              { name: 'FOCOM', values: sobFocom, color: '#48cae4' },
            ],
          },
        },
        {
          id: 'no-soberana',
          label: 'Riesgo no soberano',
          unit: '%',
          description: nonSovereignRateDescription,
          data: {
            labels: tasasLabels,
            series: [
              { name: 'SOFR', values: nsobSofr, color: '#adb5bd' },
              { name: 'Margen neto', values: nsobMargen, color: '#c1121f' },
            ],
          },
        },
      ],
    },
    'exposicion-cartera-riesgo': {
      eyebrow: 'Monitoreo de riesgos',
      title: 'Exposición de Cartera al Riesgo',
      description: 'Concentración por país y calificación crediticia.',
      highlights: ['Límite por país: 35% de cartera', 'Concentración por calificación'],
      chart1: { title: 'Límite de Capacidad Prestable', chartType: 'line' as const, unit: '%' },
      chart2: { title: 'Capacidad disponible vs. etapas por activar', chartType: 'stacked-bar' as const, unit: 'USD MM' },
    },
    'adecuacion-del-capital': {
      eyebrow: 'Política financiera',
      title: 'Ratio de Adecuación de Capital y Base Patrimonial',
      description: 'FONPLATA mantiene un límite mínimo de capital para la gestión integral de riesgos. El objetivo es mantener el ratio de adecuación del capital por encima del 35%.',
      policyHighlights: [
        'Ratio objetivo: >35% patrimonio/activos',
        'S&P RAC: calificación actual AA-',
        'Proyección 2026: estable sobre umbral',
      ],
      detailTitle: 'Ratio de Capital Ajustado por Riesgo (RAC) S&P',
      detailDescription: 'Niveles de adecuación del capital según metodología S&P con umbrales de calificación.',
    },
    'slide-14': {
      eyebrow: 'Capacidad autorizada',
      title: 'Monitoreo del Endeudamiento',
      description: 'Seguimiento del uso de la capacidad autorizada de endeudamiento y proyecciones.',
    },
  }), [])

  // Map section-title types to their title from props
  const getSectionTitle = (slideId: string) => {
    const props = slideProps[slideId] as Record<string, string> | undefined
    return props?.title ?? ''
  }

  return (
    <Deck>
      {slides.map((slide, index) => {
        const Component = slideRegistry[slide.type]
        if (!Component) return null

        let props = slideProps[slide.id] ?? slideProps[slide.type] ?? {}

        // Section titles need just the title prop
        if (slide.type === 'section-title') {
          props = { title: getSectionTitle(slide.id) }
        }

        return (
          <SlideWrapper
            key={slide.id}
            index={index}
            variant={slide.variant}
            id={slide.id}
          >
            <Component {...props} />
          </SlideWrapper>
        )
      })}
    </Deck>
  )
}

export default function App() {
  const slideIds = useMemo(() => slides.map((s) => s.id), [])
  const { theme, toggle } = useTheme()

  return (
    <ErrorBoundary>
      <PresentationProvider slideIds={slideIds}>
        <AppShell>
          <SlideRenderer />
          <SlideControls />
          <ThemeToggle theme={theme} onToggle={toggle} />
        </AppShell>
      </PresentationProvider>
    </ErrorBoundary>
  )
}
