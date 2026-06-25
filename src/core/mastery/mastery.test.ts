import { describe, expect, it } from 'vitest'
import { CANONICAL_PROBLEMS } from '../progression/canonical'
import {
  STRONG_ATTEMPT_THRESHOLD,
  deriveMasteryStatus,
  evaluateChapterMastery,
} from './mastery'

const ALL_IDS = CANONICAL_PROBLEMS.map((p) => p.storageId)

// Keyed by STORAGE ID (the form persisted in completedProblemIds / attempts).
const REQUIRED = {
  capstone: 'ev-l5-p3', // ev-l5-p3
  payout: 'problem-5', // ev-l4-p1
  risk: 'problem-8', // ev-l5-p2
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
    expect(deriveMasteryStatus({ completedCount: 7, mastered: false })).toBe('Learning')
    // ceil(15/2) = 8 is the Developing threshold.
    expect(deriveMasteryStatus({ completedCount: 8, mastered: false })).toBe('Developing')
    expect(deriveMasteryStatus({ completedCount: 15, mastered: false })).toBe('Developing')
    expect(deriveMasteryStatus({ completedCount: 15, mastered: true })).toBe('Mastered')
  })
})

describe('evaluateChapterMastery', () => {
  it('is not mastered when fewer than 15 are complete', () => {
    const result = evaluateChapterMastery({
      ...masteredInput(),
      completedProblemIds: ALL_IDS.slice(0, 14),
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

  it('enforces the 11-of-15 strong-attempt threshold', () => {
    // 5 problems took 3 graded attempts -> only 10 strong completions.
    const attempts = attemptsFor(1)
    for (const id of ALL_IDS.slice(0, 5)) {
      attempts[id] = 3
    }
    const failing = evaluateChapterMastery({
      ...masteredInput(),
      gradedFinalAttemptsByProblem: attempts,
    })
    expect(failing.strongCompletions).toBe(10)
    expect(failing.strongThresholdMet).toBe(false)
    expect(failing.mastered).toBe(false)

    // Exactly 4 weak completions -> 11 strong -> threshold met.
    const attempts2 = attemptsFor(1)
    for (const id of ALL_IDS.slice(0, 4)) {
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
    expect(evaluateChapterMastery(masteredInput()).strongCompletions).toBe(15)
  })
})
