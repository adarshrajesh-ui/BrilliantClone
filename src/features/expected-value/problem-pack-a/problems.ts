// Problem definitions for Expected Value Problem Pack A (Problems 1–10).
//
// Four originals are audited and brought into PRD compliance (storage IDs
// preserved as problem-1..4 with canonicalSlug + legacyProblemId metadata).
// Six are new (storage ID === canonical slug). All metadata the PRD requires —
// demoConfig, currentTaskConfig, mistakeRules, 3-part wrong feedback, hints,
// tap-first placement, visual groups, per-field validation, animations — lives
// here so Agent 1 can wire the pack without touching shared files.

import { problemPackACurrentTaskConfigs, problemPackADemoConfigs } from './demoConfigs'
import { composeWrongFeedback } from './types'
import type { PackProblem, PlacementMeta, WrongFeedback } from './types'

const PACK_CHAPTER_ID = 'expected-value-intro' as const

const tapPlacement: PlacementMeta = {
  tapToSelect: true,
  tapToPlace: true,
  dragOptional: true,
  canClear: true,
  canReplace: true,
  wrongPlacementClearsOthers: false,
}

/** Build the feedback string map (correct + composed wrong feedback). */
function feedbackMap(correct: string, wrong: Record<string, WrongFeedback>): Record<string, string> {
  const map: Record<string, string> = { correct }
  for (const [mistakeType, wf] of Object.entries(wrong)) {
    map[mistakeType] = composeWrongFeedback(wf)
  }
  return map
}

// ---------------------------------------------------------------------------
// Lesson 1, Problem 1 — l1-long-run-average (storage: problem-1)
// ---------------------------------------------------------------------------

const p1Wrong: Record<string, WrongFeedback> = {
  'chose-extreme-outcome': {
    whatHappened: 'You chose one possible result ($0), not the average.',
    whyWrong: 'Expected value is not the outcome of one spin — it is the average over many spins, and $0 and $10 are equally likely.',
    nextAction: 'Run 100 spins and watch where the average line settles, between $0 and $10.',
  },
  'selected-largest-payout': {
    whatHappened: 'You picked the largest possible payout ($10).',
    whyWrong: 'The biggest prize is not the average; $0 is just as likely as $10.',
    nextAction: 'Look for the midpoint between the two equally likely outcomes.',
  },
  'assumed-sample-equals-ev': {
    whatHappened: 'You entered a value a short run happened to show.',
    whyWrong: 'A single sample average does not equal the theoretical expected value.',
    nextAction: 'Run more spins and read the midpoint between $0 and $10.',
  },
}

const PROBLEM_L1_LONG_RUN_AVERAGE: PackProblem = {
  canonicalSlug: 'l1-long-run-average',
  storageId: 'problem-1',
  legacyProblemId: 'problem-1',
  chapterId: PACK_CHAPTER_ID,
  lessonId: 'lesson-1',
  lessonIndex: 0,
  problemIndexWithinLesson: 0,
  globalProblemIndex: 0,
  title: 'The Long-Run Average',
  concept: 'Expected value is the average outcome over many repetitions.',
  difficulty: 1,
  scenarioText:
    'Bob plays a spinner game with two equal sections: win $10 or win $0. Predict the long-run average, then run at least 100 spins.',
  visualType: 'spinner',
  interactionType: 'simulate-and-predict',
  givenData: { outcomes: [10, 0], probabilities: [0.5, 0.5], minSpins: 100, ev: 5 },
  requiredActions: ['submit-prediction', 'spin-100', 'identify-average'],
  answerInputs: ['prediction', 'finalAnswer'],
  correctAnswers: { finalAnswer: 5 },
  acceptedFormats: { finalAnswer: ['5', '5.0', '5.00', '$5', '$5.00', '5 dollars', '5 per spin'], prediction: ['0', '5', '10'] },
  mistakeRules: [
    { mistakeType: 'chose-extreme-outcome', feedback: 'The long-run average is the midpoint, not an individual outcome.' },
    { mistakeType: 'selected-largest-payout', feedback: 'The largest payout is not the average.' },
    { mistakeType: 'assumed-sample-equals-ev', feedback: 'A short sample average is not the theoretical EV.' },
  ],
  feedback: feedbackMap(
    'Correct — $5 is the long-run average. Equal chances of $0 and $10 balance halfway between the two outcomes.',
    p1Wrong,
  ),
  wrongFeedback: p1Wrong,
  hints: [
    { id: 'p1-h1', label: 'Look at the graph', content: 'Watch the running-average line — it drifts toward one value as spins increase.', visualType: 'graph' },
    { id: 'p1-h2', label: 'Think halfway', content: 'Two equally likely outcomes average to the midpoint between them.' },
    { id: 'p1-h3', label: 'Compute it', content: '10 × 0.5 + 0 × 0.5 = 5. The long-run average is $5.' },
  ],
  demoConfig: problemPackADemoConfigs['l1-long-run-average'],
  currentTaskConfig: problemPackACurrentTaskConfigs['l1-long-run-average'],
  completionRule: 'Submit a prediction, run at least 100 total spins, and identify $5 as the long-run average.',
  masteryTags: ['long-run-average'],
  fieldValidation: { finalAnswer: { kind: 'money', tolerance: 0.01 } },
  animations: [
    { id: 'spin-rotate', description: 'Spinner rotates during each batch; counters animate without delaying feedback.', reducedMotionSafe: true },
    { id: 'graph-draw', description: 'New running-average points draw in; the $5 reference line gains subtle emphasis after many spins.', reducedMotionSafe: true },
  ],
}

// ---------------------------------------------------------------------------
// Lesson 1, Problem 2 — l1-unequal-spinner (storage: l1-unequal-spinner)
// ---------------------------------------------------------------------------

const p2Wrong: Record<string, WrongFeedback> = {
  'selected-largest-payout': {
    whatHappened: 'You used the largest payout ($20) as the average.',
    whyWrong: 'The $20 outcome only happens one quarter of the time, so it cannot be the average.',
    nextAction: 'Multiply $20 by 0.25, then add the $0 outcome at 0.75.',
  },
  'misapplied-probability': {
    whatHappened: 'You divided $20 by 25 instead of multiplying by the probability.',
    whyWrong: 'A 25% chance means multiply by 0.25, not divide by 25.',
    nextAction: 'Compute 20 × 0.25 + 0 × 0.75.',
  },
  'ignored-probability': {
    whatHappened: 'You did not weight $20 by how often it occurs.',
    whyWrong: 'Expected value accounts for both payout and probability.',
    nextAction: 'Multiply $20 by 0.25, then include $0 at 0.75 to get $5.',
  },
}

const PROBLEM_L1_UNEQUAL_SPINNER: PackProblem = {
  canonicalSlug: 'l1-unequal-spinner',
  storageId: 'l1-unequal-spinner',
  chapterId: PACK_CHAPTER_ID,
  lessonId: 'lesson-1',
  lessonIndex: 0,
  problemIndexWithinLesson: 1,
  globalProblemIndex: 1,
  title: 'Unequal Spinner Simulation',
  concept: 'Expected value remains a long-run average when outcomes are not equally likely.',
  difficulty: 2,
  scenarioText:
    'A spinner has a 25% chance of winning $20 and a 75% chance of winning $0. Predict the average, then run at least 100 spins.',
  visualType: 'spinner',
  interactionType: 'simulate-and-predict',
  givenData: { outcomes: [20, 0], probabilities: [0.25, 0.75], minSpins: 100, ev: 5 },
  requiredActions: ['submit-prediction', 'spin-100', 'identify-average'],
  answerInputs: ['prediction', 'finalAnswer'],
  correctAnswers: { finalAnswer: 5 },
  acceptedFormats: { finalAnswer: ['5', '5.0', '5.00', '$5', '$5.00', '5 dollars'] },
  mistakeRules: [
    { mistakeType: 'selected-largest-payout', feedback: 'The largest payout is not the average.' },
    { mistakeType: 'ignored-probability', feedback: 'EV weights each payout by its probability.' },
    { mistakeType: 'misapplied-probability', feedback: '25% means × 0.25, not ÷ 25.' },
  ],
  feedback: feedbackMap(
    'Correct — $20 × 0.25 + $0 × 0.75 = $5. Section size is probability, so the rare $20 still averages to $5.',
    p2Wrong,
  ),
  wrongFeedback: p2Wrong,
  hints: [
    { id: 'l1u-h1', label: 'Look at the slice', content: 'The $20 slice is only a quarter of the spinner — that is its probability, 0.25.', visualType: 'spinner' },
    { id: 'l1u-h2', label: 'Weight it', content: 'Each outcome contributes payout × probability: 20 × 0.25 and 0 × 0.75.' },
    { id: 'l1u-h3', label: 'Compute it', content: '20 × 0.25 + 0 × 0.75 = 5 + 0 = $5.' },
  ],
  demoConfig: problemPackADemoConfigs['l1-unequal-spinner'],
  currentTaskConfig: problemPackACurrentTaskConfigs['l1-unequal-spinner'],
  completionRule: 'Submit a prediction, run at least 100 spins, and identify $5 as the long-run average.',
  masteryTags: ['long-run-average', 'weighted-average'],
  fieldValidation: { finalAnswer: { kind: 'money', tolerance: 0.01 } },
  animations: [
    { id: 'spin-rotate', description: 'Spinner rotates per batch; the $20 quarter pulses when explaining the 25% probability.', reducedMotionSafe: true },
    { id: 'graph-stabilize', description: 'The running-average graph visibly stabilizes near $5 as trials increase.', reducedMotionSafe: true },
  ],
}

// ---------------------------------------------------------------------------
// Lesson 1, Problem 3 — l1-short-run-vs-long-run
// ---------------------------------------------------------------------------

const p3Wrong: Record<string, WrongFeedback> = {
  'small-sample-misconception': {
    whatHappened: 'You said 10 spins must average exactly $5.',
    whyWrong: 'A theoretical expected value does not guarantee that every small sample matches it.',
    nextAction: 'Ten spins can land above or below $5 — choose “No / Not necessarily”.',
  },
  'selected-short-run-graph': {
    whatHappened: 'You picked the 10-spin graph as stronger evidence.',
    whyWrong: 'A short sample can land near $5 by chance, which is weak evidence.',
    nextAction: 'Choose the 500-spin graph, where random swings have more chances to balance out.',
  },
}

const PROBLEM_L1_SHORT_VS_LONG: PackProblem = {
  canonicalSlug: 'l1-short-run-vs-long-run',
  storageId: 'l1-short-run-vs-long-run',
  chapterId: PACK_CHAPTER_ID,
  lessonId: 'lesson-1',
  lessonIndex: 0,
  problemIndexWithinLesson: 2,
  globalProblemIndex: 2,
  title: 'Short-Run vs Long-Run',
  concept: 'Small samples are noisy; larger samples are better evidence of the long-run average.',
  difficulty: 2,
  scenarioText:
    'Compare two samples of the same 50/50 $10-or-$0 game: one with 10 spins and one with 500 spins.',
  visualType: 'dual-running-average-graph',
  interactionType: 'compare-simulations',
  givenData: { outcomes: [10, 0], probabilities: [0.5, 0.5], shortSpins: 10, longSpins: 500, ev: 5 },
  requiredActions: ['run-10', 'answer-short-sample', 'run-500', 'select-stronger-graph'],
  answerInputs: ['shortSampleMustEqualEV', 'strongerGraph'],
  correctAnswers: { shortSampleMustEqualEV: 'no', strongerGraph: '500' },
  acceptedFormats: {
    shortSampleMustEqualEV: ['No', 'Not necessarily', 'False'],
    strongerGraph: ['500 spins', 'Long-run graph', 'Larger sample'],
  },
  mistakeRules: [
    { mistakeType: 'small-sample-misconception', feedback: 'Small samples need not equal the theoretical EV.' },
    { mistakeType: 'selected-short-run-graph', feedback: 'Larger samples are stronger evidence.' },
  ],
  feedback: feedbackMap(
    'Correct — ten spins do not have to average $5, and the 500-spin graph is stronger evidence because larger samples stabilize near the long-run average.',
    p3Wrong,
  ),
  wrongFeedback: p3Wrong,
  hints: [
    { id: 'l1s-h1', label: 'Watch the short graph', content: 'The 10-spin line is jagged and can sit far from $5.', visualType: 'short-graph' },
    { id: 'l1s-h2', label: 'Compare stability', content: 'The 500-spin line hugs the $5 reference line much more closely.', visualType: 'long-graph' },
    { id: 'l1s-h3', label: 'Pick by sample size', content: 'More trials = stronger evidence of the long-run average. Choose the 500-spin graph.' },
  ],
  demoConfig: problemPackADemoConfigs['l1-short-run-vs-long-run'],
  currentTaskConfig: problemPackACurrentTaskConfigs['l1-short-run-vs-long-run'],
  completionRule: 'Run both samples, answer that 10 spins need not equal $5, and select the 500-spin graph.',
  masteryTags: ['long-run-average', 'sampling-variation'],
  fieldValidation: {
    shortSampleMustEqualEV: { kind: 'choice' },
    strongerGraph: { kind: 'choice' },
  },
  animations: [
    { id: 'short-jagged', description: 'Short-run graph appears visibly jagged.', reducedMotionSafe: true },
    { id: 'long-converge', description: 'Long-run graph draws progressively toward the $5 reference line.', reducedMotionSafe: true },
  ],
}

// ---------------------------------------------------------------------------
// Lesson 1, Problem 4 — l1-compare-spinners
// ---------------------------------------------------------------------------

const p4Wrong: Record<string, WrongFeedback> = {
  'maximum-payout-misconception': {
    whatHappened: 'You favored Spinner B for its $20 prize.',
    whyWrong: 'Spinner B pays $20 less often, so the larger prize is offset by its lower probability.',
    nextAction: 'Weight payout by probability: 20 × 0.25 = 5, the same as Spinner A.',
  },
  'win-frequency-misconception': {
    whatHappened: 'You favored Spinner A for winning more often.',
    whyWrong: 'Spinner A wins a smaller prize, so its higher win rate is offset by the smaller payout.',
    nextAction: 'Weight payout by probability: 10 × 0.5 = 5, the same as Spinner B.',
  },
}

const PROBLEM_L1_COMPARE_SPINNERS: PackProblem = {
  canonicalSlug: 'l1-compare-spinners',
  storageId: 'l1-compare-spinners',
  chapterId: PACK_CHAPTER_ID,
  lessonId: 'lesson-1',
  lessonIndex: 0,
  problemIndexWithinLesson: 3,
  globalProblemIndex: 3,
  title: 'Compare Two Spinners',
  concept: 'Compare games by weighted long-run average, not by largest payout or win frequency.',
  difficulty: 3,
  scenarioText:
    'Spinner A: 50% of $10, 50% of $0. Spinner B: 25% of $20, 75% of $0. Which has the higher expected value?',
  visualType: 'spinner-compare',
  interactionType: 'compare-and-choose',
  givenData: {
    spinnerA: { outcomes: [10, 0], probabilities: [0.5, 0.5], ev: 5 },
    spinnerB: { outcomes: [20, 0], probabilities: [0.25, 0.75], ev: 5 },
  },
  requiredActions: ['select-comparison', 'select-explanation'],
  answerInputs: ['choice', 'explanation'],
  correctAnswers: { choice: 'same', explanation: 'both-average-5' },
  acceptedFormats: {
    choice: ['same', 'They have the same EV'],
    explanation: ['both-average-5', 'Both games average $5 over many plays'],
  },
  mistakeRules: [
    { mistakeType: 'maximum-payout-misconception', feedback: 'Largest payout alone does not decide EV.' },
    { mistakeType: 'win-frequency-misconception', feedback: 'Win frequency alone does not decide EV.' },
  ],
  feedback: feedbackMap(
    'Correct — both spinners average $5. Spinner B has the larger prize but pays it less often, and Spinner A wins more often for less, so their weighted averages match.',
    p4Wrong,
  ),
  wrongFeedback: p4Wrong,
  hints: [
    { id: 'l1c-h1', label: 'Look at both', content: 'Spinner B has the bigger prize; Spinner A wins more often. Neither fact alone decides EV.' },
    { id: 'l1c-h2', label: 'Weight each', content: 'A: 10 × 0.5. B: 20 × 0.25. Compare the products.' },
    { id: 'l1c-h3', label: 'They tie', content: 'Both products equal 5, so the spinners have the same expected value.' },
  ],
  demoConfig: problemPackADemoConfigs['l1-compare-spinners'],
  currentTaskConfig: problemPackACurrentTaskConfigs['l1-compare-spinners'],
  completionRule: 'Select that the spinners have the same EV and that both average $5 over many plays.',
  masteryTags: ['weighted-average', 'compare-ev'],
  fieldValidation: { choice: { kind: 'choice' }, explanation: { kind: 'choice' } },
  animations: [
    { id: 'pulse-prizes', description: 'Each spinner’s prize and frequency pulse to show payout vs probability.', reducedMotionSafe: true },
    { id: 'tie-line', description: 'On correct completion, a shared $5 average line overlays both spinners.', reducedMotionSafe: true },
  ],
}

// ---------------------------------------------------------------------------
// Lesson 2, Problem 1 — l2-build-weighted-average (storage: problem-2)
// ---------------------------------------------------------------------------

const p5Wrong: Record<string, WrongFeedback> = {
  'reversed-outcome-probability': {
    whatHappened: 'You placed a probability where an outcome belongs.',
    whyWrong: 'A dollar value is an outcome and a percent is a probability, so each term reads outcome × probability.',
    nextAction: 'Put the dollar cards first: $20 × 25% + $0 × 75%.',
  },
  'wrong-pairing': {
    whatHappened: 'A pair is matched incorrectly.',
    whyWrong: 'Each outcome must multiply the probability of that exact outcome.',
    nextAction: 'Pair $20 with 25% and $0 with 75%.',
  },
  'omitted-probability': {
    whatHappened: 'Not every slot is filled.',
    whyWrong: 'Every outcome needs a probability for the weighted average to be complete.',
    nextAction: 'Fill all four slots so each term reads outcome × probability.',
  },
  'used-largest-payout': {
    whatHappened: 'You answered $20, the largest payout.',
    whyWrong: 'Expected value weights each outcome by its probability rather than taking the biggest prize.',
    nextAction: 'Compute 20 × 0.25 + 0 × 0.75 = $5.',
  },
  'arithmetic-error': {
    whatHappened: 'The pairing is right but the total is off.',
    whyWrong: 'The weighted sum was computed incorrectly.',
    nextAction: 'Recompute 20 × 0.25 + 0 × 0.75 = $5.',
  },
}

const PROBLEM_L2_BUILD_WEIGHTED: PackProblem = {
  canonicalSlug: 'l2-build-weighted-average',
  storageId: 'problem-2',
  legacyProblemId: 'problem-2',
  chapterId: PACK_CHAPTER_ID,
  lessonId: 'lesson-2',
  lessonIndex: 1,
  problemIndexWithinLesson: 0,
  globalProblemIndex: 4,
  title: 'Build the Weighted Average',
  concept: 'Expected value is a weighted average of outcomes.',
  difficulty: 2,
  scenarioText:
    'A spinner has a 25% chance of $20 and a 75% chance of $0. Build the EV formula by pairing each outcome with its probability, then compute the result.',
  visualType: 'spinner-formula',
  interactionType: 'tap-to-place-formula',
  givenData: { outcomes: [20, 0], probabilities: [0.25, 0.75], cards: ['$20', '$0', '25%', '75%'], ev: 5 },
  requiredActions: ['place-outcome-cards', 'place-probability-cards', 'check-pairs', 'submit-ev'],
  answerInputs: ['slots', 'evAnswer'],
  correctAnswers: { slots: ['$20', '25%', '$0', '75%'], ev: 5 },
  acceptedFormats: { ev: ['5', '5.0', '5.00', '$5', '$5.00'] },
  mistakeRules: [
    { mistakeType: 'reversed-outcome-probability', feedback: 'Outcome and probability are swapped.' },
    { mistakeType: 'wrong-pairing', feedback: 'An outcome is paired with the wrong probability.' },
    { mistakeType: 'omitted-probability', feedback: 'Every outcome needs a probability.' },
    { mistakeType: 'used-largest-payout', feedback: 'EV weights outcomes by probability.' },
    { mistakeType: 'arithmetic-error', feedback: 'Recompute the weighted sum.' },
  ],
  feedback: feedbackMap('Correct! 20 × 0.25 + 0 × 0.75 = $5.', p5Wrong),
  wrongFeedback: p5Wrong,
  hints: [
    { id: 'p2-h1', label: 'Sort the cards', content: 'Dollar cards are outcomes; percent cards are probabilities.', visualType: 'formula' },
    { id: 'p2-h2', label: 'Match pairs', content: 'Place $20 with 25% and $0 with 75%. Order of the two terms does not matter.' },
    { id: 'p2-h3', label: 'Multiply and add', content: 'EV = (20 × 0.25) + (0 × 0.75) = $5.' },
  ],
  demoConfig: problemPackADemoConfigs['l2-build-weighted-average'],
  currentTaskConfig: problemPackACurrentTaskConfigs['l2-build-weighted-average'],
  completionRule: 'Place both outcome–probability pairs (either order) and submit final EV of $5.',
  masteryTags: ['weighted-average'],
  placement: tapPlacement,
  fieldValidation: { ev: { kind: 'money', tolerance: 0.01 } },
  animations: [
    { id: 'card-lift', description: 'Selected cards lift/glow; correct cards snap into slots.', reducedMotionSafe: true },
    { id: 'type-highlight', description: 'Reversed types briefly highlight the correct slot categories.', reducedMotionSafe: true },
  ],
}

// ---------------------------------------------------------------------------
// Lesson 2, Problem 2 — l2-match-outcomes-probabilities
// ---------------------------------------------------------------------------

const p6Wrong: Record<string, WrongFeedback> = {
  'ranked-by-size': {
    whatHappened: 'You gave the largest payout the largest probability.',
    whyWrong: 'The biggest prize does not automatically get the biggest chance.',
    nextAction: 'Read the data: $12 happens with probability 1/3, not 1/2.',
  },
  'reused-probability-card': {
    whatHappened: 'You used the same probability twice.',
    whyWrong: 'Each probability card can be placed only once.',
    nextAction: 'Give every outcome its own chance: $12↔1/3, $3↔1/2, $0↔1/6.',
  },
  'omitted-zero-outcome': {
    whatHappened: 'You left the $0 outcome unmatched.',
    whyWrong: 'Every outcome must be paired, and $0 still occurs 1/6 of the time.',
    nextAction: 'Match $0 with 1/6.',
  },
  'wrong-pairing': {
    whatHappened: 'An outcome is matched with the wrong probability.',
    whyWrong: 'Each payout needs the probability of receiving that exact payout.',
    nextAction: 'Connect $12↔1/3, $3↔1/2, $0↔1/6.',
  },
}

const PROBLEM_L2_MATCH_OUTCOMES: PackProblem = {
  canonicalSlug: 'l2-match-outcomes-probabilities',
  storageId: 'l2-match-outcomes-probabilities',
  chapterId: PACK_CHAPTER_ID,
  lessonId: 'lesson-2',
  lessonIndex: 1,
  problemIndexWithinLesson: 1,
  globalProblemIndex: 5,
  title: 'Match Outcomes to Probabilities',
  concept: 'Every outcome must be paired with the probability of that exact outcome.',
  difficulty: 2,
  scenarioText:
    'A game pays $12 with probability 1/3, $3 with probability 1/2, and $0 with probability 1/6. Match each payout to its probability.',
  visualType: 'matching-columns',
  interactionType: 'tap-to-match',
  givenData: {
    outcomes: [12, 3, 0],
    probabilityCards: ['1/3', '1/2', '1/6'],
    pairs: { '12': '1/3', '3': '1/2', '0': '1/6' },
  },
  requiredActions: ['match-12', 'match-3', 'match-0'],
  answerInputs: ['assignments'],
  correctAnswers: { assignments: { '12': '1/3', '3': '1/2', '0': '1/6' } },
  acceptedFormats: {
    probability: ['1/3', '0.3333', '0.333', '1/2', '0.5', '.5', '50%', '1/6', '0.1667', '0.167'],
  },
  mistakeRules: [
    { mistakeType: 'ranked-by-size', feedback: 'Do not rank cards by size; read the data.' },
    { mistakeType: 'reused-probability-card', feedback: 'Each probability card is used once.' },
    { mistakeType: 'omitted-zero-outcome', feedback: 'The $0 outcome must be matched.' },
    { mistakeType: 'wrong-pairing', feedback: 'Pair each outcome with its exact probability.' },
  ],
  feedback: feedbackMap('Correct! $12 ↔ 1/3, $3 ↔ 1/2, $0 ↔ 1/6. Each payout is paired with the chance of that exact outcome.', p6Wrong),
  wrongFeedback: p6Wrong,
  hints: [
    { id: 'l2m-h1', label: 'Read the data', content: 'Use the given probabilities, not the size of the payout.', visualType: 'outcomes' },
    { id: 'l2m-h2', label: 'One card each', content: 'There are three outcomes and three probability cards — each used once.' },
    { id: 'l2m-h3', label: 'The pairs', content: '$12↔1/3, $3↔1/2, $0↔1/6.' },
  ],
  demoConfig: problemPackADemoConfigs['l2-match-outcomes-probabilities'],
  currentTaskConfig: problemPackACurrentTaskConfigs['l2-match-outcomes-probabilities'],
  completionRule: 'Correctly match all three outcome–probability pairs with no card reused, including $0.',
  masteryTags: ['weighted-average', 'outcome-probability-pairing'],
  placement: tapPlacement,
  fieldValidation: { probability: { kind: 'probability', tolerance: 0.005 } },
  animations: [
    { id: 'connect-line', description: 'A connector animates between a tapped outcome and its probability.', reducedMotionSafe: true },
    { id: 'replace-swap', description: 'Re-tapping replaces a match without clearing the others.', reducedMotionSafe: true },
  ],
}

// ---------------------------------------------------------------------------
// Lesson 2, Problem 3 — l2-fill-missing-formula
// ---------------------------------------------------------------------------

const p7Wrong: Record<string, WrongFeedback> = {
  'slot-type-error': {
    whatHappened: 'A card is in the wrong kind of slot.',
    whyWrong: 'The blank before × 0.4 must be a payout, and the blank after 5 × must be a probability.',
    nextAction: 'Place $10 as the outcome and 0.5 as the probability.',
  },
  'unweighted-sum': {
    whatHappened: 'You added the raw payouts (10 + 5 + 0).',
    whyWrong: 'Expected value adds contributions, not payouts.',
    nextAction: 'Use 10×0.4 + 5×0.5 + 0×0.1 = 4 + 2.5 + 0 = 6.5.',
  },
  'arithmetic-error': {
    whatHappened: 'The slots are right but the total is off.',
    whyWrong: 'The three contributions were added incorrectly.',
    nextAction: 'Add 4 + 2.5 + 0 = 6.5.',
  },
}

const PROBLEM_L2_FILL_FORMULA: PackProblem = {
  canonicalSlug: 'l2-fill-missing-formula',
  storageId: 'l2-fill-missing-formula',
  chapterId: PACK_CHAPTER_ID,
  lessonId: 'lesson-2',
  lessonIndex: 1,
  problemIndexWithinLesson: 2,
  globalProblemIndex: 6,
  title: 'Fill Missing Formula Terms',
  concept: 'Expected value is the sum of outcome × probability contributions.',
  difficulty: 3,
  scenarioText:
    'Complete EV = ___ × 0.4 + 5 × ___ + 0 × 0.1, given $10 with probability 0.4, $5 with probability 0.5, and $0 with probability 0.1.',
  visualType: 'formula-strip',
  interactionType: 'tap-to-fill-slots',
  givenData: {
    formula: '__ × 0.4 + 5 × __ + 0 × 0.1',
    outcomes: [10, 5, 0],
    probabilities: [0.4, 0.5, 0.1],
    cardBank: ['10', '0.5', '0.4', '5'],
    contributions: [4, 2.5, 0],
    ev: 6.5,
  },
  requiredActions: ['fill-outcome-slot', 'fill-probability-slot', 'submit-ev'],
  answerInputs: ['outcomeSlot', 'probabilitySlot', 'evAnswer'],
  correctAnswers: { outcomeSlot: 10, probabilitySlot: 0.5, contributions: [4, 2.5, 0], ev: 6.5 },
  acceptedFormats: { ev: ['6.5', '6.50', '$6.50', '$6.5'] },
  mistakeRules: [
    { mistakeType: 'slot-type-error', feedback: 'An outcome or probability is in the wrong slot.' },
    { mistakeType: 'unweighted-sum', feedback: 'Add contributions, not raw payouts.' },
    { mistakeType: 'arithmetic-error', feedback: 'Re-add the contributions.' },
  ],
  feedback: feedbackMap('Correct! 10×0.4 + 5×0.5 + 0×0.1 = 4 + 2.5 + 0 = $6.50.', p7Wrong),
  wrongFeedback: p7Wrong,
  hints: [
    { id: 'l2f-h1', label: 'Slot types', content: 'Before a × is an outcome; after a payout is a probability.', visualType: 'formula' },
    { id: 'l2f-h2', label: 'Place the cards', content: '$10 is the payout with probability 0.4; 0.5 is the probability of $5.' },
    { id: 'l2f-h3', label: 'Add the contributions', content: '4 + 2.5 + 0 = 6.5.' },
  ],
  demoConfig: problemPackADemoConfigs['l2-fill-missing-formula'],
  currentTaskConfig: problemPackACurrentTaskConfigs['l2-fill-missing-formula'],
  completionRule: 'Fill the outcome slot (10) and probability slot (0.5), then submit EV of 6.5.',
  masteryTags: ['weighted-average', 'formula-construction'],
  placement: tapPlacement,
  fieldValidation: {
    outcomeSlot: { kind: 'numeric', tolerance: 0.01 },
    probabilitySlot: { kind: 'probability', tolerance: 0.01 },
    ev: { kind: 'money', tolerance: 0.01 },
  },
  animations: [
    { id: 'slot-snap', description: 'Cards snap into slots; contribution chips appear once a row is correct.', reducedMotionSafe: true },
    { id: 'sum-chips', description: 'Contribution chips slide together to form the final EV.', reducedMotionSafe: true },
  ],
}

// ---------------------------------------------------------------------------
// Lesson 2, Problem 4 — l2-diagnose-bad-ev-setups
// ---------------------------------------------------------------------------

const p8Wrong: Record<string, WrongFeedback> = {
  'summed-raw-payouts': {
    whatHappened: 'You chose Formula A as valid.',
    whyWrong: 'A adds the payouts (20 + 4 + 0) without multiplying by any probability, so it is not an expected value.',
    nextAction: 'Choose the formula that multiplies every outcome by its probability — Formula C.',
  },
  'chose-incomplete-setup': {
    whatHappened: 'You chose Formula B as valid (or misjudged completeness).',
    whyWrong: 'B drops the $0 outcome and its 0.5 probability, leaving half the probability unrepresented even though that contribution is zero.',
    nextAction: 'Choose Formula C, which includes the $0 term.',
  },
  'wrong-diagnosis': {
    whatHappened: 'A defect is misidentified.',
    whyWrong: 'A sums raw payouts (no weighting); B omits the $0 outcome.',
    nextAction: 'Label A “no probability weighting” and B “omits the $0 outcome”.',
  },
}

const PROBLEM_L2_DIAGNOSE: PackProblem = {
  canonicalSlug: 'l2-diagnose-bad-ev-setups',
  storageId: 'l2-diagnose-bad-ev-setups',
  chapterId: PACK_CHAPTER_ID,
  lessonId: 'lesson-2',
  lessonIndex: 1,
  problemIndexWithinLesson: 3,
  globalProblemIndex: 7,
  title: 'Diagnose Bad EV Setups',
  concept: 'A complete EV model multiplies every outcome by its probability and represents all outcomes.',
  difficulty: 3,
  scenarioText:
    'Game data: $20 with 0.25, $4 with 0.25, $0 with 0.5. A: 20 + 4 + 0. B: 20×0.25 + 4×0.25. C: 20×0.25 + 4×0.25 + 0×0.5. Which setup is valid?',
  visualType: 'formula-checklist',
  interactionType: 'diagnose-formulas',
  givenData: {
    outcomes: [20, 4, 0],
    probabilities: [0.25, 0.25, 0.5],
    formulas: {
      A: '20 + 4 + 0',
      B: '20 × 0.25 + 4 × 0.25',
      C: '20 × 0.25 + 4 × 0.25 + 0 × 0.5',
    },
    defectOptionsA: ['no-probability-weighting', 'omits-zero-outcome', 'arithmetic-error'],
    defectOptionsB: ['omits-zero-outcome', 'no-probability-weighting', 'arithmetic-error'],
  },
  requiredActions: ['select-valid', 'identify-defect-a', 'identify-defect-b'],
  answerInputs: ['validChoice', 'defectA', 'defectB'],
  correctAnswers: { validChoice: 'C', defectA: 'no probability weighting', defectB: 'omits zero outcome' },
  acceptedFormats: {
    validChoice: ['C', 'Formula C'],
    defectA: ['no probability weighting', 'no weighting', 'sums raw payouts'],
    defectB: ['omits zero outcome', 'omits $0 outcome', 'missing zero outcome'],
  },
  mistakeRules: [
    { mistakeType: 'summed-raw-payouts', feedback: 'A has no probability weighting.' },
    { mistakeType: 'chose-incomplete-setup', feedback: 'B omits the $0 outcome.' },
    { mistakeType: 'wrong-diagnosis', feedback: 'Re-check which formula has which defect.' },
  ],
  feedback: feedbackMap(
    'Correct! C is the complete model. A sums payouts with no probability weighting, and B omits the $0 outcome — a zero contribution still belongs because it accounts for the remaining probability.',
    p8Wrong,
  ),
  hints: [
    { id: 'l2d-h1', label: 'Apply the checklist', content: 'Does each payout have a probability? Are all outcomes present?', visualType: 'checklist' },
    { id: 'l2d-h2', label: 'Inspect A and B', content: 'A never multiplies by a probability. B stops before the $0 outcome.' },
    { id: 'l2d-h3', label: 'Zero still counts', content: 'C includes 0 × 0.5; the zero contribution accounts for the remaining probability. C is valid.' },
  ],
  wrongFeedback: p8Wrong,
  demoConfig: problemPackADemoConfigs['l2-diagnose-bad-ev-setups'],
  currentTaskConfig: problemPackACurrentTaskConfigs['l2-diagnose-bad-ev-setups'],
  completionRule: 'Select C as valid, diagnose A as unweighted, and B as omitting the $0 outcome.',
  masteryTags: ['weighted-average', 'model-completeness'],
  fieldValidation: {
    validChoice: { kind: 'choice' },
    defectA: { kind: 'choice' },
    defectB: { kind: 'choice' },
  },
  animations: [
    { id: 'checklist-marks', description: 'Each checklist item gets a check or cross per formula.', reducedMotionSafe: true },
    { id: 'zero-term-glow', description: 'The $0 term in C glows to show a zero contribution still belongs.', reducedMotionSafe: true },
  ],
}

// ---------------------------------------------------------------------------
// Lesson 3, Problem 1 — l3-mystery-box-outcomes (storage: problem-3)
// ---------------------------------------------------------------------------

const p9Wrong: Record<string, WrongFeedback> = {
  'counts-as-probabilities': {
    whatHappened: 'You entered a count where a probability belongs.',
    whyWrong: 'A count is how many boxes match; a probability compares that count with all 6 boxes.',
    nextAction: 'Divide the count by 6, e.g. enter 2/6 or 1/3 for the $6 row.',
  },
  'wrong-denominator': {
    whatHappened: 'You used the wrong total in a probability.',
    whyWrong: 'There are 6 boxes in total, so every probability is compared against 6.',
    nextAction: 'Use count/6 for each row.',
  },
  'entered-total-as-count': {
    whatHappened: 'You entered 6 (the total) as a count.',
    whyWrong: 'A count is how many boxes show that exact payout, not the total number of boxes.',
    nextAction: 'Count only the matching boxes: 1, 2, and 3.',
  },
  'wrong-count': {
    whatHappened: 'A count does not match the revealed boxes.',
    whyWrong: 'The count is the number of boxes showing that payout.',
    nextAction: 'Recount: $12→1, $6→2, $0→3.',
  },
  'probabilities-not-one': {
    whatHappened: 'Your probabilities do not sum to 1.',
    whyWrong: 'The three counts (1, 2, 3) add up to all 6 boxes, so the probabilities must total 1.',
    nextAction: 'Use 1/6, 2/6, and 3/6.',
  },
  'omitted-zero': {
    whatHappened: 'You left out the $0 outcome.',
    whyWrong: 'Three boxes still pay $0, so that row belongs in the table.',
    nextAction: 'Enter count 3 and probability 3/6 for the $0 row.',
  },
}

const PROBLEM_L3_MYSTERY_BOXES: PackProblem = {
  canonicalSlug: 'l3-mystery-box-outcomes',
  storageId: 'problem-3',
  legacyProblemId: 'problem-3',
  chapterId: PACK_CHAPTER_ID,
  lessonId: 'lesson-3',
  lessonIndex: 2,
  problemIndexWithinLesson: 0,
  globalProblemIndex: 8,
  title: 'Mystery Box Outcomes',
  concept: 'Expected value can be calculated from counts rather than prewritten percentages.',
  difficulty: 3,
  scenarioText:
    'Bob chooses one of 6 boxes: 1 has $12, 2 have $6, and 3 have $0. Reveal all boxes, then complete the count and probability for each outcome.',
  visualType: 'mystery-boxes',
  interactionType: 'reveal-and-table',
  givenData: { boxes: [12, 6, 6, 0, 0, 0], total: 6 },
  requiredActions: ['reveal-all', 'fill-counts', 'fill-probabilities', 'confirm-sum'],
  answerInputs: ['counts', 'probabilities'],
  correctAnswers: {
    rows: [
      { outcome: 12, count: 1, probability: 1 / 6 },
      { outcome: 6, count: 2, probability: 2 / 6 },
      { outcome: 0, count: 3, probability: 3 / 6 },
    ],
  },
  acceptedFormats: {
    'probability-12': ['1/6', '0.1667', '0.167'],
    'probability-6': ['2/6', '1/3', '0.3333', '0.333'],
    'probability-0': ['3/6', '1/2', '0.5', '.5', '50%'],
  },
  mistakeRules: [
    { mistakeType: 'counts-as-probabilities', feedback: 'Probability is count ÷ total boxes.' },
    { mistakeType: 'wrong-denominator', feedback: 'Compare each count against 6.' },
    { mistakeType: 'entered-total-as-count', feedback: 'Count only matching boxes.' },
    { mistakeType: 'wrong-count', feedback: 'Recount the matching boxes.' },
    { mistakeType: 'probabilities-not-one', feedback: 'Probabilities must sum to 1.' },
    { mistakeType: 'omitted-zero', feedback: 'The $0 outcome belongs in the table.' },
  ],
  feedback: feedbackMap('Correct! $12 → 1/6, $6 → 2/6, $0 → 3/6, and the probabilities sum to 1.', p9Wrong),
  wrongFeedback: p9Wrong,
  hints: [
    { id: 'p3-h1', label: 'Group by color', content: 'Matching boxes share a color — count how many in each group.', visualType: 'boxes' },
    { id: 'p3-h2', label: 'Divide by 6', content: 'Probability = matching boxes ÷ 6 total boxes.' },
    { id: 'p3-h3', label: 'The rows', content: '$12→1/6, $6→2/6 (=1/3), $0→3/6 (=1/2).' },
  ],
  demoConfig: problemPackADemoConfigs['l3-mystery-box-outcomes'],
  currentTaskConfig: problemPackACurrentTaskConfigs['l3-mystery-box-outcomes'],
  completionRule: 'Reveal all six boxes and complete every count and probability cell correctly.',
  masteryTags: ['probability-from-counts'],
  visualGroups: [
    { key: '12', label: '$12', colorToken: 'group-amber', itemIndices: [0] },
    { key: '6', label: '$6', colorToken: 'group-teal', itemIndices: [1, 2] },
    { key: '0', label: '$0', colorToken: 'group-slate', itemIndices: [3, 4, 5] },
  ],
  fieldValidation: {
    count: { kind: 'numeric', tolerance: 0.001 },
    probability: { kind: 'probability', tolerance: 0.005 },
  },
  animations: [
    { id: 'box-flip', description: 'Boxes flip/pop open; matching outcomes receive consistent colors.', reducedMotionSafe: true },
    { id: 'active-row', description: 'The active table row highlights its matching boxes (visual group).', reducedMotionSafe: true },
  ],
}

// ---------------------------------------------------------------------------
// Lesson 3, Problem 2 — l3-calculate-ev-from-table (storage: problem-4)
// ---------------------------------------------------------------------------

const p10Wrong: Record<string, WrongFeedback> = {
  'arithmetic-error': {
    whatHappened: 'A contribution does not equal outcome × probability.',
    whyWrong: 'Each row contribution multiplies the payout by its probability.',
    nextAction: 'Use 12 × 1/6 = 2, 6 × 2/6 = 2, 0 × 3/6 = 0.',
  },
  'omitted-zero-row': {
    whatHappened: 'The $0 row was skipped or given a nonzero value.',
    whyWrong: 'The $0 outcome still belongs in the sum at 0 × 3/6 = $0.',
    nextAction: 'Enter 0 for the $0 row.',
  },
  'unweighted-sum': {
    whatHappened: 'You summed the raw payouts.',
    whyWrong: 'A contribution is payout × probability — the outcomes do not occur every time.',
    nextAction: 'Use 12 × 1/6 = 2 and 6 × 2/6 = 2 before adding.',
  },
  'added-probabilities': {
    whatHappened: 'You entered the probabilities instead of contributions.',
    whyWrong: 'A contribution multiplies the payout by its probability.',
    nextAction: 'For the $6 row compute 6 × 2/6 = 2, not 2/6.',
  },
}

const PROBLEM_L3_CALCULATE_EV: PackProblem = {
  canonicalSlug: 'l3-calculate-ev-from-table',
  storageId: 'problem-4',
  legacyProblemId: 'problem-4',
  chapterId: PACK_CHAPTER_ID,
  lessonId: 'lesson-3',
  lessonIndex: 2,
  problemIndexWithinLesson: 1,
  globalProblemIndex: 9,
  title: 'Calculate EV from the Table',
  concept: 'Calculate EV by summing each outcome × probability contribution.',
  difficulty: 4,
  scenarioText:
    'Using the mystery box table: 12 × 1/6 + 6 × 2/6 + 0 × 3/6. Fill each contribution, then the final EV.',
  visualType: 'ev-table',
  interactionType: 'fill-contributions',
  givenData: { outcomes: [12, 6, 0], probabilities: [1 / 6, 2 / 6, 3 / 6], contributions: [2, 2, 0], ev: 4 },
  requiredActions: ['fill-contributions', 'submit-ev'],
  answerInputs: ['contributions', 'evAnswer'],
  correctAnswers: { contributions: [2, 2, 0], ev: 4 },
  acceptedFormats: {
    contribution: ['2', '2.0', '$2', '0', '$0'],
    ev: ['4', '4.0', '4.00', '$4', '$4.00'],
  },
  mistakeRules: [
    { mistakeType: 'arithmetic-error', feedback: 'Contribution = outcome × probability.' },
    { mistakeType: 'omitted-zero-row', feedback: 'The $0 row contributes 0 but belongs.' },
    { mistakeType: 'unweighted-sum', feedback: 'Do not add raw payouts.' },
    { mistakeType: 'added-probabilities', feedback: 'Multiply payout by probability, not the probability alone.' },
  ],
  feedback: feedbackMap('Correct! 12×1/6 = 2, 6×2/6 = 2, 0×3/6 = 0, so EV = $4.', p10Wrong),
  wrongFeedback: p10Wrong,
  hints: [
    { id: 'p4-h1', label: 'Row by row', content: 'Each contribution is outcome × probability.', visualType: 'contribution-cell' },
    { id: 'p4-h2', label: 'Use the colors', content: 'Each colored chunk ties a contribution to its outcome group.', visualType: 'chunks' },
    { id: 'p4-h3', label: 'Add them', content: 'EV = 2 + 2 + 0 = $4.' },
  ],
  demoConfig: problemPackADemoConfigs['l3-calculate-ev-from-table'],
  currentTaskConfig: problemPackACurrentTaskConfigs['l3-calculate-ev-from-table'],
  completionRule: 'Submit all three contributions (2, 2, 0) and the final EV of $4.',
  masteryTags: ['ev-from-table'],
  visualGroups: [
    { key: '12', label: '$12', colorToken: 'group-amber', itemIndices: [0] },
    { key: '6', label: '$6', colorToken: 'group-teal', itemIndices: [1] },
    { key: '0', label: '$0', colorToken: 'group-slate', itemIndices: [2] },
  ],
  fieldValidation: {
    contribution: { kind: 'money', tolerance: 0.01 },
    ev: { kind: 'money', tolerance: 0.01 },
  },
  animations: [
    { id: 'row-to-chunk', description: 'Each row transforms into a colored contribution chunk.', reducedMotionSafe: true },
    { id: 'chunks-combine', description: 'Contribution chunks move together and combine into $4.', reducedMotionSafe: true },
  ],
}

// ---------------------------------------------------------------------------
// Pack export (canonical chapter order)
// ---------------------------------------------------------------------------

export const problemPackA: PackProblem[] = [
  PROBLEM_L1_LONG_RUN_AVERAGE,
  PROBLEM_L1_UNEQUAL_SPINNER,
  PROBLEM_L1_SHORT_VS_LONG,
  PROBLEM_L1_COMPARE_SPINNERS,
  PROBLEM_L2_BUILD_WEIGHTED,
  PROBLEM_L2_MATCH_OUTCOMES,
  PROBLEM_L2_FILL_FORMULA,
  PROBLEM_L2_DIAGNOSE,
  PROBLEM_L3_MYSTERY_BOXES,
  PROBLEM_L3_CALCULATE_EV,
]

export function getPackProblemBySlug(slug: string): PackProblem | undefined {
  return problemPackA.find((p) => p.canonicalSlug === slug)
}

export function getPackProblemByStorageId(storageId: string): PackProblem | undefined {
  return problemPackA.find((p) => p.storageId === storageId)
}
