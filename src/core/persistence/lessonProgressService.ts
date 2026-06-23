// Per-lesson progress persistence (Agent 1 — Core Architecture).
//
// Stores lesson-scoped completion at `lessonProgress/{userId}_{lessonId}`.
// Lesson completion is fully derivable from chapter `completedProblemIds`, so
// this document is a denormalized convenience for UI/analytics; it is always
// recomputed from the authoritative chapter progress and never the source of
// truth. User-scoped Firestore writes with graceful local fallback.

import { doc, getDoc, setDoc } from 'firebase/firestore'
import { FirebaseError } from 'firebase/app'
import type { LessonProgress } from '../../types/chapter'
import { db } from '../../lib/firebase'
import {
  readLocalLessonProgress,
  writeLocalLessonProgress,
} from '../../lib/localProgressStore'
import { CANONICAL_LESSONS } from '../progression/canonical'
import { isLessonCompleted } from '../progression/selectors'
import { normalizeLessonProgress } from './migration'

function lessonProgressDocId(userId: string, lessonId: string) {
  return `${userId}_${lessonId}`
}

export async function getLessonProgress(
  userId: string,
  lessonId: string,
  chapterCompletedProblemIds: string[],
): Promise<LessonProgress> {
  const local = readLocalLessonProgress(userId, lessonId)
  if (!db) {
    return normalizeLessonProgress(local, userId, lessonId, chapterCompletedProblemIds)
  }
  try {
    const ref = doc(db, 'lessonProgress', lessonProgressDocId(userId, lessonId))
    const snap = await getDoc(ref)
    const raw = snap.exists() ? (snap.data() as Partial<LessonProgress>) : local
    return normalizeLessonProgress(raw, userId, lessonId, chapterCompletedProblemIds)
  } catch {
    return normalizeLessonProgress(local, userId, lessonId, chapterCompletedProblemIds)
  }
}

async function saveLessonProgress(progress: LessonProgress): Promise<LessonProgress> {
  writeLocalLessonProgress(progress)
  if (!db) {
    return progress
  }
  try {
    await setDoc(
      doc(db, 'lessonProgress', lessonProgressDocId(progress.userId, progress.lessonId)),
      progress,
    )
  } catch (error) {
    if (!(error instanceof FirebaseError && error.code === 'permission-denied')) {
      throw error
    }
  }
  return progress
}

/**
 * Recompute and persist every lesson's progress from the authoritative chapter
 * completedProblemIds. Sets firstStartedAt/completedAt timestamps the first
 * time each milestone is reached, preserving any earlier timestamps.
 */
export async function syncLessonProgress(
  userId: string,
  chapterCompletedProblemIds: string[],
): Promise<LessonProgress[]> {
  const now = new Date().toISOString()
  const results: LessonProgress[] = []
  for (const lesson of CANONICAL_LESSONS) {
    const existing = await getLessonProgress(
      userId,
      lesson.lessonId,
      chapterCompletedProblemIds,
    )
    const completed = isLessonCompleted(lesson.lessonId, chapterCompletedProblemIds)
    const next: LessonProgress = {
      ...existing,
      firstStartedAt:
        existing.firstStartedAt ?? (existing.completedProblemIds.length > 0 ? now : undefined),
      completedAt: completed ? existing.completedAt ?? now : existing.completedAt,
      updatedAt: now,
    }
    results.push(await saveLessonProgress(next))
  }
  return results
}
