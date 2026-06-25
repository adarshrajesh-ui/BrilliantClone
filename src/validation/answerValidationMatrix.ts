// Validation and Test Coverage — Expected Value Lab (15-problem chapter)
// ----------------------------------------------------------------------
// Deterministic, hand-built validation cases for the full 5-lesson × 3-problem
// chapter. NO AI, no semantic matching, no model calls. This file is pure data.
//
// Two layers of cases:
//   1. Normalizer cases — exercise the shared parser (`normalizeMoneyAnswer`,
//      `parseProbabilityAnswer`, `normalizeClassificationAnswer`) that every
//      problem checker relies on.
//   2. Live-checker cases — concrete inputs for each active problem, fed to
//      the REAL co-located checkers via `runLiveChecker` (see ./liveCheckers.ts
//      and ./liveCheckerValidation.test.ts). Each problem has at least one
//      `correct` case, one representative `mistake` case (asserting the exact
//      mistakeType the PRD classifies), and — where the checker has one — a
//      `guard` case that must NOT count as a graded attempt.

import type {
  SameAverageRideCheckInput,
  DealtHandCheckInput,
  EvL1P2CheckInput,
  EvL1P3CheckInput,
  EvL2P2CheckInput,
  EvL2P3CheckInput,
  MiniDeckCheckInput,
  EvL4P1CheckInput,
  EvL4P3CheckInput,
  FinalDecisionCheckInput,
  Problem1DiceCheckInput,
  Problem2PrizeBoardCheckInput,
  Problem6CheckInput,
  WiderSpreadCheckInput,
} from './liveCheckers'

/**
 * A single deterministic normalizer case. `input` is the raw learner string;
 * `expectedNormalized` is the value the parser must return (or it must reject).
 */
export type ValidationCase = {
  id: string
  /** A `normalizer:*` scope for parser cases. */
  problemId: string
  description: string
  input: unknown
  expectedCorrect: boolean
  expectedNormalized?: unknown
  prdReason: string
}

// ---------------------------------------------------------------------------
// 1. Accepted answer formats — money / EV numeric fields (normalizeMoneyAnswer)
//    PRD: accepted EV values like 5, 5.0, 5.00, $5, "5 dollars", "5 per throw".
// ---------------------------------------------------------------------------

export const moneyAnswerCases: ValidationCase[] = [
  { id: 'money-5', problemId: 'normalizer:money', description: 'bare integer', input: '5', expectedCorrect: true, expectedNormalized: 5, prdReason: 'L1P2/L2 accept 5 as the EV value.' },
  { id: 'money-5.0', problemId: 'normalizer:money', description: 'one decimal place', input: '5.0', expectedCorrect: true, expectedNormalized: 5, prdReason: 'EV accepts 5.0.' },
  { id: 'money-5.00', problemId: 'normalizer:money', description: 'two decimal places', input: '5.00', expectedCorrect: true, expectedNormalized: 5, prdReason: 'Money formatting variant must normalize to 5.' },
  { id: 'money-$5', problemId: 'normalizer:money', description: 'dollar sign prefix', input: '$5', expectedCorrect: true, expectedNormalized: 5, prdReason: 'EV accepts $5.' },
  { id: 'money-$5.00', problemId: 'normalizer:money', description: 'dollar sign + decimals', input: '$5.00', expectedCorrect: true, expectedNormalized: 5, prdReason: 'Currency + decimals must normalize to 5.' },
  { id: 'money-5-dollars', problemId: 'normalizer:money', description: 'word "dollars"', input: '5 dollars', expectedCorrect: true, expectedNormalized: 5, prdReason: 'Money normalizer strips the "dollars" word (used by L1P2/L2).' },
  { id: 'money-whitespace', problemId: 'normalizer:money', description: 'leading/trailing whitespace', input: '  5  ', expectedCorrect: true, expectedNormalized: 5, prdReason: 'Whitespace variants must be tolerated.' },
  { id: 'money-6.5', problemId: 'normalizer:money', description: 'L3P2 final EV = 6.5', input: '$6.50', expectedCorrect: true, expectedNormalized: 6.5, prdReason: 'L3P2 dealt-hand EV accepts 6.5, 6.50, $6.50.' },
  { id: 'money-6.4', problemId: 'normalizer:money', description: 'L3P3 final EV = 6.4', input: '$6.40', expectedCorrect: true, expectedNormalized: 6.4, prdReason: 'L3P3 mini-deck EV accepts 6.4, 6.40, $6.40.' },
  { id: 'money-1', problemId: 'normalizer:money', description: 'L4P1 expected profit = 1', input: '$1.00', expectedCorrect: true, expectedNormalized: 1, prdReason: 'L4P1 profit accepts 1, 1.0, $1.' },
  { id: 'money-6', problemId: 'normalizer:money', description: 'L5P2/L5P3 EV = 6', input: '$6', expectedCorrect: true, expectedNormalized: 6, prdReason: 'L5P2 EV(A)=EV(B)=6; L5P3 payout 6.' },
  { id: 'money-reject-text', problemId: 'normalizer:money', description: 'non-numeric text is rejected', input: 'five', expectedCorrect: false, prdReason: 'Free text that is not a number must not parse.' },
  { id: 'money-reject-empty', problemId: 'normalizer:money', description: 'empty string is rejected', input: '', expectedCorrect: false, prdReason: 'Empty input is not a graded answer.' },
]

// ---------------------------------------------------------------------------
// 2. Accepted answer formats — probabilities (parseProbabilityAnswer)
//    PRD: fractions or decimals or percent; equivalence within tolerance.
// ---------------------------------------------------------------------------

export const probabilityAnswerCases: ValidationCase[] = [
  // L2P2 / general sixths: 1/6, 2/6 (=1/3), 3/6 (=1/2)
  { id: 'prob-1/6', problemId: 'normalizer:probability', description: 'one-sixth', input: '1/6', expectedCorrect: true, expectedNormalized: 1 / 6, prdReason: 'L2P2 accepts 1/6.' },
  { id: 'prob-1 / 6', problemId: 'normalizer:probability', description: 'one-sixth with mixed whitespace', input: ' 1 / 6 ', expectedCorrect: true, expectedNormalized: 1 / 6, prdReason: 'Fraction probabilities tolerate reasonable whitespace.' },
  { id: 'prob-0.1667', problemId: 'normalizer:probability', description: '1/6 as decimal (4dp)', input: '0.1667', expectedCorrect: true, expectedNormalized: 1 / 6, prdReason: 'Parser accepts 0.1667 within tolerance.' },
  { id: 'prob-16.667%', problemId: 'normalizer:probability', description: '1/6 as percent', input: '16.667%', expectedCorrect: true, expectedNormalized: 1 / 6, prdReason: 'Probability answers accept percent forms within tolerance.' },
  { id: 'prob-2/6', problemId: 'normalizer:probability', description: 'two-sixths', input: '2/6', expectedCorrect: true, expectedNormalized: 2 / 6, prdReason: 'Parser accepts 2/6.' },
  { id: 'prob-1/3', problemId: 'normalizer:probability', description: '2/6 reduced', input: '1/3', expectedCorrect: true, expectedNormalized: 1 / 3, prdReason: 'L2P2 accepts 1/3 as equivalent to 2/6.' },
  { id: 'prob-33.333%', problemId: 'normalizer:probability', description: 'one-third as percent', input: '33.333%', expectedCorrect: true, expectedNormalized: 1 / 3, prdReason: 'Probability answers accept percent equivalents.' },
  { id: 'prob-3/6', problemId: 'normalizer:probability', description: 'three-sixths', input: '3/6', expectedCorrect: true, expectedNormalized: 0.5, prdReason: 'Parser accepts 3/6.' },
  { id: 'prob-1/2', problemId: 'normalizer:probability', description: '3/6 reduced', input: '1/2', expectedCorrect: true, expectedNormalized: 0.5, prdReason: 'L2P2 accepts 1/2.' },
  { id: 'prob-.5', problemId: 'normalizer:probability', description: 'leading-dot decimal', input: '.5', expectedCorrect: true, expectedNormalized: 0.5, prdReason: 'Parser accepts .5.' },
  { id: 'prob-50%', problemId: 'normalizer:probability', description: 'percent form for 1/2', input: '50%', expectedCorrect: true, expectedNormalized: 0.5, prdReason: 'Parser accepts 50%.' },
  // L3P3 mini-deck tenths: 3/10, 4/10
  { id: 'prob-2/10', problemId: 'normalizer:probability', description: 'two-tenths', input: '2/10', expectedCorrect: true, expectedNormalized: 0.2, prdReason: 'Parser accepts 2/10 or 0.2.' },
  { id: 'prob-3/10', problemId: 'normalizer:probability', description: 'L3P3 value-1/value-7 rows (3/10)', input: '0.3', expectedCorrect: true, expectedNormalized: 0.3, prdReason: 'L3P3 accepts 3/10 or 0.3.' },
  { id: 'prob-4/10', problemId: 'normalizer:probability', description: 'L3P3 value-10 row (4/10)', input: '4/10', expectedCorrect: true, expectedNormalized: 0.4, prdReason: 'L3P3 accepts 4/10 or 0.4.' },
  // L5P3 capstone wheel: 1/12, 3/12 (=1/4), 8/12 (=2/3)
  { id: 'prob-1/12', problemId: 'normalizer:probability', description: '$36 section', input: '1/12', expectedCorrect: true, expectedNormalized: 1 / 12, prdReason: 'L5P3 accepts 1/12.' },
  { id: 'prob-1/4', problemId: 'normalizer:probability', description: '3/12 reduced', input: '1/4', expectedCorrect: true, expectedNormalized: 0.25, prdReason: 'L5P3 accepts 1/4 or 25%.' },
  { id: 'prob-2/3', problemId: 'normalizer:probability', description: '8/12 reduced', input: '2/3', expectedCorrect: true, expectedNormalized: 2 / 3, prdReason: 'L5P3 accepts 2/3 or 0.6667.' },
  { id: 'prob-25%', problemId: 'normalizer:probability', description: 'percent form', input: '25%', expectedCorrect: true, expectedNormalized: 0.25, prdReason: 'Percent forms parse into 0..1.' },
  { id: 'prob-reject-text', problemId: 'normalizer:probability', description: 'non-numeric text rejected', input: 'half', expectedCorrect: false, prdReason: 'Free text is not a valid probability.' },
]

// ---------------------------------------------------------------------------
// 3. Accepted answer formats — classification (normalizeClassificationAnswer)
//    PRD: fair / favorable / unfavorable, case-insensitive, unambiguous synonyms.
// ---------------------------------------------------------------------------

export const classificationAnswerCases: ValidationCase[] = [
  { id: 'class-fair', problemId: 'normalizer:classification', description: 'fair', input: 'fair', expectedCorrect: true, expectedNormalized: 'fair', prdReason: 'L4P2/L5P3 use fair.' },
  { id: 'class-Fair', problemId: 'normalizer:classification', description: 'fair, mixed case', input: 'Fair', expectedCorrect: true, expectedNormalized: 'fair', prdReason: 'Classification is case-insensitive.' },
  { id: 'class-FAIR', problemId: 'normalizer:classification', description: 'fair, upper case', input: 'FAIR', expectedCorrect: true, expectedNormalized: 'fair', prdReason: 'Classification is case-insensitive.' },
  { id: 'class-favorable', problemId: 'normalizer:classification', description: 'favorable', input: 'favorable', expectedCorrect: true, expectedNormalized: 'favorable', prdReason: 'L4P2 game B is favorable.' },
  { id: 'class-fav', problemId: 'normalizer:classification', description: 'favorable synonym', input: 'fav', expectedCorrect: true, expectedNormalized: 'favorable', prdReason: 'Unambiguous synonym accepted.' },
  { id: 'class-unfavorable', problemId: 'normalizer:classification', description: 'unfavorable', input: 'unfavorable', expectedCorrect: true, expectedNormalized: 'unfavorable', prdReason: 'L4P2 game C is unfavorable.' },
  { id: 'class-unfav', problemId: 'normalizer:classification', description: 'unfavorable synonym', input: 'unfav', expectedCorrect: true, expectedNormalized: 'unfavorable', prdReason: 'Unambiguous synonym accepted.' },
  { id: 'class-reject-ambiguous', problemId: 'normalizer:classification', description: 'ambiguous word rejected', input: 'maybe', expectedCorrect: false, prdReason: 'Ambiguous input must not be silently classified.' },
]

// ---------------------------------------------------------------------------
// 4. Live-checker cases for the 15 problems.
//    `kind` drives the assertion in liveCheckerValidation.test.ts:
//      - 'correct'  → result.canComplete === true (and counts as graded)
//      - 'mistake'  → result.canComplete === false, mistakeType === expected,
//                     and the result counts as a graded attempt
//      - 'guard'    → result.canComplete === false and it must NOT count as a
//                     graded attempt (incomplete state, mistakeType empty/null)
// ---------------------------------------------------------------------------

export type LiveCheckerKind = 'correct' | 'mistake' | 'guard'

export interface LiveCheckerCase {
  id: string
  /** Storage ID used by `runLiveChecker`. */
  storageId: string
  canonicalSlug: string
  description: string
  input: unknown
  kind: LiveCheckerKind
  /** Required when kind === 'mistake': the exact mistakeType the checker emits. */
  expectedMistakeType?: string
  prdReason: string
}

export const liveCheckerCases: LiveCheckerCase[] = [
  // ---- ev-l1-p1 / problem-1: Two-Dice Roll Average (EV of the sum = 7) ----
  { id: 'l1p1-correct', storageId: 'problem-1', canonicalSlug: 'ev-l1-p1', description: '7 after 100 total rolls', input: { totalThrows: 100, finalAnswer: '7' } satisfies Problem1DiceCheckInput, kind: 'correct', prdReason: 'EV(sum) = 3.5 + 3.5 = 7.' },
  { id: 'l1p1-correct-perroll', storageId: 'problem-1', canonicalSlug: 'ev-l1-p1', description: '"7 per roll" phrasing accepted', input: { totalThrows: 120, finalAnswer: '7 per roll' } satisfies Problem1DiceCheckInput, kind: 'correct', prdReason: 'Accepted format "7 per roll".' },
  { id: 'l1p1-correct-decimal-whitespace', storageId: 'problem-1', canonicalSlug: 'ev-l1-p1', description: 'decimal + whitespace phrasing accepted', input: { totalThrows: 100, finalAnswer: '  7.00 per roll  ' } satisfies Problem1DiceCheckInput, kind: 'correct', prdReason: 'Equivalent decimal/whitespace forms should normalize to 7.' },
  { id: 'l1p1-mistake-extreme-low', storageId: 'problem-1', canonicalSlug: 'ev-l1-p1', description: 'answered 2 (rarest extreme sum)', input: { totalThrows: 100, finalAnswer: '2' } satisfies Problem1DiceCheckInput, kind: 'mistake', expectedMistakeType: 'chose-extreme-outcome', prdReason: 'Mistake: chose an extreme sum (2), not the average.' },
  { id: 'l1p1-mistake-extreme-high', storageId: 'problem-1', canonicalSlug: 'ev-l1-p1', description: 'answered 12 (largest extreme sum)', input: { totalThrows: 100, finalAnswer: '12' } satisfies Problem1DiceCheckInput, kind: 'mistake', expectedMistakeType: 'chose-extreme-outcome', prdReason: 'Mistake: chose an extreme sum (12), not the average.' },
  { id: 'l1p1-mistake-singledie', storageId: 'problem-1', canonicalSlug: 'ev-l1-p1', description: 'answered 3.5 (one die average)', input: { totalThrows: 100, finalAnswer: '3.5' } satisfies Problem1DiceCheckInput, kind: 'mistake', expectedMistakeType: 'used-single-die-average', prdReason: 'Mistake: 3.5 is the average of ONE die; two dice average 7.' },
  { id: 'l1p1-mistake-sample', storageId: 'problem-1', canonicalSlug: 'ev-l1-p1', description: 'answered a sample mean (6.5)', input: { totalThrows: 100, finalAnswer: '6.5' } satisfies Problem1DiceCheckInput, kind: 'mistake', expectedMistakeType: 'assumed-sample-equals-ev', prdReason: 'Mistake: reported the observed sample average instead of 7.' },
  { id: 'l1p1-guard-total', storageId: 'problem-1', canonicalSlug: 'ev-l1-p1', description: 'fewer than 100 total rolls', input: { totalThrows: 80, finalAnswer: '7' } satisfies Problem1DiceCheckInput, kind: 'guard', prdReason: 'Guard: ≥100 total rolls.' },

  // ---- ev-l1-p2: Unequal Section Game (25% $20 / 75% $0, EV $5) ----
  { id: 'l1p2-correct', storageId: 'ev-l1-p2', canonicalSlug: 'ev-l1-p2', description: '$5 after 100 spins', input: { predictionSubmitted: true, totalSpins: 100, finalAnswer: '5' } satisfies EvL1P2CheckInput, kind: 'correct', prdReason: '20×0.25 + 0×0.75 = $5.' },
  { id: 'l1p2-correct-currency-decimal', storageId: 'ev-l1-p2', canonicalSlug: 'ev-l1-p2', description: '$5.00 with whitespace after 100 spins', input: { predictionSubmitted: true, totalSpins: 100, finalAnswer: '  $5.00  ' } satisfies EvL1P2CheckInput, kind: 'correct', prdReason: 'Currency/decimal/whitespace forms should normalize to $5.' },
  { id: 'l1p2-mistake-largest', storageId: 'ev-l1-p2', canonicalSlug: 'ev-l1-p2', description: 'answered $20 (largest payout)', input: { predictionSubmitted: true, totalSpins: 100, finalAnswer: '20' } satisfies EvL1P2CheckInput, kind: 'mistake', expectedMistakeType: 'used-largest-payout', prdReason: 'Mistake: chose largest payout, ignored probability.' },
  { id: 'l1p2-mistake-divide', storageId: 'ev-l1-p2', canonicalSlug: 'ev-l1-p2', description: 'answered $0.80 ($20 ÷ 25)', input: { predictionSubmitted: true, totalSpins: 100, finalAnswer: '0.8' } satisfies EvL1P2CheckInput, kind: 'mistake', expectedMistakeType: 'divided-payout-by-percent', prdReason: 'Mistake: 25% means $20 ÷ 25.' },
  { id: 'l1p2-guard-spins', storageId: 'ev-l1-p2', canonicalSlug: 'ev-l1-p2', description: 'fewer than 100 spins', input: { predictionSubmitted: true, totalSpins: 40, finalAnswer: '5' } satisfies EvL1P2CheckInput, kind: 'guard', prdReason: 'Guard: ≥100 spins.' },

  // ---- ev-l1-p3: Which Game Has the Best Long-Run Average? ----
  { id: 'l1p3-correct', storageId: 'ev-l1-p3', canonicalSlug: 'ev-l1-p3', description: 'A/B selected + tied-at-$5 reason', input: { selectedGames: ['a', 'b'], reason: 'same-average' } satisfies EvL1P3CheckInput, kind: 'correct', prdReason: 'A: 10×0.5=5, B: 25×0.2=5, C: 6×0.8=4.80.' },
  { id: 'l1p3-mistake-bigprize', storageId: 'ev-l1-p3', canonicalSlug: 'ev-l1-p3', description: 'selected B only (biggest prize)', input: { selectedGames: ['b'], reason: null } satisfies EvL1P3CheckInput, kind: 'mistake', expectedMistakeType: 'chose-bigger-prize', prdReason: 'Mistake: chose B because it can pay $25.' },
  { id: 'l1p3-mistake-frequent', storageId: 'ev-l1-p3', canonicalSlug: 'ev-l1-p3', description: 'selected C (wins most often)', input: { selectedGames: ['c'], reason: null } satisfies EvL1P3CheckInput, kind: 'mistake', expectedMistakeType: 'chose-highest-win-rate', prdReason: 'Mistake: chose C because it wins 80% of the time.' },
  { id: 'l1p3-guard-nochoice', storageId: 'ev-l1-p3', canonicalSlug: 'ev-l1-p3', description: 'no games selected', input: { selectedGames: [], reason: null } satisfies EvL1P3CheckInput, kind: 'guard', prdReason: 'Guard: choose at least one game first.' },

  // ---- ev-l2-p1 / problem-2: Claw Machine Expected Value (EV $5) ----
  { id: 'l2p1-correct', storageId: 'problem-2', canonicalSlug: 'ev-l2-p1', description: 'grabs complete, correct pairs, EV 5', input: { grabsComplete: true, slots: ['$20', '25%', '$0', '75%'], evAnswer: '5' } satisfies Problem2PrizeBoardCheckInput, kind: 'correct', prdReason: '20×0.25 + 0×0.75 = $5.' },
  { id: 'l2p1-correct-currency-decimal', storageId: 'problem-2', canonicalSlug: 'ev-l2-p1', description: 'grabs complete, EV $5.00', input: { grabsComplete: true, slots: ['$20', '25%', '$0', '75%'], evAnswer: ' $5.00 ' } satisfies Problem2PrizeBoardCheckInput, kind: 'correct', prdReason: 'Currency/decimal/whitespace forms should normalize to $5.' },
  { id: 'l2p1-mistake-reversed', storageId: 'problem-2', canonicalSlug: 'ev-l2-p1', description: 'reversed outcome/probability', input: { grabsComplete: true, slots: ['25%', '$20', '75%', '$0'], evAnswer: '5' } satisfies Problem2PrizeBoardCheckInput, kind: 'mistake', expectedMistakeType: 'reversed-outcome-probability', prdReason: 'Mistake: reversed outcome and probability.' },
  { id: 'l2p1-mistake-largest', storageId: 'problem-2', canonicalSlug: 'ev-l2-p1', description: 'EV = $20 (largest payout)', input: { grabsComplete: true, slots: ['$20', '25%', '$0', '75%'], evAnswer: '20' } satisfies Problem2PrizeBoardCheckInput, kind: 'mistake', expectedMistakeType: 'used-largest-payout', prdReason: 'Mistake: used the largest payout as EV.' },
  { id: 'l2p1-mistake-omitted', storageId: 'problem-2', canonicalSlug: 'ev-l2-p1', description: 'a slot left empty', input: { grabsComplete: true, slots: ['$20', '25%', '$0', ''], evAnswer: '5' } satisfies Problem2PrizeBoardCheckInput, kind: 'mistake', expectedMistakeType: 'omitted-probability', prdReason: 'Mistake: omitted a probability slot.' },
  { id: 'l2p1-guard-board', storageId: 'problem-2', canonicalSlug: 'ev-l2-p1', description: 'formula locked until grabs + compression complete', input: { grabsComplete: false, slots: ['$20', '25%', '$0', '75%'], evAnswer: '5' } satisfies Problem2PrizeBoardCheckInput, kind: 'guard', prdReason: 'Gate: run ≥8 claw drops + view contribution compression before the formula.' },

  // ---- ev-l2-p2: Match Outcomes to Probabilities ----
  { id: 'l2p2-correct', storageId: 'ev-l2-p2', canonicalSlug: 'ev-l2-p2', description: '$12↔1/3, $3↔1/2, $0↔1/6', input: { assignments: { '12': '1/3', '3': '1/2', '0': '1/6' } } satisfies EvL2P2CheckInput, kind: 'correct', prdReason: 'Correct outcome↔probability pairing.' },
  { id: 'l2p2-correct-decimal-percent', storageId: 'ev-l2-p2', canonicalSlug: 'ev-l2-p2', description: 'equivalent decimal/percent probabilities', input: { assignments: { '12': '33.333%', '3': '50%', '0': '0.1667' } } satisfies EvL2P2CheckInput, kind: 'correct', prdReason: 'Probability matching accepts equivalent decimal and percent forms.' },
  { id: 'l2p2-mistake-ranked', storageId: 'ev-l2-p2', canonicalSlug: 'ev-l2-p2', description: 'ranked by size ($12↔1/2)', input: { assignments: { '12': '1/2', '3': '1/3', '0': '1/6' } } satisfies EvL2P2CheckInput, kind: 'mistake', expectedMistakeType: 'ranked-by-size', prdReason: 'Mistake: largest payout paired with largest probability.' },
  { id: 'l2p2-mistake-reused', storageId: 'ev-l2-p2', canonicalSlug: 'ev-l2-p2', description: 'reused a probability card', input: { assignments: { '12': '1/3', '3': '1/3', '0': '1/6' } } satisfies EvL2P2CheckInput, kind: 'mistake', expectedMistakeType: 'reused-probability', prdReason: 'Mistake: each probability card single-use.' },
  { id: 'l2p2-guard-incomplete', storageId: 'ev-l2-p2', canonicalSlug: 'ev-l2-p2', description: 'an outcome left unmatched', input: { assignments: { '12': '1/3', '3': '1/2', '0': '' } } satisfies EvL2P2CheckInput, kind: 'guard', prdReason: 'Guard: match all three before checking.' },

  // ---- ev-l2-p3: Diagnose Bad EV Setups ----
  { id: 'l2p3-correct', storageId: 'ev-l2-p3', canonicalSlug: 'ev-l2-p3', description: 'valid C, A no-probability, B omits-zero', input: { valid: 'C', defectA: 'no-probability', defectB: 'omits-zero' } satisfies EvL2P3CheckInput, kind: 'correct', prdReason: 'C is the complete model.' },
  { id: 'l2p3-mistake-rawsum', storageId: 'ev-l2-p3', canonicalSlug: 'ev-l2-p3', description: 'chose A as valid', input: { valid: 'A', defectA: null, defectB: null } satisfies EvL2P3CheckInput, kind: 'mistake', expectedMistakeType: 'chose-raw-sum', prdReason: 'Mistake: A sums raw payouts.' },
  { id: 'l2p3-mistake-incomplete', storageId: 'ev-l2-p3', canonicalSlug: 'ev-l2-p3', description: 'chose B as valid (omits $0)', input: { valid: 'B', defectA: null, defectB: null } satisfies EvL2P3CheckInput, kind: 'mistake', expectedMistakeType: 'chose-incomplete', prdReason: 'Mistake: B omits the $0 outcome but matches numerically.' },
  { id: 'l2p3-guard-novalid', storageId: 'ev-l2-p3', canonicalSlug: 'ev-l2-p3', description: 'no formula selected', input: { valid: null, defectA: null, defectB: null } satisfies EvL2P3CheckInput, kind: 'guard', prdReason: 'Guard: select the valid formula first.' },

  // ---- ev-l3-p2 / problem-4: Dealt-Hand Contributions (EV 6.5) ----
  { id: 'l3p2-correct', storageId: 'problem-4', canonicalSlug: 'ev-l3-p2', description: 'contribs 0.5,1.0,5.0 EV 6.5', input: { contributions: ['0.5', '1.0', '5.0'], evAnswer: '6.5' } satisfies DealtHandCheckInput, kind: 'correct', prdReason: '2×1/4=0.5, 4×1/4=1.0, 10×1/2=5.0 → EV 6.5.' },
  { id: 'l3p2-correct-currency-decimal', storageId: 'problem-4', canonicalSlug: 'ev-l3-p2', description: 'currency/decimal contribution variants', input: { contributions: ['$0.50', '$1.00', '$5.00'], evAnswer: ' $6.50 ' } satisfies DealtHandCheckInput, kind: 'correct', prdReason: 'Money-style contribution and EV cells accept currency, decimals, and whitespace.' },
  { id: 'l3p2-mistake-forgotweight', storageId: 'problem-4', canonicalSlug: 'ev-l3-p2', description: 'raw value 2 as the value-2 contribution', input: { contributions: ['2', '1.0', '5.0'], evAnswer: '6.5' } satisfies DealtHandCheckInput, kind: 'mistake', expectedMistakeType: 'forgot-to-weight', prdReason: 'Mistake: entered the raw card value instead of value × probability.' },
  { id: 'l3p2-mistake-unweighted', storageId: 'problem-4', canonicalSlug: 'ev-l3-p2', description: 'EV = 16 (summed raw card values)', input: { contributions: ['0.5', '1.0', '5.0'], evAnswer: '16' } satisfies DealtHandCheckInput, kind: 'mistake', expectedMistakeType: 'unweighted-sum', prdReason: 'Mistake: added the raw values 2 + 4 + 10 instead of the weighted contributions.' },
  { id: 'l3p2-mistake-arithmetic', storageId: 'problem-4', canonicalSlug: 'ev-l3-p2', description: 'EV = 7 (wrong sum)', input: { contributions: ['0.5', '1.0', '5.0'], evAnswer: '7' } satisfies DealtHandCheckInput, kind: 'mistake', expectedMistakeType: 'arithmetic-error', prdReason: 'Mistake: contributions right but EV not 0.5 + 1.0 + 5.0 = 6.5.' },
  { id: 'l3p2-guard-empty', storageId: 'problem-4', canonicalSlug: 'ev-l3-p2', description: 'a contribution cell empty', input: { contributions: ['0.5', '1.0', ''], evAnswer: '6.5' } satisfies DealtHandCheckInput, kind: 'guard', prdReason: 'Guard: fill every contribution and the EV.' },

  // ---- ev-l3-p3: Mini-Deck EV Table (EV 6.4) ----
  { id: 'l3p3-correct', storageId: 'ev-l3-p3', canonicalSlug: 'ev-l3-p3', description: 'full table EV 6.4', input: { rows: [{ count: '3', probability: '3/10', contribution: '0.3' }, { count: '3', probability: '3/10', contribution: '2.1' }, { count: '4', probability: '4/10', contribution: '4.0' }], evAnswer: '6.4' } satisfies MiniDeckCheckInput, kind: 'correct', prdReason: '1×3/10=0.3, 7×3/10=2.1, 10×4/10=4.0 → EV 6.4.' },
  { id: 'l3p3-correct-percent-currency', storageId: 'ev-l3-p3', canonicalSlug: 'ev-l3-p3', description: 'percent probabilities and currency contributions', input: { rows: [{ count: '3', probability: ' 30% ', contribution: '$0.30' }, { count: '3', probability: '30%', contribution: '$2.10' }, { count: '4', probability: '40%', contribution: '$4.00' }], evAnswer: ' $6.40 ' } satisfies MiniDeckCheckInput, kind: 'correct', prdReason: 'Probability cells accept percent equivalents; money cells accept currency/decimal variants.' },
  { id: 'l3p3-mistake-totalcardvalue', storageId: 'ev-l3-p3', canonicalSlug: 'ev-l3-p3', description: 'used total card value (64)', input: { rows: [{ count: '3', probability: '3/10', contribution: '0.3' }, { count: '3', probability: '3/10', contribution: '2.1' }, { count: '4', probability: '4/10', contribution: '4.0' }], evAnswer: '64' } satisfies MiniDeckCheckInput, kind: 'mistake', expectedMistakeType: 'used-total-card-value', prdReason: 'Mistake: summed the raw card values (64) instead of the per-draw EV.' },
  { id: 'l3p3-mistake-confusion', storageId: 'ev-l3-p3', canonicalSlug: 'ev-l3-p3', description: 'count typed in probability cell', input: { rows: [{ count: '3', probability: '3', contribution: '0.3' }, { count: '3', probability: '3/10', contribution: '2.1' }, { count: '4', probability: '4/10', contribution: '4.0' }], evAnswer: '6.4' } satisfies MiniDeckCheckInput, kind: 'mistake', expectedMistakeType: 'count-probability-confusion', prdReason: 'Mistake: card count used as the probability.' },
  { id: 'l3p3-mistake-wrongdenom', storageId: 'ev-l3-p3', canonicalSlug: 'ev-l3-p3', description: 'probability 1/2 (wrong denominator)', input: { rows: [{ count: '3', probability: '1/2', contribution: '0.3' }, { count: '3', probability: '3/10', contribution: '2.1' }, { count: '4', probability: '4/10', contribution: '4.0' }], evAnswer: '6.4' } satisfies MiniDeckCheckInput, kind: 'mistake', expectedMistakeType: 'wrong-denominator', prdReason: 'Mistake: probability not count ÷ 10 total cards.' },
  { id: 'l3p3-mistake-omittedrow', storageId: 'ev-l3-p3', canonicalSlug: 'ev-l3-p3', description: 'value-10 row contribution dropped to 0', input: { rows: [{ count: '3', probability: '3/10', contribution: '0.3' }, { count: '3', probability: '3/10', contribution: '2.1' }, { count: '4', probability: '4/10', contribution: '0' }], evAnswer: '6.4' } satisfies MiniDeckCheckInput, kind: 'mistake', expectedMistakeType: 'omitted-row', prdReason: 'Mistake: a paying row left at 0, dropped from the weighted sum.' },
  { id: 'l3p3-mistake-arithmetic', storageId: 'ev-l3-p3', canonicalSlug: 'ev-l3-p3', description: 'EV = 5 (wrong sum)', input: { rows: [{ count: '3', probability: '3/10', contribution: '0.3' }, { count: '3', probability: '3/10', contribution: '2.1' }, { count: '4', probability: '4/10', contribution: '4.0' }], evAnswer: '5' } satisfies MiniDeckCheckInput, kind: 'mistake', expectedMistakeType: 'arithmetic-error', prdReason: 'Mistake: cells right but EV not 0.3 + 2.1 + 4.0 = 6.4.' },
  { id: 'l3p3-guard-empty', storageId: 'ev-l3-p3', canonicalSlug: 'ev-l3-p3', description: 'a cell empty', input: { rows: [{ count: '3', probability: '', contribution: '0.3' }, { count: '3', probability: '3/10', contribution: '2.1' }, { count: '4', probability: '4/10', contribution: '4.0' }], evAnswer: '6.4' } satisfies MiniDeckCheckInput, kind: 'guard', prdReason: 'Guard: fill every table cell.' },

  // ---- ev-l4-p1 / problem-5: Pay to Play (profit $1) ----
  { id: 'l4p1-correct', storageId: 'problem-5', canonicalSlug: 'ev-l4-p1', description: 'expected profit 1', input: { costPlaced: true, profitAnswer: '1' } satisfies EvL4P1CheckInput, kind: 'correct', prdReason: 'profit = payout $4 − cost $3 = $1.' },
  { id: 'l4p1-correct-currency-decimal', storageId: 'problem-5', canonicalSlug: 'ev-l4-p1', description: 'expected profit $1.00', input: { costPlaced: true, profitAnswer: ' $1.00 ' } satisfies EvL4P1CheckInput, kind: 'correct', prdReason: 'Profit accepts equivalent currency/decimal/whitespace forms.' },
  { id: 'l4p1-mistake-payout', storageId: 'problem-5', canonicalSlug: 'ev-l4-p1', description: 'answered payout $4', input: { costPlaced: true, profitAnswer: '4' } satisfies EvL4P1CheckInput, kind: 'mistake', expectedMistakeType: 'answered-payout', prdReason: 'Mistake: answered expected payout, not profit.' },
  { id: 'l4p1-mistake-added', storageId: 'problem-5', canonicalSlug: 'ev-l4-p1', description: 'added cost ($7)', input: { costPlaced: true, profitAnswer: '7' } satisfies EvL4P1CheckInput, kind: 'mistake', expectedMistakeType: 'added-cost', prdReason: 'Mistake: added the cost instead of subtracting.' },
  { id: 'l4p1-mistake-costprob', storageId: 'problem-5', canonicalSlug: 'ev-l4-p1', description: 'cost treated as probability (0.75)', input: { costPlaced: true, profitAnswer: '0.75' } satisfies EvL4P1CheckInput, kind: 'mistake', expectedMistakeType: 'cost-as-probability', prdReason: 'Mistake: cost used as a probability not subtracted.' },
  { id: 'l4p1-guard-cost', storageId: 'problem-5', canonicalSlug: 'ev-l4-p1', description: 'cost not placed', input: { costPlaced: false, profitAnswer: '1' } satisfies EvL4P1CheckInput, kind: 'guard', prdReason: 'Gate: cost-before-profit (place $3 token first).' },

  // ---- ev-l4-p2 / problem-6: Fair, Favorable, Unfavorable ----
  { id: 'l4p2-correct', storageId: 'problem-6', canonicalSlug: 'ev-l4-p2', description: 'A=fair, B=favorable, C=unfavorable', input: { assignments: { A: 'fair', B: 'favorable', C: 'unfavorable' } } satisfies Problem6CheckInput, kind: 'correct', prdReason: 'A=$0 fair, B=+$2 favorable, C=−$2 unfavorable.' },
  { id: 'l4p2-correct-synonyms', storageId: 'problem-6', canonicalSlug: 'ev-l4-p2', description: 'case-insensitive + synonyms', input: { assignments: { A: 'Fair', B: 'FAVORABLE', C: 'unfav' } } satisfies Problem6CheckInput, kind: 'correct', prdReason: 'Classification accepts case variants / synonyms.' },
  { id: 'l4p2-mistake-positive', storageId: 'problem-6', canonicalSlug: 'ev-l4-p2', description: 'C marked favorable', input: { assignments: { A: 'fair', B: 'favorable', C: 'favorable' } } satisfies Problem6CheckInput, kind: 'mistake', expectedMistakeType: 'positive-payout-favorable', prdReason: 'Mistake: positive payout treated as favorable.' },
  { id: 'l4p2-mistake-fairconfused', storageId: 'problem-6', canonicalSlug: 'ev-l4-p2', description: 'A marked favorable', input: { assignments: { A: 'favorable', B: 'favorable', C: 'unfavorable' } } satisfies Problem6CheckInput, kind: 'mistake', expectedMistakeType: 'confused-fair-favorable', prdReason: 'Mistake: confused fair with favorable.' },
  { id: 'l4p2-guard-missing', storageId: 'problem-6', canonicalSlug: 'ev-l4-p2', description: 'a card not placed', input: { assignments: { A: 'fair', B: 'favorable' } } satisfies Problem6CheckInput, kind: 'guard', prdReason: 'Guard: place all three cards.' },

  // ---- ev-l4-p3: Choose the Better Game After Cost (Game B) ----
  { id: 'l4p3-correct', storageId: 'ev-l4-p3', canonicalSlug: 'ev-l4-p3', description: 'profit A=2, B=3, choose B', input: { profitA: '2', profitB: '3', choice: 'B' } satisfies EvL4P3CheckInput, kind: 'correct', prdReason: 'A: 9−7=2, B: 6−3=3 → Game B.' },
  { id: 'l4p3-correct-currency-decimal', storageId: 'ev-l4-p3', canonicalSlug: 'ev-l4-p3', description: 'currency profit variants, choose B', input: { profitA: ' $2.00 ', profitB: '$3.00', choice: 'Game B' } satisfies EvL4P3CheckInput, kind: 'correct', prdReason: 'Profit fields accept currency/decimal/whitespace forms while choice accepts Game B.' },
  { id: 'l4p3-mistake-largerpayout', storageId: 'ev-l4-p3', canonicalSlug: 'ev-l4-p3', description: 'correct profits but chose A', input: { profitA: '2', profitB: '3', choice: 'A' } satisfies EvL4P3CheckInput, kind: 'mistake', expectedMistakeType: 'chose-larger-payout', prdReason: 'Mistake: chose larger payout despite lower profit.' },
  { id: 'l4p3-mistake-forgotcost', storageId: 'ev-l4-p3', canonicalSlug: 'ev-l4-p3', description: 'A profit = payout 9 (forgot cost)', input: { profitA: '9', profitB: '3', choice: 'B' } satisfies EvL4P3CheckInput, kind: 'mistake', expectedMistakeType: 'forgot-subtract-cost', prdReason: 'Mistake: forgot to subtract cost.' },
  { id: 'l4p3-guard-nochoice', storageId: 'ev-l4-p3', canonicalSlug: 'ev-l4-p3', description: 'correct profits, no game chosen', input: { profitA: '2', profitB: '3', choice: '' } satisfies EvL4P3CheckInput, kind: 'guard', prdReason: 'Guard: select the better game.' },

  // ---- ev-l5-p1 / problem-7: Same Average, Different Ride (qualitative) ----
  { id: 'l5p1-correct', storageId: 'problem-7', canonicalSlug: 'ev-l5-p1', description: 'same EV (Yes), Slot riskier, same-avg-different-spread', input: { printerTrials: 11, slotTrials: 11, ranHundredBatch: true, sameEV: 'yes', riskier: 'slot', why: 'same-avg-different-spread' } satisfies SameAverageRideCheckInput, kind: 'correct', prdReason: 'Printer always $10; Slot 0.6×$0 + 0.4×$25 = $10 → same average, Slot riskier.' },
  { id: 'l5p1-mistake-diffev', storageId: 'problem-7', canonicalSlug: 'ev-l5-p1', description: 'claimed different EV', input: { printerTrials: 12, slotTrials: 12, ranHundredBatch: true, sameEV: 'no', riskier: 'slot', why: 'same-avg-different-spread' } satisfies SameAverageRideCheckInput, kind: 'mistake', expectedMistakeType: 'claimed-different-ev', prdReason: 'Mistake: claimed the machines have different averages.' },
  { id: 'l5p1-mistake-printerriskier', storageId: 'problem-7', canonicalSlug: 'ev-l5-p1', description: 'selected the Printer as riskier', input: { printerTrials: 10, slotTrials: 10, ranHundredBatch: true, sameEV: 'yes', riskier: 'printer', why: 'same-avg-different-spread' } satisfies SameAverageRideCheckInput, kind: 'mistake', expectedMistakeType: 'selected-printer-as-riskier', prdReason: 'Mistake: the always-$10 Printer has no risk; the Slot is riskier.' },
  { id: 'l5p1-mistake-norisk', storageId: 'problem-7', canonicalSlug: 'ev-l5-p1', description: 'claimed neither is riskier', input: { printerTrials: 10, slotTrials: 10, ranHundredBatch: true, sameEV: 'yes', riskier: 'neither', why: 'same-avg-different-spread' } satisfies SameAverageRideCheckInput, kind: 'mistake', expectedMistakeType: 'claimed-no-risk-difference', prdReason: 'Mistake: ignored the $0–$25 swing that makes the Slot riskier.' },
  { id: 'l5p1-mistake-slothigher', storageId: 'problem-7', canonicalSlug: 'ev-l5-p1', description: 'reasoned the Slot has a higher average', input: { printerTrials: 10, slotTrials: 10, ranHundredBatch: true, sameEV: 'yes', riskier: 'slot', why: 'slot-higher-average' } satisfies SameAverageRideCheckInput, kind: 'mistake', expectedMistakeType: 'claimed-slot-higher-ev', prdReason: 'Mistake: the Slot averages $10, not more.' },
  { id: 'l5p1-mistake-printerless', storageId: 'problem-7', canonicalSlug: 'ev-l5-p1', description: 'reasoned the Printer pays less', input: { printerTrials: 10, slotTrials: 10, ranHundredBatch: true, sameEV: 'yes', riskier: 'slot', why: 'printer-pays-less' } satisfies SameAverageRideCheckInput, kind: 'mistake', expectedMistakeType: 'misjudged-printer-payout', prdReason: 'Mistake: the Printer pays exactly $10 — the same average, not less.' },
  { id: 'l5p1-guard-trials', storageId: 'problem-7', canonicalSlug: 'ev-l5-p1', description: 'machines not run 10 times each', input: { printerTrials: 4, slotTrials: 11, ranHundredBatch: true, sameEV: 'yes', riskier: 'slot', why: 'same-avg-different-spread' } satisfies SameAverageRideCheckInput, kind: 'guard', prdReason: 'Gate: run each machine at least 10 times.' },
  { id: 'l5p1-guard-hundred', storageId: 'problem-7', canonicalSlug: 'ev-l5-p1', description: 'no 100-run batch yet', input: { printerTrials: 11, slotTrials: 11, ranHundredBatch: false, sameEV: 'yes', riskier: 'slot', why: 'same-avg-different-spread' } satisfies SameAverageRideCheckInput, kind: 'guard', prdReason: 'Gate: run at least one 100-run batch on either machine.' },

  // ---- ev-l5-p2 / problem-8: Wider Spread, Same Average ($6 vs $12/$0) ----
  { id: 'l5p2-correct', storageId: 'problem-8', canonicalSlug: 'ev-l5-p2', description: 'EV(A)=6, EV(B)=6, B riskier, wider-spread', input: { gameASimulated: true, gameBSimulated: true, evA: '6', evB: '6', higherRisk: 'B', reason: 'wider-spread' } satisfies WiderSpreadCheckInput, kind: 'correct', prdReason: 'Both EV $6; Game B has wider spread.' },
  { id: 'l5p2-correct-currency-decimal', storageId: 'problem-8', canonicalSlug: 'ev-l5-p2', description: 'currency EV variants, B riskier', input: { gameASimulated: true, gameBSimulated: true, evA: ' $6.00 ', evB: '$6.00', higherRisk: 'B', reason: 'wider-spread' } satisfies WiderSpreadCheckInput, kind: 'correct', prdReason: 'Equivalent currency/decimal/whitespace EV answers should normalize to $6.' },
  { id: 'l5p2-mistake-bhigherev', storageId: 'problem-8', canonicalSlug: 'ev-l5-p2', description: 'EV(B)=12 (top payout)', input: { gameASimulated: true, gameBSimulated: true, evA: '6', evB: '12', higherRisk: 'B', reason: 'wider-spread' } satisfies WiderSpreadCheckInput, kind: 'mistake', expectedMistakeType: 'claimed-game-b-has-higher-ev', prdReason: 'Mistake: used Game B top payout as EV.' },
  { id: 'l5p2-mistake-l5p1numbers', storageId: 'problem-8', canonicalSlug: 'ev-l5-p2', description: 'cohesion: entered $5 (L5P1 number)', input: { gameASimulated: true, gameBSimulated: true, evA: '5', evB: '6', higherRisk: 'B', reason: 'wider-spread' } satisfies WiderSpreadCheckInput, kind: 'mistake', expectedMistakeType: 'ev-arithmetic-error', prdReason: 'PRD: checker rejects L5P1 booth payout ($5); this problem uses $6.' },
  { id: 'l5p2-mistake-riskA', storageId: 'problem-8', canonicalSlug: 'ev-l5-p2', description: 'selected Game A as riskier', input: { gameASimulated: true, gameBSimulated: true, evA: '6', evB: '6', higherRisk: 'A', reason: 'wider-spread' } satisfies WiderSpreadCheckInput, kind: 'mistake', expectedMistakeType: 'selected-game-a-as-riskier', prdReason: 'Mistake: chose zero-spread Game A as riskier.' },
  { id: 'l5p2-guard-sims', storageId: 'problem-8', canonicalSlug: 'ev-l5-p2', description: 'simulations not run', input: { gameASimulated: false, gameBSimulated: true, evA: '6', evB: '6', higherRisk: 'B', reason: 'wider-spread' } satisfies WiderSpreadCheckInput, kind: 'guard', prdReason: 'Guard: run 20 trials for each game.' },

  // ---- ev-l5-p3: Final Carnival Decision (capstone, fair, profit $0) ----
  { id: 'l5p3-correct', storageId: 'ev-l5-p3', canonicalSlug: 'ev-l5-p3', description: 'full model, fair, variable-outcomes', input: { grouped: true, probabilities: ['1/12', '3/12', '8/12'], contributions: ['3', '3', '0'], expectedPayout: '6', expectedProfit: '0', decision: 'fair', riskChoice: 'variable-outcomes' } satisfies FinalDecisionCheckInput, kind: 'correct', prdReason: 'Payout $6 = cost $6 → fair; outcomes still vary.' },
  { id: 'l5p3-correct-percent-currency', storageId: 'ev-l5-p3', canonicalSlug: 'ev-l5-p3', description: 'percent probabilities and currency payout/profit', input: { grouped: true, probabilities: ['8.333%', '25%', '66.667%'], contributions: ['$3.00', '$3.00', '$0.00'], expectedPayout: ' $6.00 ', expectedProfit: '$0.00', decision: 'fair', riskChoice: 'variable-outcomes' } satisfies FinalDecisionCheckInput, kind: 'correct', prdReason: 'Capstone accepts percent probability equivalents and currency/decimal money forms.' },
  { id: 'l5p3-mistake-counts', storageId: 'ev-l5-p3', canonicalSlug: 'ev-l5-p3', description: 'section count as probability', input: { grouped: true, probabilities: ['1', '3/12', '8/12'], contributions: ['3', '3', '0'], expectedPayout: '6', expectedProfit: '0', decision: 'fair', riskChoice: 'variable-outcomes' } satisfies FinalDecisionCheckInput, kind: 'mistake', expectedMistakeType: 'counts-not-probability', prdReason: 'Mistake: used the section count, not ÷12.' },
  { id: 'l5p3-mistake-profit', storageId: 'ev-l5-p3', canonicalSlug: 'ev-l5-p3', description: 'profit left equal to payout', input: { grouped: true, probabilities: ['1/12', '3/12', '8/12'], contributions: ['3', '3', '0'], expectedPayout: '6', expectedProfit: '6', decision: 'fair', riskChoice: 'variable-outcomes' } satisfies FinalDecisionCheckInput, kind: 'mistake', expectedMistakeType: 'payout-not-profit', prdReason: 'Mistake: calculated payout but not profit.' },
  { id: 'l5p3-mistake-favorable', storageId: 'ev-l5-p3', canonicalSlug: 'ev-l5-p3', description: 'fair marked favorable', input: { grouped: true, probabilities: ['1/12', '3/12', '8/12'], contributions: ['3', '3', '0'], expectedPayout: '6', expectedProfit: '0', decision: 'favorable', riskChoice: 'variable-outcomes' } satisfies FinalDecisionCheckInput, kind: 'mistake', expectedMistakeType: 'fair-marked-favorable', prdReason: 'Mistake: $0 profit marked favorable.' },
  { id: 'l5p3-mistake-norisk', storageId: 'ev-l5-p3', canonicalSlug: 'ev-l5-p3', description: 'believed fair = no risk', input: { grouped: true, probabilities: ['1/12', '3/12', '8/12'], contributions: ['3', '3', '0'], expectedPayout: '6', expectedProfit: '0', decision: 'fair', riskChoice: 'no-risk' } satisfies FinalDecisionCheckInput, kind: 'mistake', expectedMistakeType: 'believed-fair-has-no-risk', prdReason: 'Mistake: believed a fair game has no risk.' },
  { id: 'l5p3-guard-grouped', storageId: 'ev-l5-p3', canonicalSlug: 'ev-l5-p3', description: 'wheel not grouped', input: { grouped: false, probabilities: ['1/12', '3/12', '8/12'], contributions: ['3', '3', '0'], expectedPayout: '6', expectedProfit: '0', decision: 'fair', riskChoice: 'variable-outcomes' } satisfies FinalDecisionCheckInput, kind: 'guard', prdReason: 'Gate: group wheel sections first.' },
]

// ---------------------------------------------------------------------------
// 5. Per-problem PRD spec summary (documentation + coverage assertions).
//    Captures the PRD accepted formats, correct answers, and the full set of
//    mistake types each problem's checker can emit. Used by prdCoverage.test.ts
//    to ensure the live cases above touch every problem.
// ---------------------------------------------------------------------------

export interface ProblemSpecSummary {
  storageId: string
  canonicalSlug: string
  lesson: number
  title: string
  /** Human-readable correct answer summary. */
  correctAnswer: string
  /** PRD accepted answer formats (representative). */
  acceptedFormats: string[]
  /** All mistake types the live checker can classify. */
  mistakeTypes: string[]
  /** Completion gate the checker enforces before grading (if any). */
  gate?: string
}

export const problemSpecs: ProblemSpecSummary[] = [
  { storageId: 'problem-1', canonicalSlug: 'ev-l1-p1', lesson: 1, title: 'Two-Dice Roll Average', correctAnswer: '7 (sum of two dice)', acceptedFormats: ['7', '7.0', '7.00', '7 sum', '7 per roll', '7 per throw'], mistakeTypes: ['chose-extreme-outcome', 'used-single-die-average', 'assumed-sample-equals-ev'], gate: '≥100 total rolls' },
  { storageId: 'ev-l1-p2', canonicalSlug: 'ev-l1-p2', lesson: 1, title: 'Unequal Section Game', correctAnswer: '$5', acceptedFormats: ['5', '5.0', '5.00', '$5', '$5.00', '5 dollars'], mistakeTypes: ['used-largest-payout', 'divided-payout-by-percent', 'ignored-payout', 'short-run-variation'], gate: '≥100 spins + prediction' },
  { storageId: 'ev-l1-p3', canonicalSlug: 'ev-l1-p3', lesson: 1, title: 'Which Game Has the Best Long-Run Average?', correctAnswer: 'Game A and Game B tied ($5 each)', acceptedFormats: ['A and B'], mistakeTypes: ['chose-bigger-prize', 'chose-highest-win-rate', 'missed-tie', 'ignored-probabilities', 'expected-value-is-guaranteed'] },
  { storageId: 'problem-2', canonicalSlug: 'ev-l2-p1', lesson: 2, title: 'Claw Machine Expected Value', correctAnswer: '$5', acceptedFormats: ['5', '5.0', '5.00', '$5', '$5.00'], mistakeTypes: ['reversed-outcome-probability', 'omitted-probability', 'used-largest-payout', 'arithmetic-error'], gate: 'run ≥8 claw drops + view contribution compression before formula' },
  { storageId: 'ev-l2-p2', canonicalSlug: 'ev-l2-p2', lesson: 2, title: 'Match Outcomes to Probabilities', correctAnswer: '$12↔1/3, $3↔1/2, $0↔1/6', acceptedFormats: ['1/3', '1/2', '1/6'], mistakeTypes: ['ranked-by-size', 'reused-probability', 'wrong-pairing'] },
  { storageId: 'ev-l2-p3', canonicalSlug: 'ev-l2-p3', lesson: 2, title: 'Diagnose Bad EV Setups', correctAnswer: 'C valid; A raw sum; B omits $0', acceptedFormats: ['C'], mistakeTypes: ['chose-raw-sum', 'chose-incomplete', 'wrong-defect-a', 'wrong-defect-b'] },
  { storageId: 'problem-4', canonicalSlug: 'ev-l3-p2', lesson: 3, title: 'Dealt-Hand Contributions', correctAnswer: 'contribs 0.5,1.0,5.0; EV 6.5', acceptedFormats: ['6.5', '6.50', '$6.50', '13/2'], mistakeTypes: ['forgot-to-weight', 'unweighted-sum', 'arithmetic-error'], gate: 'all contributions + EV filled' },
  { storageId: 'ev-l3-p3', canonicalSlug: 'ev-l3-p3', lesson: 3, title: 'Mini-Deck EV Table', correctAnswer: 'counts 3,3,4; probs 3/10,3/10,4/10; contribs 0.3,2.1,4.0; EV 6.4', acceptedFormats: ['6.4', '6.40', '$6.40', '32/5'], mistakeTypes: ['count-probability-confusion', 'wrong-denominator', 'used-total-card-value', 'omitted-row', 'arithmetic-error'], gate: 'all table cells filled' },
  { storageId: 'problem-5', canonicalSlug: 'ev-l4-p1', lesson: 4, title: 'Pay to Play', correctAnswer: '$1', acceptedFormats: ['1', '1.0', '1.00', '$1', '$1.00'], mistakeTypes: ['answered-payout', 'added-cost', 'reversed-subtraction', 'cost-as-probability', 'unknown'], gate: 'cost-before-profit (cost token placed)' },
  { storageId: 'problem-6', canonicalSlug: 'ev-l4-p2', lesson: 4, title: 'Fair, Favorable, or Unfavorable?', correctAnswer: 'A=fair, B=favorable, C=unfavorable', acceptedFormats: ['fair', 'favorable', 'fav', 'unfavorable', 'unfav'], mistakeTypes: ['confused-fair-favorable', 'positive-payout-favorable', 'forgot-subtract-cost'] },
  { storageId: 'ev-l4-p3', canonicalSlug: 'ev-l4-p3', lesson: 4, title: 'Choose the Better Game After Cost', correctAnswer: 'A=$2, B=$3 → Game B', acceptedFormats: ['2', '3', '$2', '$3', 'B', 'Game B'], mistakeTypes: ['chose-larger-payout', 'forgot-subtract-cost', 'added-cost', 'reversed-payout-cost', 'arithmetic-error'] },
  { storageId: 'problem-7', canonicalSlug: 'ev-l5-p1', lesson: 5, title: 'Same Average, Different Ride', correctAnswer: 'same EV (Yes), Slot riskier, same-avg-different-spread', acceptedFormats: ['yes', 'slot', 'same-avg-different-spread'], mistakeTypes: ['claimed-different-ev', 'selected-printer-as-riskier', 'claimed-no-risk-difference', 'claimed-slot-higher-ev', 'misjudged-printer-payout'], gate: 'run each machine ≥10 times + at least one 100-run batch' },
  { storageId: 'problem-8', canonicalSlug: 'ev-l5-p2', lesson: 5, title: 'Wider Spread, Same Average', correctAnswer: 'EV(A)=EV(B)=$6; riskier=B', acceptedFormats: ['6', '6.0', '$6', '$6.00', 'B', 'Game B'], mistakeTypes: ['claimed-game-b-has-higher-ev', 'claimed-games-identical', 'selected-game-a-as-riskier', 'ev-arithmetic-error'], gate: 'both 20-trial sims run; rejects L5P1 $5/$10 numbers' },
  { storageId: 'ev-l5-p3', canonicalSlug: 'ev-l5-p3', lesson: 5, title: 'Final Carnival Decision', correctAnswer: 'payout $6, profit $0, fair', acceptedFormats: ['1/12', '3/12', '1/4', '25%', '8/12', '2/3', 'fair'], mistakeTypes: ['counts-not-probability', 'wrong-denominator', 'omitted-zero-row', 'arithmetic-error', 'payout-not-profit', 'fair-marked-favorable', 'confused-ev-with-guaranteed', 'believed-fair-has-no-risk'], gate: 'wheel grouped + all cells filled' },
]
