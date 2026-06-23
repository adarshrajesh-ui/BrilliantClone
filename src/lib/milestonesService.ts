import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { CHAPTER_ID, type Milestones } from '../types/chapter'
import { db } from './firebase'

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

export async function ensureMilestones(userId: string): Promise<Milestones> {
  const firestore = requireDb()
  const ref = doc(firestore, 'milestones', milestonesDocId(userId))
  const snapshot = await getDoc(ref)

  if (!snapshot.exists()) {
    const milestones = createDefaultMilestones(userId)
    await setDoc(ref, milestones)
    return milestones
  }

  const existing = snapshot.data() as Milestones
  const unlocked = new Set(existing.unlockedMilestones)

  if (!unlocked.has('chapter-started')) {
    unlocked.add('chapter-started')
    const updated: Milestones = {
      ...existing,
      unlockedMilestones: [...unlocked],
      updatedAt: new Date().toISOString(),
    }
    await updateDoc(ref, {
      unlockedMilestones: updated.unlockedMilestones,
      updatedAt: updated.updatedAt,
    })
    return updated
  }

  return existing
}

export async function getMilestones(userId: string): Promise<Milestones | null> {
  const firestore = requireDb()
  const snapshot = await getDoc(doc(firestore, 'milestones', milestonesDocId(userId)))
  if (!snapshot.exists()) {
    return null
  }
  return snapshot.data() as Milestones
}
