import './ProfitMeter.css'

interface ProfitMeterProps {
  /** Current value shown by the meter (animates between updates). */
  value: number
  /** Top of the scale (e.g. the expected payout). */
  max: number
  /** When true, the meter pulses green to confirm the locked-in profit. */
  locked?: boolean
}

/**
 * Vertical profit meter. The fill height tracks `value` as a fraction of `max`.
 * When the cost is subtracted the parent lowers `value`, and the fill slides
 * DOWN (teaching subtraction, not addition). Negative values clamp to empty.
 */
export function ProfitMeter({ value, max, locked = false }: ProfitMeterProps) {
  const safeMax = max <= 0 ? 1 : max
  const pct = Math.max(0, Math.min(100, (value / safeMax) * 100))
  return (
    <div className="profit-meter-viz" role="img" aria-label={`Profit meter at $${value}`}>
      <div className="profit-meter-track">
        <div
          className={`profit-meter-fill${locked ? ' profit-meter-fill-locked' : ''}`}
          style={{ height: `${pct}%` }}
        />
      </div>
      <span className="profit-meter-value">${value}</span>
      <span className="profit-meter-caption">profit</span>
    </div>
  )
}
