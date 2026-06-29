import { describe, expect, it } from 'vitest'
import {
  checkProblem1Dice,
  diceRollForThrow,
} from '../../data/problems/problem-1'
import { checkEvL1P2, evL1P2SpinOutcome } from '../../data/problems/ev-l1-p2'
import { checkEvL1P3 } from '../../data/problems/ev-l1-p3'
import { checkProblem2PrizeBoard } from '../../data/problems/problem-2'
import { checkEvL2P2 } from '../../data/problems/ev-l2-p2'
import { checkEvL2P3 } from '../../data/problems/ev-l2-p3'

const dice = (over: Partial<Parameters<typeof checkProblem1Dice>[0]> = {}) =>
  checkProblem1Dice({ totalThrows: 100, finalAnswer: '7', ...over })

describe('ev-l1-p1 — Two-Dice Roll Average', () => {
  it('accepts 7 in many formats', () => {
    for (const a of [
      '7',
      '7.0',
      '7.00',
      '7 sum',
      '7 per roll',
      '7 per throw',
      '14/2',
      '21 / 3 per roll',
      '  28 / 4 sum  ',
    ]) {
      expect(dice({ finalAnswer: a }).canComplete).toBe(true)
    }
    expect(dice({ finalAnswer: '700%' }).mistakeType).toBe('')
  })

  it('gates: 100 total rolls (guard, not graded)', () => {
    expect(dice({ totalThrows: 80 }).mistakeType).toBe('')
    expect(dice({ totalThrows: 80 }).canComplete).toBe(false)
  })

  it('classifies wrong answers', () => {
    expect(dice({ finalAnswer: '2' }).mistakeType).toBe('chose-extreme-outcome')
    expect(dice({ finalAnswer: '12' }).mistakeType).toBe('chose-extreme-outcome')
    expect(dice({ finalAnswer: '3.5' }).mistakeType).toBe('used-single-die-average')
    expect(dice({ finalAnswer: '6.5' }).mistakeType).toBe('assumed-sample-equals-ev')
  })

  it('deterministic dice model: same seed+index gives same roll; dice/sum ranges', () => {
    const seed = 123456
    for (let i = 0; i < 50; i += 1) {
      const r = diceRollForThrow(seed, i)
      const again = diceRollForThrow(seed, i)
      expect(r.d1).toBe(again.d1)
      expect(r.d2).toBe(again.d2)
      expect(r.sum).toBe(again.sum)
      expect(r.d1).toBeGreaterThanOrEqual(1)
      expect(r.d1).toBeLessThanOrEqual(6)
      expect(r.d2).toBeGreaterThanOrEqual(1)
      expect(r.d2).toBeLessThanOrEqual(6)
      expect(r.sum).toBe(r.d1 + r.d2)
      expect(r.sum).toBeGreaterThanOrEqual(2)
      expect(r.sum).toBeLessThanOrEqual(12)
    }
  })

  it('EV of the sum approaches 7 over many rolls', () => {
    const seed = 99
    let total = 0
    const n = 20000
    for (let i = 0; i < n; i += 1) total += diceRollForThrow(seed, i).sum
    expect(Math.abs(total / n - 7)).toBeLessThan(0.3)
  })
})

describe('ev-l1-p2 — Unequal Section Game', () => {
  const base = { predictionSubmitted: true, totalSpins: 100 }
  it('accepts $5 in equivalent numeric formats; guards before prediction and 100 spins', () => {
    for (const finalAnswer of [
      '$5.00',
      '5',
      '5.0',
      '10/2',
      '$10 / 2',
      '15 / 3 dollars',
      '  5 per spin  ',
    ]) {
      expect(checkEvL1P2({ ...base, finalAnswer }).canComplete).toBe(true)
    }
    expect(checkEvL1P2({ ...base, finalAnswer: '500%' }).mistakeType).toBe('')
    expect(checkEvL1P2({ predictionSubmitted: false, totalSpins: 100, finalAnswer: '5' }).mistakeType).toBe('')
    expect(checkEvL1P2({ ...base, totalSpins: 40, finalAnswer: '5' }).mistakeType).toBe('')
  })
  it('classifies wrong answers', () => {
    expect(checkEvL1P2({ ...base, finalAnswer: '20' }).mistakeType).toBe('used-largest-payout')
    expect(checkEvL1P2({ ...base, finalAnswer: '0.8' }).mistakeType).toBe('divided-payout-by-percent')
    expect(checkEvL1P2({ ...base, finalAnswer: '0' }).mistakeType).toBe('ignored-payout')
    expect(checkEvL1P2({ ...base, finalAnswer: '7' }).mistakeType).toBe('short-run-variation')
  })
  it('spin outcome is deterministic and ~25% $20', () => {
    let wins = 0
    const n = 20000
    for (let i = 0; i < n; i += 1) {
      const o = evL1P2SpinOutcome(7, i)
      expect(o === 20 || o === 0).toBe(true)
      if (o === 20) wins += 1
    }
    expect(Math.abs(wins / n - 0.25)).toBeLessThan(0.03)
  })
})

describe('ev-l1-p3 — Which Game Has the Best Long-Run Average?', () => {
  it('requires selecting both tied games and the correct reason', () => {
    expect(checkEvL1P3({ selectedGames: [], reason: null }).mistakeType).toBe('')
    expect(checkEvL1P3({ selectedGames: ['a', 'b'], reason: null }).mistakeType).toBe('')
    expect(checkEvL1P3({ selectedGames: ['a', 'b'], reason: 'same-average' }).canComplete).toBe(true)
  })

  it('accepts the A+B tie with the tied-at-$5 reason regardless of selection order', () => {
    const result = checkEvL1P3({ selectedGames: ['a', 'b'], reason: 'same-average' })
    expect(result.isCorrect).toBe(true)
    expect(result.canComplete).toBe(true)
    expect(result.mistakeType).toBeNull()

    // Selecting the same two games in the opposite order is still correct, so a
    // learner can always complete the problem once A and B are both chosen.
    expect(checkEvL1P3({ selectedGames: ['b', 'a'], reason: 'same-average' }).canComplete).toBe(true)
  })

  it('classifies targeted misconceptions', () => {
    expect(checkEvL1P3({ selectedGames: ['b'], reason: null }).mistakeType).toBe('chose-bigger-prize')
    expect(checkEvL1P3({ selectedGames: ['c'], reason: null }).mistakeType).toBe('chose-highest-win-rate')
    expect(checkEvL1P3({ selectedGames: ['a'], reason: null }).mistakeType).toBe('missed-tie')
    expect(checkEvL1P3({ selectedGames: ['a', 'b'], reason: 'payouts-only' }).mistakeType).toBe('ignored-probabilities')
    expect(checkEvL1P3({ selectedGames: ['a', 'b'], reason: 'guaranteed-result' }).mistakeType).toBe('expected-value-is-guaranteed')
  })
})

describe('ev-l2-p1 — Claw Machine Expected Value', () => {
  const slots = ['$20', '25%', '$0', '75%'] as [string, string, string, string]
  it('gates claw drops + compression before formula', () => {
    expect(checkProblem2PrizeBoard({ grabsComplete: false, slots, evAnswer: '5' }).mistakeType).toBe('')
  })
  it('accepts correct pairing + EV; rejects mistakes', () => {
    expect(checkProblem2PrizeBoard({ grabsComplete: true, slots, evAnswer: '$5.00' }).canComplete).toBe(true)
    expect(checkProblem2PrizeBoard({ grabsComplete: true, slots: ['$0', '75%', '$20', '25%'], evAnswer: '5' }).canComplete).toBe(true)
    expect(checkProblem2PrizeBoard({ grabsComplete: true, slots: ['25%', '$20', '75%', '$0'], evAnswer: '5' }).mistakeType).toBe('reversed-outcome-probability')
    expect(checkProblem2PrizeBoard({ grabsComplete: true, slots: ['$20', '25%', '$0', ''], evAnswer: '5' }).mistakeType).toBe('omitted-probability')
    expect(checkProblem2PrizeBoard({ grabsComplete: true, slots, evAnswer: '20' }).mistakeType).toBe('used-largest-payout')
  })
})

describe('ev-l2-p2 — Match Outcomes to Probabilities', () => {
  it('accepts correct matching', () => {
    expect(checkEvL2P2({ assignments: { '12': '1/3', '3': '1/2', '0': '1/6' } }).canComplete).toBe(true)
  })
  it('guards incomplete; rejects reuse and ranking', () => {
    expect(checkEvL2P2({ assignments: { '12': '1/3', '3': '', '0': '1/6' } }).mistakeType).toBe('')
    expect(checkEvL2P2({ assignments: { '12': '1/3', '3': '1/3', '0': '1/6' } }).mistakeType).toBe('reused-probability')
    expect(checkEvL2P2({ assignments: { '12': '1/2', '3': '1/3', '0': '1/6' } }).mistakeType).toBe('ranked-by-size')
    expect(checkEvL2P2({ assignments: { '12': '1/6', '3': '1/3', '0': '1/2' } }).mistakeType).toBe('wrong-pairing')
  })
})

describe('ev-l2-p3 — Diagnose Bad EV Setups', () => {
  it('C valid + correct defects completes', () => {
    expect(checkEvL2P3({ valid: 'C', defectA: 'no-probability', defectB: 'omits-zero' }).canComplete).toBe(true)
  })
  it('classifies wrong valid pick and defect picks', () => {
    expect(checkEvL2P3({ valid: null, defectA: null, defectB: null }).mistakeType).toBe('')
    expect(checkEvL2P3({ valid: 'A', defectA: null, defectB: null }).mistakeType).toBe('chose-raw-sum')
    expect(checkEvL2P3({ valid: 'B', defectA: null, defectB: null }).mistakeType).toBe('chose-incomplete')
    expect(checkEvL2P3({ valid: 'C', defectA: null, defectB: null }).mistakeType).toBe('')
    expect(checkEvL2P3({ valid: 'C', defectA: 'omits-zero', defectB: 'omits-zero' }).mistakeType).toBe('wrong-defect-a')
    expect(checkEvL2P3({ valid: 'C', defectA: 'no-probability', defectB: 'no-probability' }).mistakeType).toBe('wrong-defect-b')
  })
})
