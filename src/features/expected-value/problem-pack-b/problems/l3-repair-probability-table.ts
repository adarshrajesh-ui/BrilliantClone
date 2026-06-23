import type { PackProblemDefinition } from '../types'
import { problemPackBDemoConfigs } from '../demoConfigs'

// Problem 11 — Lesson 3, Problem 3.
export const L3_REPAIR_PROBABILITY_TABLE: PackProblemDefinition = {
  problemId: 'l3-repair-probability-table',
  canonicalSlug: 'l3-repair-probability-table',
  storageId: 'l3-repair-probability-table',
  lessonId: 'lesson-3',
  lessonIndex: 2,
  problemIndexWithinLesson: 2,
  globalProblemIndex: 10,
  title: 'Repair the Probability Table',
  concept: 'Probabilities must match counts and account for the entire sample space.',
  difficulty: 5,
  scenarioText:
    'A prize shelf has 8 tickets: 1 pays $16, 3 pay $4, 4 pay $0. The displayed table has errors — repair the probabilities so each uses the correct total and they sum to 1.',
  visualType: 'probability-table',
  interactionType: 'repair-table',
  givenData: {
    totalTickets: 8,
    rows: [
      { outcome: 16, count: 1, shippedProbability: '1/8', isCorrect: true },
      { outcome: 4, count: 3, shippedProbability: '3/10', isCorrect: false },
      { outcome: 0, count: 4, shippedProbability: '', isCorrect: false },
    ],
    showsProbabilitySumMeter: true,
  },
  requiredActions: ['repair-all-cells', 'reach-sum-of-one'],
  answerInputs: ['rows'],
  correctAnswers: {
    rows: [
      { outcome: 16, probability: '1/8' },
      { outcome: 4, probability: '3/8' },
      { outcome: 0, probability: '4/8' },
    ],
  },
  acceptedFormats: {
    '16': ['1/8', '0.125'],
    '4': ['3/8', '0.375'],
    '0': ['4/8', '1/2', '0.5', '.5'],
  },
  mistakeRules: [
    { mistakeType: 'wrong-denominator', feedback: 'There are 8 tickets total, so every probability uses 8 as its denominator (e.g. 3/8, not 3/10).' },
    { mistakeType: 'count-as-probability', feedback: 'You copied a ticket count into the probability cell. Divide the count by 8.' },
    { mistakeType: 'ignored-zero-outcome', feedback: 'The $0 tickets still count: 4 of 8 → 4/8 (1/2).' },
    { mistakeType: 'probabilities-not-one', feedback: 'The probabilities must sum to 1: 1/8 + 3/8 + 4/8 = 1.' },
  ],
  feedback: {
    correct: 'Correct! $16 → 1/8, $4 → 3/8, $0 → 4/8 (1/2), and they sum to 1.',
  },
  hints: [
    { id: 'p11-h1', label: 'Same denominator', content: 'Point at the 8 tickets — every probability compares its group with 8.' },
    { id: 'p11-h2', label: 'Structure', content: 'Each cell should read (matching tickets)/8.' },
    { id: 'p11-h3', label: 'Near-complete', content: '$16 = 1/8, $4 = 3/8, and the $0 row is the rest: 4/8.' },
  ],
  completionRule: 'All probability cells correct (denominator 8) and the probabilities sum to 1.',
  masteryTags: ['counts-to-probability', 'sample-space'],
  demoConfig: problemPackBDemoConfigs['l3-repair-probability-table'],
  currentTaskConfig: {
    intro: 'A probability table with errors — the $4 row uses the wrong total and the $0 row is blank.',
    firstStep: 'Rewrite the $4 row probability using 8 as the denominator.',
    checklist: [
      { id: 'fix-16', label: 'Confirm/repair the $16 row' },
      { id: 'fix-4', label: 'Repair the $4 row (use /8)' },
      { id: 'fix-0', label: 'Fill the blank $0 row' },
      { id: 'sum', label: 'Probabilities sum to 1' },
    ],
  },
  animations: [
    { id: 'sum-meter', describe: 'The probability-sum meter fills toward 1 as cells become consistent.', reducedMotion: 'Meter shows the exact total immediately.' },
    { id: 'row-link', describe: 'An edited row briefly highlights its matching ticket group.', reducedMotion: 'Matching tickets are outlined without motion.' },
  ],
  checkerKey: 'l3-repair-probability-table',
}
