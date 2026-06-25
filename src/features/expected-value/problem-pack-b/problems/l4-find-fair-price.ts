import type { PackProblemDefinition } from '../types'
import { problemPackBDemoConfigs } from '../demoConfigs'

// Problem 15 — Lesson 4, Problem 3.
export const L4_FIND_FAIR_PRICE: PackProblemDefinition = {
  problemId: 'l4-find-fair-price',
  canonicalSlug: 'l4-find-fair-price',
  storageId: 'l4-find-fair-price',
  lessonId: 'lesson-4',
  lessonIndex: 3,
  problemIndexWithinLesson: 2,
  globalProblemIndex: 14,
  title: 'Find the Fair Price',
  concept: 'A fair game has expected profit zero, so the fair cost equals the expected payout.',
  difficulty: 6,
  scenarioText:
    'A spinner pays $8 half the time and $0 half the time. What entry cost makes the game fair?',
  visualType: 'balance-scale',
  interactionType: 'cost-balance',
  givenData: { spinner: [{ value: 8, probability: 0.5 }, { value: 0, probability: 0.5 }] },
  requiredActions: ['find-expected-payout', 'set-fair-cost', 'classify'],
  answerInputs: ['expectedPayout', 'fairCost', 'expectedProfit', 'classification'],
  correctAnswers: { expectedPayout: 4, fairCost: 4, expectedProfit: 0, classification: 'fair' },
  acceptedFormats: {
    expectedPayout: ['4', '4.0', '4.00', '$4', '$4.00', '8/2'],
    fairCost: ['4', '4.0', '4.00', '$4', '$4.00', '8/2'],
    expectedProfit: ['0', '0.0', '$0', '0/1'],
    classification: ['fair'],
  },
  mistakeRules: [
    { mistakeType: 'used-largest-payout', feedback: 'The fair cost equals the expected payout ($4), not the largest prize ($8).' },
    { mistakeType: 'cost-below-payout', feedback: 'A cost below $4 favors the player — not fair. Fair cost = expected payout = $4.' },
    { mistakeType: 'cost-above-payout', feedback: 'A cost above $4 is unfavorable — not fair. Fair cost = expected payout = $4.' },
    { mistakeType: 'nonzero-fair-profit', feedback: 'A fair game has expected profit $0: 4 − 4 = 0.' },
    { mistakeType: 'wrong-expected-payout', feedback: 'Expected payout = 8 × 0.5 + 0 × 0.5 = $4.' },
  ],
  feedback: {
    correct: 'Correct! Expected payout $4 → fair cost $4 → expected profit $0 → fair.',
  },
  hints: [
    { id: 'p15-h1', label: 'Payout first', content: 'Find the expected payout: 8 × 0.5 + 0 × 0.5.' },
    { id: 'p15-h2', label: 'Balance', content: 'Fairness happens when cost balances the expected payout.' },
    { id: 'p15-h3', label: 'Target zero', content: 'Set the cost so expected profit sits on zero — cost = $4.' },
  ],
  completionRule: 'Expected payout $4, fair cost $4, expected profit $0, classification fair.',
  masteryTags: ['fair-price', 'payout-vs-profit'],
  demoConfig: problemPackBDemoConfigs['l4-find-fair-price'],
  currentTaskConfig: {
    intro: 'A 50/50 spinner, an expected-payout meter, a cost control, and a fairness number line.',
    firstStep: 'Compute the spinner\u2019s expected payout.',
    checklist: [
      { id: 'payout', label: 'Find the expected payout' },
      { id: 'cost', label: 'Set the fair cost' },
      { id: 'profit', label: 'Confirm expected profit is $0' },
      { id: 'classify', label: 'Classify the game' },
    ],
  },
  animations: [
    { id: 'balance-tilt', describe: 'The scale tilts until cost matches payout, then levels at fair.', reducedMotion: 'Scale shows level/tilted state instantly.' },
    { id: 'profit-dot', describe: 'The expected-profit dot slides to zero on the number line when fair.', reducedMotion: 'Dot placed at zero immediately.' },
  ],
  checkerKey: 'l4-find-fair-price',
}
