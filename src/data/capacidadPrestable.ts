export type CapacidadCountry = 'ARG' | 'BOL' | 'BRA' | 'PAR' | 'URU' | 'RNS'

export const CAPACIDAD_COUNTRIES: CapacidadCountry[] = ['ARG', 'BOL', 'BRA', 'PAR', 'URU', 'RNS']

export interface CapacidadPeriod {
  period: string
  utilizadaPorPais: Record<CapacidadCountry, number>
  utilizadaTotal: number
  patrimonio: number
  capacidadMax: number
  maxPorPais: number
  maxRNS: number
  porCobrarPorPais: Record<CapacidadCountry, number>
  porCobrarTotal: number
  activosTotales: number
  otrosActivos: number
  maxActivosPorPais: number
  maxActivosRNS: number
  porActivarPorPais: Record<CapacidadCountry, number>
  porActivarTotal: number
}

export function limiteCapacidad(p: CapacidadPeriod, country: CapacidadCountry): number {
  return country === 'RNS' ? p.maxRNS : p.maxPorPais
}

export function limiteActivos(p: CapacidadPeriod, country: CapacidadCountry): number {
  return country === 'RNS' ? p.maxActivosRNS : p.maxActivosPorPais
}

export const CAPACIDAD_PRESTABLE: CapacidadPeriod[] = [
  {
    period: 'Q1-2026',
    utilizadaPorPais: { ARG: 726.0, BOL: 620.5, BRA: 1117.7, PAR: 578.5, URU: 647.3, RNS: 150.5 },
    utilizadaTotal: 3840.6,
    patrimonio: 1875.9,
    capacidadMax: 5627.8,
    maxPorPais: 1406.9,
    maxRNS: 337.7,
    porCobrarPorPais: { ARG: 597.2, BOL: 446.5, BRA: 386.4, PAR: 464.6, URU: 606.7, RNS: 120.5 },
    porCobrarTotal: 2621.9,
    activosTotales: 4122.0,
    otrosActivos: 1500.1,
    maxActivosPorPais: 1236.6,
    maxActivosRNS: 412.2,
    porActivarPorPais: { ARG: 50, BOL: 75, BRA: 0, PAR: 310, URU: 332.04, RNS: 0 },
    porActivarTotal: 767.04,
  },
  {
    period: 'Q2-2026',
    utilizadaPorPais: { ARG: 804.5, BOL: 609.0, BRA: 1277.1, PAR: 574.6, URU: 642.3, RNS: 201.7 },
    utilizadaTotal: 4109.1,
    patrimonio: 1895.5,
    capacidadMax: 5686.5,
    maxPorPais: 1421.6,
    maxRNS: 341.2,
    porCobrarPorPais: { ARG: 615.1, BOL: 448.7, BRA: 414.2, PAR: 465.7, URU: 609.7, RNS: 171.7 },
    porCobrarTotal: 2725.0,
    activosTotales: 4434.2,
    otrosActivos: 1709.2,
    maxActivosPorPais: 1330.3,
    maxActivosRNS: 443.4,
    porActivarPorPais: { ARG: 50, BOL: 75, BRA: 0, PAR: 310, URU: 332.04, RNS: 0 },
    porActivarTotal: 767.04,
  },
  {
    period: 'Q3-2026',
    utilizadaPorPais: { ARG: 835.5, BOL: 606.1, BRA: 1299.6, PAR: 554.6, URU: 632.4, RNS: 231.3 },
    utilizadaTotal: 4159.4,
    patrimonio: 1919.1,
    capacidadMax: 5757.3,
    maxPorPais: 1439.3,
    maxRNS: 345.4,
    porCobrarPorPais: { ARG: 604.4, BOL: 480.8, BRA: 446.2, PAR: 453.2, URU: 618.3, RNS: 171.3 },
    porCobrarTotal: 2774.2,
    activosTotales: 4408.3,
    otrosActivos: 1634.1,
    maxActivosPorPais: 1322.5,
    maxActivosRNS: 440.8,
    porActivarPorPais: { ARG: 50, BOL: 75, BRA: 0, PAR: 310, URU: 332.04, RNS: 0 },
    porActivarTotal: 767.04,
  },
  {
    period: 'Q4-2026',
    utilizadaPorPais: { ARG: 825.9, BOL: 676.7, BRA: 1325.8, PAR: 660.7, URU: 750.3, RNS: 229.2 },
    utilizadaTotal: 4468.6,
    patrimonio: 1953.1,
    capacidadMax: 5859.4,
    maxPorPais: 1464.9,
    maxRNS: 351.6,
    porCobrarPorPais: { ARG: 631.3, BOL: 510.4, BRA: 481.8, PAR: 482.5, URU: 625.3, RNS: 169.2 },
    porCobrarTotal: 2900.5,
    activosTotales: 4642.2,
    otrosActivos: 1741.7,
    maxActivosPorPais: 1392.7,
    maxActivosRNS: 464.2,
    porActivarPorPais: { ARG: 50, BOL: 75, BRA: 0, PAR: 215.29, URU: 314.5, RNS: 0 },
    porActivarTotal: 654.79,
  },
  {
    period: 'Q1-2027',
    utilizadaPorPais: { ARG: 903.9, BOL: 669.0, BRA: 1317.6, PAR: 635.9, URU: 737.6, RNS: 249.2 },
    utilizadaTotal: 4513.1,
    patrimonio: 1976.4,
    capacidadMax: 5929.1,
    maxPorPais: 1482.3,
    maxRNS: 355.7,
    porCobrarPorPais: { ARG: 660.2, BOL: 542.3, BRA: 490.8, PAR: 492.8, URU: 628.3, RNS: 169.2 },
    porCobrarTotal: 2983.6,
    activosTotales: 4822.2,
    otrosActivos: 1838.6,
    maxActivosPorPais: 1446.7,
    maxActivosRNS: 482.2,
    porActivarPorPais: { ARG: 50, BOL: 75, BRA: 0, PAR: 215.29, URU: 314.5, RNS: 0 },
    porActivarTotal: 654.79,
  },
]
