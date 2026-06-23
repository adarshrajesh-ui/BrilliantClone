import {
  approxEqual,
  matchesNumeric,
  matchesProbability,
  parseNumber,
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
  if (!a || !b || !c || !d) {
    return fail('omitted-probability', 'Fill all four formula slots.')
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
    const count = parseNumber(row.count)
    if (count !== expected[i].count) {
      if (approxEqual(parseNumber(row.probability) ?? -1, expected[i].count / 6)) {
        return fail('counts-as-probabilities', 'You entered counts in the probability column. Probabilities are counts divided by total boxes (6).')
      }
      return fail('unknown', `Check the count for $${expected[i].outcome}.`)
    }
    if (!matchesProbability(row.probability, [expected[i].prob])) {
      return fail('unknown', `Check the probability for $${expected[i].outcome}.`)
    }
  }

  const probSum = input.rows.reduce((s, r) => s + (parseNumber(r.probability.replace('%', '')) ?? parseProbabilitySafe(r.probability)), 0)
  if (probSum > 0 && !approxEqual(probSum, 1) && !approxEqual(probSum, 100)) {
    return fail('probabilities-not-one', 'Probabilities must sum to 1.')
  }

  return ok('Correct! $12 → 1/6, $6 → 2/6, $0 → 3/6.', true)
}

function parseProbabilitySafe(v: string) {
  const p = parseNumber(v)
  if (v.includes('/')) {
    const [a, b] = v.split('/').map(Number)
    return a / b
  }
  return p ?? 0
}

export function checkProblem4(input: Problem4CheckInput): CheckResult {
  const contribs = input.contributions.map((c) => parseNumber(c))
  if (contribs.some((c) => c === null)) {
    return fail('', 'Fill all three contribution cells.')
  }

  const [c1, c2, c3] = contribs as number[]
  const expected = [2, 2, 0]

  if (c3 !== 0 && c1 === null && c2 === null) {
    return fail('omitted-zero-row', 'Include the $0 row — it contributes 0 but belongs in the sum.')
  }

  if (c1 + c2 + c3 === 18 && c1 === 12 && c2 === 6) {
    return fail('unweighted-sum', 'You summed payouts without weighting by probability.')
  }

  if (!approxEqual(c1, expected[0]) || !approxEqual(c2, expected[1]) || !approxEqual(c3, expected[2])) {
    return fail('arithmetic-error', 'Check each row: multiply outcome × probability.')
  }

  if (!matchesNumeric(input.evAnswer, [4])) {
    return fail('arithmetic-error', 'Add the three contributions for the final EV.')
  }

  return ok('Correct! 12×1/6=2, 6×2/6=2, 0×3/6=0, so EV = $4.', true)
}

export function checkProblem5(input: Problem5CheckInput): CheckResult {
  if (!input.formulaSelected) {
    return fail('', 'Tap the cost block to build the payout − cost equation.')
  }

  if (matchesNumeric(input.profitAnswer, [4])) {
    return fail('answered-payout', 'You answered expected payout ($4), not expected profit. Subtract the cost.')
  }

  if (matchesNumeric(input.profitAnswer, [7])) {
    return fail('added-cost', 'Cost reduces profit. Use payout − cost, not payout + cost.')
  }

  if (!matchesNumeric(input.profitAnswer, [1])) {
    return fail('unknown', 'Expected profit = expected payout − cost = 4 − 3.')
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
    if (assignments[g] !== correct[g as keyof typeof correct]) {
      if (assignments[g] === 'favorable' && g === 'A') {
        return fail('confused-fair-favorable', 'Fair means expected profit = $0 exactly, not just "not bad".')
      }
      if (assignments[g] === 'favorable' && g === 'C') {
        return fail('positive-payout-favorable', 'A positive payout alone does not mean favorable. Subtract cost to get expected profit.')
      }
      return fail('forgot-subtract-cost', 'Expected profit = payout − cost. A=$0, B=+$2, C=−$2.')
    }
  }

  return ok('Correct! A is fair ($0), B is favorable (+$2), C is unfavorable (−$2).', true)
}

export function checkProblem7(input: Problem7CheckInput): CheckResult {
  const probs = input.probabilities.map((p) => parseProbabilitySafe(p))
  const contribs = input.contributions.map((c) => parseNumber(c))

  if (probs.some((p) => Number.isNaN(p)) || contribs.some((c) => c === null)) {
    return fail('', 'Fill all table fields.')
  }

  const expectedProbs = [0.1, 0.2, 0.7]
  const expectedContribs = [3, 2, 0]

  for (let i = 0; i < 3; i += 1) {
    if (!approxEqual(probs[i], expectedProbs[i])) {
      if (probs[i] === 1 || probs[i] === 2 || probs[i] === 7) {
        return fail('count-not-probability', 'You used the number of sections as the probability. Since the wheel has 10 total sections, divide by 10.')
      }
      return fail('wrong-denominator', 'Since the wheel has 10 total sections, divide by 10.')
    }
    if (!approxEqual(contribs[i] as number, expectedContribs[i])) {
      return fail('unknown', 'Contribution = outcome × probability for each row.')
    }
  }

  if (!matchesNumeric(input.expectedPayout, [5])) {
    return fail('unknown', 'Sum the contributions for expected payout.')
  }

  if (!matchesNumeric(input.expectedProfit, [0])) {
    return fail('payout-not-profit', 'Expected profit = expected payout ($5) − cost ($5).')
  }

  const decision = input.decision.trim().toLowerCase()
  if (decision === 'favorable') {
    return fail('fair-marked-favorable', 'Expected profit is $0, so the game is fair — not favorable just because payout is positive.')
  }
  if (decision !== 'fair') {
    return fail('unknown', 'With zero expected profit, the game is fair.')
  }

  return ok('Correct! EV payout = $5, profit = $0, decision = fair.', true)
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
    return fail('identical-games', 'Same EV does not mean identical experience. Game B has variable outcomes.')
  }

  const reason = input.reason.trim().toLowerCase()
  if (!reason.includes('variable') && !reason.includes('spread') && !reason.includes('jump')) {
    return fail('identical-games', 'Game B is riskier because outcomes vary even though the long-run average matches Game A.')
  }

  return ok(
    'Correct! Both have EV = $5, but Game B is riskier because outcomes vary even though the long-run average matches.',
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
