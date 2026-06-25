import { describe, expect, it } from 'vitest'
import {
  CANONICAL_PROBLEMS,
  TOTAL_PROBLEMS,
  getGlobalProblemIndex,
  mapCanonicalSlugToStorageId,
  mapLegacyProblemIdToCanonicalSlug,
  normalizeToCanonicalSlug,
  normalizeToStorageId,
} from './canonical'
import {
  getChapterCompletionPercentage,
  getCompletedLessonIds,
  getContinueProblemId,
  getCurrentLessonId,
  getFarthestCompletedIndex,
  getHighestSequentialCompletedIndex,
  getLessonCompletionPercentage,
  getLessonForProblem,
  getNextIncompleteProblemId,
  getNextLessonId,
  isChapterComplete,
  isLessonCompleted,
  isProblemCompleted,
  orderedChapterProblems,
  uniqueCompletedCount,
} from './selectors'

const ALL_IDS = CANONICAL_PROBLEMS.map((p) => p.storageId)
const L1 = ['problem-1', 'ev-l1-p2', 'ev-l1-p3']
const L2 = ['problem-2', 'ev-l2-p2', 'ev-l2-p3']

describe('canonical model + mapping', () => {
  it('defines 14 ordered active problems', () => {
    expect(TOTAL_PROBLEMS).toBe(14)
    expect(orderedChapterProblems()).toHaveLength(14)
    expect(orderedChapterProblems().map((p) => p.globalProblemIndex)).toEqual(
      Array.from({ length: 14 }, (_, i) => i),
    )
    expect(CANONICAL_PROBLEMS.filter((p) => p.lessonId === 'lesson-3')).toHaveLength(2)
  })

  it('maps the active legacy storage IDs to canonical slugs', () => {
    expect(mapLegacyProblemIdToCanonicalSlug('problem-1')).toBe('ev-l1-p1')
    expect(mapLegacyProblemIdToCanonicalSlug('problem-2')).toBe('ev-l2-p1')
    expect(mapLegacyProblemIdToCanonicalSlug('problem-3')).toBe('ev-l3-p2')
    expect(mapLegacyProblemIdToCanonicalSlug('problem-4')).toBe('ev-l3-p2')
    expect(mapLegacyProblemIdToCanonicalSlug('problem-5')).toBe('ev-l4-p1')
    expect(mapLegacyProblemIdToCanonicalSlug('problem-6')).toBe('ev-l4-p2')
    expect(mapLegacyProblemIdToCanonicalSlug('problem-7')).toBe('ev-l5-p1')
    expect(mapLegacyProblemIdToCanonicalSlug('problem-8')).toBe('ev-l5-p2')
  })

  it('uses the canonical slug as the storage ID for new problems', () => {
    expect(mapCanonicalSlugToStorageId('ev-l1-p2')).toBe('ev-l1-p2')
    expect(mapCanonicalSlugToStorageId('ev-l5-p3')).toBe('ev-l5-p3')
    // Original problems still map slug -> legacy storage ID.
    expect(mapCanonicalSlugToStorageId('ev-l1-p1')).toBe('problem-1')
    expect(mapCanonicalSlugToStorageId('ev-l5-p2')).toBe('problem-8')
  })

  it('resolves prior (legacy) canonical slugs to the new model', () => {
    // legacyProblemId values from the pre-15 PRD still resolve.
    expect(normalizeToStorageId('l1-long-run-average')).toBe('problem-1')
    expect(normalizeToCanonicalSlug('l1-long-run-average')).toBe('ev-l1-p1')
    expect(normalizeToStorageId('l1-unequal-spinner')).toBe('ev-l1-p2')
    expect(normalizeToStorageId('l2-build-weighted-average')).toBe('problem-2')
  })

  it('resolves REMOVED slugs to their successor problem', () => {
    expect(normalizeToCanonicalSlug('l1-short-run-vs-long-run')).toBe('ev-l1-p2')
    expect(normalizeToCanonicalSlug('l2-fill-missing-formula')).toBe('ev-l2-p3')
    expect(normalizeToCanonicalSlug('l3-repair-probability-table')).toBe('ev-l3-p3')
    expect(normalizeToCanonicalSlug('l4-find-fair-price')).toBe('ev-l4-p3')
    expect(normalizeToCanonicalSlug('l5-low-risk-vs-high-risk')).toBe('ev-l5-p3')
  })

  it('normalizes either identifier form interchangeably', () => {
    expect(normalizeToStorageId('ev-l1-p1')).toBe('problem-1')
    expect(normalizeToStorageId('problem-1')).toBe('problem-1')
    expect(normalizeToCanonicalSlug('problem-1')).toBe('ev-l1-p1')
    expect(normalizeToCanonicalSlug('ev-l1-p1')).toBe('ev-l1-p1')
    expect(normalizeToStorageId('nonexistent')).toBeUndefined()
    expect(getGlobalProblemIndex('nonexistent')).toBe(-1)
  })
})

describe('completion counting + percentages', () => {
  it('0 of 14 complete', () => {
    expect(uniqueCompletedCount([])).toBe(0)
    expect(getChapterCompletionPercentage([])).toBe(0)
    expect(getNextIncompleteProblemId([])).toBe('problem-1')
  })

  it('1 of 14 complete', () => {
    expect(uniqueCompletedCount(['problem-1'])).toBe(1)
    expect(getChapterCompletionPercentage(['problem-1'])).toBe(7)
  })

  it('counts each unique problem once and dedupes duplicates + slug aliases', () => {
    const dup = ['problem-1', 'problem-1', 'ev-l1-p1', 'l1-long-run-average']
    expect(uniqueCompletedCount(dup)).toBe(1)
    expect(getChapterCompletionPercentage(dup)).toBe(7)
  })

  it('counts a removed slug as its successor (no double count)', () => {
    expect(uniqueCompletedCount(['l1-short-run-vs-long-run'])).toBe(1)
    expect(isProblemCompleted('ev-l1-p2', ['l1-short-run-vs-long-run'])).toBe(true)
    // Removed slug + its successor's real id collapse to one.
    expect(uniqueCompletedCount(['l1-short-run-vs-long-run', 'ev-l1-p2'])).toBe(1)
  })

  it('ignores unrecognized IDs in counting', () => {
    expect(uniqueCompletedCount(['problem-1', 'ghost'])).toBe(1)
  })

  it('all 14 complete', () => {
    expect(uniqueCompletedCount(ALL_IDS)).toBe(14)
    expect(getChapterCompletionPercentage(ALL_IDS)).toBe(100)
    expect(isChapterComplete(ALL_IDS)).toBe(true)
    expect(getNextIncompleteProblemId(ALL_IDS)).toBeNull()
  })

  it('lesson percentages use active lesson problem counts', () => {
    expect(getLessonCompletionPercentage('lesson-1', [])).toBe(0)
    expect(getLessonCompletionPercentage('lesson-1', ['problem-1'])).toBe(33)
    expect(getLessonCompletionPercentage('lesson-1', L1)).toBe(100)
  })
})

describe('lesson completion + boundaries', () => {
  it('lesson completes only with all three problems', () => {
    expect(isLessonCompleted('lesson-1', ['problem-1'])).toBe(false)
    expect(isLessonCompleted('lesson-1', L1)).toBe(true)
    expect(getCompletedLessonIds([...L1, ...L2])).toEqual(['lesson-1', 'lesson-2'])
  })

  it('transitions current/next lesson across a boundary', () => {
    expect(getCurrentLessonId(L1)).toBe('lesson-2')
    expect(getNextLessonId(L1)).toBe('lesson-3')
    expect(getLessonForProblem('problem-2')?.lessonId).toBe('lesson-2')
  })

  it('next lesson is null when the chapter is complete', () => {
    expect(getNextLessonId(ALL_IDS)).toBeNull()
    expect(getCurrentLessonId(ALL_IDS)).toBe('lesson-5')
  })
})

describe('sequential vs farthest progress (no backward movement)', () => {
  it('several sequential completions', () => {
    expect(getHighestSequentialCompletedIndex(L1)).toBe(2)
    expect(getNextIncompleteProblemId(L1)).toBe('problem-2')
  })

  it('non-sequential completion does not advance sequential progress past a gap', () => {
    // problem-1 (idx0) and problem-2 (idx3) only.
    const completed = ['problem-1', 'problem-2']
    expect(getHighestSequentialCompletedIndex(completed)).toBe(0)
    expect(getFarthestCompletedIndex(completed)).toBe(3)
    // Continue routes after the farthest completion (idx4).
    expect(getContinueProblemId(completed)).toBe('ev-l2-p2')
  })

  it('reviewing an earlier completed problem does not change continue target', () => {
    const completed = [...L1, 'problem-2']
    const before = getContinueProblemId(completed)
    expect(getContinueProblemId(completed)).toBe(before)
    expect(isProblemCompleted('problem-1', completed)).toBe(true)
  })

  it('restarting an earlier problem (no new completion) leaves progress intact', () => {
    const completed = [...L1, 'problem-2']
    expect(getContinueProblemId(completed)).toBe('ev-l2-p2')
    expect(uniqueCompletedCount(completed)).toBe(4)
  })
})
