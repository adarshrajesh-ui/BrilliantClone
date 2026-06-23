import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { FirebaseError } from 'firebase/app'
import {
  CHAPTER_ID,
  type ChapterProgress,
  type MasteryStatus,
} from '../types/chapter'
import { CHAPTER_PROBLEMS } from '../data/chapter'
import { db } from './firebase'
import {
  createDefaultLocalProgress,
  readLocalProgress,
  writeLocalProgress,
} from './localProgressStore'

const TOTAL_PROBLEMS = CHAPTER_PROBLEMS.length

function requireDb() {
  if (!db) {
    throw new Error('Firestore is not configured')
  }
  return db
}

function progressDocId(userId: string) {
  return `${userId}_${CHAPTER_ID}`
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

function deriveMasteryStatus(
  completedCount: number,
  current: MasteryStatus,
): MasteryStatus {
  if (completedCount === 0) {
    return 'Not Started'
  }
  if (completedCount >= TOTAL_PROBLEMS) {
    return current === 'Mastered' ? 'Mastered' : 'Developing'
  }
  if (completedCount >= 4) {
    return 'Developing'
  }
  return 'Learning'
}

function createDefaultProgress(userId: string): ChapterProgress {
  const now = new Date().toISOString()
  return {
    userId,
    chapterId: CHAPTER_ID,
    currentProblemIndex: 0,
    completedProblemIds: [],
    completionPercentage: 0,
    masteryStatus: 'Not Started',
    streakCount: 1,
    lastActiveDate: todayDateString(),
    updatedAt: now,
  }
}

async function saveProgress(progress: ChapterProgress): Promise<ChapterProgress> {
  writeLocalProgress(progress)

  try {
    const firestore = requireDb()
    const ref = doc(firestore, 'chapterProgress', progressDocId(progress.userId))
    const snapshot = await getDoc(ref)
    if (snapshot.exists()) {
      await updateDoc(ref, { ...progress })
    } else {
      await setDoc(ref, progress)
    }
  } catch (error) {
    if (!(error instanceof FirebaseError && error.code === 'permission-denied')) {
      throw error
    }
  }

  return progress
}

export async function ensureChapterProgress(userId: string): Promise<ChapterProgress> {
  const now = new Date().toISOString()
  const today = todayDateString()

  if (!db) {
    const local = readLocalProgress(userId) ?? createDefaultLocalProgress(userId)
    writeLocalProgress(local)
    return local
  }

  try {
    const firestore = requireDb()
    const ref = doc(firestore, 'chapterProgress', progressDocId(userId))
    const snapshot = await getDoc(ref)

    if (!snapshot.exists()) {
      const local = readLocalProgress(userId)
      const progress = local ?? createDefaultProgress(userId)
      return saveProgress(progress)
    }

    const existing = snapshot.data() as ChapterProgress
    const streakCount = computeStreak(existing.lastActiveDate, existing.streakCount)
    const progress: ChapterProgress = {
      ...existing,
      updatedAt: now,
    }

    if (existing.lastActiveDate !== today) {
      progress.lastActiveDate = today
      progress.streakCount = streakCount
      return saveProgress(progress)
    }

    writeLocalProgress(progress)
    return progress
  } catch (error) {
    const local = readLocalProgress(userId) ?? createDefaultLocalProgress(userId)
    if (local.lastActiveDate !== today) {
      local.streakCount = computeStreak(local.lastActiveDate, local.streakCount)
      local.lastActiveDate = today
      local.updatedAt = now
    }
    writeLocalProgress(local)

    if (error instanceof FirebaseError && error.code === 'permission-denied') {
      return local
    }
    throw error
  }
}

export async function getChapterProgress(
  userId: string,
): Promise<ChapterProgress | null> {
  try {
    const firestore = requireDb()
    const snapshot = await getDoc(doc(firestore, 'chapterProgress', progressDocId(userId)))
    if (!snapshot.exists()) {
      return readLocalProgress(userId)
    }
    return snapshot.data() as ChapterProgress
  } catch {
    return readLocalProgress(userId)
  }
}

export function computeCompletionPercentage(completedProblemIds: string[]) {
  return Math.round((completedProblemIds.length / TOTAL_PROBLEMS) * 100)
}

export async function markProblemComplete(
  userId: string,
  problemId: string,
): Promise<ChapterProgress> {
  const base =
    (await getChapterProgress(userId)) ?? createDefaultProgress(userId)

  if (base.completedProblemIds.includes(problemId)) {
    return base
  }

  const completedProblemIds = [...base.completedProblemIds, problemId]
  const completionPercentage = computeCompletionPercentage(completedProblemIds)
  const problemIndex = CHAPTER_PROBLEMS.findIndex((p) => p.problemId === problemId)
  const currentProblemIndex =
    problemIndex >= 0 ? Math.min(problemIndex + 1, TOTAL_PROBLEMS - 1) : base.currentProblemIndex

  const progress: ChapterProgress = {
    ...base,
    completedProblemIds,
    completionPercentage,
    currentProblemIndex,
    masteryStatus: deriveMasteryStatus(completedProblemIds.length, base.masteryStatus),
    updatedAt: new Date().toISOString(),
  }

  return saveProgress(progress)
}

export async function saveProgressDirect(progress: ChapterProgress): Promise<ChapterProgress> {
  return saveProgress(progress)
}

export async function setCurrentProblem(
  userId: string,
  problemId: string,
): Promise<void> {
  const base = (await getChapterProgress(userId)) ?? createDefaultProgress(userId)
  const problemIndex = CHAPTER_PROBLEMS.findIndex((p) => p.problemId === problemId)
  const progress: ChapterProgress = {
    ...base,
    currentProblemId: problemId,
    currentProblemIndex: problemIndex >= 0 ? problemIndex : base.currentProblemIndex,
    updatedAt: new Date().toISOString(),
  }
  await saveProgress(progress)
}
