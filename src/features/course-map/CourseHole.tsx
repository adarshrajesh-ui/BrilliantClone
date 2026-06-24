import { Link } from 'react-router-dom'
import type { CourseHoleView } from './types'

interface CourseHoleProps {
  hole: CourseHoleView
  href: string
  /** Side of the winding track (alternates by global index). */
  side: 'left' | 'right'
  /** Label for the call-to-action shown on the current node. */
  continueLabel: string
}

function displayState(hole: CourseHoleView): 'complete' | 'current' | 'upcoming' {
  if (hole.isComplete) return 'complete'
  if (hole.isCurrent) return 'current'
  return 'upcoming'
}

/**
 * A single lesson node on the winding path. Completed nodes stay interactive
 * (review/restart), the current node gets a marker pin + highlight ring and an
 * inline start/continue card, and upcoming nodes stay subdued.
 */
export function CourseHole({ hole, href, side, continueLabel }: CourseHoleProps) {
  const state = displayState(hole)

  return (
    <li
      className={`coursemap-node coursemap-node-${side} coursemap-node-${state}${
        hole.isFinal ? ' coursemap-node-final' : ''
      }`}
    >
      <Link to={href} className="coursemap-node-link">
        <span className="coursemap-disc" aria-hidden="true">
          {hole.isCurrent && <span className="coursemap-marker" />}
          <span className="coursemap-disc-face">{hole.isComplete ? '✓' : ''}</span>
        </span>
        <span className="coursemap-node-label">{hole.title}</span>
      </Link>

      {hole.isCurrent && (
        <div className="coursemap-cta">
          <span className="coursemap-cta-title">{hole.title}</span>
          <Link to={href} className="coursemap-cta-btn touch-target">
            {continueLabel}
          </Link>
        </div>
      )}
    </li>
  )
}
