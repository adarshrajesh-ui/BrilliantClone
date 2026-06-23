import type { ReactNode } from 'react'
import { ANIM } from './animations'

interface InteractionCalloutProps {
  /** Short instruction, e.g. "Tap a card, then tap a formula slot". */
  children: ReactNode
  /** Optional small icon/glyph. */
  icon?: ReactNode
  /** When true, applies a gentle attention pulse (auto-neutralized when the
   * user prefers reduced motion via the global media query). */
  emphasize?: boolean
}

/**
 * A compact "do this" callout used inside demos (and reusable inside problems)
 * to point the learner at the next interaction. Purely presentational.
 */
export function InteractionCallout({ children, icon = '👉', emphasize }: InteractionCalloutProps) {
  return (
    <div className={`interaction-callout${emphasize ? ` ${ANIM.pulseHighlight}` : ''}`}>
      <span className="interaction-callout-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="interaction-callout-text">{children}</span>
    </div>
  )
}
