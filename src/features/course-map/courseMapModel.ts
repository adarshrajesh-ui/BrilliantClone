import type { ChapterProblem, LessonProgressView } from '../../types/chapter'
import type { CourseHoleView, CourseMapView, CourseZoneView, HoleState } from './types'

/**
 * Pure derivation of the course-map view model.
 *
 * IMPORTANT: this performs NO authoritative progression. All inputs
 * (`lessons`, `completedProblemIds`, `continueProblemId`, `allComplete`) are
 * produced upstream by Agent 1's selectors in `src/data/chapter.ts`. This
 * function only arranges them for rendering and is fully unit-testable.
 */
export function buildCourseMapView(params: {
  lessons: LessonProgressView[]
  problems: ChapterProblem[]
  completedProblemIds: string[]
  continueProblemId: string
  allComplete: boolean
}): CourseMapView {
  const { lessons, problems, completedProblemIds, continueProblemId, allComplete } = params

  const orderOf = (problemId: string): number =>
    problems.find((p) => p.problemId === problemId)?.order ?? 0
  const titleOf = (problemId: string): string =>
    problems.find((p) => p.problemId === problemId)?.title ?? problemId

  const totalHoles = problems.length
  const lastOrder = problems.reduce((max, p) => Math.max(max, p.order), 0)

  const zones: CourseZoneView[] = lessons.map((lesson) => {
    const holes: CourseHoleView[] = lesson.problemIds.map((problemId) => {
      const order = orderOf(problemId)
      const isComplete = completedProblemIds.includes(problemId)
      const isCurrent = !allComplete && problemId === continueProblemId
      const isFinal = order === lastOrder
      const state: HoleState = isFinal
        ? 'final'
        : isComplete
          ? 'complete'
          : isCurrent
            ? 'current'
            : 'future'
      return { problemId, order, title: titleOf(problemId), state, isFinal, isComplete, isCurrent }
    })

    return {
      lessonId: lesson.lessonId,
      title: lesson.title,
      order: lesson.order,
      holes,
      completedCount: lesson.completedCount,
      total: lesson.problemIds.length,
      isComplete: lesson.isComplete,
      isCurrent: lesson.isCurrent,
    }
  })

  const currentProblemOrder = allComplete ? totalHoles : orderOf(continueProblemId)

  return {
    zones,
    currentHoleOrder: currentProblemOrder || 1,
    totalHoles,
    completedCount: completedProblemIds.length,
    allComplete,
  }
}

/** Flatten the zones into a single ordered list of holes (for compact maps). */
export function flattenHoles(view: CourseMapView): CourseHoleView[] {
  return view.zones.flatMap((z) => z.holes)
}
