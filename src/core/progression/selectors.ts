// Pure progression selectors (Agent 1 — Core Architecture).
//
// All selectors take `completedProblemIds` exactly as persisted (storage IDs,
// possibly legacy `problem-N`, possibly with duplicates or unrecognized IDs)
// and normalize internally. They never mutate input and never depend on
// React/Firestore — they are deterministic and unit-testable.

import {
  CANONICAL_LESSONS,
  CANONICAL_PROBLEMS,
  PROBLEMS_PER_LESSON,
  TOTAL_PROBLEMS,
  getGlobalProblemIndex,
  getProblemsForLesson,
  resolveCanonicalProblem,
  type CanonicalLesson,
  type CanonicalProblem,
} from './canonical'

/** Ordered, immutable list of all 20 problems. */
export function orderedChapterProblems(): readonly CanonicalProblem[] {
  return CANONICAL_PROBLEMS
}

/** The lesson that contains a given problem (accepts slug or storage ID). */
export function getLessonForProblem(problemId: string): CanonicalLesson | undefined {
  const problem = resolveCanonicalProblem(problemId)
  if (!problem) {
    return undefined
  }
  return CANONICAL_LESSONS.find((l) => l.lessonId === problem.lessonId)
}

/**
 * Set of 0-based global indices that are completed. Unrecognized IDs are
 * ignored and duplicates collapse, so each problem counts at most once.
 */
export function completedIndexSet(completedProblemIds: string[]): Set<number> {
  const set = new Set<number>()
  for (const id of completedProblemIds) {
    const idx = getGlobalProblemIndex(id)
    if (idx >= 0) {
      set.add(idx)
    }
  }
  return set
}

/** Count of unique, recognized completed problems (0..20). */
export function uniqueCompletedCount(completedProblemIds: string[]): number {
  return completedIndexSet(completedProblemIds).size
}

export function isProblemCompleted(problemId: string, completedProblemIds: string[]): boolean {
  const idx = getGlobalProblemIndex(problemId)
  if (idx < 0) {
    return false
  }
  return completedIndexSet(completedProblemIds).has(idx)
}

export function isLessonCompleted(lessonId: string, completedProblemIds: string[]): boolean {
  const problems = getProblemsForLesson(lessonId)
  if (problems.length === 0) {
    return false
  }
  const completed = completedIndexSet(completedProblemIds)
  return problems.every((p) => completed.has(p.globalProblemIndex))
}

/** Lesson IDs where all member problems are complete, in lesson order. */
export function getCompletedLessonIds(completedProblemIds: string[]): string[] {
  return CANONICAL_LESSONS.filter((l) => isLessonCompleted(l.lessonId, completedProblemIds)).map(
    (l) => l.lessonId,
  )
}

/** Lesson completion percentage (0..100), rounded. */
export function getLessonCompletionPercentage(
  lessonId: string,
  completedProblemIds: string[],
): number {
  const problems = getProblemsForLesson(lessonId)
  if (problems.length === 0) {
    return 0
  }
  const completed = completedIndexSet(completedProblemIds)
  const done = problems.filter((p) => completed.has(p.globalProblemIndex)).length
  return Math.round((done / problems.length) * 100)
}

/** Chapter completion percentage (0..100), rounded; each problem counts once. */
export function getChapterCompletionPercentage(completedProblemIds: string[]): number {
  return Math.round((uniqueCompletedCount(completedProblemIds) / TOTAL_PROBLEMS) * 100)
}

/**
 * Highest 0-based global index reachable with NO gaps from the start.
 * Returns -1 when the first problem is not complete. Gaps do not advance it
 * (e.g. completing only problems 0 and 2 yields 0, not 2).
 */
export function getHighestSequentialCompletedIndex(completedProblemIds: string[]): number {
  const completed = completedIndexSet(completedProblemIds)
  let highest = -1
  for (let i = 0; i < TOTAL_PROBLEMS; i += 1) {
    if (completed.has(i)) {
      highest = i
    } else {
      break
    }
  }
  return highest
}

/** The farthest completed global index (allows gaps); -1 if none complete. */
export function getFarthestCompletedIndex(completedProblemIds: string[]): number {
  const completed = completedIndexSet(completedProblemIds)
  let farthest = -1
  for (const idx of completed) {
    if (idx > farthest) {
      farthest = idx
    }
  }
  return farthest
}

export function isChapterComplete(completedProblemIds: string[]): boolean {
  return uniqueCompletedCount(completedProblemIds) >= TOTAL_PROBLEMS
}

/**
 * The next problem to play in ordered progression: the first incomplete problem
 * after the farthest completed one, falling back to the first incomplete problem
 * overall (handles non-contiguous completion). Undefined only when all complete.
 */
export function getNextIncompleteProblem(
  completedProblemIds: string[],
): CanonicalProblem | undefined {
  const completed = completedIndexSet(completedProblemIds)
  const farthest = getFarthestCompletedIndex(completedProblemIds)
  const afterFarthest = CANONICAL_PROBLEMS.find(
    (p) => p.globalProblemIndex > farthest && !completed.has(p.globalProblemIndex),
  )
  if (afterFarthest) {
    return afterFarthest
  }
  return CANONICAL_PROBLEMS.find((p) => !completed.has(p.globalProblemIndex))
}

/** Storage ID of the next incomplete problem, or null when all complete. */
export function getNextIncompleteProblemId(completedProblemIds: string[]): string | null {
  return getNextIncompleteProblem(completedProblemIds)?.storageId ?? null
}

/**
 * Continue destination (storage ID). Routes to the first incomplete problem in
 * ordered progression. When everything is complete it returns the first
 * problem's storage ID for review (the UI must surface review/mastery rather
 * than restarting it as a fresh attempt).
 */
export function getContinueProblemId(completedProblemIds: string[]): string {
  return getNextIncompleteProblem(completedProblemIds)?.storageId ?? CANONICAL_PROBLEMS[0].storageId
}

/**
 * Lesson the learner is currently working through: the lesson of the next
 * incomplete problem. When all problems are complete, the final lesson.
 */
export function getCurrentLessonId(completedProblemIds: string[]): string {
  const next = getNextIncompleteProblem(completedProblemIds)
  if (!next) {
    return CANONICAL_LESSONS[CANONICAL_LESSONS.length - 1].lessonId
  }
  return next.lessonId
}

/**
 * The lesson immediately following the current lesson in order, or null when
 * the current lesson is the last one (or the chapter is complete).
 */
export function getNextLessonId(completedProblemIds: string[]): string | null {
  if (isChapterComplete(completedProblemIds)) {
    return null
  }
  const currentLessonId = getCurrentLessonId(completedProblemIds)
  const currentOrder = CANONICAL_LESSONS.find((l) => l.lessonId === currentLessonId)?.order ?? 0
  const next = CANONICAL_LESSONS.find((l) => l.order === currentOrder + 1)
  return next?.lessonId ?? null
}

export interface LessonProgressView {
  lessonId: string
  title: string
  order: number
  problemIds: string[]
  completedCount: number
  isComplete: boolean
  isCurrent: boolean
}

/** Lesson-aware view for pathway UIs. `problemIds` are storage IDs in order. */
export function getLessonProgressViews(
  completedProblemIds: string[],
  continueProblemId: string,
  allComplete: boolean,
): LessonProgressView[] {
  const currentLessonId = allComplete ? null : getLessonForProblem(continueProblemId)?.lessonId
  const completed = completedIndexSet(completedProblemIds)
  return CANONICAL_LESSONS.map((lesson) => {
    const problems = getProblemsForLesson(lesson.lessonId)
    const completedCount = problems.filter((p) => completed.has(p.globalProblemIndex)).length
    return {
      lessonId: lesson.lessonId,
      title: lesson.title,
      order: lesson.order,
      problemIds: problems.map((p) => p.storageId),
      completedCount,
      isComplete: completedCount === problems.length,
      isCurrent: lesson.lessonId === currentLessonId,
    }
  })
}

export { PROBLEMS_PER_LESSON, TOTAL_PROBLEMS }
