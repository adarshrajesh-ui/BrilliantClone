import { normalizeMoneyAnswer, areNumbersClose } from '../../lib/answerParser'
import type { CheckResult } from '../../types/problem'

/**
 * Local CheckInput for ev-l4-p1 (Pay to Play). Defined here rather than in the
 * shared `types/problem.ts` (owned by Agent 1); listed in the handoff so Agent 1
 * can reconcile with the existing `Problem5CheckInput` in the union.
 *
 * `costPlaced` is the completion gate — the profit answer cannot be graded until
 * the $3 cost token is in the slot.
 */
export interface EvL4P1CheckInput {
  costPlaced: boolean
  profitAnswer: string
}

const EXPECTED_PAYOUT = 4
const COST = 3
const EXPECTED_PROFIT = EXPECTED_PAYOUT - COST // 1

const ok = (feedback: string): CheckResult => ({
  isCorrect: true,
  mistakeType: null,
  feedback,
  canComplete: true,
})

const fail = (mistakeType: string, feedback: string): CheckResult => ({
  isCorrect: false,
  mistakeType,
  feedback,
  canComplete: false,
})

const guard = (feedback: string): CheckResult => ({
  isCorrect: false,
  mistakeType: '',
  feedback,
  canComplete: false,
})

/**
 * Deterministic checker for expected profit. Covers the four PRD mistake types:
 * answered-payout | added-cost | cost-as-probability | reversed-subtraction.
 */
export function checkEvL4P1(input: EvL4P1CheckInput): CheckResult {
  if (!input.costPlaced) {
    return guard('Place the $3 cost token in the slot before entering expected profit.')
  }

  const profit = normalizeMoneyAnswer(input.profitAnswer)
  if (profit === null) {
    return guard('Enter the expected profit in dollars.')
  }

  if (areNumbersClose(profit, EXPECTED_PAYOUT)) {
    return fail('answered-payout', 'You repeated expected payout ($4). Subtract the $3 cost to get expected profit.')
  }
  if (areNumbersClose(profit, EXPECTED_PAYOUT + COST)) {
    return fail('added-cost', 'Cost reduces profit. Use payout − cost ($4 − $3), not payout + cost.')
  }
  if (areNumbersClose(profit, COST - EXPECTED_PAYOUT)) {
    return fail('reversed-subtraction', 'You computed cost − payout. Expected profit is payout − cost = $4 − $3 = $1.')
  }
  // A fractional answer strictly between 0 and 1 means the cost was treated as a
  // probability (e.g. 3/4) instead of being subtracted in dollars.
  if (profit > 0 && profit < 1) {
    return fail('cost-as-probability', 'Cost is subtracted in dollars, not used as a probability. Expected profit = $4 − $3 = $1.')
  }

  if (!areNumbersClose(profit, EXPECTED_PROFIT)) {
    return fail('unknown', 'Expected profit = expected payout − cost = $4 − $3 = $1.')
  }

  return ok('Correct! Expected profit = $4 − $3 = $1.')
}
