import { describe, expect, it } from 'vitest'
import {
  DIFFICULTY_TARGET_BAND,
  difficultyAccuracyBands,
  dueReviewAccuracy,
  maxInWindow,
  repeatedMistakeBySkill,
  sequenceRepetitionRate,
  summarizePracticeMetrics,
  transferAccuracyAfterSuccess,
  withPracticeMeta,
  wrongToCorrectConversion,
} from './practiceMetrics'
import type { PracticeAttemptMeta, ProblemAttempt } from '../../types/problem'

const BASE = Date.parse('2026-06-25T12:00:00.000Z')
let counter = 0

function practiceMeta(overrides: Partial<PracticeAttemptMeta> = {}): PracticeAttemptMeta {
  return {
    templateKind: 'dice-ev',
    difficulty: 2,
    skillFamily: 'ev-setup',
    selectionReason: 'mixed',
    isReview: false,
    scaffoldTier: 'supported',
    hintCount: 0,
    wasSkipped: false,
    questionStartedAt: '2026-06-25T12:00:00.000Z',
    answeredAt: '2026-06-25T12:00:30.000Z',
    ...overrides,
  }
}

// Each attempt gets a strictly-increasing timestamp in creation order so the
// chronological metrics (conversion, recurrence, transfer) are deterministic.
function attempt(overrides: Partial<ProblemAttempt> & { isCorrect: boolean }): ProblemAttempt {
  counter += 1
  return {
    attemptId: `attempt-${counter}`,
    userId: 'user-1',
    chapterId: 'expected-value-intro',
    problemId: `problem-${counter}`,
    stepId: 'final',
    submittedAnswer: 'x',
    normalizedAnswer: 'x',
    attemptNumber: 1,
    attemptMode: 'practice_restart',
    hintUsed: false,
    mistakeType: null,
    masteryTagsTested: ['long-run-average'],
    createdAt: new Date(BASE + counter * 60_000).toISOString(),
    ...overrides,
  }
}

function practiceAttempt(
  isCorrect: boolean,
  meta: Partial<PracticeAttemptMeta> = {},
  extra: Partial<ProblemAttempt> = {},
): ProblemAttempt {
  return attempt({ isCorrect, practice: practiceMeta(meta), ...extra })
}

describe('withPracticeMeta', () => {
  it('keeps only attempts carrying a practice payload', () => {
    const practice = practiceAttempt(true)
    const chapter = attempt({ isCorrect: true }) // no practice payload
    const records = withPracticeMeta([practice, chapter])

    expect(records).toHaveLength(1)
    expect(records[0].attemptId).toBe(practice.attemptId)
  })
})

describe('dueReviewAccuracy', () => {
  it('counts only no-hint, first-try, due-review attempts', () => {
    const attempts = [
      practiceAttempt(true, { isReview: true, hintCount: 0 }),
      practiceAttempt(false, { isReview: true, hintCount: 0 }),
      // Excluded: a hint was used.
      practiceAttempt(true, { isReview: true, hintCount: 1 }),
      // Excluded: not a review.
      practiceAttempt(true, { isReview: false }),
      // Excluded: a resubmission.
      practiceAttempt(true, { isReview: true, hintCount: 0 }, { attemptNumber: 2 }),
    ]

    expect(dueReviewAccuracy(attempts)).toEqual({ attempts: 2, correct: 1, accuracy: 0.5 })
  })
})

describe('difficultyAccuracyBands', () => {
  it('buckets clean accuracy by difficulty and flags the target band', () => {
    const attempts = [
      ...Array.from({ length: 3 }, () => practiceAttempt(true, { difficulty: 2 })),
      practiceAttempt(false, { difficulty: 2 }),
      practiceAttempt(true, { difficulty: 4 }),
      ...Array.from({ length: 3 }, () => practiceAttempt(false, { difficulty: 4 })),
    ]

    const bands = difficultyAccuracyBands(attempts)

    expect(bands.map((band) => band.difficulty)).toEqual([2, 4])
    const [d2, d4] = bands
    expect(d2.accuracy).toBe(0.75)
    expect(d2.inTargetBand).toBe(true)
    // Difficulty 4 genuinely lowers accuracy, not just the label.
    expect(d4.accuracy).toBe(0.25)
    expect(d4.inTargetBand).toBe(false)
    expect(d4.accuracy).toBeLessThan(DIFFICULTY_TARGET_BAND.min)
  })
})

describe('repeatedMistakeBySkill', () => {
  it('counts a mistakeType as repeated only after its first occurrence for the skill', () => {
    const tags = ['payout-vs-profit']
    const attempts = [
      practiceAttempt(false, {}, { masteryTagsTested: tags, mistakeType: 'answered-payout' }),
      practiceAttempt(false, {}, { masteryTagsTested: tags, mistakeType: 'answered-payout' }),
      practiceAttempt(false, {}, { masteryTagsTested: tags, mistakeType: 'forgot-cost' }),
      practiceAttempt(true, {}, { masteryTagsTested: tags }),
    ]

    const [stat] = repeatedMistakeBySkill(attempts)
    expect(stat.skill).toBe('payout-vs-profit')
    expect(stat.wrong).toBe(3)
    expect(stat.repeated).toBe(1)
    expect(stat.recurrenceRate).toBeCloseTo(1 / 3)
  })
})

describe('wrongToCorrectConversion', () => {
  it('marks a wrong attempt converted when the same skill is later correct', () => {
    const attempts = [
      practiceAttempt(false, {}, { masteryTagsTested: ['skill-a'], mistakeType: 'oops' }),
      practiceAttempt(true, {}, { masteryTagsTested: ['skill-a'] }),
      practiceAttempt(false, {}, { masteryTagsTested: ['skill-b'], mistakeType: 'oops' }),
    ]

    expect(wrongToCorrectConversion(attempts)).toEqual({
      converted: 1,
      wrong: 2,
      conversionRate: 0.5,
    })
  })
})

describe('transferAccuracyAfterSuccess', () => {
  it('measures accuracy on a different template once the family has a success', () => {
    const attempts = [
      // Success seeds the family; not itself a transfer probe.
      practiceAttempt(true, { skillFamily: 'ev-setup', templateKind: 'dice-ev' }),
      // Different template in same family → transfer probe (correct).
      practiceAttempt(true, { skillFamily: 'ev-setup', templateKind: 'fair-price-to-play' }),
      // Different template again → transfer probe (wrong).
      practiceAttempt(false, { skillFamily: 'ev-setup', templateKind: 'fair-price-to-play' }),
    ]

    expect(transferAccuracyAfterSuccess(attempts)).toEqual({
      attempts: 2,
      correct: 1,
      accuracy: 0.5,
    })
  })
})

describe('sequence helpers', () => {
  it('computes repetition rate as 1 - distinct/total', () => {
    expect(sequenceRepetitionRate(['a', 'b', 'a', 'c'])).toBe(0.25)
    expect(sequenceRepetitionRate(['a'])).toBe(0)
    expect(sequenceRepetitionRate([])).toBe(0)
  })

  it('finds the largest same-value count in any sliding window', () => {
    expect(maxInWindow(['a', 'a', 'b', 'a'], 2)).toBe(2)
    expect(maxInWindow(['a', 'b', 'c'], 2)).toBe(1)
  })
})

describe('summarizePracticeMetrics', () => {
  it('bundles every metric and ignores non-practice attempts', () => {
    const attempts = [
      practiceAttempt(true, { isReview: true, templateKind: 'dice-ev', skillFamily: 'ev-setup' }),
      practiceAttempt(false, { templateKind: 'card-hand-ev', skillFamily: 'probability' }),
      attempt({ isCorrect: true }), // chapter attempt, excluded
    ]

    const summary = summarizePracticeMetrics(attempts)

    expect(summary.totalAttempts).toBe(2)
    expect(summary.templateShare['dice-ev']).toBe(0.5)
    expect(summary.familyShare['probability']).toBe(0.5)
    expect(summary.templateRepetitionRate).toBe(0)
    expect(summary.dueReview.attempts).toBe(1)
  })
})
