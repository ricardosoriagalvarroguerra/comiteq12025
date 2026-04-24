import { TextCard } from '@/components/cards/TextCard'
import { Card } from '@/components/ui/Card'
import './FinancialTableSlide.css'

interface Row {
  label: string
  mar26?: string
  mar25?: string
  var?: string
  kind?: 'section' | 'subheader' | 'subtotal' | 'total' | 'indent'
}

const ROWS: Row[] = [
  { label: 'INGRESOS', kind: 'section' },
  { label: 'Cartera de préstamos', kind: 'subheader' },
  { label: 'Intereses', mar26: '42,1', mar25: '44,2', var: '-4,7%', kind: 'indent' },
  { label: 'Otros ingresos por préstamos', mar26: '1,6', mar25: '2,3', var: '-30,6%', kind: 'indent' },
  { label: 'Ingresos por cartera de préstamos', mar26: '43,7', mar25: '46,5', var: '-6,0%', kind: 'subtotal' },
  { label: 'Inversiones', kind: 'subheader' },
  { label: 'Intereses', mar26: '11,6', mar25: '7,2', var: '62,2%', kind: 'indent' },
  { label: 'Otros ingresos por inversiones', mar26: '—', mar25: '0,1', var: '-100,0%', kind: 'indent' },
  { label: 'Ingresos por inversiones', mar26: '11,6', mar25: '7,3', var: '60,0%', kind: 'subtotal' },
  { label: 'Ingresos por activos financieros', mar26: '55,3', mar25: '53,7', var: '3,0%', kind: 'subtotal' },
  { label: 'GASTOS', kind: 'section' },
  { label: 'Intereses y cargos por endeudamiento', mar26: '(29,6)', mar25: '(20,8)', var: '42,0%', kind: 'indent' },
  { label: 'Ingresos netos por activos financieros netos', mar26: '25,7', mar25: '32,9', var: '-21,8%', kind: 'subtotal' },
  { label: 'Otros ingresos / pérdidas', mar26: '1,1', mar25: '(1,8)', var: '-162,2%' },
  { label: 'Ingresos antes de provisiones y gastos adm', mar26: '26,8', mar25: '31,1', var: '-13,8%', kind: 'subtotal' },
  { label: 'Provisión por deterioro de préstamos', mar26: '1,6', mar25: '(2,1)', var: '-176,4%' },
  { label: 'Ingresos después de la prov. por deterioro de pmos', mar26: '28,4', mar25: '29,1', var: '-2,4%', kind: 'subtotal' },
  { label: 'Gastos administrativos', mar26: '(4,3)', mar25: '(3,5)', var: '24,5%', kind: 'indent' },
  { label: 'Resultado neto', mar26: '24,1', mar25: '25,6', var: '-5,7%', kind: 'total' },
]

export function EstadoResultadosSlide() {
  return (
    <div className="fin-table-slide">
      <TextCard
        eyebrow="1 · SITUACIÓN FINANCIERA"
        title="Estado de Resultados"
        description="USD Millones"
      />
      <div className="fin-table-slide__body">
        <Card padding="none" className="fin-table-slide__grouped">
          <table>
            <thead>
              <tr>
                <th>Concepto</th>
                <th>mar-26</th>
                <th>mar-25</th>
                <th>Var</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr
                  key={i}
                  className={
                    r.kind === 'section'
                      ? 'fin-table-slide__row-section'
                      : r.kind === 'subheader'
                        ? 'fin-table-slide__row-subheader'
                        : r.kind === 'subtotal'
                          ? 'fin-table-slide__row-subtotal'
                          : r.kind === 'total'
                            ? 'fin-table-slide__total'
                            : r.kind === 'indent'
                              ? 'fin-table-slide__row-indent'
                              : ''
                  }
                >
                  <td>{r.label}</td>
                  <td>{r.mar26 ?? ''}</td>
                  <td>{r.mar25 ?? ''}</td>
                  <td>{r.var ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}
