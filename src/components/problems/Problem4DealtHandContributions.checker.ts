import {
  areNumbersClose,
  normalizeMoneyAnswer,
} from '../../lib/answerParser'
import type { CheckResult } from '../../types/problem'

/**
 * Local CheckInput for ev-l3-p2 (Dealt-Hand Contributions). Co-located with the
 * component per the Phase-2 contract; integration repoints `problem-4` to this
 * checker via `src/validation/liveCheckers.ts`.
 *
 * `contributions` are the learner-entered value×probability contributions for
 * the three value groups in ASCENDING value order: [value 2, value 4, value 10].
 */
export interface DealtHandCheckInput {
  contributions: [string, string, string]
  evAnswer: string
}

// Ascending value order [2, 4, 10].
const RAW_VALUES = [2, 4, 10]
const EXPECTED_CONTRIBS = [0.5, 1.0, 5.0]
const EXPECTED_EV = 6.5
// Sum of raw card values, the classic "forgot to weight by probability" total.
const UNWEIGHTED_TOTAL = RAW_VALUES.reduce((s, v) => s + v, 0) // 16

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

/** Deterministic checker for the dealt-hand contributions table. No AI. */
export function checkDealtHand(input: DealtHandCheckInput): CheckResult {
  const anyContribEmpty = input.contributions.some((c) => c.trim() === '')
  if (anyContribEmpty || input.evAnswer.trim() === '') {
    return guard('Fill every contribution (value × probability) and the final expected value.')
  }

  const contribs = input.contributions.map((c) => normalizeMoneyAnswer(c))

  for (let i = 0; i < 3; i += 1) {
    const c = contribs[i]
    if (c === null || !areNumbersClose(c, EXPECTED_CONTRIBS[i])) {
      // Entered the raw card value instead of value × probability.
      if (c !== null && areNumbersClose(c, RAW_VALUES[i])) {
        return fail(
          'forgot-to-weight',
          `Weight by probability: the value-${RAW_VALUES[i]} group contributes ${RAW_VALUES[i]} × probability = ${EXPECTED_CONTRIBS[i]}, not the raw value ${RAW_VALUES[i]}.`,
        )
      }
      return fail(
        'arithmetic-error',
        `Contribution = value × probability. Value ${RAW_VALUES[i]} contributes ${EXPECTED_CONTRIBS[i]}.`,
      )
    }
  }

  const evNum = normalizeMoneyAnswer(input.evAnswer)

  // Summed the raw values/counts without weighting by probability (2 + 4 + 10).
  if (evNum !== null && areNumbersClose(evNum, UNWEIGHTED_TOTAL)) {
    return fail(
      'unweighted-sum',
      `You added the raw card values (2 + 4 + 10 = ${UNWEIGHTED_TOTAL}). Expected value adds the weighted contributions: 0.5 + 1.0 + 5.0 = 6.5.`,
    )
  }

  if (evNum === null || !areNumbersClose(evNum, EXPECTED_EV)) {
    return fail('arithmetic-error', 'Add the three contributions: 0.5 + 1.0 + 5.0 = 6.5.')
  }

  return ok('Correct! 2×1/4 = 0.5, 4×1/4 = 1.0, 10×1/2 = 5.0, so EV = 6.5.')
}
