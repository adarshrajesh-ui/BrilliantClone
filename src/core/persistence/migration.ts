// Backward-compatible read normalization + merge rules (Agent 1 — Core).
//
// These functions take possibly-old, possibly-partial persisted documents and
// return safe, fully-populated objects WITHOUT destroying data. They are pure
// (no Firestore / React) so they can be unit-tested against legacy shapes.

import type {
  AttemptMode,
  ProblemAttempt,
} from '../../types/problem'
import type {
  ChapterProgress,
  LessonProgress,
  ProblemProgress,
  ProblemStatus,
} from '../../types/chapter'
import { CHAPTER_ID } from '../../types/chapter'
import {
  getChapterCompletionPercentage,
  getCompletedLessonIds,
  getCurrentLessonId,
  getHighestSequentialCompletedIndex,
  getLessonCompletionPercentage,
  getNextIncompleteProblemId,
  getNextLessonId,
  isChapterComplete,
} from '../progression/selectors'
import { deriveMasteryStatus, type MasteryStatus } from '../mastery/mastery'

function dedupe(ids: string[] | undefined): string[] {
  return [...new Set(ids ?? [])]
}

const VALID_MASTERY: MasteryStatus[] = ['Not Started', 'Learning', 'Developing', 'Mastered']

/**
 * Normalize any chapterProgress document (legacy 8-problem, partial, or new)
 * into a fully-populated object. Derives the PRD five-lesson fields from
 * completedProblemIds so they are always consistent and never stale. Existing
 * completion data is preserved; duplicates are de-duped.
 */
export function normalizeChapterProgress(
  raw: Partial<ChapterProgress> | null | undefined,
  userId: string,
): ChapterProgress {
  const now = new Date().toISOString()
  const completedProblemIds = dedupe(raw?.completedProblemIds)
  const completedCount = completedProblemIds.length

  const storedMastery =
    raw?.masteryStatus && VALID_MASTERY.includes(raw.masteryStatus)
      ? raw.masteryStatus
      : undefined
  // Preserve an already-earned "Mastered" status; otherwise derive the coarse
  // status from completion count (the full mastery rule runs in masteryService).
  const masteryStatus: MasteryStatus =
    storedMastery === 'Mastered'
      ? 'Mastered'
      : deriveMasteryStatus({ completedCount, mastered: false })

  return {
    userId,
    chapterId: CHAPTER_ID,
    currentProblemIndex: raw?.currentProblemIndex ?? 0,
    currentProblemId: raw?.currentProblemId,
    completedProblemIds,
    completionPercentage: getChapterCompletionPercentage(completedProblemIds),
    masteryStatus,
    streakCount: raw?.streakCount ?? 1,
    lastActiveDate: raw?.lastActiveDate ?? now.slice(0, 10),
    updatedAt: raw?.updatedAt ?? now,
    // Derived PRD fields (always recomputed for consistency).
    currentLessonId: getCurrentLessonId(completedProblemIds),
    nextLessonId: getNextLessonId(completedProblemIds),
    nextProblemId: getNextIncompleteProblemId(completedProblemIds),
    highestSequentialCompletedGlobalIndex:
      getHighestSequentialCompletedIndex(completedProblemIds),
    completedLessonIds: getCompletedLessonIds(completedProblemIds),
  }
}

/**
 * Merge rule when both a new (underscore) and legacy (hyphen) chapter document
 * exist: choose the record with farther progress (more unique completed
 * problems), breaking ties by the most recent updatedAt. Returns a normalized
 * result. Never deletes the loser — callers simply write the winner forward.
 */
export function mergeChapterProgress(
  a: Partial<ChapterProgress> | null | undefined,
  b: Partial<ChapterProgress> | null | undefined,
  userId: string,
): ChapterProgress {
  if (!a) {
    return normalizeChapterProgress(b, userId)
  }
  if (!b) {
    return normalizeChapterProgress(a, userId)
  }
  const aCount = dedupe(a.completedProblemIds).length
  const bCount = dedupe(b.completedProblemIds).length
  if (aCount !== bCount) {
    return normalizeChapterProgress(aCount > bCount ? a : b, userId)
  }
  const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
  const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
  // Union the completed IDs so a tie never loses a completion either side has.
  const union = dedupe([...(a.completedProblemIds ?? []), ...(b.completedProblemIds ?? [])])
  const winner = aTime >= bTime ? a : b
  return normalizeChapterProgress({ ...winner, completedProblemIds: union }, userId)
}

/** Default a possibly-old attempt's mode to `graded` and treat it as such. */
export function normalizeAttemptMode(mode: AttemptMode | undefined | null): AttemptMode {
  if (mode === 'corrected_resubmission' || mode === 'practice_restart') {
    return mode
  }
  return 'graded'
}

/** A practice restart never counts toward graded mastery math. */
export function isGradedAttemptMode(mode: AttemptMode | undefined | null): boolean {
  return normalizeAttemptMode(mode) !== 'practice_restart'
}

export function normalizeProblemAttempt(raw: ProblemAttempt): ProblemAttempt {
  return { ...raw, attemptMode: normalizeAttemptMode(raw.attemptMode) }
}

/** Fill safe defaults for a lesson progress document. */
export function normalizeLessonProgress(
  raw: Partial<LessonProgress> | null | undefined,
  userId: string,
  lessonId: string,
  chapterCompletedProblemIds: string[],
): LessonProgress {
  const now = new Date().toISOString()
  const completedProblemIds = dedupe(raw?.completedProblemIds)
  const completionPercentage = getLessonCompletionPercentage(
    lessonId,
    chapterCompletedProblemIds,
  )
  return {
    userId,
    chapterId: CHAPTER_ID,
    lessonId,
    completedProblemIds,
    completionPercentage,
    lessonCompleted: raw?.lessonCompleted ?? completionPercentage >= 100,
    firstStartedAt: raw?.firstStartedAt,
    completedAt: raw?.completedAt,
    updatedAt: raw?.updatedAt ?? now,
  }
}

const VALID_STATUS: ProblemStatus[] = ['not_started', 'in_progress', 'completed']

/** Fill safe defaults for a problem progress document (incl. demo/review fields). */
export function normalizeProblemProgress(
  raw: Partial<ProblemProgress> | null | undefined,
  userId: string,
  lessonId: string,
  problemId: string,
): ProblemProgress {
  const now = new Date().toISOString()
  const status: ProblemStatus =
    raw?.status && VALID_STATUS.includes(raw.status) ? raw.status : 'not_started'
  return {
    userId,
    chapterId: CHAPTER_ID,
    lessonId,
    problemId,
    status,
    firstStartedAt: raw?.firstStartedAt,
    completedAt: raw?.completedAt,
    bestGradedAttemptNumber: raw?.bestGradedAttemptNumber,
    finalSubmittedAnswer: raw?.finalSubmittedAnswer,
    finalNormalizedAnswer: raw?.finalNormalizedAnswer,
    finalMistakeType: raw?.finalMistakeType ?? null,
    finalFeedbackKey: raw?.finalFeedbackKey,
    reviewSnapshot: raw?.reviewSnapshot,
    demoSeen: raw?.demoSeen ?? false,
    demoLastSeenAt: raw?.demoLastSeenAt,
    restartCount: raw?.restartCount ?? 0,
    lastReviewedAt: raw?.lastReviewedAt,
    updatedAt: raw?.updatedAt ?? now,
  }
}

export function createDefaultProblemProgress(
  userId: string,
  lessonId: string,
  problemId: string,
): ProblemProgress {
  return normalizeProblemProgress(null, userId, lessonId, problemId)
}

export function isChapterFullyComplete(completedProblemIds: string[]): boolean {
  return isChapterComplete(completedProblemIds)
}
