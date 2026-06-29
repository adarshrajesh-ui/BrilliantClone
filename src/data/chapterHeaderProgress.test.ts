import { describe, expect, it } from 'vitest'
import { CHAPTER_LESSONS, TOTAL_LESSONS, getLessonHeaderProgress } from './chapter'

describe('getLessonHeaderProgress', () => {
  it('fills based on progress within the current lesson only', () => {
    // problem-1 is the first of lesson 1, ev-l1-p2 the second.
    expect(getLessonHeaderProgress('problem-1')?.fillPercent).toBeCloseTo(100 / 3, 5)
    expect(getLessonHeaderProgress('ev-l1-p2')?.fillPercent).toBeCloseTo(200 / 3, 5)
    // problem-2 is the first problem of lesson 2 — fill resets per lesson.
    expect(getLessonHeaderProgress('problem-2')?.fillPercent).toBeCloseTo(100 / 3, 5)
    // The last problem of the final lesson fills the bar completely.
    expect(getLessonHeaderProgress('ev-l5-p3')?.fillPercent).toBeCloseTo(100, 3)
  })

  it('exposes the upcoming lessons as trailing dots', () => {
    CHAPTER_LESSONS.forEach((lesson, lessonIndex) => {
      const firstProblemId = lesson.problemIds[0]
      const progress = getLessonHeaderProgress(firstProblemId)

      expect(progress).toMatchObject({
        lessonNumber: lessonIndex + 1,
        problemNumberInLesson: 1,
        problemsInLesson: lesson.problemIds.length,
        upcomingLessons: TOTAL_LESSONS - (lessonIndex + 1),
        ariaValueText: `Lesson ${lessonIndex + 1}, problem 1 of ${lesson.problemIds.length}`,
      })
      expect(progress?.fillPercent).toBeCloseTo((1 / lesson.problemIds.length) * 100, 3)
    })
  })

  it('uses problem wording for mid-lesson positions', () => {
    expect(getLessonHeaderProgress('ev-l1-p2')?.ariaValueText).toBe('Lesson 1, problem 2 of 3')
  })

  it('returns undefined for unknown problem ids', () => {
    expect(getLessonHeaderProgress('unknown-problem')).toBeUndefined()
  })
})
