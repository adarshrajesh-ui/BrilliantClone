// Registry of problems that have a real interactive implementation.
//
// The chapter models 14 active canonical problems after removing Average Card Value.
// This module is the single source of truth for
// *which* problems are implemented, so routing and "continue / next" navigation
// never send a learner into a placeholder when an implemented problem is the
// intended destination.
//
// Keys are STORAGE IDs (the same ids used by PROBLEM_COMPONENTS in ProblemPage).

import {
  CANONICAL_PROBLEMS,
  resolveCanonicalProblem,
} from '../core/progression/canonical'

/** Storage IDs of problems with an interactive implementation (all active problems). */
export const IMPLEMENTED_PROBLEM_IDS = [
  'problem-1', // ev-l1-p1
  'ev-l1-p2',
  'ev-l1-p3',
  'problem-2', // ev-l2-p1
  'ev-l2-p2',
  'ev-l2-p3',
  'problem-4', // ev-l3-p2
  'ev-l3-p3',
  'problem-5', // ev-l4-p1
  'problem-6', // ev-l4-p2
  'ev-l4-p3',
  'problem-7', // ev-l5-p1
  'problem-8', // ev-l5-p2
  'ev-l5-p3',
] as const

export type ImplementedProblemId = (typeof IMPLEMENTED_PROBLEM_IDS)[number]

const IMPLEMENTED = new Set<string>(IMPLEMENTED_PROBLEM_IDS)

/**
 * Whether the given identifier (canonical slug or storage ID) resolves to a
 * problem that has an interactive implementation.
 */
export function isProblemImplemented(problemId: string): boolean {
  const storageId = resolveCanonicalProblem(problemId)?.storageId
  return storageId != null && IMPLEMENTED.has(storageId)
}

/**
 * Storage ID of the next implemented problem after the given one in canonical
 * chapter order, skipping any unimplemented placeholders. Returns undefined when
 * no implemented problem follows.
 */
export function getNextImplementedProblemId(problemId: string): string | undefined {
  const fromIndex = resolveCanonicalProblem(problemId)?.globalProblemIndex ?? -1
  const next = CANONICAL_PROBLEMS.find(
    (p) => p.globalProblemIndex > fromIndex && IMPLEMENTED.has(p.storageId),
  )
  return next?.storageId
}

/**
 * Storage ID of the previous implemented problem before the given one in
 * canonical chapter order, skipping any unimplemented placeholders.
 */
export function getPreviousImplementedProblemId(problemId: string): string | undefined {
  const fromIndex = resolveCanonicalProblem(problemId)?.globalProblemIndex
  if (fromIndex == null) {
    return undefined
  }
  const previous = CANONICAL_PROBLEMS
    .filter((p) => p.globalProblemIndex < fromIndex && IMPLEMENTED.has(p.storageId))
    .at(-1)
  return previous?.storageId
}

/**
 * Resolve a continue/next target to an actually-implemented problem: if the
 * target is implemented, return its storage ID; otherwise jump forward to the
 * next implemented problem. Falls back to the original storage ID (a
 * placeholder) when no implemented problem remains, which is acceptable once all
 * implemented problems are done.
 */
export function resolveToImplementedProblemId(problemId: string): string {
  const storageId = resolveCanonicalProblem(problemId)?.storageId ?? problemId
  if (IMPLEMENTED.has(storageId)) {
    return storageId
  }
  return getNextImplementedProblemId(problemId) ?? storageId
}
