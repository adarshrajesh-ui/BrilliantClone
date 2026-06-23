import type { ProblemDefinition } from '../../types/problem'

export const PROBLEM_2: ProblemDefinition = {
  problemId: 'problem-2',
  title: 'Build the Weighted Average',
  concept: 'EV is a weighted average of outcomes.',
  difficulty: 2,
  scenarioText:
    'The spinner now has a 25% chance of $20 and a 75% chance of $0. Build the EV formula and calculate the result.',
  visualType: 'spinner-formula',
  interactionType: 'tap-to-place-formula',
  givenData: { outcomes: [20, 0], probabilities: [0.25, 0.75], cards: ['$20', '$0', '25%', '75%'] },
  requiredActions: ['place-formula-pairs', 'submit-ev'],
  answerInputs: ['formulaSlots', 'evAnswer'],
  correctAnswers: { slots: ['$20', '25%', '$0', '75%'], ev: 5 },
  acceptedFormats: { ev: ['5', '5.0', '$5'] },
  mistakeRules: [
    { mistakeType: 'reversed-outcome-probability', feedback: 'You reversed an outcome and its probability. Each payout should multiply its own chance.' },
    { mistakeType: 'omitted-probability', feedback: 'Every outcome needs a probability in the formula.' },
    { mistakeType: 'used-largest-payout', feedback: 'You used $20 as the answer because it is the largest payout. EV weights each outcome by its probability.' },
  ],
  feedback: { correct: 'Correct! 20 × 0.25 + 0 × 0.75 = $5.' },
  hints: [
    { id: 'p2-h1', label: 'Match pairs', content: 'Place each dollar amount next to its probability: $20 with 25%, $0 with 75%.' },
    { id: 'p2-h2', label: 'Multiply and add', content: 'EV = (20 × 0.25) + (0 × 0.75).' },
  ],
  completionRule: 'Correctly place both outcome-probability pairs and submit final EV of $5.',
  masteryTags: ['weighted-average'],
}
