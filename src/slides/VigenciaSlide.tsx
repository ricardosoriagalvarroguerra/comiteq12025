import { TextCard } from '@/components/cards/TextCard'
import { TableCard } from '@/components/cards/TableCard'
import './VigenciaSlide.css'

const etapaColumns = [
  { key: 'codigo', label: 'Instrumento', align: 'left' as const },
  { key: 'nombre', label: 'Nombre', align: 'left' as const },
  { key: 'moneda', label: 'Moneda', align: 'center' as const },
  { key: 'monto', label: 'Monto (USD MM)', align: 'right' as const },
]

const etapaRows = [
  { codigo: 'ARG-65/2025 II ETAPA', nombre: 'AGUA POTABLE MENDOZA', moneda: 'USD', monto: '25,00' },
  { codigo: 'ARG-65/2025 III ETAPA', nombre: 'AGUA POTABLE MENDOZA', moneda: 'USD', monto: '25,00' },
  { codigo: 'BOL-38/2024 II ETAPA', nombre: 'GENERACIÓN EMPLEO IV', moneda: 'USD', monto: '50,00' },
  { codigo: 'BOL-39/2024 II ETAPA', nombre: 'INFRAESTRUCTURA COMPLEMENTARIA', moneda: 'USD', monto: '25,00' },
  { codigo: 'PAR-27/2019 II ETAPA', nombre: 'YPEJHÚ', moneda: 'USD', monto: '90,00' },
  { codigo: 'PAR-28/2020 II ETAPA', nombre: 'BIOCEÁNICO', moneda: 'USD', monto: '110,00' },
  { codigo: 'PAR-28/2020 III ETAPA', nombre: 'BIOCEÁNICO', moneda: 'USD', monto: '110,00' },
  { codigo: 'URU-25/2024 II ETAPA', nombre: 'UNIVERSALIZACIÓN DEL SANEAMIENTO', moneda: 'USD', monto: '120,00' },
  { codigo: 'URU-25/2024 III ETAPA', nombre: 'UNIVERSALIZACIÓN DEL SANEAMIENTO', moneda: 'USD', monto: '125,00' },
  { codigo: 'URU-25/2024 IV ETAPA', nombre: 'UNIVERSALIZACIÓN DEL SANEAMIENTO', moneda: 'USD', monto: '20,00' },
  { codigo: 'URU-26/2024 II ETAPA', nombre: 'CAJA BANCARIA', moneda: 'USD', monto: '25,00' },
  { codigo: 'URU-27/2024 II ETAPA', nombre: 'SANEAMIENTO MALDONADO', moneda: 'USD', monto: '22,54' },
  { codigo: 'URU-27/2024 III ETAPA', nombre: 'SANEAMIENTO MALDONADO', moneda: 'USD', monto: '14,41' },
  { codigo: 'URU-27/2024 IV ETAPA', nombre: 'SANEAMIENTO MALDONADO', moneda: 'USD', monto: '5,09' },
]

const aprobadaColumns = [
  { key: 'codigo', label: 'Código', align: 'left' as const },
  { key: 'nombre', label: 'Nombre', align: 'left' as const },
  { key: 'monto', label: 'Monto (USD MM)', align: 'center' as const },
  { key: 'previsibilidad', label: 'Previsibilidad', align: 'center' as const },
]

const aprobadaRows = [
  { codigo: 'ARG-066#1', nombre: 'INFRAESTRUCTURA PRIORITARIA CHACO', monto: '30,00', previsibilidad: '' },
  { codigo: 'BOL-038#1', nombre: 'GENERACIÓN EMPLEO IV', monto: '50,00', previsibilidad: '' },
  { codigo: 'BRA-041#1', nombre: 'FLORIANÓPOLIS', monto: '50,00', previsibilidad: '' },
  { codigo: 'BRA-045#1', nombre: 'ITAPEVI', monto: '28,80', previsibilidad: '' },
  { codigo: 'BRA-047#1', nombre: 'PRODESAN PARA LAGOS - COSANPA', monto: '50,00', previsibilidad: '' },
  { codigo: 'BRA-050#1', nombre: 'MOVILIDAD Y DRENAJE PROMOD', monto: '50,00', previsibilidad: '' },
  { codigo: 'BRA-051#1', nombre: 'PETROLINA', monto: '20,00', previsibilidad: '' },
]

const TOTAL_ETAPA = 767.04
const TOTAL_APROBADA = 278.80

const nfAmount = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: true,
})

function TotalBadge({ value }: { value: number }) {
  return (
    <span className="vigencia-slide__total-badge">
      <span className="vigencia-slide__total-label">Total</span>
      <strong className="vigencia-slide__total-value">{nfAmount.format(value)}</strong>
      <span className="vigencia-slide__total-unit">USD MM</span>
    </span>
  )
}

export function VigenciaSlide() {
  return (
    <div className="vigencia-slide">
      <div className="vigencia-slide__text">
        <TextCard
          eyebrow="Vigencia y activación"
          title="Vigencia y Activación Esperada"
          description="Proyectos en etapas pendientes de activación y aprobados no vigentes."
        />
      </div>
      <div className="vigencia-slide__tables">
        <TableCard
          title="Etapas Pendientes de Activación"
          columns={etapaColumns}
          rows={etapaRows}
          headerRight={<TotalBadge value={TOTAL_ETAPA} />}
          className="vigencia-slide__table"
        />
        <TableCard
          title="Aprobadas no Vigentes"
          columns={aprobadaColumns}
          rows={aprobadaRows}
          headerRight={<TotalBadge value={TOTAL_APROBADA} />}
          className="vigencia-slide__table"
        />
      </div>
    </div>
  )
}
