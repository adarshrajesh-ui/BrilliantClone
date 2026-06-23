import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { FirebaseError } from 'firebase/app'
import { type Milestones } from '../types/chapter'
import { db } from './firebase'
import {
  createDefaultLocalMilestones,
  readLocalMilestones,
  writeLocalMilestones,
} from './localProgressStore'
import { chapterScopedDocId } from '../core/persistence/docIds'
import { getChapterProgress } from './chapterProgressService'
import {
  TOTAL_PROBLEMS,
  getCompletedLessonIds,
  isProblemCompleted,
} from '../core/progression/selectors'
import { mapCanonicalSlugToStorageId } from '../core/progression/canonical'

function requireDb() {
  if (!db) {
    throw new Error('Firestore is not configured')
  }
  return db
}

function milestonesDocId(userId: string) {
  return chapterScopedDocId(userId)
}

/** Canonical slugs whose completion drives concept-distinction milestones. */
const SIMULATION_SLUGS = [
  'l1-long-run-average',
  'l1-unequal-spinner',
  'l1-short-run-vs-long-run',
  'l1-compare-spinners',
  'l5-same-ev-different-risk',
  'l5-low-risk-vs-high-risk',
]

function createDefaultMilestones(userId: string): Milestones {
  return {
    userId,
    unlockedMilestones: ['chapter-started'],
    chapterCompleted: false,
    chapterMastered: false,
    updatedAt: new Date().toISOString(),
  }
}

async function saveMilestones(milestones: Milestones): Promise<Milestones> {
  writeLocalMilestones(milestones)

  try {
    const firestore = requireDb()
    const ref = doc(firestore, 'milestones', milestonesDocId(milestones.userId))
    const snapshot = await getDoc(ref)
    if (snapshot.exists()) {
      await updateDoc(ref, { ...milestones })
    } else {
      await setDoc(ref, milestones)
    }
  } catch (error) {
    if (!(error instanceof FirebaseError && error.code === 'permission-denied')) {
      throw error
    }
  }

  return milestones
}

export async function ensureMilestones(userId: string): Promise<Milestones> {
  if (!db) {
    const local = readLocalMilestones(userId) ?? createDefaultLocalMilestones(userId)
    writeLocalMilestones(local)
    return local
  }

  try {
    const firestore = requireDb()
    const ref = doc(firestore, 'milestones', milestonesDocId(userId))
    const snapshot = await getDoc(ref)

    if (!snapshot.exists()) {
      const local = readLocalMilestones(userId)
      const milestones = local ?? createDefaultMilestones(userId)
      return saveMilestones(milestones)
    }

    const existing = snapshot.data() as Milestones
    const unlocked = new Set(existing.unlockedMilestones)
    if (!unlocked.has('chapter-started')) {
      unlocked.add('chapter-started')
    }

    const milestones: Milestones = {
      ...existing,
      unlockedMilestones: [...unlocked],
      updatedAt: new Date().toISOString(),
    }
    return saveMilestones(milestones)
  } catch (error) {
    const local = readLocalMilestones(userId) ?? createDefaultLocalMilestones(userId)
    writeLocalMilestones(local)
    if (error instanceof FirebaseError && error.code === 'permission-denied') {
      return local
    }
    throw error
  }
}

export async function syncMilestonesForCompletion(
  userId: string,
  completedCount: number,
): Promise<Milestones> {
  const base = await ensureMilestones(userId)
  const unlocked = new Set(base.unlockedMilestones)

  // Derive completion-based milestones from the authoritative chapter progress.
  const progress = await getChapterProgress(userId)
  const completedProblemIds = progress?.completedProblemIds ?? []
  const completedLessonIds = getCompletedLessonIds(completedProblemIds)

  if (completedCount >= 1) {
    unlocked.add('first-problem-complete')
  }
  if (completedCount >= Math.ceil(TOTAL_PROBLEMS / 2)) {
    unlocked.add('half-chapter')
  }

  // Lesson-completion milestones (lesson 5 completion == chapter completion).
  for (const lessonId of ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4']) {
    if (completedLessonIds.includes(lessonId)) {
      unlocked.add(`${lessonId}-complete`)
    }
  }

  // Concept-distinction milestones.
  if (isProblemCompleted(mapCanonicalSlugToStorageId('l4-payout-vs-profit') ?? '', completedProblemIds)) {
    unlocked.add('profit-fairness-distinction')
  }
  if (
    isProblemCompleted(mapCanonicalSlugToStorageId('l5-same-ev-different-risk') ?? '', completedProblemIds) ||
    isProblemCompleted(mapCanonicalSlugToStorageId('l5-low-risk-vs-high-risk') ?? '', completedProblemIds)
  ) {
    unlocked.add('risk-distinction')
  }
  if (isProblemCompleted(mapCanonicalSlugToStorageId('l5-final-capstone-ev-decision') ?? '', completedProblemIds)) {
    unlocked.add('final-capstone-complete')
  }
  if (SIMULATION_SLUGS.every((slug) => isProblemCompleted(mapCanonicalSlugToStorageId(slug) ?? '', completedProblemIds))) {
    unlocked.add('all-simulations-complete')
  }

  const chapterCompleted = completedCount >= TOTAL_PROBLEMS
  if (chapterCompleted) {
    unlocked.add('chapter-complete')
  }

  const milestones: Milestones = {
    ...base,
    unlockedMilestones: [...unlocked],
    completedLessonIds,
    chapterCompleted: base.chapterCompleted || chapterCompleted,
    updatedAt: new Date().toISOString(),
  }

  return saveMilestones(milestones)
}

export async function setChapterMastered(userId: string): Promise<Milestones> {
  const base = await ensureMilestones(userId)
  const unlocked = new Set(base.unlockedMilestones)
  unlocked.add('chapter-complete')
  unlocked.add('chapter-mastered')

  const milestones: Milestones = {
    ...base,
    unlockedMilestones: [...unlocked],
    chapterCompleted: true,
    chapterMastered: true,
    updatedAt: new Date().toISOString(),
  }

  return saveMilestones(milestones)
}

export async function getMilestones(userId: string): Promise<Milestones | null> {
  try {
    const firestore = requireDb()
    const snapshot = await getDoc(doc(firestore, 'milestones', milestonesDocId(userId)))
    if (!snapshot.exists()) {
      return readLocalMilestones(userId)
    }
    return snapshot.data() as Milestones
  } catch {
    return readLocalMilestones(userId)
  }
}
