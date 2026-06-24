import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { resolveToImplementedProblemId } from '../data/implementedProblems'
import { useAuth } from '../hooks/useAuth'
import { useChapterData } from '../hooks/useChapterData'
import { ChapterSyncBanner } from '../components/SyncWarningBanner'
import { SuggestedReview } from '../components/SuggestedReview'
import { CurrentChapterCard, buildCourseMapView } from '../features/course-map'
import {
  CHAPTER_LESSONS,
  CHAPTER_PROBLEMS,
  CHAPTER_TITLE,
  getContinueProblemId,
  getCurrentLessonId,
  getLessonProgressViews,
  getProblemById,
  MILESTONE_DEFINITIONS,
} from '../data/chapter'

const CHAPTER_PATH = '/chapter/expected-value-intro'
const problemHref = (problemId: string) => `${CHAPTER_PATH}/problem/${problemId}`

export function HomePage() {
  const { profile } = useAuth()
  const { progress, milestones, loading, syncWarning } = useChapterData()
  const displayName = profile?.displayName || 'Learner'
  // Resolve to an implemented problem so the "Continue" affordance never targets
  // an unimplemented placeholder.
  const continueProblemId = resolveToImplementedProblemId(
    progress ? getContinueProblemId(progress) : 'problem-1',
  )

  let card: ReactNode = null
  if (progress) {
    const allComplete = progress.completedProblemIds.length === CHAPTER_PROBLEMS.length
    const lessons = getLessonProgressViews(
      progress.completedProblemIds,
      continueProblemId,
      allComplete,
    )
    const view = buildCourseMapView({
      lessons,
      problems: CHAPTER_PROBLEMS,
      completedProblemIds: progress.completedProblemIds,
      continueProblemId,
      allComplete,
    })
    const currentLessonId = getCurrentLessonId(continueProblemId)
    const currentLessonTitle = CHAPTER_LESSONS.find((l) => l.lessonId === currentLessonId)?.title
    const currentProblemTitle = getProblemById(continueProblemId)?.title

    card = (
      <CurrentChapterCard
        title="Expected Value Course"
        subtitle="Master long-run average, payout, profit, fairness, and risk."
        completionPercentage={progress.completionPercentage}
        streakCount={progress.streakCount}
        masteryStatus={progress.masteryStatus}
        currentLessonTitle={currentLessonTitle}
        currentProblemTitle={currentProblemTitle}
        view={view}
        unlockedMilestones={milestones?.unlockedMilestones.length ?? 0}
        totalMilestones={MILESTONE_DEFINITIONS.length}
        continueHref={problemHref(continueProblemId)}
        reviewHref={CHAPTER_PATH}
        problemHref={problemHref}
      />
    )
  }

  return (
    <div className="page home-page">
      <ChapterSyncBanner message={syncWarning} />

      <div className="home-layout">
        <div className="home-main">
          <section className="card hero-card">
            <h1>Welcome, {displayName}</h1>
            <p>
              Learn expected value through visual, interactive problems — no AI, just
              hand-built feedback and hints.
            </p>
          </section>

          <section className="card chapter-card">
            <p className="chapter-eyebrow">Your chapter</p>
            <h2>{CHAPTER_TITLE}</h2>
            <p>
              {CHAPTER_LESSONS.length} lessons · {CHAPTER_PROBLEMS.length} problems · observe →
              predict → construct → decide
            </p>

            {loading ? (
              <p className="home-progress-text">Loading your progress…</p>
            ) : progress ? (
              <div className="home-progress">
                <div
                  className="progress-bar"
                  role="progressbar"
                  aria-valuenow={progress.completionPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${progress.completionPercentage}%` }}
                  />
                </div>
                <p className="home-progress-text">
                  {progress.completionPercentage}% complete · {progress.masteryStatus} ·{' '}
                  {progress.streakCount}-day streak
                </p>
              </div>
            ) : null}

            <Link to="/chapter/expected-value-intro" className="btn-secondary touch-target">
              {progress && progress.completionPercentage > 0 ? 'Continue chapter' : 'Start chapter'}
            </Link>
          </section>

          <SuggestedReview />

          <section className="card">
            <h2>How it works</h2>
            <ol className="how-it-works">
              <li>Sign in with Google — your progress saves automatically.</li>
              <li>
                Work through {CHAPTER_LESSONS.length} lessons ({CHAPTER_PROBLEMS.length} visual
                problems) on expected value.
              </li>
              <li>Get instant, specific feedback — every answer is hand-built.</li>
            </ol>
          </section>
        </div>

        {card && <div className="home-aside">{card}</div>}
      </div>
    </div>
  )
}
