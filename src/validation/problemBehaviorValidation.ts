// Validation and Test Coverage — Expected Value Lab (15-problem chapter)
// ----------------------------------------------------------------------
// Structured behaviour expectations for all 15 problems (5 lessons × 3). This is
// documentation-as-data: it does NOT alter app behaviour. It records what each
// problem requires to complete, the actions it gates on, the deterministic
// mistake types its LIVE checker can emit, and the global session behaviours
// (direct correction, attempt counting, persistence).
//
// The mistake types and completion gates here mirror the LIVE co-located
// checkers (problem-1 = checkProblem1Dice, problem-7 = checkBoothPreview,
// problem-8 = checkWiderSpread, etc.), NOT the stale `checkProblem` dispatcher.

export interface ProblemBehavior {
  storageId: string
  canonicalSlug: string
  lesson: number
  title: string
  /** What must be true for the problem to be markable complete (canComplete). */
  completionRequires: string[]
  /** Learner interactions required (gates) before a graded answer is possible. */
  requiredActions: string[]
  /** Deterministic mistakeType strings the LIVE checker can emit. */
  expectedMistakeTypes: string[]
  /** What hints must do (visual-first, hand-written, no AI). */
  hintBehavior: string[]
  /** What feedback must do (specific, deterministic, <100ms, beside the input). */
  feedbackBehavior: string[]
}

export const problemBehaviors: ProblemBehavior[] = [
  {
    storageId: 'problem-1',
    canonicalSlug: 'ev-l1-p1',
    lesson: 1,
    title: 'Two-Dice Roll Average',
    completionRequires: ['≥100 total rolls', '7 identified as the long-run average sum'],
    requiredActions: ['throw-dice', 'reach-100-rolls', 'identify-average-sum'],
    expectedMistakeTypes: ['chose-extreme-outcome', 'used-single-die-average', 'assumed-sample-equals-ev'],
    hintBehavior: ['H1 points at the running-average graph; H2 gives one die\'s average (3.5); H3 adds the two dice (3.5 + 3.5 = 7) — all hand-written.'],
    feedbackBehavior: ['The ≥100 total-roll guard does NOT count as an attempt.', 'Reduced-motion preserves the seeded two-dice roll sequence; tap == drag == keyboard for the same throw index.'],
  },
  {
    storageId: 'ev-l1-p2',
    canonicalSlug: 'ev-l1-p2',
    lesson: 1,
    title: 'Unequal Section Game',
    completionRequires: ['prediction submitted', '≥100 total spins', '$5 identified'],
    requiredActions: ['submit-prediction', 'spin-100', 'identify-average'],
    expectedMistakeTypes: ['used-largest-payout', 'divided-payout-by-percent', 'ignored-payout', 'short-run-variation'],
    hintBehavior: ['Hints connect section size to probability and weight each payout.'],
    feedbackBehavior: ['$0.80 answer is classified as divided-payout-by-percent — a distinct, hand-written diagnosis.'],
  },
  {
    storageId: 'ev-l1-p3',
    canonicalSlug: 'ev-l1-p3',
    lesson: 1,
    title: 'Which Game Has the Best Long-Run Average?',
    completionRequires: ['Game A selected', 'Game B selected', 'Game C not selected', 'reason = A/B tied at $5'],
    requiredActions: ['select-highest-ev-games', 'choose-reason'],
    expectedMistakeTypes: ['chose-bigger-prize', 'chose-highest-win-rate', 'missed-tie', 'ignored-probabilities', 'expected-value-is-guaranteed'],
    hintBehavior: ['Hints compute A (10×0.5), B (25×0.2), and C (6×0.8).'],
    feedbackBehavior: ['B only diagnoses biggest-prize thinking; C diagnoses highest-win-rate thinking; A only diagnoses missing the tie.'],
  },
  {
    storageId: 'problem-2',
    canonicalSlug: 'ev-l2-p1',
    lesson: 2,
    title: 'Claw Machine Expected Value',
    completionRequires: ['ran ≥8 claw drops', 'viewed contribution compression', 'both outcome↔probability pairs placed', 'EV = 5'],
    requiredActions: ['run-8-grabs', 'view-contribution-compression', 'place-formula-pairs', 'submit-ev'],
    expectedMistakeTypes: ['reversed-outcome-probability', 'omitted-probability', 'used-largest-payout', 'arithmetic-error'],
    hintBehavior: ['Hints run the claw grabs, match pairs, then multiply and add. Tap-to-place equals drag.'],
    feedbackBehavior: ['Formula is LOCKED until ≥8 claw drops are run and the contribution compression is viewed (grabs-before-formula gate) — guard, not graded.'],
  },
  {
    storageId: 'ev-l2-p2',
    canonicalSlug: 'ev-l2-p2',
    lesson: 2,
    title: 'Match Outcomes to Probabilities',
    completionRequires: ['all three correct pairs: $12↔1/3, $3↔1/2, $0↔1/6'],
    requiredActions: ['match-all-pairs'],
    expectedMistakeTypes: ['ranked-by-size', 'reused-probability', 'wrong-pairing'],
    hintBehavior: ['Hints read the game data, identify the most-likely $3, and enforce single-use cards.'],
    feedbackBehavior: ['Unmatched outcome → guard (not graded); ranking by size → ranked-by-size.'],
  },
  {
    storageId: 'ev-l2-p3',
    canonicalSlug: 'ev-l2-p3',
    lesson: 2,
    title: 'Diagnose Bad EV Setups',
    completionRequires: ['valid = C', 'defect A = no-probability', 'defect B = omits-zero'],
    requiredActions: ['select-valid', 'diagnose-a', 'diagnose-b'],
    expectedMistakeTypes: ['chose-raw-sum', 'chose-incomplete', 'wrong-defect-a', 'wrong-defect-b'],
    hintBehavior: ['Hints check probability weighting, all-outcomes, and total probability.'],
    feedbackBehavior: ['Choosing A → chose-raw-sum; B → chose-incomplete (it matches numerically but omits $0).'],
  },
  {
    storageId: 'problem-4',
    canonicalSlug: 'ev-l3-p2',
    lesson: 3,
    title: 'Dealt-Hand Contributions',
    completionRequires: ['contributions 0.5, 1.0, 5.0 (ascending value 2,4,10)', 'final EV = 6.5'],
    requiredActions: ['fill-contributions', 'submit-ev'],
    expectedMistakeTypes: ['forgot-to-weight', 'unweighted-sum', 'arithmetic-error'],
    hintBehavior: ['Hints multiply each card value by its probability (2×1/4, 4×1/4, 10×1/2) and sum.'],
    feedbackBehavior: ['Raw value as contribution → forgot-to-weight; EV 16 (2+4+10) → unweighted-sum; empty contribution → guard.'],
  },
  {
    storageId: 'ev-l3-p3',
    canonicalSlug: 'ev-l3-p3',
    lesson: 3,
    title: 'Mini-Deck EV Table',
    completionRequires: ['counts 3,3,4', 'probabilities 3/10,3/10,4/10', 'contributions 0.3,2.1,4.0', 'EV = 6.4'],
    requiredActions: ['fill-counts', 'fill-probabilities', 'fill-contributions', 'submit-ev'],
    expectedMistakeTypes: ['count-probability-confusion', 'wrong-denominator', 'used-total-card-value', 'omitted-row', 'arithmetic-error'],
    hintBehavior: ['Hints convert counts ÷ 10 and multiply by card value per row.'],
    feedbackBehavior: ['Raw total card value (64) rejected as used-total-card-value; count typed as probability → count-probability-confusion; empty cells → guard.'],
  },
  {
    storageId: 'problem-5',
    canonicalSlug: 'ev-l4-p1',
    lesson: 4,
    title: 'Pay to Play',
    completionRequires: ['cost token placed', 'expected profit = 1'],
    requiredActions: ['place-cost-token', 'submit-profit'],
    expectedMistakeTypes: ['answered-payout', 'added-cost', 'reversed-subtraction', 'cost-as-probability', 'unknown'],
    hintBehavior: ['Hints place the $3 cost and subtract from the $4 payout.'],
    feedbackBehavior: ['Cost-before-profit gate: profit input locked until cost placed (guard).', 'Answer 4 → answered-payout, 7 → added-cost, fractional 0..1 → cost-as-probability.'],
  },
  {
    storageId: 'problem-6',
    canonicalSlug: 'ev-l4-p2',
    lesson: 4,
    title: 'Fair, Favorable, or Unfavorable?',
    completionRequires: ['all three placed: A = fair, B = favorable, C = unfavorable'],
    requiredActions: ['place-all-cards'],
    expectedMistakeTypes: ['confused-fair-favorable', 'positive-payout-favorable', 'forgot-subtract-cost'],
    hintBehavior: ['Fairness number line places profit at negative/zero/positive; tap-to-place buckets work without drag.'],
    feedbackBehavior: ['C marked favorable → positive-payout-favorable; A marked favorable → confused-fair-favorable; missing card → guard.'],
  },
  {
    storageId: 'ev-l4-p3',
    canonicalSlug: 'ev-l4-p3',
    lesson: 4,
    title: 'Choose the Better Game After Cost',
    completionRequires: ['profit A = 2', 'profit B = 3', 'better game = B'],
    requiredActions: ['compute-profit-a', 'compute-profit-b', 'select-better-game'],
    expectedMistakeTypes: ['chose-larger-payout', 'forgot-subtract-cost', 'added-cost', 'reversed-payout-cost', 'arithmetic-error'],
    hintBehavior: ['Hints subtract each cost and compare remaining profit.'],
    feedbackBehavior: ['Correct profits but choosing A → chose-larger-payout (the bigger-payout trap).'],
  },
  {
    storageId: 'problem-7',
    canonicalSlug: 'ev-l5-p1',
    lesson: 5,
    title: 'Carnival Booth Preview',
    completionRequires: ['both 5-round previews run', 'feel = No', 'average = Yes ($5)'],
    requiredActions: ['preview-booth-a', 'preview-booth-b', 'answer-feel', 'answer-average'],
    expectedMistakeTypes: ['claimed-same-feel', 'claimed-different-average', 'confused-single-round-with-ev'],
    hintBehavior: ['Hints separate "feel" (round-to-round swing) from "average" (long-run payout).'],
    feedbackBehavior: ['Both-preview gate blocks the MC (guard). Qualitative only — no probability table / cost / fairness here (reserved for L5P3).'],
  },
  {
    storageId: 'problem-8',
    canonicalSlug: 'ev-l5-p2',
    lesson: 5,
    title: 'Wider Spread, Same Average',
    completionRequires: ['both 20-trial sims run', 'EV(A) = 6', 'EV(B) = 6', 'riskier = Game B', 'approved explanation'],
    requiredActions: ['simulate-both', 'submit-ev-a', 'submit-ev-b', 'select-risk', 'select-reason'],
    expectedMistakeTypes: ['claimed-game-b-has-higher-ev', 'claimed-games-identical', 'selected-game-a-as-riskier', 'ev-arithmetic-error'],
    hintBehavior: ['Hints compute 12×0.5 + 0×0.5 = $6 and compare spread.'],
    feedbackBehavior: ['Distinct from L5P1: the checker rejects the L5P1 booth payouts ($5/$10) as ev-arithmetic-error.', 'Numbers ($6 vs $12/$0) are deliberately different from L5P1 ($5 vs $10/$0).'],
  },
  {
    storageId: 'ev-l5-p3',
    canonicalSlug: 'ev-l5-p3',
    lesson: 5,
    title: 'Final Carnival Decision (capstone)',
    completionRequires: ['wheel grouped', 'probabilities 1/12,3/12,8/12', 'contributions 3,3,0', 'payout 6', 'profit 0', 'decision fair', 'risk = variable-outcomes'],
    requiredActions: ['group-wheel', 'fill-table', 'submit-payout', 'submit-profit', 'select-decision', 'select-risk'],
    expectedMistakeTypes: ['counts-not-probability', 'wrong-denominator', 'omitted-zero-row', 'arithmetic-error', 'payout-not-profit', 'fair-marked-favorable', 'confused-ev-with-guaranteed', 'believed-fair-has-no-risk'],
    hintBehavior: ['Hints walk sections ÷ 12 → contributions → profit → fair ≠ risk-free.'],
    feedbackBehavior: ['Tap-to-group gate (guard); sequential one-active-row checklist avoids scroll chasing. Covers all 8 PRD capstone mistake types.'],
  },
]

/**
 * Global behaviour expectations that span all problems. Each item names whether
 * it is deterministically checkable by the runner or verified structurally /
 * via manual QA (session hook + persistence layer).
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
    notes: 'Live checkers are pure; a corrected resubmit returns canComplete=true (see liveCheckerValidation correction pair).',
  },
  {
    id: 'guard-not-graded',
    requirement: 'Incomplete guard submits must not count as graded attempts.',
    verifiedBy: 'deterministic',
    notes: 'isGradedAttempt returns false when isCorrect=false and mistakeType is empty/null (both guard conventions covered).',
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
    id: 'mastery-strong-threshold',
    requirement: 'Mastery requires ≥11 of 15 problems completed in ≤2 graded attempts, all 15 complete, capstone + payout-vs-profit + same-EV-vs-risk correct.',
    verifiedBy: 'deterministic',
    notes: 'evaluateChapterMastery + STRONG_ATTEMPT_THRESHOLD=11 asserted in prdCoverage.test.ts.',
  },
  {
    id: 'no-scroll-chasing',
    requirement: 'Visual + controls + feedback stay spatially connected; feedback never buried at page bottom.',
    verifiedBy: 'structural',
    notes: 'Two-region desktop / sticky-task mobile layout — manual a11y audit (docs/validation-plan.md §A11y).',
  },
  {
    id: 'tap-to-place',
    requirement: 'Every drag/drop interaction also supports tap-to-select / tap-to-place; correctness never depends on drag.',
    verifiedBy: 'structural',
    notes: 'Checkers receive state regardless of input modality — manual QA per interactive problem.',
  },
  {
    id: 'reduced-motion-deterministic',
    requirement: 'Reduced-motion paths produce identical deterministic outcomes (seeded RNG per throw/spin index).',
    verifiedBy: 'structural',
    notes: 'Seeded outcome functions for simulation problems are unit-tested in feature suites; dry fluency checks use deterministic checkers.',
  },
  {
    id: 'progress-preserves-completed-ids',
    requirement: 'Progress preserves completed problem IDs across sessions; removed legacy slugs resolve to successors.',
    verifiedBy: 'deterministic',
    notes: 'resolveCanonicalProblem + REMOVED_SLUG_SUCCESSORS asserted in prdCoverage.test.ts.',
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
  { id: 'graded-guard-null', description: 'guard with null mistakeType (booth/risk/capstone convention)', result: { isCorrect: false, mistakeType: null, feedback: 'Run both previews.', canComplete: false }, expectedGraded: false },
]
