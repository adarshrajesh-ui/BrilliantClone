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
  /**
   * Legacy resume cursor (0-based). Retained for backward compatibility; the
   * authoritative resume target is derived from completedProblemIds via the
   * progression selectors and surfaced as nextProblemId.
   */
  currentProblemIndex: number
  currentProblemId?: string
  completedProblemIds: string[]
  completionPercentage: number
  masteryStatus: MasteryStatus
  streakCount: number
  lastActiveDate: string
  updatedAt: string

  // --- PRD five-lesson fields (optional for backward compatibility). ---
  /** Lesson containing the next incomplete problem. */
  currentLessonId?: string
  /** Lesson after the current one (null when current is last / chapter done). */
  nextLessonId?: string | null
  /** Storage ID of the next incomplete problem (null when all complete). */
  nextProblemId?: string | null
  /** Highest 0-based global index reachable with no gaps from the start (-1 = none). */
  highestSequentialCompletedGlobalIndex?: number
  /** Lesson IDs where all member problems are complete. */
  completedLessonIds?: string[]
}

export type ProblemStatus = 'not_started' | 'in_progress' | 'completed'

/**
 * Compact, persisted snapshot of a completed problem so Review Mode can be
 * reconstructed without re-running simulations or re-deriving feedback.
 */
export interface ReviewSnapshot {
  /** Final visual/interaction state needed to render the completed view. */
  visualState?: Record<string, unknown>
  /** Compact simulation summary (e.g. graph series) where applicable. */
  simulationSummary?: Record<string, unknown>
  submittedAnswer?: string
  normalizedAnswer?: number | string | Record<string, unknown>
  feedbackKey?: string
  hintsUsed?: number
  gradedAttemptCount?: number
  completedAt?: string
}

export interface ProblemProgress {
  userId: string
  chapterId: typeof CHAPTER_ID
  lessonId: string
  problemId: string
  status: ProblemStatus
  firstStartedAt?: string
  completedAt?: string
  bestGradedAttemptNumber?: number
  finalSubmittedAnswer?: string
  finalNormalizedAnswer?: number | string | Record<string, unknown>
  finalMistakeType?: string | null
  finalFeedbackKey?: string
  reviewSnapshot?: ReviewSnapshot
  /** Whether the learner has seen the pre-problem mini-demo. */
  demoSeen?: boolean
  demoLastSeenAt?: string
  /** Number of explicit "Restart This Problem" practice sessions started. */
  restartCount?: number
  lastReviewedAt?: string
  updatedAt: string
}

export interface LessonProgress {
  userId: string
  chapterId: typeof CHAPTER_ID
  lessonId: string
  completedProblemIds: string[]
  completionPercentage: number
  lessonCompleted: boolean
  firstStartedAt?: string
  completedAt?: string
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
  /** Lesson IDs completed (mirrors chapter progress; optional for old docs). */
  completedLessonIds?: string[]
  chapterCompleted: boolean
  chapterMastered: boolean
  updatedAt: string
}

export interface MilestoneDefinition {
  id: string
  label: string
  description: string
}
