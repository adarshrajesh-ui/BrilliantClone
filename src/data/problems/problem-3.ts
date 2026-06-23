import type { ProblemDefinition } from '../../types/problem'

export const PROBLEM_3: ProblemDefinition = {
  problemId: 'problem-3',
  title: 'Mystery Box Outcomes',
  concept: 'EV can be calculated from counts, not just percentages.',
  difficulty: 3,
  scenarioText:
    'Bob chooses one of 6 boxes: 1 has $12, 2 have $6, and 3 have $0. Reveal all boxes and complete the probability table.',
  visualType: 'mystery-boxes',
  interactionType: 'reveal-and-table',
  givenData: { boxes: [12, 6, 6, 0, 0, 0], total: 6 },
  requiredActions: ['reveal-all', 'fill-table'],
  answerInputs: ['counts', 'probabilities'],
  correctAnswers: {
    rows: [
      { outcome: 12, count: 1, probability: 1 / 6 },
      { outcome: 6, count: 2, probability: 2 / 6 },
      { outcome: 0, count: 3, probability: 3 / 6 },
    ],
  },
  acceptedFormats: {
    probability: ['1/6', '0.1667', '2/6', '1/3', '0.3333', '3/6', '1/2', '0.5'],
  },
  mistakeRules: [
    { mistakeType: 'counts-as-probabilities', feedback: 'You entered counts in the probability column. Probabilities are counts divided by total boxes (6).' },
    { mistakeType: 'probabilities-not-one', feedback: 'Probabilities must sum to 1. Check each row against the number of boxes.' },
    { mistakeType: 'ignored-zero', feedback: 'The $0 outcome still counts. Three boxes have $0.' },
  ],
  feedback: { correct: 'Correct! $12 → 1/6, $6 → 2/6, $0 → 3/6.' },
  hints: [
    { id: 'p3-h1', label: 'Count boxes', content: 'Group revealed boxes by dollar value and count how many in each group.' },
    { id: 'p3-h2', label: 'Divide by 6', content: 'Probability = (number of boxes with that outcome) ÷ 6.' },
  ],
  completionRule: 'Reveal all boxes and complete all table cells correctly.',
  masteryTags: ['probability-from-counts'],
}
