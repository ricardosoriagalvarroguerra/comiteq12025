import { useState, type ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import './TableCard.css'

interface TableColumn {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  width?: string
  className?: string
}

interface TableRow {
  [key: string]: string | number | boolean | ReactNode | undefined
  isTotal?: boolean
  isHighlight?: boolean
}

interface TableCardProps {
  title?: string
  columns: TableColumn[]
  rows: TableRow[]
  collapsible?: boolean
  defaultCollapsed?: boolean
  className?: string
  headerRight?: ReactNode
}

export function TableCard({
  title,
  columns,
  rows,
  collapsible = false,
  defaultCollapsed = false,
  className = '',
  headerRight,
}: TableCardProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  return (
    <Card padding="none" className={`table-card ${className}`}>
      {title && (
        <div
          className={`table-card__header ${collapsible ? 'table-card__header--clickable' : ''}`}
          onClick={collapsible ? () => setCollapsed(!collapsed) : undefined}
        >
          <h3 className="table-card__title">{title}</h3>
          {headerRight && (
            <div className="table-card__header-right">{headerRight}</div>
          )}
          {collapsible && (
            <svg
              className={`table-card__chevron ${collapsed ? '' : 'table-card__chevron--open'}`}
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      )}
      {!collapsed && (
        <div className="table-card__body">
          <table className="table-card__table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`table-card__th ${col.className ?? ''}`}
                    style={{ textAlign: col.align ?? 'left', width: col.width }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className={`table-card__tr ${row.isTotal ? 'table-card__tr--total' : ''} ${row.isHighlight ? 'table-card__tr--highlight' : ''}`}
                >
                  {columns.map((col, ci) => (
                    <td
                      key={col.key}
                      className={`table-card__td ${col.className ?? ''}`}
                      style={{ textAlign: col.align ?? (ci === 0 ? 'left' : 'right') }}
                    >
                      {(row[col.key] as ReactNode) ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
