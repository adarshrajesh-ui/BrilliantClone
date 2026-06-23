import { Link } from 'react-router-dom'
import {
  CHAPTER_DESCRIPTION,
  CHAPTER_PROBLEMS,
  CHAPTER_TITLE,
  getContinueProblemId,
  MILESTONE_DEFINITIONS,
} from '../data/chapter'
import { useChapterData } from '../hooks/useChapterData'
import { ChapterSyncBanner } from '../components/SyncWarningBanner'
import type { MasteryStatus } from '../types/chapter'

const CHAPTER_PATH = '/chapter/expected-value-intro'

function masteryClass(status: MasteryStatus) {
  switch (status) {
    case 'Mastered':
      return 'mastery-badge mastery-mastered'
    case 'Developing':
      return 'mastery-badge mastery-developing'
    case 'Learning':
      return 'mastery-badge mastery-learning'
    default:
      return 'mastery-badge mastery-not-started'
  }
}

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

  const continueProblemId = getContinueProblemId(progress)
  const allComplete = progress.completedProblemIds.length === CHAPTER_PROBLEMS.length

  return (
    <div className="page chapter-page">
      <ChapterSyncBanner message={syncWarning} />
      {error && (
        <div className="sync-banner sync-banner-error" role="alert">
          {error}
        </div>
      )}
      <header className="chapter-header">
        <div>
          <p className="chapter-eyebrow">Chapter</p>
          <h1>{CHAPTER_TITLE}</h1>
          <p className="chapter-description">{CHAPTER_DESCRIPTION}</p>
        </div>
        <div className={masteryClass(progress.masteryStatus)} aria-label="Mastery status">
          <span className="mastery-label">Mastery</span>
          <span className="mastery-value">{progress.masteryStatus}</span>
        </div>
      </header>

      <section className="card chapter-stats">
        <div className="stat-grid">
          <div className="stat-item">
            <span className="stat-label">Completion</span>
            <span className="stat-value">{progress.completionPercentage}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Streak</span>
            <span className="stat-value">
              {progress.streakCount} day{progress.streakCount === 1 ? '' : 's'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Problems done</span>
            <span className="stat-value">
              {progress.completedProblemIds.length} / {CHAPTER_PROBLEMS.length}
            </span>
          </div>
        </div>

        <div className="progress-bar" role="progressbar" aria-valuenow={progress.completionPercentage} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="progress-bar-fill"
            style={{ width: `${progress.completionPercentage}%` }}
          />
        </div>

        <div className="continue-row">
          <Link
            to={`${CHAPTER_PATH}/problem/${continueProblemId}`}
            className="btn-secondary"
          >
            {allComplete ? 'Review problems' : 'Continue'}
          </Link>
          {!allComplete && (
            <p className="continue-hint">
              Pick up at Problem {CHAPTER_PROBLEMS.findIndex((p) => p.problemId === continueProblemId) + 1}
            </p>
          )}
        </div>
      </section>

      <section className="card">
        <h2>Problems</h2>
        <ol className="problem-list">
          {CHAPTER_PROBLEMS.map((problem) => {
            const isComplete = progress.completedProblemIds.includes(problem.problemId)
            const isCurrent = problem.problemId === continueProblemId && !allComplete

            return (
              <li
                key={problem.problemId}
                className={`problem-item${isComplete ? ' problem-complete' : ''}${isCurrent ? ' problem-current' : ''}`}
              >
                <div className="problem-item-main">
                  <span className="problem-number">{problem.order}</span>
                  <div>
                    <Link
                      to={`${CHAPTER_PATH}/problem/${problem.problemId}`}
                      className="problem-title"
                    >
                      {problem.title}
                    </Link>
                    <p className="problem-concept">{problem.concept}</p>
                  </div>
                </div>
                <span className="problem-status">
                  {isComplete ? 'Complete' : isCurrent ? 'Up next' : 'Not started'}
                </span>
              </li>
            )
          })}
        </ol>
      </section>

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
