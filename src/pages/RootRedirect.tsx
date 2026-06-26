import { Navigate } from 'react-router-dom'
import { PokerChipLoader } from '../components/PokerChipLoader'
import { useAuth } from '../hooks/useAuth'

export function RootRedirect() {
  const { user, loading } = useAuth()

  if (loading) {
    return <PokerChipLoader label="Loading…" />
  }

  return <Navigate to={user ? '/home' : '/login'} replace />
}
