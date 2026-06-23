import type { PackProblemDefinition } from '../types'
import { problemPackBDemoConfigs } from '../demoConfigs'

// Problem 16 — Lesson 4, Problem 4.
export const L4_CHOOSE_BETTER_GAME_AFTER_COST: PackProblemDefinition = {
  problemId: 'l4-choose-better-game-after-cost',
  canonicalSlug: 'l4-choose-better-game-after-cost',
  storageId: 'l4-choose-better-game-after-cost',
  lessonId: 'lesson-4',
  lessonIndex: 3,
  problemIndexWithinLesson: 3,
  globalProblemIndex: 15,
  title: 'Choose the Better Game After Cost',
  concept: 'The better game is determined by expected profit, not expected payout alone.',
  difficulty: 6,
  scenarioText:
    'Game A: expected payout $9, cost $7. Game B: expected payout $6, cost $3. Which game is better for the player?',
  visualType: 'classification',
  interactionType: 'compute-and-choose',
  givenData: {
    games: [
      { id: 'A', payout: 9, cost: 7, profit: 2 },
      { id: 'B', payout: 6, cost: 3, profit: 3 },
    ],
  },
  requiredActions: ['profit-a', 'profit-b', 'choose-better'],
  answerInputs: ['profitA', 'profitB', 'betterGame'],
  correctAnswers: { profitA: 2, profitB: 3, betterGame: 'B' },
  acceptedFormats: {
    profitA: ['2', '2.0', '$2'],
    profitB: ['3', '3.0', '$3'],
    betterGame: ['B', 'Game B', 'game-b'],
  },
  mistakeRules: [
    { mistakeType: 'largest-payout-misconception', feedback: 'Game A has the larger payout but a much higher cost. Compare profit, not payout.' },
    { mistakeType: 'forgot-subtract-cost', feedback: 'Profit = payout − cost. Do not leave the payout as the profit.' },
    { mistakeType: 'added-cost', feedback: 'Subtract the cost, do not add it.' },
  ],
  feedback: {
    correct: 'Correct! Game A profit $2 vs Game B profit $3 — Game B is the better game after cost.',
  },
  hints: [
    { id: 'p16-h1', label: 'Read the bars', content: 'Each card shows a payout bar and a cost bar.' },
    { id: 'p16-h2', label: 'Subtract', content: 'Game A: 9 − 7. Game B: 6 − 3.' },
    { id: 'p16-h3', label: 'Compare', content: 'A leaves $2, B leaves $3 — pick the larger profit.' },
  ],
  completionRule: 'Profit A = $2, Profit B = $3, better game = B.',
  masteryTags: ['payout-vs-profit', 'compare-after-cost'],
  demoConfig: problemPackBDemoConfigs['l4-choose-better-game-after-cost'],
  currentTaskConfig: {
    intro: 'Two game cards with payout bars, cost bars, and profit fields.',
    firstStep: 'Compute Game A\u2019s expected profit (payout − cost).',
    checklist: [
      { id: 'profit-a', label: 'Compute Game A profit' },
      { id: 'profit-b', label: 'Compute Game B profit' },
      { id: 'choose', label: 'Choose the better game' },
    ],
  },
  animations: [
    { id: 'cost-shrinks-bar', describe: 'Each payout bar shrinks by its cost to reveal the profit meter.', reducedMotion: 'Profit meters shown at final height immediately.' },
    { id: 'highlight-winner', describe: 'The higher-profit game\u2019s meter is emphasized on a correct choice.', reducedMotion: 'Winning game highlighted in place.' },
  ],
  checkerKey: 'l4-choose-better-game-after-cost',
}
