import { Link } from 'react-router-dom'
import type { CourseHoleView } from './types'

interface CourseHoleProps {
  hole: CourseHoleView
  href: string
  /** Side of the winding track (alternates by global index). */
  side: 'left' | 'right'
}

/** Map the orthogonal flags onto the existing `.course-hole-*` CSS states. */
function displayState(hole: CourseHoleView): 'complete' | 'current' | 'upcoming' {
  if (hole.isComplete) return 'complete'
  if (hole.isCurrent) return 'current'
  return 'upcoming'
}

/**
 * A single hole in the expanded pathway. Completed holes stay interactive (for
 * review/restart), the current hole gets the ball marker + glow, future holes
 * stay subdued, and the final hole carries a capstone treatment.
 */
export function CourseHole({ hole, href, side }: CourseHoleProps) {
  const state = displayState(hole)
  const statusText = hole.isComplete ? 'Sunk' : hole.isCurrent ? 'Tee off →' : 'Upcoming'

  return (
    <li
      className={`course-hole course-hole-${side} course-hole-${state}${hole.isFinal ? ' course-hole-final' : ''}`}
    >
      <Link to={href} className="course-hole-link">
        <span className="course-pin" aria-hidden="true">
          <span className="course-flag" />
          <span className="course-cup">{hole.isComplete ? '✓' : hole.order}</span>
          {hole.isCurrent && <span className="course-ball" />}
        </span>
        <span className="course-hole-info">
          <span className="course-hole-label">
            Hole {hole.order}
            {hole.isFinal && <span className="course-final-tag">Capstone</span>}
          </span>
          <span className="course-hole-title">{hole.title}</span>
          <span className={`course-hole-status course-status-${state}`}>{statusText}</span>
        </span>
      </Link>
    </li>
  )
}
