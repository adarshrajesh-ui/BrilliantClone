// Problem Pack B manifest — the single source of truth Agent 1 uses to wire
// Problems 11–20 into the central registry, checker dispatch, and progress
// services. Storage IDs for the four original problems are preserved.

import { problemPackB } from './problems'
import type { ManifestEntry, PackProblemDefinition } from './types'

const PRD_NUMBER_BY_GLOBAL_INDEX: Record<number, number> = {
  10: 11,
  11: 12,
  12: 13,
  13: 14,
  14: 15,
  15: 16,
  16: 17,
  17: 18,
  18: 19,
  19: 20,
}

const ORIGINAL_STORAGE_IDS = new Set(['problem-5', 'problem-6', 'problem-7', 'problem-8'])

function uniqueMistakeTypes(problem: PackProblemDefinition): string[] {
  return Array.from(new Set(problem.mistakeRules.map((r) => r.mistakeType)))
}

function toManifestEntry(problem: PackProblemDefinition): ManifestEntry {
  return {
    canonicalSlug: problem.canonicalSlug,
    storageId: problem.storageId,
    legacyProblemId: problem.legacyProblemId,
    isOriginal: ORIGINAL_STORAGE_IDS.has(problem.storageId),
    lessonId: problem.lessonId,
    lessonIndex: problem.lessonIndex,
    problemIndexWithinLesson: problem.problemIndexWithinLesson,
    globalProblemIndex: problem.globalProblemIndex,
    prdProblemNumber: PRD_NUMBER_BY_GLOBAL_INDEX[problem.globalProblemIndex],
    checkerKey: problem.checkerKey,
    visualType: problem.visualType,
    interactionType: problem.interactionType,
    demoConfigKey: problem.canonicalSlug,
    initialStateFactoryKey: problem.canonicalSlug,
    reviewSerializerKey: problem.canonicalSlug,
    masteryTags: problem.masteryTags,
    acceptedFormats: problem.acceptedFormats,
    knownMistakeTypes: uniqueMistakeTypes(problem),
    completionRule: problem.completionRule,
  }
}

export interface ProblemPackBManifest {
  packId: 'expected-value-problem-pack-b'
  chapterId: 'expected-value-intro'
  ownerAgent: 'agent-4'
  /** PRD problem numbers covered by this pack. */
  prdProblemRange: [number, number]
  /** Original storage IDs preserved (progress-safe). */
  preservedStorageIds: string[]
  /** Storage IDs newly introduced by this pack. */
  newStorageIds: string[]
  entries: ManifestEntry[]
  /** Convenience lookups for Agent 1's central integration. */
  storageIdBySlug: Record<string, string>
  slugByStorageId: Record<string, string>
}

const entries = problemPackB.map(toManifestEntry)

export const problemPackBManifest: ProblemPackBManifest = {
  packId: 'expected-value-problem-pack-b',
  chapterId: 'expected-value-intro',
  ownerAgent: 'agent-4',
  prdProblemRange: [11, 20],
  preservedStorageIds: entries.filter((e) => e.isOriginal).map((e) => e.storageId),
  newStorageIds: entries.filter((e) => !e.isOriginal).map((e) => e.storageId),
  entries,
  storageIdBySlug: Object.fromEntries(entries.map((e) => [e.canonicalSlug, e.storageId])),
  slugByStorageId: Object.fromEntries(entries.map((e) => [e.storageId, e.canonicalSlug])),
}
