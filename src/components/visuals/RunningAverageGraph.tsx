interface RunningAverageGraphProps {
  averages: number[]
}

export function RunningAverageGraph({ averages }: RunningAverageGraphProps) {
  const width = 320
  const height = 160
  const padding = 24
  const maxY = 10
  const minY = 0

  if (averages.length === 0) {
    return (
      <div className="graph-wrap">
        <p className="graph-empty">Spin the wheel to see the running average line.</p>
        <svg viewBox={`0 0 ${width} ${height}`} className="running-graph" aria-hidden="true">
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#d1d5db"
          />
        </svg>
      </div>
    )
  }

  const plotWidth = width - padding * 2
  const plotHeight = height - padding * 2

  const points = averages.map((avg, index) => {
    const x = padding + (index / Math.max(averages.length - 1, 1)) * plotWidth
    const y = padding + plotHeight - ((avg - minY) / (maxY - minY)) * plotHeight
    return `${x},${y}`
  })

  const targetY = padding + plotHeight - ((5 - minY) / (maxY - minY)) * plotHeight

  return (
    <div className="graph-wrap">
      <p className="graph-caption">Running average per spin</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="running-graph" role="img" aria-label="Running average graph approaching five dollars">
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#d1d5db" />
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#d1d5db"
        />
        <line
          x1={padding}
          y1={targetY}
          x2={width - padding}
          y2={targetY}
          stroke="#93c5fd"
          strokeDasharray="4 4"
        />
        <text x={width - padding - 4} y={targetY - 4} textAnchor="end" className="graph-target-label">
          $5 target
        </text>
        <polyline points={points.join(' ')} fill="none" stroke="#2563eb" strokeWidth="2" />
        {averages.length > 0 && (
          <circle
            cx={padding + plotWidth}
            cy={
              padding +
              plotHeight -
              ((averages[averages.length - 1] - minY) / (maxY - minY)) * plotHeight
            }
            r="4"
            fill="#2563eb"
          />
        )}
      </svg>
    </div>
  )
}
