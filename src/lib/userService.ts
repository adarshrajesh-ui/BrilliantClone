import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { db } from './firebase'
import type { UserProfile } from '../types/user'

function requireDb() {
  if (!db) {
    throw new Error('Firestore is not configured')
  }
  return db
}

export async function ensureUserProfile(firebaseUser: User): Promise<UserProfile> {
  const firestore = requireDb()
  const userRef = doc(firestore, 'users', firebaseUser.uid)
  const now = new Date().toISOString()
  const snapshot = await getDoc(userRef)

  if (!snapshot.exists()) {
    const profile: UserProfile = {
      userId: firebaseUser.uid,
      displayName: firebaseUser.displayName ?? '',
      email: firebaseUser.email ?? '',
      createdAt: now,
      lastLoginAt: now,
    }
    await setDoc(userRef, profile)
    return profile
  }

  await updateDoc(userRef, { lastLoginAt: now })

  return {
    ...(snapshot.data() as UserProfile),
    lastLoginAt: now,
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const firestore = requireDb()
  const snapshot = await getDoc(doc(firestore, 'users', userId))
  if (!snapshot.exists()) {
    return null
  }
  return snapshot.data() as UserProfile
}
