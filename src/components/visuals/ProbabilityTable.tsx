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
  extraColumns?: Array<{ key: string; label: string; values: string[]; onChange?: (row: number, val: string) => void }>
}

export function ProbabilityTable({
  rows,
  activeRow,
  onChange,
  readOnly,
  extraColumns = [],
}: ProbabilityTableProps) {
  return (
    <div className="table-wrap">
      <table className="prob-table">
        <thead>
          <tr>
            <th>Outcome</th>
            <th>Number of Boxes</th>
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
              <td>
                {readOnly || !onChange ? (
                  row.count
                ) : (
                  <input
                    type="text"
                    value={row.count}
                    onChange={(e) => onChange(i, 'count', e.target.value)}
                    aria-label={`Count for ${row.outcome}`}
                  />
                )}
              </td>
              <td>
                {readOnly || !onChange ? (
                  row.probability
                ) : (
                  <input
                    type="text"
                    value={row.probability}
                    onChange={(e) => onChange(i, 'probability', e.target.value)}
                    aria-label={`Probability for ${row.outcome}`}
                  />
                )}
              </td>
              {extraColumns.map((col) => (
                <td key={col.key}>
                  {col.onChange ? (
                    <input
                      type="text"
                      value={col.values[i] ?? ''}
                      onChange={(e) => col.onChange?.(i, e.target.value)}
                      aria-label={`${col.label} for ${row.outcome}`}
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
