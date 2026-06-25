import { normalizeClassificationAnswer } from './answerParser'
import type { CheckResult, Problem6CheckInput } from '../types/problem'

const ok = (feedback: string, canComplete = false): CheckResult => ({
  isCorrect: canComplete,
  mistakeType: null,
  feedback,
  canComplete,
})

const fail = (mistakeType: string, feedback: string): CheckResult => ({
  isCorrect: false,
  mistakeType,
  feedback,
  canComplete: false,
})

/**
 * A graded attempt is a real evaluation of the learner's answer. A "guard"
 * result (not correct, with no mistakeType) means the learner hasn't finished
 * entering an answer yet — e.g. "fill all fields" / "run 100 spins" — and must
 * NOT count toward the attempt total that mastery depends on.
 */
export function isGradedAttempt(result: CheckResult): boolean {
  if (result.isCorrect) {
    return true
  }
  return Boolean(result.mistakeType && result.mistakeType.length > 0)
}

export function checkProblem6(input: Problem6CheckInput): CheckResult {
  const { assignments } = input
  const required = ['A', 'B', 'C']
  if (!required.every((g) => assignments[g])) {
    return fail('', 'Place all three game cards into buckets.')
  }

  const correct = { A: 'fair', B: 'favorable', C: 'unfavorable' }
  for (const g of required) {
    const placed = normalizeClassificationAnswer(assignments[g])
    if (placed !== correct[g as keyof typeof correct]) {
      if (placed === 'favorable' && g === 'A') {
        return fail('confused-fair-favorable', 'Game A: payout $5 − cost $5 = $0. Fair means expected profit is exactly $0, not favorable.')
      }
      if (placed === 'favorable' && g === 'C') {
        return fail('positive-payout-favorable', 'Game C: payout $3 − cost $5 = −$2. A positive payout alone is not favorable — subtract the cost.')
      }
      return fail('forgot-subtract-cost', 'Expected profit = payout − cost. A = $0 (fair), B = +$2 (favorable), C = −$2 (unfavorable).')
    }
  }

  return ok('Correct! A is fair ($0), B is favorable (+$2), C is unfavorable (−$2).', true)
}
