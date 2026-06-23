import { describe, expect, it } from 'vitest'
import {
  CHAPTER_LESSONS,
  CHAPTER_PROBLEMS,
  getCompletedLessonIds,
  getContinueProblemId,
  getCurrentLessonId,
  getLessonForProblem,
  getLessonProgressViews,
  getProblemMeta,
  TOTAL_LESSONS,
} from './chapter'

describe('lesson structure', () => {
  it('has 5 lessons covering all 8 existing problems exactly once, in order', () => {
    expect(TOTAL_LESSONS).toBe(5)
    const mapped = CHAPTER_LESSONS.flatMap((l) => l.problemIds)
    expect(mapped).toEqual(CHAPTER_PROBLEMS.map((p) => p.problemId))
  })

  it('maps each problem to the correct lesson', () => {
    expect(getLessonForProblem('problem-1')?.lessonId).toBe('lesson-1')
    expect(getLessonForProblem('problem-2')?.lessonId).toBe('lesson-2')
    expect(getLessonForProblem('problem-4')?.lessonId).toBe('lesson-3')
    expect(getLessonForProblem('problem-6')?.lessonId).toBe('lesson-4')
    expect(getLessonForProblem('problem-8')?.lessonId).toBe('lesson-5')
  })

  it('derives problem meta (lesson/within-lesson/global indices)', () => {
    expect(getProblemMeta('problem-4')).toEqual({
      problemId: 'problem-4',
      lessonId: 'lesson-3',
      lessonIndex: 2,
      problemIndexWithinLesson: 1,
      globalProblemIndex: 3,
    })
  })
})

describe('lesson completion', () => {
  it('completes a lesson only when all its problems are done', () => {
    expect(getCompletedLessonIds(['problem-3'])).toEqual([])
    expect(getCompletedLessonIds(['problem-3', 'problem-4'])).toEqual(['lesson-3'])
    expect(getCompletedLessonIds(['problem-1', 'problem-2'])).toEqual(['lesson-1', 'lesson-2'])
  })
})

describe('cross-lesson continue + progress invariants', () => {
  const progress = (completed: string[], currentProblemId?: string) => ({
    currentProblemIndex: 0,
    currentProblemId,
    completedProblemIds: completed,
  })

  it('continue points to the first incomplete problem across lesson boundaries', () => {
    // Finished lesson 1+2 and the first problem of lesson 3 -> continue is problem-4.
    expect(getContinueProblemId(progress(['problem-1', 'problem-2', 'problem-3']))).toBe('problem-4')
    expect(getCurrentLessonId('problem-4')).toBe('lesson-3')
  })

  it('reviewing an earlier completed problem does not move progress backward', () => {
    const completed = ['problem-1', 'problem-2', 'problem-3', 'problem-4', 'problem-5']
    // Even if the user is "currently" revisiting problem-1, continue stays at the farthest gap.
    expect(getContinueProblemId(progress(completed, 'problem-1'))).toBe('problem-6')
  })

  it('marks current lesson and capstone state in the pathway view', () => {
    const views = getLessonProgressViews(['problem-1', 'problem-2'], 'problem-3', false)
    expect(views.find((v) => v.lessonId === 'lesson-1')?.isComplete).toBe(true)
    expect(views.find((v) => v.lessonId === 'lesson-3')?.isCurrent).toBe(true)
    expect(views.find((v) => v.lessonId === 'lesson-5')?.isCurrent).toBe(false)
  })
})
