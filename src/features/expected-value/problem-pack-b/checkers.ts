// Deterministic answer checkers for Problem Pack B (Problems 11–20).
//
// Reuses the shared answerParser normalizers (read-only import). Every checker is
// pure: same input → same result, well under 100ms. No AI, no semantic matching.
//
// CheckResult contract (matches the shared model and isGradedAttempt):
//  - { isCorrect:true, mistakeType:null }  → correct, may complete
//  - { isCorrect:false, mistakeType:'' }   → incomplete GUARD (NOT a graded attempt)
//  - { isCorrect:false, mistakeType:'x' }  → graded wrong answer (counts as attempt)

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
} from '../../../lib/answerParser'
import type {
  CapstoneInput,
  CheckResult,
  ChooseBetterGameInput,
  FairnessSortInput,
  FindFairPriceInput,
  LowVsHighRiskInput,
  PackCanonicalSlug,
  PackCheckInput,
  PackChecker,
  PayoutVsProfitInput,
  PrizeBagInput,
  RepairTableInput,
  SameEvDifferentRiskInput,
  WholeEvModelInput,
} from './types'

const ok = (feedback: string): CheckResult => ({
  isCorrect: true,
  mistakeType: null,
  feedback,
  canComplete: true,
})

/** Incomplete guard — not correct, not a graded mistake. */
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
 * Mirror of the shared isGradedAttempt so the pack is self-contained and tests
 * can assert attempt accounting without reaching into shared files.
 */
export function isGradedAttempt(result: CheckResult): boolean {
  if (result.isCorrect) {
    return true
  }
  return Boolean(result.mistakeType && result.mistakeType.length > 0)
}

// ---------------------------------------------------------------------------
// Deterministic free-text explanation matcher (NO AI / NO semantic similarity).
// Accepts when an approved keyword is present AND no contradictory keyword is.
// ---------------------------------------------------------------------------

export interface ExplanationRule {
  /** Exact multiple-choice option ids that are always correct. */
  approvedIds: string[]
  /** Exact option ids that are always wrong. */
  rejectedIds: string[]
  /** Substring keywords that indicate correct reasoning. */
  approvedKeywords: string[]
  /** Substring keywords that indicate contradictory reasoning. */
  contradictoryKeywords: string[]
}

export type ExplanationVerdict =
  | { kind: 'correct' }
  | { kind: 'contradictory' }
  | { kind: 'insufficient' }

export function evaluateExplanation(
  raw: string,
  rule: ExplanationRule,
): ExplanationVerdict {
  const value = raw.trim().toLowerCase()
  if (value === '') {
    return { kind: 'insufficient' }
  }
  if (rule.rejectedIds.includes(value)) {
    return { kind: 'contradictory' }
  }
  if (rule.approvedIds.includes(value)) {
    return { kind: 'correct' }
  }
  // Contradictory wording is rejected even if an approved word also appears.
  if (rule.contradictoryKeywords.some((k) => value.includes(k))) {
    return { kind: 'contradictory' }
  }
  if (rule.approvedKeywords.some((k) => value.includes(k))) {
    return { kind: 'correct' }
  }
  return { kind: 'insufficient' }
}

// ===========================================================================
// 11 — l3-repair-probability-table
// 8 tickets: $16×1, $4×3, $0×4. Correct probs: 1/8, 3/8, 4/8(=1/2).
// ===========================================================================

const REPAIR_ROWS = [
  { outcome: 16, count: 1, prob: 1 / 8 },
  { outcome: 4, count: 3, prob: 3 / 8 },
  { outcome: 0, count: 4, prob: 4 / 8 },
]
const REPAIR_TOTAL = 8

export function checkRepairProbabilityTable(input: RepairTableInput): CheckResult {
  const parsed = REPAIR_ROWS.map((_, i) => parseProbabilityAnswer(input.rows[i]?.probability))

  // The $0 row ships blank; an empty cell anywhere is an incomplete guard.
  if (parsed.some((p) => p === null)) {
    const blankZero = parsed[2] === null
    return guard(
      blankZero
        ? 'Every probability uses 8 as the denominator — fill in the blank $0 row before checking.'
        : 'Correct every probability cell before checking.',
    )
  }

  for (let i = 0; i < REPAIR_ROWS.length; i += 1) {
    const row = REPAIR_ROWS[i]
    if (areProbabilitiesEquivalent(input.rows[i].probability, row.prob)) {
      continue
    }
    const raw = normalizeNumericAnswer(input.rows[i].probability)
    // Copied the raw count straight into the probability cell.
    if (raw !== null && areNumbersClose(raw, row.count, 0.001)) {
      return fail(
        'count-as-probability',
        `You entered ${row.count} — that is the number of $${row.outcome} tickets, not a probability. There are 8 tickets total, so use ${row.count}/8.`,
      )
    }
    // Zero-outcome specifically ignored / set to zero.
    if (row.outcome === 0 && raw !== null && areNumbersClose(raw, 0, 0.001)) {
      return fail(
        'ignored-zero-outcome',
        'The $0 tickets still count. 4 of the 8 tickets pay $0, so the probability is 4/8 (or 1/2), not 0.',
      )
    }
    return fail(
      'wrong-denominator',
      `There are 8 tickets total, so every probability compares its group with 8. The $${row.outcome} row has ${row.count} matching tickets → ${row.count}/8.`,
    )
  }

  const sum = parsed.reduce<number>((s, p) => s + (p ?? 0), 0)
  if (!approxEqual(sum, 1)) {
    return fail(
      'probabilities-not-one',
      'The probabilities must sum to 1. The three counts (1, 3, 4) add up to all 8 tickets, so 1/8 + 3/8 + 4/8 = 1.',
    )
  }

  return ok('Correct! $16 → 1/8, $4 → 3/8, $0 → 4/8 (1/2), and they sum to 1.')
}

// ===========================================================================
// 12 — l3-prize-bag-ev-table
// 10 tokens: $15×2 (p 0.2, contrib 3), $5×3 (p 0.3, contrib 1.5), $0×5 (p 0.5, contrib 0).
// EV = 4.5.
// ===========================================================================

const PRIZE_ROWS = [
  { outcome: 15, count: 2, prob: 0.2, contribution: 3 },
  { outcome: 5, count: 3, prob: 0.3, contribution: 1.5 },
  { outcome: 0, count: 5, prob: 0.5, contribution: 0 },
]
const PRIZE_TOTAL = 10

export function checkPrizeBagEvTable(input: PrizeBagInput): CheckResult {
  const counts = PRIZE_ROWS.map((_, i) => normalizeNumericAnswer(input.rows[i]?.count))
  const probs = PRIZE_ROWS.map((_, i) => parseProbabilityAnswer(input.rows[i]?.probability))
  const contribs = PRIZE_ROWS.map((_, i) => normalizeMoneyAnswer(input.rows[i]?.contribution))
  const ev = normalizeMoneyAnswer(input.evAnswer)

  if (counts.some((c) => c === null) || probs.some((p) => p === null) || contribs.some((c) => c === null) || ev === null) {
    return guard('Fill the count, probability, and contribution for every row, then enter the final EV.')
  }

  for (let i = 0; i < PRIZE_ROWS.length; i += 1) {
    const row = PRIZE_ROWS[i]
    if (!areNumbersClose(counts[i] as number, row.count, 0.001)) {
      return fail('wrong-count', `Recount the $${row.outcome} tokens: there ${row.count === 1 ? 'is' : 'are'} ${row.count} of them.`)
    }
    if (!areProbabilitiesEquivalent(input.rows[i].probability, row.prob)) {
      const raw = normalizeNumericAnswer(input.rows[i].probability)
      if (raw !== null && areNumbersClose(raw, row.count, 0.001)) {
        return fail('count-not-probability', `You used ${row.count} (the token count) as the probability. Divide by 10 total tokens: ${row.count}/10.`)
      }
      return fail('wrong-denominator', `Probability = matching tokens ÷ 10. The $${row.outcome} row is ${row.count}/10.`)
    }
  }

  const [c1, c2, c3] = contribs as number[]
  // Summed the raw payouts (15 + 5 + 0) instead of weighting by probability.
  if (areNumbersClose(c1, 15) && areNumbersClose(c2, 5)) {
    return fail('unweighted-sum', 'A contribution is payout × probability, not the raw payout. For $15 it is 15 × 2/10 = 3.')
  }
  // $0 row treated as if it contributes something other than 0.
  if (
    areNumbersClose(c1, PRIZE_ROWS[0].contribution) &&
    areNumbersClose(c2, PRIZE_ROWS[1].contribution) &&
    !areNumbersClose(c3, PRIZE_ROWS[2].contribution)
  ) {
    return fail('omitted-zero-outcome', 'The $0 row still belongs in the table — its contribution is 0 × 5/10 = $0.')
  }
  for (let i = 0; i < PRIZE_ROWS.length; i += 1) {
    if (!areNumbersClose(contribs[i] as number, PRIZE_ROWS[i].contribution)) {
      return fail('arithmetic-error', `Contribution = outcome × probability. $${PRIZE_ROWS[i].outcome} × ${PRIZE_ROWS[i].count}/10 = ${PRIZE_ROWS[i].contribution}.`)
    }
  }

  // EV mistakes.
  if (areNumbersClose(ev, 20)) {
    return fail('unweighted-sum', 'You added the raw payouts (15 + 5 + 0 = 20). EV adds the contributions: 3 + 1.5 + 0 = 4.5.')
  }
  if (!areNumbersClose(ev, 4.5)) {
    return fail('arithmetic-error', 'Add the three contributions: 3 + 1.5 + 0 = $4.50.')
  }

  return ok('Correct! Contributions 3, 1.5, 0 → EV = $4.50.')
}

// ===========================================================================
// 13 — l4-payout-vs-profit  (storage: problem-5)
// payout 4, cost 3, profit 1. profit = payout − cost.
// ===========================================================================

export function checkPayoutVsProfit(input: PayoutVsProfitInput): CheckResult {
  if (!input.formulaSelected) {
    return guard('Tap the cost block to build the expected payout − cost equation.')
  }

  const profit = normalizeMoneyAnswer(input.profitAnswer)
  if (profit === null) {
    return guard('Enter the expected profit in dollars.')
  }

  const mistake = detectMistakeType(profit, [
    { value: 4, mistakeType: 'answered-payout' },
    { value: 7, mistakeType: 'added-cost' },
    { value: -1, mistakeType: 'reversed-subtraction' },
  ])
  if (mistake === 'answered-payout') {
    return fail('answered-payout', 'That is the expected payout ($4), not the expected profit. Profit includes what you paid to play, so subtract the $3 cost.')
  }
  if (mistake === 'added-cost') {
    return fail('added-cost', 'Cost lowers the value of the game, so it is subtracted. Use payout − cost ($4 − $3), not payout + cost.')
  }
  if (mistake === 'reversed-subtraction') {
    return fail('reversed-subtraction', 'You computed cost − payout ($3 − $4 = −$1). Start from the payout and subtract the cost: $4 − $3 = $1.')
  }

  if (!areNumbersClose(profit, 1)) {
    return fail('unknown', 'Expected profit = expected payout − cost = $4 − $3 = $1.')
  }

  return ok('Correct! Expected profit = $4 payout − $3 cost = $1.')
}

// ===========================================================================
// 14 — l4-fair-favorable-unfavorable  (storage: problem-6)
// A pays $5 cost $5 → fair; B pays $7 cost $5 → favorable; C pays $3 cost $5 → unfavorable.
// ===========================================================================

const FAIRNESS_CORRECT: Record<string, 'fair' | 'favorable' | 'unfavorable'> = {
  A: 'fair',
  B: 'favorable',
  C: 'unfavorable',
}

export function checkFairnessSort(input: FairnessSortInput): CheckResult {
  const required = ['A', 'B', 'C']
  if (!required.every((g) => input.assignments[g])) {
    return guard('Place all three game cards into buckets (tap a card, then tap a bucket).')
  }

  for (const g of required) {
    const placed = normalizeClassificationAnswer(input.assignments[g])
    const expected = FAIRNESS_CORRECT[g]
    if (placed === expected) {
      continue
    }
    if (g === 'A' && placed === 'favorable') {
      return fail('confused-fair-favorable', 'Game A pays $5 and costs $5, so expected profit is exactly $0. Zero profit is fair, not favorable.')
    }
    if (g === 'C' && placed === 'favorable') {
      return fail('positive-payout-favorable', 'Game C pays $3 but costs $5, so expected profit is −$2. A positive payout alone is not favorable — subtract the cost.')
    }
    if (g === 'B' && placed === 'unfavorable') {
      return fail('reversed-classification', 'Game B pays $7 and costs $5, so expected profit is +$2. Positive profit is favorable, not unfavorable.')
    }
    return fail('forgot-subtract-cost', 'Classify by expected profit = payout − cost: A = $0 (fair), B = +$2 (favorable), C = −$2 (unfavorable).')
  }

  return ok('Correct! A is fair ($0), B is favorable (+$2), C is unfavorable (−$2).')
}

// ===========================================================================
// 15 — l4-find-fair-price
// 50% $8, 50% $0 → expected payout 4. Fair cost 4 → profit 0 → fair.
// ===========================================================================

export function checkFindFairPrice(input: FindFairPriceInput): CheckResult {
  const payout = normalizeMoneyAnswer(input.expectedPayout)
  const cost = normalizeMoneyAnswer(input.fairCost)
  const profit = normalizeMoneyAnswer(input.expectedProfit)

  if (payout === null || cost === null || profit === null || input.classification.trim() === '') {
    return guard('Find the expected payout, the fair cost, the expected profit at that cost, then classify the game.')
  }

  if (!areNumbersClose(payout, 4)) {
    if (areNumbersClose(payout, 8)) {
      return fail('used-largest-payout', 'You used the $8 prize as the expected payout. It only happens half the time: 8 × 0.5 + 0 × 0.5 = $4.')
    }
    return fail('wrong-expected-payout', 'Expected payout = 8 × 0.5 + 0 × 0.5 = $4.')
  }

  if (!areNumbersClose(cost, 4)) {
    if (areNumbersClose(cost, 8)) {
      return fail('used-largest-payout', 'A fair cost equals the expected payout ($4), not the largest prize ($8).')
    }
    if (cost < 4) {
      return fail('cost-below-payout', 'A cost below the $4 expected payout makes the game favorable to the player, not fair. The fair cost equals the expected payout: $4.')
    }
    return fail('cost-above-payout', 'A cost above the $4 expected payout makes the game unfavorable, not fair. The fair cost equals the expected payout: $4.')
  }

  if (!areNumbersClose(profit, 0)) {
    return fail('nonzero-fair-profit', 'A fair game has expected profit $0. With payout $4 and cost $4, profit = 4 − 4 = $0.')
  }

  const classification = normalizeClassificationAnswer(input.classification)
  if (classification !== 'fair') {
    return fail('not-fair-classification', 'When cost equals expected payout, expected profit is $0 and the game is fair.')
  }

  return ok('Correct! Expected payout $4 → fair cost $4 → expected profit $0 → fair.')
}

// ===========================================================================
// 16 — l4-choose-better-game-after-cost
// A payout 9 cost 7 → profit 2; B payout 6 cost 3 → profit 3. Better = B.
// ===========================================================================

export function checkChooseBetterGame(input: ChooseBetterGameInput): CheckResult {
  const profitA = normalizeMoneyAnswer(input.profitA)
  const profitB = normalizeMoneyAnswer(input.profitB)

  if (profitA === null || profitB === null || input.betterGame.trim() === '') {
    return guard('Compute expected profit for each game, then choose the better game.')
  }

  if (!areNumbersClose(profitA, 2)) {
    if (areNumbersClose(profitA, 9)) {
      return fail('forgot-subtract-cost', 'Game A profit is payout − cost = $9 − $7 = $2. You used the payout and forgot the cost.')
    }
    if (areNumbersClose(profitA, 16)) {
      return fail('added-cost', 'Game A: subtract the cost, do not add it. $9 − $7 = $2.')
    }
    return fail('wrong-profit-a', 'Game A expected profit = $9 payout − $7 cost = $2.')
  }

  if (!areNumbersClose(profitB, 3)) {
    if (areNumbersClose(profitB, 6)) {
      return fail('forgot-subtract-cost', 'Game B profit is payout − cost = $6 − $3 = $3. You used the payout and forgot the cost.')
    }
    if (areNumbersClose(profitB, 9)) {
      return fail('added-cost', 'Game B: subtract the cost, do not add it. $6 − $3 = $3.')
    }
    return fail('wrong-profit-b', 'Game B expected profit = $6 payout − $3 cost = $3.')
  }

  const choice = input.betterGame.trim().toLowerCase()
  const choseB = choice === 'b' || choice.includes('game b') || choice === 'game-b'
  const choseA = choice === 'a' || choice.includes('game a') || choice === 'game-a'

  if (choseA) {
    return fail('largest-payout-misconception', 'Game A has the larger payout ($9), but after its $7 cost it returns only $2. Game B returns $3 profit, so Game B is the better game.')
  }
  if (!choseB) {
    return fail('unknown', 'Compare expected profit: Game A = $2, Game B = $3. Game B is better.')
  }

  return ok('Correct! Game A profit $2 vs Game B profit $3 — Game B is the better game after cost.')
}

// ===========================================================================
// 17 — l5-build-whole-ev-model  (storage: problem-7)
// 10-section wheel: $30×1, $10×2, $0×7. cost 5. payout 5, profit 0, fair.
// ===========================================================================

const WHOLE_MODEL = {
  outcomes: [30, 10, 0],
  counts: [1, 2, 7],
  probs: [0.1, 0.2, 0.7],
  contribs: [3, 2, 0],
  sections: 10,
}

export function checkWholeEvModel(input: WholeEvModelInput): CheckResult {
  const probs = WHOLE_MODEL.probs.map((_, i) => parseProbabilityAnswer(input.probabilities[i]))
  const contribs = WHOLE_MODEL.contribs.map((_, i) => normalizeMoneyAnswer(input.contributions[i]))

  if (probs.some((p) => p === null) || contribs.some((c) => c === null)) {
    return guard('Fill in every probability and contribution in the table.')
  }

  for (let i = 0; i < 3; i += 1) {
    if (!areNumbersClose(probs[i] as number, WHOLE_MODEL.probs[i])) {
      const raw = normalizeNumericAnswer(input.probabilities[i])
      if (raw !== null && areNumbersClose(raw, WHOLE_MODEL.counts[i], 0.001)) {
        return fail('count-not-probability', `You used ${WHOLE_MODEL.counts[i]} (the number of sections) as the probability. The wheel has 10 sections, so divide by 10: ${WHOLE_MODEL.counts[i]}/10.`)
      }
      return fail('wrong-denominator', `Probability = sections with that payout ÷ 10. $${WHOLE_MODEL.outcomes[i]} appears on ${WHOLE_MODEL.counts[i]} of 10 sections.`)
    }
    if (!areNumbersClose(contribs[i] as number, WHOLE_MODEL.contribs[i])) {
      return fail('arithmetic-error', `Contribution = outcome × probability. $${WHOLE_MODEL.outcomes[i]} × ${WHOLE_MODEL.counts[i]}/10 = ${WHOLE_MODEL.contribs[i]}.`)
    }
  }

  if (!matchesNumeric(input.expectedPayout, [5])) {
    return fail('wrong-expected-payout', 'Expected payout is the sum of the contributions: 3 + 2 + 0 = $5.')
  }

  if (!matchesNumeric(input.expectedProfit, [0])) {
    if (matchesNumeric(input.expectedProfit, [5])) {
      return fail('payout-not-profit', 'You left profit equal to the payout. Expected profit = $5 payout − $5 cost = $0.')
    }
    return fail('payout-not-profit', 'Expected profit = expected payout ($5) − cost ($5) = $0.')
  }

  const decision = normalizeClassificationAnswer(input.decision)
  if (decision === 'favorable') {
    return fail('fair-marked-favorable', 'Expected profit is $0, so the game is fair — not favorable. A positive payout does not make it favorable once cost is included.')
  }
  if (decision !== 'fair') {
    return fail('unknown', 'With $0 expected profit, the game is fair.')
  }

  return ok('Correct! Expected payout $5, cost $5, expected profit $0 → fair.')
}

// ===========================================================================
// 18 — l5-same-ev-different-risk  (storage: problem-8)
// Guaranteed $5 vs 50/50 $10/$0. EV 5 each. B riskier (variable outcomes).
// ===========================================================================

const SAME_EV_REASON: ExplanationRule = {
  approvedIds: ['variable-outcomes', 'more-spread', 'same-ev-different-risk'],
  rejectedIds: ['higher-ev', 'identical', 'a-riskier'],
  approvedKeywords: ['variable', 'spread', 'jump', 'vary', 'varies', '0 or 10', 'different risk', 'range'],
  contradictoryKeywords: ['identical', 'same game', 'higher ev', 'guaranteed b', 'no risk', 'same risk'],
}

export function checkSameEvDifferentRisk(input: SameEvDifferentRiskInput): CheckResult {
  if (!input.gameASimulated || !input.gameBSimulated) {
    return guard('Run all 20 simulated trials for each game before answering.')
  }

  if (!matchesNumeric(input.evA, [5])) {
    if (matchesNumeric(input.evA, [10])) {
      return fail('average-vs-guaranteed', 'Game A pays $5 every single time, so its EV is exactly $5.')
    }
    return fail('average-vs-guaranteed', 'Game A is a guaranteed $5, so EV(A) = $5.')
  }

  if (matchesNumeric(input.evB, [10])) {
    return fail('b-higher-ev', 'Game B can pay $10, but only half the time. Its EV is 10 × 0.5 + 0 × 0.5 = $5 — the same as Game A.')
  }
  if (!matchesNumeric(input.evB, [5])) {
    return fail('b-higher-ev', 'Game B: 50% of $10 + 50% of $0 = $5.')
  }

  const risk = input.higherRisk.trim().toLowerCase()
  const choseB = risk === 'b' || risk.includes('game b') || risk === 'game-b'
  if (!choseB) {
    return fail('identical-games', 'Same EV does not mean identical risk. Game B swings between $0 and $10, so Game B is the riskier game.')
  }

  const verdict = evaluateExplanation(input.reason, SAME_EV_REASON)
  if (verdict.kind === 'contradictory') {
    return fail('identical-games', 'Both games average $5, but they are not the same. Game B is riskier because its outcomes vary between $0 and $10.')
  }
  if (verdict.kind === 'insufficient') {
    return fail('identical-games', 'Explain the risk in terms of spread: Game B is riskier because its outcomes vary between $0 and $10 even though the average matches.')
  }

  return ok('Correct! Both average $5, but Game B is riskier because its outcomes vary between $0 and $10.')
}

// ===========================================================================
// 19 — l5-low-risk-vs-high-risk
// Guaranteed $6 vs 50/50 $12/$0. EV 6 each. B riskier (wider spread).
// ===========================================================================

const LOW_HIGH_REASON: ExplanationRule = {
  approvedIds: ['wider-spread', 'variable-outcomes', 'same-ev-different-risk'],
  rejectedIds: ['higher-ev', 'identical', 'a-riskier'],
  approvedKeywords: ['wider', 'spread', 'variable', 'vary', 'varies', '0 or 12', 'different risk', 'range'],
  contradictoryKeywords: ['identical', 'same game', 'higher ev', 'guaranteed b', 'no risk', 'same risk'],
}

export function checkLowVsHighRisk(input: LowVsHighRiskInput): CheckResult {
  if (!input.gameASimulated || !input.gameBSimulated) {
    return guard('Run all 20 simulated trials for each game before answering.')
  }

  if (!matchesNumeric(input.evA, [6])) {
    if (matchesNumeric(input.evA, [12])) {
      return fail('average-vs-guaranteed', 'Game A pays $6 every time, so its EV is exactly $6.')
    }
    return fail('average-vs-guaranteed', 'Game A is a guaranteed $6, so EV(A) = $6.')
  }

  if (matchesNumeric(input.evB, [12])) {
    return fail('b-higher-ev', 'Game B can pay $12, but only half the time. Its EV is 12 × 0.5 + 0 × 0.5 = $6 — the same as Game A.')
  }
  if (!matchesNumeric(input.evB, [6])) {
    return fail('b-higher-ev', 'Game B: 50% of $12 + 50% of $0 = $6.')
  }

  const risk = input.higherRisk.trim().toLowerCase()
  const choseB = risk === 'b' || risk.includes('game b') || risk === 'game-b'
  if (!choseB) {
    return fail('identical-games', 'Both average $6, but only Game A guarantees it. Game B ranges from $0 to $12, so Game B is riskier.')
  }

  const verdict = evaluateExplanation(input.reason, LOW_HIGH_REASON)
  if (verdict.kind === 'contradictory') {
    return fail('identical-games', 'Both average $6, but they are not the same. Game B has a wider spread of outcomes ($0 to $12), so it is riskier.')
  }
  if (verdict.kind === 'insufficient') {
    return fail('identical-games', 'Explain the risk by spread: Game B is riskier because its possible outcomes range more widely ($0 to $12) even though the average matches.')
  }

  return ok('Correct! Both average $6, but Game B has a wider spread ($0 to $12), so it is riskier.')
}

// ===========================================================================
// 20 — l5-final-capstone-ev-decision
// 12-section wheel: $36×1, $12×3, $0×8. cost 6. payout 6, profit 0, fair.
// Probabilities: 1/12, 3/12 (1/4), 8/12 (2/3). Contributions 3, 3, 0.
// ===========================================================================

const CAPSTONE = {
  outcomes: [36, 12, 0],
  counts: [1, 3, 8],
  probs: [1 / 12, 3 / 12, 8 / 12],
  contribs: [3, 3, 0],
  sections: 12,
}

// Tight tolerance that accepts the PRD's rounded decimals (0.0833/0.083,
// 0.6667/0.667) but rejects meaningfully wrong probabilities.
const CAPSTONE_PROB_TOLERANCE = 0.005

const CAPSTONE_RISK: ExplanationRule = {
  approvedIds: ['variable-outcomes', 'fair-but-variable', 'not-guaranteed'],
  rejectedIds: ['no-risk', 'guaranteed-return', 'risk-free'],
  approvedKeywords: ['variable', 'vary', 'varies', 'spread', 'range', '0, 12', '0, $12', 'not guaranteed', 'still risk', 'fair but', 'can be 0', 'can get 0'],
  // Specific phrases so valid negations ("not guaranteed") are NOT flagged.
  contradictoryKeywords: ['no risk', 'risk free', 'risk-free', 'riskless', 'guaranteed to', 'is guaranteed', 'are guaranteed', 'always returns', 'always get', 'no variance'],
}

export function checkCapstone(input: CapstoneInput): CheckResult {
  const probs = CAPSTONE.probs.map((_, i) => parseProbabilityAnswer(input.probabilities[i]))
  const contribs = CAPSTONE.contribs.map((_, i) => normalizeMoneyAnswer(input.contributions[i]))

  if (probs.some((p) => p === null) || contribs.some((c) => c === null)) {
    return guard('Fill in every probability and contribution in the table.')
  }

  for (let i = 0; i < 3; i += 1) {
    if (!areProbabilitiesEquivalent(input.probabilities[i], CAPSTONE.probs[i], CAPSTONE_PROB_TOLERANCE)) {
      const raw = normalizeNumericAnswer(input.probabilities[i])
      if (raw !== null && areNumbersClose(raw, CAPSTONE.counts[i], 0.001)) {
        return fail('count-not-probability', `You used ${CAPSTONE.counts[i]} (the number of sections) as the probability. The wheel has 12 sections, so use ${CAPSTONE.counts[i]}/12.`)
      }
      return fail('wrong-denominator', `Probability = sections with that payout ÷ 12. $${CAPSTONE.outcomes[i]} appears on ${CAPSTONE.counts[i]} of 12 sections.`)
    }
    if (!areNumbersClose(contribs[i] as number, CAPSTONE.contribs[i])) {
      return fail('arithmetic-error', `Contribution = outcome × probability. $${CAPSTONE.outcomes[i]} × ${CAPSTONE.counts[i]}/12 = ${CAPSTONE.contribs[i]}.`)
    }
  }

  if (!matchesNumeric(input.expectedPayout, [6])) {
    return fail('wrong-expected-payout', 'Expected payout is the sum of the contributions: 3 + 3 + 0 = $6.')
  }

  if (!matchesNumeric(input.expectedProfit, [0])) {
    if (matchesNumeric(input.expectedProfit, [6])) {
      return fail('payout-not-profit', 'You left profit equal to the payout. Expected profit = $6 payout − $6 cost = $0.')
    }
    return fail('payout-not-profit', 'Expected profit = expected payout ($6) − cost ($6) = $0.')
  }

  const decision = normalizeClassificationAnswer(input.decision)
  if (decision === 'favorable') {
    return fail('fair-marked-favorable', 'Expected profit is $0, so the game is fair — not favorable just because the payout is positive.')
  }
  if (decision !== 'fair') {
    return fail('unknown', 'With $0 expected profit, the game is fair.')
  }

  const verdict = evaluateExplanation(input.riskExplanation, CAPSTONE_RISK)
  if (verdict.kind === 'contradictory') {
    return fail('fair-means-no-risk', 'Fair describes the long-run average, not a single play. A fair game still has risk: one spin can pay $0, $12, or $36.')
  }
  if (verdict.kind === 'insufficient') {
    return fail('average-not-guaranteed', 'Explain that fairness is about the average: a single play is still variable and can return $0, $12, or $36 — the $6 is not guaranteed each time.')
  }

  return ok('Correct! Expected payout $6 = cost $6 → fair, but individual plays still vary ($0, $12, or $36).')
}

// ===========================================================================
// Checker registry
// ===========================================================================

export const problemPackBCheckers: Record<PackCanonicalSlug, PackChecker> = {
  'l3-repair-probability-table': (i) => checkRepairProbabilityTable(i as RepairTableInput),
  'l3-prize-bag-ev-table': (i) => checkPrizeBagEvTable(i as PrizeBagInput),
  'l4-payout-vs-profit': (i) => checkPayoutVsProfit(i as PayoutVsProfitInput),
  'l4-fair-favorable-unfavorable': (i) => checkFairnessSort(i as FairnessSortInput),
  'l4-find-fair-price': (i) => checkFindFairPrice(i as FindFairPriceInput),
  'l4-choose-better-game-after-cost': (i) => checkChooseBetterGame(i as ChooseBetterGameInput),
  'l5-build-whole-ev-model': (i) => checkWholeEvModel(i as WholeEvModelInput),
  'l5-same-ev-different-risk': (i) => checkSameEvDifferentRisk(i as SameEvDifferentRiskInput),
  'l5-low-risk-vs-high-risk': (i) => checkLowVsHighRisk(i as LowVsHighRiskInput),
  'l5-final-capstone-ev-decision': (i) => checkCapstone(i as CapstoneInput),
}

export function checkPackProblem(slug: PackCanonicalSlug, input: PackCheckInput): CheckResult {
  return problemPackBCheckers[slug](input)
}

// Re-export the constant tables so state factories / tests share one source of truth.
export const PACK_ANSWER_KEYS = {
  repair: { rows: REPAIR_ROWS, total: REPAIR_TOTAL },
  prizeBag: { rows: PRIZE_ROWS, total: PRIZE_TOTAL, ev: 4.5 },
  wholeModel: WHOLE_MODEL,
  capstone: CAPSTONE,
}
