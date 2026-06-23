import { FirebaseError } from 'firebase/app'

const BENIGN_AUTH_CODES = new Set([
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
])

export function getAuthErrorMessage(error: unknown): string | null {
  if (!(error instanceof FirebaseError)) {
    return error instanceof Error ? error.message : 'Sign in failed'
  }

  if (BENIGN_AUTH_CODES.has(error.code)) {
    return null
  }

  switch (error.code) {
    case 'auth/popup-blocked':
      return 'Pop-up was blocked. Allow pop-ups for this site and try again.'
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase. Add it under Authentication → Settings → Authorized domains.'
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled. Enable it in Firebase Authentication.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.'
    default:
      return error.message
  }
}

export function getFirestoreErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError && error.code === 'permission-denied') {
    return 'Firestore permission denied. Deploy rules with: firebase deploy --only firestore:rules'
  }
  return error instanceof Error ? error.message : 'Could not sync with Firestore'
}
