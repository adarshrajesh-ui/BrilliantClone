import { describe, expect, it } from 'vitest'
import { checkProblem6, isGradedAttempt } from './answerChecker'

describe('Problem 6 — fairness sort', () => {
  it('accepts A=fair, B=favorable, C=unfavorable with case variants', () => {
    expect(checkProblem6({ assignments: { A: 'fair', B: 'favorable', C: 'unfavorable' } }).canComplete).toBe(true)
    expect(checkProblem6({ assignments: { A: 'Fair', B: 'FAVORABLE', C: 'unfav' } }).canComplete).toBe(true)
  })

  it('rejects positive-payout = favorable reasoning', () => {
    expect(checkProblem6({ assignments: { A: 'fair', B: 'favorable', C: 'favorable' } }).mistakeType).toBe('positive-payout-favorable')
  })
})

describe('isGradedAttempt — attempt counting policy', () => {
  it('counts wrong graded submits and correct answers', () => {
    expect(isGradedAttempt({ isCorrect: false, mistakeType: 'chose-extreme-outcome', feedback: '', canComplete: false })).toBe(true)
    expect(isGradedAttempt({ isCorrect: true, mistakeType: null, feedback: '', canComplete: true })).toBe(true)
  })

  it('does not count incomplete guard submits', () => {
    expect(isGradedAttempt({ isCorrect: false, mistakeType: '', feedback: 'Fill all fields.', canComplete: false })).toBe(false)
    expect(isGradedAttempt({ isCorrect: false, mistakeType: null, feedback: 'Run 100 spins.', canComplete: false })).toBe(false)
  })
})
