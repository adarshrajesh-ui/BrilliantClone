import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useChapterData } from '../hooks/useChapterData'
import { ChapterSyncBanner } from '../components/SyncWarningBanner'
import { SuggestedReview } from '../components/SuggestedReview'
import { ChapterProgressCard } from '../components/ChapterProgressCard'
import { CHAPTER_TITLE, getContinueProblemId } from '../data/chapter'

export function HomePage() {
  const { profile } = useAuth()
  const { progress, milestones, loading, syncWarning } = useChapterData()
  const displayName = profile?.displayName || 'Learner'
  const continueProblemId = progress ? getContinueProblemId(progress) : 'problem-1'

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
            <p>5 lessons · 8 problems · observe → predict → construct → decide</p>

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
              <li>Work through 5 lessons (8 visual problems) on expected value.</li>
              <li>Get instant, specific feedback — every answer is hand-built.</li>
            </ol>
          </section>
        </div>

        {progress && (
          <div className="home-aside">
            <ChapterProgressCard
              progress={progress}
              milestones={milestones}
              continueProblemId={continueProblemId}
            />
          </div>
        )}
      </div>
    </div>
  )
}
