import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore'
import { FirebaseError } from 'firebase/app'
import type { ProblemAttempt } from '../types/problem'
import { CHAPTER_ID } from '../types/chapter'
import { db } from './firebase'

const ATTEMPTS_PREFIX = 'evl_attempts_'

function attemptsKey(userId: string) {
  return `${ATTEMPTS_PREFIX}${userId}`
}

function readLocalAttempts(userId: string): ProblemAttempt[] {
  try {
    const raw = localStorage.getItem(attemptsKey(userId))
    return raw ? (JSON.parse(raw) as ProblemAttempt[]) : []
  } catch {
    return []
  }
}

function writeLocalAttempts(userId: string, attempts: ProblemAttempt[]) {
  localStorage.setItem(attemptsKey(userId), JSON.stringify(attempts))
}

export async function recordProblemAttempt(
  attempt: Omit<ProblemAttempt, 'attemptId' | 'createdAt'>,
): Promise<void> {
  const attemptId = `${attempt.userId}_${attempt.problemId}_${Date.now()}`
  const record: ProblemAttempt = {
    ...attempt,
    attemptId,
    createdAt: new Date().toISOString(),
  }

  const local = readLocalAttempts(attempt.userId)
  local.push(record)
  writeLocalAttempts(attempt.userId, local)

  if (!db) {
    return
  }

  try {
    await setDoc(doc(collection(db, 'problemAttempts'), attemptId), record)
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'permission-denied') {
      return
    }
    throw error
  }
}

export async function getChapterAttempts(userId: string): Promise<ProblemAttempt[]> {
  const local = readLocalAttempts(userId)

  if (!db) {
    return local.filter((a) => a.chapterId === CHAPTER_ID)
  }

  try {
    const q = query(
      collection(db, 'problemAttempts'),
      where('userId', '==', userId),
      where('chapterId', '==', CHAPTER_ID),
    )
    const snap = await getDocs(q)
    const remote = snap.docs.map((d) => d.data() as ProblemAttempt)

    const merged = new Map<string, ProblemAttempt>()
    for (const a of local) {
      merged.set(a.attemptId, a)
    }
    for (const a of remote) {
      merged.set(a.attemptId, a)
    }
    const all = [...merged.values()].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    writeLocalAttempts(userId, all)
    return all.filter((a) => a.chapterId === CHAPTER_ID)
  } catch {
    return local.filter((a) => a.chapterId === CHAPTER_ID)
  }
}

export function countFinalAttempts(
  attempts: ProblemAttempt[],
  problemId: string,
): number {
  return attempts.filter((a) => a.problemId === problemId && a.stepId === 'final').length
}

export function wasProblemCompletedCorrectly(
  attempts: ProblemAttempt[],
  problemId: string,
): boolean {
  const finals = attempts.filter(
    (a) => a.problemId === problemId && a.stepId === 'final' && a.isCorrect,
  )
  return finals.length > 0
}

export function getMistakeTypesForProblem(
  attempts: ProblemAttempt[],
  problemId: string,
): string[] {
  return attempts
    .filter((a) => a.problemId === problemId && a.mistakeType)
    .map((a) => a.mistakeType as string)
}
