import { describe, expect, it } from 'vitest'
import { problemPackACheckers } from '../checkers'
import { problemPackADemoConfigs } from '../demoConfigs'
import { canonicalSlugToStorageId, legacyIdToCanonicalSlug, problemPackAManifest } from '../manifest'
import { problemPackA } from '../problems'
import { initialStateFactories, reviewSerializers } from '../state'

describe('manifest integrity', () => {
  it('has one entry per problem in canonical order', () => {
    expect(problemPackAManifest.length).toBe(10)
    problemPackAManifest.forEach((e, i) => {
      expect(e.globalProblemIndex).toBe(i)
    })
  })

  it('preserves original storage ids and flags new ones', () => {
    const bySlug = Object.fromEntries(problemPackAManifest.map((e) => [e.canonicalSlug, e]))
    expect(bySlug['l1-long-run-average'].storageId).toBe('problem-1')
    expect(bySlug['l2-build-weighted-average'].storageId).toBe('problem-2')
    expect(bySlug['l3-mystery-box-outcomes'].storageId).toBe('problem-3')
    expect(bySlug['l3-calculate-ev-from-table'].storageId).toBe('problem-4')
    expect(bySlug['l1-long-run-average'].isNew).toBe(false)
    expect(bySlug['l1-unequal-spinner'].isNew).toBe(true)
    expect(bySlug['l1-unequal-spinner'].storageId).toBe('l1-unequal-spinner')
  })

  it('legacy mapping matches the manifest', () => {
    for (const [legacyId, slug] of Object.entries(legacyIdToCanonicalSlug)) {
      expect(canonicalSlugToStorageId[slug]).toBe(legacyId)
    }
  })

  it('every manifest entry resolves to a checker, demo, initial state, and serializer', () => {
    for (const e of problemPackAManifest) {
      expect(typeof problemPackACheckers[e.checkerKey]).toBe('function')
      expect(problemPackADemoConfigs[e.demoConfigKey]).toBeDefined()
      expect(typeof initialStateFactories[e.initialStateFactoryKey]).toBe('function')
      expect(typeof reviewSerializers[e.reviewSerializerKey]).toBe('function')
    }
  })
})

describe('problem definition integrity', () => {
  it('every problem has demo (4 steps + closing), current task, hints, mistakes, feedback', () => {
    for (const p of problemPackA) {
      expect(p.demoConfig.steps.length).toBeGreaterThanOrEqual(4)
      expect(p.demoConfig.closingPrompt.length).toBeGreaterThan(0)
      expect(p.demoConfig.countsAsAttempt).toBe(false)
      expect(p.currentTaskConfig.steps.length).toBeGreaterThan(0)
      expect(p.hints.length).toBeGreaterThanOrEqual(2)
      expect(p.mistakeRules.length).toBeGreaterThan(0)
      expect(p.feedback.correct.length).toBeGreaterThan(0)
      expect(Object.keys(p.wrongFeedback).length).toBeGreaterThan(0)
      expect(p.animations.every((a) => a.reducedMotionSafe)).toBe(true)
      // every mistakeRule has composed feedback text
      for (const rule of p.mistakeRules) {
        expect(p.feedback[rule.mistakeType], `${p.canonicalSlug}:${rule.mistakeType}`).toBeTruthy()
      }
    }
  })

  it('simulation problems require at least 100 spins where specified', () => {
    const lra = problemPackA.find((p) => p.canonicalSlug === 'l1-long-run-average')!
    expect((lra.givenData as { minSpins: number }).minSpins).toBe(100)
    const us = problemPackA.find((p) => p.canonicalSlug === 'l1-unequal-spinner')!
    expect((us.givenData as { minSpins: number }).minSpins).toBe(100)
  })

  it('placement problems are tap-first and never clear correct placements on a wrong one', () => {
    const placementProblems = problemPackA.filter((p) => p.placement)
    expect(placementProblems.length).toBeGreaterThan(0)
    for (const p of placementProblems) {
      expect(p.placement!.tapToSelect).toBe(true)
      expect(p.placement!.tapToPlace).toBe(true)
      expect(p.placement!.wrongPlacementClearsOthers).toBe(false)
      expect(p.placement!.canReplace).toBe(true)
    }
  })

  it('table problems carry visual-group / color-link metadata', () => {
    const mystery = problemPackA.find((p) => p.canonicalSlug === 'l3-mystery-box-outcomes')!
    const table = problemPackA.find((p) => p.canonicalSlug === 'l3-calculate-ev-from-table')!
    expect(mystery.visualGroups!.length).toBe(3)
    expect(table.visualGroups!.length).toBe(3)
    expect(mystery.visualGroups!.every((g) => g.colorToken.length > 0)).toBe(true)
  })
})
