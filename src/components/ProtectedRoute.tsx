import { Navigate } from 'react-router-dom'
import { PokerChipLoader } from './PokerChipLoader'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <PokerChipLoader label="Loading…" />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
