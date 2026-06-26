interface RunningAverageGraphProps {
  averages: number[]
  target?: number
  /** Upper bound of the y-axis (defaults to 10). */
  maxY?: number
  label?: string
  variant?: 'default' | 'flat' | 'jagged'
}

export function RunningAverageGraph({
  averages,
  target = 5,
  maxY: maxYProp = 10,
  label = 'Running average per spin',
  variant = 'default',
}: RunningAverageGraphProps) {
  const width = 320
  const height = 160
  const padding = 24
  const maxY = Math.max(maxYProp, target, 1)
  const minY = 0
  const plotWidth = width - padding * 2
  const plotHeight = height - padding * 2
  const targetY = padding + plotHeight - ((target - minY) / (maxY - minY)) * plotHeight
  const targetLabel = Number.isInteger(target) ? String(target) : target.toFixed(2)
  const hasAverages = averages.length > 0
  const points = averages.map((avg, index) => {
    const x = padding + (index / Math.max(averages.length - 1, 1)) * plotWidth
    const y = padding + plotHeight - ((avg - minY) / (maxY - minY)) * plotHeight
    return `${x},${y}`
  })
  const strokeClass =
    variant === 'flat' ? '#15803d' : variant === 'jagged' ? '#2563eb' : '#2563eb'

  return (
    <div className="graph-wrap">
      <p className="graph-caption">{label}</p>
      {!hasAverages && <p className="graph-empty">Run simulations to see the running average line.</p>}
      <svg viewBox={`0 0 ${width} ${height}`} className="running-graph" role="img" aria-label={`${label}; target ${targetLabel}`}>
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#d1d5db" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#d1d5db" />
        <line
          x1={padding}
          y1={targetY}
          x2={width - padding}
          y2={targetY}
          className="graph-target-line"
          strokeDasharray="6 4"
        />
        <text x={width - padding - 4} y={targetY - 4} textAnchor="end" className="graph-target-label">
          {targetLabel} average
        </text>
        {hasAverages && (
          <polyline points={points.join(' ')} fill="none" stroke={strokeClass} strokeWidth={variant === 'jagged' ? 2.5 : 2} />
        )}
      </svg>
    </div>
  )
}
