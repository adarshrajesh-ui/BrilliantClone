// Validation and Test Coverage — Expected Value Lab MVP
// ------------------------------------------------------
// Structured behaviour expectations for the established 8-problem MVP. This file
// is documentation-as-data: it does NOT import or alter app behaviour. It records
// what each problem requires to complete, the actions/hints/feedback it must
// expose, and the global session behaviours (direct correction, attempt
// counting, persistence). The runner can cross-check the deterministic parts
// (e.g. expected mistake types) against the matrix; the React/session behaviours
// below are verified structurally and via manual QA, since they require the
// running app.

export interface ProblemBehavior {
  problemId: string
  title: string
  /** What must be true for the problem to be markable complete (canComplete). */
  completionRequires: string[]
  /** Learner interactions required before a graded answer is possible. */
  requiredActions: string[]
  /** Deterministic mistakeType strings the checker can emit for this problem. */
  expectedMistakeTypes: string[]
  /** What hints must do (visual-first, hand-written, no AI). */
  hintBehavior: string[]
  /** What feedback must do (specific, deterministic, <100ms). */
  feedbackBehavior: string[]
}

export const problemBehaviors: ProblemBehavior[] = [
  {
    problemId: 'problem-1',
    title: 'The Long-Run Average',
    completionRequires: [
      'prediction submitted',
      'at least 100 total spins run',
      '$5 identified as the long-run average',
    ],
    requiredActions: ['submit-prediction', 'spin-100', 'identify-average'],
    expectedMistakeTypes: ['chose-extreme-outcome', 'confused-single-spin'],
    hintBehavior: [
      'Hint 1 explains the average sits halfway between equally likely outcomes.',
      'Hint 2 prompts running at least 100 spins to let the running average settle.',
      'Hints are hand-written; revealing any hint sets hintUsed = true.',
    ],
    feedbackBehavior: [
      'Correct feedback explains $10 and $0 average to $5 per spin.',
      'Extreme-outcome feedback explains the average is not an individual outcome.',
      'Guard messages (run more spins / submit prediction) do not count as attempts.',
    ],
  },
  {
    problemId: 'problem-2',
    title: 'Build the Weighted Average',
    completionRequires: [
      'both outcome-probability pairs placed correctly ($20↔25%, $0↔75%)',
      'final EV submitted equal to 5',
    ],
    requiredActions: ['tap-to-place-cards', 'submit-ev'],
    expectedMistakeTypes: ['reversed-outcome-probability', 'omitted-probability', 'used-largest-payout'],
    hintBehavior: [
      'Hints show each payout multiplied by its own probability.',
      'No drag/drop is required — tap-to-select/tap-to-place must work.',
    ],
    feedbackBehavior: [
      'Reversed pairs produce a reversed-outcome-probability message.',
      'Answering 20 explains EV weights outcomes by probability.',
    ],
  },
  {
    problemId: 'problem-3',
    title: 'Mystery Box Outcomes',
    completionRequires: [
      'all six boxes revealed',
      'all table cells correct',
      'counts correct ($12→1, $6→2, $0→3)',
      'probabilities correct (1/6, 2/6, 3/6)',
    ],
    requiredActions: ['reveal-all-boxes', 'fill-counts', 'fill-probabilities'],
    expectedMistakeTypes: ['counts-as-probabilities', 'probabilities-not-one', 'unknown'],
    hintBehavior: [
      'Hints highlight matching boxes for the active row.',
      'Probability hint shows count ÷ total boxes.',
    ],
    feedbackBehavior: [
      'Typing a raw count into a probability cell produces counts-as-probabilities.',
      'Note: per-row probability equivalence is enforced before the sum check, so probabilities-not-one is a defensive guard rather than a commonly reachable path.',
    ],
  },
  {
    problemId: 'problem-4',
    title: 'Calculate EV from the Table',
    completionRequires: [
      'all three contributions submitted (2, 2, 0)',
      'final EV submitted equal to 4',
    ],
    requiredActions: ['fill-contributions', 'submit-ev'],
    expectedMistakeTypes: ['unweighted-sum', 'omitted-zero-row', 'arithmetic-error'],
    hintBehavior: [
      'Hints animate outcome × probability per row.',
      'Colors link each contribution to its outcome group.',
    ],
    feedbackBehavior: [
      'Raw payouts (12, 6) produce unweighted-sum.',
      'A nonzero $0 row produces omitted-zero-row.',
    ],
  },
  {
    problemId: 'problem-5',
    title: 'Expected Payout vs Expected Profit',
    completionRequires: [
      'payout − cost formula selected',
      'expected profit submitted equal to 1',
    ],
    requiredActions: ['select-cost-formula', 'submit-profit'],
    expectedMistakeTypes: ['answered-payout', 'added-cost', 'unknown'],
    hintBehavior: [
      'Balance scale / equation strip shows cost pulling $4 down to $1.',
    ],
    feedbackBehavior: [
      'Answer 4 → answered-payout. Answer 7 → added-cost.',
      'Treating cost as a probability falls through to a generic corrective message.',
    ],
  },
  {
    problemId: 'problem-6',
    title: 'Fair, Favorable, or Unfavorable?',
    completionRequires: [
      'all three cards placed',
      'A = fair, B = favorable, C = unfavorable',
    ],
    requiredActions: ['place-all-cards'],
    expectedMistakeTypes: ['confused-fair-favorable', 'positive-payout-favorable', 'forgot-subtract-cost'],
    hintBehavior: [
      'Fairness number line places expected profit at negative/zero/positive.',
      'Tap-to-place buckets must work without drag/drop.',
    ],
    feedbackBehavior: [
      'C marked favorable → positive-payout-favorable.',
      'A marked favorable → confused-fair-favorable.',
    ],
  },
  {
    problemId: 'problem-7',
    title: 'Build the Whole EV Model',
    completionRequires: [
      'all probabilities filled (1/10, 2/10, 7/10)',
      'all contributions filled (3, 2, 0)',
      'expected payout = 5',
      'expected profit = 0',
      'decision = fair',
    ],
    requiredActions: ['group-wheel-sections', 'fill-probabilities', 'fill-contributions', 'submit-payout', 'submit-profit', 'select-decision'],
    expectedMistakeTypes: ['count-not-probability', 'wrong-denominator', 'payout-not-profit', 'fair-marked-favorable', 'unknown'],
    hintBehavior: [
      'Probability hint highlights selected sections over 10 total.',
      'Profit hint balances payout $5 and cost $5 to zero.',
      'Decision hint places the profit dot at 0 on the fairness line.',
    ],
    feedbackBehavior: [
      'Section counts as probabilities → count-not-probability.',
      'Profit left equal to payout → payout-not-profit.',
      'Fair marked favorable → fair-marked-favorable.',
    ],
  },
  {
    problemId: 'problem-8',
    title: 'Same Expected Value, Different Risk',
    completionRequires: [
      'both simulations run (20 trials each)',
      'EV for each game submitted (EV(A)=5, EV(B)=5)',
      'higher-risk game selected (Game B)',
      'correct reason selected (variable outcomes despite same long-run average)',
    ],
    requiredActions: ['simulate-game-a', 'simulate-game-b', 'submit-ev-a', 'submit-ev-b', 'select-higher-risk', 'select-reason'],
    expectedMistakeTypes: ['average-vs-guaranteed', 'b-higher-ev', 'identical-games'],
    hintBehavior: [
      'Risk comparison graph contrasts a flat line with a jagged line at the same average.',
    ],
    feedbackBehavior: [
      'EV(B)=10 → b-higher-ev.',
      'Identical reasoning → identical-games.',
      'Wrong EV(A) → average-vs-guaranteed.',
    ],
  },
]

/**
 * Global behaviour expectations that span all problems. Each item names whether
 * it is deterministically checkable by the runner (`isGradedAttempt`-style) or
 * verified structurally / via manual QA (session hook + persistence layer).
 */
export interface GlobalBehaviorExpectation {
  id: string
  requirement: string
  /** 'deterministic' = runner can assert; 'structural' = read code / manual QA. */
  verifiedBy: 'deterministic' | 'structural'
  notes: string
}

export const globalBehaviorExpectations: GlobalBehaviorExpectation[] = [
  {
    id: 'direct-correction-no-reset',
    requirement: 'Direct correction should not require a reset — fixing the answer and resubmitting passes.',
    verifiedBy: 'deterministic',
    notes: 'The checker is pure; directCorrectionCases prove a corrected resubmit returns canComplete=true.',
  },
  {
    id: 'stale-feedback-clears',
    requirement: 'Stale feedback should clear after the learner edits their input.',
    verifiedBy: 'structural',
    notes: 'useProblemSession compares a JSON state signature and clears feedback when the input changes after a submit.',
  },
  {
    id: 'guard-not-graded',
    requirement: 'Incomplete guard submits must not count as graded attempts.',
    verifiedBy: 'deterministic',
    notes: 'isGradedAttempt returns false when isCorrect=false and mistakeType is empty/null.',
  },
  {
    id: 'wrong-graded-counts',
    requirement: 'Wrong graded submits (with a mistakeType) must count as attempts.',
    verifiedBy: 'deterministic',
    notes: 'isGradedAttempt returns true when a non-empty mistakeType is present.',
  },
  {
    id: 'correct-counts',
    requirement: 'Correct answers count as graded attempts and allow completion.',
    verifiedBy: 'deterministic',
    notes: 'isGradedAttempt returns true when isCorrect=true; canComplete drives completion.',
  },
  {
    id: 'hints-set-hintused',
    requirement: 'Revealing any hint should set hintUsed = true and persist on the attempt record.',
    verifiedBy: 'structural',
    notes: 'useProblemSession derives hintUsed from revealedHintIds.length > 0 and records it on attempts.',
  },
  {
    id: 'progress-preserves-completed-ids',
    requirement: 'Progress should preserve completed problem IDs across sessions.',
    verifiedBy: 'structural',
    notes: 'chapterProgress.completedProblemIds is persisted; completion marks the ID and survives resume.',
  },
]

/** Literal CheckResult-shaped fixtures for the runner to exercise isGradedAttempt. */
export interface GradedAttemptExpectation {
  id: string
  description: string
  result: { isCorrect: boolean; mistakeType: string | null; feedback: string; canComplete: boolean }
  expectedGraded: boolean
}

export const gradedAttemptExpectations: GradedAttemptExpectation[] = [
  { id: 'graded-correct', description: 'correct answer', result: { isCorrect: true, mistakeType: null, feedback: '', canComplete: true }, expectedGraded: true },
  { id: 'graded-wrong', description: 'wrong with mistakeType', result: { isCorrect: false, mistakeType: 'chose-extreme-outcome', feedback: '', canComplete: false }, expectedGraded: true },
  { id: 'graded-guard-empty', description: 'guard with empty mistakeType', result: { isCorrect: false, mistakeType: '', feedback: 'Fill all fields.', canComplete: false }, expectedGraded: false },
  { id: 'graded-guard-null', description: 'guard with null mistakeType', result: { isCorrect: false, mistakeType: null, feedback: 'Run 100 spins.', canComplete: false }, expectedGraded: false },
]
