import type { PackProblemDefinition } from '../types'
import { problemPackBDemoConfigs } from '../demoConfigs'

// Problem 17 — Lesson 5, Problem 1. ORIGINAL — storage ID preserved as problem-7.
export const L5_BUILD_WHOLE_EV_MODEL: PackProblemDefinition = {
  problemId: 'problem-7',
  canonicalSlug: 'l5-build-whole-ev-model',
  storageId: 'problem-7',
  legacyProblemId: 'problem-7',
  lessonId: 'lesson-5',
  lessonIndex: 4,
  problemIndexWithinLesson: 0,
  globalProblemIndex: 16,
  title: 'Build the Whole EV Model',
  concept: 'Independently convert a game into probabilities, contributions, payout, profit, and a decision.',
  difficulty: 7,
  scenarioText:
    'A carnival wheel has 10 equal sections: 1 pays $30, 2 pay $10, 7 pay $0. It costs $5 to spin. Build the full model and decide.',
  visualType: 'wheel-table',
  interactionType: 'full-ev-model',
  givenData: {
    sections: 10,
    outcomes: [{ value: 30, count: 1 }, { value: 10, count: 2 }, { value: 0, count: 7 }],
    cost: 5,
  },
  requiredActions: ['fill-table', 'expected-payout', 'expected-profit', 'decision'],
  answerInputs: ['probabilities', 'contributions', 'expectedPayout', 'expectedProfit', 'decision'],
  correctAnswers: {
    probabilities: [0.1, 0.2, 0.7],
    contributions: [3, 2, 0],
    expectedPayout: 5,
    expectedProfit: 0,
    decision: 'fair',
  },
  acceptedFormats: {
    probability30: ['1/10', '0.1', '.1', '10%'],
    probability10: ['2/10', '1/5', '0.2', '.2', '20%'],
    probability0: ['7/10', '0.7', '.7', '70%'],
    expectedPayout: ['5', '5.0', '$5'],
    expectedProfit: ['0', '0.0', '$0'],
    decision: ['fair'],
  },
  mistakeRules: [
    { mistakeType: 'wrong-denominator', feedback: 'The wheel has 10 sections, so divide by 10.' },
    { mistakeType: 'count-not-probability', feedback: 'You used the number of sections as the probability. Divide by 10.' },
    { mistakeType: 'arithmetic-error', feedback: 'Contribution = outcome × probability. Recheck each row.' },
    { mistakeType: 'payout-not-profit', feedback: 'Expected profit = expected payout − cost. Subtract the $5 cost.' },
    { mistakeType: 'fair-marked-favorable', feedback: 'Expected profit is $0, so the game is fair, not favorable.' },
  ],
  feedback: { correct: 'Correct! Expected payout $5, cost $5, expected profit $0 → fair.' },
  hints: [
    { id: 'p17-h1', label: 'Sections ÷ 10', content: 'Probability = (sections with that payout) / 10.' },
    { id: 'p17-h2', label: 'Contribution', content: 'Each row: outcome × probability.' },
    { id: 'p17-h3', label: 'Profit', content: 'Expected profit = expected payout ($5) − cost ($5) = 0.' },
    { id: 'p17-h4', label: 'Decision', content: 'Zero expected profit means the game is fair.' },
  ],
  completionRule: 'Fill all probabilities, contributions, expected payout, expected profit, and decision.',
  masteryTags: ['full-ev-model', 'payout-vs-profit'],
  demoConfig: problemPackBDemoConfigs['l5-build-whole-ev-model'],
  currentTaskConfig: {
    intro: 'A 10-section wheel and a blank table (Outcome | Probability | Contribution), plus payout/profit/decision fields.',
    firstStep: 'Tap the wheel sections to group them by payout, then fill the $30 probability.',
    checklist: [
      { id: 'probs', label: 'Fill the three probabilities (÷10)' },
      { id: 'contribs', label: 'Fill the three contributions' },
      { id: 'payout', label: 'Compute expected payout' },
      { id: 'profit', label: 'Compute expected profit' },
      { id: 'decision', label: 'Make the fairness decision' },
    ],
  },
  animations: [
    { id: 'prob-highlight', describe: 'The probability hint highlights matching wheel sections and shows selected / 10.', reducedMotion: 'Matching sections outlined; ratio shown as text.' },
    { id: 'contribution-row', describe: 'The contribution hint animates outcome × probability for the active row.', reducedMotion: 'Row product shown immediately.' },
    { id: 'profit-balance', describe: 'The profit hint balances payout $5 against cost $5.', reducedMotion: 'Balanced state shown immediately.' },
    { id: 'decision-dot', describe: 'The decision hint places the expected-profit dot at zero.', reducedMotion: 'Dot placed at zero immediately.' },
  ],
  checkerKey: 'l5-build-whole-ev-model',
}
