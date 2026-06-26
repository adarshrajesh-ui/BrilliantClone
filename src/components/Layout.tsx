import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { SyncWarningBanner } from './SyncWarningBanner'
import { useAuth } from '../hooks/useAuth'
import { TOTAL_PROBLEMS, getProblemMeta } from '../data/chapter'

export function Layout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const problemRouteMatch = location.pathname.match(/^\/chapter\/expected-value-intro\/problem\/([^/]+)/)
  const currentProblemId = problemRouteMatch ? decodeURIComponent(problemRouteMatch[1]) : undefined
  const currentProblemMeta = currentProblemId ? getProblemMeta(currentProblemId) : undefined
  const currentProblemNumber = currentProblemMeta ? currentProblemMeta.globalProblemIndex + 1 : 0
  const lessonMode = !!problemRouteMatch

  return (
    <div className={`layout${lessonMode ? ' lesson-mode' : ''}`}>
      <SyncWarningBanner />
      {lessonMode ? (
        <header className="header lesson-header" aria-label="Lesson progress">
          <Link to="/chapter/expected-value-intro" className="lesson-close" aria-label="Close lesson">
            ×
          </Link>
          <div
            className="lesson-progress-track"
            role="progressbar"
            aria-label="Lesson progress"
            aria-valuemin={0}
            aria-valuemax={TOTAL_PROBLEMS}
            aria-valuenow={currentProblemNumber}
            aria-valuetext={
              currentProblemNumber > 0
                ? `Problem ${currentProblemNumber} of ${TOTAL_PROBLEMS}`
                : `0 of ${TOTAL_PROBLEMS} problems`
            }
          >
            {Array.from({ length: TOTAL_PROBLEMS }, (_, index) => {
              const segmentNumber = index + 1
              const segmentClass = [
                'lesson-progress-segment',
                segmentNumber <= currentProblemNumber ? 'lesson-progress-segment-active' : '',
                segmentNumber === currentProblemNumber ? 'lesson-progress-segment-current' : '',
              ]
                .filter(Boolean)
                .join(' ')

              return <span key={segmentNumber} className={segmentClass} aria-hidden="true" />
            })}
          </div>
          <div className="lesson-header-actions" aria-label="Lesson rewards">
            <span className="lesson-reward" aria-label="15 experience points">
              <strong>15</strong>
              <span aria-hidden="true">✦</span>
            </span>
            <span className="lesson-reward lesson-reward-energy" aria-label="Streak energy">
              <span aria-hidden="true">⚡</span>
            </span>
          </div>
        </header>
      ) : (
        <header className="header">
          <Link to="/home" className="brand">
            Brilliant
          </Link>
          {user && (
            <>
              <nav className="header-nav" aria-label="Primary navigation">
                <NavLink to="/home" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  <span className="nav-icon" aria-hidden="true">
                    ⌂
                  </span>
                  Home
                </NavLink>
                <NavLink
                  to="/chapter/expected-value-intro"
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                >
                  <span className="nav-icon" aria-hidden="true">
                    ◇
                  </span>
                  Courses
                </NavLink>
                <NavLink to="/practice" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  <span className="nav-icon" aria-hidden="true">
                    ◎
                  </span>
                  Practice
                </NavLink>
              </nav>

              <div className="header-actions">
                <Link to="/profile" className="premium-pill">
                  Go Premium
                </Link>
                <span className="status-pill" aria-label="Two day streak">
                  <strong>2</strong>
                  <span aria-hidden="true">🔥</span>
                </span>
                <span className="status-pill status-pill-muted" aria-label="Zero gems">
                  <strong>0</strong>
                  <span aria-hidden="true">✧</span>
                </span>
                <button
                  type="button"
                  className="menu-button"
                  aria-label="Sign out"
                  title="Sign out"
                  onClick={() => void signOut()}
                >
                  ☰
                </button>
              </div>
            </>
          )}
        </header>
      )}
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
