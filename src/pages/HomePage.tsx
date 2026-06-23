import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useChapterData } from '../hooks/useChapterData'
import { CHAPTER_TITLE } from '../data/chapter'

export function HomePage() {
  const { profile } = useAuth()
  const { progress, loading } = useChapterData()
  const displayName = profile?.displayName || 'Learner'

  return (
    <div className="page">
      <section className="card">
        <h1>Welcome, {displayName}</h1>
        <p>
          Learn expected value through visual, interactive problems — no AI, just
          hand-built feedback and hints.
        </p>
      </section>

      <section className="card chapter-card">
        <p className="chapter-eyebrow">Your chapter</p>
        <h2>{CHAPTER_TITLE}</h2>
        <p>8 problems · observe → predict → construct → decide</p>

        {!loading && progress && (
          <div className="home-progress">
            <div className="progress-bar" role="progressbar" aria-valuenow={progress.completionPercentage} aria-valuemin={0} aria-valuemax={100}>
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
        )}

        <Link to="/chapter/expected-value-intro" className="btn-secondary">
          {progress && progress.completionPercentage > 0 ? 'Continue chapter' : 'Start chapter'}
        </Link>
      </section>
    </div>
  )
}
