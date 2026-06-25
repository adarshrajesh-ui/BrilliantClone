import type { PackProblemDefinition } from '../types'
import { problemPackBDemoConfigs } from '../demoConfigs'

// Problem 20 — Lesson 5, Problem 4 (capstone).
export const L5_FINAL_CAPSTONE_EV_DECISION: PackProblemDefinition = {
  problemId: 'l5-final-capstone-ev-decision',
  canonicalSlug: 'l5-final-capstone-ev-decision',
  storageId: 'l5-final-capstone-ev-decision',
  lessonId: 'lesson-5',
  lessonIndex: 4,
  problemIndexWithinLesson: 3,
  globalProblemIndex: 19,
  title: 'Final Capstone EV Decision',
  concept: 'Build a complete EV model and use payout, cost, fairness, and risk together.',
  difficulty: 9,
  scenarioText:
    'A carnival wheel has 12 equal sections: 1 pays $36, 3 pay $12, 8 pay $0. It costs $6 to play. Build the full model, decide, and interpret the risk.',
  visualType: 'wheel-table',
  interactionType: 'full-ev-model',
  givenData: {
    sections: 12,
    outcomes: [{ value: 36, count: 1 }, { value: 12, count: 3 }, { value: 0, count: 8 }],
    cost: 6,
  },
  requiredActions: ['fill-table', 'expected-payout', 'expected-profit', 'decision', 'explain-risk'],
  answerInputs: ['probabilities', 'contributions', 'expectedPayout', 'expectedProfit', 'decision', 'riskExplanation'],
  correctAnswers: {
    probabilities: [1 / 12, 3 / 12, 8 / 12],
    contributions: [3, 3, 0],
    expectedPayout: 6,
    expectedProfit: 0,
    decision: 'fair',
    riskExplanation: 'fair-but-variable',
  },
  acceptedFormats: {
    probability36: ['1/12', '0.0833', '0.083', '8.33%'],
    probability12: ['3/12', '1/4', '0.25', '25%'],
    probability0: ['8/12', '2/3', '0.6667', '0.667', '66.67%'],
    contribution36: ['3', '3.0', '$3', '9/3'],
    contribution12: ['3', '3.0', '$3', '12/4'],
    contribution0: ['0', '0.0', '$0', '0/8'],
    expectedPayout: ['6', '6.0', '$6', '12/2'],
    expectedProfit: ['0', '0.0', '$0', '0/6'],
    decision: ['fair'],
    riskExplanation: ['variable-outcomes', 'fair-but-variable', 'not-guaranteed'],
  },
  mistakeRules: [
    { mistakeType: 'wrong-denominator', feedback: 'The wheel has 12 sections, so divide each count by 12.' },
    { mistakeType: 'count-not-probability', feedback: 'You used the number of sections as the probability. Divide by 12.' },
    { mistakeType: 'arithmetic-error', feedback: 'Contribution = outcome × probability. Recheck each row.' },
    { mistakeType: 'payout-not-profit', feedback: 'Expected profit = expected payout − cost. Subtract the $6 cost.' },
    { mistakeType: 'fair-marked-favorable', feedback: 'Expected profit is $0, so the game is fair, not favorable.' },
    { mistakeType: 'fair-means-no-risk', feedback: 'A fair game still has risk: one play can pay $0, $12, or $36.' },
    { mistakeType: 'average-not-guaranteed', feedback: 'Fairness is the long-run average; a single play is not guaranteed to return the cost.' },
  ],
  feedback: {
    correct: 'Correct! Expected payout $6 = cost $6 → fair, but individual plays still vary ($0, $12, or $36).',
  },
  hints: [
    { id: 'p20-h1', label: 'Sections ÷ 12', content: 'Probability = (sections with that payout) / 12.' },
    { id: 'p20-h2', label: 'Contribution', content: 'For $36: 36 × 1/12 = 3. For $12: 12 × 3/12 = 3.' },
    { id: 'p20-h3', label: 'Profit', content: 'Expected profit = $6 payout − $6 cost = $0 → fair.' },
    { id: 'p20-h4', label: 'Risk', content: 'Fair is about the average — a single spin can still be $0, $12, or $36.' },
  ],
  completionRule:
    'Complete the full table, expected payout $6, expected profit $0, decision fair, and a non-contradictory risk explanation.',
  masteryTags: ['full-ev-model', 'payout-vs-profit', 'fairness-vs-risk', 'capstone'],
  demoConfig: problemPackBDemoConfigs['l5-final-capstone-ev-decision'],
  currentTaskConfig: {
    intro: 'A 12-section wheel, a full EV table, payout/cost/profit fields, a fairness number line, and a risk explanation.',
    firstStep: 'Group the 12 sections by payout and fill the $36 probability (1/12).',
    checklist: [
      { id: 'probs', label: 'Fill the three probabilities (÷12)' },
      { id: 'contribs', label: 'Fill the three contributions' },
      { id: 'payout', label: 'Compute expected payout' },
      { id: 'profit', label: 'Compute expected profit' },
      { id: 'decision', label: 'Make the fairness decision' },
      { id: 'risk', label: 'Explain why a fair game still has risk' },
    ],
  },
  animations: [
    { id: 'group-sections', describe: 'Tapping groups the 12 sections by payout with shared colors.', reducedMotion: 'Groups colored immediately.' },
    { id: 'contributions-sum', describe: 'Contributions (3 + 3 + 0) slide together into the $6 payout.', reducedMotion: 'Payout total shown immediately.' },
    { id: 'fair-but-variable', describe: 'The number line settles at zero while sample outcomes ($0/$12/$36) still flash.', reducedMotion: 'Zero marker and possible outcomes shown statically.' },
  ],
  checkerKey: 'l5-final-capstone-ev-decision',
}
