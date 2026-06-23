import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" aria-hidden="true" />
        <p>Loading…</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/home" replace />
  }

  return children
}
