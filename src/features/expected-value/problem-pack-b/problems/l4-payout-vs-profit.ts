import type { PackProblemDefinition } from '../types'
import { problemPackBDemoConfigs } from '../demoConfigs'

// Problem 13 — Lesson 4, Problem 1. ORIGINAL — storage ID preserved as problem-5.
export const L4_PAYOUT_VS_PROFIT: PackProblemDefinition = {
  problemId: 'problem-5',
  canonicalSlug: 'l4-payout-vs-profit',
  storageId: 'problem-5',
  legacyProblemId: 'problem-5',
  lessonId: 'lesson-4',
  lessonIndex: 3,
  problemIndexWithinLesson: 0,
  globalProblemIndex: 12,
  title: 'Expected Payout vs Expected Profit',
  concept: 'Expected payout and expected profit differ when there is a cost to play.',
  difficulty: 5,
  scenarioText:
    'The mystery box game has expected payout $4 and costs $3 to enter. Find the expected profit.',
  visualType: 'balance-scale',
  interactionType: 'tap-equation',
  givenData: { expectedPayout: 4, cost: 3 },
  requiredActions: ['place-cost', 'submit-profit'],
  answerInputs: ['profit'],
  correctAnswers: { profit: 1 },
  acceptedFormats: { profit: ['1', '1.0', '1.00', '$1', '$1.00', '1/1', '2/2'] },
  mistakeRules: [
    { mistakeType: 'answered-payout', feedback: 'That is the expected payout ($4), not the expected profit. Subtract the $3 cost.' },
    { mistakeType: 'added-cost', feedback: 'Cost lowers the value of the game, so it is subtracted: payout − cost, not payout + cost.' },
    { mistakeType: 'reversed-subtraction', feedback: 'You computed cost − payout (−$1). Start from the payout: $4 − $3 = $1.' },
  ],
  feedback: { correct: 'Correct! Expected profit = $4 payout − $3 cost = $1.' },
  hints: [
    { id: 'p13-h1', label: 'Tap the cost', content: 'Place the $3 cost block into the equation to see profit.' },
    { id: 'p13-h2', label: 'Subtract', content: 'Expected profit = expected payout − cost = 4 − 3.' },
    { id: 'p13-h3', label: 'Almost there', content: 'Start at $4 and remove the $3 cost — that leaves $1.' },
  ],
  completionRule: 'Build payout − cost and submit expected profit of $1.',
  masteryTags: ['payout-vs-profit'],
  demoConfig: problemPackBDemoConfigs['l4-payout-vs-profit'],
  currentTaskConfig: {
    intro: 'A balance/equation showing an expected payout of $4 and a $3 cost block.',
    firstStep: 'Tap the $3 cost block to drop it into the equation.',
    checklist: [
      { id: 'place-cost', label: 'Place the cost into the equation' },
      { id: 'profit', label: 'Enter the expected profit' },
    ],
  },
  animations: [
    { id: 'cost-pulls-down', describe: 'The cost block pulls the result from $4 down toward $1.', reducedMotion: 'Result jumps to $1 without motion.' },
    { id: 'wrong-direction', describe: 'Adding the cost incorrectly nudges the indicator the wrong way.', reducedMotion: 'Incorrect value shown immediately with an error highlight.' },
    { id: 'settle-on-one', describe: 'Correct completion emphasizes the remaining $1 on the scale.', reducedMotion: '$1 result highlighted in place.' },
  ],
  checkerKey: 'l4-payout-vs-profit',
}
