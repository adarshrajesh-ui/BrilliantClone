import { collection, doc, setDoc } from 'firebase/firestore'
import { FirebaseError } from 'firebase/app'
import type { ProblemAttempt } from '../types/problem'
import { db } from './firebase'

function requireDb() {
  if (!db) {
    return null
  }
  return db
}

export async function recordProblemAttempt(
  attempt: Omit<ProblemAttempt, 'attemptId' | 'createdAt'>,
): Promise<void> {
  const firestore = requireDb()
  const attemptId = `${attempt.userId}_${attempt.problemId}_${Date.now()}`
  const record: ProblemAttempt = {
    ...attempt,
    attemptId,
    createdAt: new Date().toISOString(),
  }

  if (!firestore) {
    return
  }

  try {
    await setDoc(doc(collection(firestore, 'problemAttempts'), attemptId), record)
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'permission-denied') {
      return
    }
    throw error
  }
}
