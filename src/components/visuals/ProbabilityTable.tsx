import type { FieldStatus } from '../../lib/fieldStatus'

export type { FieldStatus }

interface ProbabilityRow {
  outcome: string
  count: string
  probability: string
  color?: string
}

interface ProbabilityTableProps {
  rows: ProbabilityRow[]
  activeRow?: number | null
  onChange?: (rowIndex: number, field: 'count' | 'probability', value: string) => void
  readOnly?: boolean
  /** Render the count column as given (read-only) text even when other cells are editable. */
  countReadOnly?: boolean
  countStatus?: FieldStatus[]
  probabilityStatus?: FieldStatus[]
  extraColumns?: Array<{
    key: string
    label: string
    values: string[]
    onChange?: (row: number, val: string) => void
    status?: FieldStatus[]
  }>
}

function statusTitle(status: FieldStatus): string | undefined {
  if (status === 'ok') return 'Correct'
  if (status === 'bad') return 'Needs correction'
  return undefined
}

function statusClass(status: FieldStatus): string {
  return status ? ` cell-status cell-status-${status}` : ''
}

export function ProbabilityTable({
  rows,
  activeRow,
  onChange,
  readOnly,
  countReadOnly,
  countStatus,
  probabilityStatus,
  extraColumns = [],
}: ProbabilityTableProps) {
  return (
    <div className="table-wrap">
      <table className="prob-table">
        <thead>
          <tr>
            <th>Outcome</th>
            <th>Count</th>
            <th>Probability</th>
            {extraColumns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.outcome}
              className={`${activeRow === i ? 'prob-row-active' : ''}${row.color ? ` prob-row-${row.color}` : ''}`}
            >
              <td>{row.outcome}</td>
              <td className={statusClass(countStatus?.[i])}>
                {readOnly || countReadOnly || !onChange ? (
                  <span className="prob-cell-given">{row.count}</span>
                ) : (
                  <input
                    type="text"
                    value={row.count}
                    onChange={(e) => onChange(i, 'count', e.target.value)}
                    aria-label={`Count for ${row.outcome}`}
                    title={statusTitle(countStatus?.[i])}
                  />
                )}
              </td>
              <td className={statusClass(probabilityStatus?.[i])}>
                {readOnly || !onChange ? (
                  row.probability
                ) : (
                  <input
                    type="text"
                    value={row.probability}
                    onChange={(e) => onChange(i, 'probability', e.target.value)}
                    aria-label={`Probability for ${row.outcome}`}
                    title={statusTitle(probabilityStatus?.[i])}
                  />
                )}
              </td>
              {extraColumns.map((col) => (
                <td key={col.key} className={statusClass(col.status?.[i])}>
                  {col.onChange ? (
                    <input
                      type="text"
                      value={col.values[i] ?? ''}
                      onChange={(e) => col.onChange?.(i, e.target.value)}
                      aria-label={`${col.label} for ${row.outcome}`}
                      title={statusTitle(col.status?.[i])}
                    />
                  ) : (
                    col.values[i]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
