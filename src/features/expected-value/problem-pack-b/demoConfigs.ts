// Pre-problem mini-demo configurations for Problem Pack B (Problems 11–20).
// Each demo is hand-built and deterministic. The demo never counts as an
// attempt, sets a hint, or completes a required action (enforced by the shell).

import type { DemoConfig, PackCanonicalSlug } from './types'

const repairDemo: DemoConfig = {
  canonicalSlug: 'l3-repair-probability-table',
  kind: 'recap',
  steps: [
    { id: 's1', title: 'Count the tickets', body: 'There are 8 tickets in total on the shelf.', highlight: 'tickets' },
    { id: 's2', title: 'One denominator', body: 'Every probability uses the same total — 8 — as its denominator.', highlight: 'denominator' },
    { id: 's3', title: 'Probability-sum meter', body: 'The meter fills toward 1 as your probabilities become consistent.', highlight: 'sum-meter' },
    { id: 's4', title: 'Fix one cell', body: 'Pick a highlighted row and rewrite its probability as (matching tickets)/8.', highlight: 'editable-cell' },
  ],
  closingPrompt: 'Repair each probability so all three use a denominator of 8 and sum to 1.',
}

const prizeBagDemo: DemoConfig = {
  canonicalSlug: 'l3-prize-bag-ev-table',
  kind: 'recap',
  steps: [
    { id: 's1', title: 'Group the tokens', body: 'The bag has 10 tokens. Matching payouts share a color.', highlight: 'tokens' },
    { id: 's2', title: 'Count → probability', body: 'Convert each count to a probability by dividing by 10 total tokens.', highlight: 'probability-column' },
    { id: 's3', title: 'Contribution cell', body: 'A contribution is payout × probability for that row.', highlight: 'contribution-column' },
    { id: 's4', title: 'Add it up', body: 'The expected value is the sum of all the contributions.', highlight: 'ev-field' },
  ],
  closingPrompt: 'Complete every count, probability, and contribution, then add them for the EV.',
}

const payoutVsProfitDemo: DemoConfig = {
  canonicalSlug: 'l4-payout-vs-profit',
  kind: 'full',
  steps: [
    { id: 's1', title: 'Expected payout', body: 'The game pays $4 on average before any cost.', highlight: 'payout-block' },
    { id: 's2', title: 'The cost block', body: 'It costs $3 to play — that is money leaving your pocket.', highlight: 'cost-block' },
    { id: 's3', title: 'Cost pulls down', body: 'Dropping the cost into the equation moves the result downward.', highlight: 'balance' },
    { id: 's4', title: 'The formula', body: 'Expected profit = expected payout − cost.', highlight: 'equation' },
  ],
  closingPrompt: 'Tap the cost into the equation and enter the expected profit.',
}

const fairnessSortDemo: DemoConfig = {
  canonicalSlug: 'l4-fair-favorable-unfavorable',
  kind: 'full',
  steps: [
    { id: 's1', title: 'Profit = payout − cost', body: 'For each game, subtract the cost from the expected payout.', highlight: 'profit-meter' },
    { id: 's2', title: 'The number line', body: 'Negative, zero, and positive split the line into three regions.', highlight: 'number-line' },
    { id: 's3', title: 'Map to buckets', body: 'Negative → unfavorable, zero → fair, positive → favorable.', highlight: 'buckets' },
    { id: 's4', title: 'Tap to place', body: 'Tap a game card, then tap a bucket. Tap again to move it.', highlight: 'cards' },
  ],
  closingPrompt: 'Sort all three games using expected profit, not payout alone.',
}

const findFairPriceDemo: DemoConfig = {
  canonicalSlug: 'l4-find-fair-price',
  kind: 'full',
  steps: [
    { id: 's1', title: 'Expected payout', body: 'The 50/50 spinner pays 8 × 0.5 + 0 × 0.5 = $4 on average.', highlight: 'payout-meter' },
    { id: 's2', title: 'The cost control', body: 'Adjust the entry cost to change the expected profit.', highlight: 'cost-control' },
    { id: 's3', title: 'Balance', body: 'A fair game happens when payout and cost balance exactly.', highlight: 'balance' },
    { id: 's4', title: 'Aim for zero', body: 'Fair means the expected-profit marker sits on zero.', highlight: 'number-line' },
  ],
  closingPrompt: 'Find the cost that makes expected profit zero, then classify the game.',
}

const chooseBetterGameDemo: DemoConfig = {
  canonicalSlug: 'l4-choose-better-game-after-cost',
  kind: 'recap',
  steps: [
    { id: 's1', title: 'Payout and cost', body: 'Each card shows an expected payout bar and a cost bar.', highlight: 'cards' },
    { id: 's2', title: 'Subtract', body: 'Expected profit = payout − cost for each game.', highlight: 'profit-field' },
    { id: 's3', title: 'Profit meter', body: 'The meter shows what is left after paying to play.', highlight: 'profit-meter' },
    { id: 's4', title: 'Bigger payout ≠ better', body: 'The larger payout is not always the better game once cost is included.', highlight: 'selector' },
  ],
  closingPrompt: 'Compute both profits, then choose the game with the higher expected profit.',
}

const wholeModelDemo: DemoConfig = {
  canonicalSlug: 'l5-build-whole-ev-model',
  kind: 'full',
  steps: [
    { id: 's1', title: 'Group sections', body: 'Tap the 10 wheel sections to group them by payout.', highlight: 'wheel' },
    { id: 's2', title: 'Sections / 10', body: 'Each probability is (sections with that payout) / 10.', highlight: 'probability-column' },
    { id: 's3', title: 'Contribution', body: 'Each contribution is outcome × probability.', highlight: 'contribution-column' },
    { id: 's4', title: 'Payout − cost', body: 'Expected profit = expected payout − cost.', highlight: 'profit-field' },
    { id: 's5', title: 'Decide', body: 'Map the expected profit to fair / favorable / unfavorable.', highlight: 'decision' },
  ],
  closingPrompt: 'Build the full model: probabilities, contributions, payout, profit, and decision.',
}

const sameEvRiskDemo: DemoConfig = {
  canonicalSlug: 'l5-same-ev-different-risk',
  kind: 'full',
  steps: [
    { id: 's1', title: 'Game A is flat', body: 'Game A always pays $5 — its outcome line is flat.', highlight: 'game-a' },
    { id: 's2', title: 'Game B jumps', body: 'Game B lands on $10 or $0 — its outcome line jumps.', highlight: 'game-b' },
    { id: 's3', title: 'Same average', body: 'Both running averages drift toward $5.', highlight: 'running-average' },
    { id: 's4', title: 'Risk = spread', body: 'Risk is the spread of outcomes, not the average.', highlight: 'risk-selector' },
  ],
  closingPrompt: 'Run both simulations, confirm both EVs are $5, then identify the riskier game and why.',
}

const lowVsHighRiskDemo: DemoConfig = {
  canonicalSlug: 'l5-low-risk-vs-high-risk',
  kind: 'recap',
  steps: [
    { id: 's1', title: 'Guaranteed $6', body: 'Game A pays exactly $6 every time.', highlight: 'game-a' },
    { id: 's2', title: 'Split $12 / $0', body: 'Game B pays $12 half the time and $0 half the time.', highlight: 'game-b' },
    { id: 's3', title: 'Same weighted average', body: 'Both average $6 over many plays.', highlight: 'running-average' },
    { id: 's4', title: 'Compare the spread', body: 'Game B has a wider range of outcomes ($0 to $12).', highlight: 'outcome-graph' },
  ],
  closingPrompt: 'Run both simulations, confirm both EVs are $6, then pick the riskier game and explain the spread.',
}

const capstoneDemo: DemoConfig = {
  canonicalSlug: 'l5-final-capstone-ev-decision',
  kind: 'full',
  steps: [
    { id: 's1', title: 'Group 12 sections', body: 'Tap to group the 12 wheel sections by payout.', highlight: 'wheel' },
    { id: 's2', title: 'Sections / 12', body: 'Convert each count to a probability over 12 total sections.', highlight: 'probability-column' },
    { id: 's3', title: 'Contributions', body: 'Multiply each payout by its probability.', highlight: 'contribution-column' },
    { id: 's4', title: 'Payout then profit', body: 'Add contributions for payout, then subtract the $6 cost.', highlight: 'profit-field' },
    { id: 's5', title: 'Fair but variable', body: 'A fair game can still pay $0, $12, or $36 on a single play.', highlight: 'risk-explanation' },
  ],
  closingPrompt: 'Build the full model and explain why a fair game still carries risk on any single play.',
}

export const problemPackBDemoConfigs: Record<PackCanonicalSlug, DemoConfig> = {
  'l3-repair-probability-table': repairDemo,
  'l3-prize-bag-ev-table': prizeBagDemo,
  'l4-payout-vs-profit': payoutVsProfitDemo,
  'l4-fair-favorable-unfavorable': fairnessSortDemo,
  'l4-find-fair-price': findFairPriceDemo,
  'l4-choose-better-game-after-cost': chooseBetterGameDemo,
  'l5-build-whole-ev-model': wholeModelDemo,
  'l5-same-ev-different-risk': sameEvRiskDemo,
  'l5-low-risk-vs-high-risk': lowVsHighRiskDemo,
  'l5-final-capstone-ev-decision': capstoneDemo,
}
