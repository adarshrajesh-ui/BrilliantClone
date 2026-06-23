export interface SpinnerSegment {
  value: number
  weight: number
  color: string
  label: string
}

interface ConfigurableSpinnerProps {
  segments: SpinnerSegment[]
  rotation: number
  spinning: boolean
  lastOutcome: number | null
}

function buildSegmentPaths(segments: SpinnerSegment[]) {
  const total = segments.reduce((sum, s) => sum + s.weight, 0)
  let startAngle = -90
  return segments.map((segment) => {
    const angle = (segment.weight / total) * 360
    const endAngle = startAngle + angle
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    const x1 = 100 + 96 * Math.cos(startRad)
    const y1 = 100 + 96 * Math.sin(startRad)
    const x2 = 100 + 96 * Math.cos(endRad)
    const y2 = 100 + 96 * Math.sin(endRad)
    const largeArc = angle > 180 ? 1 : 0
    const path = `M 100 100 L ${x1} ${y1} A 96 96 0 ${largeArc} 1 ${x2} ${y2} Z`
    const midAngle = startAngle + angle / 2
    const midRad = (midAngle * Math.PI) / 180
    const labelX = 100 + 62 * Math.cos(midRad)
    const labelY = 100 + 62 * Math.sin(midRad)
    startAngle = endAngle
    return { path, color: segment.color, label: segment.label, labelX, labelY }
  })
}

export function ConfigurableSpinner({
  segments,
  rotation,
  spinning,
  lastOutcome,
}: ConfigurableSpinnerProps) {
  const paths = buildSegmentPaths(segments)

  return (
    <div className="spinner-wrap">
      <svg
        viewBox="0 0 200 200"
        className={`spinner-wheel${spinning ? ' spinner-wheel-active' : ''}`}
        style={{ transform: `rotate(${rotation}deg)` }}
        aria-label="Probability spinner"
      >
        <circle cx="100" cy="100" r="96" fill="#f3f4f6" stroke="#374151" strokeWidth="4" />
        {paths.map((p, i) => (
          <g key={i}>
            <path d={p.path} fill={p.color} />
            <text x={p.labelX} y={p.labelY} textAnchor="middle" dominantBaseline="middle" className="spinner-label">
              {p.label}
            </text>
          </g>
        ))}
        <circle cx="100" cy="100" r="10" fill="#111827" />
        <polygon points="100,0 92,16 108,16" fill="#111827" />
      </svg>
      {lastOutcome !== null && (
        <p className="spinner-outcome" aria-live="polite">
          Last spin: <strong>${lastOutcome}</strong>
        </p>
      )}
    </div>
  )
}

export const SPINNER_P1: SpinnerSegment[] = [
  { value: 10, weight: 1, color: '#22c55e', label: '$10' },
  { value: 0, weight: 1, color: '#d1d5db', label: '$0' },
]

export const SPINNER_P2: SpinnerSegment[] = [
  { value: 20, weight: 1, color: '#22c55e', label: '$20' },
  { value: 0, weight: 3, color: '#d1d5db', label: '$0' },
]

export function spinFromSegments(segments: SpinnerSegment[]): number {
  const total = segments.reduce((sum, s) => sum + s.weight, 0)
  let r = Math.random() * total
  for (const seg of segments) {
    r -= seg.weight
    if (r <= 0) {
      return seg.value
    }
  }
  return segments[segments.length - 1].value
}
