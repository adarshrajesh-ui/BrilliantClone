/**
 * Canonical problem-slug contract (PRD page-level identifiers).
 *
 * This is a READ-ONLY reference used to key UI configuration (demo content,
 * current-task copy) in a stable, lesson-aware way. Authoritative problem
 * ordering and IDs live with Agent 1 in `src/core/progression/canonical.ts`
 * (re-exported by `src/data/chapter.ts`); this module never renames or replaces
 * those IDs.
 *
 * The active canonical slugs use the `ev-l{N}-p{M}` pattern. The originally
 * implemented problems keep their preserved
 * `problem-N` storage IDs; the seven new problems use their canonical slug as
 * the storage ID. `SLUG_TO_LEGACY_ID` maps a canonical slug to its preserved
 * `problem-N` storage ID where one exists, so demo/task config keep resolving
 * across the migration.
 */

export const CANONICAL_PROBLEM_SLUGS = [
  'ev-l1-p1',
  'ev-l1-p2',
  'ev-l1-p3',
  'ev-l2-p1',
  'ev-l2-p2',
  'ev-l2-p3',
  'ev-l3-p2',
  'ev-l3-p3',
  'ev-l4-p1',
  'ev-l4-p2',
  'ev-l4-p3',
  'ev-l5-p1',
  'ev-l5-p2',
  'ev-l5-p3',
] as const

export type CanonicalProblemSlug = (typeof CANONICAL_PROBLEM_SLUGS)[number]

/**
 * Mapping of canonical slug -> preserved legacy storage ID. Only the active
 * originally-implemented problems carry a distinct `problem-N` storage ID; the
 * seven new problems use their canonical slug as the storage ID and therefore
 * have no separate legacy ID here.
 */
export const SLUG_TO_LEGACY_ID: Partial<Record<CanonicalProblemSlug, string>> = {
  'ev-l1-p1': 'problem-1',
  'ev-l2-p1': 'problem-2',
  'ev-l3-p2': 'problem-4',
  'ev-l4-p1': 'problem-5',
  'ev-l4-p2': 'problem-6',
  'ev-l5-p1': 'problem-7',
  'ev-l5-p2': 'problem-8',
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

/** 0-based position in the canonical 15-problem ordering, or -1 if unknown. */
export function canonicalSlugIndex(slug: string): number {
  return (CANONICAL_PROBLEM_SLUGS as readonly string[]).indexOf(slug)
}

/** Preserved `problem-N` storage ID for a canonical slug (undefined for the new problems). */
export function legacyIdForSlug(slug: CanonicalProblemSlug): string | undefined {
  return SLUG_TO_LEGACY_ID[slug]
}

/** Canonical slug for a preserved `problem-N` storage ID, if one is mapped. */
export function slugForLegacyId(legacyId: string): CanonicalProblemSlug | undefined {
  return LEGACY_ID_TO_SLUG[legacyId]
}

/**
 * Resolve whichever identifier the caller has (canonical slug OR storage ID) to a
 * stable config key. Prefers the canonical slug when one is known so demo and
 * task config keep resolving across the migration; otherwise returns the input.
 * New problems already use their canonical slug as the storage ID, so they pass
 * through `isCanonicalSlug` directly.
 */
export function configKeyFor(idOrSlug: string): string {
  if (isCanonicalSlug(idOrSlug)) {
    return idOrSlug
  }
  return slugForLegacyId(idOrSlug) ?? idOrSlug
}
