import { describe, expect, it } from 'vitest'
import type { ChapterProblem, LessonProgressView } from '../../../types/chapter'
import { buildCourseMapView, flattenHoles } from '../courseMapModel'

const problems: ChapterProblem[] = [
  { problemId: 'p1', title: 'One', concept: '', order: 1 },
  { problemId: 'p2', title: 'Two', concept: '', order: 2 },
  { problemId: 'p3', title: 'Three', concept: '', order: 3 },
  { problemId: 'p4', title: 'Four', concept: '', order: 4 },
]

function lessons(completed: string[], current: string): LessonProgressView[] {
  const allComplete = completed.length === problems.length
  return [
    { lessonId: 'L1', title: 'Lesson 1', order: 1, problemIds: ['p1', 'p2'], completedCount: 0, isComplete: false, isCurrent: false },
    { lessonId: 'L2', title: 'Lesson 2', order: 2, problemIds: ['p3', 'p4'], completedCount: 0, isComplete: false, isCurrent: false },
  ].map((l) => {
    const completedCount = l.problemIds.filter((p) => completed.includes(p)).length
    return {
      ...l,
      completedCount,
      isComplete: completedCount === l.problemIds.length,
      isCurrent: !allComplete && l.problemIds.includes(current),
    }
  })
}

describe('buildCourseMapView', () => {
  it('derives hole states and the current hole order', () => {
    const view = buildCourseMapView({
      lessons: lessons(['p1'], 'p2'),
      problems,
      completedProblemIds: ['p1'],
      continueProblemId: 'p2',
      allComplete: false,
    })
    const holes = flattenHoles(view)
    expect(holes.map((h) => h.state)).toEqual(['complete', 'current', 'future', 'final'])
    expect(view.currentHoleOrder).toBe(2)
    expect(view.completedCount).toBe(1)
    expect(view.totalHoles).toBe(4)
  })

  it('flags the highest-order hole as final', () => {
    const view = buildCourseMapView({
      lessons: lessons([], 'p1'),
      problems,
      completedProblemIds: [],
      continueProblemId: 'p1',
      allComplete: false,
    })
    const holes = flattenHoles(view)
    expect(holes[3].isFinal).toBe(true)
    expect(holes[3].state).toBe('final')
    expect(holes.slice(0, 3).every((h) => !h.isFinal)).toBe(true)
  })

  it('has no current hole when all complete and points current order to the last', () => {
    const view = buildCourseMapView({
      lessons: lessons(['p1', 'p2', 'p3', 'p4'], 'p1'),
      problems,
      completedProblemIds: ['p1', 'p2', 'p3', 'p4'],
      continueProblemId: 'p1',
      allComplete: true,
    })
    expect(view.allComplete).toBe(true)
    expect(flattenHoles(view).some((h) => h.isCurrent)).toBe(false)
    expect(view.currentHoleOrder).toBe(4)
  })

  it('marks zone completion and current zone', () => {
    const view = buildCourseMapView({
      lessons: lessons(['p1', 'p2'], 'p3'),
      problems,
      completedProblemIds: ['p1', 'p2'],
      continueProblemId: 'p3',
      allComplete: false,
    })
    expect(view.zones[0].isComplete).toBe(true)
    expect(view.zones[1].isCurrent).toBe(true)
  })
})
