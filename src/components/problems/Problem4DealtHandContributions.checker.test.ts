import { describe, expect, it } from 'vitest'
import { checkDealtHand, type DealtHandCheckInput } from './Problem4DealtHandContributions.checker'

const build = (
  contributions: [string, string, string],
  evAnswer: string,
): DealtHandCheckInput => ({ contributions, evAnswer })

const CORRECT = build(['0.5', '1.0', '5.0'], '6.5')

describe('ev-l3-p2 — Dealt-Hand Contributions', () => {
  it('accepts the correct contributions + EV (and accepted EV variants)', () => {
    expect(checkDealtHand(CORRECT).canComplete).toBe(true)
    expect(checkDealtHand(build(['0.5', '1.0', '5.0'], '6.50')).canComplete).toBe(true)
    expect(checkDealtHand(build(['0.5', '1.0', '5.0'], '$6.50')).canComplete).toBe(true)
    expect(checkDealtHand(build(['0.5', '1.0', '5.0'], '13/2')).canComplete).toBe(true)
  })

  it('accepts equivalent fraction and whitespace formats for contributions and EV', () => {
    expect(checkDealtHand(build(['1/2', '1 / 1', '10 / 2'], '13 / 2')).canComplete).toBe(true)
    expect(checkDealtHand(build(['  0.50  ', ' $1.00 ', ' 5 dollars '], ' 6.500 ')).canComplete).toBe(true)
  })

  it('does not accept percent forms for non-probability contribution or EV answers', () => {
    expect(checkDealtHand(build(['50%', '1.0', '5.0'], '6.5')).canComplete).toBe(false)
    expect(checkDealtHand(build(['0.5', '1.0', '5.0'], '650%')).canComplete).toBe(false)
  })

  it('guards until every contribution is filled (no mistake type)', () => {
    expect(checkDealtHand(build(['0.5', '', '5.0'], '6.5')).mistakeType).toBe('')
  })

  it('guards when the EV is empty (no mistake type)', () => {
    expect(checkDealtHand(build(['0.5', '1.0', '5.0'], '')).mistakeType).toBe('')
  })

  it('flags a contribution entered as the raw value (forgot-to-weight)', () => {
    expect(checkDealtHand(build(['2', '1.0', '5.0'], '6.5')).mistakeType).toBe('forgot-to-weight')
    expect(checkDealtHand(build(['0.5', '1.0', '10'], '6.5')).mistakeType).toBe('forgot-to-weight')
  })

  it('flags adding raw card values (16) instead of weighted contributions', () => {
    expect(checkDealtHand(build(['0.5', '1.0', '5.0'], '16')).mistakeType).toBe('unweighted-sum')
  })

  it('flags a wrong contribution as arithmetic-error', () => {
    expect(checkDealtHand(build(['0.3', '1.0', '5.0'], '6.5')).mistakeType).toBe('arithmetic-error')
  })

  it('flags a wrong EV sum as arithmetic-error', () => {
    expect(checkDealtHand(build(['0.5', '1.0', '5.0'], '7')).mistakeType).toBe('arithmetic-error')
  })
})
