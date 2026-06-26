import { describe, expect, it } from 'vitest'
import { buildPracticeCandidates } from './problemIndex'
import { deriveSkillStates } from './masteryModel'
import { selectPracticeRecommendations } from './selector'
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
