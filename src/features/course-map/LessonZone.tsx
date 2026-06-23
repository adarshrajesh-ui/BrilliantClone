import { CourseHole } from './CourseHole'
import type { CourseZoneView } from './types'

interface LessonZoneProps {
  zone: CourseZoneView
  /** Builds the route for a given problem id. */
  problemHref: (problemId: string) => string
  /** Running global hole index used to alternate hole sides across zones. */
  startIndex: number
}

/** One lesson zone (header + its holes) within the expanded pathway. */
export function LessonZone({ zone, problemHref, startIndex }: LessonZoneProps) {
  const zoneState = zone.isComplete ? 'complete' : zone.isCurrent ? 'current' : 'upcoming'

  return (
    <li className="course-zone-wrap">
      <div className={`course-zone-header course-zone-${zoneState}`}>
        <span className="course-zone-eyebrow">Lesson {zone.order}</span>
        <span className="course-zone-title">{zone.title}</span>
        <span className="course-zone-status">
          {zone.isComplete ? 'Cleared' : `${zone.completedCount}/${zone.total}`}
        </span>
      </div>

      <ol className="course-holes">
        {zone.holes.map((hole, i) => {
          const globalIndex = startIndex + i
          const side = globalIndex % 2 === 0 ? 'left' : 'right'
          return (
            <CourseHole
              key={hole.problemId}
              hole={hole}
              href={problemHref(hole.problemId)}
              side={side}
            />
          )
        })}
      </ol>
    </li>
  )
}
