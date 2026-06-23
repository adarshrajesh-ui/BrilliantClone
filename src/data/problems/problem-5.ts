import type { ProblemDefinition } from '../../types/problem'

export const PROBLEM_5: ProblemDefinition = {
  problemId: 'problem-5',
  title: 'Expected Payout vs Expected Profit',
  concept: 'Expected payout and expected profit differ when there is a cost to play.',
  difficulty: 5,
  scenarioText:
    'The mystery box game has expected payout $4 and costs $3 to enter. Find the expected profit.',
  visualType: 'balance-scale',
  interactionType: 'tap-equation',
  givenData: { expectedPayout: 4, cost: 3 },
  requiredActions: ['place-cost', 'submit-profit'],
  answerInputs: ['profit'],
  correctAnswers: { profit: 1 },
  acceptedFormats: { profit: ['1', '1.0', '$1'] },
  mistakeRules: [
    { mistakeType: 'answered-payout', feedback: 'You answered expected payout ($4), not expected profit. Subtract the cost.' },
    { mistakeType: 'added-cost', feedback: 'Cost reduces profit. Use payout − cost, not payout + cost.' },
    { mistakeType: 'cost-as-probability', feedback: 'Cost is subtracted in dollars, not used as a probability.' },
  ],
  feedback: { correct: 'Correct! Expected profit = $4 − $3 = $1.' },
  hints: [
    { id: 'p5-h1', label: 'Tap the cost', content: 'Place the $3 cost into the equation to see profit.' },
    { id: 'p5-h2', label: 'Subtract', content: 'Expected profit = expected payout − cost = 4 − 3.' },
  ],
  completionRule: 'Select payout − cost and submit expected profit of $1.',
  masteryTags: ['payout-vs-profit'],
}
