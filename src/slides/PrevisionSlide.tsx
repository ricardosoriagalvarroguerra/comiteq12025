import { useEffect, useRef, useState } from 'react'
import { TextCard } from '@/components/cards/TextCard'
import { Card } from '@/components/ui/Card'
import './PrevisionSlide.css'

interface PrevisionRow {
  code: string
  pais: string
  carteraDic: string
  carteraMar: string
  carteraVar: string
  moodys: string
  sp: string
  fitch: string
  pct: string
  prevDic: string
  prevMar: string
  prevVar: string
  prevK: string
  kind?: 'subtotal' | 'total'
}

const ROWS: PrevisionRow[] = [
  { code: 'ARG', pais: 'ARGENTINA', carteraDic: '598,8', carteraMar: '597,1', carteraVar: '-1,7', moodys: 'Caa1', sp: 'CCC+', fitch: 'CCC+', pct: 'B+', prevDic: '6,2', prevMar: '6,2', prevVar: '0,0', prevK: '10,5' },
  { code: 'BOL', pais: 'BOLIVIA', carteraDic: '431,7', carteraMar: '446,5', carteraVar: '14,8', moodys: 'Caa3', sp: 'CCC+', fitch: 'CCC', pct: 'B', prevDic: '7,8', prevMar: '6,3', prevVar: '-1,5', prevK: '14,0' },
  { code: 'BRA', pais: 'BRASIL', carteraDic: '379,0', carteraMar: '386,4', carteraVar: '7,4', moodys: 'Ba1', sp: 'BB', fitch: 'BB', pct: 'BBB', prevDic: '0,7', prevMar: '0,7', prevVar: '0,0', prevK: '1,9' },
  { code: 'PAR', pais: 'PARAGUAY', carteraDic: '455,7', carteraMar: '464,6', carteraVar: '9,0', moodys: 'Baa3', sp: 'BBB-', fitch: 'BB+', pct: 'A-', prevDic: '0,1', prevMar: '0,1', prevVar: '0,0', prevK: '0,3' },
  { code: 'URU', pais: 'URUGUAY', carteraDic: '598,8', carteraMar: '606,7', carteraVar: '7,9', moodys: 'Baa1', sp: 'BBB+', fitch: 'BBB', pct: 'A+', prevDic: '1,9', prevMar: '1,9', prevVar: '0,0', prevK: '3,1' },
  { code: 'SOB', pais: 'Soberano', carteraDic: '2.464,1', carteraMar: '2.501,4', carteraVar: '37,3', moodys: '—', sp: '—', fitch: '—', pct: '—', prevDic: '16,8', prevMar: '15,2', prevVar: '-1,5', prevK: '6,1', kind: 'subtotal' },
  { code: 'BADESUL', pais: 'BADESUL', carteraDic: '30,0', carteraMar: '28,3', carteraVar: '-1,7', moodys: '—', sp: 'BB', fitch: '—', pct: 'BB+', prevDic: '0,4', prevMar: '0,4', prevVar: '0,0', prevK: '13,3' },
  { code: 'BDMG', pais: 'BDMG', carteraDic: '34,0', carteraMar: '31,2', carteraVar: '-2,8', moodys: '—', sp: 'BB-', fitch: '—', pct: 'BB', prevDic: '0,7', prevMar: '0,6', prevVar: '-0,1', prevK: '19,5' },
  { code: 'CASAN', pais: 'CASAN', carteraDic: '55,0', carteraMar: '55,0', carteraVar: '0,0', moodys: '—', sp: 'B+', fitch: '—', pct: 'BB-', prevDic: '1,9', prevMar: '1,9', prevVar: '0,0', prevK: '35,3' },
  { code: 'BNF', pais: 'BNF', carteraDic: '7,5', carteraMar: '6,0', carteraVar: '-1,5', moodys: '—', sp: 'BB', fitch: '—', pct: 'BB+', prevDic: '0,1', prevMar: '0,1', prevVar: '0,0', prevK: '13,3' },
  { code: 'NS', pais: 'No Soberano', carteraDic: '126,5', carteraMar: '120,5', carteraVar: '-6,0', moodys: '—', sp: '—', fitch: '—', pct: '—', prevDic: '3,1', prevMar: '3,0', prevVar: '-0,1', prevK: '24,9', kind: 'subtotal' },
  { code: 'TOTAL', pais: 'Total', carteraDic: '2.590,6', carteraMar: '2.621,9', carteraVar: '31,3', moodys: '—', sp: '—', fitch: '—', pct: '—', prevDic: '19,9', prevMar: '18,2', prevVar: '-1,6', prevK: '7,0', kind: 'total' },
]

const RATIO_LABELS = ['Dic-20', 'Dic-21', 'Dic-22', 'Dic-23', 'Dic-24', 'Dic-25', 'Mar-26']
const RATIO_VALUES = [0.78, 0.81, 0.77, 1.03, 0.92, 0.77, 0.70]

export function PrevisionSlide() {
  return (
    <div className="prevision-slide">
      <TextCard
        eyebrow="3 · MONITOREO DE RIESGOS"
        title="Previsión para Pérdida de Cartera de Préstamos"
        description="Cartera bruta, calificación y previsión por país · USD Millones"
      />

      <Card padding="none" className="table-card prevision-slide__table">
        <div className="table-card__body prevision-slide__table-body">
          <table className="table-card__table prevision-slide__tbl">
            <thead>
              <tr className="prevision-slide__group-row">
                <th rowSpan={2} className="table-card__th prevision-slide__sticky-col">País</th>
                <th colSpan={3} className="table-card__th prevision-slide__group">Cartera bruta</th>
                <th colSpan={4} className="table-card__th prevision-slide__group">Calificación al 31/3/2026</th>
                <th colSpan={3} className="table-card__th prevision-slide__group">Previsión</th>
                <th rowSpan={2} className="table-card__th prevision-slide__group">Prev. c/ USD 1.000</th>
              </tr>
              <tr>
                <th className="table-card__th">31/12/25</th>
                <th className="table-card__th">31/3/26</th>
                <th className="table-card__th">Var.</th>
                <th className="table-card__th">Moody&apos;s</th>
                <th className="table-card__th">S&amp;P</th>
                <th className="table-card__th">Fitch</th>
                <th className="table-card__th">Rating c/ PCT</th>
                <th className="table-card__th">31/12/25</th>
                <th className="table-card__th">31/3/26</th>
                <th className="table-card__th">Var.</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr
                  key={r.code}
                  className={`table-card__tr prevision-slide__tr ${
                    r.kind === 'total' ? 'table-card__tr--total' : ''
                  } ${r.kind === 'subtotal' ? 'prevision-slide__tr--subtotal' : ''}`}
                >
                  <td className="table-card__td prevision-slide__sticky-col">
                    <span className="prevision-slide__code">{r.code}</span>
                    <span className="prevision-slide__pais">{r.pais}</span>
                  </td>
                  <td className="table-card__td prevision-slide__num">{r.carteraDic}</td>
                  <td className="table-card__td prevision-slide__num">{r.carteraMar}</td>
                  <td className={`table-card__td prevision-slide__num ${varClass(r.carteraVar)}`}>{r.carteraVar}</td>
                  <td className="table-card__td prevision-slide__rating">{r.moodys}</td>
                  <td className="table-card__td prevision-slide__rating">{r.sp}</td>
                  <td className="table-card__td prevision-slide__rating">{r.fitch}</td>
                  <td className="table-card__td prevision-slide__rating">{r.pct}</td>
                  <td className="table-card__td prevision-slide__num">{r.prevDic}</td>
                  <td className="table-card__td prevision-slide__num">{r.prevMar}</td>
                  <td className={`table-card__td prevision-slide__num ${varClass(r.prevVar)}`}>{r.prevVar}</td>
                  <td className="table-card__td prevision-slide__num">{r.prevK}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card padding="md" className="prevision-slide__chart-card">
        <div className="prevision-slide__chart-header">
          <span className="prevision-slide__chart-eyebrow">Evolución trimestral</span>
          <h3 className="prevision-slide__chart-title">Ratio Previsión / Cartera por cobrar</h3>
          <span className="prevision-slide__chart-unit">%</span>
        </div>
        <div className="prevision-slide__chart-body">
          <RatioLineChart labels={RATIO_LABELS} values={RATIO_VALUES} />
        </div>
      </Card>
    </div>
  )
}

function RatioLineChart({ labels, values }: { labels: string[]; values: number[] }) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ w: 640, h: 260 })

  useEffect(() => {
    if (!wrapRef.current) return
    const el = wrapRef.current
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) setSize({ w: width, h: height })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const margin = { top: 24, right: 24, bottom: 28, left: 42 }
  const innerW = Math.max(10, size.w - margin.left - margin.right)
  const innerH = Math.max(10, size.h - margin.top - margin.bottom)

  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  const pad = Math.max(0.05, (rawMax - rawMin) * 0.25)
  const yMin = Math.max(0, Math.floor((rawMin - pad) * 10) / 10)
  const yMax = Math.ceil((rawMax + pad) * 10) / 10
  const yRange = yMax - yMin || 1

  const stepX = values.length > 1 ? innerW / (values.length - 1) : 0
  const xAt = (i: number) => margin.left + i * stepX
  const yAt = (v: number) => margin.top + innerH * (1 - (v - yMin) / yRange)

  const tickCount = 5
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => yMin + (yRange * i) / tickCount)

  const path = values
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`)
    .join(' ')

  return (
    <div className="ratio-chart" ref={wrapRef}>
      <svg viewBox={`0 0 ${size.w} ${size.h}`} className="ratio-chart__svg" role="img">
        {yTicks.map((t) => (
          <g key={t}>
            <line
              x1={margin.left}
              x2={margin.left + innerW}
              y1={yAt(t)}
              y2={yAt(t)}
              className="ratio-chart__grid"
            />
            <text
              x={margin.left - 8}
              y={yAt(t)}
              dy="0.32em"
              textAnchor="end"
              className="ratio-chart__axis-label"
            >
              {t.toFixed(2).replace('.', ',')}%
            </text>
          </g>
        ))}

        <line
          x1={margin.left}
          x2={margin.left + innerW}
          y1={margin.top + innerH}
          y2={margin.top + innerH}
          className="ratio-chart__axis-line"
        />
        <line
          x1={margin.left}
          x2={margin.left}
          y1={margin.top}
          y2={margin.top + innerH}
          className="ratio-chart__axis-line"
        />

        {labels.map((lbl, i) => (
          <text
            key={lbl}
            x={xAt(i)}
            y={margin.top + innerH + 16}
            textAnchor="middle"
            className="ratio-chart__axis-label"
          >
            {lbl}
          </text>
        ))}

        <path d={path} className="ratio-chart__line" />

        {values.map((v, i) => (
          <g key={`pt-${i}`}>
            <circle
              cx={xAt(i)}
              cy={yAt(v)}
              r={4}
              className="ratio-chart__point"
            />
            <text
              x={xAt(i)}
              y={yAt(v) - 9}
              textAnchor="middle"
              className="ratio-chart__data-label"
            >
              {v.toFixed(2).replace('.', ',')}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function varClass(v: string): string {
  if (v.startsWith('-')) return 'prevision-slide__num--neg'
  if (v === '0,0') return 'prevision-slide__num--zero'
  return 'prevision-slide__num--pos'
}
