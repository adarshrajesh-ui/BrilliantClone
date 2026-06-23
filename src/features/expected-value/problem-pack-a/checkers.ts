// Deterministic answer checkers for Problem Pack A (Problems 1–10).
//
// Pure functions: each returns a CheckResult. No AI, no semantic matching, no
// randomness. Completion never depends on a random simulation landing on EV.
// Normalization is delegated to the shared, stable answerParser helpers.

import {
  approxEqual,
  areNumbersClose,
  areProbabilitiesEquivalent,
  normalizeMoneyAnswer,
  normalizeNumericAnswer,
  parseProbabilityAnswer,
} from '../../../lib/answerParser'
import type {
  BuildWeightedAverageInput,
  CalculateEvFromTableInput,
  CheckResult,
  CompareSpinnersInput,
  DiagnoseBadSetupsInput,
  FillMissingFormulaInput,
  LongRunAverageInput,
  MatchOutcomesInput,
  MysteryBoxInput,
  ShortRunVsLongRunInput,
  UnequalSpinnerInput,
} from './types'

// ---------------------------------------------------------------------------
// Result builders
// ---------------------------------------------------------------------------

const ok = (feedback: string): CheckResult => ({
  isCorrect: true,
  mistakeType: null,
  feedback,
  canComplete: true,
})

/** A non-graded guard: learner hasn't finished entering an answer yet. */
const guard = (feedback: string): CheckResult => ({
  isCorrect: false,
  mistakeType: '',
  feedback,
  canComplete: false,
})

const fail = (mistakeType: string, feedback: string): CheckResult => ({
  isCorrect: false,
  mistakeType,
  feedback,
  canComplete: false,
})

/**
 * A graded attempt is a real evaluation (correct, or wrong with a mistakeType).
 * Mirrors the shared isGradedAttempt policy so Agent 1 can rely on it without
 * importing the shared checker module.
 */
export function isPackGradedAttempt(result: CheckResult): boolean {
  if (result.isCorrect) {
    return true
  }
  return Boolean(result.mistakeType && result.mistakeType.length > 0)
}

// Small text normalizers (pack-local; no AI / semantic matching).
function normToken(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
}

// ---------------------------------------------------------------------------
// Lesson 1, Problem 1 — l1-long-run-average  (storage id: problem-1)
// ---------------------------------------------------------------------------

export function checkLongRunAverage(input: LongRunAverageInput): CheckResult {
  if (!input.predictionSubmitted) {
    return guard('Submit your prediction before spinning.')
  }
  if (input.totalSpins < 100) {
    return guard(`Run at least 100 total spins (${input.totalSpins}/100).`)
  }
  const value = normalizeMoneyAnswer(input.finalAnswer)
  if (value === null) {
    return guard('Choose the long-run average based on what you observed.')
  }
  if (areNumbersClose(value, 5)) {
    return ok(
      'Correct — $5 is the long-run average. Equal chances of $0 and $10 balance halfway between the two outcomes.',
    )
  }
  if (areNumbersClose(value, 0)) {
    return fail(
      'chose-extreme-outcome',
      'You chose one possible result, but expected value is not the outcome of one spin. It is the average over many spins. Since $0 and $10 are equally likely, look for the midpoint between them.',
    )
  }
  if (areNumbersClose(value, 10)) {
    return fail(
      'selected-largest-payout',
      'You picked the largest possible payout. The biggest prize is not the average — with $0 just as likely as $10, the long-run average sits halfway between them at $5.',
    )
  }
  return fail(
    'assumed-sample-equals-ev',
    'That looks like a value a short run happened to show. A single sample average does not equal the theoretical expected value. Run more spins and read the midpoint between $0 and $10.',
  )
}

// ---------------------------------------------------------------------------
// Lesson 1, Problem 2 — l1-unequal-spinner  (storage id: l1-unequal-spinner)
// ---------------------------------------------------------------------------

export function checkUnequalSpinner(input: UnequalSpinnerInput): CheckResult {
  if (!input.predictionSubmitted) {
    return guard('Submit your prediction before spinning.')
  }
  if (input.totalSpins < 100) {
    return guard(`Run at least 100 total spins (${input.totalSpins}/100).`)
  }
  const value = normalizeMoneyAnswer(input.finalAnswer)
  if (value === null) {
    return guard('Enter the long-run average for this spinner.')
  }
  if (areNumbersClose(value, 5)) {
    return ok('Correct — $20 × 0.25 + $0 × 0.75 = $5. Section size is probability, so the rare $20 still averages to $5.')
  }
  if (areNumbersClose(value, 20)) {
    return fail(
      'selected-largest-payout',
      'You used the largest payout. The $20 outcome only happens one quarter of the time, so it cannot be the average. Multiply $20 by 0.25 and add the $0 outcome.',
    )
  }
  if (areNumbersClose(value, 0.8)) {
    return fail(
      'misapplied-probability',
      'You divided $20 by 25 instead of multiplying by the probability. A 25% chance means multiply by 0.25, not divide by 25. Compute 20 × 0.25 + 0 × 0.75.',
    )
  }
  return fail(
    'ignored-probability',
    'Expected value accounts for both payout and probability. You did not weight $20 by how often it occurs. Multiply $20 by 0.25, then include the $0 outcome at 0.75.',
  )
}

// ---------------------------------------------------------------------------
// Lesson 1, Problem 3 — l1-short-run-vs-long-run
// ---------------------------------------------------------------------------

const NO_TERMS = new Set(['no', 'n', 'false', 'not necessarily', 'not necessary', 'no it does not', 'nope'])
const YES_TERMS = new Set(['yes', 'y', 'true', 'must', 'it must', 'yes it must'])
const LONG_RUN_GRAPH_TERMS = new Set([
  '500',
  '500 spins',
  'long run graph',
  'long run',
  'larger sample',
  'larger',
  'bigger sample',
  'b',
  'second',
])
const SHORT_RUN_GRAPH_TERMS = new Set([
  '10',
  '10 spins',
  'short run graph',
  'short run',
  'small sample',
  'smaller',
  'a',
  'first',
])

export function checkShortRunVsLongRun(input: ShortRunVsLongRunInput): CheckResult {
  if (input.shortRunSpins < 10) {
    return guard(`Run the 10-spin sample first (${input.shortRunSpins}/10).`)
  }
  if (input.shortSampleMustEqualEV === null || normToken(input.shortSampleMustEqualEV) === '') {
    return guard('Answer whether 10 spins must average exactly $5.')
  }
  const shortToken = normToken(input.shortSampleMustEqualEV)
  if (YES_TERMS.has(shortToken)) {
    return fail(
      'small-sample-misconception',
      'You said a 10-spin sample must average exactly $5. A theoretical expected value does not guarantee that every small sample matches it. Ten spins can land far above or below $5.',
    )
  }
  if (!NO_TERMS.has(shortToken)) {
    return fail(
      'small-sample-misconception',
      'That answer is ambiguous for this question. Ten spins do not have to average exactly $5 because small samples swing. Choose "No / Not necessarily".',
    )
  }
  if (input.longRunSpins < 500) {
    return guard(`Now run the 500-spin sample (${input.longRunSpins}/500).`)
  }
  if (input.strongerGraph === null || normToken(input.strongerGraph) === '') {
    return guard('Select which graph is stronger evidence of the long-run average.')
  }
  const graphToken = normToken(input.strongerGraph)
  if (SHORT_RUN_GRAPH_TERMS.has(graphToken)) {
    return fail(
      'selected-short-run-graph',
      'You picked the 10-spin graph. A short sample can temporarily land near $5 by chance, but that is weak evidence. The larger sample is stronger because random swings have more chances to balance out.',
    )
  }
  if (!LONG_RUN_GRAPH_TERMS.has(graphToken)) {
    return fail(
      'selected-short-run-graph',
      'That is not the stronger graph. More trials give better evidence of the long-run average. Choose the 500-spin (larger sample) graph.',
    )
  }
  return ok(
    'Correct — ten spins do not have to average $5, and the 500-spin graph is stronger evidence because larger samples stabilize near the long-run average.',
  )
}

// ---------------------------------------------------------------------------
// Lesson 1, Problem 4 — l1-compare-spinners
// ---------------------------------------------------------------------------

export function checkCompareSpinners(input: CompareSpinnersInput): CheckResult {
  if (input.choice === null || normToken(input.choice) === '') {
    return guard('Choose which spinner has the higher expected value.')
  }
  const choice = normToken(input.choice)
  if (choice === 'a' || choice === 'spinner a') {
    return fail(
      'win-frequency-misconception',
      'You chose Spinner A because it wins more often. Winning frequency alone does not decide EV. Spinner A wins $10 half the time, but Spinner B pays $20 a quarter of the time — both average $5.',
    )
  }
  if (choice === 'b' || choice === 'spinner b') {
    return fail(
      'maximum-payout-misconception',
      'You chose Spinner B because it can pay $20. The largest prize alone does not decide EV. Spinner B pays $20 less often, so when payout and probability are combined both spinners average $5.',
    )
  }
  if (choice !== 'same' && choice !== 'same ev' && choice !== 'equal' && choice !== 'they have the same ev') {
    return fail(
      'maximum-payout-misconception',
      'That is not the right comparison. Compute each weighted average: 10×0.5 = 5 and 20×0.25 = 5. The spinners have the same expected value.',
    )
  }
  if (input.explanation === null || normToken(input.explanation) === '') {
    return guard('Now choose the explanation for why the spinners are equal.')
  }
  const explanation = normToken(input.explanation)
  if (explanation === 'b bigger prize' || explanation === 'b larger payout') {
    return fail(
      'maximum-payout-misconception',
      'A bigger prize is not the reason they are equal. Spinner B pays $20 less often, which cancels its larger payout. Both games average $5 over many plays.',
    )
  }
  if (explanation === 'a more wins' || explanation === 'a wins more') {
    return fail(
      'win-frequency-misconception',
      'More frequent wins is not the reason they are equal. Spinner A wins a smaller prize, which cancels its higher win rate. Both games average $5 over many plays.',
    )
  }
  if (explanation !== 'both average 5' && explanation !== 'both average $5') {
    return fail(
      'win-frequency-misconception',
      'That explanation does not match the math. The reason they tie is that both weighted averages equal $5: 10×0.5 = 5 and 20×0.25 = 5.',
    )
  }
  return ok(
    'Correct — both spinners average $5. Spinner B has the larger prize but pays it less often, and Spinner A wins more often for less, so their weighted averages match.',
  )
}

// ---------------------------------------------------------------------------
// Lesson 2, Problem 1 — l2-build-weighted-average  (storage id: problem-2)
// ---------------------------------------------------------------------------

export function checkBuildWeightedAverage(input: BuildWeightedAverageInput): CheckResult {
  const [a, b, c, d] = input.slots
  const filledCount = [a, b, c, d].filter(Boolean).length
  if (filledCount === 0) {
    return guard('Select a card, then tap an empty formula slot to place it.')
  }
  if (filledCount < 4) {
    return fail('omitted-probability', 'Every outcome needs a probability. Fill all four slots so each term reads outcome × probability.')
  }

  const correctPairs =
    (a === '$20' && b === '25%' && c === '$0' && d === '75%') ||
    (a === '$0' && b === '75%' && c === '$20' && d === '25%')

  if (!correctPairs) {
    const reversedType =
      (a === '25%' && b === '$20') ||
      (a === '75%' && b === '$0') ||
      (c === '25%' && d === '$20') ||
      (c === '75%' && d === '$0')
    if (reversedType) {
      return fail(
        'reversed-outcome-probability',
        'You reversed an outcome and its probability. A dollar value is an outcome and a percent is a probability, so each term should read outcome × probability. Put the dollar cards first.',
      )
    }
    return fail(
      'wrong-pairing',
      'A pair is matched incorrectly. Pair $20 with 25%, because that is how often the $20 outcome occurs, and pair $0 with 75%.',
    )
  }

  const ev = normalizeMoneyAnswer(input.evAnswer)
  if (ev === null) {
    return guard('Enter the final expected value.')
  }
  if (areNumbersClose(ev, 20)) {
    return fail(
      'used-largest-payout',
      'You used $20 as the answer because it is the largest payout. Expected value weights each outcome by its probability. Compute 20 × 0.25 + 0 × 0.75.',
    )
  }
  if (!areNumbersClose(ev, 5)) {
    return fail('arithmetic-error', 'Recompute the weighted sum: 20 × 0.25 + 0 × 0.75 = $5.')
  }
  return ok('Correct! 20 × 0.25 + 0 × 0.75 = $5.')
}

// ---------------------------------------------------------------------------
// Lesson 2, Problem 2 — l2-match-outcomes-probabilities
// ---------------------------------------------------------------------------

const MATCH_TARGETS: Record<string, number> = {
  '12': 1 / 3,
  '3': 1 / 2,
  '0': 1 / 6,
}

export function checkMatchOutcomes(input: MatchOutcomesInput): CheckResult {
  const outcomes = ['12', '3', '0']
  const assigned = outcomes.map((o) => input.assignments[o])

  if (assigned.some((v) => v === null || v === undefined || normToken(v) === '')) {
    if (input.assignments['0'] == null || normToken(input.assignments['0']) === '') {
      // The $0 outcome is the one most often left out.
      const othersDone = ['12', '3'].every((o) => input.assignments[o] && normToken(input.assignments[o]) !== '')
      if (othersDone) {
        return fail(
          'omitted-zero-outcome',
          'You left the $0 outcome unmatched. Every outcome must be paired, including $0. The $0 payout still occurs 1/6 of the time, so match it with 1/6.',
        )
      }
    }
    return guard('Match every outcome with its probability. Tap an outcome, then tap a probability.')
  }

  // No card reuse.
  const used = assigned.map((v) => parseProbabilityAnswer(v))
  for (let i = 0; i < used.length; i += 1) {
    for (let j = i + 1; j < used.length; j += 1) {
      if (used[i] !== null && used[j] !== null && areNumbersClose(used[i] as number, used[j] as number, 0.001)) {
        return fail(
          'reused-probability-card',
          'You used the same probability twice. Each probability card can be placed only once. Re-read the game data and give every outcome its own chance.',
        )
      }
    }
  }

  // Ranked-by-size misconception: largest payout ($12) paired with largest prob (1/2).
  if (areProbabilitiesEquivalent(input.assignments['12'], 1 / 2, 0.001)) {
    return fail(
      'ranked-by-size',
      'You gave the largest payout the largest probability. The biggest prize does not automatically get the biggest chance. Read the data: $12 happens with probability 1/3, not 1/2.',
    )
  }

  for (const o of outcomes) {
    if (!areProbabilitiesEquivalent(input.assignments[o], MATCH_TARGETS[o], 0.005)) {
      return fail(
        'wrong-pairing',
        `The $${o} outcome is matched with the wrong probability. Each payout needs the probability of receiving that exact payout. Connect $12↔1/3, $3↔1/2, $0↔1/6.`,
      )
    }
  }

  return ok('Correct! $12 ↔ 1/3, $3 ↔ 1/2, $0 ↔ 1/6. Each payout is paired with the chance of that exact outcome.')
}

// ---------------------------------------------------------------------------
// Lesson 2, Problem 3 — l2-fill-missing-formula
// ---------------------------------------------------------------------------

export function checkFillMissingFormula(input: FillMissingFormulaInput): CheckResult {
  if (
    input.outcomeSlot === null ||
    normToken(input.outcomeSlot) === '' ||
    input.probabilitySlot === null ||
    normToken(input.probabilitySlot) === ''
  ) {
    return guard('Place a card in each blank: the outcome before × 0.4 and the probability after 5 ×.')
  }

  const outcome = normalizeNumericAnswer(input.outcomeSlot)
  const probability = normalizeNumericAnswer(input.probabilitySlot)

  // Slot-type mistakes.
  const outcomeIsProbabilityLike = outcome !== null && outcome <= 1
  const probabilityIsOutcomeLike = probability !== null && probability > 1
  if (outcomeIsProbabilityLike || probabilityIsOutcomeLike) {
    return fail(
      'slot-type-error',
      'A card is in the wrong kind of slot. The blank before × 0.4 must be the payout that occurs with probability 0.4, and the blank after 5 × must be the probability of receiving $5. Place $10 as the outcome and 0.5 as the probability.',
    )
  }

  if (outcome === null || !areNumbersClose(outcome, 10)) {
    return fail(
      'slot-type-error',
      'The outcome slot is not the right payout. The blank before × 0.4 must be the $10 payout, since $10 occurs with probability 0.4.',
    )
  }
  if (probability === null || !areNumbersClose(probability, 0.5)) {
    return fail(
      'slot-type-error',
      'The probability slot is not the right chance. The blank after 5 × must be 0.5, the probability of receiving $5.',
    )
  }

  const ev = normalizeMoneyAnswer(input.evAnswer)
  if (ev === null) {
    return guard('Add the three contributions and enter the final EV.')
  }
  if (areNumbersClose(ev, 15)) {
    return fail(
      'unweighted-sum',
      'You added the raw payouts (10 + 5 + 0). Expected value adds contributions, not payouts. Use 10×0.4 + 5×0.5 + 0×0.1 = 4 + 2.5 + 0.',
    )
  }
  if (!areNumbersClose(ev, 6.5)) {
    return fail(
      'arithmetic-error',
      'The slots are right, but the total is off. Add the three contributions: 4 + 2.5 + 0 = 6.5.',
    )
  }
  return ok('Correct! 10×0.4 + 5×0.5 + 0×0.1 = 4 + 2.5 + 0 = $6.50.')
}

// ---------------------------------------------------------------------------
// Lesson 2, Problem 4 — l2-diagnose-bad-ev-setups
// ---------------------------------------------------------------------------

export function checkDiagnoseBadSetups(input: DiagnoseBadSetupsInput): CheckResult {
  if (input.validChoice === null || normToken(input.validChoice) === '') {
    return guard('Select which formula is the valid, complete EV setup.')
  }
  const choice = normToken(input.validChoice).replace(/^formula\s*/, '')
  if (choice === 'a') {
    return fail(
      'summed-raw-payouts',
      'Formula A just adds the payouts (20 + 4 + 0). It never multiplies by probability, so it is not an expected value at all. The valid setup multiplies every outcome by its probability.',
    )
  }
  if (choice === 'b') {
    return fail(
      'chose-incomplete-setup',
      'Formula B weights the positive payouts but drops the $0 outcome and its 0.5 probability. Even though that contribution is zero, leaving it out means half the probability is unrepresented. The complete setup includes the $0 term.',
    )
  }
  if (choice !== 'c') {
    return fail('chose-incomplete-setup', 'Pick the formula that multiplies every outcome by its probability and includes all outcomes — that is Formula C.')
  }

  if (input.defectA === null || input.defectB === null || normToken(input.defectA) === '' || normToken(input.defectB) === '') {
    return guard('Now identify the defect in Formula A and Formula B.')
  }
  const defectA = normToken(input.defectA)
  const defectB = normToken(input.defectB)

  if (defectA !== 'no probability weighting' && defectA !== 'no weighting' && defectA !== 'sums raw payouts') {
    return fail(
      'wrong-diagnosis',
      'Formula A’s defect is misidentified. A sums the raw payouts without multiplying by any probability, so it is unweighted.',
    )
  }
  if (defectB !== 'omits zero outcome' && defectB !== 'omits $0 outcome' && defectB !== 'missing zero outcome' && defectB !== 'omits zero') {
    return fail(
      'wrong-diagnosis',
      'Formula B’s defect is misidentified. B omits the $0 outcome and its 0.5 probability, leaving half the probability unrepresented.',
    )
  }

  return ok(
    'Correct! C is the complete model. A sums payouts with no probability weighting, and B omits the $0 outcome — a zero contribution still belongs because it accounts for the remaining probability.',
  )
}

// ---------------------------------------------------------------------------
// Lesson 3, Problem 1 — l3-mystery-box-outcomes  (storage id: problem-3)
// ---------------------------------------------------------------------------

const MYSTERY_EXPECTED = [
  { outcome: 12, count: 1, prob: 1 / 6 },
  { outcome: 6, count: 2, prob: 2 / 6 },
  { outcome: 0, count: 3, prob: 3 / 6 },
]
const MYSTERY_TOTAL = 6

function looksLikeWrongDenominator(probability: string, expectedCount: number): boolean {
  if (!probability.includes('/')) {
    return false
  }
  const parts = probability.split('/')
  if (parts.length !== 2) {
    return false
  }
  const num = Number(parts[0].trim())
  const den = Number(parts[1].trim())
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) {
    return false
  }
  return areNumbersClose(num, expectedCount, 0.001) && !areNumbersClose(den, MYSTERY_TOTAL, 0.001)
}

export function checkMysteryBoxOutcomes(input: MysteryBoxInput): CheckResult {
  if (!input.allRevealed) {
    return guard('Reveal all six boxes first.')
  }

  // Omitted-zero detection: $12 and $6 rows complete but the $0 row left blank.
  const zeroRow = input.rows[2]
  const upperFilled =
    normToken(input.rows[0]?.count) !== '' &&
    normToken(input.rows[0]?.probability) !== '' &&
    normToken(input.rows[1]?.count) !== '' &&
    normToken(input.rows[1]?.probability) !== ''
  const zeroBlank = !zeroRow || normToken(zeroRow.probability) === ''
  if (upperFilled && zeroBlank) {
    return fail(
      'omitted-zero',
      'You left out the $0 outcome. Three boxes still pay $0, so that row belongs in the table. Enter count 3 and probability 3/6.',
    )
  }

  for (let i = 0; i < MYSTERY_EXPECTED.length; i += 1) {
    const expected = MYSTERY_EXPECTED[i]
    const row = input.rows[i]
    const count = normalizeNumericAnswer(row?.count ?? '')

    if (normToken(row?.count) === '' || normToken(row?.probability) === '') {
      return guard('Fill every count and probability cell.')
    }

    if (count === null || !areNumbersClose(count, expected.count, 0.001)) {
      if (count !== null && areNumbersClose(count, MYSTERY_TOTAL, 0.001)) {
        return fail(
          'entered-total-as-count',
          `You entered ${MYSTERY_TOTAL} (the total number of boxes) as the count. The count is how many boxes show $${expected.outcome} — that is ${expected.count}.`,
        )
      }
      const rawProbAsCount = normalizeNumericAnswer(row.probability)
      if (rawProbAsCount !== null && areNumbersClose(rawProbAsCount, expected.count, 0.001)) {
        return fail(
          'counts-as-probabilities',
          `You entered ${expected.count} as the probability — that is the number of $${expected.outcome} boxes. Probability compares that count with all 6 boxes, so enter ${expected.count}/6 or an equivalent value.`,
        )
      }
      return fail('wrong-count', `Check the count for $${expected.outcome}. There ${expected.count === 1 ? 'is' : 'are'} ${expected.count} box${expected.count === 1 ? '' : 'es'} with that prize.`)
    }

    if (!areProbabilitiesEquivalent(row.probability, expected.prob, 0.005)) {
      const raw = normalizeNumericAnswer(row.probability)
      if (raw !== null && areNumbersClose(raw, expected.count, 0.001)) {
        return fail(
          'counts-as-probabilities',
          `You entered ${expected.count} as the probability — that is the box count. Probability is count divided by total boxes: ${expected.count}/6.`,
        )
      }
      if (looksLikeWrongDenominator(row.probability, expected.count)) {
        return fail(
          'wrong-denominator',
          `You used the wrong denominator for $${expected.outcome}. There are 6 boxes in total, so compare against 6: ${expected.count}/6, not a different total.`,
        )
      }
      return fail('wrong-denominator', `Check the probability for $${expected.outcome}: ${expected.count} of 6 boxes = ${expected.count}/6.`)
    }
  }

  const probSum = input.rows.reduce((sum, r) => sum + (parseProbabilityAnswer(r.probability) ?? 0), 0)
  if (probSum > 0 && !approxEqual(probSum, 1)) {
    return fail(
      'probabilities-not-one',
      'Your probabilities do not sum to 1. Each is count/6, and the three counts (1, 2, 3) add up to 6, so the probabilities must total 1.',
    )
  }

  return ok('Correct! $12 → 1/6, $6 → 2/6, $0 → 3/6, and the probabilities sum to 1.')
}

// ---------------------------------------------------------------------------
// Lesson 3, Problem 2 — l3-calculate-ev-from-table  (storage id: problem-4)
// ---------------------------------------------------------------------------

export function checkCalculateEvFromTable(input: CalculateEvFromTableInput): CheckResult {
  // Added probabilities instead of contributions (1/6 + 2/6 + 3/6 = 1). Checked
  // before the money guard because fraction strings are not valid money answers.
  const rawProbs = input.contributions.map((c) => parseProbabilityAnswer(c))
  if (
    rawProbs[0] !== null &&
    areNumbersClose(rawProbs[0] as number, 1 / 6, 0.01) &&
    rawProbs[1] !== null &&
    areNumbersClose(rawProbs[1] as number, 2 / 6, 0.01)
  ) {
    return fail(
      'added-probabilities',
      'Those are the probabilities, not the contributions. A contribution multiplies the payout by its probability. For the $6 row, compute 6 × 2/6 = 2, not just 2/6.',
    )
  }

  const contribs = input.contributions.map((c) => normalizeMoneyAnswer(c))
  if (contribs.some((c) => c === null)) {
    return guard('Fill all three contribution cells (outcome × probability).')
  }

  const [c1, c2, c3] = contribs as number[]
  const expected = [2, 2, 0]

  // Summed raw payouts (12 + 6 + 0) instead of contributions.
  if (areNumbersClose(c1, 12) && areNumbersClose(c2, 6)) {
    return fail(
      'unweighted-sum',
      'You used the raw payouts. A contribution is payout × probability, so do not add $12 and $6 directly — the outcomes do not occur every time. Use 12 × 1/6 = 2 and 6 × 2/6 = 2.',
    )
  }

  // The two paying rows are right but the $0 row was given a nonzero value.
  if (areNumbersClose(c1, expected[0]) && areNumbersClose(c2, expected[1]) && !areNumbersClose(c3, expected[2])) {
    return fail(
      'omitted-zero-row',
      'The $0 row still belongs in the sum — it contributes 0 × 3/6 = $0. Enter 0 for that row rather than skipping or changing it.',
    )
  }

  if (!areNumbersClose(c1, expected[0]) || !areNumbersClose(c2, expected[1]) || !areNumbersClose(c3, expected[2])) {
    return fail(
      'arithmetic-error',
      'Check each row: a contribution is payout × probability. 12 × 1/6 = 2, 6 × 2/6 = 2, 0 × 3/6 = 0.',
    )
  }

  const ev = normalizeMoneyAnswer(input.evAnswer)
  if (ev === null) {
    return guard('Enter the final expected value (the sum of the contributions).')
  }
  if (!areNumbersClose(ev, 4)) {
    return fail('arithmetic-error', 'Add the three contributions: 2 + 2 + 0 = $4.')
  }

  return ok('Correct! 12×1/6 = 2, 6×2/6 = 2, 0×3/6 = 0, so EV = $4.')
}

// ---------------------------------------------------------------------------
// Checker registry (keyed by canonical slug)
// ---------------------------------------------------------------------------

export const problemPackACheckers = {
  'l1-long-run-average': checkLongRunAverage,
  'l1-unequal-spinner': checkUnequalSpinner,
  'l1-short-run-vs-long-run': checkShortRunVsLongRun,
  'l1-compare-spinners': checkCompareSpinners,
  'l2-build-weighted-average': checkBuildWeightedAverage,
  'l2-match-outcomes-probabilities': checkMatchOutcomes,
  'l2-fill-missing-formula': checkFillMissingFormula,
  'l2-diagnose-bad-ev-setups': checkDiagnoseBadSetups,
  'l3-mystery-box-outcomes': checkMysteryBoxOutcomes,
  'l3-calculate-ev-from-table': checkCalculateEvFromTable,
} as const

/** Map persisted storage ids to the same checkers, for session wiring. */
export const problemPackACheckersByStorageId = {
  'problem-1': checkLongRunAverage,
  'l1-unequal-spinner': checkUnequalSpinner,
  'l1-short-run-vs-long-run': checkShortRunVsLongRun,
  'l1-compare-spinners': checkCompareSpinners,
  'problem-2': checkBuildWeightedAverage,
  'l2-match-outcomes-probabilities': checkMatchOutcomes,
  'l2-fill-missing-formula': checkFillMissingFormula,
  'l2-diagnose-bad-ev-setups': checkDiagnoseBadSetups,
  'problem-3': checkMysteryBoxOutcomes,
  'problem-4': checkCalculateEvFromTable,
} as const
