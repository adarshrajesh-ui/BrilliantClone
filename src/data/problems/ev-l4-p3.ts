import type { ProblemDefinition } from '../../types/problem'

/**
 * ev-l4-p3 — Choose the Better Game After Cost (Independent Fluency Check).
 * Storage ID === canonical slug (new problem). problemId MUST equal storage id.
 */
export const EV_L4_P3: ProblemDefinition = {
  problemId: 'ev-l4-p3',
  title: 'Choose the Better Game After Cost',
  concept: 'The better game is decided by expected profit, not expected payout alone.',
  difficulty: 6,
  scenarioText:
    'Game A has expected payout $9 and costs $7. Game B has expected payout $6 and costs $3. Work out each expected profit, then choose the better game for the player.',
  visualType: 'game-cards',
  interactionType: 'profit-and-select',
  givenData: {
    games: [
      { id: 'A', payout: 9, cost: 7 },
      { id: 'B', payout: 6, cost: 3 },
    ],
  },
  requiredActions: ['compute-profits', 'select-better-game'],
  answerInputs: ['profitA', 'profitB', 'choice'],
  correctAnswers: { profitA: 2, profitB: 3, choice: 'B' },
  acceptedFormats: {
    profit: ['2', '2.0', '$2', '4/2', '3', '3.0', '$3', '9/3'],
    choice: ['Game B', 'B', 'b'],
  },
  mistakeRules: [
    { mistakeType: 'chose-larger-payout', feedback: 'Game A has the larger payout, but after subtracting cost Game B keeps more. Compare profit, not payout.' },
    { mistakeType: 'forgot-subtract-cost', feedback: 'Expected profit = payout − cost. Subtract the cost before comparing.' },
    { mistakeType: 'added-cost', feedback: 'Cost reduces profit. Use payout − cost, not payout + cost.' },
    { mistakeType: 'reversed-payout-cost', feedback: 'You computed cost − payout. Expected profit is payout − cost.' },
  ],
  feedback: { correct: 'Correct! Game A keeps $2, Game B keeps $3, so Game B is the better game.' },
  teachingExplanation: {
    title: 'Bigger payout, smaller profit',
    body: [
      'Game A pays more on average ($9 vs $6), which makes it look like the obvious pick. But the better game is the one that leaves you with more after paying to play.',
      'Game A: $9 − $7 = $2 profit. Game B: $6 − $3 = $3 profit. Even though Game B has the smaller payout, it costs much less, so it returns more profit per play. Compare the profit, not the payout.',
    ],
    takeaway: 'Choose by expected profit (payout − cost), not by the largest payout.',
  },
  hints: [
    { id: 'evl4p3-h1', label: 'Subtract cost', content: 'Expected profit = expected payout − cost for each game.' },
    { id: 'evl4p3-h2', label: 'Game A', content: 'Game A: 9 − 7 = 2.' },
    { id: 'evl4p3-h3', label: 'Compare profit', content: 'Game B profit is 6 − 3 = 3, which is more than Game A\u2019s 2.' },
  ],
  completionRule: 'Enter both expected profits and select the game with the larger profit (Game B).',
  masteryTags: ['payout-vs-profit', 'compare-expected-profit'],
}
