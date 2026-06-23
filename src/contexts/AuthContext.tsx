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
import type { UserProfile } from '../types/user'

export interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  firebaseConfigured: boolean
  authError: string | null
  profileSyncWarning: string | null
  signInWithGoogle: () => Promise<void>
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

  const signOut = useCallback(async () => {
    if (!auth) {
      return
    }

    setAuthError(null)
    setProfileSyncWarning(null)
    await firebaseSignOut(auth)
  }, [])

  const clearAuthError = useCallback(() => {
    setAuthError(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      firebaseConfigured: isFirebaseConfigured(),
      authError,
      profileSyncWarning,
      signInWithGoogle,
      signOut,
      clearAuthError,
    }),
    [
      user,
      profile,
      loading,
      authError,
      profileSyncWarning,
      signInWithGoogle,
      signOut,
      clearAuthError,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
