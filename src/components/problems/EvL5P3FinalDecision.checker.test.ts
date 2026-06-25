import { describe, expect, it } from 'vitest'
import {
  checkEvL5P3Table,
  checkEvL5P3Payout,
  checkEvL5P3Profit,
  checkEvL5P3Decision,
  checkEvL5P3Risk,
} from '../../data/problems/ev-l5-p3'

// Per-step checkers for the ev-l5-p3 capstone. Each validates ONLY its own
// field(s) and NEVER sets canComplete (completion stays on the holistic check).

describe('ev-l5-p3 checkEvL5P3Table', () => {
  it('guards (mistakeType "") until every cell is filled', () => {
    const r = checkEvL5P3Table(['', '', ''], ['', '', ''])
    expect(r.isCorrect).toBe(false)
    expect(r.canComplete).toBe(false)
    expect(r.mistakeType).toBe('')
  })

  it('accepts the correct probabilities and contributions', () => {
    const r = checkEvL5P3Table(['1/12', '3/12', '8/12'], ['3', '3', '0'])
    expect(r.isCorrect).toBe(true)
    expect(r.canComplete).toBe(false)
    expect(r.mistakeType).toBeNull()
  })

  it('accepts equivalent probability formats', () => {
    expect(checkEvL5P3Table(['0.0833', '0.25', '2/3'], ['3', '3', '0']).isCorrect).toBe(true)
    expect(checkEvL5P3Table([' 1 / 12 ', ' 25 % ', ' 66.67% '], ['9/3', '12/4', '0/8']).isCorrect).toBe(true)
  })

  it('does not accept percent notation for contribution amount fields', () => {
    expect(checkEvL5P3Table(['1/12', '3/12', '8/12'], ['300%', '3', '0']).isCorrect).toBe(false)
  })

  it('flags counts-not-probability', () => {
    expect(checkEvL5P3Table(['1', '3/12', '8/12'], ['3', '3', '0']).mistakeType).toBe('counts-not-probability')
  })

  it('flags wrong-denominator', () => {
    expect(checkEvL5P3Table(['1/10', '3/12', '8/12'], ['3', '3', '0']).mistakeType).toBe('wrong-denominator')
  })

  it('flags omitted-zero-row', () => {
    expect(checkEvL5P3Table(['1/12', '3/12', '8/12'], ['3', '3', '5']).mistakeType).toBe('omitted-zero-row')
  })

  it('flags arithmetic-error in a contribution', () => {
    expect(checkEvL5P3Table(['1/12', '3/12', '8/12'], ['4', '3', '0']).mistakeType).toBe('arithmetic-error')
  })
})

describe('ev-l5-p3 checkEvL5P3Payout', () => {
  it('guards on empty', () => {
    const r = checkEvL5P3Payout('')
    expect(r.mistakeType).toBe('')
    expect(r.isCorrect).toBe(false)
  })

  it('accepts $6', () => {
    expect(checkEvL5P3Payout('6').isCorrect).toBe(true)
    expect(checkEvL5P3Payout('$6').isCorrect).toBe(true)
    expect(checkEvL5P3Payout('12/2').isCorrect).toBe(true)
    expect(checkEvL5P3Payout(' 18 / 3 ').isCorrect).toBe(true)
  })

  it('does not accept percent notation for payout amount', () => {
    expect(checkEvL5P3Payout('600%').isCorrect).toBe(false)
  })

  it('flags arithmetic-error for a wrong payout', () => {
    expect(checkEvL5P3Payout('5').mistakeType).toBe('arithmetic-error')
  })
})

describe('ev-l5-p3 checkEvL5P3Profit', () => {
  it('guards on empty', () => {
    expect(checkEvL5P3Profit('').mistakeType).toBe('')
  })

  it('accepts $0', () => {
    expect(checkEvL5P3Profit('0').isCorrect).toBe(true)
    expect(checkEvL5P3Profit('$0').isCorrect).toBe(true)
    expect(checkEvL5P3Profit('0/6').isCorrect).toBe(true)
  })

  it('does not accept percent notation for profit amount', () => {
    expect(checkEvL5P3Profit('0%').isCorrect).toBe(false)
  })

  it('flags payout-not-profit when profit equals the $6 payout', () => {
    expect(checkEvL5P3Profit('6').mistakeType).toBe('payout-not-profit')
  })

  it('flags arithmetic-error for any other wrong value', () => {
    expect(checkEvL5P3Profit('3').mistakeType).toBe('arithmetic-error')
  })
})

describe('ev-l5-p3 checkEvL5P3Decision', () => {
  it('guards on empty', () => {
    expect(checkEvL5P3Decision('').mistakeType).toBe('')
  })

  it('accepts fair', () => {
    expect(checkEvL5P3Decision('fair').isCorrect).toBe(true)
  })

  it('flags fair-marked-favorable', () => {
    expect(checkEvL5P3Decision('favorable').mistakeType).toBe('fair-marked-favorable')
  })

  it('flags marked-unfavorable', () => {
    expect(checkEvL5P3Decision('unfavorable').mistakeType).toBe('marked-unfavorable')
  })
})

describe('ev-l5-p3 checkEvL5P3Risk', () => {
  it('guards on empty', () => {
    expect(checkEvL5P3Risk('').mistakeType).toBe('')
  })

  it('accepts variable-outcomes', () => {
    expect(checkEvL5P3Risk('variable-outcomes').isCorrect).toBe(true)
  })

  it('flags believed-fair-has-no-risk', () => {
    expect(checkEvL5P3Risk('no-risk').mistakeType).toBe('believed-fair-has-no-risk')
  })

  it('flags confused-ev-with-guaranteed', () => {
    expect(checkEvL5P3Risk('guaranteed').mistakeType).toBe('confused-ev-with-guaranteed')
  })
})
