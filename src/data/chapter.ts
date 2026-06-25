// Chapter metadata + legacy-compatible facade over the canonical progression
// model in `src/core/progression`. UI surfaces and older callers import from
// here; the single source of truth for ordering lives in core.

import type {
  ChapterProblem,
  LessonDefinition,
  MilestoneDefinition,
  ProblemMeta,
} from '../types/chapter'
import {
  CANONICAL_LESSONS,
  CANONICAL_PROBLEMS,
  TOTAL_LESSONS as CORE_TOTAL_LESSONS,
  TOTAL_PROBLEMS as CORE_TOTAL_PROBLEMS,
  getProblemsForLesson,
  resolveCanonicalProblem,
} from '../core/progression/canonical'
import {
  getChapterCompletionPercentage,
  getCompletedLessonIds as coreGetCompletedLessonIds,
  getContinueProblemId as coreGetContinueProblemId,
  getFarthestCompletedIndex,
  getLessonProgressViews as coreGetLessonProgressViews,
  getNextIncompleteProblem as coreGetNextIncompleteProblem,
  isLessonCompleted,
  type LessonProgressView,
} from '../core/progression/selectors'

export const CHAPTER_TITLE = 'Midpoint — Expected Value'

export const CHAPTER_SUBTITLE =
  'A hands-on expected value course with 5 lessons and 14 interactive problems on long-run averages, weighted models, payout, profit, fairness, and risk.'

export const CHAPTER_DESCRIPTION =
  'Fourteen interactive problems that move from simulation intuition to complete expected value models under uncertainty.'

/**
 * Legacy-shaped problem list (problemId = storage ID, order = 1-based global
 * index). Built from the canonical model so it stays in sync automatically.
 */
export const CHAPTER_PROBLEMS: ChapterProblem[] = CANONICAL_PROBLEMS.map((p) => ({
  problemId: p.storageId,
  title: p.title,
  concept: p.concept,
  order: p.globalProblemIndex + 1,
}))

/** Five lessons with active problem storage IDs in play order. */
export const CHAPTER_LESSONS: LessonDefinition[] = CANONICAL_LESSONS.map((lesson) => ({
  lessonId: lesson.lessonId,
  title: lesson.title,
  order: lesson.order,
  problemIds: getProblemsForLesson(lesson.lessonId).map((p) => p.storageId),
}))

export const TOTAL_LESSONS = CORE_TOTAL_LESSONS
export const TOTAL_PROBLEMS = CORE_TOTAL_PROBLEMS

export function getLessonForProblem(problemId: string): LessonDefinition | undefined {
  const problem = resolveCanonicalProblem(problemId)
  if (!problem) {
    return undefined
  }
  return CHAPTER_LESSONS.find((lesson) => lesson.lessonId === problem.lessonId)
}

export function getProblemMeta(problemId: string): ProblemMeta | undefined {
  const problem = resolveCanonicalProblem(problemId)
  if (!problem) {
    return undefined
  }
  return {
    problemId: problem.storageId,
    lessonId: problem.lessonId,
    lessonIndex: problem.lessonIndex,
    problemIndexWithinLesson: problem.problemIndexWithinLesson,
    globalProblemIndex: problem.globalProblemIndex,
  }
}

export function isLessonComplete(lessonId: string, completedProblemIds: string[]): boolean {
  return isLessonCompleted(lessonId, completedProblemIds)
}

export function getCompletedLessonIds(completedProblemIds: string[]): string[] {
  return coreGetCompletedLessonIds(completedProblemIds)
}

/** The lesson that contains the next incomplete problem (continue target). */
export function getCurrentLessonId(continueProblemId: string): string {
  return getLessonForProblem(continueProblemId)?.lessonId ?? CHAPTER_LESSONS[0].lessonId
}

/** Lesson-aware pathway view. Pure derivation — nothing persisted. */
export function getLessonProgressViews(
  completedProblemIds: string[],
  continueProblemId: string,
  allComplete: boolean,
): LessonProgressView[] {
  return coreGetLessonProgressViews(completedProblemIds, continueProblemId, allComplete)
}

export const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  { id: 'chapter-started', label: 'Chapter started', description: 'Opened Midpoint.' },
  { id: 'first-problem-complete', label: 'First win', description: 'Completed your first problem.' },
  {
    id: 'first-direct-correction',
    label: 'Quick recovery',
    description: 'Fixed a wrong answer with a direct correction.',
  },
  { id: 'lesson-1-complete', label: 'Lesson 1 complete', description: 'Finished the long-run average lesson.' },
  { id: 'lesson-2-complete', label: 'Lesson 2 complete', description: 'Finished the weighted-average lesson.' },
  { id: 'lesson-3-complete', label: 'Lesson 3 complete', description: 'Finished the counts & tables lesson.' },
  { id: 'lesson-4-complete', label: 'Lesson 4 complete', description: 'Finished the payout, profit & fairness lesson.' },
  { id: 'half-chapter', label: 'Halfway there', description: 'Completed 7 of 14 problems.' },
  {
    id: 'all-simulations-complete',
    label: 'Simulation pro',
    description: 'Completed every simulation problem.',
  },
  {
    id: 'profit-fairness-distinction',
    label: 'Profit & fairness',
    description: 'Demonstrated expected payout vs expected profit.',
  },
  { id: 'risk-distinction', label: 'Risk aware', description: 'Distinguished equal EV from equal risk.' },
  {
    id: 'final-capstone-complete',
    label: 'Capstone complete',
    description: 'Finished the final capstone decision.',
  },
  { id: 'chapter-complete', label: 'Chapter complete', description: 'Finished all 14 problems.' },
  { id: 'chapter-mastered', label: 'Chapter mastered', description: 'Met mastery criteria for this course.' },
]

export function getProblemById(problemId: string): ChapterProblem | undefined {
  return CHAPTER_PROBLEMS.find((p) => p.problemId === problemId)
}

/**
 * The storage ID of the problem immediately after this one in canonical chapter
 * order (or undefined for the final problem / an unknown ID). This is the single
 * source of truth for "next problem" so in-problem navigation matches the chapter
 * map exactly — both keyed by the same storage IDs and canonical ordering.
 */
export function getAdjacentNextProblemId(problemId: string): string | undefined {
  const meta = getProblemMeta(problemId)
  if (!meta) {
    return undefined
  }
  return CHAPTER_PROBLEMS[meta.globalProblemIndex + 1]?.problemId
}

/**
 * The storage ID of the problem immediately before this one in canonical chapter
 * order (or undefined for the first problem / an unknown ID). Used by
 * in-problem navigation so Previous follows the same ordering as the course map.
 */
export function getAdjacentPreviousProblemId(problemId: string): string | undefined {
  const meta = getProblemMeta(problemId)
  if (!meta) {
    return undefined
  }
  return CHAPTER_PROBLEMS[meta.globalProblemIndex - 1]?.problemId
}

/**
 * The 1-based `order` of the farthest completed problem (0 when nothing is
 * complete). Allows gaps; never moves backward when older problems are
 * reviewed/restarted. Retained for legacy callers/tests.
 */
export function getFarthestCompletedOrder(completedProblemIds: string[]): number {
  const idx = getFarthestCompletedIndex(completedProblemIds)
  return idx < 0 ? 0 : idx + 1
}

/** Next problem to play (legacy ChapterProblem shape); undefined when complete. */
export function getNextIncompleteProblem(
  completedProblemIds: string[],
): ChapterProblem | undefined {
  const next = coreGetNextIncompleteProblem(completedProblemIds)
  if (!next) {
    return undefined
  }
  return CHAPTER_PROBLEMS.find((p) => p.problemId === next.storageId)
}

export function getNextIncompleteProblemIndex(completedProblemIds: string[]): number {
  const next = coreGetNextIncompleteProblem(completedProblemIds)
  if (!next) {
    return CHAPTER_PROBLEMS.length - 1
  }
  return next.globalProblemIndex
}

/**
 * Continue destination. Always the first incomplete problem in ordered
 * progression, so opening or restarting an older completed problem never drags
 * the resume point backward. When everything is complete it returns the first
 * problem for review (UI must show review/mastery, not a fresh restart).
 */
export function getContinueProblemId(progress: {
  currentProblemIndex: number
  currentProblemId?: string
  completedProblemIds: string[]
}): string {
  return coreGetContinueProblemId(progress.completedProblemIds)
}

export { getChapterCompletionPercentage }
