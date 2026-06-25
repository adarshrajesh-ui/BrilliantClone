import { describe, expect, it } from 'vitest'
import {
  buildValueGroups,
  cardValue,
  DEALT_HAND_L3P2,
  DEALT_HAND_L3P2_EV,
  DEALT_HAND_L3P2_GROUPS,
  expectedValue,
  FULL_DECK,
  FULL_DECK_EV,
  FULL_DECK_GROUPS,
  FULL_DECK_TOTAL,
  makeCard,
  MINI_DECK_L3P3,
  MINI_DECK_L3P3_EV,
  MINI_DECK_L3P3_GROUPS,
  totalValue,
  type Card,
} from './deck'

describe('cardValue', () => {
  it('maps A to 1, numerics to themselves, and J/Q/K/10 to 10', () => {
    expect(cardValue('A')).toBe(1)
    expect(cardValue('2')).toBe(2)
    expect(cardValue('9')).toBe(9)
    expect(cardValue('10')).toBe(10)
    expect(cardValue('J')).toBe(10)
    expect(cardValue('Q')).toBe(10)
    expect(cardValue('K')).toBe(10)
  })
})

describe('makeCard', () => {
  it('uses the "10" rank literal (not "T") and computes value', () => {
    const ten = makeCard('10', 'spades')
    expect(ten).toEqual({ rank: '10', suit: 'spades', value: 10 })
    expect(makeCard('A', 'hearts').value).toBe(1)
  })
})

describe('FULL_DECK', () => {
  it('has 52 unique cards', () => {
    expect(FULL_DECK).toHaveLength(52)
    const ids = new Set(FULL_DECK.map((c) => `${c.rank}-${c.suit}`))
    expect(ids.size).toBe(52)
  })

  it('has FULL_DECK_TOTAL 340 and EV ≈ 6.5385', () => {
    expect(FULL_DECK_TOTAL).toBe(340)
    expect(FULL_DECK_EV).toBeCloseTo(6.5385, 4)
    expect(FULL_DECK_EV).toBeCloseTo(85 / 13, 10)
  })

  it('groups: value-1 (Ace) count 4 and value-10 count 16', () => {
    const aceGroup = FULL_DECK_GROUPS.find((g) => g.value === 1)
    const tenGroup = FULL_DECK_GROUPS.find((g) => g.value === 10)
    expect(aceGroup?.count).toBe(4)
    expect(tenGroup?.count).toBe(16)
    expect(tenGroup?.ranks).toEqual(['10', 'J', 'Q', 'K'])
  })

  it('has 10 groups (values 1..10) summing to 52 cards', () => {
    expect(FULL_DECK_GROUPS).toHaveLength(10)
    expect(FULL_DECK_GROUPS.map((g) => g.value)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ])
    const total = FULL_DECK_GROUPS.reduce((s, g) => s + g.count, 0)
    expect(total).toBe(52)
  })
})

describe('buildValueGroups', () => {
  it('sorts ascending by value and omits empty groups', () => {
    const cards: Card[] = [
      makeCard('K', 'spades'), // value 10
      makeCard('2', 'hearts'), // value 2
      makeCard('A', 'clubs'), // value 1
    ]
    const groups = buildValueGroups(cards)
    expect(groups.map((g) => g.value)).toEqual([1, 2, 10])
    // no value-3..9 groups since those have count 0
    expect(groups.every((g) => g.count > 0)).toBe(true)
  })

  it('computes probability = count/size and contribution = value*probability', () => {
    const groups = buildValueGroups(MINI_DECK_L3P3)
    const v7 = groups.find((g) => g.value === 7)
    expect(v7?.probability).toBeCloseTo(3 / 10, 10)
    expect(v7?.contribution).toBeCloseTo(2.1, 10)
  })

  it('returns empty array for an empty source', () => {
    expect(buildValueGroups([])).toEqual([])
  })
})

describe('totalValue / expectedValue', () => {
  it('totalValue sums card values', () => {
    expect(totalValue(DEALT_HAND_L3P2)).toBe(52)
    expect(totalValue([])).toBe(0)
  })

  it('expectedValue is total / length and safe for empty', () => {
    expect(expectedValue(DEALT_HAND_L3P2)).toBeCloseTo(6.5, 10)
    expect(expectedValue([])).toBe(0)
  })
})

describe('DEALT_HAND_L3P2', () => {
  it('has 8 cards and EV 6.5', () => {
    expect(DEALT_HAND_L3P2).toHaveLength(8)
    expect(DEALT_HAND_L3P2_EV).toBeCloseTo(6.5, 10)
  })

  it('has groups ascending [2, 4, 10] with contributions [0.5, 1.0, 5.0]', () => {
    expect(DEALT_HAND_L3P2_GROUPS.map((g) => g.value)).toEqual([2, 4, 10])
    expect(DEALT_HAND_L3P2_GROUPS.map((g) => g.count)).toEqual([2, 2, 4])
    const contributions = DEALT_HAND_L3P2_GROUPS.map((g) => g.contribution)
    expect(contributions[0]).toBeCloseTo(0.5, 10)
    expect(contributions[1]).toBeCloseTo(1.0, 10)
    expect(contributions[2]).toBeCloseTo(5.0, 10)
    const evFromGroups = contributions.reduce((s, c) => s + c, 0)
    expect(evFromGroups).toBeCloseTo(6.5, 10)
  })
})

describe('MINI_DECK_L3P3', () => {
  it('has 10 cards and EV 6.4', () => {
    expect(MINI_DECK_L3P3).toHaveLength(10)
    expect(MINI_DECK_L3P3_EV).toBeCloseTo(6.4, 10)
  })

  it('has groups ascending [1, 7, 10] with counts [3,3,4] and contributions [0.3, 2.1, 4.0]', () => {
    expect(MINI_DECK_L3P3_GROUPS.map((g) => g.value)).toEqual([1, 7, 10])
    expect(MINI_DECK_L3P3_GROUPS.map((g) => g.count)).toEqual([3, 3, 4])
    const contributions = MINI_DECK_L3P3_GROUPS.map((g) => g.contribution)
    expect(contributions[0]).toBeCloseTo(0.3, 10)
    expect(contributions[1]).toBeCloseTo(2.1, 10)
    expect(contributions[2]).toBeCloseTo(4.0, 10)
    const evFromGroups = contributions.reduce((s, c) => s + c, 0)
    expect(evFromGroups).toBeCloseTo(6.4, 10)
  })
})
