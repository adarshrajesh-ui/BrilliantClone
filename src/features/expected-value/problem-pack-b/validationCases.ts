// Deterministic validation cases for Problem Pack B (Problems 11–20).
// Pure data describing what each checker MUST accept and reject, per the PRD.
// The pack test runner feeds these through problemPackBCheckers.

import type {
  CapstoneInput,
  ChooseBetterGameInput,
  FairnessSortInput,
  FindFairPriceInput,
  LowVsHighRiskInput,
  PayoutVsProfitInput,
  PackValidationCase,
  PrizeBagInput,
  RepairTableInput,
  SameEvDifferentRiskInput,
  WholeEvModelInput,
} from './types'

// --- input builders ---------------------------------------------------------

const repair = (p16: string, p4: string, p0: string): RepairTableInput => ({
  rows: [
    { outcome: 16, count: '1', probability: p16 },
    { outcome: 4, count: '3', probability: p4 },
    { outcome: 0, count: '4', probability: p0 },
  ],
})

const prizeBag = (
  r15: [string, string, string],
  r5: [string, string, string],
  r0: [string, string, string],
  ev: string,
): PrizeBagInput => ({
  rows: [
    { outcome: 15, count: r15[0], probability: r15[1], contribution: r15[2] },
    { outcome: 5, count: r5[0], probability: r5[1], contribution: r5[2] },
    { outcome: 0, count: r0[0], probability: r0[1], contribution: r0[2] },
  ],
  evAnswer: ev,
})

const wholeModel = (
  probs: [string, string, string],
  contribs: [string, string, string],
  payout: string,
  profit: string,
  decision: string,
): WholeEvModelInput => ({
  probabilities: probs,
  contributions: contribs,
  expectedPayout: payout,
  expectedProfit: profit,
  decision,
})

const capstone = (
  probs: [string, string, string],
  contribs: [string, string, string],
  payout: string,
  profit: string,
  decision: string,
  risk: string,
): CapstoneInput => ({
  probabilities: probs,
  contributions: contribs,
  expectedPayout: payout,
  expectedProfit: profit,
  decision,
  riskExplanation: risk,
})

// ===========================================================================
// 11 — l3-repair-probability-table
// ===========================================================================

const repairCases: PackValidationCase[] = [
  { id: 'p11-correct-fractions', canonicalSlug: 'l3-repair-probability-table', description: '1/8, 3/8, 4/8', input: repair('1/8', '3/8', '4/8'), expectedCorrect: true, prdReason: 'All probabilities use /8 and sum to 1.' },
  { id: 'p11-correct-decimals', canonicalSlug: 'l3-repair-probability-table', description: '0.125, 0.375, 0.5', input: repair('0.125', '0.375', '0.5'), expectedCorrect: true, prdReason: 'Decimal equivalents accepted.' },
  { id: 'p11-correct-half', canonicalSlug: 'l3-repair-probability-table', description: '$0 as 1/2 / .5', input: repair('1/8', '3/8', '1/2'), expectedCorrect: true, prdReason: '4/8, 1/2, 0.5, .5 all accepted for $0.' },
  { id: 'p11-wrong-denominator', canonicalSlug: 'l3-repair-probability-table', description: '$4 left as 3/10', input: repair('1/8', '3/10', '4/8'), expectedCorrect: false, expectedMistakeType: 'wrong-denominator', prdReason: 'Different denominator must be flagged.' },
  { id: 'p11-count-as-prob', canonicalSlug: 'l3-repair-probability-table', description: '$4 entered as 3', input: repair('1/8', '3', '4/8'), expectedCorrect: false, expectedMistakeType: 'count-as-probability', prdReason: 'Raw count copied into probability cell.' },
  { id: 'p11-ignored-zero', canonicalSlug: 'l3-repair-probability-table', description: '$0 set to 0', input: repair('1/8', '3/8', '0'), expectedCorrect: false, expectedMistakeType: 'ignored-zero-outcome', prdReason: 'Zero outcome must still be counted (4/8).' },
  { id: 'p11-guard-blank-zero', canonicalSlug: 'l3-repair-probability-table', description: '$0 row left blank', input: repair('1/8', '3/8', ''), expectedCorrect: false, expectedMistakeType: '', prdReason: 'Guard: blank cell is not a graded attempt.' },
  { id: 'p11-partial-persists', canonicalSlug: 'l3-repair-probability-table', description: 'partially correct (16 & 0 right, 4 wrong)', input: repair('1/8', '2/8', '4/8'), expectedCorrect: false, expectedMistakeType: 'wrong-denominator', prdReason: 'Partially correct table: only the wrong cell is reported.' },
]

// ===========================================================================
// 12 — l3-prize-bag-ev-table
// ===========================================================================

const prizeBagCases: PackValidationCase[] = [
  { id: 'p12-correct-decimals', canonicalSlug: 'l3-prize-bag-ev-table', description: 'probs 0.2/0.3/0.5, contribs 3/1.5/0, EV 4.5', input: prizeBag(['2', '0.2', '3'], ['3', '0.3', '1.5'], ['5', '0.5', '0'], '4.5'), expectedCorrect: true, prdReason: 'Standard correct table.' },
  { id: 'p12-correct-fractions', canonicalSlug: 'l3-prize-bag-ev-table', description: 'fractions + $ EV', input: prizeBag(['2', '2/10', '$3'], ['3', '3/10', '$1.50'], ['5', '5/10', '$0'], '$4.50'), expectedCorrect: true, prdReason: 'Equivalent fractions/decimals + money formatting.' },
  { id: 'p12-reduced-fractions', canonicalSlug: 'l3-prize-bag-ev-table', description: 'reduced fractions 1/5, 1/2', input: prizeBag(['2', '1/5', '3'], ['3', '0.3', '1.5'], ['5', '1/2', '0'], '4.5'), expectedCorrect: true, prdReason: 'Reduced fractions accepted.' },
  { id: 'p12-count-not-prob', canonicalSlug: 'l3-prize-bag-ev-table', description: 'count used as probability', input: prizeBag(['2', '2', '3'], ['3', '0.3', '1.5'], ['5', '0.5', '0'], '4.5'), expectedCorrect: false, expectedMistakeType: 'count-not-probability', prdReason: 'Count/probability confusion.' },
  { id: 'p12-wrong-denominator', canonicalSlug: 'l3-prize-bag-ev-table', description: 'wrong denominator 2/8', input: prizeBag(['2', '2/8', '3'], ['3', '0.3', '1.5'], ['5', '0.5', '0'], '4.5'), expectedCorrect: false, expectedMistakeType: 'wrong-denominator', prdReason: 'Denominator must be 10.' },
  { id: 'p12-omitted-zero', canonicalSlug: 'l3-prize-bag-ev-table', description: '$0 contribution nonzero', input: prizeBag(['2', '0.2', '3'], ['3', '0.3', '1.5'], ['5', '0.5', '2'], '4.5'), expectedCorrect: false, expectedMistakeType: 'omitted-zero-outcome', prdReason: '$0 row contribution must be 0.' },
  { id: 'p12-unweighted-sum', canonicalSlug: 'l3-prize-bag-ev-table', description: 'raw payouts as contributions', input: prizeBag(['2', '0.2', '15'], ['3', '0.3', '5'], ['5', '0.5', '0'], '20'), expectedCorrect: false, expectedMistakeType: 'unweighted-sum', prdReason: 'Summed raw payouts, not contributions.' },
  { id: 'p12-arithmetic', canonicalSlug: 'l3-prize-bag-ev-table', description: 'EV arithmetic error', input: prizeBag(['2', '0.2', '3'], ['3', '0.3', '1.5'], ['5', '0.5', '0'], '5'), expectedCorrect: false, expectedMistakeType: 'arithmetic-error', prdReason: 'Contributions right, EV sum wrong.' },
  { id: 'p12-guard-empty', canonicalSlug: 'l3-prize-bag-ev-table', description: 'a cell empty', input: prizeBag(['2', '0.2', '3'], ['3', '0.3', '1.5'], ['5', '0.5', ''], '4.5'), expectedCorrect: false, expectedMistakeType: '', prdReason: 'Guard: incomplete table.' },
  { id: 'p12-ev-formatting', canonicalSlug: 'l3-prize-bag-ev-table', description: 'EV as $4.5', input: prizeBag(['2', '0.2', '3'], ['3', '0.3', '1.5'], ['5', '0.5', '0'], '$4.5'), expectedCorrect: true, prdReason: 'Final EV formatting variants accepted.' },
]

// ===========================================================================
// 13 — l4-payout-vs-profit
// ===========================================================================

const payoutVsProfit = (formulaSelected: boolean, profitAnswer: string): PayoutVsProfitInput => ({ formulaSelected, profitAnswer })

const payoutCases: PackValidationCase[] = [
  { id: 'p13-correct', canonicalSlug: 'l4-payout-vs-profit', description: 'profit $1', input: payoutVsProfit(true, '1'), expectedCorrect: true, prdReason: 'payout $4 − cost $3 = $1.' },
  { id: 'p13-correct-currency', canonicalSlug: 'l4-payout-vs-profit', description: 'profit $1.00', input: payoutVsProfit(true, '$1.00'), expectedCorrect: true, prdReason: 'Money formatting accepted.' },
  { id: 'p13-answered-payout', canonicalSlug: 'l4-payout-vs-profit', description: 'answered $4', input: payoutVsProfit(true, '4'), expectedCorrect: false, expectedMistakeType: 'answered-payout', prdReason: 'Reject payout 4 as final profit.' },
  { id: 'p13-added-cost', canonicalSlug: 'l4-payout-vs-profit', description: 'answered $7', input: payoutVsProfit(true, '7'), expectedCorrect: false, expectedMistakeType: 'added-cost', prdReason: 'Detect addition of cost.' },
  { id: 'p13-reversed', canonicalSlug: 'l4-payout-vs-profit', description: 'answered −$1', input: payoutVsProfit(true, '-1'), expectedCorrect: false, expectedMistakeType: 'reversed-subtraction', prdReason: 'Detect reversed subtraction.' },
  { id: 'p13-guard-no-formula', canonicalSlug: 'l4-payout-vs-profit', description: 'cost not placed', input: payoutVsProfit(false, '1'), expectedCorrect: false, expectedMistakeType: '', prdReason: 'Guard: build the equation first.' },
]

// ===========================================================================
// 14 — l4-fair-favorable-unfavorable
// ===========================================================================

const fairness = (a: string, b: string, c: string): FairnessSortInput => ({ assignments: { A: a, B: b, C: c } })

const fairnessCases: PackValidationCase[] = [
  { id: 'p14-correct', canonicalSlug: 'l4-fair-favorable-unfavorable', description: 'A fair, B favorable, C unfavorable', input: fairness('fair', 'favorable', 'unfavorable'), expectedCorrect: true, prdReason: 'A=$0, B=+$2, C=−$2.' },
  { id: 'p14-correct-synonyms', canonicalSlug: 'l4-fair-favorable-unfavorable', description: 'case + synonyms', input: fairness('Fair', 'FAV', 'unfav'), expectedCorrect: true, prdReason: 'Classification synonyms remain deterministic.' },
  { id: 'p14-positive-payout', canonicalSlug: 'l4-fair-favorable-unfavorable', description: 'C marked favorable', input: fairness('fair', 'favorable', 'favorable'), expectedCorrect: false, expectedMistakeType: 'positive-payout-favorable', prdReason: 'Positive payout treated as favorable.' },
  { id: 'p14-confused-fair', canonicalSlug: 'l4-fair-favorable-unfavorable', description: 'A marked favorable', input: fairness('favorable', 'favorable', 'unfavorable'), expectedCorrect: false, expectedMistakeType: 'confused-fair-favorable', prdReason: 'Fair confused with favorable.' },
  { id: 'p14-reversed', canonicalSlug: 'l4-fair-favorable-unfavorable', description: 'B marked unfavorable', input: fairness('fair', 'unfavorable', 'unfavorable'), expectedCorrect: false, expectedMistakeType: 'reversed-classification', prdReason: 'Favorable/unfavorable reversed.' },
  { id: 'p14-guard-missing', canonicalSlug: 'l4-fair-favorable-unfavorable', description: 'a card unplaced', input: { assignments: { A: 'fair', B: 'favorable' } }, expectedCorrect: false, expectedMistakeType: '', prdReason: 'Guard: place all three cards.' },
]

// ===========================================================================
// 15 — l4-find-fair-price
// ===========================================================================

const findFair = (payout: string, cost: string, profit: string, classification: string): FindFairPriceInput => ({ expectedPayout: payout, fairCost: cost, expectedProfit: profit, classification })

const findFairCases: PackValidationCase[] = [
  { id: 'p15-correct', canonicalSlug: 'l4-find-fair-price', description: 'payout 4, cost 4, profit 0, fair', input: findFair('4', '4', '0', 'fair'), expectedCorrect: true, prdReason: 'Fair cost equals expected payout.' },
  { id: 'p15-correct-currency', canonicalSlug: 'l4-find-fair-price', description: 'currency formats', input: findFair('$4.00', '$4', '$0', 'Fair'), expectedCorrect: true, prdReason: 'Money formatting + case-insensitive class.' },
  { id: 'p15-largest-payout', canonicalSlug: 'l4-find-fair-price', description: 'used $8 payout', input: findFair('8', '4', '0', 'fair'), expectedCorrect: false, expectedMistakeType: 'used-largest-payout', prdReason: 'Chose max payout for expected payout.' },
  { id: 'p15-cost-below', canonicalSlug: 'l4-find-fair-price', description: 'cost $2 called fair', input: findFair('4', '2', '2', 'fair'), expectedCorrect: false, expectedMistakeType: 'cost-below-payout', prdReason: 'Cost below payout is favorable, not fair.' },
  { id: 'p15-cost-above', canonicalSlug: 'l4-find-fair-price', description: 'cost $6 called fair', input: findFair('4', '6', '-2', 'fair'), expectedCorrect: false, expectedMistakeType: 'cost-above-payout', prdReason: 'Cost above payout is unfavorable, not fair.' },
  { id: 'p15-guard-empty', canonicalSlug: 'l4-find-fair-price', description: 'classification blank', input: findFair('4', '4', '0', ''), expectedCorrect: false, expectedMistakeType: '', prdReason: 'Guard: complete all fields.' },
]

// ===========================================================================
// 16 — l4-choose-better-game-after-cost
// ===========================================================================

const chooseGame = (a: string, b: string, better: string): ChooseBetterGameInput => ({ profitA: a, profitB: b, betterGame: better })

const chooseCases: PackValidationCase[] = [
  { id: 'p16-correct', canonicalSlug: 'l4-choose-better-game-after-cost', description: 'profits 2/3, choose B', input: chooseGame('2', '3', 'B'), expectedCorrect: true, prdReason: 'B has higher profit after cost.' },
  { id: 'p16-correct-gameb', canonicalSlug: 'l4-choose-better-game-after-cost', description: '"Game B" choice', input: chooseGame('$2', '$3', 'Game B'), expectedCorrect: true, prdReason: 'Choice synonyms accepted.' },
  { id: 'p16-largest-payout', canonicalSlug: 'l4-choose-better-game-after-cost', description: 'profits right but chose A', input: chooseGame('2', '3', 'A'), expectedCorrect: false, expectedMistakeType: 'largest-payout-misconception', prdReason: 'Largest-payout misconception.' },
  { id: 'p16-forgot-cost', canonicalSlug: 'l4-choose-better-game-after-cost', description: 'profit A = payout 9', input: chooseGame('9', '3', 'B'), expectedCorrect: false, expectedMistakeType: 'forgot-subtract-cost', prdReason: 'Forgot to subtract cost.' },
  { id: 'p16-added-cost', canonicalSlug: 'l4-choose-better-game-after-cost', description: 'profit A added cost = 16', input: chooseGame('16', '3', 'B'), expectedCorrect: false, expectedMistakeType: 'added-cost', prdReason: 'Added cost instead of subtracting.' },
  { id: 'p16-guard-empty', canonicalSlug: 'l4-choose-better-game-after-cost', description: 'no choice yet', input: chooseGame('2', '3', ''), expectedCorrect: false, expectedMistakeType: '', prdReason: 'Guard: must choose the better game.' },
]

// ===========================================================================
// 17 — l5-build-whole-ev-model
// ===========================================================================

const wholeCases: PackValidationCase[] = [
  { id: 'p17-correct-fractions', canonicalSlug: 'l5-build-whole-ev-model', description: 'fractions', input: wholeModel(['1/10', '2/10', '7/10'], ['3', '2', '0'], '5', '0', 'fair'), expectedCorrect: true, prdReason: 'Full model correct.' },
  { id: 'p17-correct-decimals', canonicalSlug: 'l5-build-whole-ev-model', description: 'decimals', input: wholeModel(['0.1', '0.2', '0.7'], ['3', '2', '0'], '5', '0', 'fair'), expectedCorrect: true, prdReason: 'Decimal probabilities accepted.' },
  { id: 'p17-count-not-prob', canonicalSlug: 'l5-build-whole-ev-model', description: 'counts as probabilities', input: wholeModel(['1', '2', '7'], ['3', '2', '0'], '5', '0', 'fair'), expectedCorrect: false, expectedMistakeType: 'count-not-probability', prdReason: 'Counted sections without converting.' },
  { id: 'p17-wrong-denominator', canonicalSlug: 'l5-build-whole-ev-model', description: 'wrong denominator', input: wholeModel(['1/6', '2/10', '7/10'], ['3', '2', '0'], '5', '0', 'fair'), expectedCorrect: false, expectedMistakeType: 'wrong-denominator', prdReason: 'Denominator must be 10.' },
  { id: 'p17-payout-not-profit', canonicalSlug: 'l5-build-whole-ev-model', description: 'profit left at 5', input: wholeModel(['1/10', '2/10', '7/10'], ['3', '2', '0'], '5', '5', 'fair'), expectedCorrect: false, expectedMistakeType: 'payout-not-profit', prdReason: 'Calculated payout but not profit.' },
  { id: 'p17-fair-favorable', canonicalSlug: 'l5-build-whole-ev-model', description: 'fair marked favorable', input: wholeModel(['1/10', '2/10', '7/10'], ['3', '2', '0'], '5', '0', 'favorable'), expectedCorrect: false, expectedMistakeType: 'fair-marked-favorable', prdReason: 'Marked fair as favorable.' },
  { id: 'p17-guard-empty', canonicalSlug: 'l5-build-whole-ev-model', description: 'empty cell', input: wholeModel(['1/10', '2/10', ''], ['3', '2', '0'], '5', '0', 'fair'), expectedCorrect: false, expectedMistakeType: '', prdReason: 'Guard: incomplete table.' },
]

// ===========================================================================
// 18 — l5-same-ev-different-risk
// ===========================================================================

const sameEv = (evA: string, evB: string, risk: string, reason: string, simA = true, simB = true): SameEvDifferentRiskInput => ({ gameASimulated: simA, gameBSimulated: simB, evA, evB, higherRisk: risk, reason })

const sameEvCases: PackValidationCase[] = [
  { id: 'p18-correct', canonicalSlug: 'l5-same-ev-different-risk', description: 'EVs 5/5, B riskier, variable', input: sameEv('5', '5', 'Game B', 'variable-outcomes'), expectedCorrect: true, prdReason: 'Same EV, B riskier.' },
  { id: 'p18-correct-freetext', canonicalSlug: 'l5-same-ev-different-risk', description: 'free-text spread reason', input: sameEv('5', '5', 'B', 'it has more spread, can be 0 or 10'), expectedCorrect: true, prdReason: 'Deterministic keyword match.' },
  { id: 'p18-b-higher-ev', canonicalSlug: 'l5-same-ev-different-risk', description: 'EV(B)=10', input: sameEv('5', '10', 'Game B', 'variable-outcomes'), expectedCorrect: false, expectedMistakeType: 'b-higher-ev', prdReason: 'Reject higher-EV misconception.' },
  { id: 'p18-identical', canonicalSlug: 'l5-same-ev-different-risk', description: 'chose A / identical', input: sameEv('5', '5', 'Game A', 'identical'), expectedCorrect: false, expectedMistakeType: 'identical-games', prdReason: 'Reject identical-game misconception.' },
  { id: 'p18-avg-vs-guaranteed', canonicalSlug: 'l5-same-ev-different-risk', description: 'EV(A)=10', input: sameEv('10', '5', 'Game B', 'variable-outcomes'), expectedCorrect: false, expectedMistakeType: 'average-vs-guaranteed', prdReason: 'Confused average with guaranteed.' },
  { id: 'p18-contradictory-reason', canonicalSlug: 'l5-same-ev-different-risk', description: 'B chosen but reason contradicts', input: sameEv('5', '5', 'Game B', 'they are the same game'), expectedCorrect: false, expectedMistakeType: 'identical-games', prdReason: 'Contradictory explanation rejected.' },
  { id: 'p18-guard-no-sim', canonicalSlug: 'l5-same-ev-different-risk', description: 'B not simulated', input: sameEv('5', '5', 'Game B', 'variable-outcomes', true, false), expectedCorrect: false, expectedMistakeType: '', prdReason: 'Guard: run both simulations.' },
]

// ===========================================================================
// 19 — l5-low-risk-vs-high-risk
// ===========================================================================

const lowHigh = (evA: string, evB: string, risk: string, reason: string, simA = true, simB = true): LowVsHighRiskInput => ({ gameASimulated: simA, gameBSimulated: simB, evA, evB, higherRisk: risk, reason })

const lowHighCases: PackValidationCase[] = [
  { id: 'p19-correct', canonicalSlug: 'l5-low-risk-vs-high-risk', description: 'EVs 6/6, B riskier, wider spread', input: lowHigh('6', '6', 'Game B', 'wider-spread'), expectedCorrect: true, prdReason: 'Same EV, B has wider spread.' },
  { id: 'p19-correct-freetext', canonicalSlug: 'l5-low-risk-vs-high-risk', description: 'free-text 0 or 12', input: lowHigh('6', '6', 'B', 'wider range, can be 0 or 12'), expectedCorrect: true, prdReason: 'Deterministic keyword match.' },
  { id: 'p19-b-higher-ev', canonicalSlug: 'l5-low-risk-vs-high-risk', description: 'EV(B)=12', input: lowHigh('6', '12', 'Game B', 'wider-spread'), expectedCorrect: false, expectedMistakeType: 'b-higher-ev', prdReason: 'Reject higher-EV misconception.' },
  { id: 'p19-identical', canonicalSlug: 'l5-low-risk-vs-high-risk', description: 'chose A', input: lowHigh('6', '6', 'Game A', 'wider-spread'), expectedCorrect: false, expectedMistakeType: 'identical-games', prdReason: 'Reject wrong risk choice.' },
  { id: 'p19-avg-vs-guaranteed', canonicalSlug: 'l5-low-risk-vs-high-risk', description: 'EV(A)=12', input: lowHigh('12', '6', 'Game B', 'wider-spread'), expectedCorrect: false, expectedMistakeType: 'average-vs-guaranteed', prdReason: 'Confused guaranteed with average.' },
  { id: 'p19-contradictory', canonicalSlug: 'l5-low-risk-vs-high-risk', description: 'B but identical reason', input: lowHigh('6', '6', 'Game B', 'identical'), expectedCorrect: false, expectedMistakeType: 'identical-games', prdReason: 'Contradictory explanation rejected.' },
  { id: 'p19-guard-no-sim', canonicalSlug: 'l5-low-risk-vs-high-risk', description: 'A not simulated', input: lowHigh('6', '6', 'Game B', 'wider-spread', false, true), expectedCorrect: false, expectedMistakeType: '', prdReason: 'Guard: run both simulations.' },
]

// ===========================================================================
// 20 — l5-final-capstone-ev-decision
// ===========================================================================

const capstoneCases: PackValidationCase[] = [
  { id: 'p20-correct-fractions', canonicalSlug: 'l5-final-capstone-ev-decision', description: 'fractions + variable reason', input: capstone(['1/12', '3/12', '8/12'], ['3', '3', '0'], '6', '0', 'fair', 'variable-outcomes'), expectedCorrect: true, prdReason: 'Full capstone correct.' },
  { id: 'p20-correct-reduced', canonicalSlug: 'l5-final-capstone-ev-decision', description: '1/4 and 2/3', input: capstone(['1/12', '1/4', '2/3'], ['3', '3', '0'], '6', '0', 'fair', 'fair-but-variable'), expectedCorrect: true, prdReason: 'Reduced fractions accepted.' },
  { id: 'p20-correct-rounded-decimals', canonicalSlug: 'l5-final-capstone-ev-decision', description: '0.083 and 0.667', input: capstone(['0.083', '0.25', '0.667'], ['3', '3', '0'], '6', '0', 'fair', 'can be 0, 12, or 36'), expectedCorrect: true, prdReason: 'PRD rounded decimals 0.083/0.667 accepted.' },
  { id: 'p20-correct-rounded-4dp', canonicalSlug: 'l5-final-capstone-ev-decision', description: '0.0833 and 0.6667', input: capstone(['0.0833', '0.25', '0.6667'], ['3', '3', '0'], '6', '0', 'fair', 'not guaranteed each play'), expectedCorrect: true, prdReason: 'PRD rounded decimals 0.0833/0.6667 accepted.' },
  { id: 'p20-count-not-prob', canonicalSlug: 'l5-final-capstone-ev-decision', description: 'counts as probs', input: capstone(['1', '3', '8'], ['3', '3', '0'], '6', '0', 'fair', 'variable-outcomes'), expectedCorrect: false, expectedMistakeType: 'count-not-probability', prdReason: 'Counts not converted.' },
  { id: 'p20-payout-not-profit', canonicalSlug: 'l5-final-capstone-ev-decision', description: 'profit left at 6', input: capstone(['1/12', '3/12', '8/12'], ['3', '3', '0'], '6', '6', 'fair', 'variable-outcomes'), expectedCorrect: false, expectedMistakeType: 'payout-not-profit', prdReason: 'Calculated payout but not profit.' },
  { id: 'p20-fair-favorable', canonicalSlug: 'l5-final-capstone-ev-decision', description: 'fair marked favorable', input: capstone(['1/12', '3/12', '8/12'], ['3', '3', '0'], '6', '0', 'favorable', 'variable-outcomes'), expectedCorrect: false, expectedMistakeType: 'fair-marked-favorable', prdReason: 'Positive payout marked favorable.' },
  { id: 'p20-fair-no-risk', canonicalSlug: 'l5-final-capstone-ev-decision', description: 'claims fair = no risk', input: capstone(['1/12', '3/12', '8/12'], ['3', '3', '0'], '6', '0', 'fair', 'no risk because it is fair'), expectedCorrect: false, expectedMistakeType: 'fair-means-no-risk', prdReason: 'Fair-does-not-mean-no-risk mistake.' },
  { id: 'p20-avg-guaranteed', canonicalSlug: 'l5-final-capstone-ev-decision', description: 'claims guaranteed $6', input: capstone(['1/12', '3/12', '8/12'], ['3', '3', '0'], '6', '0', 'fair', 'you are guaranteed to get $6 back'), expectedCorrect: false, expectedMistakeType: 'fair-means-no-risk', prdReason: 'Average-is-not-guaranteed / guaranteed wording rejected.' },
  { id: 'p20-insufficient-reason', canonicalSlug: 'l5-final-capstone-ev-decision', description: 'blank risk explanation', input: capstone(['1/12', '3/12', '8/12'], ['3', '3', '0'], '6', '0', 'fair', ''), expectedCorrect: false, expectedMistakeType: 'average-not-guaranteed', prdReason: 'Empty explanation rejected (model complete, concept missing).' },
  { id: 'p20-guard-empty-table', canonicalSlug: 'l5-final-capstone-ev-decision', description: 'empty probability cell', input: capstone(['1/12', '', '8/12'], ['3', '3', '0'], '6', '0', 'fair', 'variable-outcomes'), expectedCorrect: false, expectedMistakeType: '', prdReason: 'Guard: incomplete table.' },
]

// ===========================================================================
// Direct-correction pairs (wrong → corrected resubmission passes, no reset).
// ===========================================================================

const directCorrectionCases: PackValidationCase[] = [
  { id: 'p13-fix-1-wrong', canonicalSlug: 'l4-payout-vs-profit', description: 'answered payout (wrong)', input: payoutVsProfit(true, '4'), expectedCorrect: false, expectedMistakeType: 'answered-payout', prdReason: 'First submit is a graded mistake.' },
  { id: 'p13-fix-2-correct', canonicalSlug: 'l4-payout-vs-profit', description: 'corrected to $1', input: payoutVsProfit(true, '1'), expectedCorrect: true, prdReason: 'Corrected resubmission passes without reset.' },
  { id: 'p11-fix-1-wrong', canonicalSlug: 'l3-repair-probability-table', description: '$4 wrong denom (wrong)', input: repair('1/8', '3/10', '4/8'), expectedCorrect: false, expectedMistakeType: 'wrong-denominator', prdReason: 'First submit is a graded mistake.' },
  { id: 'p11-fix-2-correct', canonicalSlug: 'l3-repair-probability-table', description: 'only $4 corrected', input: repair('1/8', '3/8', '4/8'), expectedCorrect: true, prdReason: 'Correcting one cell while others persist passes.' },
  { id: 'p20-fix-1-wrong', canonicalSlug: 'l5-final-capstone-ev-decision', description: 'fair=no risk (wrong)', input: capstone(['1/12', '3/12', '8/12'], ['3', '3', '0'], '6', '0', 'fair', 'no risk'), expectedCorrect: false, expectedMistakeType: 'fair-means-no-risk', prdReason: 'First submit is a graded mistake.' },
  { id: 'p20-fix-2-correct', canonicalSlug: 'l5-final-capstone-ev-decision', description: 'corrected risk explanation', input: capstone(['1/12', '3/12', '8/12'], ['3', '3', '0'], '6', '0', 'fair', 'fair-but-variable'), expectedCorrect: true, prdReason: 'Correcting only the explanation passes.' },
]

export const problemPackBValidationCases: PackValidationCase[] = [
  ...repairCases,
  ...prizeBagCases,
  ...payoutCases,
  ...fairnessCases,
  ...findFairCases,
  ...chooseCases,
  ...wholeCases,
  ...sameEvCases,
  ...lowHighCases,
  ...capstoneCases,
  ...directCorrectionCases,
]
