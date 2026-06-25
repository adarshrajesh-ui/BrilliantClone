// Pure mastery evaluation (Agent 1 — Core Architecture).
//
// No Firestore, no React. The service layer gathers attempt data and feeds it
// into these deterministic functions so mastery rules are unit-testable.

import {
  TOTAL_PROBLEMS,
  mapCanonicalSlugToStorageId,
  normalizeToStorageId,
} from '../progression/canonical'
import { uniqueCompletedCount } from '../progression/selectors'

export type MasteryStatus = 'Not Started' | 'Learning' | 'Developing' | 'Mastered'

/**
 * Number of "strong" completions (<= 2 graded attempts) required for mastery.
 * PRD: at least 11 of the 15 problems completed in <= 2 graded attempts.
 */
export const STRONG_ATTEMPT_THRESHOLD = 11

/** Max graded attempts for a completion to count as "strong". */
export const STRONG_ATTEMPT_MAX = 2

/**
 * Canonical slugs whose correct completion is required for chapter mastery
 * (PRD Page 10 revised rule): the final capstone, the payout-vs-profit
 * distinction, and the equal-EV-vs-risk distinction.
 */
export const MASTERY_REQUIRED_SLUGS = {
  capstone: 'ev-l5-p3',
  payoutVsProfit: 'ev-l4-p1',
  sameEvDifferentRisk: 'ev-l5-p2',
} as const

/** Coarse mastery status shown in the UI badge. */
export function deriveMasteryStatus(args: {
  completedCount: number
  mastered: boolean
}): MasteryStatus {
  const { completedCount, mastered } = args
  if (completedCount <= 0) {
    return 'Not Started'
  }
  if (mastered) {
    return 'Mastered'
  }
  if (completedCount >= Math.ceil(TOTAL_PROBLEMS / 2)) {
    return 'Developing'
  }
  return 'Learning'
}

export interface MasteryEvaluationInput {
  /** Completed problem IDs exactly as persisted (storage IDs, legacy allowed). */
  completedProblemIds: string[]
  /**
   * Whether each problem was ever completed correctly via a GRADED attempt
   * (practice_restart attempts excluded). Keyed by storage ID or slug.
   */
  correctByProblem: Record<string, boolean>
  /**
   * Count of GRADED final attempts per problem (practice_restart excluded).
   * Keyed by storage ID or slug. Missing entries are treated as 0.
   */
  gradedFinalAttemptsByProblem: Record<string, number>
}

export interface MasteryEvaluationResult {
  mastered: boolean
  allComplete: boolean
  capstoneCorrect: boolean
  payoutVsProfitCorrect: boolean
  sameEvDifferentRiskCorrect: boolean
  strongCompletions: number
  strongThresholdMet: boolean
}

function lookupByStorageId(
  map: Record<string, number | boolean>,
  storageId: string,
): number | boolean | undefined {
  if (storageId in map) {
    return map[storageId]
  }
  // Tolerate maps keyed by slug or any equivalent identifier.
  for (const key of Object.keys(map)) {
    if (normalizeToStorageId(key) === storageId) {
      return map[key]
    }
  }
  return undefined
}

function isCorrect(map: Record<string, boolean>, slug: string): boolean {
  const storageId = mapCanonicalSlugToStorageId(slug)
  if (!storageId) {
    return false
  }
  return lookupByStorageId(map, storageId) === true
}

export function evaluateChapterMastery(
  input: MasteryEvaluationInput,
): MasteryEvaluationResult {
  const completedCount = uniqueCompletedCount(input.completedProblemIds)
  const allComplete = completedCount >= TOTAL_PROBLEMS

  const capstoneCorrect = isCorrect(input.correctByProblem, MASTERY_REQUIRED_SLUGS.capstone)
  const payoutVsProfitCorrect = isCorrect(
    input.correctByProblem,
    MASTERY_REQUIRED_SLUGS.payoutVsProfit,
  )
  const sameEvDifferentRiskCorrect = isCorrect(
    input.correctByProblem,
    MASTERY_REQUIRED_SLUGS.sameEvDifferentRisk,
  )

  // Strong completions: each unique completed problem solved in <= 2 graded
  // attempts. Practice restarts are excluded by the caller before building the
  // attempt map, so they can never reduce this count.
  const completedStorageIds = new Set<string>()
  for (const id of input.completedProblemIds) {
    const storageId = normalizeToStorageId(id)
    if (storageId) {
      completedStorageIds.add(storageId)
    }
  }
  let strongCompletions = 0
  for (const storageId of completedStorageIds) {
    const attempts = (lookupByStorageId(
      input.gradedFinalAttemptsByProblem,
      storageId,
    ) as number | undefined) ?? 0
    if (attempts <= STRONG_ATTEMPT_MAX) {
      strongCompletions += 1
    }
  }
  const strongThresholdMet = strongCompletions >= STRONG_ATTEMPT_THRESHOLD

  const mastered =
    allComplete &&
    capstoneCorrect &&
    payoutVsProfitCorrect &&
    sameEvDifferentRiskCorrect &&
    strongThresholdMet

  return {
    mastered,
    allComplete,
    capstoneCorrect,
    payoutVsProfitCorrect,
    sameEvDifferentRiskCorrect,
    strongCompletions,
    strongThresholdMet,
  }
}
