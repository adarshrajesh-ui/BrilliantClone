import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function RootRedirect() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" aria-hidden="true" />
        <p>Loading…</p>
      </div>
    )
  }

  return <Navigate to={user ? '/home' : '/login'} replace />
}
