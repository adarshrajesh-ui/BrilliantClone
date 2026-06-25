import { describe, expect, it } from 'vitest'
import { CANONICAL_PROBLEMS } from '../progression/canonical'
import {
  STRONG_ATTEMPT_THRESHOLD,
  deriveMasteryStatus,
  evaluateChapterMastery,
} from './mastery'

const ALL_IDS = CANONICAL_PROBLEMS.map((p) => p.storageId)
const TOTAL = ALL_IDS.length

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
    expect(deriveMasteryStatus({ completedCount: Math.ceil(TOTAL / 2) - 1, mastered: false })).toBe('Learning')
    expect(deriveMasteryStatus({ completedCount: Math.ceil(TOTAL / 2), mastered: false })).toBe('Developing')
    expect(deriveMasteryStatus({ completedCount: TOTAL, mastered: false })).toBe('Developing')
    expect(deriveMasteryStatus({ completedCount: TOTAL, mastered: true })).toBe('Mastered')
  })
})

describe('evaluateChapterMastery', () => {
  it('is not mastered when fewer than all problems are complete', () => {
    const result = evaluateChapterMastery({
      ...masteredInput(),
      completedProblemIds: ALL_IDS.slice(0, TOTAL - 1),
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

  it('enforces the strong-attempt threshold', () => {
    // 5 problems took 3 graded attempts -> only 9 strong completions in the current chapter.
    const attempts = attemptsFor(1)
    for (const id of ALL_IDS.slice(0, 5)) {
      attempts[id] = 3
    }
    const failing = evaluateChapterMastery({
      ...masteredInput(),
      gradedFinalAttemptsByProblem: attempts,
    })
    expect(failing.strongCompletions).toBe(TOTAL - 5)
    expect(failing.strongThresholdMet).toBe(false)
    expect(failing.mastered).toBe(false)

    // Exactly 3 weak completions -> 11 strong -> threshold met.
    const attempts2 = attemptsFor(1)
    for (const id of ALL_IDS.slice(0, TOTAL - STRONG_ATTEMPT_THRESHOLD)) {
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
    expect(evaluateChapterMastery(masteredInput()).strongCompletions).toBe(TOTAL)
  })
})
