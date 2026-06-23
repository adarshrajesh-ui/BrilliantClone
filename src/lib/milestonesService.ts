import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { FirebaseError } from 'firebase/app'
import { CHAPTER_ID, type Milestones } from '../types/chapter'
import { CHAPTER_PROBLEMS } from '../data/chapter'
import { db } from './firebase'
import {
  createDefaultLocalMilestones,
  readLocalMilestones,
  writeLocalMilestones,
} from './localProgressStore'

function requireDb() {
  if (!db) {
    throw new Error('Firestore is not configured')
  }
  return db
}

function milestonesDocId(userId: string) {
  return `${userId}_${CHAPTER_ID}`
}

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
  const base = (await ensureMilestones(userId))
  const unlocked = new Set(base.unlockedMilestones)

  if (completedCount >= 1) {
    unlocked.add('first-problem-complete')
  }
  if (completedCount >= 4) {
    unlocked.add('half-chapter')
  }
  if (completedCount >= CHAPTER_PROBLEMS.length) {
    unlocked.add('chapter-complete')
    base.chapterCompleted = true
  }

  const milestones: Milestones = {
    ...base,
    unlockedMilestones: [...unlocked],
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
