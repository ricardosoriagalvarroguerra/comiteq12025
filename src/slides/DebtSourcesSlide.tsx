import { TextCard } from '@/components/cards/TextCard'
import { TableCard } from '@/components/cards/TableCard'
import { Card } from '@/components/ui/Card'
import './DebtSourcesSlide.css'

const ifdColumns = [
  { key: 'n', label: '#', align: 'center' as const, width: '36px' },
  { key: 'instrumento', label: 'Instrumento', align: 'left' as const },
  { key: 'circulante', label: 'Circulante', align: 'center' as const },
  { key: 'disponible', label: 'Disponible', align: 'center' as const },
  { key: 'total', label: 'Total', align: 'center' as const },
  { key: 'spread', label: 'Spread (pbs)', align: 'center' as const },
]

const ifdRows = [
  { n: 1, instrumento: 'BID 1 - Préstamo (4377/OC-RG)', circulante: '82.50', disponible: '0.00', total: '82.50', spread: '121.0' },
  { n: 2, instrumento: 'BID 2 - Préstamo (5442/OC-RG)', circulante: '100.00', disponible: '0.00', total: '100.00', spread: '121.0' },
  { n: 3, instrumento: 'BEI 1 - Línea (86645)', circulante: '59.14', disponible: '0.00', total: '59.14', spread: '89.5' },
  { n: 4, instrumento: 'CAF 3 - Línea Revolvente', circulante: '100.00', disponible: '50.00', total: '150.00', spread: '155.0' },
  { n: 5, instrumento: 'AFD 1 - Préstamo (CZZ 2105)', circulante: '12.73', disponible: '0.00', total: '12.73', spread: '179.8' },
  { n: 6, instrumento: 'AFD 2 - Préstamo (CZZ 2823)', circulante: '31.15', disponible: '0.00', total: '31.15', spread: '123.6' },
  { n: 7, instrumento: 'ICO 1 - Tramo 1 - Línea 1', circulante: '1.11', disponible: '0.00', total: '1.11', spread: '87.8' },
  { n: 8, instrumento: 'ICO 2 - Línea 2', circulante: '11.90', disponible: '0.00', total: '11.90', spread: '98.3' },
  { n: 9, instrumento: 'ICO 3 - Línea', circulante: '25.00', disponible: '0.00', total: '25.00', spread: '84.3', isHighlight: true },
  { n: 10, instrumento: 'KfW - Préstamo (29876)', circulante: '40.12', disponible: '0.00', total: '40.12', spread: '92.1' },
  { n: 11, instrumento: 'CDP 1', circulante: '27.50', disponible: '0.00', total: '27.50', spread: '130.0' },
  { n: 12, instrumento: 'CDP 2', circulante: '35.00', disponible: '15.00', total: '50.00', spread: '124.0', isHighlight: true },
  { n: '', instrumento: 'TOTAL', circulante: '526.14', disponible: '65.00', total: '591.14', spread: '', isTotal: true },
]

const mercadoColumns = [
  { key: 'n', label: '#', align: 'center' as const, width: '36px' },
  { key: 'instrumento', label: 'Instrumento', align: 'left' as const },
  { key: 'monto', label: 'Monto (USD MM)', align: 'center' as const },
  { key: 'spread', label: 'Spread (pbs)', align: 'center' as const },
]

const mercadoRows = [
  { n: 1, instrumento: 'BBVA 1', monto: '16.67', spread: '157.8' },
  { n: 2, instrumento: 'CHF 2026', monto: '222.67', spread: '164.0' },
  { n: 3, instrumento: 'CHF 2028', monto: '164.47', spread: '125.2' },
  { n: 4, instrumento: 'JPY 2028', monto: '22.51', spread: '192.8' },
  { n: 5, instrumento: 'JPY 2029', monto: '31.51', spread: '205.5' },
  { n: 6, instrumento: 'CHF 2027', monto: '158.57', spread: '189.8' },
  { n: 7, instrumento: 'JPY 2027', monto: '40.17', spread: '166.4' },
  { n: 8, instrumento: 'JPY 2029 - 2', monto: '7.01', spread: '188.4' },
  { n: 9, instrumento: 'CHF 2029', monto: '152.94', spread: '202.9' },
  { n: 10, instrumento: 'BBVA 2', monto: '125.00', spread: '172.4' },
  { n: 11, instrumento: 'MTN 1', monto: '40.00', spread: '130.0' },
  { n: 12, instrumento: 'MTN 2', monto: '40.00', spread: '145.0' },
  { n: 13, instrumento: 'MTN 3', monto: '50.00', spread: '145.0' },
  { n: 14, instrumento: 'MTN 4.1', monto: '30.00', spread: '136.5' },
  { n: 15, instrumento: 'MTN 4.2', monto: '50.00', spread: '145.8' },
  { n: 16, instrumento: 'MTN 5', monto: '50.00', spread: '167.7' },
  { n: 17, instrumento: 'MTN 6', monto: '50.00', spread: '135.0' },
  { n: 18, instrumento: 'MTN 7', monto: '100.00', spread: '135.0' },
  { n: 19, instrumento: 'MTN 8.1', monto: '35.00', spread: '178.4' },
  { n: 20, instrumento: 'MTN 8.2', monto: '25.12', spread: '180.0' },
  { n: 21, instrumento: 'MTN 9', monto: '20.39', spread: '112.5' },
  { n: 22, instrumento: 'MTN 10', monto: '30.00', spread: '130.0' },
  { n: 23, instrumento: 'MTN 11 (INR - DB)', monto: '101.47', spread: '130.0' },
  { n: '', instrumento: 'TOTAL', monto: '1,563.49', spread: '159.7', isTotal: true },
]

const IFD_CIRCULANTE_TOTAL = 526.14
const MERCADO_TOTAL = 1563.49
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
        />
        <TableCard
          title="Mercado"
          columns={mercadoColumns}
          rows={mercadoRows}
          className="debt-sources__table-scroll"
        />
      </div>
    </div>
  )
}
