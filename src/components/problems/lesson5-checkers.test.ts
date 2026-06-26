import { describe, expect, it } from 'vitest'
import {
  checkSameAverageDifferentRide,
  type SameAverageRideCheckInput,
} from '../../data/problems/problem-7'
import { checkWiderSpread, type WiderSpreadCheckInput } from '../../data/problems/problem-8'
import { checkFinalDecision, type FinalDecisionCheckInput } from '../../data/problems/ev-l5-p3'

// ---------------------------------------------------------------------------
// ev-l5-p1 — Same Average, Different Ride (qualitative)
// Money Printer always $10; Jackpot Slot 60% $0 / 40% $25 → both average $10.
// ---------------------------------------------------------------------------

const rideBase: SameAverageRideCheckInput = {
  printerTrials: 10,
  slotTrials: 10,
  ranHundredBatch: true,
  sameEV: 'yes',
  riskier: 'slot',
  why: 'same-avg-different-spread',
}

describe('ev-l5-p1 checkSameAverageDifferentRide', () => {
  it('gates until each machine has run at least 10 times', () => {
    const r = checkSameAverageDifferentRide({ ...rideBase, printerTrials: 4 })
    expect(r.canComplete).toBe(false)
    expect(r.mistakeType).toBeNull()
    expect(r.feedback).toMatch(/at least 10 times/i)

    const s = checkSameAverageDifferentRide({ ...rideBase, slotTrials: 9 })
    expect(s.canComplete).toBe(false)
    expect(s.mistakeType).toBeNull()
  })

  it('gates until the guided simulation or a 100-run batch has run', () => {
    const r = checkSameAverageDifferentRide({ ...rideBase, ranHundredBatch: false })
    expect(r.canComplete).toBe(false)
    expect(r.mistakeType).toBeNull()
    expect(r.feedback).toMatch(/Start the 20-run simulation/i)
  })

  it('accepts the guided 20-run simulation as the exploration batch', () => {
    const r = checkSameAverageDifferentRide({
      ...rideBase,
      printerTrials: 20,
      slotTrials: 20,
      ranHundredBatch: false,
      ranStartSimulation: true,
    })
    expect(r.canComplete).toBe(true)
    expect(r.isCorrect).toBe(true)
  })

  it('gates on answering each of the three questions', () => {
    expect(checkSameAverageDifferentRide({ ...rideBase, sameEV: '' }).mistakeType).toBeNull()
    expect(checkSameAverageDifferentRide({ ...rideBase, sameEV: '' }).canComplete).toBe(false)
    expect(checkSameAverageDifferentRide({ ...rideBase, riskier: '' }).mistakeType).toBeNull()
    expect(checkSameAverageDifferentRide({ ...rideBase, riskier: '' }).canComplete).toBe(false)
    expect(checkSameAverageDifferentRide({ ...rideBase, why: '' }).mistakeType).toBeNull()
    expect(checkSameAverageDifferentRide({ ...rideBase, why: '' }).canComplete).toBe(false)
  })

  it('accepts the correct triple (same EV Yes, Slot riskier, same-avg-different-spread)', () => {
    const r = checkSameAverageDifferentRide(rideBase)
    expect(r.canComplete).toBe(true)
    expect(r.isCorrect).toBe(true)
    expect(r.mistakeType).toBeNull()
  })

  it('flags claimed-different-ev', () => {
    const r = checkSameAverageDifferentRide({ ...rideBase, sameEV: 'no' })
    expect(r.mistakeType).toBe('claimed-different-ev')
    expect(r.canComplete).toBe(false)
  })

  it('flags selected-printer-as-riskier', () => {
    const r = checkSameAverageDifferentRide({ ...rideBase, riskier: 'printer' })
    expect(r.mistakeType).toBe('selected-printer-as-riskier')
    expect(r.canComplete).toBe(false)
  })

  it('flags claimed-no-risk-difference', () => {
    const r = checkSameAverageDifferentRide({ ...rideBase, riskier: 'neither' })
    expect(r.mistakeType).toBe('claimed-no-risk-difference')
    expect(r.canComplete).toBe(false)
  })

  it('flags claimed-slot-higher-ev', () => {
    const r = checkSameAverageDifferentRide({ ...rideBase, why: 'slot-higher-average' })
    expect(r.mistakeType).toBe('claimed-slot-higher-ev')
    expect(r.canComplete).toBe(false)
  })

  it('flags misjudged-printer-payout', () => {
    const r = checkSameAverageDifferentRide({ ...rideBase, why: 'printer-pays-less' })
    expect(r.mistakeType).toBe('misjudged-printer-payout')
    expect(r.canComplete).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// ev-l5-p2 — Wider Spread, Same Average ($6 vs $12/$0)
// ---------------------------------------------------------------------------

const spreadBase: WiderSpreadCheckInput = {
  gameASimulated: true,
  gameBSimulated: true,
  evA: '6',
  evB: '6',
  higherRisk: 'B',
  reason: 'wider-spread',
}

describe('ev-l5-p2 checkWiderSpread', () => {
  it('gates on running both simulations', () => {
    const r = checkWiderSpread({ ...spreadBase, gameASimulated: false })
    expect(r.canComplete).toBe(false)
    expect(r.mistakeType).toBeNull()
  })

  it('accepts EV(A)=6 and EV(B)=6, riskier B, correct reason', () => {
    expect(checkWiderSpread(spreadBase).canComplete).toBe(true)
  })

  it('accepts flexible money formats for the EVs', () => {
    expect(checkWiderSpread({ ...spreadBase, evA: '$6.00', evB: '6.0' }).canComplete).toBe(true)
    expect(checkWiderSpread({ ...spreadBase, evA: '12/2', evB: ' 18 / 3 ' }).canComplete).toBe(true)
  })

  it('does not accept percent notation for EV dollar amounts', () => {
    expect(checkWiderSpread({ ...spreadBase, evA: '600%' }).canComplete).toBe(false)
  })

  it('accepts the alternate correct reasons', () => {
    expect(checkWiderSpread({ ...spreadBase, reason: 'variable-outcomes' }).canComplete).toBe(true)
    expect(checkWiderSpread({ ...spreadBase, reason: 'can-be-0-or-12' }).canComplete).toBe(true)
  })

  it('COHESION: rejects the L5P1 booth payout $5 for Game A', () => {
    const r = checkWiderSpread({ ...spreadBase, evA: '5' })
    expect(r.canComplete).toBe(false)
    expect(r.mistakeType).toBe('ev-arithmetic-error')
    expect(r.feedback).toMatch(/previous booth game/i)
  })

  it('COHESION: rejects the L5P1 booth payouts $5 / $10 for Game B', () => {
    expect(checkWiderSpread({ ...spreadBase, evB: '5' }).mistakeType).toBe('ev-arithmetic-error')
    expect(checkWiderSpread({ ...spreadBase, evB: '10' }).mistakeType).toBe('ev-arithmetic-error')
  })

  it('flags claimed-game-b-has-higher-ev when EV(B) = 12', () => {
    expect(checkWiderSpread({ ...spreadBase, evB: '12' }).mistakeType).toBe('claimed-game-b-has-higher-ev')
  })

  it('flags ev-arithmetic-error for a wrong Game A EV', () => {
    expect(checkWiderSpread({ ...spreadBase, evA: '7' }).mistakeType).toBe('ev-arithmetic-error')
  })

  it('flags selected-game-a-as-riskier', () => {
    expect(checkWiderSpread({ ...spreadBase, higherRisk: 'A' }).mistakeType).toBe('selected-game-a-as-riskier')
  })

  it('flags claimed-games-identical from the explanation', () => {
    expect(checkWiderSpread({ ...spreadBase, reason: 'identical' }).mistakeType).toBe('claimed-games-identical')
  })

  it('flags higher-ev explanation', () => {
    expect(checkWiderSpread({ ...spreadBase, reason: 'higher-ev' }).mistakeType).toBe('claimed-game-b-has-higher-ev')
  })
})

// ---------------------------------------------------------------------------
// ev-l5-p3 — Final Carnival Decision capstone (12-section wheel)
// ---------------------------------------------------------------------------

const capstoneBase: FinalDecisionCheckInput = {
  grouped: true,
  probabilities: ['1/12', '3/12', '8/12'],
  contributions: ['3', '3', '0'],
  expectedPayout: '6',
  expectedProfit: '0',
  decision: 'fair',
  riskChoice: 'variable-outcomes',
}

describe('ev-l5-p3 checkFinalDecision', () => {
  it('gates on grouping the wheel', () => {
    const r = checkFinalDecision({ ...capstoneBase, grouped: false })
    expect(r.canComplete).toBe(false)
    expect(r.mistakeType).toBeNull()
  })

  it('accepts the fully-correct model', () => {
    expect(checkFinalDecision(capstoneBase).canComplete).toBe(true)
  })

  it('accepts equivalent probability formats (decimals, reduced fractions, percent)', () => {
    expect(checkFinalDecision({ ...capstoneBase, probabilities: ['0.0833', '0.25', '2/3'] }).canComplete).toBe(true)
    expect(checkFinalDecision({ ...capstoneBase, probabilities: ['1/12', '25%', '0.6667'] }).canComplete).toBe(true)
    expect(checkFinalDecision({ ...capstoneBase, probabilities: [' 1 / 12 ', ' 25 % ', ' 66.67% '] }).canComplete).toBe(true)
  })

  it('accepts equivalent numeric formats for contributions, payout, and profit', () => {
    expect(checkFinalDecision({
      ...capstoneBase,
      contributions: ['9/3', '12/4', '0/8'],
      expectedPayout: '12/2',
      expectedProfit: '0/6',
    }).canComplete).toBe(true)
  })

  it('does not accept percent notation for payout/profit amount fields', () => {
    expect(checkFinalDecision({ ...capstoneBase, expectedPayout: '600%' }).canComplete).toBe(false)
    expect(checkFinalDecision({ ...capstoneBase, expectedProfit: '0%' }).canComplete).toBe(false)
  })

  it('flags counts-not-probability', () => {
    expect(checkFinalDecision({ ...capstoneBase, probabilities: ['1', '3/12', '8/12'] }).mistakeType).toBe('counts-not-probability')
  })

  it('flags wrong-denominator', () => {
    expect(checkFinalDecision({ ...capstoneBase, probabilities: ['1/10', '3/12', '8/12'] }).mistakeType).toBe('wrong-denominator')
  })

  it('flags omitted-zero-row', () => {
    expect(checkFinalDecision({ ...capstoneBase, contributions: ['3', '3', '5'] }).mistakeType).toBe('omitted-zero-row')
  })

  it('flags arithmetic-error in a contribution', () => {
    expect(checkFinalDecision({ ...capstoneBase, contributions: ['4', '3', '0'] }).mistakeType).toBe('arithmetic-error')
  })

  it('flags arithmetic-error for a wrong payout', () => {
    expect(checkFinalDecision({ ...capstoneBase, expectedPayout: '5' }).mistakeType).toBe('arithmetic-error')
  })

  it('flags payout-not-profit when profit equals payout', () => {
    expect(checkFinalDecision({ ...capstoneBase, expectedProfit: '6' }).mistakeType).toBe('payout-not-profit')
  })

  it('flags fair-marked-favorable', () => {
    expect(checkFinalDecision({ ...capstoneBase, decision: 'favorable' }).mistakeType).toBe('fair-marked-favorable')
  })

  it('flags believed-fair-has-no-risk', () => {
    expect(checkFinalDecision({ ...capstoneBase, riskChoice: 'no-risk' }).mistakeType).toBe('believed-fair-has-no-risk')
  })

  it('flags confused-ev-with-guaranteed', () => {
    expect(checkFinalDecision({ ...capstoneBase, riskChoice: 'guaranteed' }).mistakeType).toBe('confused-ev-with-guaranteed')
  })
})
