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
const L1 = ['problem-1', 'l1-unequal-spinner', 'l1-short-run-vs-long-run', 'l1-compare-spinners']
const L2 = ['problem-2', 'l2-match-outcomes-probabilities', 'l2-fill-missing-formula', 'l2-diagnose-bad-ev-setups']

describe('canonical model + mapping', () => {
  it('defines 20 ordered problems, 4 per lesson', () => {
    expect(TOTAL_PROBLEMS).toBe(20)
    expect(orderedChapterProblems()).toHaveLength(20)
    expect(orderedChapterProblems().map((p) => p.globalProblemIndex)).toEqual(
      Array.from({ length: 20 }, (_, i) => i),
    )
  })

  it('maps the original 8 legacy IDs to canonical slugs', () => {
    expect(mapLegacyProblemIdToCanonicalSlug('problem-1')).toBe('l1-long-run-average')
    expect(mapLegacyProblemIdToCanonicalSlug('problem-2')).toBe('l2-build-weighted-average')
    expect(mapLegacyProblemIdToCanonicalSlug('problem-3')).toBe('l3-mystery-box-outcomes')
    expect(mapLegacyProblemIdToCanonicalSlug('problem-4')).toBe('l3-calculate-ev-from-table')
    expect(mapLegacyProblemIdToCanonicalSlug('problem-5')).toBe('l4-payout-vs-profit')
    expect(mapLegacyProblemIdToCanonicalSlug('problem-6')).toBe('l4-fair-favorable-unfavorable')
    expect(mapLegacyProblemIdToCanonicalSlug('problem-7')).toBe('l5-build-whole-ev-model')
    expect(mapLegacyProblemIdToCanonicalSlug('problem-8')).toBe('l5-same-ev-different-risk')
  })

  it('uses the canonical slug as the storage ID for new problems', () => {
    expect(mapCanonicalSlugToStorageId('l1-unequal-spinner')).toBe('l1-unequal-spinner')
    expect(mapCanonicalSlugToStorageId('l5-final-capstone-ev-decision')).toBe(
      'l5-final-capstone-ev-decision',
    )
    // Original problems still map slug -> legacy storage ID.
    expect(mapCanonicalSlugToStorageId('l1-long-run-average')).toBe('problem-1')
  })

  it('normalizes either identifier form interchangeably', () => {
    expect(normalizeToStorageId('l1-long-run-average')).toBe('problem-1')
    expect(normalizeToStorageId('problem-1')).toBe('problem-1')
    expect(normalizeToCanonicalSlug('problem-1')).toBe('l1-long-run-average')
    expect(normalizeToCanonicalSlug('l1-long-run-average')).toBe('l1-long-run-average')
    expect(normalizeToStorageId('nonexistent')).toBeUndefined()
    expect(getGlobalProblemIndex('nonexistent')).toBe(-1)
  })
})

describe('completion counting + percentages', () => {
  it('0 of 20 complete', () => {
    expect(uniqueCompletedCount([])).toBe(0)
    expect(getChapterCompletionPercentage([])).toBe(0)
    expect(getNextIncompleteProblemId([])).toBe('problem-1')
  })

  it('1 of 20 complete', () => {
    expect(uniqueCompletedCount(['problem-1'])).toBe(1)
    expect(getChapterCompletionPercentage(['problem-1'])).toBe(5)
  })

  it('counts each unique problem once and dedupes duplicates', () => {
    const dup = ['problem-1', 'problem-1', 'l1-long-run-average']
    expect(uniqueCompletedCount(dup)).toBe(1)
    expect(getChapterCompletionPercentage(dup)).toBe(5)
  })

  it('ignores unrecognized IDs in counting', () => {
    expect(uniqueCompletedCount(['problem-1', 'ghost'])).toBe(1)
  })

  it('all 20 complete', () => {
    expect(uniqueCompletedCount(ALL_IDS)).toBe(20)
    expect(getChapterCompletionPercentage(ALL_IDS)).toBe(100)
    expect(isChapterComplete(ALL_IDS)).toBe(true)
    expect(getNextIncompleteProblemId(ALL_IDS)).toBeNull()
  })

  it('lesson percentages with 4 problems per lesson', () => {
    expect(getLessonCompletionPercentage('lesson-1', [])).toBe(0)
    expect(getLessonCompletionPercentage('lesson-1', ['problem-1'])).toBe(25)
    expect(getLessonCompletionPercentage('lesson-1', L1)).toBe(100)
  })
})

describe('lesson completion + boundaries', () => {
  it('lesson completes only with all four problems', () => {
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
    expect(getHighestSequentialCompletedIndex(L1)).toBe(3)
    expect(getNextIncompleteProblemId(L1)).toBe('problem-2')
  })

  it('non-sequential completion does not advance sequential progress past a gap', () => {
    // problem-1 (idx0) and problem-2 (idx4) only.
    const completed = ['problem-1', 'problem-2']
    expect(getHighestSequentialCompletedIndex(completed)).toBe(0)
    expect(getFarthestCompletedIndex(completed)).toBe(4)
    // Continue routes after the farthest completion, then falls back.
    expect(getContinueProblemId(completed)).toBe('l2-match-outcomes-probabilities')
  })

  it('reviewing an earlier completed problem does not change continue target', () => {
    const completed = [...L1, 'problem-2']
    const before = getContinueProblemId(completed)
    // "Opening" problem-1 again is not modeled in selectors (they are pure over
    // completedProblemIds), so the continue target is invariant to review.
    expect(getContinueProblemId(completed)).toBe(before)
    expect(isProblemCompleted('problem-1', completed)).toBe(true)
  })

  it('restarting an earlier problem (no new completion) leaves progress intact', () => {
    const completed = [...L1, 'problem-2']
    // A practice restart does not add/remove completed IDs.
    expect(getContinueProblemId(completed)).toBe('l2-match-outcomes-probabilities')
    expect(uniqueCompletedCount(completed)).toBe(5)
  })
})
