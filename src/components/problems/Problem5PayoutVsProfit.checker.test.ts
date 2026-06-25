import { describe, expect, it } from 'vitest'
import { checkEvL4P1 } from './Problem5PayoutVsProfit.checker'

describe('ev-l4-p1 — Pay to Play (expected profit)', () => {
  it('gates the profit answer until the cost token is placed', () => {
    expect(checkEvL4P1({ costPlaced: false, profitAnswer: '1' }).mistakeType).toBe('')
    expect(checkEvL4P1({ costPlaced: false, profitAnswer: '1' }).canComplete).toBe(false)
  })

  it('accepts $1 in several formats', () => {
    expect(checkEvL4P1({ costPlaced: true, profitAnswer: '1' }).canComplete).toBe(true)
    expect(checkEvL4P1({ costPlaced: true, profitAnswer: '$1.00' }).canComplete).toBe(true)
    expect(checkEvL4P1({ costPlaced: true, profitAnswer: '1.0' }).canComplete).toBe(true)
    expect(checkEvL4P1({ costPlaced: true, profitAnswer: '1/1' }).canComplete).toBe(true)
    expect(checkEvL4P1({ costPlaced: true, profitAnswer: '  2 / 2  ' }).canComplete).toBe(true)
    expect(checkEvL4P1({ costPlaced: true, profitAnswer: '1 dollar' }).canComplete).toBe(true)
  })

  it('does not accept percent forms for expected profit', () => {
    expect(checkEvL4P1({ costPlaced: true, profitAnswer: '100%' }).canComplete).toBe(false)
  })

  it('classifies the four PRD mistakes', () => {
    expect(checkEvL4P1({ costPlaced: true, profitAnswer: '4' }).mistakeType).toBe('answered-payout')
    expect(checkEvL4P1({ costPlaced: true, profitAnswer: '7' }).mistakeType).toBe('added-cost')
    expect(checkEvL4P1({ costPlaced: true, profitAnswer: '-1' }).mistakeType).toBe('reversed-subtraction')
    expect(checkEvL4P1({ costPlaced: true, profitAnswer: '-1 / 1' }).mistakeType).toBe('reversed-subtraction')
    expect(checkEvL4P1({ costPlaced: true, profitAnswer: '0.75' }).mistakeType).toBe('cost-as-probability')
    expect(checkEvL4P1({ costPlaced: true, profitAnswer: '3 / 4' }).mistakeType).toBe('cost-as-probability')
  })

  it('guards an empty profit (no mistake type)', () => {
    expect(checkEvL4P1({ costPlaced: true, profitAnswer: '' }).mistakeType).toBe('')
  })
})
