import { doc, getDoc, setDoc } from 'firebase/firestore'
import { FirebaseError } from 'firebase/app'
import type { ProblemSession } from '../types/chapter'
import { CHAPTER_ID } from '../types/chapter'
import { db } from './firebase'
import {
  createEmptySession,
  readLocalProblemSession,
  writeLocalProblemSession,
  clearLocalProblemSession,
} from './localProgressStore'

function sessionDocId(userId: string, problemId: string) {
  return `${userId}_${problemId}`
}

export async function loadProblemSession(
  userId: string,
  problemId: string,
): Promise<ProblemSession> {
  const local = readLocalProblemSession(userId, problemId)

  if (!db) {
    return local ?? createEmptySession(userId, problemId)
  }

  try {
    const ref = doc(db, 'problemSessions', sessionDocId(userId, problemId))
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      return local ?? createEmptySession(userId, problemId)
    }
    const remote = snap.data() as ProblemSession
    writeLocalProblemSession(remote)
    return remote
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'permission-denied') {
      return local ?? createEmptySession(userId, problemId)
    }
    return local ?? createEmptySession(userId, problemId)
  }
}

export async function saveProblemSession(
  userId: string,
  problemId: string,
  state: Record<string, unknown>,
  revealedHintIds: string[],
): Promise<void> {
  const session: ProblemSession = {
    userId,
    chapterId: CHAPTER_ID,
    problemId,
    state,
    revealedHintIds,
    updatedAt: new Date().toISOString(),
  }

  writeLocalProblemSession(session)

  if (!db) {
    return
  }

  try {
    await setDoc(doc(db, 'problemSessions', sessionDocId(userId, problemId)), session)
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'permission-denied') {
      return
    }
    throw error
  }
}

export async function clearProblemSession(userId: string, problemId: string): Promise<void> {
  clearLocalProblemSession(userId, problemId)
  if (!db) {
    return
  }
  try {
    await setDoc(doc(db, 'problemSessions', sessionDocId(userId, problemId)), {
      userId,
      chapterId: CHAPTER_ID,
      problemId,
      state: {},
      revealedHintIds: [],
      updatedAt: new Date().toISOString(),
    })
  } catch {
    /* local cleared */
  }
}
