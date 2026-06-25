import {
  areNumbersClose,
  areProbabilitiesEquivalent,
  matchesNumeric,
  normalizeNumericAnswer,
} from '../../lib/answerParser'
import type { CheckResult } from '../../types/problem'

/**
 * Local CheckInput for ev-l3-p3 (Mini-Deck EV Table). Defined here (co-located
 * with the component) per the Phase-2 contract — never imported from the old
 * prize-bag checker.
 */
export interface MiniDeckRow {
  count: string
  probability: string
  contribution: string
}

/** Rows are in ascending value order [1, 7, 10]. */
export interface MiniDeckCheckInput {
  rows: [MiniDeckRow, MiniDeckRow, MiniDeckRow]
  evAnswer: string
}

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

const VALUES = [1, 7, 10]
const EXPECTED_COUNTS = [3, 3, 4]
const EXPECTED_PROBS = [3 / 10, 3 / 10, 4 / 10]
const EXPECTED_CONTRIBS = [0.3, 2.1, 4.0]
const TOTAL_CARDS = 10
const EV = 6.4
/** Sum of raw card values (3×1 + 3×7 + 4×10 = 64) — a common "didn't divide" slip. */
const TOTAL_CARD_VALUE = 64

/** Accept decimal/money/fraction numeric answers, but not percent forms for non-probability cells. */
function normalizeTableNumber(value: string): number | null {
  if (value.trim().endsWith('%')) {
    return null
  }
  return normalizeNumericAnswer(value)
}

/** Accept EV as decimal, money, or fraction (e.g. 32/5). */
function evMatches(value: string, target: number): boolean {
  if (matchesNumeric(value, [target])) {
    return true
  }
  const parsed = normalizeTableNumber(value)
  return parsed !== null && areNumbersClose(parsed, target)
}

/** Deterministic checker for the full mini-deck table. No AI / semantic matching. */
export function checkMiniDeck(input: MiniDeckCheckInput): CheckResult {
  const counts = input.rows.map((r) => normalizeTableNumber(r.count))
  const contribs = input.rows.map((r) => normalizeTableNumber(r.contribution))

  const allFilled = input.rows.every(
    (r) => r.count.trim() !== '' && r.probability.trim() !== '' && r.contribution.trim() !== '',
  )
  if (!allFilled) {
    return guard('Fill every cell: count, probability, and contribution for all three rows.')
  }

  for (let i = 0; i < 3; i += 1) {
    const row = input.rows[i]

    // 1) Count must match the number of cards with that value.
    if (counts[i] === null || !areNumbersClose(counts[i] as number, EXPECTED_COUNTS[i], 0.001)) {
      return fail(
        'arithmetic-error',
        `Recount the value-${VALUES[i]} cards — there are ${EXPECTED_COUNTS[i]} of them in the 10-card deck.`,
      )
    }

    // 2) Probability must equal count ÷ 10.
    if (!areProbabilitiesEquivalent(row.probability, EXPECTED_PROBS[i])) {
      const rawProb = normalizeNumericAnswer(row.probability)
      // Typed the raw count (e.g. "3") into the probability cell.
      if (rawProb !== null && areNumbersClose(rawProb, EXPECTED_COUNTS[i], 0.001)) {
        return fail(
          'count-probability-confusion',
          `You entered ${EXPECTED_COUNTS[i]} as the probability for value ${VALUES[i]} — that is the card count. Probability = ${EXPECTED_COUNTS[i]}/10.`,
        )
      }
      return fail(
        'wrong-denominator',
        `Probability = cards with that value ÷ 10 total cards. Value ${VALUES[i]} appears on ${EXPECTED_COUNTS[i]} of 10 cards, so ${EXPECTED_COUNTS[i]}/10.`,
      )
    }

    // 3) Contribution must equal value × probability.
    if (contribs[i] === null || !areNumbersClose(contribs[i] as number, EXPECTED_CONTRIBS[i])) {
      // A paying row was left at 0 (omitted from the weighted sum).
      if (areNumbersClose(contribs[i] ?? NaN, 0, 0.001)) {
        return fail(
          'omitted-row',
          `Value ${VALUES[i]} still contributes to the EV: ${VALUES[i]} × ${EXPECTED_COUNTS[i]}/10 = ${EXPECTED_CONTRIBS[i]}. Don't drop it from the sum.`,
        )
      }
      return fail(
        'arithmetic-error',
        `Contribution = value × probability. ${VALUES[i]} × ${EXPECTED_COUNTS[i]}/10 = ${EXPECTED_CONTRIBS[i]}.`,
      )
    }
  }

  // 4) Final EV. Reject the common "sum of raw card values" answer (64).
  if (matchesNumeric(input.evAnswer, [TOTAL_CARD_VALUE])) {
    return fail(
      'used-total-card-value',
      `You added the raw card values (${TOTAL_CARD_VALUE} for all ${TOTAL_CARDS} cards). EV is per draw — add the contributions: 0.3 + 2.1 + 4.0 = 6.4.`,
    )
  }
  if (!evMatches(input.evAnswer, EV)) {
    return fail('arithmetic-error', 'Add the three contributions: 0.3 + 2.1 + 4.0 = 6.4.')
  }

  return ok('Correct! 1×3/10=0.3, 7×3/10=2.1, 10×4/10=4.0, so EV = 6.4.')
}
