import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../lib/firebase'
import { getAuthErrorMessage, getFirestoreErrorMessage } from '../lib/authErrors'
import { ensureUserProfile } from '../lib/userService'
import {
  createGuestProfile,
  createGuestUser,
  endGuestSession,
  isGuestSessionActive,
  startGuestSession,
} from '../lib/guestSession'
import type { UserProfile } from '../types/user'

export interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isGuest: boolean
  firebaseConfigured: boolean
  authError: string | null
  profileSyncWarning: string | null
  signInWithGoogle: () => Promise<void>
  signInAsGuest: () => void
  signOut: () => Promise<void>
  clearAuthError: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

function profileFromUser(firebaseUser: User): UserProfile {
  const now = new Date().toISOString()
  return {
    userId: firebaseUser.uid,
    displayName: firebaseUser.displayName ?? '',
    email: firebaseUser.email ?? '',
    createdAt: now,
    lastLoginAt: now,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState<boolean>(() => isGuestSessionActive())
  const [authError, setAuthError] = useState<string | null>(null)
  const [profileSyncWarning, setProfileSyncWarning] = useState<string | null>(null)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        // A real Google sign-in supersedes any local guest session.
        endGuestSession()
        setIsGuest(false)
        setAuthError(null)
        try {
          const userProfile = await ensureUserProfile(firebaseUser)
          setProfile(userProfile)
          setProfileSyncWarning(null)
        } catch (error) {
          console.error('Failed to sync user profile:', error)
          setProfile(profileFromUser(firebaseUser))
          setProfileSyncWarning(getFirestoreErrorMessage(error))
        }
      } else {
        setProfile(null)
        setProfileSyncWarning(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      setAuthError('Firebase is not configured. Add your .env file first.')
      return
    }

    setAuthError(null)

    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      await signInWithPopup(auth, provider)
    } catch (error) {
      const message = getAuthErrorMessage(error)
      if (message) {
        setAuthError(message)
      }
    }
  }, [])

  const signInAsGuest = useCallback(() => {
    setAuthError(null)
    startGuestSession()
    setIsGuest(true)
  }, [])

  const signOut = useCallback(async () => {
    setAuthError(null)
    setProfileSyncWarning(null)

    // Leaving guest mode only clears the local guest session.
    endGuestSession()
    setIsGuest(false)

    if (auth?.currentUser) {
      await firebaseSignOut(auth)
    }
  }, [])

  const clearAuthError = useCallback(() => {
    setAuthError(null)
  }, [])

  // A real Firebase user always takes precedence over the local guest session.
  const guestActive = isGuest && !user
  // Memoize so the synthetic guest objects keep a stable identity across
  // renders (consumers like useChapterData key effects off `user`).
  const guestUser = useMemo(
    () => (guestActive ? createGuestUser() : null),
    [guestActive],
  )
  const guestProfile = useMemo(
    () => (guestActive ? createGuestProfile() : null),
    [guestActive],
  )
  const effectiveUser = user ?? guestUser
  const effectiveProfile = user ? profile : guestProfile

  const value = useMemo<AuthContextValue>(
    () => ({
      user: effectiveUser,
      profile: effectiveProfile,
      loading,
      isGuest: guestActive,
      firebaseConfigured: isFirebaseConfigured(),
      authError,
      profileSyncWarning,
      signInWithGoogle,
      signInAsGuest,
      signOut,
      clearAuthError,
    }),
    [
      effectiveUser,
      effectiveProfile,
      loading,
      guestActive,
      authError,
      profileSyncWarning,
      signInWithGoogle,
      signInAsGuest,
      signOut,
      clearAuthError,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
