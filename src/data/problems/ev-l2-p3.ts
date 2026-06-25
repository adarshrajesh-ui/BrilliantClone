import type { CheckResult, ProblemDefinition } from '../../types/problem'

// Canonical metadata fields land on `ProblemDefinition` during Agent 1's
// integration; until then they live on this local widening so the defs compile.
type CanonicalDefinition = ProblemDefinition & { canonicalSlug?: string; legacyProblemId?: string }

export const PROBLEM_EV_L2_P3: CanonicalDefinition = {
  problemId: 'ev-l2-p3',
  canonicalSlug: 'ev-l2-p3',
  legacyProblemId: 'l2-diagnose-bad-ev-setups',
  title: 'Diagnose Bad EV Setups',
  concept: 'A complete EV model multiplies every outcome by its probability and represents all possible outcomes.',
  difficulty: 3,
  scenarioText:
    'A game pays $20 with probability 0.25, $4 with probability 0.25, and $0 with probability 0.5. Three formulas are proposed. Pick the valid one and diagnose what is wrong with the other two.',
  visualType: 'weighted-average',
  interactionType: 'diagnose-formulas',
  givenData: {
    outcomes: [20, 4, 0],
    probabilities: [0.25, 0.25, 0.5],
    formulas: {
      A: '20 + 4 + 0',
      B: '20 × 0.25 + 4 × 0.25',
      C: '20 × 0.25 + 4 × 0.25 + 0 × 0.5',
    },
  },
  requiredActions: ['select-valid', 'diagnose-a', 'diagnose-b'],
  answerInputs: ['valid', 'defectA', 'defectB'],
  correctAnswers: { valid: 'C', defectA: 'no-probability', defectB: 'omits-zero' },
  acceptedFormats: { valid: ['C'] },
  mistakeRules: [
    { mistakeType: 'chose-raw-sum', feedback: 'Formula A just adds the raw payouts with no probability weighting. A valid model multiplies each outcome by its probability.' },
    { mistakeType: 'chose-incomplete', feedback: 'Formula B leaves out the $0 outcome. Even though $0 contributes nothing, it carries half the probability, so the model is incomplete.' },
    { mistakeType: 'wrong-defect-a', feedback: 'Formula A’s problem is that it sums raw payouts without multiplying by probability.' },
    { mistakeType: 'wrong-defect-b', feedback: 'Formula B produces the same numeric contribution from the positive payouts, but it leaves half the probability unrepresented by omitting the $0 outcome.' },
  ],
  feedback: { correct: 'Correct! C is valid. A sums raw payouts without probability; B omits the $0 outcome and its 0.5 probability.' },
  teachingExplanation: {
    title: 'Why this makes sense',
    body: [
      'Formula A adds the payouts directly, ignoring how likely each one is — that is a raw sum, not an expected value. Formula B multiplies by probability but quietly drops the $0 outcome.',
      'Formula B gives the same number as C (5 + 1 + 0 = 6), which makes it tempting. But a complete model must account for all the probability. The $0 outcome holds half of it, so leaving it out hides where the other 50% goes.',
    ],
    takeaway: 'A complete EV model multiplies every outcome by its probability — including the $0 outcome that still carries probability.',
  },
  hints: [
    { id: 'evl2p3-h1', label: 'Probability weighting', content: 'A valid formula multiplies each outcome by its probability — Formula A never does.' },
    { id: 'evl2p3-h2', label: 'All outcomes', content: 'List every outcome, even $0. Formula B is missing the 0 × 0.5 term.' },
    { id: 'evl2p3-h3', label: 'Total probability', content: 'The probabilities must add to 1: 0.25 + 0.25 + 0.5. Formula B only accounts for 0.5.' },
  ],
  completionRule: 'Select formula C as valid, identify A as a raw sum without probability, and identify B as omitting the $0 outcome.',
  masteryTags: ['weighted-average', 'complete-ev-model'],
}

export type EvL2P3Formula = 'A' | 'B' | 'C'
export type EvL2P3Defect = 'no-probability' | 'omits-zero' | 'wrong-multiplication' | 'nothing-wrong'

export interface EvL2P3CheckInput {
  valid: EvL2P3Formula | null
  defectA: EvL2P3Defect | null
  defectB: EvL2P3Defect | null
}

const guard = (feedback: string): CheckResult => ({ isCorrect: false, mistakeType: '', feedback, canComplete: false })
const wrong = (mistakeType: string, feedback: string): CheckResult => ({ isCorrect: false, mistakeType, feedback, canComplete: false })

export function checkEvL2P3(input: EvL2P3CheckInput): CheckResult {
  if (input.valid === null) {
    return guard('Select the formula that is a valid, complete EV model.')
  }
  if (input.valid === 'A') {
    return wrong('chose-raw-sum', PROBLEM_EV_L2_P3.mistakeRules[0].feedback)
  }
  if (input.valid === 'B') {
    return wrong('chose-incomplete', PROBLEM_EV_L2_P3.mistakeRules[1].feedback)
  }
  if (input.defectA === null || input.defectB === null) {
    return guard('Diagnose the defect in both Formula A and Formula B.')
  }
  if (input.defectA !== 'no-probability') {
    return wrong('wrong-defect-a', PROBLEM_EV_L2_P3.mistakeRules[2].feedback)
  }
  if (input.defectB !== 'omits-zero') {
    return wrong('wrong-defect-b', PROBLEM_EV_L2_P3.mistakeRules[3].feedback)
  }
  return { isCorrect: true, mistakeType: null, feedback: PROBLEM_EV_L2_P3.feedback.correct, canComplete: true }
}

// ---- Per-step checkers (validate ONLY the step's own field) ----
// These reuse the same mistakeRules/feedback strings as the holistic checker but
// never set `canComplete` — completion stays with the FINAL holistic check.

/** Step 'valid': is the selected formula the valid, complete EV model (C)? */
export function checkEvL2P3ValidStep(valid: EvL2P3Formula | null): CheckResult {
  if (valid === null) {
    return guard('Select the formula that is a valid, complete EV model.')
  }
  if (valid === 'A') {
    return wrong('chose-raw-sum', PROBLEM_EV_L2_P3.mistakeRules[0].feedback)
  }
  if (valid === 'B') {
    return wrong('chose-incomplete', PROBLEM_EV_L2_P3.mistakeRules[1].feedback)
  }
  return { isCorrect: true, mistakeType: null, feedback: 'Correct — Formula C multiplies every outcome by its probability and includes all outcomes.', canComplete: false }
}

/** Step 'diagnose-a': is the diagnosis for Formula A correct (no-probability)? */
export function checkEvL2P3DefectA(defectA: EvL2P3Defect | null): CheckResult {
  if (defectA === null) {
    return guard('Pick a diagnosis for Formula A.')
  }
  if (defectA !== 'no-probability') {
    return wrong('wrong-defect-a', PROBLEM_EV_L2_P3.mistakeRules[2].feedback)
  }
  return { isCorrect: true, mistakeType: null, feedback: 'Correct — Formula A sums raw payouts without multiplying by probability.', canComplete: false }
}

/** Step 'diagnose-b': is the diagnosis for Formula B correct (omits-zero)? */
export function checkEvL2P3DefectB(defectB: EvL2P3Defect | null): CheckResult {
  if (defectB === null) {
    return guard('Pick a diagnosis for Formula B.')
  }
  if (defectB !== 'omits-zero') {
    return wrong('wrong-defect-b', PROBLEM_EV_L2_P3.mistakeRules[3].feedback)
  }
  return { isCorrect: true, mistakeType: null, feedback: 'Correct — Formula B omits the $0 outcome and the 0.5 probability it carries.', canComplete: false }
}
