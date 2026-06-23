import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import {
  CHAPTER_ID,
  type ChapterProgress,
  type MasteryStatus,
} from '../types/chapter'
import { CHAPTER_PROBLEMS } from '../data/chapter'
import { db } from './firebase'

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
  const today = todayDateString()
  return {
    userId,
    chapterId: CHAPTER_ID,
    currentProblemIndex: 0,
    completedProblemIds: [],
    completionPercentage: 0,
    masteryStatus: 'Not Started',
    streakCount: 1,
    lastActiveDate: today,
    updatedAt: now,
  }
}

export async function ensureChapterProgress(userId: string): Promise<ChapterProgress> {
  const firestore = requireDb()
  const ref = doc(firestore, 'chapterProgress', progressDocId(userId))
  const snapshot = await getDoc(ref)
  const now = new Date().toISOString()
  const today = todayDateString()

  if (!snapshot.exists()) {
    const progress = createDefaultProgress(userId)
    await setDoc(ref, progress)
    return progress
  }

  const existing = snapshot.data() as ChapterProgress
  const streakCount = computeStreak(existing.lastActiveDate, existing.streakCount)
  const updates: Partial<ChapterProgress> = {
    updatedAt: now,
  }

  if (existing.lastActiveDate !== today) {
    updates.lastActiveDate = today
    updates.streakCount = streakCount
  }

  if (Object.keys(updates).length > 1) {
    await updateDoc(ref, updates)
  }

  return {
    ...existing,
    ...updates,
  }
}

export async function getChapterProgress(
  userId: string,
): Promise<ChapterProgress | null> {
  const firestore = requireDb()
  const snapshot = await getDoc(doc(firestore, 'chapterProgress', progressDocId(userId)))
  if (!snapshot.exists()) {
    return null
  }
  return snapshot.data() as ChapterProgress
}

export function computeCompletionPercentage(completedProblemIds: string[]) {
  return Math.round((completedProblemIds.length / TOTAL_PROBLEMS) * 100)
}

export async function markProblemComplete(
  userId: string,
  problemId: string,
): Promise<ChapterProgress> {
  const firestore = requireDb()
  const ref = doc(firestore, 'chapterProgress', progressDocId(userId))
  const snapshot = await getDoc(ref)
  const base = snapshot.exists()
    ? (snapshot.data() as ChapterProgress)
    : createDefaultProgress(userId)

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

  if (snapshot.exists()) {
    await updateDoc(ref, {
      completedProblemIds: progress.completedProblemIds,
      completionPercentage: progress.completionPercentage,
      currentProblemIndex: progress.currentProblemIndex,
      masteryStatus: progress.masteryStatus,
      updatedAt: progress.updatedAt,
    })
  } else {
    await setDoc(ref, progress)
  }

  return progress
}
