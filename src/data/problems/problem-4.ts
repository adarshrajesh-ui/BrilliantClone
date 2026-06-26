import type { ProblemDefinition } from '../../types/problem'

export const PROBLEM_4: ProblemDefinition = {
  problemId: 'problem-4',
  title: 'Dealt-Hand Contributions',
  concept: 'Sum each value × probability contribution.',
  difficulty: 4,
  scenarioText:
    'An 8-card hand is dealt: 10♠, J♥, Q♣, K♦ (value 10), 4♠, 4♥ (value 4), and 2♣, 2♦ (value 2). ' +
    'The value, count, and probability for each group are given. Fill the contribution (value × probability) for each, then the expected value of one random card drawn from the hand.',
  visualType: 'card-table',
  interactionType: 'fill-contributions',
  givenData: {
    handSize: 8,
    values: [2, 4, 10],
    counts: [2, 2, 4],
    probabilities: [1 / 4, 1 / 4, 1 / 2],
  },
  requiredActions: ['fill-contributions', 'submit-ev'],
  answerInputs: ['contributions', 'ev'],
  correctAnswers: { contributions: [0.5, 1.0, 5.0], ev: 6.5 },
  acceptedFormats: { contributions: ['0.5', '1/2', '$1.00', '10/2'], ev: ['6.5', '6.50', '$6.50', '13/2'] },
  mistakeRules: [
    { mistakeType: 'forgot-to-weight', feedback: 'A contribution is value × probability, not the raw card value. Value 10 contributes 10 × 1/2 = 5, not 10.' },
    { mistakeType: 'unweighted-sum', feedback: 'You added the raw card values (2 + 4 + 10 = 16). Weight by probability first: 0.5 + 1.0 + 5.0 = 6.5 expected value per card.' },
    { mistakeType: 'arithmetic-error', feedback: 'Check each row: contribution = value × probability, then add them up.' },
  ],
  feedback: { correct: 'Correct! 2×1/4 = 0.5, 4×1/4 = 1.0, 10×1/2 = 5.0, so EV per card = 6.5.' },
  teachingExplanation: {
    title: 'Why this makes sense',
    body: [
      'Group the hand by card value. Each value group contributes value × probability to the average draw — the contribution column — and the expected value of one random card drawn from the hand is the sum of those contributions.',
      'The four 10-value cards make up half the hand (1/2), so they contribute 10 × 1/2 = 5.0. The two 4s contribute 4 × 1/4 = 1.0, and the two 2s contribute 2 × 1/4 = 0.5. Together: 0.5 + 1.0 + 5.0 = 6.5 expected value per card.',
    ],
    takeaway: 'EV = sum of (value × probability) across every value group.',
  },
  hints: [
    { id: 'p4-h1', label: 'Weight each value', content: "Contribution = value × probability. For each row, multiply the card value by that row's probability." },
    { id: 'p4-h2', label: 'Add contributions', content: 'Expected value per card is the sum of the three contribution cells you filled in.' },
  ],
  completionRule: 'Fill all three contributions and submit the final expected value per card.',
  masteryTags: ['ev-from-table'],
  canonicalSlug: 'ev-l3-p2',
}
