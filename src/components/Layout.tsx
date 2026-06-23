import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Layout() {
  const { user, signOut } = useAuth()

  return (
    <div className="layout">
      <header className="header">
        <Link to="/home" className="brand">
          Expected Value Lab
        </Link>
        {user && (
          <nav className="header-nav">
            <Link to="/home">Home</Link>
            <Link to="/chapter/expected-value-intro">Chapter</Link>
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
