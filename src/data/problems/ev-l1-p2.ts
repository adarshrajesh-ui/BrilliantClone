import type { CheckResult, ProblemDefinition } from '../../types/problem'
import { normalizeNumericAnswer, areNumbersClose } from '../../lib/answerParser'

// Canonical metadata fields land on `ProblemDefinition` during Agent 1's
// integration; until then they live on this local widening so the defs compile.
type CanonicalDefinition = ProblemDefinition & { canonicalSlug?: string; legacyProblemId?: string }

export const PROBLEM_EV_L1_P2: CanonicalDefinition = {
  problemId: 'ev-l1-p2',
  canonicalSlug: 'ev-l1-p2',
  legacyProblemId: 'l1-unequal-spinner',
  title: 'Unequal Section Game',
  concept: 'Expected value remains a long-run average even when outcomes are not equally likely.',
  difficulty: 2,
  scenarioText:
    'A spinner has a 25% chance of winning $20 and a 75% chance of winning $0. The $20 section is one quarter of the wheel; the $0 section is three quarters. Predict the long-run average, then spin many times to confirm it.',
  visualType: 'spinner',
  interactionType: 'simulate-and-predict',
  givenData: { outcomes: [20, 0], probabilities: [0.25, 0.75], minSpins: 100 },
  requiredActions: ['submit-prediction', 'spin-100', 'identify-average'],
  answerInputs: ['prediction', 'finalAnswer'],
  correctAnswers: { finalAnswer: 5 },
  acceptedFormats: { finalAnswer: ['5', '5.0', '5.00', '$5', '$5.00', '5 dollars'] },
  mistakeRules: [
    { mistakeType: 'used-largest-payout', feedback: 'The $20 outcome is larger, but it happens only one quarter of the time. Expected value accounts for both payout and probability. Multiply $20 by 0.25, then include the $0 outcome.' },
    { mistakeType: 'divided-payout-by-percent', feedback: 'A 25% chance does not mean $20 ÷ 25. Probability multiplies the payout: 20 × 0.25 = 5. Then add the $0 outcome.' },
    { mistakeType: 'ignored-payout', feedback: 'The $0 outcome is common, but the $20 quarter still contributes. EV = 20 × 0.25 + 0 × 0.75 = $5, not $0.' },
    { mistakeType: 'short-run-variation', feedback: 'Your spins may have wandered above or below, but the theoretical long-run average is exactly $5. Multiply 20 × 0.25 and add 0 × 0.75.' },
  ],
  feedback: { correct: 'Correct! 20 × 0.25 + 0 × 0.75 = $5. The one-quarter $20 section contributes the whole $5.' },
  teachingExplanation: {
    title: 'Why this makes sense',
    body: [
      'The $20 prize is bigger than $0, but it only appears one quarter of the time. Expected value weights every outcome by how often it happens.',
      'The $20 section covers one quarter of the wheel, so it contributes 20 × 0.25 = $5. The large $0 section adds 0 × 0.75 = $0. Together the long-run average is $5 — exactly where the running-average line settles.',
    ],
    takeaway: 'Section size is probability: weight each payout by its chance, then add the contributions.',
  },
  hints: [
    { id: 'evl1p2-h1', label: 'Section = chance', content: 'The $20 section is one quarter of the wheel, so its probability is 0.25.' },
    { id: 'evl1p2-h2', label: 'Weight the payout', content: 'Multiply each payout by its probability: 20 × 0.25 and 0 × 0.75.' },
    { id: 'evl1p2-h3', label: 'Add the pieces', content: '20 × 0.25 + 0 × 0.75 = 5 + 0 = $5.' },
  ],
  completionRule: 'Submit a prediction, run at least 100 total spins, and identify $5 as the long-run average.',
  masteryTags: ['long-run-average', 'weighted-average'],
}

/** Deterministic spin outcome: $20 on the first quarter of the hash range, else $0. */
function hash01(seed: number, index: number): number {
  let h = (seed ^ (index + 0x85ebca6b)) >>> 0
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0
  h = (h ^ (h >>> 16)) >>> 0
  return h / 0x100000000
}

export function evL1P2SpinOutcome(seed: number, index: number): number {
  return hash01(seed, index) < 0.25 ? 20 : 0
}

export interface EvL1P2CheckInput {
  predictionSubmitted: boolean
  totalSpins: number
  finalAnswer: string
}

const guard = (feedback: string): CheckResult => ({ isCorrect: false, mistakeType: '', feedback, canComplete: false })
const wrong = (mistakeType: string, feedback: string): CheckResult => ({ isCorrect: false, mistakeType, feedback, canComplete: false })

export function checkEvL1P2(input: EvL1P2CheckInput): CheckResult {
  if (!input.predictionSubmitted) {
    return guard('Submit your prediction before the final check.')
  }
  if (input.totalSpins < 100) {
    return guard(`Run at least 100 total spins (${input.totalSpins}/100).`)
  }
  const value = input.finalAnswer.includes('%') ? null : normalizeNumericAnswer(input.finalAnswer)
  if (value === null) {
    return guard('Enter the long-run average per spin.')
  }
  if (areNumbersClose(value, 5)) {
    return { isCorrect: true, mistakeType: null, feedback: PROBLEM_EV_L1_P2.feedback.correct, canComplete: true }
  }
  if (areNumbersClose(value, 20)) {
    return wrong('used-largest-payout', PROBLEM_EV_L1_P2.mistakeRules[0].feedback)
  }
  if (areNumbersClose(value, 0.8)) {
    return wrong('divided-payout-by-percent', PROBLEM_EV_L1_P2.mistakeRules[1].feedback)
  }
  if (areNumbersClose(value, 0)) {
    return wrong('ignored-payout', PROBLEM_EV_L1_P2.mistakeRules[2].feedback)
  }
  return wrong('short-run-variation', PROBLEM_EV_L1_P2.mistakeRules[3].feedback)
}
