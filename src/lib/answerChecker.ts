import {
  approxEqual,
  areNumbersClose,
  areProbabilitiesEquivalent,
  detectMistakeType,
  matchesNumeric,
  normalizeClassificationAnswer,
  normalizeMoneyAnswer,
  normalizeNumericAnswer,
  parseProbabilityAnswer,
} from './answerParser'
import type {
  CheckResult,
  Problem1CheckInput,
  Problem2CheckInput,
  Problem3CheckInput,
  Problem4CheckInput,
  Problem5CheckInput,
  Problem6CheckInput,
  Problem7CheckInput,
  Problem8CheckInput,
  ProblemCheckInput,
} from '../types/problem'

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

export function checkProblem1Completion(input: Problem1CheckInput): CheckResult {
  if (!input.predictionSubmitted) {
    return fail('', 'Submit your prediction before spinning.')
  }
  if (input.totalSpins < 100) {
    return fail('', `Run at least 100 total spins (${input.totalSpins}/100).`)
  }
  if (input.finalAnswer === null) {
    return fail('', 'Choose the long-run average based on what you observed.')
  }
  if (input.finalAnswer === 5) {
    return ok(
      'Correct! With an equal chance of $10 and $0, the long-run average is halfway between them — $5 per spin.',
      true,
    )
  }
  if (input.finalAnswer === 0 || input.finalAnswer === 10) {
    return fail(
      'chose-extreme-outcome',
      'The long-run average is not one of the individual outcomes. It is what you expect per spin over many tries — halfway between $10 and $0.',
    )
  }
  return fail('unknown', 'That is not the long-run average for this spinner.')
}

export function checkProblem1Prediction(
  answer: number,
  totalSpins: number,
): CheckResult {
  if (totalSpins > 0 && totalSpins < 100) {
    return fail(
      'confused-single-spin',
      'One or a few spins show a single outcome, not the long-run average. Keep spinning to see the pattern.',
    )
  }
  if (answer === 5) {
    return ok('Good prediction! Now spin many times to confirm.')
  }
  if (answer === 0 || answer === 10) {
    return fail(
      'chose-extreme-outcome',
      'You picked one of the possible outcomes. The long-run average is what you expect per spin over many repetitions.',
    )
  }
  return fail('unknown', 'Try thinking about the average of $10 and $0 over many equal spins.')
}

export function checkProblem2(input: Problem2CheckInput): CheckResult {
  const [a, b, c, d] = input.slots
  const filledCount = [a, b, c, d].filter(Boolean).length
  if (filledCount === 0) {
    return fail('', 'Select a card, then tap an empty formula slot to place it.')
  }
  if (filledCount < 4) {
    return fail('omitted-probability', 'Every outcome needs a probability. Fill all four slots.')
  }

  const correctPairs =
    (a === '$20' && b === '25%' && c === '$0' && d === '75%') ||
    (a === '$0' && b === '75%' && c === '$20' && d === '25%')

  if (!correctPairs) {
    const reversed =
      (a === '25%' && b === '$20') ||
      (a === '75%' && b === '$0') ||
      (c === '25%' && d === '$20') ||
      (c === '75%' && d === '$0')
    if (reversed) {
      return fail(
        'reversed-outcome-probability',
        'You reversed an outcome and its probability. Each payout should multiply its own chance.',
      )
    }
    return fail(
      'reversed-outcome-probability',
      'Check that $20 pairs with 25% and $0 pairs with 75%.',
    )
  }

  if (matchesNumeric(input.evAnswer, [20])) {
    return fail(
      'used-largest-payout',
      'You used $20 as the answer because it is the largest payout. EV weights each outcome by its probability.',
    )
  }

  if (!matchesNumeric(input.evAnswer, [5])) {
    return fail('unknown', 'Compute EV = 20 × 0.25 + 0 × 0.75.')
  }

  return ok('Correct! 20 × 0.25 + 0 × 0.75 = $5.', true)
}

export function checkProblem3(input: Problem3CheckInput): CheckResult {
  if (!input.allRevealed) {
    return fail('', 'Reveal all six boxes first.')
  }

  const expected = [
    { outcome: 12, count: 1, prob: 1 / 6 },
    { outcome: 6, count: 2, prob: 2 / 6 },
    { outcome: 0, count: 3, prob: 3 / 6 },
  ]

  for (let i = 0; i < expected.length; i += 1) {
    const row = input.rows[i]
    const count = normalizeNumericAnswer(row.count)
    if (count === null || !areNumbersClose(count, expected[i].count, 0.001)) {
      // Mistake: the learner typed the raw box count into the probability cell.
      const rawProbAsCount = normalizeNumericAnswer(row.probability)
      if (rawProbAsCount !== null && areNumbersClose(rawProbAsCount, expected[i].count, 0.001)) {
        return fail('counts-as-probabilities', `You entered ${expected[i].count} as the probability — that is the number of $${expected[i].outcome} boxes. Probability should be count divided by total boxes: ${expected[i].count}/6.`)
      }
      return fail('unknown', `Check the count for $${expected[i].outcome}. There ${expected[i].count === 1 ? 'is' : 'are'} ${expected[i].count} box${expected[i].count === 1 ? '' : 'es'} with that prize.`)
    }
    if (!areProbabilitiesEquivalent(row.probability, expected[i].prob)) {
      // Mistake: typed the raw count (e.g. "2") into the probability cell.
      const rawProb = normalizeNumericAnswer(row.probability)
      if (rawProb !== null && areNumbersClose(rawProb, expected[i].count, 0.001)) {
        return fail('counts-as-probabilities', `You entered ${expected[i].count} as the probability — that is the box count. Probability should be count divided by total boxes: ${expected[i].count}/6.`)
      }
      return fail('unknown', `Check the probability for $${expected[i].outcome}: ${expected[i].count} of 6 boxes = ${expected[i].count}/6.`)
    }
  }

  const probSum = input.rows.reduce((s, r) => {
    const p = parseProbabilityAnswer(r.probability)
    return s + (p ?? 0)
  }, 0)
  if (probSum > 0 && !approxEqual(probSum, 1)) {
    return fail('probabilities-not-one', 'Your probabilities do not sum to 1. Each is count/6, and the three counts add up to 6.')
  }

  return ok('Correct! $12 → 1/6, $6 → 2/6, $0 → 3/6.', true)
}

export function checkProblem4(input: Problem4CheckInput): CheckResult {
  const contribs = input.contributions.map((c) => normalizeMoneyAnswer(c))
  if (contribs.some((c) => c === null)) {
    return fail('', 'Fill all three contribution cells (outcome × probability).')
  }

  const [c1, c2, c3] = contribs as number[]
  const expected = [2, 2, 0]

  // Mistake: summed raw payouts (12 + 6 + 0) without weighting by probability.
  if (areNumbersClose(c1, 12) && areNumbersClose(c2, 6)) {
    return fail('unweighted-sum', 'You used the raw payouts. Each contribution is outcome × probability, e.g. 12 × 1/6 = 2.')
  }

  // Mistake: the two paying rows are right, but the $0 row was treated as if it
  // contributes something. The $0 outcome still belongs in the sum at 0.
  if (areNumbersClose(c1, expected[0]) && areNumbersClose(c2, expected[1]) && !areNumbersClose(c3, expected[2])) {
    return fail('omitted-zero-row', 'The $0 row still belongs in the sum — it contributes 0 × 3/6 = $0. Enter 0 for that row.')
  }

  if (!areNumbersClose(c1, expected[0]) || !areNumbersClose(c2, expected[1]) || !areNumbersClose(c3, expected[2])) {
    return fail('arithmetic-error', 'Check each row: multiply outcome × probability. 12 × 1/6 = 2, 6 × 2/6 = 2, 0 × 3/6 = 0.')
  }

  if (!matchesNumeric(input.evAnswer, [4])) {
    return fail('arithmetic-error', 'Add the three contributions: 2 + 2 + 0 = $4.')
  }

  return ok('Correct! 12×1/6=2, 6×2/6=2, 0×3/6=0, so EV = $4.', true)
}

export function checkProblem5(input: Problem5CheckInput): CheckResult {
  if (!input.formulaSelected) {
    return fail('', 'Tap the cost block to build the payout − cost equation.')
  }

  const profit = normalizeMoneyAnswer(input.profitAnswer)
  if (profit === null) {
    return fail('', 'Enter the expected profit in dollars.')
  }

  const mistake = detectMistakeType(profit, [
    { value: 4, mistakeType: 'answered-payout' },
    { value: 7, mistakeType: 'added-cost' },
  ])
  if (mistake === 'answered-payout') {
    return fail('answered-payout', 'You answered expected payout ($4), not expected profit. Subtract the $3 cost.')
  }
  if (mistake === 'added-cost') {
    return fail('added-cost', 'Cost reduces profit. Use payout − cost ($4 − $3), not payout + cost.')
  }

  if (!areNumbersClose(profit, 1)) {
    return fail('unknown', 'Expected profit = expected payout − cost = $4 − $3 = $1.')
  }

  return ok('Correct! Expected profit = $4 − $3 = $1.', true)
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

export function checkProblem7(input: Problem7CheckInput): CheckResult {
  const probs = input.probabilities.map((p) => parseProbabilityAnswer(p))
  const contribs = input.contributions.map((c) => normalizeMoneyAnswer(c))
  const rawProbNumbers = input.probabilities.map((p) => normalizeNumericAnswer(p))

  if (probs.some((p) => p === null) || contribs.some((c) => c === null)) {
    return fail('', 'Fill in every probability and contribution in the table.')
  }

  const expectedProbs = [0.1, 0.2, 0.7]
  const expectedContribs = [3, 2, 0]
  const sectionCounts = [1, 2, 7]
  const outcomes = [30, 10, 0]

  for (let i = 0; i < 3; i += 1) {
    if (!areNumbersClose(probs[i] as number, expectedProbs[i])) {
      // Mistake: typed the raw section count (1, 2, 7) instead of a probability.
      const raw = rawProbNumbers[i]
      if (raw !== null && areNumbersClose(raw, sectionCounts[i], 0.001)) {
        return fail('count-not-probability', `You used ${sectionCounts[i]} (the number of sections) as the probability. The wheel has 10 total sections, so divide by 10: ${sectionCounts[i]}/10.`)
      }
      return fail('wrong-denominator', `Probability = sections with that payout ÷ 10 total sections. $${outcomes[i]} appears on ${sectionCounts[i]} of 10 sections.`)
    }
    if (!areNumbersClose(contribs[i] as number, expectedContribs[i])) {
      return fail('unknown', `Contribution = outcome × probability. $${outcomes[i]} × ${sectionCounts[i]}/10 = ${expectedContribs[i]}.`)
    }
  }

  if (!matchesNumeric(input.expectedPayout, [5])) {
    return fail('unknown', 'Expected payout is the sum of the contributions: 3 + 2 + 0 = $5.')
  }

  if (!matchesNumeric(input.expectedProfit, [0])) {
    return fail('payout-not-profit', 'Expected profit = expected payout ($5) − cost ($5) = $0.')
  }

  const decision = normalizeClassificationAnswer(input.decision)
  if (decision === 'favorable') {
    return fail('fair-marked-favorable', 'Expected profit is $0, so the game is fair — not favorable just because the payout is positive.')
  }
  if (decision !== 'fair') {
    return fail('unknown', 'With $0 expected profit, the game is fair.')
  }

  return ok('Correct! EV payout = $5, profit = $0, decision = fair.', true)
}

// Deterministic keyword match for the (multiple-choice or free-text) risk reason.
function reasonIsCorrect(reason: string): boolean {
  const r = reason.trim().toLowerCase()
  if (r === '') {
    return false
  }
  if (r === 'variable-outcomes') {
    return true
  }
  if (r === 'higher-ev' || r === 'identical') {
    return false
  }
  const correctKeywords = ['variable', 'spread', 'jump', 'vary', 'varies', '0 or 10', 'different risk']
  const sameAverage = r.includes('same') && (r.includes('average') || r.includes('ev') || r.includes('expected'))
  return correctKeywords.some((k) => r.includes(k)) || (sameAverage && r.includes('risk'))
}

export function checkProblem8(input: Problem8CheckInput): CheckResult {
  if (!input.gameASimulated || !input.gameBSimulated) {
    return fail('', 'Run 20 simulated trials for each game.')
  }

  if (!matchesNumeric(input.evA, [5])) {
    return fail('average-vs-guaranteed', 'Game A pays $5 every time, so EV = $5.')
  }

  if (matchesNumeric(input.evB, [10])) {
    return fail('b-higher-ev', 'Game B can pay $10, but its expected value is still $5 — same as Game A.')
  }

  if (!matchesNumeric(input.evB, [5])) {
    return fail('unknown', 'Game B: 50% of $10 + 50% of $0 = $5.')
  }

  const risk = input.higherRisk.trim().toLowerCase()
  if (!risk.includes('b')) {
    return fail('identical-games', 'Same EV does not mean identical experience. Game B has variable outcomes between $0 and $10.')
  }

  if (!reasonIsCorrect(input.reason)) {
    return fail('identical-games', 'Game B is riskier because its outcomes vary between $0 and $10, even though the long-run average matches Game A.')
  }

  return ok(
    'Correct! Both have EV = $5, but Game B is riskier because its outcomes vary even though the long-run average matches.',
    true,
  )
}

export function checkProblem(
  problemId: string,
  input: ProblemCheckInput,
): CheckResult {
  switch (problemId) {
    case 'problem-1':
      return checkProblem1Completion(input as Problem1CheckInput)
    case 'problem-2':
      return checkProblem2(input as Problem2CheckInput)
    case 'problem-3':
      return checkProblem3(input as Problem3CheckInput)
    case 'problem-4':
      return checkProblem4(input as Problem4CheckInput)
    case 'problem-5':
      return checkProblem5(input as Problem5CheckInput)
    case 'problem-6':
      return checkProblem6(input as Problem6CheckInput)
    case 'problem-7':
      return checkProblem7(input as Problem7CheckInput)
    case 'problem-8':
      return checkProblem8(input as Problem8CheckInput)
    default:
      return fail('unknown', 'Unknown problem.')
  }
}
