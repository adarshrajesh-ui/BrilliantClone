import { describe, expect, it } from 'vitest'
import { checkPackProblem, isGradedAttempt, problemPackBCheckers } from './checkers'
import { problemPackBValidationCases } from './validationCases'
import { problemPackB } from './problems'
import { problemPackBManifest } from './manifest'

describe('problemPackBValidationCases — deterministic accept/reject', () => {
  for (const c of problemPackBValidationCases) {
    it(`${c.id}: ${c.description}`, () => {
      const result = checkPackProblem(c.canonicalSlug, c.input)
      expect(result.canComplete).toBe(c.expectedCorrect)
      if (c.expectedMistakeType !== undefined) {
        expect(result.mistakeType ?? '').toBe(c.expectedMistakeType)
      }
      // Guard results (mistakeType === '') must never count as graded attempts.
      if (c.expectedMistakeType === '') {
        expect(isGradedAttempt(result)).toBe(false)
      }
      // Any real mistake must count as a graded attempt.
      if (c.expectedMistakeType && c.expectedMistakeType.length > 0) {
        expect(isGradedAttempt(result)).toBe(true)
      }
    })
  }

  it('feedback always returns under-100ms-friendly non-empty strings', () => {
    for (const c of problemPackBValidationCases) {
      const result = checkPackProblem(c.canonicalSlug, c.input)
      expect(typeof result.feedback).toBe('string')
      expect(result.feedback.length).toBeGreaterThan(0)
    }
  })
})

describe('pack structure invariants', () => {
  it('exposes exactly 10 problems for PRD 11–20', () => {
    expect(problemPackB).toHaveLength(10)
    const indices = problemPackB.map((p) => p.globalProblemIndex).sort((a, b) => a - b)
    expect(indices).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19])
  })

  it('has a checker for every canonical slug', () => {
    for (const p of problemPackB) {
      expect(typeof problemPackBCheckers[p.checkerKey]).toBe('function')
    }
  })

  it('preserves original storage IDs and assigns new IDs to new problems', () => {
    expect(problemPackBManifest.preservedStorageIds.sort()).toEqual([
      'problem-5',
      'problem-6',
      'problem-7',
      'problem-8',
    ])
    expect(problemPackBManifest.newStorageIds.sort()).toEqual([
      'l3-prize-bag-ev-table',
      'l3-repair-probability-table',
      'l4-choose-better-game-after-cost',
      'l4-find-fair-price',
      'l5-final-capstone-ev-decision',
      'l5-low-risk-vs-high-risk',
    ])
  })

  it('maps storage IDs to canonical slugs both ways', () => {
    expect(problemPackBManifest.slugByStorageId['problem-5']).toBe('l4-payout-vs-profit')
    expect(problemPackBManifest.storageIdBySlug['l5-build-whole-ev-model']).toBe('problem-7')
  })

  it('every problem has demo, task config, hints, and animations', () => {
    for (const p of problemPackB) {
      expect(p.demoConfig.steps.length).toBeGreaterThanOrEqual(4)
      expect(p.currentTaskConfig.checklist.length).toBeGreaterThanOrEqual(2)
      expect(p.hints.length).toBeGreaterThanOrEqual(2)
      expect(p.animations.length).toBeGreaterThanOrEqual(1)
    }
  })
})
