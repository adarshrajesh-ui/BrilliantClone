import { describe, expect, it } from 'vitest'
import {
  checkCapstone,
  checkChooseBetterGame,
  checkFairnessSort,
  checkFindFairPrice,
  checkLowVsHighRisk,
  checkPayoutVsProfit,
  checkPrizeBagEvTable,
  checkRepairProbabilityTable,
  checkSameEvDifferentRisk,
  checkWholeEvModel,
  evaluateExplanation,
  isGradedAttempt,
} from './checkers'
import type {
  CapstoneInput,
  PrizeBagInput,
  RepairTableInput,
  WholeEvModelInput,
} from './types'

const repair = (p16: string, p4: string, p0: string): RepairTableInput => ({
  rows: [
    { outcome: 16, count: '1', probability: p16 },
    { outcome: 4, count: '3', probability: p4 },
    { outcome: 0, count: '4', probability: p0 },
  ],
})

const prizeBag = (c15: string, p15: string, k15: string, c5: string, p5: string, k5: string, c0: string, p0: string, k0: string, ev: string): PrizeBagInput => ({
  rows: [
    { outcome: 15, count: c15, probability: p15, contribution: k15 },
    { outcome: 5, count: c5, probability: p5, contribution: k5 },
    { outcome: 0, count: c0, probability: p0, contribution: k0 },
  ],
  evAnswer: ev,
})

describe('11 — repair probability table', () => {
  it('accepts /8 fractions, decimals, and 1/2 for the $0 row', () => {
    expect(checkRepairProbabilityTable(repair('1/8', '3/8', '4/8')).canComplete).toBe(true)
    expect(checkRepairProbabilityTable(repair('0.125', '0.375', '0.5')).canComplete).toBe(true)
    expect(checkRepairProbabilityTable(repair('1/8', '3/8', '1/2')).canComplete).toBe(true)
    expect(checkRepairProbabilityTable(repair('1/8', '3/8', '.5')).canComplete).toBe(true)
  })

  it('flags wrong denominator and count-as-probability deterministically', () => {
    expect(checkRepairProbabilityTable(repair('1/8', '3/10', '4/8')).mistakeType).toBe('wrong-denominator')
    expect(checkRepairProbabilityTable(repair('1/8', '3', '4/8')).mistakeType).toBe('count-as-probability')
  })

  it('requires the zero outcome and a blank cell is a non-graded guard', () => {
    expect(checkRepairProbabilityTable(repair('1/8', '3/8', '0')).mistakeType).toBe('ignored-zero-outcome')
    const guard = checkRepairProbabilityTable(repair('1/8', '3/8', ''))
    expect(guard.mistakeType).toBe('')
    expect(isGradedAttempt(guard)).toBe(false)
  })

  it('rejects probabilities that do not sum to 1', () => {
    // 1/8 + 1/8 + 4/8 = 6/8, each cell individually a valid fraction but sum < 1.
    const res = checkRepairProbabilityTable(repair('1/8', '1/8', '4/8'))
    expect(res.canComplete).toBe(false)
    // First failing cell ($4 = 1/8 ≠ 3/8) is reported as a denominator/structure issue.
    expect(res.isCorrect).toBe(false)
  })
})

describe('12 — prize bag EV table', () => {
  it('accepts decimals, fractions, and money formats with EV 4.5', () => {
    expect(checkPrizeBagEvTable(prizeBag('2', '0.2', '3', '3', '0.3', '1.5', '5', '0.5', '0', '4.5')).canComplete).toBe(true)
    expect(checkPrizeBagEvTable(prizeBag('2', '2/10', '$3', '3', '3/10', '$1.50', '5', '5/10', '$0', '$4.50')).canComplete).toBe(true)
    expect(checkPrizeBagEvTable(prizeBag('2', '1/5', '3', '3', '0.3', '1.5', '5', '1/2', '0', '4.5')).canComplete).toBe(true)
  })

  it('detects omitted-zero and unweighted-sum', () => {
    expect(checkPrizeBagEvTable(prizeBag('2', '0.2', '3', '3', '0.3', '1.5', '5', '0.5', '2', '4.5')).mistakeType).toBe('omitted-zero-outcome')
    expect(checkPrizeBagEvTable(prizeBag('2', '0.2', '15', '3', '0.3', '5', '5', '0.5', '0', '20')).mistakeType).toBe('unweighted-sum')
  })

  it('treats incomplete tables as a guard', () => {
    const res = checkPrizeBagEvTable(prizeBag('2', '0.2', '3', '3', '0.3', '1.5', '5', '0.5', '', '4.5'))
    expect(res.mistakeType).toBe('')
    expect(isGradedAttempt(res)).toBe(false)
  })
})

describe('13 — payout vs profit (problem-5)', () => {
  it('accepts $1 and rejects payout/added/reversed', () => {
    expect(checkPayoutVsProfit({ formulaSelected: true, profitAnswer: '1' }).canComplete).toBe(true)
    expect(checkPayoutVsProfit({ formulaSelected: true, profitAnswer: '4' }).mistakeType).toBe('answered-payout')
    expect(checkPayoutVsProfit({ formulaSelected: true, profitAnswer: '7' }).mistakeType).toBe('added-cost')
    expect(checkPayoutVsProfit({ formulaSelected: true, profitAnswer: '-1' }).mistakeType).toBe('reversed-subtraction')
  })

  it('guards before the cost block is placed', () => {
    expect(checkPayoutVsProfit({ formulaSelected: false, profitAnswer: '1' }).mistakeType).toBe('')
  })
})

describe('14 — fairness sort (problem-6)', () => {
  it('accepts correct buckets + synonyms, rejects misconceptions', () => {
    expect(checkFairnessSort({ assignments: { A: 'fair', B: 'favorable', C: 'unfavorable' } }).canComplete).toBe(true)
    expect(checkFairnessSort({ assignments: { A: 'Fair', B: 'FAV', C: 'unfav' } }).canComplete).toBe(true)
    expect(checkFairnessSort({ assignments: { A: 'fair', B: 'favorable', C: 'favorable' } }).mistakeType).toBe('positive-payout-favorable')
    expect(checkFairnessSort({ assignments: { A: 'favorable', B: 'favorable', C: 'unfavorable' } }).mistakeType).toBe('confused-fair-favorable')
    expect(checkFairnessSort({ assignments: { A: 'fair', B: 'unfavorable', C: 'unfavorable' } }).mistakeType).toBe('reversed-classification')
  })
})

describe('15 — find the fair price', () => {
  it('accepts payout/cost/profit/class = 4/4/0/fair', () => {
    expect(checkFindFairPrice({ expectedPayout: '4', fairCost: '4', expectedProfit: '0', classification: 'fair' }).canComplete).toBe(true)
  })
  it('flags largest payout and cost-below / cost-above mistakes', () => {
    expect(checkFindFairPrice({ expectedPayout: '8', fairCost: '4', expectedProfit: '0', classification: 'fair' }).mistakeType).toBe('used-largest-payout')
    expect(checkFindFairPrice({ expectedPayout: '4', fairCost: '2', expectedProfit: '2', classification: 'fair' }).mistakeType).toBe('cost-below-payout')
    expect(checkFindFairPrice({ expectedPayout: '4', fairCost: '6', expectedProfit: '-2', classification: 'fair' }).mistakeType).toBe('cost-above-payout')
  })
})

describe('16 — choose better game after cost', () => {
  it('accepts profits 2/3 and choice B', () => {
    expect(checkChooseBetterGame({ profitA: '2', profitB: '3', betterGame: 'B' }).canComplete).toBe(true)
  })
  it('detects largest-payout misconception and cost errors', () => {
    expect(checkChooseBetterGame({ profitA: '2', profitB: '3', betterGame: 'A' }).mistakeType).toBe('largest-payout-misconception')
    expect(checkChooseBetterGame({ profitA: '9', profitB: '3', betterGame: 'B' }).mistakeType).toBe('forgot-subtract-cost')
    expect(checkChooseBetterGame({ profitA: '16', profitB: '3', betterGame: 'B' }).mistakeType).toBe('added-cost')
  })
})

describe('17 — build whole EV model (problem-7)', () => {
  const model = (probs: [string, string, string], profit: string, decision: string): WholeEvModelInput => ({
    probabilities: probs,
    contributions: ['3', '2', '0'],
    expectedPayout: '5',
    expectedProfit: profit,
    decision,
  })
  it('accepts the full model and rejects count/profit/decision mistakes', () => {
    expect(checkWholeEvModel(model(['1/10', '2/10', '7/10'], '0', 'fair')).canComplete).toBe(true)
    expect(checkWholeEvModel(model(['1', '2', '7'], '0', 'fair')).mistakeType).toBe('count-not-probability')
    expect(checkWholeEvModel(model(['1/10', '2/10', '7/10'], '5', 'fair')).mistakeType).toBe('payout-not-profit')
    expect(checkWholeEvModel(model(['1/10', '2/10', '7/10'], '0', 'favorable')).mistakeType).toBe('fair-marked-favorable')
  })
})

describe('18 — same EV, different risk (problem-8)', () => {
  const base = { gameASimulated: true, gameBSimulated: true }
  it('accepts EV 5/5 + B + variable reason', () => {
    expect(checkSameEvDifferentRisk({ ...base, evA: '5', evB: '5', higherRisk: 'Game B', reason: 'variable-outcomes' }).canComplete).toBe(true)
    expect(checkSameEvDifferentRisk({ ...base, evA: '5', evB: '5', higherRisk: 'B', reason: 'more spread, can be 0 or 10' }).canComplete).toBe(true)
  })
  it('rejects higher-EV, identical, and contradictory reasons', () => {
    expect(checkSameEvDifferentRisk({ ...base, evA: '5', evB: '10', higherRisk: 'B', reason: 'variable-outcomes' }).mistakeType).toBe('b-higher-ev')
    expect(checkSameEvDifferentRisk({ ...base, evA: '5', evB: '5', higherRisk: 'A', reason: 'identical' }).mistakeType).toBe('identical-games')
    expect(checkSameEvDifferentRisk({ ...base, evA: '5', evB: '5', higherRisk: 'B', reason: 'they are the same game' }).mistakeType).toBe('identical-games')
  })
  it('guards until both simulations run', () => {
    expect(checkSameEvDifferentRisk({ gameASimulated: true, gameBSimulated: false, evA: '5', evB: '5', higherRisk: 'B', reason: 'variable-outcomes' }).mistakeType).toBe('')
  })
})

describe('19 — low vs high risk', () => {
  const base = { gameASimulated: true, gameBSimulated: true }
  it('accepts EV 6/6 + B + wider spread', () => {
    expect(checkLowVsHighRisk({ ...base, evA: '6', evB: '6', higherRisk: 'B', reason: 'wider-spread' }).canComplete).toBe(true)
    expect(checkLowVsHighRisk({ ...base, evA: '6', evB: '6', higherRisk: 'Game B', reason: 'wider range, can be 0 or 12' }).canComplete).toBe(true)
  })
  it('rejects higher-EV and average-vs-guaranteed', () => {
    expect(checkLowVsHighRisk({ ...base, evA: '6', evB: '12', higherRisk: 'B', reason: 'wider-spread' }).mistakeType).toBe('b-higher-ev')
    expect(checkLowVsHighRisk({ ...base, evA: '12', evB: '6', higherRisk: 'B', reason: 'wider-spread' }).mistakeType).toBe('average-vs-guaranteed')
  })
})

describe('20 — final capstone', () => {
  const base = (risk: string, probs: [string, string, string] = ['1/12', '3/12', '8/12'], profit = '0', decision = 'fair'): CapstoneInput => ({
    probabilities: probs,
    contributions: ['3', '3', '0'],
    expectedPayout: '6',
    expectedProfit: profit,
    decision,
    riskExplanation: risk,
  })
  it('accepts PRD rounded decimals and reduced fractions', () => {
    expect(checkCapstone(base('variable-outcomes')).canComplete).toBe(true)
    expect(checkCapstone(base('fair-but-variable', ['1/12', '1/4', '2/3'])).canComplete).toBe(true)
    expect(checkCapstone(base('can be 0, 12, or 36', ['0.083', '0.25', '0.667'])).canComplete).toBe(true)
    expect(checkCapstone(base('not guaranteed', ['0.0833', '0.25', '0.6667'])).canComplete).toBe(true)
  })
  it('rejects fair-means-no-risk and average-not-guaranteed', () => {
    expect(checkCapstone(base('no risk because it is fair')).mistakeType).toBe('fair-means-no-risk')
    expect(checkCapstone(base('you are guaranteed to get $6 back')).mistakeType).toBe('fair-means-no-risk')
    expect(checkCapstone(base('')).mistakeType).toBe('average-not-guaranteed')
  })
  it('rejects fair marked favorable and payout-not-profit', () => {
    expect(checkCapstone(base('variable-outcomes', ['1/12', '3/12', '8/12'], '0', 'favorable')).mistakeType).toBe('fair-marked-favorable')
    expect(checkCapstone(base('variable-outcomes', ['1/12', '3/12', '8/12'], '6')).mistakeType).toBe('payout-not-profit')
  })
})

describe('evaluateExplanation — deterministic, no AI', () => {
  const rule = { approvedIds: ['variable-outcomes'], rejectedIds: ['identical'], approvedKeywords: ['spread', 'vary'], contradictoryKeywords: ['no risk', 'identical'] }
  it('accepts approved ids/keywords, rejects contradictions, flags insufficient', () => {
    expect(evaluateExplanation('variable-outcomes', rule).kind).toBe('correct')
    expect(evaluateExplanation('it has more spread', rule).kind).toBe('correct')
    expect(evaluateExplanation('identical', rule).kind).toBe('contradictory')
    expect(evaluateExplanation('there is no risk but more spread', rule).kind).toBe('contradictory')
    expect(evaluateExplanation('blah', rule).kind).toBe('insufficient')
  })
})
