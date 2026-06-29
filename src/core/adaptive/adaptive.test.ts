import { describe, expect, it } from 'vitest'
import { buildPracticeCandidates } from './problemIndex'
import { createInitialSkillState, deriveSkillStates, updateSkillState } from './masteryModel'
import { selectPracticeRecommendations } from './selector'
import { scaffoldTierForScore } from './scheduler'
import type { AdaptiveSnapshot } from './types'
import type { ProblemAttempt } from '../../types/problem'

const NOW = '2026-06-25T12:00:00.000Z'

function attempt(
  overrides: Partial<ProblemAttempt> & Pick<ProblemAttempt, 'problemId' | 'isCorrect' | 'masteryTagsTested'>,
): ProblemAttempt {
  const { problemId, isCorrect, masteryTagsTested, ...rest } = overrides
  return {
    attemptId: `attempt-${Math.random()}`,
    userId: 'user-1',
    chapterId: 'expected-value-intro',
    problemId,
    stepId: 'final',
    submittedAnswer: 'answer',
    normalizedAnswer: 'answer',
    isCorrect,
    attemptNumber: 1,
    attemptMode: 'graded',
    hintUsed: false,
    mistakeType: null,
    masteryTagsTested,
    createdAt: '2026-06-24T12:00:00.000Z',
    ...rest,
  }
}

describe('adaptive practice', () => {
  it('derives weak skill state from repeated graded mistakes', () => {
    const states = deriveSkillStates([
      attempt({
        problemId: 'problem-5',
        isCorrect: false,
        mistakeType: 'answered-payout',
        masteryTagsTested: ['payout-vs-profit'],
      }),
      attempt({
        problemId: 'problem-5',
        isCorrect: false,
        mistakeType: 'answered-payout',
        masteryTagsTested: ['payout-vs-profit'],
        createdAt: '2026-06-24T12:05:00.000Z',
      }),
    ], NOW)

    expect(states['payout-vs-profit'].score).toBeLessThan(0.2)
    expect(states['payout-vs-profit'].recentMistakeTypes).toEqual(['answered-payout'])
  })

  it('gives practice restarts a small boost without matching graded attempts', () => {
    const states = deriveSkillStates([
      attempt({
        problemId: 'problem-8',
        isCorrect: true,
        attemptMode: 'practice_restart',
        masteryTagsTested: ['same-ev-different-risk'],
      }),
    ], NOW)

    expect(states['same-ev-different-risk'].score).toBe(0.26)
  })

  it('selects deterministically with stable tie breaks', () => {
    const snapshot: AdaptiveSnapshot = {
      attempts: [],
      completedProblemIds: [],
      skillStates: deriveSkillStates([], NOW),
    }
    const firstRun = selectPracticeRecommendations(snapshot, {
      candidates: buildPracticeCandidates(),
      nowIso: NOW,
      limit: 3,
    }).map((item) => item.problemId)
    const secondRun = selectPracticeRecommendations(snapshot, {
      candidates: buildPracticeCandidates(),
      nowIso: NOW,
      limit: 3,
    }).map((item) => item.problemId)

    expect(secondRun).toEqual(firstRun)
    expect(firstRun[0]).toBe('problem-1')
  })

  it('prioritizes a weak due skill over the cold-start first problem', () => {
    const states = deriveSkillStates([
      attempt({
        problemId: 'problem-5',
        isCorrect: false,
        mistakeType: 'answered-payout',
        masteryTagsTested: ['payout-vs-profit'],
        createdAt: '2026-06-25T11:30:00.000Z',
      }),
    ], NOW)
    const recommendations = selectPracticeRecommendations(
      {
        attempts: [],
        completedProblemIds: [],
        skillStates: states,
      },
      {
        candidates: buildPracticeCandidates(),
        nowIso: NOW,
        limit: 1,
      },
    )

    expect(recommendations[0]?.primarySkillId).toBe('payout-vs-profit')
  })
})

describe('scaffoldTierForScore', () => {
  it('returns guided below 0.4', () => {
    expect(scaffoldTierForScore(0)).toBe('guided')
    expect(scaffoldTierForScore(0.2)).toBe('guided')
    expect(scaffoldTierForScore(0.39)).toBe('guided')
    expect(scaffoldTierForScore(0.399)).toBe('guided')
  })

  it('returns supported across the 0.4–0.7 band (both boundaries inclusive)', () => {
    expect(scaffoldTierForScore(0.4)).toBe('supported') // lower bound is NOT guided
    expect(scaffoldTierForScore(0.5)).toBe('supported')
    expect(scaffoldTierForScore(0.55)).toBe('supported')
    expect(scaffoldTierForScore(0.7)).toBe('supported') // upper bound is NOT independent
  })

  it('returns independent above 0.7', () => {
    expect(scaffoldTierForScore(0.701)).toBe('independent')
    expect(scaffoldTierForScore(0.8)).toBe('independent')
    expect(scaffoldTierForScore(1)).toBe('independent')
  })

  it('clamps out-of-range scores into the end tiers', () => {
    expect(scaffoldTierForScore(-1)).toBe('guided')
    expect(scaffoldTierForScore(2)).toBe('independent')
  })
})

describe('updateSkillState', () => {
  const NOW = '2026-06-25T12:00:00.000Z'

  it('raises score and pushes the next review out for a correct graded attempt', () => {
    const initial = createInitialSkillState('weighted-average', NOW)
    const practicedAt = '2026-06-25T11:00:00.000Z'
    const updated = updateSkillState(
      initial,
      attempt({
        problemId: 'problem-1',
        isCorrect: true,
        masteryTagsTested: ['weighted-average'],
        createdAt: practicedAt,
      }),
    )

    expect(updated.score).toBeGreaterThan(initial.score)
    expect(updated.consecutiveCorrect).toBe(1)
    expect(updated.evidenceCount).toBe(1)
    // Correct → rescheduled forward (a full day out at this score), not ~10 min.
    expect(new Date(updated.nextReviewAt).getTime()).toBeGreaterThan(
      new Date(practicedAt).getTime(),
    )
    expect(updated.nextReviewAt).toBe('2026-06-26T11:00:00.000Z')
  })

  it('lowers score and schedules a ~10-minute retry for a wrong graded attempt', () => {
    const initial = createInitialSkillState('weighted-average', NOW)
    const practicedAt = '2026-06-25T11:00:00.000Z'
    const updated = updateSkillState(
      initial,
      attempt({
        problemId: 'problem-1',
        isCorrect: false,
        mistakeType: 'arithmetic-error',
        masteryTagsTested: ['weighted-average'],
        createdAt: practicedAt,
      }),
    )

    expect(updated.score).toBeLessThan(initial.score)
    expect(updated.consecutiveCorrect).toBe(0)
    // Wrong → comes back in ~10 minutes regardless of score.
    const tenMinutesMs = 10 * 60 * 1000
    expect(new Date(updated.nextReviewAt).getTime()).toBe(
      new Date(practicedAt).getTime() + tenMinutesMs,
    )
  })

  it('pulls a repeated same-mistake skill forward sooner (5 vs 10 minutes)', () => {
    const initial = createInitialSkillState('weighted-average', NOW)
    const firstMiss = updateSkillState(
      initial,
      attempt({
        problemId: 'problem-1',
        isCorrect: false,
        mistakeType: 'unweighted-sum',
        masteryTagsTested: ['weighted-average'],
        createdAt: '2026-06-25T11:00:00.000Z',
      }),
    )
    // The SAME mistake type again schedules the retry at 5 minutes, not 10.
    const practicedAt = '2026-06-25T11:20:00.000Z'
    const repeated = updateSkillState(
      firstMiss,
      attempt({
        problemId: 'problem-2',
        isCorrect: false,
        mistakeType: 'unweighted-sum',
        masteryTagsTested: ['weighted-average'],
        createdAt: practicedAt,
      }),
    )

    const fiveMinutesMs = 5 * 60 * 1000
    expect(new Date(repeated.nextReviewAt).getTime()).toBe(
      new Date(practicedAt).getTime() + fiveMinutesMs,
    )
  })

  it('matches what deriveSkillStates replays for the same single attempt', () => {
    const single = attempt({
      problemId: 'problem-1',
      isCorrect: true,
      masteryTagsTested: ['weighted-average'],
      createdAt: '2026-06-25T11:00:00.000Z',
    })
    const derived = deriveSkillStates([single], NOW)

    expect(derived['weighted-average']).toEqual(
      updateSkillState(createInitialSkillState('weighted-average', NOW), single),
    )
  })
})
