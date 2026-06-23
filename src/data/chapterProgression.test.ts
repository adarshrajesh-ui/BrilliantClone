import { describe, expect, it } from 'vitest'
import {
  getContinueProblemId,
  getFarthestCompletedOrder,
  getNextIncompleteProblem,
  getNextIncompleteProblemIndex,
} from './chapter'

function progress(completedProblemIds: string[]) {
  return { currentProblemIndex: 0, completedProblemIds }
}

describe('chapter progression (farthest completed)', () => {
  it('starts at problem-1 when nothing is complete', () => {
    expect(getFarthestCompletedOrder([])).toBe(0)
    expect(getContinueProblemId(progress([]))).toBe('problem-1')
    expect(getNextIncompleteProblemIndex([])).toBe(0)
  })

  it('continues to the first incomplete problem after sequential completion', () => {
    const completed = ['problem-1', 'problem-2', 'problem-3', 'problem-4']
    expect(getFarthestCompletedOrder(completed)).toBe(4)
    expect(getContinueProblemId(progress(completed))).toBe('problem-5')
    expect(getNextIncompleteProblem(completed)?.problemId).toBe('problem-5')
  })

  it('does not move progress backward when an older problem is reopened/restarted', () => {
    // User completed 1–4 then reopened problem-2 (currentProblemId would be problem-2).
    const completed = ['problem-1', 'problem-2', 'problem-3', 'problem-4']
    const reopened = {
      currentProblemIndex: 1,
      currentProblemId: 'problem-2',
      completedProblemIds: completed,
    }
    expect(getContinueProblemId(reopened)).toBe('problem-5')
  })

  it('routes after the farthest completion even with non-contiguous completion', () => {
    const completed = ['problem-1', 'problem-2', 'problem-4']
    expect(getFarthestCompletedOrder(completed)).toBe(4)
    expect(getContinueProblemId(progress(completed))).toBe('problem-5')
  })

  it('falls back to first incomplete when nothing remains after the farthest', () => {
    const completed = [
      'problem-1',
      'problem-2',
      'problem-4',
      'problem-5',
      'problem-6',
      'problem-7',
      'problem-8',
    ]
    // Only problem-3 is left and it is before the farthest (8); still surfaced.
    expect(getNextIncompleteProblem(completed)?.problemId).toBe('problem-3')
    expect(getContinueProblemId(progress(completed))).toBe('problem-3')
  })

  it('returns problem-1 for review when the whole chapter is complete', () => {
    const completed = [
      'problem-1',
      'problem-2',
      'problem-3',
      'problem-4',
      'problem-5',
      'problem-6',
      'problem-7',
      'problem-8',
    ]
    expect(getNextIncompleteProblem(completed)).toBeUndefined()
    expect(getContinueProblemId(progress(completed))).toBe('problem-1')
  })
})
