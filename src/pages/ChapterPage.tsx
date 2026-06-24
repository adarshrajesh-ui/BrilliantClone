import { Link } from 'react-router-dom'
import {
  CHAPTER_PROBLEMS,
  CHAPTER_SUBTITLE,
  CHAPTER_TITLE,
  getContinueProblemId,
  getLessonProgressViews,
  MILESTONE_DEFINITIONS,
  TOTAL_LESSONS,
  TOTAL_PROBLEMS,
} from '../data/chapter'
import { resolveToImplementedProblemId } from '../data/implementedProblems'
import { useChapterData } from '../hooks/useChapterData'
import { ChapterSyncBanner } from '../components/SyncWarningBanner'
import { SuggestedReview } from '../components/SuggestedReview'
import { ExpandedCoursePathway, buildCourseMapView } from '../features/course-map'

const CHAPTER_PATH = '/chapter/expected-value-intro'
const problemHref = (problemId: string) => `${CHAPTER_PATH}/problem/${problemId}`

export function ChapterPage() {
  const { progress, milestones, loading, error, syncWarning } = useChapterData()

  if (loading) {
    return (
      <div className="loading-screen chapter-loading">
        <div className="spinner" aria-hidden="true" />
        <p>Loading chapter…</p>
      </div>
    )
  }

  if (error || !progress || !milestones) {
    return (
      <div className="page">
        <section className="card">
          <h1>Chapter unavailable</h1>
          <p>{error ?? 'Could not load your progress.'}</p>
          <Link to="/home" className="btn-secondary">
            Back to home
          </Link>
        </section>
      </div>
    )
  }

  // Route every continue / current affordance to an implemented problem so the
  // learner never lands on a placeholder via "Continue" (direct clicks on a
  // future/placeholder node on the map stay open-access).
  const continueProblemId = resolveToImplementedProblemId(getContinueProblemId(progress))
  const allComplete = progress.completedProblemIds.length === CHAPTER_PROBLEMS.length
  const courseView = buildCourseMapView({
    lessons: getLessonProgressViews(progress.completedProblemIds, continueProblemId, allComplete),
    problems: CHAPTER_PROBLEMS,
    completedProblemIds: progress.completedProblemIds,
    continueProblemId,
    allComplete,
  })

  return (
    <div className="page chapter-page">
      <ChapterSyncBanner message={syncWarning} />
      {error && (
        <div className="sync-banner sync-banner-error" role="alert">
          {error}
        </div>
      )}

      <ExpandedCoursePathway
        view={courseView}
        title={CHAPTER_TITLE}
        subtitle={CHAPTER_SUBTITLE}
        totalLessons={TOTAL_LESSONS}
        totalProblems={TOTAL_PROBLEMS}
        completionPercentage={progress.completionPercentage}
        continueHref={`${CHAPTER_PATH}/problem/${continueProblemId}`}
        problemHref={problemHref}
      />

      <SuggestedReview />

      <section className="card">
        <h2>Milestones</h2>
        <p className="section-note">
          Milestones unlock as you progress through the chapter.
        </p>
        <ul className="milestone-list">
          {MILESTONE_DEFINITIONS.map((milestone) => {
            const unlocked = milestones.unlockedMilestones.includes(milestone.id)
            return (
              <li
                key={milestone.id}
                className={`milestone-item${unlocked ? ' milestone-unlocked' : ' milestone-locked'}`}
              >
                <span className="milestone-icon" aria-hidden="true">
                  {unlocked ? '✓' : '○'}
                </span>
                <div>
                  <span className="milestone-label">{milestone.label}</span>
                  <p className="milestone-description">{milestone.description}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
