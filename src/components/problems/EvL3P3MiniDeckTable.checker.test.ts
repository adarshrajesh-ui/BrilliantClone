import { describe, expect, it } from 'vitest'
import { checkMiniDeck, type MiniDeckCheckInput } from './EvL3P3MiniDeckTable.checker'

type Row = MiniDeckCheckInput['rows'][number]
const row = (count: string, probability: string, contribution: string): Row => ({ count, probability, contribution })

const build = (r0: Row, r1: Row, r2: Row, evAnswer: string): MiniDeckCheckInput => ({
  rows: [r0, r1, r2],
  evAnswer,
})

// rows ascending value [1, 7, 10]: counts [3,3,4], probs [3/10,3/10,4/10], contribs [0.3,2.1,4.0]
const CORRECT = build(row('3', '3/10', '0.3'), row('3', '3/10', '2.1'), row('4', '4/10', '4.0'), '6.4')

describe('ev-l3-p3 — Mini-Deck EV Table', () => {
  it('accepts the correct full table (decimal probs + EV variants)', () => {
    expect(checkMiniDeck(CORRECT).canComplete).toBe(true)
    expect(checkMiniDeck(build(row('3', '0.3', '0.3'), row('3', '0.3', '2.1'), row('4', '0.4', '4'), '$6.40')).canComplete).toBe(true)
    expect(checkMiniDeck(build(row('3', '3/10', '0.3'), row('3', '3/10', '2.1'), row('4', '2/5', '4.0'), '32/5')).canComplete).toBe(true)
    expect(checkMiniDeck(build(row('3', '3/10', '0.3'), row('3', '3/10', '2.1'), row('4', '4/10', '4.0'), '6.40')).canComplete).toBe(true)
  })

  it('accepts equivalent probabilities as fractions, decimals, percents, and spaced fractions', () => {
    expect(checkMiniDeck(build(row('3', '0.30', '0.3'), row('3', '30%', '2.1'), row('4', '40%', '4'), '6.4')).canComplete).toBe(true)
    expect(checkMiniDeck(build(row('3', '3 / 10', '0.3'), row('3', '0.3', '2.1'), row('4', '2 / 5', '4'), '6.4')).canComplete).toBe(true)
  })

  it('accepts equivalent count, contribution, and EV numeric fractions with whitespace', () => {
    expect(
      checkMiniDeck(
        build(row('6 / 2', '3/10', '3 / 10'), row('3.0', '3/10', '21 / 10'), row('4 / 1', '4/10', '4 / 1'), '32 / 5'),
      ).canComplete,
    ).toBe(true)
  })

  it('does not treat percent forms as count, contribution, or EV answers', () => {
    expect(checkMiniDeck(build(row('300%', '3/10', '0.3'), row('3', '3/10', '2.1'), row('4', '4/10', '4.0'), '6.4')).mistakeType).toBe('arithmetic-error')
    expect(checkMiniDeck(build(row('3', '3/10', '30%'), row('3', '3/10', '2.1'), row('4', '4/10', '4.0'), '6.4')).mistakeType).toBe('arithmetic-error')
    expect(checkMiniDeck(build(row('3', '3/10', '0.3'), row('3', '3/10', '2.1'), row('4', '4/10', '4.0'), '640%')).mistakeType).toBe('arithmetic-error')
  })

  it('guards until every cell is filled (no mistake type)', () => {
    expect(checkMiniDeck(build(row('3', '3/10', '0.3'), row('3', '', '2.1'), row('4', '4/10', '4.0'), '6.4')).mistakeType).toBe('')
  })

  it('flags a raw count typed as a probability', () => {
    expect(checkMiniDeck(build(row('3', '3', '0.3'), row('3', '3/10', '2.1'), row('4', '4/10', '4.0'), '6.4')).mistakeType).toBe('count-probability-confusion')
  })

  it('flags the wrong denominator', () => {
    expect(checkMiniDeck(build(row('3', '3/8', '0.3'), row('3', '3/10', '2.1'), row('4', '4/10', '4.0'), '6.4')).mistakeType).toBe('wrong-denominator')
  })

  it('flags a paying row dropped to 0 as omitted-row', () => {
    expect(checkMiniDeck(build(row('3', '3/10', '0.3'), row('3', '3/10', '2.1'), row('4', '4/10', '0'), '2.4')).mistakeType).toBe('omitted-row')
  })

  it('flags summing the raw card values (64) instead of EV', () => {
    expect(checkMiniDeck(build(row('3', '3/10', '0.3'), row('3', '3/10', '2.1'), row('4', '4/10', '4.0'), '64')).mistakeType).toBe('used-total-card-value')
  })

  it('flags a wrong count as arithmetic-error', () => {
    expect(checkMiniDeck(build(row('5', '3/10', '0.3'), row('3', '3/10', '2.1'), row('4', '4/10', '4.0'), '6.4')).mistakeType).toBe('arithmetic-error')
  })

  it('flags a wrong contribution as arithmetic-error', () => {
    expect(checkMiniDeck(build(row('3', '3/10', '1'), row('3', '3/10', '2.1'), row('4', '4/10', '4.0'), '6.4')).mistakeType).toBe('arithmetic-error')
  })

  it('flags a wrong EV sum as arithmetic-error', () => {
    expect(checkMiniDeck(build(row('3', '3/10', '0.3'), row('3', '3/10', '2.1'), row('4', '4/10', '4.0'), '5')).mistakeType).toBe('arithmetic-error')
  })
})
