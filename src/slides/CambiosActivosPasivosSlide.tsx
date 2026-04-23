import { TextCard } from '@/components/cards/TextCard'
import { TableCard } from '@/components/cards/TableCard'
import './FinancialTableSlide.css'

const columns = [
  { key: 'concepto', label: '', align: 'left' as const },
  { key: 'mar26', label: 'mar-26', align: 'right' as const },
  { key: 'mar25', label: 'mar-25', align: 'right' as const },
  { key: 'var', label: 'Var. %', align: 'right' as const },
]

const rows = [
  { concepto: 'Préstamos', mar26: '$2.622,00', mar25: '$2.469,70', var: '6,17%' },
  { concepto: 'Inversiones', mar26: '$1.424,00', mar25: '$832,70', var: '71,01%' },
  { concepto: 'Bancos', mar26: '$25,00', mar25: '$108,90', var: '(77,04%)' },
  { concepto: 'Endeudamientos', mar26: '$2.175,50', mar25: '$1.617,90', var: '34,46%' },
  { concepto: 'Patrimonio', mar26: '$1.871,10', mar25: '$1.776,60', var: '5,32%' },
  { concepto: 'Otros activos y pasivos', mar26: '$(24,50)', mar25: '$(16,80)', var: '45,83%' },
]

export function CambiosActivosPasivosSlide() {
  return (
    <div className="fin-table-slide">
      <TextCard
        eyebrow="1 · SITUACIÓN FINANCIERA"
        title="Cambios en activos y pasivos financieros"
        description="USD Millones"
      />
      <div className="fin-table-slide__body">
        <TableCard
          columns={columns}
          rows={rows}
          className="fin-table-slide__table"
        />
      </div>
    </div>
  )
}
