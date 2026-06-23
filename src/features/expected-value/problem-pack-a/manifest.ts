// Pack manifest — the single source of truth Agent 1 uses to wire Problem Pack A
// into the central registry, routing, and session flow. Every problem lists its
// canonical slug, persisted storage id, lesson/problem indices, and the exported
// artifacts (checker, demo config, initial-state factory, review serializer,
// validation cases).

import { problemPackA } from './problems'
import type { CanonicalSlug, PackManifestEntry } from './types'

export const problemPackAManifest: PackManifestEntry[] = problemPackA.map((p) => ({
  canonicalSlug: p.canonicalSlug,
  storageId: p.storageId,
  legacyProblemId: p.legacyProblemId,
  lessonId: p.lessonId,
  lessonIndex: p.lessonIndex,
  problemIndexWithinLesson: p.problemIndexWithinLesson,
  globalProblemIndex: p.globalProblemIndex,
  isNew: p.legacyProblemId === undefined,
  checkerKey: p.canonicalSlug,
  demoConfigKey: p.canonicalSlug,
  initialStateFactoryKey: p.canonicalSlug,
  reviewSerializerKey: p.canonicalSlug,
  validationCaseKey: p.canonicalSlug,
  visualType: p.visualType,
  interactionType: p.interactionType,
  masteryTags: p.masteryTags,
}))

/** Original-problem storage id -> canonical slug (IDs preserved, never renamed). */
export const legacyIdToCanonicalSlug: Record<string, CanonicalSlug> = {
  'problem-1': 'l1-long-run-average',
  'problem-2': 'l2-build-weighted-average',
  'problem-3': 'l3-mystery-box-outcomes',
  'problem-4': 'l3-calculate-ev-from-table',
}

/** Canonical slug -> persisted storage id for all 10 problems. */
export const canonicalSlugToStorageId: Record<CanonicalSlug, string> = problemPackA.reduce(
  (acc, p) => {
    acc[p.canonicalSlug] = p.storageId
    return acc
  },
  {} as Record<CanonicalSlug, string>,
)

export function getManifestEntry(slug: CanonicalSlug): PackManifestEntry | undefined {
  return problemPackAManifest.find((e) => e.canonicalSlug === slug)
}
