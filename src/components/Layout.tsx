import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { SyncWarningBanner } from './SyncWarningBanner'
import { useAuth } from '../hooks/useAuth'
import { useStreak } from '../hooks/useStreak'
import { getDisplayStreak } from '../lib/streakService'
import { getLessonHeaderProgress } from '../data/chapter'

export function Layout() {
  const { user, profile, isGuest, signOut } = useAuth()
  const { streak } = useStreak()
  // Honest, decay-aware display value: a lapsed streak reads 0 without waiting
  // for the next activity to persist a reset.
  const displayStreak = getDisplayStreak(streak)
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const problemRouteMatch = location.pathname.match(/^\/chapter\/expected-value-intro\/problem\/([^/]+)/)
  const currentProblemId = problemRouteMatch ? decodeURIComponent(problemRouteMatch[1]) : undefined
  const lessonHeaderProgress = currentProblemId ? getLessonHeaderProgress(currentProblemId) : undefined
  const lessonFillPercent = lessonHeaderProgress?.fillPercent ?? 0
  const upcomingLessonDots = lessonHeaderProgress?.upcomingLessons ?? 0
  const lessonMode = !!problemRouteMatch

  useEffect(() => {
    if (!menuOpen) return

    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <div className={`layout${lessonMode ? ' lesson-mode' : ''}`}>
      <SyncWarningBanner />
      {lessonMode ? (
        <header className="header lesson-header" aria-label="Lesson position">
          <Link to="/chapter/expected-value-intro" className="lesson-close" aria-label="Close lesson">
            ×
          </Link>
          <div className="lesson-progress">
            <div
              className="lesson-progress-track"
              role="progressbar"
              aria-label="Lesson position"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(lessonFillPercent)}
              aria-valuetext={lessonHeaderProgress?.ariaValueText ?? 'Lesson progress unavailable'}
            >
              <span
                className="lesson-progress-fill"
                style={{ width: `${lessonFillPercent}%` }}
                aria-hidden="true"
              />
            </div>
            {upcomingLessonDots > 0 && (
              <div className="lesson-progress-dots" aria-hidden="true">
                {Array.from({ length: upcomingLessonDots }, (_, i) => (
                  <span key={i} className="lesson-progress-dot" />
                ))}
              </div>
            )}
          </div>
          <div className="lesson-header-actions" aria-hidden="true" />
        </header>
      ) : (
        <header className="header">
          <Link to="/home" className="brand">
            Midpoint
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
                  className={({ isActive }) =>
                    isActive || location.pathname.startsWith('/chapter/expected-value-intro')
                      ? 'active'
                      : undefined
                  }
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
                <span
                  className={`status-pill${displayStreak === 0 ? ' status-pill-muted' : ''}`}
                  aria-label={
                    displayStreak === 0
                      ? 'No active streak yet'
                      : `${displayStreak}-day streak`
                  }
                >
                  <strong>{displayStreak}</strong>
                  <span aria-hidden="true">🔥</span>
                </span>
                <div className="menu" ref={menuRef}>
                  <button
                    type="button"
                    className="menu-button"
                    aria-label="Account menu"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((open) => !open)}
                  >
                    ☰
                  </button>
                  {menuOpen && (
                    <div className="menu-dropdown" role="menu">
                      <nav className="menu-nav-mobile" aria-label="Primary navigation">
                        <NavLink
                          to="/home"
                          role="menuitem"
                          className={({ isActive }) => (isActive ? 'active' : undefined)}
                          onClick={() => setMenuOpen(false)}
                        >
                          <span className="nav-icon" aria-hidden="true">
                            ⌂
                          </span>
                          Home
                        </NavLink>
                        <NavLink
                          to="/chapter/expected-value-intro"
                          role="menuitem"
                          className={({ isActive }) =>
                            isActive || location.pathname.startsWith('/chapter/expected-value-intro')
                              ? 'active'
                              : undefined
                          }
                          onClick={() => setMenuOpen(false)}
                        >
                          <span className="nav-icon" aria-hidden="true">
                            ◇
                          </span>
                          Courses
                        </NavLink>
                        <NavLink
                          to="/practice"
                          role="menuitem"
                          className={({ isActive }) => (isActive ? 'active' : undefined)}
                          onClick={() => setMenuOpen(false)}
                        >
                          <span className="nav-icon" aria-hidden="true">
                            ◎
                          </span>
                          Practice
                        </NavLink>
                      </nav>
                      <div className="menu-user">
                        <span className="menu-user-name">{profile?.displayName || 'Guest'}</span>
                        {isGuest ? (
                          <>
                            <span className="menu-user-role">Guest mode</span>
                            <span className="menu-user-status">
                              Progress saved on this device
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="menu-user-role">Signed in</span>
                            {(profile?.email || user.email) && (
                              <span className="menu-user-status">
                                {profile?.email || user.email}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <button
                        type="button"
                        className="menu-item"
                        role="menuitem"
                        onClick={() => {
                          void signOut()
                          setMenuOpen(false)
                        }}
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
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
