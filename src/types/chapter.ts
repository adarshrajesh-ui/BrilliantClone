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

export interface LessonDefinition {
  lessonId: string
  title: string
  /** 1-based lesson order within the chapter. */
  order: number
  /** Existing problem IDs that belong to this lesson, in play order. */
  problemIds: string[]
}

/** Per-problem position within the lesson/chapter structure. */
export interface ProblemMeta {
  problemId: string
  lessonId: string
  /** 0-based lesson index. */
  lessonIndex: number
  /** 0-based index of the problem within its lesson. */
  problemIndexWithinLesson: number
  /** 0-based index of the problem within the whole chapter. */
  globalProblemIndex: number
}

/** Derived, lesson-aware view over the persisted ChapterProgress (not stored). */
export interface LessonProgressView {
  lessonId: string
  title: string
  order: number
  problemIds: string[]
  completedCount: number
  isComplete: boolean
  isCurrent: boolean
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
