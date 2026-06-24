import type { User } from 'firebase/auth'
import type { UserProfile } from '../types/user'

/**
 * Local guest mode: lets users try the app without Google sign-in.
 *
 * A guest is a purely local app session. It uses a stable, well-known id so
 * that all existing progress code (which keys off `user.uid`) keeps working
 * unchanged. Guest progress is written to localStorage; Firestore writes are
 * rejected by the security rules (request.auth == null) and the progress
 * services already fall back to localStorage on permission-denied, so guest
 * data never persists server-side.
 */
export const GUEST_USER_ID = 'guest'

const GUEST_SESSION_KEY = 'evl_guest_session'

export function isGuestSessionActive(): boolean {
  try {
    return localStorage.getItem(GUEST_SESSION_KEY) != null
  } catch {
    return false
  }
}

/** Marks the guest session active and returns its createdAt timestamp. */
export function startGuestSession(): string {
  const createdAt = new Date().toISOString()
  try {
    localStorage.setItem(GUEST_SESSION_KEY, createdAt)
  } catch {
    // Ignore storage failures; guest mode still works for the current tab.
  }
  return createdAt
}

export function endGuestSession() {
  try {
    localStorage.removeItem(GUEST_SESSION_KEY)
  } catch {
    // Ignore storage failures.
  }
}

function guestCreatedAt(): string {
  try {
    return localStorage.getItem(GUEST_SESSION_KEY) ?? new Date().toISOString()
  } catch {
    return new Date().toISOString()
  }
}

/**
 * A synthetic, Firebase-User-shaped object for guest mode. The app only reads
 * `user.uid`, so a minimal stand-in is safe. Cast through `unknown` because we
 * intentionally do not implement the full Firebase `User` surface.
 */
export function createGuestUser(): User {
  return {
    uid: GUEST_USER_ID,
    email: null,
    displayName: 'Guest',
    photoURL: null,
    emailVerified: false,
    isAnonymous: false,
    providerData: [],
  } as unknown as User
}

export function createGuestProfile(): UserProfile {
  const createdAt = guestCreatedAt()
  return {
    userId: GUEST_USER_ID,
    displayName: 'Guest',
    email: '',
    createdAt,
    lastLoginAt: new Date().toISOString(),
  }
}
