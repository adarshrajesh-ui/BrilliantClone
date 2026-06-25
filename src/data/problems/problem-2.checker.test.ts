import { describe, expect, it } from 'vitest'
import { checkEvL2P2 } from './ev-l2-p2'
import { checkProblem2PrizeBoard, REQUIRED_GRABS } from './problem-2'

const SLOTS: [string, string, string, string] = ['$20', '25%', '$0', '75%']
const REVERSED_ORDER: [string, string, string, string] = ['$0', '75%', '$20', '25%']

describe('ev-l2-p1 — Claw Machine Expected Value', () => {
  it('exposes REQUIRED_GRABS = 8', () => {
    expect(REQUIRED_GRABS).toBe(8)
  })

  it('gates until the learner has run their grabs', () => {
    const result = checkProblem2PrizeBoard({ grabsComplete: false, slots: SLOTS, evAnswer: '5' })
    expect(result.mistakeType).toBe('')
    expect(result.canComplete).toBe(false)
  })

  it('accepts the correct pairing and EV once grabs are complete', () => {
    expect(checkProblem2PrizeBoard({ grabsComplete: true, slots: SLOTS, evAnswer: '5' }).canComplete).toBe(true)
    expect(checkProblem2PrizeBoard({ grabsComplete: true, slots: SLOTS, evAnswer: '$5.00' }).canComplete).toBe(true)
    expect(checkProblem2PrizeBoard({ grabsComplete: true, slots: REVERSED_ORDER, evAnswer: '5.00' }).canComplete).toBe(true)
  })

  it('accepts equivalent whole, decimal, fraction, and whitespace EV formats', () => {
    expect(checkProblem2PrizeBoard({ grabsComplete: true, slots: SLOTS, evAnswer: ' 5 ' }).canComplete).toBe(true)
    expect(checkProblem2PrizeBoard({ grabsComplete: true, slots: SLOTS, evAnswer: '5.0' }).canComplete).toBe(true)
    expect(checkProblem2PrizeBoard({ grabsComplete: true, slots: SLOTS, evAnswer: '10 / 2' }).canComplete).toBe(true)
    expect(checkProblem2PrizeBoard({ grabsComplete: true, slots: SLOTS, evAnswer: '$ 10 / 2 dollars' }).canComplete).toBe(true)
  })

  it('does not accept percent input for the dollar EV answer', () => {
    expect(checkProblem2PrizeBoard({ grabsComplete: true, slots: SLOTS, evAnswer: '500%' }).mistakeType).toBe('arithmetic-error')
  })

  it('classifies reversed outcome/probability pairing ($20 with 75%)', () => {
    const reversed: [string, string, string, string] = ['$20', '75%', '$0', '25%']
    expect(checkProblem2PrizeBoard({ grabsComplete: true, slots: reversed, evAnswer: '5' }).mistakeType).toBe('reversed-outcome-probability')
  })

  it('classifies an omitted probability when fewer than four slots are filled', () => {
    const partial: [string, string, string, string] = ['$20', '25%', '', '']
    expect(checkProblem2PrizeBoard({ grabsComplete: true, slots: partial, evAnswer: '5' }).mistakeType).toBe('omitted-probability')
  })

  it('classifies using the largest payout as the EV', () => {
    expect(checkProblem2PrizeBoard({ grabsComplete: true, slots: SLOTS, evAnswer: '20' }).mistakeType).toBe('used-largest-payout')
  })

  it('guards an empty formula before any cards are placed', () => {
    const empty: [string, string, string, string] = ['', '', '', '']
    expect(checkProblem2PrizeBoard({ grabsComplete: true, slots: empty, evAnswer: '5' }).mistakeType).toBe('')
  })
})

describe('ev-l2-p2 — Match Outcomes to Probabilities', () => {
  it('accepts equivalent fraction, decimal, percent, and whitespace probability formats', () => {
    expect(checkEvL2P2({ assignments: { '12': '2 / 6', '3': '50%', '0': '0.1667' } }).canComplete).toBe(true)
    expect(checkEvL2P2({ assignments: { '12': ' 33.33% ', '3': '0.5', '0': '1 / 6' } }).canComplete).toBe(true)
  })

  it('classifies equivalent reused and ranked probability formats', () => {
    expect(checkEvL2P2({ assignments: { '12': '1/3', '3': '33.33%', '0': '1/6' } }).mistakeType).toBe('reused-probability')
    expect(checkEvL2P2({ assignments: { '12': '0.5', '3': '1/3', '0': '1/6' } }).mistakeType).toBe('ranked-by-size')
  })
})
