interface RiskComparisonGraphProps {
  gameAAverages: number[]
  gameBAverages: number[]
  /** The shared expected value both games converge toward (dashed tie line). */
  target?: number
  /** Upper bound of the y-axis. */
  maxY?: number
  labelA?: string
  labelB?: string
}

export function RiskComparisonGraph({
  gameAAverages,
  gameBAverages,
  target = 6,
  maxY = 12,
  labelA = 'Game A — guaranteed',
  labelB = 'Game B — wider spread',
}: RiskComparisonGraphProps) {
  return (
    <div className="risk-comparison">
      <div className="risk-graph-col">
        <p className="graph-caption">{labelA}</p>
        <RunningAverageGraphMini averages={gameAAverages} target={target} maxY={maxY} variant="flat" />
      </div>
      <div className="risk-graph-col">
        <p className="graph-caption">{labelB}</p>
        <RunningAverageGraphMini averages={gameBAverages} target={target} maxY={maxY} variant="jagged" />
      </div>
    </div>
  )
}

function RunningAverageGraphMini({
  averages,
  target,
  maxY,
  variant,
}: {
  averages: number[]
  target: number
  maxY: number
  variant: 'flat' | 'jagged'
}) {
  const width = 280
  const height = 120
  const padding = 20
  const yMax = Math.max(maxY, target, 1)

  if (averages.length === 0) {
    return <div className="graph-empty">Run 20 trials</div>
  }

  const plotW = width - padding * 2
  const plotH = height - padding * 2
  const points = averages.map((avg, i) => {
    const x = padding + (i / Math.max(averages.length - 1, 1)) * plotW
    const y = padding + plotH - (avg / yMax) * plotH
    return `${x},${y}`
  })
  const targetY = padding + plotH - (target / yMax) * plotH

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="running-graph" role="img" aria-label={`${variant} running-average line approaching ${target}`}>
      <line x1={padding} y1={targetY} x2={width - padding} y2={targetY} stroke="#93c5fd" strokeDasharray="3 3" />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={variant === 'flat' ? '#15803d' : '#2563eb'}
        strokeWidth={variant === 'jagged' ? 2.5 : 2}
        pathLength={1}
        className={`risk-line risk-line-${variant}`}
      />
    </svg>
  )
}
