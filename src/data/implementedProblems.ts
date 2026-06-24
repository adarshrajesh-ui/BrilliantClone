// Registry of problems that have a real interactive implementation.
//
// The chapter models 20 canonical problems, but only a subset currently have
// built interactive components (the rest intentionally render a placeholder).
// This module is the single source of truth for *which* problems are
// implemented, so routing and "continue / next" navigation never send a learner
// into a placeholder when an implemented problem is the intended destination.
//
// Keys are STORAGE IDs (the same ids used by PROBLEM_COMPONENTS in ProblemPage).

import {
  CANONICAL_PROBLEMS,
  resolveCanonicalProblem,
} from '../core/progression/canonical'

/** Storage IDs of problems with an interactive implementation, in any order. */
export const IMPLEMENTED_PROBLEM_IDS = [
  'problem-1',
  'problem-2',
  'problem-3',
  'problem-4',
  'problem-5',
  'problem-6',
  'problem-7',
  'problem-8',
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
