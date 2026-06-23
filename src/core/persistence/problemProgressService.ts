// Per-problem progress persistence (Agent 1 — Core Architecture).
//
// Stores status, completion snapshot, demo-seen state, restart count, and
// review metadata at `problemProgress/{userId}_{problemId}`. Firestore writes
// are user-scoped (see firestore.rules); on permission-denied / offline we
// degrade gracefully to local storage, mirroring the existing services.

import { doc, getDoc, setDoc } from 'firebase/firestore'
import { FirebaseError } from 'firebase/app'
import type { ProblemProgress, ReviewSnapshot } from '../../types/chapter'
import { db } from '../../lib/firebase'
import {
  readLocalProblemProgress,
  writeLocalProblemProgress,
} from '../../lib/localProgressStore'
import { getLessonForProblem } from '../progression/selectors'
import { resolveCanonicalProblem } from '../progression/canonical'
import { createDefaultProblemProgress, normalizeProblemProgress } from './migration'

function problemProgressDocId(userId: string, problemId: string) {
  return `${userId}_${problemId}`
}

function lessonIdFor(problemId: string): string {
  return getLessonForProblem(problemId)?.lessonId ?? 'lesson-1'
}

/** Normalize the persisted/stored problem id (legacy or slug) to its storage id. */
function storageIdFor(problemId: string): string {
  return resolveCanonicalProblem(problemId)?.storageId ?? problemId
}

export async function getProblemProgress(
  userId: string,
  problemId: string,
): Promise<ProblemProgress> {
  const storageId = storageIdFor(problemId)
  const lessonId = lessonIdFor(storageId)
  const local = readLocalProblemProgress(userId, storageId)

  if (!db) {
    return local
      ? normalizeProblemProgress(local, userId, lessonId, storageId)
      : createDefaultProblemProgress(userId, lessonId, storageId)
  }

  try {
    const ref = doc(db, 'problemProgress', problemProgressDocId(userId, storageId))
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      return local
        ? normalizeProblemProgress(local, userId, lessonId, storageId)
        : createDefaultProblemProgress(userId, lessonId, storageId)
    }
    const normalized = normalizeProblemProgress(
      snap.data() as Partial<ProblemProgress>,
      userId,
      lessonId,
      storageId,
    )
    writeLocalProblemProgress(normalized)
    return normalized
  } catch {
    return local
      ? normalizeProblemProgress(local, userId, lessonId, storageId)
      : createDefaultProblemProgress(userId, lessonId, storageId)
  }
}

async function saveProblemProgress(progress: ProblemProgress): Promise<ProblemProgress> {
  writeLocalProblemProgress(progress)
  if (!db) {
    return progress
  }
  try {
    await setDoc(
      doc(db, 'problemProgress', problemProgressDocId(progress.userId, progress.problemId)),
      progress,
    )
  } catch (error) {
    if (!(error instanceof FirebaseError && error.code === 'permission-denied')) {
      // Local copy already written; surface non-permission errors upstream.
      throw error
    }
  }
  return progress
}

/** Patch a problem-progress document with safe defaults applied first. */
export async function updateProblemProgress(
  userId: string,
  problemId: string,
  patch: Partial<ProblemProgress>,
): Promise<ProblemProgress> {
  const current = await getProblemProgress(userId, problemId)
  const next: ProblemProgress = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  }
  return saveProblemProgress(next)
}

/** Mark the pre-problem mini-demo as seen (idempotent, non-destructive). */
export async function markDemoSeen(
  userId: string,
  problemId: string,
): Promise<ProblemProgress> {
  return updateProblemProgress(userId, problemId, {
    demoSeen: true,
    demoLastSeenAt: new Date().toISOString(),
  })
}

/** Record a completion snapshot WITHOUT ever downgrading completed status. */
export async function recordProblemCompletion(
  userId: string,
  problemId: string,
  data: {
    finalSubmittedAnswer?: string
    finalNormalizedAnswer?: number | string | Record<string, unknown>
    finalMistakeType?: string | null
    finalFeedbackKey?: string
    bestGradedAttemptNumber?: number
    reviewSnapshot?: ReviewSnapshot
  },
): Promise<ProblemProgress> {
  const now = new Date().toISOString()
  const current = await getProblemProgress(userId, problemId)
  return updateProblemProgress(userId, problemId, {
    status: 'completed',
    firstStartedAt: current.firstStartedAt ?? now,
    completedAt: current.completedAt ?? now,
    ...data,
  })
}

/** Mark a fresh review visit. Does not change completion or create attempts. */
export async function markProblemReviewed(
  userId: string,
  problemId: string,
): Promise<ProblemProgress> {
  return updateProblemProgress(userId, problemId, {
    lastReviewedAt: new Date().toISOString(),
  })
}

/**
 * Begin an explicit practice restart: bump restartCount only. Completion
 * status, the stored review snapshot, and all final-answer fields are
 * preserved untouched.
 */
export async function beginPracticeRestart(
  userId: string,
  problemId: string,
): Promise<ProblemProgress> {
  const current = await getProblemProgress(userId, problemId)
  return updateProblemProgress(userId, problemId, {
    restartCount: (current.restartCount ?? 0) + 1,
  })
}
