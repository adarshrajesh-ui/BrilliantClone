import { Link } from 'react-router-dom'
import { resolveToImplementedProblemId } from '../data/implementedProblems'
import { useChapterData } from '../hooks/useChapterData'
import { ChapterSyncBanner } from '../components/SyncWarningBanner'
import { getContinueProblemId } from '../data/chapter'

const CHAPTER_PATH = '/chapter/expected-value-intro'
const problemHref = (problemId: string) => `${CHAPTER_PATH}/problem/${problemId}`

const streakDays = ['Th', 'F', 'S', 'Su', 'M']

const lessonThumbnails = [
  { label: 'Warm Up', theme: 'coins' },
  { label: 'Decks', theme: 'hands' },
  { label: 'Chance', theme: 'tower' },
  { label: 'Lightbulb', theme: 'bulb' },
  { label: 'Notebook', theme: 'book' },
]

function CourseHeroArt() {
  return (
    <div className="br-course-art" aria-hidden="true">
      <div className="br-coin br-coin-back" />
      <div className="br-coin br-coin-front">
        <span>★</span>
      </div>
      <div className="br-dice br-dice-one">
        <span />
        <span />
        <span />
      </div>
      <div className="br-dice br-dice-two">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="br-ribbon" />
    </div>
  )
}

function ThumbnailArt({ theme }: { theme: string }) {
  return (
    <span className={`br-thumb-art br-thumb-${theme}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  )
}

export function HomePage() {
  const { progress, loading, syncWarning } = useChapterData()
  const continueProblemId = resolveToImplementedProblemId(
    progress ? getContinueProblemId(progress) : 'problem-1',
  )
  const completedCount = progress?.completedProblemIds.length ?? 0
  const isStarted = completedCount > 0
  const startLabel = loading ? 'Loading…' : isStarted ? 'Continue' : 'Start'

  return (
    <div className="br-home-page">
      <ChapterSyncBanner message={syncWarning} />

      <section className="br-premium-strip" aria-label="Premium promotion">
        <span className="br-premium-mascot" aria-hidden="true">
          ✨
        </span>
        <span>Subscribe to Premium and save 20%. </span>
        <Link to="/profile">Go Premium</Link>
      </section>

      <div className="br-home-shell">
        <aside className="br-side-rail" aria-label="Learning status">
          <form className="br-search" role="search">
            <span aria-hidden="true">⌕</span>
            <label className="sr-only" htmlFor="home-search">
              Search what to learn
            </label>
            <input id="home-search" type="search" placeholder="What do you want to learn?" />
            <button type="submit">Ask</button>
          </form>

          <section className="br-streak-card" aria-label="Daily streak">
            <div className="br-streak-top">
              <div>
                <strong>0</strong>
                <span aria-hidden="true">⚡</span>
              </div>
              <span className="br-streak-controls" aria-hidden="true">
                <i />
                <i />
              </span>
            </div>
            <p>Solve 3 problems to start a streak</p>
            <div className="br-week-row">
              {streakDays.map((day) => (
                <span key={day} className="br-day">
                  <i aria-hidden="true">⚡</i>
                  <b>{day}</b>
                </span>
              ))}
            </div>
          </section>

          <section className="br-premium-card" aria-label="Premium upsell">
            <p>
              <span aria-hidden="true">💫</span>
              <strong>Unlock all learning with Premium</strong>
              <small>to get smarter, faster</small>
            </p>
            <Link to="/profile">Explore Premium</Link>
          </section>

          <section className="br-league-card" aria-label="League progress">
            <span className="br-league-badge" aria-hidden="true">
              ♙
            </span>
            <p>
              <strong>Unlock Leagues</strong>
              <small>170 of 175 XP</small>
            </p>
          </section>
        </aside>

        <main className="br-course-stage" aria-label="Current course">
          <section className="br-course-card">
            <div className="br-card-stack br-card-stack-one" aria-hidden="true" />
            <div className="br-card-stack br-card-stack-two" aria-hidden="true" />

            <div className="br-course-content">
              <p className="br-course-title">Probability and Chance</p>
              <p className="br-level">Level 1</p>
              <CourseHeroArt />

              <div className="br-lesson-list">
                <div className="br-lesson-row br-lesson-active">
                  <span className="br-lesson-icon" aria-hidden="true">
                    🐭
                  </span>
                  <span>Warm Up</span>
                  <i aria-hidden="true" />
                </div>
                <div className="br-lesson-row br-lesson-locked">
                  <span className="br-lesson-icon" aria-hidden="true" />
                  <span>Multiple Decks</span>
                  <i aria-hidden="true" />
                </div>
              </div>

              <Link to={problemHref(continueProblemId)} className="br-start-button">
                {startLabel}
              </Link>
            </div>
          </section>

          <div className="br-thumbnail-row" aria-label="Course sections">
            {lessonThumbnails.map((item, index) => (
              <Link
                key={item.label}
                to={index === 0 ? problemHref(continueProblemId) : CHAPTER_PATH}
                className={index === 0 ? 'br-thumb br-thumb-active' : 'br-thumb'}
                aria-label={item.label}
              >
                <ThumbnailArt theme={item.theme} />
              </Link>
            ))}
          </div>

          {isStarted && (
            <p className="br-progress-note">
              {completedCount} problems complete. Continue where you left off.
            </p>
          )}
        </main>
      </div>
    </div>
  )
}
