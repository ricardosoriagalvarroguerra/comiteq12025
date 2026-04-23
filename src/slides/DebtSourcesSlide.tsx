import { TextCard } from '@/components/cards/TextCard'
import { TableCard } from '@/components/cards/TableCard'
import { Card } from '@/components/ui/Card'
import './DebtSourcesSlide.css'

const ifdColumns = [
  { key: 'instrumento', label: 'Instrumento', align: 'left' as const, className: 'debt-sources__col-inst' },
  { key: 'circulante', label: 'Circ.', align: 'right' as const, className: 'debt-sources__col-num' },
  { key: 'disponible', label: 'Disp.', align: 'right' as const, className: 'debt-sources__col-num' },
  { key: 'total', label: 'Total', align: 'right' as const, className: 'debt-sources__col-num' },
  { key: 'spread', label: 'Spread', align: 'right' as const, className: 'debt-sources__col-num' },
]

const ifdRows = [
  { n: 1, instrumento: 'AFD 1 - Préstamo (CZZ 2105)', circulante: '12.73', disponible: '0.00', total: '12.73', spread: '179.8' },
  { n: 2, instrumento: 'AFD 2 - Préstamo (CZZ 2823)', circulante: '31.15', disponible: '0.00', total: '31.15', spread: '123.6' },
  { n: 3, instrumento: 'BEI 1 - Tramo 1 - Línea (86645)', circulante: '5.36', disponible: '0.00', total: '5.36', spread: '106.0' },
  { n: 4, instrumento: 'BEI 1 - Tramo 2 - Línea (86645)', circulante: '5.79', disponible: '0.00', total: '5.79', spread: '95.0' },
  { n: 5, instrumento: 'BEI 1 - Tramo 3 - Línea (86645)', circulante: '10.00', disponible: '0.00', total: '10.00', spread: '87.2' },
  { n: 6, instrumento: 'BEI 1 - Tramo 4 - Línea (86645)', circulante: '20.00', disponible: '0.00', total: '20.00', spread: '81.3' },
  { n: 7, instrumento: 'BEI 1 - Tramo 5 - Línea (86645)', circulante: '18.00', disponible: '0.00', total: '18.00', spread: '93.1' },
  { n: 8, instrumento: 'BID 1 - Préstamo (4377/OC-RG)', circulante: '82.50', disponible: '0.00', total: '82.50', spread: '121.0' },
  { n: 9, instrumento: 'BID 2 - Préstamo (5442/OC-RG)', circulante: '100.00', disponible: '0.00', total: '100.00', spread: '121.0' },
  { n: 10, instrumento: 'CAF 3 - Línea Revolvente', circulante: '0.00', disponible: '50.00', total: '50.00', spread: '—' },
  { n: 11, instrumento: 'CAF 3 - Tramo 1 - Línea Revolvente', circulante: '50.00', disponible: '0.00', total: '50.00', spread: '175.0' },
  { n: 12, instrumento: 'CAF 3 - Tramo 2 - Línea Revolvente', circulante: '50.00', disponible: '0.00', total: '50.00', spread: '135.0' },
  { n: 13, instrumento: 'CDP 1', circulante: '27.50', disponible: '0.00', total: '27.50', spread: '130.0' },
  { n: 14, instrumento: 'CDP 2', circulante: '35.00', disponible: '15.00', total: '50.00', spread: '124.0', isHighlight: true },
  { n: 15, instrumento: 'ICO 1 - Tramo 1', circulante: '1.11', disponible: '0.00', total: '1.11', spread: '87.8' },
  { n: 16, instrumento: 'ICO 2 - Tramo 1', circulante: '6.40', disponible: '0.00', total: '6.40', spread: '96.0' },
  { n: 17, instrumento: 'ICO 2 - Tramo 2', circulante: '5.50', disponible: '0.00', total: '5.50', spread: '101.0' },
  { n: 19, instrumento: 'ICO 3 - Tramo 1', circulante: '17.78', disponible: '0.00', total: '17.78', spread: '88.0' },
  { n: 20, instrumento: 'ICO 3 - Tramo 2', circulante: '7.22', disponible: '0.00', total: '7.22', spread: '75.0', isHighlight: true },
  { n: 21, instrumento: 'KfW - Préstamo (29876)', circulante: '40.12', disponible: '0.00', total: '40.12', spread: '92.1' },
  { n: '', instrumento: 'TOTAL', circulante: '526.1', disponible: '65.0', total: '591.1', spread: '122', isTotal: true },
]

const mercadoColumns = [
  { key: 'instrumento', label: 'Instrumento', align: 'left' as const, className: 'debt-sources__col-inst' },
  { key: 'monto', label: 'Monto', align: 'right' as const, className: 'debt-sources__col-num' },
  { key: 'spread', label: 'Spread', align: 'right' as const, className: 'debt-sources__col-num' },
]

const mercadoRows = [
  { n: 1, instrumento: 'BBVA - Facilidad de Crédito 2021', monto: '16.7', spread: '157.8' },
  { n: 2, instrumento: 'BBVA 2 - Facilidad de Crédito 2024', monto: '125.0', spread: '172.4' },
  { n: 3, instrumento: 'CHF 3,5 años – 2027', monto: '158.6', spread: '189.8' },
  { n: 4, instrumento: 'CHF 5 años – 2029', monto: '152.9', spread: '202.9' },
  { n: 5, instrumento: 'CHF 5,5 años – 2026', monto: '222.7', spread: '164.0' },
  { n: 6, instrumento: 'CHF 7 años - 2028', monto: '164.5', spread: '125.2' },
  { n: 7, instrumento: 'JPY 3 años – 2027', monto: '40.2', spread: '166.4' },
  { n: 8, instrumento: 'JPY 5 años - 2028', monto: '22.5', spread: '192.8' },
  { n: 9, instrumento: 'JPY 5 años – 2029 / Segunda Emisión', monto: '7.0', spread: '188.4' },
  { n: 10, instrumento: 'JPY 6,5 años – 2029 / Primera Emisión', monto: '31.5', spread: '205.5' },
  { n: 11, instrumento: 'USD 3 años – 19/Feb/2028 – MTN 1', monto: '40.0', spread: '130.0' },
  { n: 12, instrumento: 'USD 5 años – 14/Mar/2030 – MTN 2', monto: '40.0', spread: '145.0' },
  { n: 13, instrumento: 'USD 5 años – 21/Mar/2030 – MTN 3', monto: '50.0', spread: '145.0' },
  { n: 14, instrumento: 'USD 5 años – 26/Mar/2030 – MTN 4.1', monto: '30.0', spread: '136.5' },
  { n: 15, instrumento: 'USD 7 años – 26/Mar/2032 – MTN 4.2', monto: '50.0', spread: '145.8' },
  { n: 16, instrumento: 'USD 10 años – 10/Abr/2035 – MTN 5', monto: '50.0', spread: '167.7' },
  { n: 17, instrumento: 'USD 5 años – 19/May/2030 – MTN 6', monto: '50.0', spread: '135.0' },
  { n: 18, instrumento: 'USD 5 años – 21/May/2030 – MTN 7', monto: '100.0', spread: '135.0' },
  { n: 19, instrumento: 'USD 15 años – 05/Ago/2040 – MTN 8.1', monto: '35.0', spread: '178.4' },
  { n: 20, instrumento: 'AUD 15 años – 05/Ago/2040 – MTN 8.2', monto: '25.1', spread: '180.0' },
  { n: 21, instrumento: 'JPY 3 años – 05/Sep/2028 – MTN 9', monto: '20.4', spread: '112.5' },
  { n: 22, instrumento: 'USD 5,5 años – 30/Mar/2031 – MTN 10', monto: '30.0', spread: '130.0' },
  { n: 23, instrumento: 'INR 5,5 años – 25/May/2031 – MTN 11', monto: '101.5', spread: '130.0' },
  { n: '', instrumento: 'TOTAL', monto: '1,563.6', spread: '159.7', isTotal: true },
]

const IFD_CIRCULANTE_TOTAL = 526.14
const MERCADO_TOTAL = 1563.60
const DEUDA_TOTAL = IFD_CIRCULANTE_TOTAL + MERCADO_TOTAL

const nfAmount = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: true,
})

interface DebtSourcesSlideProps {
  eyebrow?: string
  title?: string
  description?: string
}

export function DebtSourcesSlide({
  eyebrow = '4 · ENDEUDAMIENTO',
  title = 'Endeudamiento por Instrumento',
  description = 'USD Millones',
}: DebtSourcesSlideProps = {}) {
  return (
    <div className="debt-sources">
      <div className="debt-sources__header">
        <div className="debt-sources__header-text">
          <TextCard
            eyebrow={eyebrow}
            title={title}
            description={description}
          />
        </div>
        <Card padding="md" className="debt-sources__value-card">
          <span className="debt-sources__value-label">Total Deuda</span>
          <span className="debt-sources__value-number">
            {nfAmount.format(DEUDA_TOTAL)}
          </span>
          <span className="debt-sources__value-unit">USD MM</span>
          <span className="debt-sources__value-detail">
            IFD Circulante <strong>{nfAmount.format(IFD_CIRCULANTE_TOTAL)}</strong>
          </span>
          <span className="debt-sources__value-detail">
            Mercado <strong>{nfAmount.format(MERCADO_TOTAL)}</strong>
          </span>
        </Card>
      </div>
      <div className="debt-sources__tables debt-sources__tables--dual">
        <TableCard
          title="IFD"
          columns={ifdColumns}
          rows={ifdRows}
          className="debt-sources__table-scroll"
          headerRight={<span className="debt-sources__unit">USD MM · pbs</span>}
        />
        <TableCard
          title="Mercado"
          columns={mercadoColumns}
          rows={mercadoRows}
          className="debt-sources__table-scroll"
          headerRight={<span className="debt-sources__unit">USD MM · pbs</span>}
        />
      </div>
    </div>
  )
}
