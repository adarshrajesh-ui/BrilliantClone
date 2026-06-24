import { Link } from 'react-router-dom'
import { LessonZone } from './LessonZone'
import type { CourseMapView } from './types'

interface ExpandedCoursePathwayProps {
  view: CourseMapView
  /** Course title shown on the left info card. */
  title: string
  /** Short course description shown on the left info card. */
  subtitle: string
  totalLessons: number
  totalProblems: number
  completionPercentage: number
  /** Route for the Continue / Start / Review action. */
  continueHref: string
  /** Builds the route for a given problem id. */
  problemHref: (problemId: string) => string
}

/**
 * Minimalist Brilliant-style course view: a sticky info card on the left and a
 * winding lesson path on the right. Navigation only — the path arranges the
 * pure view model into level groups and circular lesson nodes.
 */
export function ExpandedCoursePathway({
  view,
  title,
  subtitle,
  totalLessons,
  totalProblems,
  completionPercentage,
  continueHref,
  problemHref,
}: ExpandedCoursePathwayProps) {
  const hasProgress = completionPercentage > 0
  const continueLabel = view.allComplete ? 'Review' : hasProgress ? 'Continue' : 'Start'
  let runningIndex = 0

  return (
    <section className="coursemap" aria-label="Expected Value course map">
      <aside className="coursemap-info">
        <div className="coursemap-info-card">
          <span className="coursemap-info-icon" aria-hidden="true">
            ∑
          </span>
          <h1 className="coursemap-info-title">{title}</h1>
          <p className="coursemap-info-desc">{subtitle}</p>

          <div className="coursemap-info-meta">
            <span>
              <strong>{totalLessons}</strong> Lessons
            </span>
            <span>
              <strong>{totalProblems}</strong> Exercises
            </span>
          </div>

          <div
            className="coursemap-info-bar"
            role="progressbar"
            aria-valuenow={completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="coursemap-info-bar-fill"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="coursemap-info-progress">{completionPercentage}% complete</p>

          <Link to={continueHref} className="coursemap-info-cta touch-target">
            {continueLabel}
          </Link>
        </div>
      </aside>

      <ol className="coursemap-path">
        {view.zones.map((zone) => {
          const startIndex = runningIndex
          runningIndex += zone.holes.length
          return (
            <LessonZone
              key={zone.lessonId}
              zone={zone}
              continueLabel={continueLabel}
              problemHref={problemHref}
              startIndex={startIndex}
            />
          )
        })}
      </ol>
    </section>
  )
}
