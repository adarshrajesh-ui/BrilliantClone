import type { PackProblemDefinition } from '../types'
import { problemPackBDemoConfigs } from '../demoConfigs'

// Problem 14 — Lesson 4, Problem 2. ORIGINAL — storage ID preserved as problem-6.
export const L4_FAIR_FAVORABLE_UNFAVORABLE: PackProblemDefinition = {
  problemId: 'problem-6',
  canonicalSlug: 'l4-fair-favorable-unfavorable',
  storageId: 'problem-6',
  legacyProblemId: 'problem-6',
  lessonId: 'lesson-4',
  lessonIndex: 3,
  problemIndexWithinLesson: 1,
  globalProblemIndex: 13,
  title: 'Fair, Favorable, or Unfavorable?',
  concept: 'Positive expected profit is favorable, zero is fair, negative is unfavorable.',
  difficulty: 6,
  scenarioText:
    'Three games — A: payout $5, cost $5; B: payout $7, cost $5; C: payout $3, cost $5. Sort each into the correct bucket using expected profit.',
  visualType: 'classification',
  interactionType: 'tap-to-place-buckets',
  givenData: {
    games: [
      { id: 'A', payout: 5, cost: 5, profit: 0 },
      { id: 'B', payout: 7, cost: 5, profit: 2 },
      { id: 'C', payout: 3, cost: 5, profit: -2 },
    ],
    buckets: ['favorable', 'fair', 'unfavorable'],
  },
  requiredActions: ['sort-all-cards'],
  answerInputs: ['assignments'],
  correctAnswers: { A: 'fair', B: 'favorable', C: 'unfavorable' },
  acceptedFormats: {
    classification: ['fair', 'favorable', 'fav', 'unfavorable', 'unfav'],
  },
  mistakeRules: [
    { mistakeType: 'positive-payout-favorable', feedback: 'A positive payout alone is not favorable. Subtract cost to get expected profit.' },
    { mistakeType: 'confused-fair-favorable', feedback: 'Fair means expected profit = $0 exactly, not just "not bad".' },
    { mistakeType: 'reversed-classification', feedback: 'Positive profit is favorable; negative profit is unfavorable — do not reverse them.' },
    { mistakeType: 'forgot-subtract-cost', feedback: 'Expected profit = payout − cost. A = $0, B = +$2, C = −$2.' },
  ],
  feedback: { correct: 'Correct! A is fair ($0), B is favorable (+$2), C is unfavorable (−$2).' },
  hints: [
    { id: 'p14-h1', label: 'Profit first', content: 'Compute payout − cost for each game before sorting.' },
    { id: 'p14-h2', label: 'Number line', content: 'Zero profit = fair; above zero = favorable; below zero = unfavorable.' },
    { id: 'p14-h3', label: 'Almost there', content: 'A = 5 − 5 = 0 (fair); B = 7 − 5 = +2 (favorable); C = 3 − 5 = −2 (unfavorable).' },
  ],
  completionRule: 'Place all three cards into the correct buckets by expected profit.',
  masteryTags: ['fairness-classification'],
  demoConfig: problemPackBDemoConfigs['l4-fair-favorable-unfavorable'],
  currentTaskConfig: {
    intro: 'Three game cards and three buckets: favorable, fair, unfavorable.',
    firstStep: 'Tap Game A, then tap the bucket that matches its expected profit.',
    checklist: [
      { id: 'place-a', label: 'Classify Game A' },
      { id: 'place-b', label: 'Classify Game B' },
      { id: 'place-c', label: 'Classify Game C' },
    ],
  },
  animations: [
    { id: 'card-to-bucket', describe: 'A tapped card slides into its bucket; tapping again moves it.', reducedMotion: 'Card snaps to the bucket immediately.' },
    { id: 'profit-meter', describe: 'After placement, a profit meter reveals where the game sits on the number line.', reducedMotion: 'Profit value and number-line position shown immediately.' },
  ],
  checkerKey: 'l4-fair-favorable-unfavorable',
}
