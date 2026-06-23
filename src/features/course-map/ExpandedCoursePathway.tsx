import { LessonZone } from './LessonZone'
import type { CourseMapView } from './types'

interface ExpandedCoursePathwayProps {
  view: CourseMapView
  /** Heading eyebrow/subtitle copy. */
  subtitle: string
  totalLessons: number
  /** Builds the route for a given problem id. */
  problemHref: (problemId: string) => string
}

/**
 * Expanded golf-course pathway for the chapter page. Renders all lesson zones
 * and holes from the view model with completed/current/future/final states.
 * Navigation only — math scenarios remain the PRD-defined visuals.
 */
export function ExpandedCoursePathway({
  view,
  subtitle,
  totalLessons,
  problemHref,
}: ExpandedCoursePathwayProps) {
  const currentZone = view.zones.find((z) => z.isCurrent)
  let runningIndex = 0

  return (
    <section className="card course" aria-label="Expected Value course map">
      <div className="course-hero">
        <div>
          <p className="chapter-eyebrow course-eyebrow">Expected Value Course</p>
          <p className="course-subtitle">{subtitle}</p>
        </div>
        <span className="course-ribbon">
          {view.allComplete
            ? 'Course complete 🏆'
            : `Lesson ${currentZone?.order ?? 1} of ${totalLessons} · Hole ${view.currentHoleOrder} of ${view.totalHoles}`}
        </span>
      </div>

      <ol className="course-track">
        {view.zones.map((zone) => {
          const startIndex = runningIndex
          runningIndex += zone.holes.length
          return (
            <LessonZone
              key={zone.lessonId}
              zone={zone}
              problemHref={problemHref}
              startIndex={startIndex}
            />
          )
        })}
      </ol>
    </section>
  )
}
