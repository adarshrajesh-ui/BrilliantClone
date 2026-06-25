import type { JSX } from 'react'
import { usePrefersReducedMotion } from '../../../features/learning-experience'
import './cards.css'

export interface EvBadgeProps {
  /** Expected value to display, e.g. 6.54. */
  value: number
  /** Caption above the value. Default "Expected value". */
  label?: string
  /** Optional reduced-motion override (else uses the hook). */
  reducedMotion?: boolean
  className?: string
}

/** Final EV result badge with a pop-in animation (instant when reduced motion). */
export function EvBadge({
  value,
  label = 'Expected value',
  reducedMotion,
  className,
}: EvBadgeProps): JSX.Element {
  const hookReduced = usePrefersReducedMotion()
  const reduced = reducedMotion ?? hookReduced
  const rootClass = [
    'evb',
    reduced ? 'evb-reduced' : 'evb-animated',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClass} role="status" aria-live="polite">
      <span className="evb-label">{label}</span>
      <span className="evb-value">{value}</span>
    </div>
  )
}
