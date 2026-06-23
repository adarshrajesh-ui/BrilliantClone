/**
 * Canonical problem-slug contract (PRD page-level identifiers).
 *
 * This is a READ-ONLY reference used to key UI configuration (demo content,
 * current-task copy) in a stable, lesson-aware way. Authoritative problem
 * ordering and IDs live with Agent 1 in `src/data/chapter.ts`; this module
 * never renames or replaces those IDs. The `legacyProblemId` mapping links the
 * canonical slug to the existing `problem-N` ID where one already exists. New
 * problems (Agents 3/4) will fill the remaining slugs.
 */

export const CANONICAL_PROBLEM_SLUGS = [
  'l1-long-run-average',
  'l1-unequal-spinner',
  'l1-short-run-vs-long-run',
  'l1-compare-spinners',
  'l2-build-weighted-average',
  'l2-match-outcomes-probabilities',
  'l2-fill-missing-formula',
  'l2-diagnose-bad-ev-setups',
  'l3-mystery-box-outcomes',
  'l3-calculate-ev-from-table',
  'l3-repair-probability-table',
  'l3-prize-bag-ev-table',
  'l4-payout-vs-profit',
  'l4-fair-favorable-unfavorable',
  'l4-find-fair-price',
  'l4-choose-better-game-after-cost',
  'l5-build-whole-ev-model',
  'l5-same-ev-different-risk',
  'l5-low-risk-vs-high-risk',
  'l5-final-capstone-ev-decision',
] as const

export type CanonicalProblemSlug = (typeof CANONICAL_PROBLEM_SLUGS)[number]

/**
 * Mapping of canonical slug -> existing legacy problem ID. Only the eight
 * problems that already exist are mapped; the remaining slugs resolve to
 * `undefined` until Agents 3/4 ship the new packs (and Agent 1 registers IDs).
 */
export const SLUG_TO_LEGACY_ID: Partial<Record<CanonicalProblemSlug, string>> = {
  'l1-long-run-average': 'problem-1',
  'l2-build-weighted-average': 'problem-2',
  'l3-mystery-box-outcomes': 'problem-3',
  'l3-calculate-ev-from-table': 'problem-4',
  'l4-payout-vs-profit': 'problem-5',
  'l4-fair-favorable-unfavorable': 'problem-6',
  'l5-build-whole-ev-model': 'problem-7',
  'l5-same-ev-different-risk': 'problem-8',
}

const LEGACY_ID_TO_SLUG: Record<string, CanonicalProblemSlug> = Object.entries(
  SLUG_TO_LEGACY_ID,
).reduce<Record<string, CanonicalProblemSlug>>((acc, [slug, legacyId]) => {
  if (legacyId) {
    acc[legacyId] = slug as CanonicalProblemSlug
  }
  return acc
}, {})

export function isCanonicalSlug(value: string): value is CanonicalProblemSlug {
  return (CANONICAL_PROBLEM_SLUGS as readonly string[]).includes(value)
}

/** 0-based position in the canonical 20-problem ordering, or -1 if unknown. */
export function canonicalSlugIndex(slug: string): number {
  return (CANONICAL_PROBLEM_SLUGS as readonly string[]).indexOf(slug)
}

/** Legacy `problem-N` ID for a canonical slug (undefined if not yet shipped). */
export function legacyIdForSlug(slug: CanonicalProblemSlug): string | undefined {
  return SLUG_TO_LEGACY_ID[slug]
}

/** Canonical slug for an existing legacy `problem-N` ID, if mapped. */
export function slugForLegacyId(legacyId: string): CanonicalProblemSlug | undefined {
  return LEGACY_ID_TO_SLUG[legacyId]
}

/**
 * Resolve whichever identifier the caller has (canonical slug OR legacy ID) to a
 * stable config key. Prefers the canonical slug when one is known so demo and
 * task config keep resolving across the migration; otherwise returns the input.
 */
export function configKeyFor(idOrSlug: string): string {
  if (isCanonicalSlug(idOrSlug)) {
    return idOrSlug
  }
  return slugForLegacyId(idOrSlug) ?? idOrSlug
}
