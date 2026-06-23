interface RiskComparisonGraphProps {
  gameAAverages: number[]
  gameBAverages: number[]
  target?: number
}

export function RiskComparisonGraph({
  gameAAverages,
  gameBAverages,
  target = 5,
}: RiskComparisonGraphProps) {
  return (
    <div className="risk-comparison">
      <div className="risk-graph-col">
        <p className="graph-caption">Game A — guaranteed $5</p>
        <RunningAverageGraphMini averages={gameAAverages} target={target} variant="flat" />
      </div>
      <div className="risk-graph-col">
        <p className="graph-caption">Game B — 50/50 $10 or $0</p>
        <RunningAverageGraphMini averages={gameBAverages} target={target} variant="jagged" />
      </div>
    </div>
  )
}

function RunningAverageGraphMini({
  averages,
  target,
  variant,
}: {
  averages: number[]
  target: number
  variant: 'flat' | 'jagged'
}) {
  const width = 280
  const height = 120
  const padding = 20
  const maxY = 10

  if (averages.length === 0) {
    return <div className="graph-empty">Run 20 trials</div>
  }

  const plotW = width - padding * 2
  const plotH = height - padding * 2
  const points = averages.map((avg, i) => {
    const x = padding + (i / Math.max(averages.length - 1, 1)) * plotW
    const y = padding + plotH - (avg / maxY) * plotH
    return `${x},${y}`
  })
  const targetY = padding + plotH - (target / maxY) * plotH

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="running-graph">
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
