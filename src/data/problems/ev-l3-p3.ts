import type { ProblemDefinition } from '../../types/problem'

/**
 * ev-l3-p3 — Mini-Deck EV Table (Independent Fluency Check).
 * Storage ID === canonical slug. problemId MUST equal the storage id used by
 * progression/persistence.
 */
export const EV_L3_P3: ProblemDefinition = {
  problemId: 'ev-l3-p3',
  title: 'Mini-Deck EV Table',
  concept: 'Build a complete expected value table from card counts.',
  difficulty: 4,
  scenarioText:
    'A 10-card mini deck is dealt: three Aces (value 1), three 7s (value 7), and 10·J·Q·K (value 10 each). Build the full table — count, probability, and contribution for each value — then find the expected value of one draw.',
  visualType: 'card-table',
  interactionType: 'fill-full-table',
  givenData: {
    deck: [1, 1, 1, 7, 7, 7, 10, 10, 10, 10],
    total: 10,
    values: [1, 7, 10],
  },
  requiredActions: ['fill-table', 'submit-ev'],
  answerInputs: ['counts', 'probabilities', 'contributions', 'ev'],
  correctAnswers: {
    rows: [
      { value: 1, count: 3, probability: 3 / 10, contribution: 0.3 },
      { value: 7, count: 3, probability: 3 / 10, contribution: 2.1 },
      { value: 10, count: 4, probability: 4 / 10, contribution: 4.0 },
    ],
    ev: 6.4,
  },
  acceptedFormats: {
    probability: ['3/10', '0.3', '30%', '4/10', '2/5', '0.4', '40%'],
    contribution: ['0.3', '3/10', '2.1', '21/10', '4', '4.0', '4/1'],
    ev: ['6.4', '6.40', '$6.40', '32/5'],
  },
  mistakeRules: [
    { mistakeType: 'count-probability-confusion', feedback: 'You used a raw count where a probability belongs. Probability = count ÷ 10 total cards.' },
    { mistakeType: 'wrong-denominator', feedback: 'Divide each count by 10 — the total number of cards in the mini deck.' },
    { mistakeType: 'arithmetic-error', feedback: 'Contribution = value × probability. Recheck each row, then add them.' },
    { mistakeType: 'omitted-row', feedback: 'Every value row contributes to the EV — don\u2019t drop a paying row from the sum.' },
    { mistakeType: 'used-total-card-value', feedback: 'Add the contributions, not the raw card values. EV is per draw, not the whole deck (64).' },
  ],
  feedback: { correct: 'Correct! 1×3/10=0.3, 7×3/10=2.1, 10×4/10=4.0, so EV = 6.4.' },
  teachingExplanation: {
    title: 'Reading a deck as a table',
    body: [
      'Every expected-value table starts from counts. Group the 10 cards by value (three 1s, three 7s, and four 10s — J, Q, and K all count as 10), divide each count by 10 to get a probability, then multiply value × probability for each row\u2019s contribution.',
      'The Aces contribute 1 × 3/10 = 0.3, the 7s contribute 7 × 3/10 = 2.1, and the 10-value cards contribute 10 × 4/10 = 4.0. Adding the contributions gives 0.3 + 2.1 + 4.0 = 6.4 — the expected value of one draw.',
    ],
    takeaway: 'EV = sum of (value × probability), and probability = count ÷ total cards.',
  },
  hints: [
    { id: 'evl3p3-h1', label: 'Count then divide', content: 'There are 10 cards. Probability = (cards with that value) ÷ 10.' },
    { id: 'evl3p3-h2', label: 'Each contribution', content: 'Contribution = value × probability, e.g. 7 × 3/10 = 2.1.' },
    { id: 'evl3p3-h3', label: 'Add the rows', content: 'EV = 0.3 + 2.1 + 4.0 = 6.4.' },
  ],
  completionRule: 'Fill every count, probability, and contribution cell correctly, then submit EV = 6.4.',
  masteryTags: ['ev-from-table', 'probability-from-counts'],
  canonicalSlug: 'ev-l3-p3',
}
