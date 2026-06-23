import type { PackProblemDefinition } from '../types'
import { problemPackBDemoConfigs } from '../demoConfigs'

// Problem 12 — Lesson 3, Problem 4.
export const L3_PRIZE_BAG_EV_TABLE: PackProblemDefinition = {
  problemId: 'l3-prize-bag-ev-table',
  canonicalSlug: 'l3-prize-bag-ev-table',
  storageId: 'l3-prize-bag-ev-table',
  lessonId: 'lesson-3',
  lessonIndex: 2,
  problemIndexWithinLesson: 3,
  globalProblemIndex: 11,
  title: 'Prize Bag EV Table',
  concept: 'Build a complete expected value table from physical counts.',
  difficulty: 5,
  scenarioText:
    'A bag has 10 tokens: 2 pay $15, 3 pay $5, 5 pay $0. Build the full table — count, probability, contribution — then find the expected value.',
  visualType: 'probability-table',
  interactionType: 'ev-table',
  givenData: {
    totalTokens: 10,
    outcomes: [
      { value: 15, count: 2 },
      { value: 5, count: 3 },
      { value: 0, count: 5 },
    ],
  },
  requiredActions: ['fill-counts', 'fill-probabilities', 'fill-contributions', 'submit-ev'],
  answerInputs: ['rows', 'evAnswer'],
  correctAnswers: {
    rows: [
      { outcome: 15, count: 2, probability: '2/10', contribution: 3 },
      { outcome: 5, count: 3, probability: '3/10', contribution: 1.5 },
      { outcome: 0, count: 5, probability: '5/10', contribution: 0 },
    ],
    ev: 4.5,
  },
  acceptedFormats: {
    probability15: ['2/10', '1/5', '0.2', '.2', '20%'],
    probability5: ['3/10', '0.3', '.3', '30%'],
    probability0: ['5/10', '1/2', '0.5', '.5', '50%'],
    contribution15: ['3', '3.0', '$3'],
    contribution5: ['1.5', '1.50', '$1.50', '$1.5'],
    contribution0: ['0', '0.0', '$0'],
    ev: ['4.5', '4.50', '$4.50', '$4.5'],
  },
  mistakeRules: [
    { mistakeType: 'count-not-probability', feedback: 'You used a token count as a probability. Divide by 10 total tokens.' },
    { mistakeType: 'wrong-denominator', feedback: 'Every probability uses 10 as the denominator.' },
    { mistakeType: 'omitted-zero-outcome', feedback: 'The $0 row still belongs in the table — its contribution is 0 × 5/10 = $0.' },
    { mistakeType: 'unweighted-sum', feedback: 'EV adds the contributions (3 + 1.5 + 0), not the raw payouts (15 + 5 + 0).' },
    { mistakeType: 'arithmetic-error', feedback: 'Contribution = outcome × probability. Recheck each row.' },
  ],
  feedback: {
    correct: 'Correct! Contributions 3, 1.5, 0 → EV = $4.50.',
  },
  hints: [
    { id: 'p12-h1', label: 'Group tokens', content: 'Matching tokens share a color — count how many pay each amount.' },
    { id: 'p12-h2', label: 'Count / 10', content: 'Probability = count ÷ 10 total tokens.' },
    { id: 'p12-h3', label: 'Contribution', content: 'For $15: 15 × 2/10 = 3. Repeat, then add.' },
  ],
  completionRule: 'All counts, probabilities, and contributions correct, and EV = $4.50.',
  masteryTags: ['counts-to-probability', 'ev-from-table'],
  demoConfig: problemPackBDemoConfigs['l3-prize-bag-ev-table'],
  currentTaskConfig: {
    intro: 'A blank EV table for a 10-token bag (Outcome | Count | Probability | Contribution).',
    firstStep: 'Count how many tokens pay $15 and enter it in the count cell.',
    checklist: [
      { id: 'counts', label: 'Fill all three counts' },
      { id: 'probs', label: 'Convert each count to a probability (÷10)' },
      { id: 'contribs', label: 'Compute each contribution (outcome × probability)' },
      { id: 'ev', label: 'Add contributions for the EV' },
    ],
  },
  animations: [
    { id: 'row-to-chunk', describe: 'Each completed row collapses into a colored contribution chunk.', reducedMotion: 'Chunks appear in place once a row is correct.' },
    { id: 'chunks-sum', describe: 'Contribution chunks slide together into the EV total.', reducedMotion: 'EV total updates immediately.' },
  ],
  checkerKey: 'l3-prize-bag-ev-table',
}
