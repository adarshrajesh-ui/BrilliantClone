import { describe, expect, it } from 'vitest'
import {
  checkBuildWeightedAverage,
  checkCalculateEvFromTable,
  checkCompareSpinners,
  checkDiagnoseBadSetups,
  checkFillMissingFormula,
  checkLongRunAverage,
  checkMatchOutcomes,
  checkMysteryBoxOutcomes,
  checkShortRunVsLongRun,
  checkUnequalSpinner,
  isPackGradedAttempt,
} from '../checkers'

// ---------------------------------------------------------------------------
// Lesson 1
// ---------------------------------------------------------------------------

describe('l1-long-run-average', () => {
  it('completes on $5 and accepts money variants', () => {
    for (const v of ['5', '5.0', '5.00', '$5', '$5.00', '5 dollars', '5 per spin']) {
      const r = checkLongRunAverage({ predictionSubmitted: true, totalSpins: 100, finalAnswer: v })
      expect(r.canComplete, `variant ${v}`).toBe(true)
    }
  })

  it('distinguishes extreme ($0), largest ($10), and sample-equals-EV mistakes', () => {
    expect(checkLongRunAverage({ predictionSubmitted: true, totalSpins: 120, finalAnswer: '0' }).mistakeType).toBe('chose-extreme-outcome')
    expect(checkLongRunAverage({ predictionSubmitted: true, totalSpins: 120, finalAnswer: '10' }).mistakeType).toBe('selected-largest-payout')
    expect(checkLongRunAverage({ predictionSubmitted: true, totalSpins: 120, finalAnswer: '4.8' }).mistakeType).toBe('assumed-sample-equals-ev')
  })

  it('guards on missing prediction / <100 spins (not graded)', () => {
    const noPred = checkLongRunAverage({ predictionSubmitted: false, totalSpins: 0, finalAnswer: null })
    expect(noPred.mistakeType).toBe('')
    expect(isPackGradedAttempt(noPred)).toBe(false)
    const fewSpins = checkLongRunAverage({ predictionSubmitted: true, totalSpins: 50, finalAnswer: '5' })
    expect(fewSpins.mistakeType).toBe('')
    expect(isPackGradedAttempt(fewSpins)).toBe(false)
  })

  it('completion does not depend on the simulation count beyond the 100 minimum', () => {
    expect(checkLongRunAverage({ predictionSubmitted: true, totalSpins: 100000, finalAnswer: '5' }).canComplete).toBe(true)
  })
})

describe('l1-unequal-spinner', () => {
  it('completes on $5', () => {
    expect(checkUnequalSpinner({ predictionSubmitted: true, totalSpins: 100, finalAnswer: '$5' }).canComplete).toBe(true)
  })
  it('detects largest payout, misapplied, and ignored-probability mistakes', () => {
    expect(checkUnequalSpinner({ predictionSubmitted: true, totalSpins: 100, finalAnswer: '20' }).mistakeType).toBe('selected-largest-payout')
    expect(checkUnequalSpinner({ predictionSubmitted: true, totalSpins: 100, finalAnswer: '0.8' }).mistakeType).toBe('misapplied-probability')
    expect(checkUnequalSpinner({ predictionSubmitted: true, totalSpins: 100, finalAnswer: '15' }).mistakeType).toBe('ignored-probability')
  })
  it('guards before 100 spins', () => {
    expect(checkUnequalSpinner({ predictionSubmitted: true, totalSpins: 10, finalAnswer: '5' }).mistakeType).toBe('')
  })
})

describe('l1-short-run-vs-long-run', () => {
  const base = { shortRunSpins: 10, longRunSpins: 500, shortSampleMustEqualEV: 'No', strongerGraph: '500 spins' }
  it('completes with No + 500-spin graph and accepts variants', () => {
    expect(checkShortRunVsLongRun(base).canComplete).toBe(true)
    expect(checkShortRunVsLongRun({ ...base, shortSampleMustEqualEV: 'Not necessarily', strongerGraph: 'Larger sample' }).canComplete).toBe(true)
    expect(checkShortRunVsLongRun({ ...base, shortSampleMustEqualEV: 'False', strongerGraph: 'Long-run graph' }).canComplete).toBe(true)
  })
  it('detects small-sample and short-graph misconceptions', () => {
    expect(checkShortRunVsLongRun({ ...base, shortSampleMustEqualEV: 'Yes' }).mistakeType).toBe('small-sample-misconception')
    expect(checkShortRunVsLongRun({ ...base, strongerGraph: '10 spins' }).mistakeType).toBe('selected-short-run-graph')
  })
  it('guards until both simulations are run', () => {
    expect(checkShortRunVsLongRun({ ...base, shortRunSpins: 0 }).mistakeType).toBe('')
    expect(checkShortRunVsLongRun({ ...base, longRunSpins: 100 }).mistakeType).toBe('')
  })
})

describe('l1-compare-spinners', () => {
  it('completes with same + both-average-5', () => {
    expect(checkCompareSpinners({ choice: 'same', explanation: 'both-average-5' }).canComplete).toBe(true)
  })
  it('detects max-payout and win-frequency misconceptions on the choice', () => {
    expect(checkCompareSpinners({ choice: 'b', explanation: null }).mistakeType).toBe('maximum-payout-misconception')
    expect(checkCompareSpinners({ choice: 'a', explanation: null }).mistakeType).toBe('win-frequency-misconception')
  })
  it('requires the explanation after a correct choice', () => {
    const r = checkCompareSpinners({ choice: 'same', explanation: null })
    expect(r.canComplete).toBe(false)
    expect(r.mistakeType).toBe('')
  })
  it('rejects wrong explanations', () => {
    expect(checkCompareSpinners({ choice: 'same', explanation: 'b-bigger-prize' }).mistakeType).toBe('maximum-payout-misconception')
    expect(checkCompareSpinners({ choice: 'same', explanation: 'a-more-wins' }).mistakeType).toBe('win-frequency-misconception')
  })
})

// ---------------------------------------------------------------------------
// Lesson 2
// ---------------------------------------------------------------------------

describe('l2-build-weighted-average', () => {
  it('accepts both pair orders and EV variants', () => {
    expect(checkBuildWeightedAverage({ slots: ['$20', '25%', '$0', '75%'], evAnswer: '5' }).canComplete).toBe(true)
    expect(checkBuildWeightedAverage({ slots: ['$0', '75%', '$20', '25%'], evAnswer: '$5.00' }).canComplete).toBe(true)
  })
  it('detects reversed types, wrong pairing, omitted probability, largest payout', () => {
    expect(checkBuildWeightedAverage({ slots: ['25%', '$20', '75%', '$0'], evAnswer: '5' }).mistakeType).toBe('reversed-outcome-probability')
    expect(checkBuildWeightedAverage({ slots: ['$20', '75%', '$0', '25%'], evAnswer: '5' }).mistakeType).toBe('wrong-pairing')
    expect(checkBuildWeightedAverage({ slots: ['$20', '25%', '', ''], evAnswer: '5' }).mistakeType).toBe('omitted-probability')
    expect(checkBuildWeightedAverage({ slots: ['$20', '25%', '$0', '75%'], evAnswer: '20' }).mistakeType).toBe('used-largest-payout')
  })
})

describe('l2-match-outcomes-probabilities', () => {
  it('completes on correct pairing with fraction or decimal', () => {
    expect(checkMatchOutcomes({ assignments: { '12': '1/3', '3': '1/2', '0': '1/6' } }).canComplete).toBe(true)
    expect(checkMatchOutcomes({ assignments: { '12': '0.333', '3': '0.5', '0': '0.167' } }).canComplete).toBe(true)
  })
  it('detects ranked-by-size, reuse, omitted zero', () => {
    expect(checkMatchOutcomes({ assignments: { '12': '1/2', '3': '1/3', '0': '1/6' } }).mistakeType).toBe('ranked-by-size')
    expect(checkMatchOutcomes({ assignments: { '12': '1/3', '3': '1/3', '0': '1/6' } }).mistakeType).toBe('reused-probability-card')
    expect(checkMatchOutcomes({ assignments: { '12': '1/3', '3': '1/2', '0': null } }).mistakeType).toBe('omitted-zero-outcome')
  })
})

describe('l2-fill-missing-formula', () => {
  it('completes on 10 / 0.5 / 6.5 with money variants', () => {
    for (const ev of ['6.5', '6.50', '$6.50', '$6.5']) {
      expect(checkFillMissingFormula({ outcomeSlot: '10', probabilitySlot: '0.5', evAnswer: ev }).canComplete, ev).toBe(true)
    }
  })
  it('detects slot-type, unweighted-sum, arithmetic', () => {
    expect(checkFillMissingFormula({ outcomeSlot: '0.5', probabilitySlot: '10', evAnswer: '6.5' }).mistakeType).toBe('slot-type-error')
    expect(checkFillMissingFormula({ outcomeSlot: '10', probabilitySlot: '0.5', evAnswer: '15' }).mistakeType).toBe('unweighted-sum')
    expect(checkFillMissingFormula({ outcomeSlot: '10', probabilitySlot: '0.5', evAnswer: '7' }).mistakeType).toBe('arithmetic-error')
  })
})

describe('l2-diagnose-bad-ev-setups', () => {
  it('completes on C with correct diagnoses', () => {
    expect(checkDiagnoseBadSetups({ validChoice: 'C', defectA: 'no probability weighting', defectB: 'omits zero outcome' }).canComplete).toBe(true)
  })
  it('detects choosing A or B', () => {
    expect(checkDiagnoseBadSetups({ validChoice: 'A', defectA: null, defectB: null }).mistakeType).toBe('summed-raw-payouts')
    expect(checkDiagnoseBadSetups({ validChoice: 'B', defectA: null, defectB: null }).mistakeType).toBe('chose-incomplete-setup')
  })
  it('detects wrong diagnosis after picking C', () => {
    expect(checkDiagnoseBadSetups({ validChoice: 'C', defectA: 'omits zero outcome', defectB: 'omits zero outcome' }).mistakeType).toBe('wrong-diagnosis')
  })
})

// ---------------------------------------------------------------------------
// Lesson 3
// ---------------------------------------------------------------------------

type Row = { outcome: number; count: string; probability: string }
const mbRows = (p12: string, p6: string, p0: string, c12 = '1', c6 = '2', c0 = '3'): Row[] => [
  { outcome: 12, count: c12, probability: p12 },
  { outcome: 6, count: c6, probability: p6 },
  { outcome: 0, count: c0, probability: p0 },
]

describe('l3-mystery-box-outcomes', () => {
  it('accepts all PRD probability equivalents', () => {
    expect(checkMysteryBoxOutcomes({ allRevealed: true, rows: mbRows('1/6', '2/6', '3/6') }).canComplete).toBe(true)
    expect(checkMysteryBoxOutcomes({ allRevealed: true, rows: mbRows('0.1667', '1/3', '1/2') }).canComplete).toBe(true)
    expect(checkMysteryBoxOutcomes({ allRevealed: true, rows: mbRows('0.167', '0.3333', '0.5') }).canComplete).toBe(true)
    expect(checkMysteryBoxOutcomes({ allRevealed: true, rows: mbRows('1/6', '0.333', '50%') }).canComplete).toBe(true)
    expect(checkMysteryBoxOutcomes({ allRevealed: true, rows: mbRows('1/6', '2/6', '.5') }).canComplete).toBe(true)
  })
  it('detects count-as-probability, wrong-denominator, omitted-zero, total-as-count', () => {
    expect(checkMysteryBoxOutcomes({ allRevealed: true, rows: mbRows('1/6', '2', '3/6') }).mistakeType).toBe('counts-as-probabilities')
    expect(checkMysteryBoxOutcomes({ allRevealed: true, rows: mbRows('1/8', '1/3', '1/2') }).mistakeType).toBe('wrong-denominator')
    expect(checkMysteryBoxOutcomes({ allRevealed: true, rows: mbRows('1/6', '1/3', '') }).mistakeType).toBe('omitted-zero')
    expect(checkMysteryBoxOutcomes({ allRevealed: true, rows: mbRows('1/6', '2/6', '3/6', '6') }).mistakeType).toBe('entered-total-as-count')
  })
  it('guards before reveal', () => {
    expect(checkMysteryBoxOutcomes({ allRevealed: false, rows: mbRows('1/6', '2/6', '3/6') }).mistakeType).toBe('')
  })
})

describe('l3-calculate-ev-from-table', () => {
  it('accepts contributions 2,2,0 with money variants and EV 4', () => {
    expect(checkCalculateEvFromTable({ contributions: ['2', '2', '0'], evAnswer: '4' }).canComplete).toBe(true)
    expect(checkCalculateEvFromTable({ contributions: ['$2.00', '2', '$0'], evAnswer: '$4.00' }).canComplete).toBe(true)
  })
  it('detects unweighted-sum, omitted-zero-row, added-probabilities, arithmetic', () => {
    expect(checkCalculateEvFromTable({ contributions: ['12', '6', '0'], evAnswer: '18' }).mistakeType).toBe('unweighted-sum')
    expect(checkCalculateEvFromTable({ contributions: ['2', '2', '3'], evAnswer: '7' }).mistakeType).toBe('omitted-zero-row')
    expect(checkCalculateEvFromTable({ contributions: ['1/6', '2/6', '3/6'], evAnswer: '1' }).mistakeType).toBe('added-probabilities')
    expect(checkCalculateEvFromTable({ contributions: ['3', '2', '0'], evAnswer: '5' }).mistakeType).toBe('arithmetic-error')
  })
  it('direct correction: a wrong EV then corrected EV passes without touching contributions', () => {
    expect(checkCalculateEvFromTable({ contributions: ['2', '2', '0'], evAnswer: '5' }).mistakeType).toBe('arithmetic-error')
    expect(checkCalculateEvFromTable({ contributions: ['2', '2', '0'], evAnswer: '4' }).canComplete).toBe(true)
  })
})

describe('isPackGradedAttempt', () => {
  it('counts correct and wrong-with-type, not guards', () => {
    expect(isPackGradedAttempt({ isCorrect: true, mistakeType: null, feedback: '', canComplete: true })).toBe(true)
    expect(isPackGradedAttempt({ isCorrect: false, mistakeType: 'wrong-pairing', feedback: '', canComplete: false })).toBe(true)
    expect(isPackGradedAttempt({ isCorrect: false, mistakeType: '', feedback: 'fill', canComplete: false })).toBe(false)
  })
})
