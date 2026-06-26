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

function CourseSummaryArt() {
  return (
    <span className="coursemap-card-art" aria-hidden="true">
      <span className="coursemap-card-dice coursemap-card-dice-one">
        <i />
        <i />
        <i />
      </span>
      <span className="coursemap-card-dice coursemap-card-dice-two">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="coursemap-card-coin">
        <i />
      </span>
    </span>
  )
}

/** Brilliant-style course overview: static card + vertical lesson map. */
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
  const progressValue = Math.min(100, Math.max(0, completionPercentage))
  const progressLabel = `${Math.round(progressValue)}%`
  const continueLabel = view.allComplete ? 'Review' : hasProgress ? 'Continue' : 'Start'
  const currentZone = view.zones.find((zone) => zone.isCurrent) ?? view.zones[0]
  const levelTitle = currentZone?.title ?? title
  const firstProblemId = view.zones[0]?.holes[0]?.problemId
  const leftCardHref = hasProgress || view.allComplete || !firstProblemId ? continueHref : problemHref(firstProblemId)

  return (
    <section className="coursemap" aria-label={`${title} course map`}>
      <aside className="coursemap-info">
        <Link to={leftCardHref} className="coursemap-info-card">
          <CourseSummaryArt />
          <h1 className="coursemap-info-title">{title}</h1>
          <p className="coursemap-info-desc">{subtitle}</p>

          <div className="coursemap-info-meta">
            <span>
              <i aria-hidden="true" />
              <strong>{totalLessons}</strong> Lessons
            </span>
            <span>
              <i aria-hidden="true" />
              <strong>{totalProblems}</strong> Exercises
            </span>
          </div>

          <div className="coursemap-info-progress" aria-hidden="true">
            <span className="coursemap-info-progress-label">
              <strong>{progressLabel}</strong> complete
            </span>
            <span className="coursemap-info-progress-track">
              <span
                className="coursemap-info-progress-fill"
                style={{ width: progressLabel }}
              />
            </span>
          </div>

          <span className="sr-only">
            {progressLabel} complete. {continueLabel} course.
          </span>
        </Link>
      </aside>

      <div className="coursemap-stage">
        <div className="coursemap-level-pill" aria-label={`Level ${currentZone?.order ?? 1}: ${levelTitle}`}>
          <span>Level {currentZone?.order ?? 1}</span>
          <strong>{levelTitle}</strong>
        </div>

        <ol className="coursemap-path">
          {view.zones.map((zone) => (
            <LessonZone
              key={zone.lessonId}
              zone={zone}
              continueLabel={continueLabel}
              problemHref={problemHref}
            />
          ))}
        </ol>
      </div>
    </section>
  )
}
