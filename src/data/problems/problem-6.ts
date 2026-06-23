import type { ProblemDefinition } from '../../types/problem'

export const PROBLEM_6: ProblemDefinition = {
  problemId: 'problem-6',
  title: 'Fair, Favorable, or Unfavorable?',
  concept: 'Positive expected profit is favorable, zero is fair, negative is unfavorable.',
  difficulty: 6,
  scenarioText:
    'Three games: A pays $5 avg, costs $5; B pays $7 avg, costs $5; C pays $3 avg, costs $5. Sort each into the correct bucket.',
  visualType: 'classification',
  interactionType: 'tap-to-place-buckets',
  givenData: {
    games: [
      { id: 'A', payout: 5, cost: 5 },
      { id: 'B', payout: 7, cost: 5 },
      { id: 'C', payout: 3, cost: 5 },
    ],
  },
  requiredActions: ['sort-all-cards'],
  answerInputs: ['classifications'],
  correctAnswers: { A: 'fair', B: 'favorable', C: 'unfavorable' },
  acceptedFormats: { classification: ['fair', 'favorable', 'unfavorable'] },
  mistakeRules: [
    { mistakeType: 'positive-payout-favorable', feedback: 'A positive payout alone does not mean favorable. Subtract cost to get expected profit.' },
    { mistakeType: 'confused-fair-favorable', feedback: 'Fair means expected profit = $0 exactly, not just "not bad".' },
    { mistakeType: 'forgot-subtract-cost', feedback: 'Expected profit = payout − cost. Game C has profit −$2.' },
  ],
  feedback: { correct: 'Correct! A is fair ($0), B is favorable (+$2), C is unfavorable (−$2).' },
  hints: [
    { id: 'p6-h1', label: 'Profit first', content: 'Compute payout − cost for each game before sorting.' },
    { id: 'p6-h2', label: 'Number line', content: 'Zero profit = fair; above zero = favorable; below = unfavorable.' },
  ],
  completionRule: 'Place all three cards into correct buckets.',
  masteryTags: ['fairness-classification'],
}
