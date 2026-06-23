import { describe, expect, it } from 'vitest'
import { CANONICAL_PROBLEMS } from '../progression/canonical'
import {
  STRONG_ATTEMPT_THRESHOLD,
  deriveMasteryStatus,
  evaluateChapterMastery,
} from './mastery'

const ALL_IDS = CANONICAL_PROBLEMS.map((p) => p.storageId)

const REQUIRED = {
  capstone: 'l5-final-capstone-ev-decision',
  fullModel: 'problem-7',
  payout: 'problem-5',
  risk: 'problem-8',
}

function allCorrect(): Record<string, boolean> {
  const map: Record<string, boolean> = {}
  for (const id of ALL_IDS) {
    map[id] = true
  }
  return map
}

/** All problems solved in `attempts` graded attempts each. */
function attemptsFor(count: number): Record<string, number> {
  const map: Record<string, number> = {}
  for (const id of ALL_IDS) {
    map[id] = count
  }
  return map
}

function masteredInput() {
  return {
    completedProblemIds: ALL_IDS,
    correctByProblem: allCorrect(),
    gradedFinalAttemptsByProblem: attemptsFor(1),
  }
}

describe('deriveMasteryStatus', () => {
  it('maps completion count + mastered flag to a coarse status', () => {
    expect(deriveMasteryStatus({ completedCount: 0, mastered: false })).toBe('Not Started')
    expect(deriveMasteryStatus({ completedCount: 1, mastered: false })).toBe('Learning')
    expect(deriveMasteryStatus({ completedCount: 10, mastered: false })).toBe('Developing')
    expect(deriveMasteryStatus({ completedCount: 20, mastered: false })).toBe('Developing')
    expect(deriveMasteryStatus({ completedCount: 20, mastered: true })).toBe('Mastered')
  })
})

describe('evaluateChapterMastery', () => {
  it('is not mastered when fewer than 20 are complete', () => {
    const result = evaluateChapterMastery({
      ...masteredInput(),
      completedProblemIds: ALL_IDS.slice(0, 19),
    })
    expect(result.allComplete).toBe(false)
    expect(result.mastered).toBe(false)
  })

  it('masters when all conditions are met', () => {
    expect(evaluateChapterMastery(masteredInput()).mastered).toBe(true)
  })

  it('is not mastered when the capstone is not correct', () => {
    const correct = allCorrect()
    correct[REQUIRED.capstone] = false
    const result = evaluateChapterMastery({ ...masteredInput(), correctByProblem: correct })
    expect(result.capstoneCorrect).toBe(false)
    expect(result.mastered).toBe(false)
  })

  it('is not mastered when payout/profit distinction is missing', () => {
    const correct = allCorrect()
    correct[REQUIRED.payout] = false
    expect(evaluateChapterMastery({ ...masteredInput(), correctByProblem: correct }).mastered).toBe(
      false,
    )
  })

  it('is not mastered when the same-EV-vs-risk distinction is missing', () => {
    const correct = allCorrect()
    correct[REQUIRED.risk] = false
    expect(evaluateChapterMastery({ ...masteredInput(), correctByProblem: correct }).mastered).toBe(
      false,
    )
  })

  it('is not mastered when the full-model problem is missing', () => {
    const correct = allCorrect()
    correct[REQUIRED.fullModel] = false
    expect(evaluateChapterMastery({ ...masteredInput(), correctByProblem: correct }).mastered).toBe(
      false,
    )
  })

  it('enforces the 15-of-20 strong-attempt threshold', () => {
    // 6 problems took 3 graded attempts -> only 14 strong completions.
    const attempts = attemptsFor(1)
    for (const id of ALL_IDS.slice(0, 6)) {
      attempts[id] = 3
    }
    const failing = evaluateChapterMastery({
      ...masteredInput(),
      gradedFinalAttemptsByProblem: attempts,
    })
    expect(failing.strongCompletions).toBe(14)
    expect(failing.strongThresholdMet).toBe(false)
    expect(failing.mastered).toBe(false)

    // Exactly 5 weak completions -> 15 strong -> threshold met.
    const attempts2 = attemptsFor(1)
    for (const id of ALL_IDS.slice(0, 5)) {
      attempts2[id] = 3
    }
    const passing = evaluateChapterMastery({
      ...masteredInput(),
      gradedFinalAttemptsByProblem: attempts2,
    })
    expect(passing.strongCompletions).toBe(STRONG_ATTEMPT_THRESHOLD)
    expect(passing.mastered).toBe(true)
  })

  it('practice restarts (excluded by caller) do not reduce strong completions', () => {
    // The graded-attempt map already excludes practice restarts, so a problem
    // with 1 graded attempt stays "strong" no matter how many times it is
    // practiced afterwards.
    expect(evaluateChapterMastery(masteredInput()).strongCompletions).toBe(20)
  })
})
