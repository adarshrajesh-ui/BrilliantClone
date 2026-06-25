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
  it('declares exactly 14 unique ordered slugs', () => {
    expect(CANONICAL_PROBLEM_SLUGS).toHaveLength(14)
    expect(new Set(CANONICAL_PROBLEM_SLUGS).size).toBe(14)
  })

  it('orders slugs by lesson then position', () => {
    expect(CANONICAL_PROBLEM_SLUGS[0]).toBe('ev-l1-p1')
    expect(CANONICAL_PROBLEM_SLUGS[13]).toBe('ev-l5-p3')
    expect(canonicalSlugIndex('ev-l3-p1')).toBe(-1)
    expect(canonicalSlugIndex('ev-l3-p2')).toBe(6)
    expect(canonicalSlugIndex('not-a-slug')).toBe(-1)
  })

  it('recognizes canonical slugs', () => {
    expect(isCanonicalSlug('ev-l2-p1')).toBe(true)
    expect(isCanonicalSlug('problem-1')).toBe(false)
  })

  it('round-trips the active preserved legacy storage IDs', () => {
    for (const [slug, legacyId] of Object.entries(SLUG_TO_LEGACY_ID)) {
      expect(legacyId).toBeTruthy()
      expect(slugForLegacyId(legacyId as string)).toBe(slug)
    }
    expect(legacyIdForSlug('ev-l1-p1')).toBe('problem-1')
    // New problems use their canonical slug as the storage ID, so there is no
    // separate preserved `problem-N` legacy id.
    expect(legacyIdForSlug('ev-l5-p3')).toBeUndefined()
  })

  it('resolves a stable config key from either identifier', () => {
    expect(configKeyFor('problem-1')).toBe('ev-l1-p1')
    expect(configKeyFor('ev-l1-p1')).toBe('ev-l1-p1')
    // New problems pass through (storage id === canonical slug).
    expect(configKeyFor('ev-l3-p3')).toBe('ev-l3-p3')
    // Unknown id falls back to itself.
    expect(configKeyFor('problem-99')).toBe('problem-99')
  })
})
