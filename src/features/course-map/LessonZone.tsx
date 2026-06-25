import { CourseHole } from './CourseHole'
import type { CourseZoneView } from './types'

interface LessonZoneProps {
  zone: CourseZoneView
  /** Label for the call-to-action on the current node. */
  continueLabel: string
  /** Builds the route for a given problem id. */
  problemHref: (problemId: string) => string
  /** Running global hole index used to alternate node sides across zones. */
  startIndex: number
}

/** One level (lesson header + its lesson nodes) within the winding path. */
export function LessonZone({ zone, continueLabel, problemHref, startIndex }: LessonZoneProps) {
  const zoneState = zone.isComplete ? 'complete' : zone.isCurrent ? 'current' : 'upcoming'

  return (
    <li className="coursemap-level">
      <div className={`coursemap-level-header coursemap-level-${zoneState}`}>
        <span className="coursemap-level-eyebrow">Lesson {zone.order}</span>
        <span className="coursemap-level-title">{zone.title}</span>
      </div>

      <ol className="coursemap-nodes">
        {zone.holes.map((hole, i) => {
          const globalIndex = startIndex + i
          const side = globalIndex % 2 === 0 ? 'left' : 'right'
          return (
            <CourseHole
              key={hole.problemId}
              hole={hole}
              href={problemHref(hole.problemId)}
              side={side}
              continueLabel={continueLabel}
            />
          )
        })}
      </ol>
    </li>
  )
}
