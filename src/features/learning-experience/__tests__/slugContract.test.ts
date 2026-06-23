import { describe, expect, it } from 'vitest'
import {
  CANONICAL_PROBLEM_SLUGS,
  SLUG_TO_LEGACY_ID,
  canonicalSlugIndex,
  configKeyFor,
  isCanonicalSlug,
  legacyIdForSlug,
  slugForLegacyId,
} from '../slugContract'

describe('canonical slug contract', () => {
  it('declares exactly 20 unique ordered slugs', () => {
    expect(CANONICAL_PROBLEM_SLUGS).toHaveLength(20)
    expect(new Set(CANONICAL_PROBLEM_SLUGS).size).toBe(20)
  })

  it('orders slugs by lesson then position', () => {
    expect(CANONICAL_PROBLEM_SLUGS[0]).toBe('l1-long-run-average')
    expect(CANONICAL_PROBLEM_SLUGS[19]).toBe('l5-final-capstone-ev-decision')
    expect(canonicalSlugIndex('l3-mystery-box-outcomes')).toBe(8)
    expect(canonicalSlugIndex('not-a-slug')).toBe(-1)
  })

  it('recognizes canonical slugs', () => {
    expect(isCanonicalSlug('l2-build-weighted-average')).toBe(true)
    expect(isCanonicalSlug('problem-1')).toBe(false)
  })

  it('round-trips the eight known legacy IDs', () => {
    for (const [slug, legacyId] of Object.entries(SLUG_TO_LEGACY_ID)) {
      expect(legacyId).toBeTruthy()
      expect(slugForLegacyId(legacyId as string)).toBe(slug)
    }
    expect(legacyIdForSlug('l1-long-run-average')).toBe('problem-1')
    expect(legacyIdForSlug('l5-final-capstone-ev-decision')).toBeUndefined()
  })

  it('resolves a stable config key from either identifier', () => {
    expect(configKeyFor('problem-1')).toBe('l1-long-run-average')
    expect(configKeyFor('l1-long-run-average')).toBe('l1-long-run-average')
    // Unknown legacy id falls back to itself.
    expect(configKeyFor('problem-99')).toBe('problem-99')
  })
})
