import type { CheckResult, ProblemDefinition } from '../../types/problem'
import {
  areNumbersClose,
  areProbabilitiesEquivalent,
  normalizeClassificationAnswer,
  normalizeNumericAnswer,
  parseProbabilityAnswer,
} from '../../lib/answerParser'

/** ProblemDefinition + canonical-model metadata (Agent 1 reconciles at integration). */
export interface CanonicalProblemDefinition extends ProblemDefinition {
  canonicalSlug?: string
  legacyProblemId?: string
  desktopWorkspaceLayout?: string
  mobileWorkspaceLayout?: string
}

/** Final-decision capstone answer payload. New, local CheckInput type (listed for Agent 1). */
export interface FinalDecisionCheckInput {
  /** Whether the learner grouped the wheel sections by tapping each payout. */
  grouped: boolean
  /** $36, $12, $0 probabilities, in that order. */
  probabilities: [string, string, string]
  /** $36, $12, $0 contributions, in that order. */
  contributions: [string, string, string]
  expectedPayout: string
  expectedProfit: string
  decision: string
  /** Risk-interpretation MC option key. */
  riskChoice: string
}

const OUTCOMES = [36, 12, 0]
const SECTION_COUNTS = [1, 3, 8]
const EXPECTED_PROBS = [1 / 12, 3 / 12, 8 / 12]
const EXPECTED_CONTRIBS = [3, 3, 0]

const ok = (feedback: string, canComplete = false): CheckResult => ({
  isCorrect: canComplete,
  mistakeType: null,
  feedback,
  canComplete,
})

const guard = (feedback: string): CheckResult => ({
  isCorrect: false,
  mistakeType: null,
  feedback,
  canComplete: false,
})

const fail = (mistakeType: string, feedback: string): CheckResult => ({
  isCorrect: false,
  mistakeType,
  feedback,
  canComplete: false,
})

const normalizeAmountAnswer = (value: string): number | null => {
  if (value.includes('%')) {
    return null
  }
  return normalizeNumericAnswer(value)
}

const matchesNumericAnswer = (value: string, targets: number[], tolerance = 0.01): boolean => {
  const parsed = normalizeAmountAnswer(value)
  if (parsed === null) {
    return false
  }
  return targets.some((target) => areNumbersClose(parsed, target, tolerance))
}

/**
 * Deterministic checker for the chapter capstone "Final Carnival Decision".
 * Validates the full EV model: probabilities (sections ÷ 12) → contributions →
 * expected payout → expected profit (− $6 cost) → fairness → risk interpretation.
 */
export function checkFinalDecision(input: FinalDecisionCheckInput): CheckResult {
  if (!input.grouped) {
    return guard('Tap the wheel sections to group them by payout first.')
  }

  const probs = input.probabilities.map((p) => parseProbabilityAnswer(p))
  const contribs = input.contributions.map((c) => normalizeAmountAnswer(c))
  if (probs.some((p) => p === null) || contribs.some((c) => c === null)) {
    return guard('Fill in every probability and contribution in the table.')
  }

  for (let i = 0; i < 3; i += 1) {
    if (!areProbabilitiesEquivalent(input.probabilities[i], EXPECTED_PROBS[i])) {
      const raw = normalizeAmountAnswer(input.probabilities[i])
      if (raw !== null && areNumbersClose(raw, SECTION_COUNTS[i], 0.001)) {
        return fail(
          'counts-not-probability',
          `You entered ${SECTION_COUNTS[i]} — that is the number of $${OUTCOMES[i]} sections, not the probability. The wheel has 12 sections, so divide by 12: ${SECTION_COUNTS[i]}/12.`,
        )
      }
      return fail(
        'wrong-denominator',
        `Probability = sections with that payout ÷ 12 total sections. $${OUTCOMES[i]} appears on ${SECTION_COUNTS[i]} of 12 sections.`,
      )
    }
  }

  for (let i = 0; i < 3; i += 1) {
    if (!areNumbersClose(contribs[i] as number, EXPECTED_CONTRIBS[i])) {
      if (i === 2) {
        return fail(
          'omitted-zero-row',
          'The $0 row still belongs in the sum — it contributes 0 × 8/12 = $0. Enter 0 for that row.',
        )
      }
      return fail(
        'arithmetic-error',
        `Contribution = outcome × probability. $${OUTCOMES[i]} × ${SECTION_COUNTS[i]}/12 = ${EXPECTED_CONTRIBS[i]}.`,
      )
    }
  }

  if (!matchesNumericAnswer(input.expectedPayout, [6])) {
    return fail('arithmetic-error', 'Expected payout is the sum of the contributions: 3 + 3 + 0 = $6.')
  }

  if (matchesNumericAnswer(input.expectedProfit, [6])) {
    return fail('payout-not-profit', 'You entered the expected payout. Expected profit = payout ($6) − cost ($6) = $0.')
  }
  if (!matchesNumericAnswer(input.expectedProfit, [0])) {
    return fail('arithmetic-error', 'Expected profit = expected payout ($6) − cost ($6) = $0.')
  }

  const decision = normalizeClassificationAnswer(input.decision)
  if (decision === null) {
    return guard('Choose whether the game is fair, favorable, or unfavorable.')
  }
  if (decision === 'favorable') {
    return fail('fair-marked-favorable', 'Expected profit is $0, so the game is fair — not favorable just because the payout is positive.')
  }
  if (decision !== 'fair') {
    return fail('marked-unfavorable', 'Expected profit is exactly $0, so the game is fair — neither favorable nor unfavorable.')
  }

  const risk = input.riskChoice.trim().toLowerCase()
  if (risk === '') {
    return guard('Select the statement that best interprets the risk.')
  }
  if (risk === 'no-risk') {
    return fail('believed-fair-has-no-risk', 'A fair game is not risk-free. Each play still varies — you might get $0, $12, or $36 — even though the long-run average profit is $0.')
  }
  if (risk === 'guaranteed') {
    return fail('confused-ev-with-guaranteed', 'Expected value is a long-run average, not a guarantee. A single play can return $0, $12, or $36 — you do not always get $6 back.')
  }
  if (risk !== 'variable-outcomes') {
    return fail('believed-fair-has-no-risk', 'The game is fair on average, but individual plays still vary between $0, $12, and $36.')
  }

  return ok(
    'Correct — expected payout is $6 and the cost is $6, so expected profit is $0 and the game is fair. Fairness is the long-run average; a single play can still be $0, $12, or $36.',
    true,
  )
}

// ---- Per-step checkers (validate ONLY the step's own field) ----
// These reuse the same mistakeType strings / feedback as the holistic checker
// but NEVER set `canComplete` — completion stays with the FINAL holistic check
// on the last (risk) step. Guard (not-yet-answerable) results use
// `mistakeType: ''` so the step badge stays unset, matching the EvL2P3 pattern.

const stepOk = (feedback: string): CheckResult => ({
  isCorrect: true,
  mistakeType: null,
  feedback,
  canComplete: false,
})

const stepGuard = (feedback: string): CheckResult => ({
  isCorrect: false,
  mistakeType: '',
  feedback,
  canComplete: false,
})

/** Step 'table': probabilities (sections ÷ 12) AND contributions (outcome × prob). */
export function checkEvL5P3Table(
  probabilities: [string, string, string],
  contributions: [string, string, string],
): CheckResult {
  const probs = probabilities.map((p) => parseProbabilityAnswer(p))
  const contribs = contributions.map((c) => normalizeAmountAnswer(c))
  if (probs.some((p) => p === null) || contribs.some((c) => c === null)) {
    return stepGuard('Fill in every probability and contribution in the table.')
  }

  for (let i = 0; i < 3; i += 1) {
    if (!areProbabilitiesEquivalent(probabilities[i], EXPECTED_PROBS[i])) {
      const raw = normalizeAmountAnswer(probabilities[i])
      if (raw !== null && areNumbersClose(raw, SECTION_COUNTS[i], 0.001)) {
        return fail(
          'counts-not-probability',
          `You entered ${SECTION_COUNTS[i]} — that is the number of $${OUTCOMES[i]} sections, not the probability. The wheel has 12 sections, so divide by 12: ${SECTION_COUNTS[i]}/12.`,
        )
      }
      return fail(
        'wrong-denominator',
        `Probability = sections with that payout ÷ 12 total sections. $${OUTCOMES[i]} appears on ${SECTION_COUNTS[i]} of 12 sections.`,
      )
    }
  }

  for (let i = 0; i < 3; i += 1) {
    if (!areNumbersClose(contribs[i] as number, EXPECTED_CONTRIBS[i])) {
      if (i === 2) {
        return fail(
          'omitted-zero-row',
          'The $0 row still belongs in the sum — it contributes 0 × 8/12 = $0. Enter 0 for that row.',
        )
      }
      return fail(
        'arithmetic-error',
        `Contribution = outcome × probability. $${OUTCOMES[i]} × ${SECTION_COUNTS[i]}/12 = ${EXPECTED_CONTRIBS[i]}.`,
      )
    }
  }

  return stepOk('Correct — probabilities are sections ÷ 12 and each contribution is outcome × probability (3, 3, 0).')
}

/** Step 'payout': expected payout = sum of contributions ($6). */
export function checkEvL5P3Payout(expectedPayout: string): CheckResult {
  if (expectedPayout.trim() === '') {
    return stepGuard('Add the contributions to get the expected payout.')
  }
  if (!matchesNumericAnswer(expectedPayout, [6])) {
    return fail('arithmetic-error', 'Expected payout is the sum of the contributions: 3 + 3 + 0 = $6.')
  }
  return stepOk('Correct — expected payout is 3 + 3 + 0 = $6.')
}

/** Step 'profit': expected profit = payout ($6) − cost ($6) = $0. */
export function checkEvL5P3Profit(expectedProfit: string): CheckResult {
  if (expectedProfit.trim() === '') {
    return stepGuard('Subtract the $6 cost to get the expected profit.')
  }
  if (matchesNumericAnswer(expectedProfit, [6])) {
    return fail('payout-not-profit', 'You entered the expected payout. Expected profit = payout ($6) − cost ($6) = $0.')
  }
  if (!matchesNumericAnswer(expectedProfit, [0])) {
    return fail('arithmetic-error', 'Expected profit = expected payout ($6) − cost ($6) = $0.')
  }
  return stepOk('Correct — expected profit = $6 − $6 = $0.')
}

/** Step 'decide': $0 expected profit means the game is fair. */
export function checkEvL5P3Decision(decision: string): CheckResult {
  const d = normalizeClassificationAnswer(decision)
  if (d === null) {
    return stepGuard('Choose whether the game is fair, favorable, or unfavorable.')
  }
  if (d === 'favorable') {
    return fail('fair-marked-favorable', 'Expected profit is $0, so the game is fair — not favorable just because the payout is positive.')
  }
  if (d !== 'fair') {
    return fail('marked-unfavorable', 'Expected profit is exactly $0, so the game is fair — neither favorable nor unfavorable.')
  }
  return stepOk('Correct — $0 expected profit means the game is fair.')
}

/** Step 'risk': a fair game still has variable individual outcomes. */
export function checkEvL5P3Risk(riskChoice: string): CheckResult {
  const risk = riskChoice.trim().toLowerCase()
  if (risk === '') {
    return stepGuard('Select the statement that best interprets the risk.')
  }
  if (risk === 'no-risk') {
    return fail('believed-fair-has-no-risk', 'A fair game is not risk-free. Each play still varies — you might get $0, $12, or $36 — even though the long-run average profit is $0.')
  }
  if (risk === 'guaranteed') {
    return fail('confused-ev-with-guaranteed', 'Expected value is a long-run average, not a guarantee. A single play can return $0, $12, or $36 — you do not always get $6 back.')
  }
  if (risk !== 'variable-outcomes') {
    return fail('believed-fair-has-no-risk', 'The game is fair on average, but individual plays still vary between $0, $12, and $36.')
  }
  return stepOk('Correct — the game is fair on average, but each single play still varies between $0, $12, and $36.')
}

export const EV_L5_P3: CanonicalProblemDefinition = {
  problemId: 'ev-l5-p3',
  canonicalSlug: 'ev-l5-p3',
  legacyProblemId: 'l5-final-capstone-ev-decision',
  title: 'Final Carnival Decision',
  concept: 'Build a complete EV model and use payout, cost, fairness, and risk together.',
  difficulty: 9,
  scenarioText:
    'A carnival wheel has 12 equal sections: 1 pays $36, 3 pay $12, and 8 pay $0. It costs $6 to play. Build the full model: probabilities, contributions, expected payout, expected profit, the fairness decision, and a risk interpretation.',
  visualType: 'wheel-table',
  interactionType: 'full-ev-capstone',
  givenData: {
    sections: 12,
    outcomes: [{ v: 36, n: 1 }, { v: 12, n: 3 }, { v: 0, n: 8 }],
    cost: 6,
  },
  requiredActions: ['group-wheel', 'fill-table', 'payout', 'profit', 'decision', 'risk'],
  answerInputs: ['probabilities', 'contributions', 'expectedPayout', 'expectedProfit', 'decision', 'riskChoice'],
  correctAnswers: {
    probabilities: [1 / 12, 3 / 12, 8 / 12],
    contributions: [3, 3, 0],
    expectedPayout: 6,
    expectedProfit: 0,
    decision: 'fair',
    riskChoice: 'variable-outcomes',
  },
  acceptedFormats: {
    probability: ['1/12', '0.0833', '0.083', '3/12', '1/4', '0.25', '25%', '8/12', '2/3', '0.6667', '0.667'],
    decision: ['fair', 'favorable', 'unfavorable'],
  },
  mistakeRules: [
    { mistakeType: 'wrong-denominator', feedback: 'The wheel has 12 total sections, so divide each section count by 12.' },
    { mistakeType: 'counts-not-probability', feedback: 'You used a section count as the probability. Divide by 12.' },
    { mistakeType: 'omitted-zero-row', feedback: 'The $0 row still belongs in the sum at 0 × 8/12 = $0.' },
    { mistakeType: 'arithmetic-error', feedback: 'Recheck the multiplication and addition: 3 + 3 + 0 = $6.' },
    { mistakeType: 'payout-not-profit', feedback: 'Subtract the $6 cost from the $6 payout to get $0 profit.' },
    { mistakeType: 'fair-marked-favorable', feedback: 'Zero expected profit is fair, not favorable.' },
    { mistakeType: 'confused-ev-with-guaranteed', feedback: 'Expected value is a long-run average, not a guaranteed result.' },
    { mistakeType: 'believed-fair-has-no-risk', feedback: 'A fair game still has variable individual outcomes.' },
  ],
  feedback: {
    correct:
      'Correct — expected payout $6 = cost $6, so expected profit is $0 and the game is fair. A single play can still be $0, $12, or $36.',
  },
  teachingExplanation: {
    title: 'The whole model, end to end',
    body: [
      'Turn section counts into probabilities (÷ 12), multiply each payout by its probability for contributions, then sum: 36 × 1/12 = 3, 12 × 3/12 = 3, 0 × 8/12 = 0, so expected payout is $6.',
      'Subtract the $6 cost to get $0 expected profit — the game is fair. Fairness describes the long-run average for the player; it does not mean every play returns the entry cost. A single play can still land on $0, $12, or $36.',
    ],
    takeaway: 'Probabilities → contributions → payout → subtract cost → classify → interpret the remaining risk.',
  },
  hints: [
    { id: 'p3-h1', label: 'Sections ÷ 12', content: 'Probability = (sections with that payout) / 12.' },
    { id: 'p3-h2', label: 'Contributions', content: 'Each row: outcome × probability. 36 × 1/12 = 3, 12 × 3/12 = 3, 0 × 8/12 = 0.' },
    { id: 'p3-h3', label: 'Profit', content: 'Expected profit = expected payout ($6) − cost ($6) = $0.' },
    { id: 'p3-h4', label: 'Fair ≠ risk-free', content: 'Zero expected profit is fair, but a single play still varies between $0, $12, and $36.' },
  ],
  completionRule:
    'Group the wheel, fill all probabilities and contributions, compute payout ($6) and profit ($0), choose Fair, and pick the correct risk interpretation.',
  masteryTags: ['full-ev-model', 'payout-vs-profit', 'fairness', 'same-ev-different-risk'],
}
