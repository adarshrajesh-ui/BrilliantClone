import type { ProblemDefinition } from '../../types/problem'

export const PROBLEM_7: ProblemDefinition = {
  problemId: 'problem-7',
  title: 'Build the Whole EV Model',
  concept: 'Independently convert a game into an EV calculation.',
  difficulty: 7,
  scenarioText:
    'A carnival wheel has 10 equal sections: 1 pays $30, 2 pay $10, 7 pay $0. It costs $5 to spin. Build the full model.',
  visualType: 'wheel-table',
  interactionType: 'full-ev-model',
  givenData: { sections: 10, outcomes: [{ v: 30, n: 1 }, { v: 10, n: 2 }, { v: 0, n: 7 }], cost: 5 },
  requiredActions: ['fill-table', 'payout', 'profit', 'decision'],
  answerInputs: ['probabilities', 'contributions', 'expectedPayout', 'expectedProfit', 'decision'],
  correctAnswers: {
    probabilities: [0.1, 0.2, 0.7],
    contributions: [3, 2, 0],
    expectedPayout: 5,
    expectedProfit: 0,
    decision: 'fair',
  },
  acceptedFormats: {
    probability: ['1/10', '0.1', '2/10', '0.2', '7/10', '0.7'],
    decision: ['fair', 'favorable', 'unfavorable'],
  },
  mistakeRules: [
    { mistakeType: 'wrong-denominator', feedback: 'Since the wheel has 10 total sections, divide by 10.' },
    { mistakeType: 'count-not-probability', feedback: 'You used the number of sections as the probability. Divide by 10.' },
    { mistakeType: 'payout-not-profit', feedback: 'You calculated expected payout but not expected profit. Subtract the $5 cost.' },
    { mistakeType: 'fair-marked-favorable', feedback: 'Expected profit is $0, so the game is fair — not favorable just because payout is positive.' },
  ],
  feedback: { correct: 'Correct! EV payout = $5, profit = $0, decision = fair.' },
  hints: [
    { id: 'p7-h1', label: 'Sections ÷ 10', content: 'Probability = (sections with that payout) / 10.' },
    { id: 'p7-h2', label: 'Contribution', content: 'Each row: outcome × probability.' },
    { id: 'p7-h3', label: 'Profit', content: 'Expected profit = expected payout ($5) − cost ($5) = 0.' },
    { id: 'p7-h4', label: 'Decision', content: 'Zero expected profit means the game is fair.' },
  ],
  completionRule: 'Fill all probabilities, contributions, expected payout, expected profit, and decision.',
  masteryTags: ['full-ev-model', 'payout-vs-profit'],
}
