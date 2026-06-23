import { describe, expect, it } from 'vitest'
import { CANONICAL_PROBLEMS } from '../progression/canonical'
import {
  isGradedAttemptMode,
  mergeChapterProgress,
  normalizeAttemptMode,
  normalizeChapterProgress,
  normalizeLessonProgress,
  normalizeProblemProgress,
} from './migration'
import { chapterScopedDocId, legacyChapterScopedDocId } from './docIds'
import type { ChapterProgress } from '../../types/chapter'

const ALL_IDS = CANONICAL_PROBLEMS.map((p) => p.storageId)

describe('Firestore doc-ID derivation', () => {
  it('uses the PRD underscore suffix and a distinct legacy suffix', () => {
    expect(chapterScopedDocId('uid123')).toBe('uid123_expected_value_intro')
    expect(legacyChapterScopedDocId('uid123')).toBe('uid123_expected-value-intro')
  })
})

describe('normalizeChapterProgress', () => {
  it('upgrades a legacy 8-problem document and preserves completion', () => {
    const legacy: Partial<ChapterProgress> = {
      completedProblemIds: ['problem-1', 'problem-2', 'problem-3'],
      currentProblemIndex: 3,
      streakCount: 4,
      lastActiveDate: '2026-01-01',
      // No five-lesson fields at all.
    }
    const out = normalizeChapterProgress(legacy, 'uid')
    expect(out.completedProblemIds).toEqual(['problem-1', 'problem-2', 'problem-3'])
    expect(out.completionPercentage).toBe(15)
    expect(out.completedLessonIds).toEqual([]) // no lesson fully complete
    // problem-3 is the farthest completion (L3), so continue routes after it.
    expect(out.currentLessonId).toBe('lesson-3')
    expect(out.nextProblemId).toBe('problem-4')
    // Only index 0 (problem-1) is reachable with no gaps.
    expect(out.highestSequentialCompletedGlobalIndex).toBe(0)
    expect(out.streakCount).toBe(4)
  })

  it('fills safe defaults for a null/empty document', () => {
    const out = normalizeChapterProgress(null, 'uid')
    expect(out.completedProblemIds).toEqual([])
    expect(out.completionPercentage).toBe(0)
    expect(out.masteryStatus).toBe('Not Started')
    expect(out.nextProblemId).toBe('problem-1')
    expect(out.streakCount).toBe(1)
  })

  it('dedupes completed IDs and recomputes derived fields', () => {
    const out = normalizeChapterProgress(
      { completedProblemIds: ['problem-1', 'problem-1', 'l1-long-run-average'] },
      'uid',
    )
    expect(out.completedProblemIds).toEqual(['problem-1', 'l1-long-run-average'])
    expect(out.completionPercentage).toBe(5) // counted once
  })

  it('derives an all-complete chapter and preserves Mastered status', () => {
    const out = normalizeChapterProgress(
      { completedProblemIds: ALL_IDS, masteryStatus: 'Mastered' },
      'uid',
    )
    expect(out.completionPercentage).toBe(100)
    expect(out.completedLessonIds).toHaveLength(5)
    expect(out.nextProblemId).toBeNull()
    expect(out.nextLessonId).toBeNull()
    expect(out.masteryStatus).toBe('Mastered')
  })
})

describe('mergeChapterProgress (legacy vs new doc)', () => {
  it('chooses the farther-progress record', () => {
    const newer = { completedProblemIds: ['problem-1'], updatedAt: '2026-02-01T00:00:00Z' }
    const legacy = {
      completedProblemIds: ['problem-1', 'problem-2', 'problem-3'],
      updatedAt: '2026-01-01T00:00:00Z',
    }
    const merged = mergeChapterProgress(newer, legacy, 'uid')
    expect(merged.completedProblemIds).toEqual(['problem-1', 'problem-2', 'problem-3'])
  })

  it('unions completions on a tie and recomputes percentage', () => {
    const a = { completedProblemIds: ['problem-1', 'problem-2'], updatedAt: '2026-01-02T00:00:00Z' }
    const b = { completedProblemIds: ['problem-3', 'problem-4'], updatedAt: '2026-01-01T00:00:00Z' }
    const merged = mergeChapterProgress(a, b, 'uid')
    expect(merged.completedProblemIds.sort()).toEqual(
      ['problem-1', 'problem-2', 'problem-3', 'problem-4'].sort(),
    )
    expect(merged.completionPercentage).toBe(20)
  })

  it('handles a missing side', () => {
    expect(mergeChapterProgress(null, { completedProblemIds: ['problem-1'] }, 'uid').completionPercentage).toBe(5)
    expect(mergeChapterProgress({ completedProblemIds: [] }, null, 'uid').completionPercentage).toBe(0)
  })
})

describe('attemptMode normalization', () => {
  it('defaults missing/unknown modes to graded', () => {
    expect(normalizeAttemptMode(undefined)).toBe('graded')
    expect(normalizeAttemptMode(null)).toBe('graded')
    expect(normalizeAttemptMode('graded')).toBe('graded')
    expect(normalizeAttemptMode('corrected_resubmission')).toBe('corrected_resubmission')
    expect(normalizeAttemptMode('practice_restart')).toBe('practice_restart')
  })

  it('treats only practice_restart as non-graded', () => {
    expect(isGradedAttemptMode(undefined)).toBe(true)
    expect(isGradedAttemptMode('graded')).toBe(true)
    expect(isGradedAttemptMode('corrected_resubmission')).toBe(true)
    expect(isGradedAttemptMode('practice_restart')).toBe(false)
  })
})

describe('lesson + problem progress normalization', () => {
  it('fills lesson progress defaults from chapter completion', () => {
    const out = normalizeLessonProgress(null, 'uid', 'lesson-1', ['problem-1'])
    expect(out.lessonId).toBe('lesson-1')
    expect(out.completionPercentage).toBe(25)
    expect(out.lessonCompleted).toBe(false)
  })

  it('marks a fully-completed lesson', () => {
    const L1 = ['problem-1', 'l1-unequal-spinner', 'l1-short-run-vs-long-run', 'l1-compare-spinners']
    const out = normalizeLessonProgress(null, 'uid', 'lesson-1', L1)
    expect(out.completionPercentage).toBe(100)
    expect(out.lessonCompleted).toBe(true)
  })

  it('defaults demo/review/restart fields for a problem progress doc', () => {
    const out = normalizeProblemProgress(null, 'uid', 'lesson-1', 'problem-1')
    expect(out.status).toBe('not_started')
    expect(out.demoSeen).toBe(false)
    expect(out.restartCount).toBe(0)
    expect(out.reviewSnapshot).toBeUndefined()
    expect(out.finalMistakeType).toBeNull()
  })

  it('preserves a stored review snapshot and completed status', () => {
    const out = normalizeProblemProgress(
      {
        status: 'completed',
        demoSeen: true,
        restartCount: 2,
        reviewSnapshot: { submittedAnswer: '5', feedbackKey: 'correct' },
        completedAt: '2026-01-01T00:00:00Z',
      },
      'uid',
      'lesson-1',
      'problem-1',
    )
    expect(out.status).toBe('completed')
    expect(out.demoSeen).toBe(true)
    expect(out.restartCount).toBe(2)
    expect(out.reviewSnapshot?.submittedAnswer).toBe('5')
  })
})
