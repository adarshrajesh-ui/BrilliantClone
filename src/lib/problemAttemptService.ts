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
import {
  isGradedAttemptMode,
  normalizeAttemptMode,
} from '../core/persistence/migration'
import { normalizeToStorageId } from '../core/progression/canonical'

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
    // Default safely so older callers (and old documents) are always `graded`.
    attemptMode: normalizeAttemptMode(attempt.attemptMode),
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
    return withDefaultedMode(local.filter((a) => a.chapterId === CHAPTER_ID))
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
    return withDefaultedMode(all.filter((a) => a.chapterId === CHAPTER_ID))
  } catch {
    return withDefaultedMode(local.filter((a) => a.chapterId === CHAPTER_ID))
  }
}

/** Read normalization: every returned attempt has a concrete attemptMode. */
function withDefaultedMode(attempts: ProblemAttempt[]): ProblemAttempt[] {
  return attempts.map((a) => ({ ...a, attemptMode: normalizeAttemptMode(a.attemptMode) }))
}

/** True when two IDs reference the same problem (tolerant of slug vs storage). */
function sameProblem(a: string, b: string): boolean {
  if (a === b) {
    return true
  }
  return normalizeToStorageId(a) === normalizeToStorageId(b)
}

export function countFinalAttempts(
  attempts: ProblemAttempt[],
  problemId: string,
): number {
  return attempts.filter((a) => sameProblem(a.problemId, problemId) && a.stepId === 'final').length
}

/**
 * Final graded attempts, EXCLUDING practice restarts. This is the count mastery
 * uses for the "<= 2 graded attempts" rule, so practice repetitions can never
 * inflate it or reduce earned mastery.
 */
export function countGradedFinalAttempts(
  attempts: ProblemAttempt[],
  problemId: string,
): number {
  return attempts.filter(
    (a) =>
      sameProblem(a.problemId, problemId) &&
      a.stepId === 'final' &&
      isGradedAttemptMode(a.attemptMode),
  ).length
}

export function wasProblemCompletedCorrectly(
  attempts: ProblemAttempt[],
  problemId: string,
): boolean {
  const finals = attempts.filter(
    (a) => sameProblem(a.problemId, problemId) && a.stepId === 'final' && a.isCorrect,
  )
  return finals.length > 0
}

/** Whether a problem was completed correctly via a GRADED (non-practice) attempt. */
export function wasProblemCompletedCorrectlyGraded(
  attempts: ProblemAttempt[],
  problemId: string,
): boolean {
  return attempts.some(
    (a) =>
      sameProblem(a.problemId, problemId) &&
      a.stepId === 'final' &&
      a.isCorrect &&
      isGradedAttemptMode(a.attemptMode),
  )
}

/** Map of storageId -> correct (graded). Useful for mastery evaluation. */
export function buildCorrectByProblemGraded(
  attempts: ProblemAttempt[],
): Record<string, boolean> {
  const map: Record<string, boolean> = {}
  for (const a of attempts) {
    if (a.stepId === 'final' && a.isCorrect && isGradedAttemptMode(a.attemptMode)) {
      const key = normalizeToStorageId(a.problemId) ?? a.problemId
      map[key] = true
    }
  }
  return map
}

/** Map of storageId -> count of graded final attempts. Useful for mastery. */
export function buildGradedFinalAttemptCounts(
  attempts: ProblemAttempt[],
): Record<string, number> {
  const map: Record<string, number> = {}
  for (const a of attempts) {
    if (a.stepId === 'final' && isGradedAttemptMode(a.attemptMode)) {
      const key = normalizeToStorageId(a.problemId) ?? a.problemId
      map[key] = (map[key] ?? 0) + 1
    }
  }
  return map
}

export function getMistakeTypesForProblem(
  attempts: ProblemAttempt[],
  problemId: string,
): string[] {
  return attempts
    .filter((a) => a.problemId === problemId && a.mistakeType)
    .map((a) => a.mistakeType as string)
}
