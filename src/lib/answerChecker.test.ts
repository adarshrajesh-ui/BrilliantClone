import { describe, expect, it } from 'vitest'
import {
  checkProblem1Completion,
  checkProblem2,
  checkProblem3,
  checkProblem4,
  checkProblem5,
  checkProblem6,
  checkProblem7,
  checkProblem8,
  isGradedAttempt,
} from './answerChecker'

type Row = { outcome: number; count: string; probability: string }
const p3rows = (p1: string, p2: string, p3: string): Row[] => [
  { outcome: 12, count: '1', probability: p1 },
  { outcome: 6, count: '2', probability: p2 },
  { outcome: 0, count: '3', probability: p3 },
]

describe('Problem 1 — long-run average', () => {
  it('accepts $5 and rejects $0 / $10', () => {
    expect(checkProblem1Completion({ predictionSubmitted: true, totalSpins: 120, finalAnswer: 5 }).canComplete).toBe(true)
    expect(checkProblem1Completion({ predictionSubmitted: true, totalSpins: 120, finalAnswer: 0 }).mistakeType).toBe('chose-extreme-outcome')
    expect(checkProblem1Completion({ predictionSubmitted: true, totalSpins: 120, finalAnswer: 10 }).mistakeType).toBe('chose-extreme-outcome')
  })

  it('guards before 100 spins (no mistake type)', () => {
    expect(checkProblem1Completion({ predictionSubmitted: true, totalSpins: 50, finalAnswer: 5 }).mistakeType).toBe('')
  })
})

describe('Problem 2 — weighted average', () => {
  it('accepts valid pairing and EV = 5 (with formatting variants)', () => {
    expect(checkProblem2({ slots: ['$20', '25%', '$0', '75%'], evAnswer: '5' }).canComplete).toBe(true)
    expect(checkProblem2({ slots: ['$20', '25%', '$0', '75%'], evAnswer: '$5.00' }).canComplete).toBe(true)
    expect(checkProblem2({ slots: ['$0', '75%', '$20', '25%'], evAnswer: '5' }).canComplete).toBe(true)
  })

  it('rejects reversed outcome/probability and largest-payout EV', () => {
    expect(checkProblem2({ slots: ['25%', '$20', '75%', '$0'], evAnswer: '5' }).mistakeType).toBe('reversed-outcome-probability')
    expect(checkProblem2({ slots: ['$20', '25%', '$0', '75%'], evAnswer: '20' }).mistakeType).toBe('used-largest-payout')
  })
})

describe('Problem 3 — probability from counts', () => {
  it('accepts 1/6, 0.1667, 0.167; 2/6, 1/3, 0.3333; 3/6, 1/2, 0.5', () => {
    expect(checkProblem3({ allRevealed: true, rows: p3rows('1/6', '2/6', '3/6') }).canComplete).toBe(true)
    expect(checkProblem3({ allRevealed: true, rows: p3rows('0.1667', '1/3', '1/2') }).canComplete).toBe(true)
    expect(checkProblem3({ allRevealed: true, rows: p3rows('0.167', '0.3333', '0.5') }).canComplete).toBe(true)
  })

  it('rejects raw counts typed as probabilities', () => {
    expect(checkProblem3({ allRevealed: true, rows: p3rows('1/6', '2', '3/6') }).mistakeType).toBe('counts-as-probabilities')
  })

  it('guards before reveal', () => {
    expect(checkProblem3({ allRevealed: false, rows: p3rows('1/6', '2/6', '3/6') }).mistakeType).toBe('')
  })
})

describe('Problem 4 — calculate EV', () => {
  it('accepts contributions 2, 2, 0 and EV 4', () => {
    expect(checkProblem4({ contributions: ['2', '2', '0'], evAnswer: '4' }).canComplete).toBe(true)
    expect(checkProblem4({ contributions: ['$2.00', '2', '0'], evAnswer: '$4' }).canComplete).toBe(true)
  })

  it('rejects unweighted payout sum and zero-row confusion', () => {
    expect(checkProblem4({ contributions: ['12', '6', '0'], evAnswer: '18' }).mistakeType).toBe('unweighted-sum')
    expect(checkProblem4({ contributions: ['2', '2', '3'], evAnswer: '7' }).mistakeType).toBe('omitted-zero-row')
  })
})

describe('Problem 5 — payout vs profit', () => {
  it('accepts profit 1 (with variants)', () => {
    expect(checkProblem5({ formulaSelected: true, profitAnswer: '1' }).canComplete).toBe(true)
    expect(checkProblem5({ formulaSelected: true, profitAnswer: '$1.00' }).canComplete).toBe(true)
  })

  it('rejects payout 4 and adding the cost', () => {
    expect(checkProblem5({ formulaSelected: true, profitAnswer: '4' }).mistakeType).toBe('answered-payout')
    expect(checkProblem5({ formulaSelected: true, profitAnswer: '7' }).mistakeType).toBe('added-cost')
  })
})

describe('Problem 6 — fairness sort', () => {
  it('accepts A=fair, B=favorable, C=unfavorable with case variants', () => {
    expect(checkProblem6({ assignments: { A: 'fair', B: 'favorable', C: 'unfavorable' } }).canComplete).toBe(true)
    expect(checkProblem6({ assignments: { A: 'Fair', B: 'FAVORABLE', C: 'unfav' } }).canComplete).toBe(true)
  })

  it('rejects positive-payout = favorable reasoning', () => {
    expect(checkProblem6({ assignments: { A: 'fair', B: 'favorable', C: 'favorable' } }).mistakeType).toBe('positive-payout-favorable')
  })
})

describe('Problem 7 — whole EV model', () => {
  const good = {
    probabilities: ['1/10', '2/10', '7/10'] as [string, string, string],
    contributions: ['3', '2', '0'] as [string, string, string],
    expectedPayout: '5',
    expectedProfit: '0',
    decision: 'fair',
  }

  it('accepts the full model answer (and decimal probabilities)', () => {
    expect(checkProblem7(good).canComplete).toBe(true)
    expect(checkProblem7({ ...good, probabilities: ['0.1', '0.2', '0.7'] }).canComplete).toBe(true)
  })

  it('rejects section counts as probabilities and fair-marked-favorable', () => {
    expect(checkProblem7({ ...good, probabilities: ['1', '2', '7'] }).mistakeType).toBe('count-not-probability')
    expect(checkProblem7({ ...good, decision: 'favorable' }).mistakeType).toBe('fair-marked-favorable')
  })
})

describe('Problem 8 — same EV, different risk', () => {
  const base = {
    gameASimulated: true,
    gameBSimulated: true,
    evA: '5',
    evB: '5',
    higherRisk: 'Game B',
    reason: 'variable-outcomes',
  }

  it('accepts EV(A)=5, EV(B)=5, B higher risk, correct reason', () => {
    expect(checkProblem8(base).canComplete).toBe(true)
    expect(checkProblem8({ ...base, reason: 'same average but more spread' }).canComplete).toBe(true)
  })

  it('rejects "Game B has higher EV because it can pay $10"', () => {
    expect(checkProblem8({ ...base, evB: '10' }).mistakeType).toBe('b-higher-ev')
    expect(checkProblem8({ ...base, reason: 'higher-ev' }).mistakeType).toBe('identical-games')
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
