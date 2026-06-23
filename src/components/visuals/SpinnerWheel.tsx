interface SpinnerWheelProps {
  rotation: number
  spinning: boolean
  lastOutcome: number | null
}

export function SpinnerWheel({ rotation, spinning, lastOutcome }: SpinnerWheelProps) {
  return (
    <div className="spinner-wrap">
      <svg
        viewBox="0 0 200 200"
        className={`spinner-wheel${spinning ? ' spinner-wheel-active' : ''}`}
        style={{ transform: `rotate(${rotation}deg)` }}
        aria-label="Spinner with $10 and $0 sections"
      >
        <circle cx="100" cy="100" r="96" fill="#f3f4f6" stroke="#374151" strokeWidth="4" />
        <path d="M 4 100 A 96 96 0 0 1 196 100 Z" fill="#22c55e" />
        <path d="M 4 100 A 96 96 0 0 0 196 100 Z" fill="#d1d5db" />
        <circle cx="100" cy="100" r="10" fill="#111827" />
        <text x="100" y="42" textAnchor="middle" className="spinner-label">$10</text>
        <text x="100" y="172" textAnchor="middle" className="spinner-label">$0</text>
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
