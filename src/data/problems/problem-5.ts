import type { ProblemDefinition } from '../../types/problem'

export const PROBLEM_5: ProblemDefinition = {
  problemId: 'problem-5',
  title: 'Expected Payout vs Expected Profit',
  concept: 'Expected payout and expected profit differ when there is a cost to play.',
  difficulty: 5,
  scenarioText:
    'The mystery box game returns $4 on average, but it costs $3 to enter. Place the cost token, then find the expected profit.',
  visualType: 'payout-tray',
  interactionType: 'place-cost-token',
  givenData: { expectedPayout: 4, cost: 3 },
  requiredActions: ['place-cost-token', 'submit-profit'],
  answerInputs: ['profit'],
  correctAnswers: { profit: 1 },
  acceptedFormats: { profit: ['1', '1.0', '$1', '1/1', '2/2'] },
  mistakeRules: [
    { mistakeType: 'answered-payout', feedback: 'You answered expected payout ($4), not expected profit. Subtract the cost.' },
    { mistakeType: 'added-cost', feedback: 'Cost reduces profit. Use payout − cost, not payout + cost.' },
    { mistakeType: 'cost-as-probability', feedback: 'Cost is subtracted in dollars, not used as a probability.' },
    { mistakeType: 'reversed-subtraction', feedback: 'You computed cost − payout. Expected profit is payout − cost = $4 − $3 = $1.' },
  ],
  feedback: { correct: 'Correct! Expected profit = $4 − $3 = $1.' },
  teachingExplanation: {
    title: 'Key takeaway',
    body: [
      'Expected payout ($4) answers: “How much does the game return on average?” Expected profit answers a different question: “How much do I keep after paying to play?”',
      'The balance scale shows payout on one side and cost on the other. Subtracting the $3 entry fee from the $4 average return leaves $1 — that is the number that matters when you are deciding whether the game is worth playing.',
    ],
    takeaway: 'Expected profit = expected payout − cost. Payout and profit are not the same.',
  },
  hints: [
    { id: 'p5-h1', label: 'Tap the cost', content: 'Place the $3 cost into the equation to see profit.' },
    { id: 'p5-h2', label: 'Subtract', content: 'Expected profit = expected payout − cost = 4 − 3.' },
  ],
  completionRule: 'Select payout − cost and submit expected profit of $1.',
  masteryTags: ['payout-vs-profit'],
}
