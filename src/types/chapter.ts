export const CHAPTER_ID = 'expected-value-intro' as const

export type MasteryStatus =
  | 'Not Started'
  | 'Learning'
  | 'Developing'
  | 'Mastered'

export interface ChapterProblem {
  problemId: string
  title: string
  concept: string
  order: number
}

export interface ChapterProgress {
  userId: string
  chapterId: typeof CHAPTER_ID
  currentProblemIndex: number
  currentProblemId?: string
  completedProblemIds: string[]
  completionPercentage: number
  masteryStatus: MasteryStatus
  streakCount: number
  lastActiveDate: string
  updatedAt: string
}

export interface ProblemSession {
  userId: string
  chapterId: typeof CHAPTER_ID
  problemId: string
  state: Record<string, unknown>
  revealedHintIds: string[]
  updatedAt: string
}

export interface Milestones {
  userId: string
  unlockedMilestones: string[]
  chapterCompleted: boolean
  chapterMastered: boolean
  updatedAt: string
}

export interface MilestoneDefinition {
  id: string
  label: string
  description: string
}
