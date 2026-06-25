import { Link, Outlet } from 'react-router-dom'
import { SyncWarningBanner } from './SyncWarningBanner'
import { useAuth } from '../hooks/useAuth'

export function Layout() {
  const { user, signOut } = useAuth()

  return (
    <div className="layout">
      <SyncWarningBanner />
      <header className="header">
        <Link to="/home" className="brand">
          Midpoint
        </Link>
        {user && (
          <nav className="header-nav">
            <Link to="/home">Home</Link>
            <Link to="/chapter/expected-value-intro">Course map</Link>
            <Link to="/profile">Profile</Link>
            <button type="button" className="btn-text" onClick={() => void signOut()}>
              Sign out
            </button>
          </nav>
        )}
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
