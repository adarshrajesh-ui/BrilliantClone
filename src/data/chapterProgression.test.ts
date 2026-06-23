import { describe, expect, it } from 'vitest'
import {
  CHAPTER_PROBLEMS,
  getContinueProblemId,
  getFarthestCompletedOrder,
  getNextIncompleteProblem,
  getNextIncompleteProblemIndex,
} from './chapter'

const ALL_STORAGE_IDS = CHAPTER_PROBLEMS.map((p) => p.problemId)
const LESSON_1 = ['problem-1', 'l1-unequal-spinner', 'l1-short-run-vs-long-run', 'l1-compare-spinners']

function progress(completedProblemIds: string[]) {
  return { currentProblemIndex: 0, completedProblemIds }
}

describe('chapter progression (legacy facade, 20-problem)', () => {
  it('starts at problem-1 when nothing is complete', () => {
    expect(getFarthestCompletedOrder([])).toBe(0)
    expect(getContinueProblemId(progress([]))).toBe('problem-1')
    expect(getNextIncompleteProblemIndex([])).toBe(0)
  })

  it('continues to the first incomplete problem after sequential completion', () => {
    expect(getFarthestCompletedOrder(LESSON_1)).toBe(4)
    expect(getContinueProblemId(progress(LESSON_1))).toBe('problem-2')
    expect(getNextIncompleteProblem(LESSON_1)?.problemId).toBe('problem-2')
  })

  it('does not move progress backward when an older problem is reopened/restarted', () => {
    const reopened = {
      currentProblemIndex: 1,
      currentProblemId: 'problem-1',
      completedProblemIds: LESSON_1,
    }
    expect(getContinueProblemId(reopened)).toBe('problem-2')
  })

  it('routes after the farthest completion even with non-contiguous completion', () => {
    // problem-1 (idx0) and problem-2 (idx4) done, gap at 1..3 -> route after farthest (idx4).
    const completed = ['problem-1', 'problem-2']
    expect(getFarthestCompletedOrder(completed)).toBe(5)
    expect(getContinueProblemId(progress(completed))).toBe('l2-match-outcomes-probabilities')
  })

  it('falls back to first incomplete when nothing remains after the farthest', () => {
    // Everything except problem-1 is complete; only the very first is left.
    const completed = ALL_STORAGE_IDS.filter((id) => id !== 'problem-1')
    expect(getNextIncompleteProblem(completed)?.problemId).toBe('problem-1')
    expect(getContinueProblemId(progress(completed))).toBe('problem-1')
  })

  it('returns problem-1 for review when the whole chapter is complete', () => {
    expect(getNextIncompleteProblem(ALL_STORAGE_IDS)).toBeUndefined()
    expect(getContinueProblemId(progress(ALL_STORAGE_IDS))).toBe('problem-1')
    expect(getNextIncompleteProblemIndex(ALL_STORAGE_IDS)).toBe(19)
  })
})
