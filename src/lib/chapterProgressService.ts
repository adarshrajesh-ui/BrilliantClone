import { doc, getDoc, setDoc } from 'firebase/firestore'
import { FirebaseError } from 'firebase/app'
import { type ChapterProgress } from '../types/chapter'
import { getNextIncompleteProblemIndex } from '../data/chapter'
import { db } from './firebase'
import {
  createDefaultLocalProgress,
  readLocalProgress,
  writeLocalProgress,
} from './localProgressStore'
import {
  chapterScopedDocId,
  legacyChapterScopedDocId,
} from '../core/persistence/docIds'
import {
  mergeChapterProgress,
  normalizeChapterProgress,
} from '../core/persistence/migration'
import { getChapterCompletionPercentage } from '../core/progression/selectors'
import { deriveMasteryStatus } from '../core/mastery/mastery'

function requireDb() {
  if (!db) {
    throw new Error('Firestore is not configured')
  }
  return db
}

function todayDateString() {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayDateString() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

function computeStreak(lastActiveDate: string | undefined, currentStreak: number) {
  const today = todayDateString()
  if (!lastActiveDate || lastActiveDate === today) {
    return currentStreak || 1
  }
  if (lastActiveDate === yesterdayDateString()) {
    return currentStreak + 1
  }
  return 1
}

function createDefaultProgress(userId: string): ChapterProgress {
  return normalizeChapterProgress(null, userId)
}

async function readFirestoreProgress(
  docId: string,
): Promise<Partial<ChapterProgress> | null> {
  try {
    const ref = doc(requireDb(), 'chapterProgress', docId)
    const snap = await getDoc(ref)
    return snap.exists() ? (snap.data() as Partial<ChapterProgress>) : null
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'permission-denied') {
      return null
    }
    throw error
  }
}

/**
 * Read the best chapter progress from all sources: the PRD-correct underscore
 * Firestore doc, the legacy hyphenated doc (tolerant read), and local storage.
 * Merges by farthest progress (see mergeChapterProgress). Returns null only
 * when no progress exists anywhere.
 */
async function loadBestChapterProgress(
  userId: string,
): Promise<ChapterProgress | null> {
  const local = readLocalProgress(userId)

  if (!db) {
    return local ? normalizeChapterProgress(local, userId) : null
  }

  const current = await readFirestoreProgress(chapterScopedDocId(userId))
  const legacy = await readFirestoreProgress(legacyChapterScopedDocId(userId))

  const candidates: Array<Partial<ChapterProgress> | null> = [current, legacy, local]
  let best: Partial<ChapterProgress> | null = null
  for (const candidate of candidates) {
    if (!candidate) {
      continue
    }
    best = best ? mergeChapterProgress(best, candidate, userId) : candidate
  }
  return best ? normalizeChapterProgress(best, userId) : null
}

async function saveProgress(input: ChapterProgress): Promise<ChapterProgress> {
  // Recompute derived PRD fields so they never drift from completedProblemIds.
  const progress = normalizeChapterProgress(
    { ...input, updatedAt: new Date().toISOString() },
    input.userId,
  )
  writeLocalProgress(progress)

  try {
    const ref = doc(requireDb(), 'chapterProgress', chapterScopedDocId(progress.userId))
    await setDoc(ref, progress)
  } catch (error) {
    if (!(error instanceof FirebaseError && error.code === 'permission-denied')) {
      throw error
    }
  }

  return progress
}

export async function ensureChapterProgress(userId: string): Promise<ChapterProgress> {
  const today = todayDateString()

  if (!db) {
    const local = readLocalProgress(userId) ?? createDefaultLocalProgress(userId)
    const normalized = normalizeChapterProgress(local, userId)
    writeLocalProgress(normalized)
    return normalized
  }

  try {
    const best = await loadBestChapterProgress(userId)

    if (!best) {
      return saveProgress(createDefaultProgress(userId))
    }

    if (best.lastActiveDate !== today) {
      return saveProgress({
        ...best,
        lastActiveDate: today,
        streakCount: computeStreak(best.lastActiveDate, best.streakCount),
      })
    }

    // Always write forward so the underscore doc + derived fields are current.
    return saveProgress(best)
  } catch (error) {
    const local = readLocalProgress(userId) ?? createDefaultLocalProgress(userId)
    if (local.lastActiveDate !== today) {
      local.streakCount = computeStreak(local.lastActiveDate, local.streakCount)
      local.lastActiveDate = today
    }
    const normalized = normalizeChapterProgress(local, userId)
    writeLocalProgress(normalized)

    if (error instanceof FirebaseError && error.code === 'permission-denied') {
      return normalized
    }
    throw error
  }
}

export async function getChapterProgress(
  userId: string,
): Promise<ChapterProgress | null> {
  try {
    return await loadBestChapterProgress(userId)
  } catch {
    const local = readLocalProgress(userId)
    return local ? normalizeChapterProgress(local, userId) : null
  }
}

/** Chapter completion percentage over the full 20-problem model. */
export function computeCompletionPercentage(completedProblemIds: string[]) {
  return getChapterCompletionPercentage(completedProblemIds)
}

export async function markProblemComplete(
  userId: string,
  problemId: string,
): Promise<ChapterProgress> {
  const base = (await getChapterProgress(userId)) ?? createDefaultProgress(userId)

  if (base.completedProblemIds.includes(problemId)) {
    // Already complete (e.g. a practice restart re-finish): never regress and
    // never duplicate. Touch updatedAt only.
    return saveProgress(base)
  }

  const completedProblemIds = [...base.completedProblemIds, problemId]
  // Resume cursor follows the farthest progression and never moves backward.
  const nextIndex = getNextIncompleteProblemIndex(completedProblemIds)
  const currentProblemIndex = Math.max(base.currentProblemIndex, nextIndex)

  return saveProgress({
    ...base,
    completedProblemIds,
    currentProblemIndex,
    masteryStatus: deriveMasteryStatus({
      completedCount: completedProblemIds.length,
      mastered: base.masteryStatus === 'Mastered',
    }),
  })
}

export async function saveProgressDirect(progress: ChapterProgress): Promise<ChapterProgress> {
  return saveProgress(progress)
}

export async function setCurrentProblem(
  userId: string,
  problemId: string,
): Promise<void> {
  const base = (await getChapterProgress(userId)) ?? createDefaultProgress(userId)
  // Track which problem is open for resume hints only. The authoritative resume
  // target is derived from completedProblemIds, so opening (or reviewing /
  // restarting) an older completed problem never drags progression backward.
  await saveProgress({
    ...base,
    currentProblemId: problemId,
  })
}
