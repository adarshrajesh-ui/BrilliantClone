import { describe, expect, it } from 'vitest'
import {
  CHAPTER_LESSONS,
  CHAPTER_PROBLEMS,
  TOTAL_LESSONS,
  TOTAL_PROBLEMS,
  getCompletedLessonIds,
  getAdjacentNextProblemId,
  getAdjacentPreviousProblemId,
  getContinueProblemId,
  getCurrentLessonId,
  getLessonForProblem,
  getLessonProgressViews,
  getProblemMeta,
} from './chapter'

const LESSON_1 = ['problem-1', 'ev-l1-p2', 'ev-l1-p3']
const LESSON_3 = ['problem-4', 'ev-l3-p3']

describe('chapter facade — lesson structure', () => {
  it('has 5 lessons / 14 active problems in order', () => {
    expect(TOTAL_LESSONS).toBe(5)
    expect(TOTAL_PROBLEMS).toBe(14)
    expect(CHAPTER_PROBLEMS).toHaveLength(14)
    expect(CHAPTER_LESSONS).toHaveLength(5)
    expect(CHAPTER_LESSONS[2].problemIds).toHaveLength(2)
    const mapped = CHAPTER_LESSONS.flatMap((l) => l.problemIds)
    expect(mapped).toEqual(CHAPTER_PROBLEMS.map((p) => p.problemId))
  })

  it('preserves the original 8 storage IDs in the expanded ordering', () => {
    expect(CHAPTER_LESSONS[0].problemIds).toEqual(LESSON_1)
    expect(CHAPTER_LESSONS[2].problemIds).toEqual(LESSON_3)
    expect(getLessonForProblem('problem-1')?.lessonId).toBe('lesson-1')
    expect(getLessonForProblem('problem-2')?.lessonId).toBe('lesson-2')
    expect(getLessonForProblem('problem-4')?.lessonId).toBe('lesson-3')
    expect(getLessonForProblem('problem-6')?.lessonId).toBe('lesson-4')
    expect(getLessonForProblem('problem-8')?.lessonId).toBe('lesson-5')
  })

  it('derives problem meta with active global indices', () => {
    expect(getProblemMeta('problem-4')).toEqual({
      problemId: 'problem-4',
      lessonId: 'lesson-3',
      lessonIndex: 2,
      problemIndexWithinLesson: 0,
      globalProblemIndex: 6,
    })
  })

  it('derives adjacent previous and next problem ids in canonical order', () => {
    expect(getAdjacentPreviousProblemId('problem-1')).toBeUndefined()
    expect(getAdjacentNextProblemId('problem-1')).toBe('ev-l1-p2')
    expect(getAdjacentPreviousProblemId('problem-2')).toBe('ev-l1-p3')
    expect(getAdjacentNextProblemId('ev-l5-p3')).toBeUndefined()
  })
})

describe('chapter facade — completion + continue', () => {
  const progress = (completed: string[], currentProblemId?: string) => ({
    currentProblemIndex: 0,
    currentProblemId,
    completedProblemIds: completed,
  })

  it('completes a lesson only when all active problems are done', () => {
    expect(getCompletedLessonIds(['problem-4'])).toEqual([])
    expect(getCompletedLessonIds(LESSON_3)).toEqual(['lesson-3'])
    expect(getCompletedLessonIds(LESSON_1)).toEqual(['lesson-1'])
  })

  it('continue points to the first incomplete problem across lesson boundaries', () => {
    // Lesson 1 fully done -> continue is the first problem of lesson 2 (problem-2).
    expect(getContinueProblemId(progress(LESSON_1))).toBe('problem-2')
    expect(getCurrentLessonId('problem-2')).toBe('lesson-2')
  })

  it('reviewing an earlier completed problem does not move progress backward', () => {
    const completed = [...LESSON_1, 'problem-2']
    // Even if "currently" revisiting problem-1, continue stays at the farthest gap.
    expect(getContinueProblemId(progress(completed, 'problem-1'))).toBe('ev-l2-p2')
  })

  it('marks current lesson and capstone state in the pathway view', () => {
    const views = getLessonProgressViews(LESSON_1, 'problem-2', false)
    expect(views.find((v) => v.lessonId === 'lesson-1')?.isComplete).toBe(true)
    expect(views.find((v) => v.lessonId === 'lesson-2')?.isCurrent).toBe(true)
    expect(views.find((v) => v.lessonId === 'lesson-5')?.isCurrent).toBe(false)
  })
})
