import { Link, useNavigate } from 'react-router-dom'
import { CompactCourseMap } from './CompactCourseMap'
import type { CourseMapView } from './types'

export interface CurrentChapterCardProps {
  title: string
  subtitle: string
  completionPercentage: number
  streakCount: number
  masteryStatus: string
  currentLessonTitle?: string
  currentProblemTitle?: string
  view: CourseMapView
  unlockedMilestones: number
  totalMilestones: number
  /** Route for the Continue / Start / Review action. */
  continueHref: string
  /** Optional "review previous" route (shown only when there is progress). */
  reviewHref?: string
  /** Builds a route for a given problem id (hole selection). */
  problemHref: (problemId: string) => string
}

/**
 * Elevated right-side current-chapter card for the home page. Preserves the
 * original card's content (title, %, streak, mastery, milestones, continue +
 * review previous) and swaps the vertical mini-map for the scalable compact
 * course map. All progression values arrive via props.
 */
export function CurrentChapterCard({
  title,
  subtitle,
  completionPercentage,
  streakCount,
  masteryStatus,
  currentLessonTitle,
  currentProblemTitle,
  view,
  unlockedMilestones,
  totalMilestones,
  continueHref,
  reviewHref,
  problemHref,
}: CurrentChapterCardProps) {
  const navigate = useNavigate()
  const { allComplete, currentHoleOrder, totalHoles } = view
  const hasProgress = completionPercentage > 0
  const continueLabel = allComplete ? 'Review course' : hasProgress ? 'Continue' : 'Start course'

  return (
    <aside className="chapter-progress-card" aria-label="Current chapter progress">
      <div className="cpc-header">
        <p className="cpc-eyebrow">Current chapter</p>
        <h2 className="cpc-title">{title}</h2>
        <p className="cpc-subtitle">{subtitle}</p>
      </div>

      <div className="cpc-stats">
        <div className="cpc-stat cpc-stat-pct">
          <span className="cpc-stat-value">{completionPercentage}%</span>
          <span className="cpc-stat-label">Complete</span>
        </div>
        <div className="cpc-stat">
          <span className="cpc-stat-value">🔥 {streakCount}</span>
          <span className="cpc-stat-label">Day streak</span>
        </div>
        <div className="cpc-stat">
          <span className="cpc-stat-value">{masteryStatus}</span>
          <span className="cpc-stat-label">Mastery</span>
        </div>
      </div>

      <p className="cpc-current">
        {allComplete ? (
          <span className="cpc-current-text">Course complete — replay any problem to review.</span>
        ) : (
          <>
            <span className="cpc-current-flag" aria-hidden="true" />
            <span className="cpc-current-text">
              {currentLessonTitle ? `${currentLessonTitle} · ` : ''}
              Next: <strong>Problem {currentHoleOrder}</strong>
              {currentProblemTitle ? ` · ${currentProblemTitle}` : ''}
            </span>
          </>
        )}
      </p>

      <CompactCourseMap view={view} onSelectHole={(id) => navigate(problemHref(id))} />

      <div className="cpc-milestones" aria-label="Milestones unlocked">
        <span className="cpc-milestones-label">Milestones</span>
        <span className="cpc-milestones-track" aria-hidden="true">
          {Array.from({ length: totalMilestones }).map((_, i) => (
            <span
              key={i}
              className={`cpc-milestone-dot${i < unlockedMilestones ? ' cpc-milestone-on' : ''}`}
            />
          ))}
        </span>
        <span className="cpc-milestones-count">
          {unlockedMilestones}/{totalMilestones}
        </span>
      </div>

      <p className="sr-only">
        {view.completedCount} of {totalHoles} problems complete.
      </p>

      <div className="cpc-actions">
        <Link to={continueHref} className="cpc-btn-primary touch-target">
          {continueLabel}
        </Link>
        {hasProgress && !allComplete && reviewHref && (
          <Link to={reviewHref} className="cpc-btn-ghost touch-target">
            Review previous
          </Link>
        )}
      </div>
    </aside>
  )
}
