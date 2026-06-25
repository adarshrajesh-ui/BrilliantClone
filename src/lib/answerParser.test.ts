import { describe, expect, it } from 'vitest'
import {
  areNumbersClose,
  areProbabilitiesEquivalent,
  matchesNumeric,
  normalizeClassificationAnswer,
  normalizeMoneyAnswer,
  normalizeNumericAnswer,
  parseProbabilityAnswer,
} from './answerParser'

describe('normalizeMoneyAnswer', () => {
  it('accepts equivalent money formats', () => {
    for (const v of ['5', '5.0', '5.00', '$5', '$5.00', '5 dollars', '5 per spin', '  5  ']) {
      expect(normalizeMoneyAnswer(v)).toBeCloseTo(5, 5)
    }
    expect(normalizeMoneyAnswer('$1')).toBeCloseTo(1, 5)
    expect(normalizeMoneyAnswer('4')).toBeCloseTo(4, 5)
  })

  it('accepts fraction and negative money equivalents', () => {
    for (const v of ['1/2', '2/4', '1 / 2', '$1 / 2', '0.5 dollars']) {
      expect(normalizeMoneyAnswer(v)).toBeCloseTo(0.5, 5)
    }
    for (const v of ['-1/2', '- 1 / 2', '−1 / 2', '-0.5']) {
      expect(normalizeMoneyAnswer(v)).toBeCloseTo(-0.5, 5)
    }
  })

  it('rejects non-numeric input', () => {
    expect(normalizeMoneyAnswer('')).toBeNull()
    expect(normalizeMoneyAnswer('abc')).toBeNull()
    expect(normalizeMoneyAnswer('50%')).toBeNull()
    expect(normalizeMoneyAnswer('1/0')).toBeNull()
    expect(normalizeMoneyAnswer('1/2/3')).toBeNull()
    expect(normalizeMoneyAnswer(null)).toBeNull()
  })
})

describe('normalizeNumericAnswer', () => {
  it('handles fractions, percents and decimals literally', () => {
    expect(normalizeNumericAnswer('1/4')).toBeCloseTo(0.25, 5)
    expect(normalizeNumericAnswer('2 / 4')).toBeCloseTo(0.5, 5)
    expect(normalizeNumericAnswer('- 1 / 2')).toBeCloseTo(-0.5, 5)
    expect(normalizeNumericAnswer('−1/2')).toBeCloseTo(-0.5, 5)
    expect(normalizeNumericAnswer('25%')).toBeCloseTo(0.25, 5)
    expect(normalizeNumericAnswer('.25')).toBeCloseTo(0.25, 5)
    expect(normalizeNumericAnswer('12')).toBeCloseTo(12, 5)
    expect(normalizeNumericAnswer('$2.00')).toBeCloseTo(2, 5)
  })
})

describe('matchesNumeric', () => {
  it('accepts equivalent numeric and money fractions without accepting percent syntax', () => {
    expect(matchesNumeric('2/4', [0.5])).toBe(true)
    expect(matchesNumeric('$1 / 2', [0.5])).toBe(true)
    expect(matchesNumeric('- 1 / 2', [-0.5])).toBe(true)
    expect(matchesNumeric('50%', [0.5])).toBe(false)
  })
})

describe('parseProbabilityAnswer', () => {
  it('parses fractions, decimals, percentages into 0..1', () => {
    expect(parseProbabilityAnswer('25%')).toBeCloseTo(0.25, 5)
    expect(parseProbabilityAnswer('0.25')).toBeCloseTo(0.25, 5)
    expect(parseProbabilityAnswer('.25')).toBeCloseTo(0.25, 5)
    expect(parseProbabilityAnswer('1/4')).toBeCloseTo(0.25, 5)
    expect(parseProbabilityAnswer('2 / 8')).toBeCloseTo(0.25, 5)
    expect(parseProbabilityAnswer('25 %')).toBeCloseTo(0.25, 5)
    expect(parseProbabilityAnswer('25 / 100')).toBeCloseTo(0.25, 5)
    expect(parseProbabilityAnswer('1/6')).toBeCloseTo(1 / 6, 5)
  })

  it('treats a bare number > 1 as a percent', () => {
    expect(parseProbabilityAnswer('50')).toBeCloseTo(0.5, 5)
    expect(parseProbabilityAnswer('25')).toBeCloseTo(0.25, 5)
  })
})

describe('areNumbersClose', () => {
  it('respects tolerance', () => {
    expect(areNumbersClose(5, 5.001)).toBe(true)
    expect(areNumbersClose(5, 5.5)).toBe(false)
  })
})

describe('areProbabilitiesEquivalent', () => {
  it('accepts equivalent fractions and decimals', () => {
    const sixth: string[] = ['1/6', '0.1667', '0.167']
    sixth.forEach((v) => expect(areProbabilitiesEquivalent(v, 1 / 6)).toBe(true))
    const third: string[] = ['2/6', '1/3', '0.3333', '0.333']
    third.forEach((v) => expect(areProbabilitiesEquivalent(v, 2 / 6)).toBe(true))
    const half: string[] = ['3/6', '1/2', '0.5', '.5']
    half.forEach((v) => expect(areProbabilitiesEquivalent(v, 0.5)).toBe(true))
    expect(areProbabilitiesEquivalent('50%', 0.5)).toBe(true)
    expect(areProbabilitiesEquivalent('50 %', 0.5)).toBe(true)
    expect(areProbabilitiesEquivalent('2 / 4', 0.5)).toBe(true)
    expect(areProbabilitiesEquivalent('1/10', 0.1)).toBe(true)
    expect(areProbabilitiesEquivalent('2/10', 0.2)).toBe(true)
    expect(areProbabilitiesEquivalent('1/5', 0.2)).toBe(true)
    expect(areProbabilitiesEquivalent('7/10', 0.7)).toBe(true)
  })

  it('rejects clearly wrong values', () => {
    expect(areProbabilitiesEquivalent('0.9', 1 / 6)).toBe(false)
    expect(areProbabilitiesEquivalent('0.02', 1 / 3)).toBe(false)
    expect(areProbabilitiesEquivalent('51%', 0.5)).toBe(false)
    expect(areProbabilitiesEquivalent('2/5', 0.5)).toBe(false)
  })
})

describe('normalizeClassificationAnswer', () => {
  it('accepts safe, unambiguous synonyms case-insensitively', () => {
    ;['fair', 'Fair', 'FAIR'].forEach((v) => expect(normalizeClassificationAnswer(v)).toBe('fair'))
    ;['favorable', 'fav', 'positive', 'good for player'].forEach((v) =>
      expect(normalizeClassificationAnswer(v)).toBe('favorable'),
    )
    ;['unfavorable', 'unfav', 'negative', 'bad for player'].forEach((v) =>
      expect(normalizeClassificationAnswer(v)).toBe('unfavorable'),
    )
  })

  it('rejects ambiguous words', () => {
    expect(normalizeClassificationAnswer('maybe')).toBeNull()
    expect(normalizeClassificationAnswer('')).toBeNull()
  })
})
