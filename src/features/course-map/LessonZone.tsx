import { Link } from 'react-router-dom'
import { CourseHole } from './CourseHole'
import type { CourseHoleView, CourseZoneView } from './types'

interface LessonZoneProps {
  zone: CourseZoneView
  /** Label for the call-to-action on the current node. */
  continueLabel: string
  /** Builds the route for a given problem id. */
  problemHref: (problemId: string) => string
}

function exerciseStateLabel(hole: CourseHoleView): 'Complete' | 'Current' | null {
  if (hole.isComplete) return 'Complete'
  if (hole.isCurrent) return 'Current'
  return null
}

/** One Brilliant-style lesson node in the vertical course path. */
export function LessonZone({ zone, continueLabel, problemHref }: LessonZoneProps) {
  const targetHole =
    zone.holes.find((hole) => hole.isCurrent) ??
    zone.holes.find((hole) => !hole.isComplete) ??
    zone.holes[0]

  if (!targetHole) {
    return null
  }

  const lessonNode: CourseHoleView = {
    ...targetHole,
    title: zone.title,
    order: zone.order,
    state: zone.isComplete ? 'complete' : zone.isCurrent ? 'current' : targetHole.state,
    isFinal: zone.holes.some((hole) => hole.isFinal),
    isComplete: zone.isComplete,
    isCurrent: zone.isCurrent,
  }

  return (
    <li className="coursemap-level">
      <CourseHole
        hole={lessonNode}
        href={problemHref(targetHole.problemId)}
        continueLabel={continueLabel}
      />
      <ol className="coursemap-exercises" aria-label={`${zone.title} problems`}>
        {zone.holes.map((hole) => {
          const stateLabel = exerciseStateLabel(hole)

          return (
            <li key={hole.problemId}>
              <Link
                to={problemHref(hole.problemId)}
                className={`coursemap-exercise coursemap-exercise-${
                  stateLabel?.toLowerCase() ?? 'upcoming'
                }`}
              >
                <span className="coursemap-exercise-dot" aria-hidden="true" />
                <span className="coursemap-exercise-title">{hole.title}</span>
                {stateLabel && (
                  <span className="coursemap-exercise-state">{stateLabel}</span>
                )}
              </Link>
            </li>
          )
        })}
      </ol>
    </li>
  )
}
