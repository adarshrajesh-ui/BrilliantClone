import { describe, expect, it } from 'vitest'
import {
  getNextImplementedProblemId,
  getPreviousImplementedProblemId,
} from './implementedProblems'

describe('implemented problem navigation', () => {
  it('resolves previous and next implemented problems in canonical order', () => {
    expect(getPreviousImplementedProblemId('problem-1')).toBeUndefined()
    expect(getNextImplementedProblemId('problem-1')).toBe('ev-l1-p2')
    expect(getPreviousImplementedProblemId('problem-2')).toBe('ev-l1-p3')
    expect(getNextImplementedProblemId('ev-l5-p3')).toBeUndefined()
  })
})
