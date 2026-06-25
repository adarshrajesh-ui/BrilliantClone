import { RunningAverageGraph } from './RunningAverageGraph'
import './BoothPreview.css'

export type BoothVariant = 'steady' | 'jumpy'

interface BoothPreviewProps {
  title: string
  subtitle: string
  variant: BoothVariant
  /** Per-round payout outcomes that have been drawn so far. */
  results: number[]
  /** Running average after each round (length === results.length). */
  averages: number[]
  /** Whether the latest run's chips should animate in. Disabled when reduced. */
  animate: boolean
  runLabel: string
  runDisabled: boolean
  onRun: () => void
}

/**
 * One carnival booth card: a tactile outcome strip (coins for the steady booth,
 * win/zero tokens for the jumpy booth) plus a running-average mini meter. The
 * outcome data is supplied by the parent (computed via the seeded simulation
 * helper), so the animated and reduced-motion paths render identical results.
 */
export function BoothPreview({
  title,
  subtitle,
  variant,
  results,
  averages,
  animate,
  runLabel,
  runDisabled,
  onRun,
}: BoothPreviewProps) {
  const hasRun = results.length > 0
  const average = averages.length > 0 ? averages[averages.length - 1] : null

  return (
    <div className={`booth-card booth-card-${variant === 'steady' ? 'steady' : 'jumpy'}`}>
      <div className="booth-card-header">
        <h3>{title}</h3>
        <p className="booth-card-sub">{subtitle}</p>
      </div>

      <div className="booth-strip" role="list" aria-label={`${title} outcomes`}>
        {!hasRun && <span className="booth-strip-empty">No rounds yet — tap “{runLabel}”.</span>}
        {results.map((value, i) => {
          const chipKind =
            variant === 'steady' ? 'coin' : value > 0 ? 'win' : 'zero'
          return (
            <span
              key={i}
              role="listitem"
              className={`booth-chip booth-chip-${chipKind}${animate ? ' booth-chip-anim' : ''}`}
              style={animate ? { animationDelay: `${i * 120}ms` } : undefined}
              aria-label={`Round ${i + 1}: $${value}`}
            >
              ${value}
            </span>
          )
        })}
      </div>

      <RunningAverageGraph
        averages={averages}
        target={5}
        maxY={10}
        label={`${title} running average`}
        variant={variant === 'steady' ? 'flat' : 'jagged'}
      />

      {average !== null && (
        <div className="booth-meter-readout">
          <span>Average payout</span>
          <strong>${average.toFixed(2)}</strong>
        </div>
      )}

      {variant === 'jumpy' && hasRun && (
        <p className="booth-range-band">
          Outcomes range <span className="booth-band-low">$0</span> to{' '}
          <span className="booth-band-high">$10</span>.
        </p>
      )}

      <button
        type="button"
        className="btn-secondary touch-target"
        onClick={onRun}
        disabled={runDisabled}
      >
        {runLabel}
      </button>
    </div>
  )
}
