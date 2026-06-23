import type { ProblemDefinition } from '../../types/problem'

export const PROBLEM_4: ProblemDefinition = {
  problemId: 'problem-4',
  title: 'Calculate EV from the Table',
  concept: 'Sum each outcome × probability contribution.',
  difficulty: 4,
  scenarioText:
    'Using the mystery box table: 12 × 1/6 + 6 × 2/6 + 0 × 3/6. Fill each contribution and the final EV.',
  visualType: 'ev-table',
  interactionType: 'fill-contributions',
  givenData: { outcomes: [12, 6, 0], probabilities: [1 / 6, 2 / 6, 3 / 6] },
  requiredActions: ['fill-contributions', 'submit-ev'],
  answerInputs: ['contributions', 'ev'],
  correctAnswers: { contributions: [2, 2, 0], ev: 4 },
  acceptedFormats: { ev: ['4', '4.0', '$4'] },
  mistakeRules: [
    { mistakeType: 'arithmetic-error', feedback: 'Check each row: multiply outcome × probability.' },
    { mistakeType: 'omitted-zero-row', feedback: 'Include the $0 row — it contributes 0 but belongs in the sum.' },
    { mistakeType: 'unweighted-sum', feedback: 'You summed payouts without weighting by probability.' },
  ],
  feedback: { correct: 'Correct! 12×1/6=2, 6×2/6=2, 0×3/6=0, so EV = $4.' },
  hints: [
    { id: 'p4-h1', label: 'Row by row', content: 'Contribution = outcome × probability for each row.' },
    { id: 'p4-h2', label: 'Add contributions', content: 'EV = 2 + 2 + 0 = 4.' },
  ],
  completionRule: 'Submit all three row contributions and the final EV.',
  masteryTags: ['ev-from-table'],
}
