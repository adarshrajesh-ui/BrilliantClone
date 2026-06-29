interface FairnessNumberLineProps {
  value?: number | null
  showLabels?: boolean
  highlightZero?: boolean
}

export function FairnessNumberLine({ value, showLabels = true, highlightZero }: FairnessNumberLineProps) {
  const position = value === null || value === undefined ? null : Math.max(0, Math.min(100, ((value + 5) / 10) * 100))
  const zone =
    value === null || value === undefined
      ? null
      : value < 0
        ? 'unfavorable'
        : value > 0
          ? 'favorable'
          : 'fair'
  const formattedValue =
    value === null || value === undefined ? null : `${value >= 0 ? '+' : '-'}$${Math.abs(value)}`
  const ariaLabel =
    formattedValue === null
      ? 'Fairness number line from unfavorable loss through fair zero to favorable profit. No profit selected yet.'
      : `Fairness number line showing profit ${formattedValue}, which is ${zone}.`

  return (
    <div className="fairness-line" role="img" aria-label={ariaLabel}>
      {showLabels && (
        <div className="fairness-labels">
          <span>Unfavorable</span>
          <span>Fair ($0)</span>
          <span>Favorable</span>
        </div>
      )}
      <div className="fairness-track">
        <div className="fairness-zone fairness-unfavorable" />
        <div className={`fairness-zone fairness-fair${highlightZero ? ' fairness-zone-active' : ''}`} />
        <div className="fairness-zone fairness-favorable" />
        {position !== null && (
          <div className="fairness-dot" style={{ left: `${position}%` }} title={`Profit: ${formattedValue}`} aria-hidden="true" />
        )}
      </div>
    </div>
  )
}
