import { describe, expect, it } from 'vitest'
import { isPackGradedAttempt, problemPackACheckers } from '../checkers'
import type { CheckResult } from '../types'
import { problemPackAValidationCases } from '../validationCases'

type LooseChecker = (input: unknown) => CheckResult

describe('validation cases replay through the checkers', () => {
  for (const c of problemPackAValidationCases) {
    it(`${c.id} (${c.slug}): ${c.description}`, () => {
      const checker = problemPackACheckers[c.slug] as unknown as LooseChecker
      const result = checker(c.input)
      expect(result.canComplete).toBe(c.expect.canComplete)
      if (c.expect.mistakeType !== null) {
        expect(result.mistakeType).toBe(c.expect.mistakeType)
      }
      expect(isPackGradedAttempt(result)).toBe(c.expect.graded)
    })
  }
})

describe('validation case coverage', () => {
  it('covers all ten problems', () => {
    const slugs = new Set(problemPackAValidationCases.map((c) => c.slug))
    expect(slugs.size).toBe(10)
  })
})
