import type {
  ChapterProblem,
  LessonDefinition,
  LessonProgressView,
  MilestoneDefinition,
  ProblemMeta,
} from '../types/chapter'

export const CHAPTER_TITLE = 'Expected Value — The Average Outcome of Uncertainty'

export const CHAPTER_SUBTITLE =
  'Play through 5 lessons (8 visual challenges) to master long-run average, payout, profit, fairness, and risk.'

export const CHAPTER_DESCRIPTION =
  'Eight visual, interactive problems that move you from observing a simulation to building and interpreting an expected value model.'

export const CHAPTER_PROBLEMS: ChapterProblem[] = [
  {
    problemId: 'problem-1',
    title: 'The Long-Run Average',
    concept: 'EV is the average outcome over many repetitions.',
    order: 1,
  },
  {
    problemId: 'problem-2',
    title: 'Build the Weighted Average',
    concept: 'EV is a weighted average of outcomes.',
    order: 2,
  },
  {
    problemId: 'problem-3',
    title: 'Mystery Box Outcomes',
    concept: 'EV can be calculated from counts, not just percentages.',
    order: 3,
  },
  {
    problemId: 'problem-4',
    title: 'Calculate EV from the Table',
    concept: 'Sum each outcome × probability contribution.',
    order: 4,
  },
  {
    problemId: 'problem-5',
    title: 'Expected Payout vs Expected Profit',
    concept: 'Payout and profit differ when there is a cost to play.',
    order: 5,
  },
  {
    problemId: 'problem-6',
    title: 'Fair, Favorable, or Unfavorable?',
    concept: 'Positive expected profit is favorable; zero is fair; negative is unfavorable.',
    order: 6,
  },
  {
    problemId: 'problem-7',
    title: 'Build the Whole EV Model',
    concept: 'Independently convert a game into an EV calculation.',
    order: 7,
  },
  {
    problemId: 'problem-8',
    title: 'Same Expected Value, Different Risk',
    concept: 'EV does not describe the full experience of uncertainty.',
    order: 8,
  },
]

/**
 * Five-lesson structure layered over the existing eight problems. Problem IDs are
 * preserved exactly so saved progress (completedProblemIds) keeps resolving.
 */
export const CHAPTER_LESSONS: LessonDefinition[] = [
  {
    lessonId: 'lesson-1',
    title: 'Expected Value as Long-Run Average',
    order: 1,
    problemIds: ['problem-1'],
  },
  {
    lessonId: 'lesson-2',
    title: 'Expected Value as a Weighted Average',
    order: 2,
    problemIds: ['problem-2'],
  },
  {
    lessonId: 'lesson-3',
    title: 'Counts, Tables, and Discrete Outcomes',
    order: 3,
    problemIds: ['problem-3', 'problem-4'],
  },
  {
    lessonId: 'lesson-4',
    title: 'Expected Payout, Expected Profit, and Fairness',
    order: 4,
    problemIds: ['problem-5', 'problem-6'],
  },
  {
    lessonId: 'lesson-5',
    title: 'Same EV, Different Risk, and Full EV Models',
    order: 5,
    problemIds: ['problem-7', 'problem-8'],
  },
]

export const TOTAL_LESSONS = CHAPTER_LESSONS.length

export function getLessonForProblem(problemId: string): LessonDefinition | undefined {
  return CHAPTER_LESSONS.find((lesson) => lesson.problemIds.includes(problemId))
}

export function getProblemMeta(problemId: string): ProblemMeta | undefined {
  const lesson = getLessonForProblem(problemId)
  const globalProblemIndex = CHAPTER_PROBLEMS.findIndex((p) => p.problemId === problemId)
  if (!lesson || globalProblemIndex < 0) {
    return undefined
  }
  return {
    problemId,
    lessonId: lesson.lessonId,
    lessonIndex: lesson.order - 1,
    problemIndexWithinLesson: lesson.problemIds.indexOf(problemId),
    globalProblemIndex,
  }
}

export function isLessonComplete(lessonId: string, completedProblemIds: string[]): boolean {
  const lesson = CHAPTER_LESSONS.find((l) => l.lessonId === lessonId)
  if (!lesson) {
    return false
  }
  return lesson.problemIds.every((pid) => completedProblemIds.includes(pid))
}

export function getCompletedLessonIds(completedProblemIds: string[]): string[] {
  return CHAPTER_LESSONS.filter((lesson) =>
    lesson.problemIds.every((pid) => completedProblemIds.includes(pid)),
  ).map((lesson) => lesson.lessonId)
}

/** The lesson that contains the next incomplete problem (the "continue" target). */
export function getCurrentLessonId(continueProblemId: string): string {
  return getLessonForProblem(continueProblemId)?.lessonId ?? CHAPTER_LESSONS[0].lessonId
}

/** Lesson-aware view used by the pathway UI. Pure derivation — nothing persisted. */
export function getLessonProgressViews(
  completedProblemIds: string[],
  continueProblemId: string,
  allComplete: boolean,
): LessonProgressView[] {
  const currentLessonId = allComplete ? null : getCurrentLessonId(continueProblemId)
  return CHAPTER_LESSONS.map((lesson) => {
    const completedCount = lesson.problemIds.filter((pid) =>
      completedProblemIds.includes(pid),
    ).length
    return {
      lessonId: lesson.lessonId,
      title: lesson.title,
      order: lesson.order,
      problemIds: lesson.problemIds,
      completedCount,
      isComplete: completedCount === lesson.problemIds.length,
      isCurrent: lesson.lessonId === currentLessonId,
    }
  })
}

export const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  {
    id: 'chapter-started',
    label: 'Chapter started',
    description: 'Opened the Expected Value chapter.',
  },
  {
    id: 'first-problem-complete',
    label: 'First win',
    description: 'Completed your first problem.',
  },
  {
    id: 'half-chapter',
    label: 'Halfway there',
    description: 'Completed 4 of 8 problems.',
  },
  {
    id: 'chapter-complete',
    label: 'Chapter complete',
    description: 'Finished all 8 problems.',
  },
  {
    id: 'chapter-mastered',
    label: 'Chapter mastered',
    description: 'Met mastery criteria for this chapter.',
  },
]

export function getProblemById(problemId: string): ChapterProblem | undefined {
  return CHAPTER_PROBLEMS.find((p) => p.problemId === problemId)
}

/**
 * The highest `order` of any completed problem (0 when nothing is complete).
 * This represents the learner's farthest progression through the required
 * sequence and must never move backward when older problems are reviewed or
 * restarted.
 */
export function getFarthestCompletedOrder(completedProblemIds: string[]): number {
  return CHAPTER_PROBLEMS.reduce(
    (max, p) =>
      completedProblemIds.includes(p.problemId) ? Math.max(max, p.order) : max,
    0,
  )
}

/**
 * The next problem the learner should continue to: the first incomplete
 * problem that comes *after* the farthest completed problem in the sequence.
 * Falls back to the first incomplete problem overall (handles non-contiguous
 * completion), and returns undefined only when every problem is complete.
 */
export function getNextIncompleteProblem(
  completedProblemIds: string[],
): ChapterProblem | undefined {
  const farthest = getFarthestCompletedOrder(completedProblemIds)
  const afterFarthest = CHAPTER_PROBLEMS.find(
    (p) => p.order > farthest && !completedProblemIds.includes(p.problemId),
  )
  if (afterFarthest) {
    return afterFarthest
  }
  return CHAPTER_PROBLEMS.find((p) => !completedProblemIds.includes(p.problemId))
}

export function getNextIncompleteProblemIndex(
  completedProblemIds: string[],
): number {
  const next = getNextIncompleteProblem(completedProblemIds)
  if (!next) {
    return CHAPTER_PROBLEMS.length - 1
  }
  return CHAPTER_PROBLEMS.findIndex((p) => p.problemId === next.problemId)
}

/**
 * Where "Continue chapter" should route. Always the first incomplete problem
 * after the farthest completed progression, so opening or restarting an older
 * completed problem never drags the resume point backward. When the whole
 * chapter is complete we route to the first problem for review.
 */
export function getContinueProblemId(progress: {
  currentProblemIndex: number
  currentProblemId?: string
  completedProblemIds: string[]
}): string {
  const next = getNextIncompleteProblem(progress.completedProblemIds)
  return next?.problemId ?? CHAPTER_PROBLEMS[0].problemId
}
