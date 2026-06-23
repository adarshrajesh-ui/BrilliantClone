import type { ChapterProgress, Milestones, ProblemSession } from '../types/chapter'
import { CHAPTER_ID } from '../types/chapter'

const PROGRESS_PREFIX = 'evl_chapter_progress_'
const MILESTONES_PREFIX = 'evl_milestones_'
const SESSION_PREFIX = 'evl_problem_session_'

function progressKey(userId: string) {
  return `${PROGRESS_PREFIX}${userId}`
}

function milestonesKey(userId: string) {
  return `${MILESTONES_PREFIX}${userId}`
}

function sessionKey(userId: string, problemId: string) {
  return `${SESSION_PREFIX}${userId}_${problemId}`
}

export function readLocalProgress(userId: string): ChapterProgress | null {
  try {
    const raw = localStorage.getItem(progressKey(userId))
    return raw ? (JSON.parse(raw) as ChapterProgress) : null
  } catch {
    return null
  }
}

export function writeLocalProgress(progress: ChapterProgress) {
  localStorage.setItem(progressKey(progress.userId), JSON.stringify(progress))
}

export function readLocalMilestones(userId: string): Milestones | null {
  try {
    const raw = localStorage.getItem(milestonesKey(userId))
    return raw ? (JSON.parse(raw) as Milestones) : null
  } catch {
    return null
  }
}

export function writeLocalMilestones(milestones: Milestones) {
  localStorage.setItem(milestonesKey(milestones.userId), JSON.stringify(milestones))
}

export function createDefaultLocalProgress(userId: string): ChapterProgress {
  const now = new Date().toISOString()
  return {
    userId,
    chapterId: CHAPTER_ID,
    currentProblemIndex: 0,
    completedProblemIds: [],
    completionPercentage: 0,
    masteryStatus: 'Not Started',
    streakCount: 1,
    lastActiveDate: now.slice(0, 10),
    updatedAt: now,
  }
}

export function createDefaultLocalMilestones(userId: string): Milestones {
  return {
    userId,
    unlockedMilestones: ['chapter-started'],
    chapterCompleted: false,
    chapterMastered: false,
    updatedAt: new Date().toISOString(),
  }
}

export function readLocalProblemSession(
  userId: string,
  problemId: string,
): ProblemSession | null {
  try {
    const raw = localStorage.getItem(sessionKey(userId, problemId))
    return raw ? (JSON.parse(raw) as ProblemSession) : null
  } catch {
    return null
  }
}

export function writeLocalProblemSession(session: ProblemSession) {
  localStorage.setItem(
    sessionKey(session.userId, session.problemId),
    JSON.stringify(session),
  )
}

export function clearLocalProblemSession(userId: string, problemId: string) {
  localStorage.removeItem(sessionKey(userId, problemId))
}

export function createEmptySession(userId: string, problemId: string): ProblemSession {
  return {
    userId,
    chapterId: CHAPTER_ID,
    problemId,
    state: {},
    revealedHintIds: [],
    updatedAt: new Date().toISOString(),
  }
}
