import { describe, expect, it } from 'vitest'
import { formatProbability } from './formatProbability'

describe('formatProbability', () => {
  it('renders small-denominator probabilities as reduced fractions', () => {
    expect(formatProbability(1 / 6)).toBe('1/6')
    expect(formatProbability(1 / 3)).toBe('1/3')
    expect(formatProbability(2 / 3)).toBe('2/3')
    expect(formatProbability(1 / 4)).toBe('1/4')
    expect(formatProbability(1 / 2)).toBe('1/2')
  })

  it('falls back to a rounded percent for non-simple values', () => {
    expect(formatProbability(0.0769)).toBe('7.7%')
  })
})
