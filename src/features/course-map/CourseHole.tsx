import { Link } from 'react-router-dom'
import type { CourseHoleView } from './types'

interface CourseHoleProps {
  hole: CourseHoleView
  href: string
  /** Label for the call-to-action shown on the current node. */
  continueLabel: string
}

function displayState(hole: CourseHoleView): 'complete' | 'current' | 'upcoming' {
  if (hole.isComplete) return 'complete'
  if (hole.isCurrent) return 'current'
  return 'upcoming'
}

/**
 * A single lesson node on the vertical path. Completed nodes stay interactive
 * for review, the current node gets a small avatar/CTA, and upcoming nodes stay
 * subdued like Brilliant's course map.
 */
export function CourseHole({ hole, href, continueLabel }: CourseHoleProps) {
  const state = displayState(hole)

  return (
    <div
      className={`coursemap-node coursemap-node-${state}${
        hole.isFinal ? ' coursemap-node-final' : ''
      }`}
    >
      <Link to={href} className="coursemap-node-link">
        <span className="coursemap-disc" aria-hidden="true">
          {hole.isCurrent && <span className="coursemap-current-ring" />}
          <span className="coursemap-disc-face">
            {hole.isComplete ? '✓' : ''}
          </span>
        </span>
        <span className="coursemap-node-label">
          {hole.title}
        </span>
      </Link>

      {hole.isCurrent && (
        <div className="coursemap-cta">
          <span className="coursemap-cta-avatar" aria-hidden="true">
            <i />
          </span>
          <span className="coursemap-cta-title">{hole.title}</span>
          <Link to={href} className="coursemap-cta-btn touch-target">
            {continueLabel}
          </Link>
        </div>
      )}
    </div>
  )
}
