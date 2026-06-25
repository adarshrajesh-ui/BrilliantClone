// PRD structural coverage — Expected Value Lab (15-problem chapter)
// -----------------------------------------------------------------
// Independent QA (Agent 6). Asserts the structural / progression / migration /
// mastery PRD requirements directly against the live core model and problem
// registry. Deterministic; no app modification; no Firebase.

import { describe, expect, it } from 'vitest'

import {
  CANONICAL_LESSONS,
  CANONICAL_PROBLEMS,
  PROBLEMS_PER_LESSON,
  REMOVED_SLUG_SUCCESSORS,
  TOTAL_LESSONS,
  TOTAL_PROBLEMS,
  getProblemsForLesson,
  resolveCanonicalProblem,
} from '../core/progression/canonical'
import {
  getChapterCompletionPercentage,
  getLessonCompletionPercentage,
  uniqueCompletedCount,
} from '../core/progression/selectors'
import {
  STRONG_ATTEMPT_THRESHOLD,
  deriveMasteryStatus,
  evaluateChapterMastery,
} from '../core/mastery/mastery'
import { ALL_PROBLEMS, getProblemDefinition } from '../data/problems'
import { IMPLEMENTED_PROBLEM_IDS } from '../data/implementedProblems'

// PRD Page 2: legacy storage IDs preserved on their canonical slots.
const LEGACY_STORAGE_TO_SLUG: Record<string, string> = {
  'problem-1': 'ev-l1-p1',
  'problem-2': 'ev-l2-p1',
  'problem-4': 'ev-l3-p2',
  'problem-5': 'ev-l4-p1',
  'problem-6': 'ev-l4-p2',
  'problem-7': 'ev-l5-p1',
  'problem-8': 'ev-l5-p2',
}

describe('chapter structure (active Expected Value Lab)', () => {
  it('has exactly 14 canonical problems', () => {
    expect(TOTAL_PROBLEMS).toBe(14)
    expect(CANONICAL_PROBLEMS).toHaveLength(14)
  })

  it('has 5 lessons with Average Card Value removed from lesson 3', () => {
    expect(TOTAL_LESSONS).toBe(5)
    expect(CANONICAL_LESSONS).toHaveLength(5)
    expect(PROBLEMS_PER_LESSON).toBe(14 / 5)
    expect(getProblemsForLesson('lesson-3')).toHaveLength(2)
  })

  it('assigns contiguous globalProblemIndex 0..13 in order', () => {
    const indices = CANONICAL_PROBLEMS.map((p) => p.globalProblemIndex)
    expect(indices).toEqual(Array.from({ length: 14 }, (_, i) => i))
  })

  it('ALL_PROBLEMS has 14 definitions in canonical order', () => {
    expect(ALL_PROBLEMS).toHaveLength(14)
    expect(ALL_PROBLEMS.map((p) => p.problemId)).toEqual(
      CANONICAL_PROBLEMS.map((p) => p.storageId),
    )
  })
})

describe('implemented problem registry', () => {
  it('lists all 14 implemented storage IDs', () => {
    expect(IMPLEMENTED_PROBLEM_IDS).toHaveLength(14)
  })

  it('every IMPLEMENTED_PROBLEM_ID has a ProblemDefinition', () => {
    for (const id of IMPLEMENTED_PROBLEM_IDS) {
      expect(getProblemDefinition(id), `missing definition for ${id}`).toBeDefined()
    }
  })

  it('every canonical storage ID is implemented', () => {
    for (const p of CANONICAL_PROBLEMS) {
      expect(IMPLEMENTED_PROBLEM_IDS).toContain(p.storageId)
    }
  })
})

describe('legacy storage ID preservation (problem-1..8)', () => {
  it.each(Object.entries(LEGACY_STORAGE_TO_SLUG))(
    '%s resolves to canonical slug %s',
    (storageId, slug) => {
      const resolved = resolveCanonicalProblem(storageId)
      expect(resolved?.canonicalSlug).toBe(slug)
      expect(resolved?.storageId).toBe(storageId)
    },
  )
})

describe('removed-slug → successor migration (20 → 15 shrink)', () => {
  const expected: Record<string, string> = {
    'l1-short-run-vs-long-run': 'ev-l1-p2',
    'l2-fill-missing-formula': 'ev-l2-p3',
    'ev-l3-p1': 'ev-l3-p2',
    'problem-3': 'ev-l3-p2',
    'l3-mystery-box-outcomes': 'ev-l3-p2',
    'l3-repair-probability-table': 'ev-l3-p3',
    'l4-find-fair-price': 'ev-l4-p3',
    'l5-low-risk-vs-high-risk': 'ev-l5-p3',
  }

  it('maps removed slugs and Average Card Value IDs to their successors', () => {
    expect(REMOVED_SLUG_SUCCESSORS).toEqual(expected)
  })

  it.each(Object.entries(expected))(
    'completion of removed slug %s resolves to successor %s',
    (removed, successorSlug) => {
      const resolved = resolveCanonicalProblem(removed)
      expect(resolved?.canonicalSlug).toBe(successorSlug)
    },
  )

  it('a removed slug counts as one completed problem for progress', () => {
    expect(uniqueCompletedCount(['l5-low-risk-vs-high-risk'])).toBe(1)
  })
})

describe('completion percentages (PRD Page 9)', () => {
  it('chapter percentage = completed ÷ 14 × 100', () => {
    expect(getChapterCompletionPercentage([])).toBe(0)
    expect(getChapterCompletionPercentage(['problem-1', 'ev-l1-p2', 'ev-l1-p3'])).toBe(21)
    expect(getChapterCompletionPercentage(CANONICAL_PROBLEMS.map((p) => p.storageId))).toBe(100)
  })

  it('lesson percentage = completed in lesson ÷ 3 × 100', () => {
    expect(getLessonCompletionPercentage('lesson-1', ['problem-1'])).toBe(33)
    expect(getLessonCompletionPercentage('lesson-1', ['problem-1', 'ev-l1-p2', 'ev-l1-p3'])).toBe(100)
  })

  it('dedupes and ignores unrecognized IDs', () => {
    expect(uniqueCompletedCount(['problem-1', 'problem-1', 'bogus'])).toBe(1)
  })
})

describe('mastery rule (PRD Page 10 revised)', () => {
  it('strong-attempt threshold is 11 of 14', () => {
    expect(STRONG_ATTEMPT_THRESHOLD).toBe(11)
  })

  const allStorageIds = CANONICAL_PROBLEMS.map((p) => p.storageId)

  function fullyCorrect(): Record<string, boolean> {
    return Object.fromEntries(allStorageIds.map((id) => [id, true]))
  }

  it('grants mastery when all 14 complete, key problems correct, ≥11 strong', () => {
    const result = evaluateChapterMastery({
      completedProblemIds: allStorageIds,
      correctByProblem: fullyCorrect(),
      gradedFinalAttemptsByProblem: Object.fromEntries(allStorageIds.map((id) => [id, 1])),
    })
    expect(result.mastered).toBe(true)
    expect(result.strongThresholdMet).toBe(true)
  })

  it('denies mastery with fewer than 11 strong completions', () => {
    // 5 problems took 3 graded attempts -> only 9 strong (< 11).
    const attempts = Object.fromEntries(
      allStorageIds.map((id, i) => [id, i < 5 ? 3 : 1]),
    )
    const result = evaluateChapterMastery({
      completedProblemIds: allStorageIds,
      correctByProblem: fullyCorrect(),
      gradedFinalAttemptsByProblem: attempts,
    })
    expect(result.strongCompletions).toBe(9)
    expect(result.mastered).toBe(false)
  })

  it('denies mastery when the capstone (ev-l5-p3) is not correct', () => {
    const correct = fullyCorrect()
    correct['ev-l5-p3'] = false
    const result = evaluateChapterMastery({
      completedProblemIds: allStorageIds,
      correctByProblem: correct,
      gradedFinalAttemptsByProblem: Object.fromEntries(allStorageIds.map((id) => [id, 1])),
    })
    expect(result.capstoneCorrect).toBe(false)
    expect(result.mastered).toBe(false)
  })

  it('requires payout-vs-profit (ev-l4-p1) and same-EV-vs-risk (ev-l5-p2)', () => {
    const correct = fullyCorrect()
    correct['problem-5'] = false // storage ID for ev-l4-p1
    const result = evaluateChapterMastery({
      completedProblemIds: allStorageIds,
      correctByProblem: correct,
      gradedFinalAttemptsByProblem: Object.fromEntries(allStorageIds.map((id) => [id, 1])),
    })
    expect(result.payoutVsProfitCorrect).toBe(false)
    expect(result.mastered).toBe(false)
  })

  it('mastery status boundaries: Developing at ceil(14/2) = 7 completed', () => {
    expect(deriveMasteryStatus({ completedCount: 0, mastered: false })).toBe('Not Started')
    expect(deriveMasteryStatus({ completedCount: 1, mastered: false })).toBe('Learning')
    expect(deriveMasteryStatus({ completedCount: 7, mastered: false })).toBe('Developing')
    expect(deriveMasteryStatus({ completedCount: 14, mastered: true })).toBe('Mastered')
  })
})
