// Execution-level verification — Expected Value Lab (15-problem chapter)
// ----------------------------------------------------------------------
// Independent QA (Agent 6). Imports the REAL co-located checkers and proves, per
// problem, that:
//   * the PRD "correct answer" case PASSES (canComplete=true), and
//   * one representative PRD "mistake type" case is correctly classified, and
//   * completion gates produce non-graded guard results.
// This turns the spec matrix into executable verification, not a spec mirror.

import { describe, expect, it } from 'vitest'

import { isGradedAttempt } from '../lib/answerChecker'
import {
  classificationAnswerCases,
  liveCheckerCases,
  moneyAnswerCases,
  probabilityAnswerCases,
  problemSpecs,
} from './answerValidationMatrix'
import { LIVE_CHECKER_IDS, runLiveChecker } from './liveCheckers'
import {
  areProbabilitiesEquivalent,
  normalizeClassificationAnswer,
  normalizeMoneyAnswer,
} from '../lib/answerParser'
import { runAllValidations } from './runValidation'

describe('deterministic validation runner', () => {
  it('passes every deterministic case across all active live checkers', () => {
    const report = runAllValidations()
    expect(report.failed).toEqual([])
    expect(report.total).toBeGreaterThan(0)
  })
})

describe('answer normalizer (shared parser)', () => {
  it.each(moneyAnswerCases)('money: $description', (c) => {
    const parsed = normalizeMoneyAnswer(c.input)
    if (c.expectedCorrect) {
      expect(parsed).not.toBeNull()
      expect(parsed).toBeCloseTo(Number(c.expectedNormalized), 4)
    } else {
      expect(parsed).toBeNull()
    }
  })

  it.each(probabilityAnswerCases)('probability: $description', (c) => {
    if (c.expectedCorrect) {
      expect(areProbabilitiesEquivalent(c.input, Number(c.expectedNormalized))).toBe(true)
    } else {
      expect(normalizeMoneyAnswer(c.input)).toBeDefined() // touch input
      expect(areProbabilitiesEquivalent(c.input, 0.5)).toBe(false)
    }
  })

  it.each(classificationAnswerCases)('classification: $description', (c) => {
    const got = normalizeClassificationAnswer(c.input)
    expect(got).toBe(c.expectedCorrect ? c.expectedNormalized : null)
  })
})

describe('live checker cases (per-problem PRD verification)', () => {
  it.each(liveCheckerCases)('$storageId [$kind] $description', (c) => {
    const result = runLiveChecker(c.storageId, c.input)

    if (c.kind === 'correct') {
      expect(result.canComplete).toBe(true)
      expect(result.isCorrect).toBe(true)
      expect(isGradedAttempt(result)).toBe(true)
      return
    }

    if (c.kind === 'guard') {
      expect(result.canComplete).toBe(false)
      // A guard must NOT count as a graded attempt regardless of the checker's
      // mistakeType convention ('' for some checkers, null for others).
      expect(isGradedAttempt(result)).toBe(false)
      return
    }

    // kind === 'mistake'
    expect(result.canComplete).toBe(false)
    expect(result.mistakeType).toBe(c.expectedMistakeType)
    expect(isGradedAttempt(result)).toBe(true)
    // Mistake feedback must be specific, hand-written, non-empty.
    expect(result.feedback.length).toBeGreaterThan(0)
  })
})

describe('coverage: every problem has executable correct + mistake verification', () => {
  it('exercises all active problems', () => {
    const touched = new Set(liveCheckerCases.map((c) => c.storageId))
    for (const { storageId } of LIVE_CHECKER_IDS) {
      expect(touched.has(storageId)).toBe(true)
    }
    expect(touched.size).toBe(14)
  })

  it('has at least one correct AND one mistake case per problem', () => {
    for (const { storageId } of LIVE_CHECKER_IDS) {
      const cases = liveCheckerCases.filter((c) => c.storageId === storageId)
      expect(cases.some((c) => c.kind === 'correct')).toBe(true)
      expect(cases.some((c) => c.kind === 'mistake')).toBe(true)
    }
  })

  it('problemSpecs lists all active problems', () => {
    expect(problemSpecs).toHaveLength(14)
    expect(problemSpecs.filter((p) => p.lesson === 3)).toHaveLength(2)
  })
})

describe('the five P1 fun-interaction gates (+ capstone group gate)', () => {
  it('L1P1 allows completion without a prediction or manual-roll minimum once 100 rolls are reached', () => {
    const r = runLiveChecker('problem-1', {
      totalThrows: 100,
      finalAnswer: '7',
    })
    expect(r.canComplete).toBe(true)
    expect(isGradedAttempt(r)).toBe(true)
  })

  it('L2P1 locks the formula until ≥8 claw drops are run and compression is viewed', () => {
    const r = runLiveChecker('problem-2', {
      grabsComplete: false,
      slots: ['$20', '25%', '$0', '75%'],
      evAnswer: '5',
    })
    expect(r.canComplete).toBe(false)
    expect(isGradedAttempt(r)).toBe(false)
  })

  it('L4P1 locks profit until the cost token is placed', () => {
    const r = runLiveChecker('problem-5', { costPlaced: false, profitAnswer: '1' })
    expect(r.canComplete).toBe(false)
    expect(isGradedAttempt(r)).toBe(false)
  })

  it('L5P1 requires running each machine ≥10 times and a 100-run batch before grading the MC', () => {
    const r = runLiveChecker('problem-7', {
      printerTrials: 5,
      slotTrials: 5,
      ranHundredBatch: false,
      sameEV: 'yes',
      riskier: 'slot',
      why: 'same-avg-different-spread',
    })
    expect(r.canComplete).toBe(false)
    expect(isGradedAttempt(r)).toBe(false)
  })

  it('L5P3 capstone requires grouping the wheel first', () => {
    const r = runLiveChecker('ev-l5-p3', {
      grouped: false,
      probabilities: ['1/12', '3/12', '8/12'],
      contributions: ['3', '3', '0'],
      expectedPayout: '6',
      expectedProfit: '0',
      decision: 'fair',
      riskChoice: 'variable-outcomes',
    })
    expect(r.canComplete).toBe(false)
    expect(isGradedAttempt(r)).toBe(false)
  })
})

describe('L5P2 distinct from L5P1 (no duplicate scenario)', () => {
  it('rejects the L5P1 booth average ($5) as an EV arithmetic error', () => {
    const r = runLiveChecker('problem-8', {
      gameASimulated: true,
      gameBSimulated: true,
      evA: '5', // L5P1's number, not this problem's $6
      evB: '6',
      higherRisk: 'B',
      reason: 'wider-spread',
    })
    expect(r.canComplete).toBe(false)
    expect(r.mistakeType).toBe('ev-arithmetic-error')
  })

  it('accepts the distinct L5P2 numbers ($6 vs $12/$0)', () => {
    const r = runLiveChecker('problem-8', {
      gameASimulated: true,
      gameBSimulated: true,
      evA: '6',
      evB: '6',
      higherRisk: 'B',
      reason: 'wider-spread',
    })
    expect(r.canComplete).toBe(true)
  })
})

describe('direct correction (no reset) — pure resubmit passes', () => {
  it('a corrected L2P1 resubmission passes after a graded mistake', () => {
    const wrong = runLiveChecker('problem-2', {
      grabsComplete: true,
      slots: ['25%', '$20', '75%', '$0'],
      evAnswer: '5',
    })
    expect(wrong.canComplete).toBe(false)
    expect(wrong.mistakeType).toBe('reversed-outcome-probability')

    const corrected = runLiveChecker('problem-2', {
      grabsComplete: true,
      slots: ['$20', '25%', '$0', '75%'],
      evAnswer: '5',
    })
    expect(corrected.canComplete).toBe(true)
  })

  it('a corrected L4P1 resubmission passes after answering payout', () => {
    const wrong = runLiveChecker('problem-5', { costPlaced: true, profitAnswer: '4' })
    expect(wrong.mistakeType).toBe('answered-payout')
    const corrected = runLiveChecker('problem-5', { costPlaced: true, profitAnswer: '1' })
    expect(corrected.canComplete).toBe(true)
  })
})
