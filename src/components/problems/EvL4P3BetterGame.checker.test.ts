import { describe, expect, it } from 'vitest'
import { checkEvL4P3, checkEvL4P3Profits, checkEvL4P3Choice } from './EvL4P3BetterGame.checker'

describe('ev-l4-p3 — Choose the Better Game After Cost', () => {
  it('accepts correct profits and Game B (choice variants)', () => {
    expect(checkEvL4P3({ profitA: '2', profitB: '3', choice: 'B' }).canComplete).toBe(true)
    expect(checkEvL4P3({ profitA: '$2', profitB: '$3', choice: 'Game B' }).canComplete).toBe(true)
    expect(checkEvL4P3({ profitA: '2.0', profitB: '3.0', choice: 'b' }).canComplete).toBe(true)
  })

  it('accepts equivalent fraction and whitespace formats for profits', () => {
    expect(checkEvL4P3({ profitA: '4/2', profitB: '9 / 3', choice: 'B' }).canComplete).toBe(true)
    expect(checkEvL4P3({ profitA: '  $2.00  ', profitB: ' 3 dollars ', choice: 'Game B' }).canComplete).toBe(true)
  })

  it('does not accept percent forms for profit answers', () => {
    expect(checkEvL4P3({ profitA: '200%', profitB: '3', choice: 'B' }).canComplete).toBe(false)
    expect(checkEvL4P3({ profitA: '2', profitB: '300%', choice: 'B' }).canComplete).toBe(false)
  })

  it('guards until both profits are entered', () => {
    expect(checkEvL4P3({ profitA: '', profitB: '3', choice: 'B' }).mistakeType).toBe('')
  })

  it('classifies profit mistakes for Game A', () => {
    expect(checkEvL4P3({ profitA: '9', profitB: '3', choice: 'B' }).mistakeType).toBe('forgot-subtract-cost')
    expect(checkEvL4P3({ profitA: '16', profitB: '3', choice: 'B' }).mistakeType).toBe('added-cost')
    expect(checkEvL4P3({ profitA: '-2', profitB: '3', choice: 'B' }).mistakeType).toBe('reversed-payout-cost')
    expect(checkEvL4P3({ profitA: '-2 / 1', profitB: '3', choice: 'B' }).mistakeType).toBe('reversed-payout-cost')
  })

  it('classifies a profit mistake for Game B', () => {
    expect(checkEvL4P3({ profitA: '2', profitB: '6', choice: 'B' }).mistakeType).toBe('forgot-subtract-cost')
  })

  it('guards a missing choice once profits are correct', () => {
    expect(checkEvL4P3({ profitA: '2', profitB: '3', choice: '' }).mistakeType).toBe('')
  })

  it('flags choosing the larger payout (Game A) as the wrong game', () => {
    expect(checkEvL4P3({ profitA: '2', profitB: '3', choice: 'A' }).mistakeType).toBe('chose-larger-payout')
  })
})

describe('checkEvL4P3Profits — per-step (profits only)', () => {
  it('is correct for both profits but never completes (final check owns completion)', () => {
    const r = checkEvL4P3Profits('2', '3')
    expect(r.isCorrect).toBe(true)
    expect(r.canComplete).toBe(false)
    expect(checkEvL4P3Profits('4 / 2', '9 / 3').isCorrect).toBe(true)
  })

  it('guards until both profits are entered', () => {
    expect(checkEvL4P3Profits('', '3').mistakeType).toBe('')
    expect(checkEvL4P3Profits('2', '').mistakeType).toBe('')
  })

  it('classifies profit mistakes per game', () => {
    expect(checkEvL4P3Profits('9', '3').mistakeType).toBe('forgot-subtract-cost')
    expect(checkEvL4P3Profits('2', '6').mistakeType).toBe('forgot-subtract-cost')
    expect(checkEvL4P3Profits('16', '3').mistakeType).toBe('added-cost')
  })
})

describe('checkEvL4P3Choice — per-step (choice only)', () => {
  it('is correct for Game B but never completes', () => {
    const r = checkEvL4P3Choice('B')
    expect(r.isCorrect).toBe(true)
    expect(r.canComplete).toBe(false)
    expect(checkEvL4P3Choice('Game B').isCorrect).toBe(true)
    expect(checkEvL4P3Choice('b').isCorrect).toBe(true)
  })

  it('guards a missing choice', () => {
    expect(checkEvL4P3Choice('').mistakeType).toBe('')
  })

  it('flags Game A as the larger-payout trap', () => {
    expect(checkEvL4P3Choice('A').mistakeType).toBe('chose-larger-payout')
  })
})
