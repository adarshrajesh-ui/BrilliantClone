// Validation and Test Coverage — Expected Value Lab MVP
// ------------------------------------------------------
// Deterministic, hand-built validation cases for the established 8-problem MVP.
// NO AI, no semantic matching, no model calls. This file is pure data: it does
// not import or change any app behaviour. It only describes what the existing
// answer parser / answer checker MUST accept and reject, so the runner
// (./runValidation.ts) can verify the current implementation against the PRD.
//
// This file intentionally evaluates the *previous stable MVP behaviour* and does
// not assert anything about in-progress UI / animation / pathway changes.

import type {
  Problem1CheckInput,
  Problem2CheckInput,
  Problem3CheckInput,
  Problem4CheckInput,
  Problem5CheckInput,
  Problem6CheckInput,
  Problem7CheckInput,
  Problem8CheckInput,
} from '../types/problem'

/**
 * A single deterministic validation case. The shape matches the PRD validation
 * brief. `input` is intentionally `unknown` because different arrays feed
 * different layers (raw strings for the normalizer, structured CheckInput
 * objects for the per-problem checker).
 */
export type ValidationCase = {
  id: string
  /** A `problem-N` id for checker cases, or a `normalizer:*` scope for parser cases. */
  problemId: string
  description: string
  input: unknown
  /** For checker cases: should this answer be accepted (canComplete). For
   *  normalizer cases: should the value parse to `expectedNormalized`. */
  expectedCorrect: boolean
  /** Expected normalized numeric/string value (normalizer cases). */
  expectedNormalized?: unknown
  /**
   * Expected mistakeType from the checker for wrong answers. An empty string
   * (`''`) means this is an incomplete "guard" result that must NOT count as a
   * graded attempt. `undefined` means not asserted.
   */
  expectedMistakeType?: string
  prdReason: string
}

// ---------------------------------------------------------------------------
// 1. Accepted answer formats — money / EV numeric fields (normalizeMoneyAnswer)
//    PRD: accepted EV values like 5, 5.0, 5.00, $5, "5 dollars", "5 per spin".
// ---------------------------------------------------------------------------

export const moneyAnswerCases: ValidationCase[] = [
  { id: 'money-5', problemId: 'normalizer:money', description: 'bare integer', input: '5', expectedCorrect: true, expectedNormalized: 5, prdReason: 'P1/P2/P4 accept 5 as the EV value.' },
  { id: 'money-5.0', problemId: 'normalizer:money', description: 'one decimal place', input: '5.0', expectedCorrect: true, expectedNormalized: 5, prdReason: 'P2 lists 5.0 as accepted.' },
  { id: 'money-5.00', problemId: 'normalizer:money', description: 'two decimal places', input: '5.00', expectedCorrect: true, expectedNormalized: 5, prdReason: 'Money formatting variant must normalize to 5.' },
  { id: 'money-$5', problemId: 'normalizer:money', description: 'dollar sign prefix', input: '$5', expectedCorrect: true, expectedNormalized: 5, prdReason: 'P2 lists $5 as accepted.' },
  { id: 'money-$5.00', problemId: 'normalizer:money', description: 'dollar sign + decimals', input: '$5.00', expectedCorrect: true, expectedNormalized: 5, prdReason: 'Currency + decimals must normalize to 5.' },
  { id: 'money-5-dollars', problemId: 'normalizer:money', description: 'word "dollars"', input: '5 dollars', expectedCorrect: true, expectedNormalized: 5, prdReason: 'P1 accepts "5 dollars".' },
  { id: 'money-5-per-spin', problemId: 'normalizer:money', description: 'rate phrase "per spin"', input: '5 per spin', expectedCorrect: true, expectedNormalized: 5, prdReason: 'P1 accepts "5 per spin".' },
  { id: 'money-whitespace', problemId: 'normalizer:money', description: 'leading/trailing whitespace', input: '  5  ', expectedCorrect: true, expectedNormalized: 5, prdReason: 'Whitespace variants must be tolerated.' },
  { id: 'money-4', problemId: 'normalizer:money', description: 'P4 final EV / P5 payout = 4', input: '$4', expectedCorrect: true, expectedNormalized: 4, prdReason: 'P4 EV accepts 4, 4.0, $4.' },
  { id: 'money-1', problemId: 'normalizer:money', description: 'P5 expected profit = 1', input: '$1.00', expectedCorrect: true, expectedNormalized: 1, prdReason: 'P5 profit accepts 1, 1.0, $1.' },
  { id: 'money-reject-text', problemId: 'normalizer:money', description: 'non-numeric text is rejected', input: 'five', expectedCorrect: false, prdReason: 'Free text that is not a number must not parse.' },
  { id: 'money-reject-empty', problemId: 'normalizer:money', description: 'empty string is rejected', input: '', expectedCorrect: false, prdReason: 'Empty input is not a graded answer.' },
]

// ---------------------------------------------------------------------------
// 2. Accepted answer formats — probabilities (parseProbabilityAnswer)
//    PRD: fractions or decimals; equivalence within tolerance.
// ---------------------------------------------------------------------------

export const probabilityAnswerCases: ValidationCase[] = [
  // Problem 3 rows: 1/6, 2/6 (=1/3), 3/6 (=1/2)
  { id: 'prob-1/6', problemId: 'normalizer:probability', description: '$12 row probability', input: '1/6', expectedCorrect: true, expectedNormalized: 1 / 6, prdReason: 'P3 accepts 1/6.' },
  { id: 'prob-0.1667', problemId: 'normalizer:probability', description: '1/6 as decimal (4dp)', input: '0.1667', expectedCorrect: true, expectedNormalized: 1 / 6, prdReason: 'P3 accepts 0.1667 within tolerance.' },
  { id: 'prob-0.167', problemId: 'normalizer:probability', description: '1/6 as decimal (3dp)', input: '0.167', expectedCorrect: true, expectedNormalized: 1 / 6, prdReason: 'P3 accepts 0.167 within tolerance.' },
  { id: 'prob-2/6', problemId: 'normalizer:probability', description: '$6 row probability', input: '2/6', expectedCorrect: true, expectedNormalized: 2 / 6, prdReason: 'P3 accepts 2/6.' },
  { id: 'prob-1/3', problemId: 'normalizer:probability', description: '2/6 reduced', input: '1/3', expectedCorrect: true, expectedNormalized: 1 / 3, prdReason: 'P3 accepts 1/3 as equivalent to 2/6.' },
  { id: 'prob-0.3333', problemId: 'normalizer:probability', description: '1/3 as decimal', input: '0.3333', expectedCorrect: true, expectedNormalized: 1 / 3, prdReason: 'P3 accepts 0.3333 within tolerance.' },
  { id: 'prob-0.333', problemId: 'normalizer:probability', description: '1/3 as decimal (3dp)', input: '0.333', expectedCorrect: true, expectedNormalized: 1 / 3, prdReason: 'P3 accepts 0.333 within tolerance.' },
  { id: 'prob-3/6', problemId: 'normalizer:probability', description: '$0 row probability', input: '3/6', expectedCorrect: true, expectedNormalized: 0.5, prdReason: 'P3 accepts 3/6.' },
  { id: 'prob-1/2', problemId: 'normalizer:probability', description: '3/6 reduced', input: '1/2', expectedCorrect: true, expectedNormalized: 0.5, prdReason: 'P3 accepts 1/2.' },
  { id: 'prob-0.5', problemId: 'normalizer:probability', description: '0.5 decimal', input: '0.5', expectedCorrect: true, expectedNormalized: 0.5, prdReason: 'P3 accepts 0.5.' },
  { id: 'prob-.5', problemId: 'normalizer:probability', description: 'leading-dot decimal', input: '.5', expectedCorrect: true, expectedNormalized: 0.5, prdReason: 'P3 accepts .5.' },
  // Problem 7 wheel: 1/10, 2/10, 7/10
  { id: 'prob-1/10', problemId: 'normalizer:probability', description: '$30 wheel section', input: '1/10', expectedCorrect: true, expectedNormalized: 0.1, prdReason: 'P7 accepts 1/10 or 0.1.' },
  { id: 'prob-0.1', problemId: 'normalizer:probability', description: '$30 as decimal', input: '0.1', expectedCorrect: true, expectedNormalized: 0.1, prdReason: 'P7 accepts 0.1.' },
  { id: 'prob-2/10', problemId: 'normalizer:probability', description: '$10 wheel sections', input: '2/10', expectedCorrect: true, expectedNormalized: 0.2, prdReason: 'P7 accepts 2/10 or 0.2.' },
  { id: 'prob-0.2', problemId: 'normalizer:probability', description: '$10 as decimal', input: '0.2', expectedCorrect: true, expectedNormalized: 0.2, prdReason: 'P7 accepts 0.2.' },
  { id: 'prob-7/10', problemId: 'normalizer:probability', description: '$0 wheel sections', input: '7/10', expectedCorrect: true, expectedNormalized: 0.7, prdReason: 'P7 accepts 7/10 or 0.7.' },
  { id: 'prob-0.7', problemId: 'normalizer:probability', description: '$0 as decimal', input: '0.7', expectedCorrect: true, expectedNormalized: 0.7, prdReason: 'P7 accepts 0.7.' },
  // Percent + reject cases
  { id: 'prob-25%', problemId: 'normalizer:probability', description: 'percent form', input: '25%', expectedCorrect: true, expectedNormalized: 0.25, prdReason: 'Percent forms parse into 0..1.' },
  { id: 'prob-reject-text', problemId: 'normalizer:probability', description: 'non-numeric text rejected', input: 'half', expectedCorrect: false, prdReason: 'Free text is not a valid probability.' },
]

// ---------------------------------------------------------------------------
// 3. Accepted answer formats — classification (normalizeClassificationAnswer)
//    PRD: fair / favorable / unfavorable, case-insensitive, unambiguous synonyms.
// ---------------------------------------------------------------------------

export const classificationAnswerCases: ValidationCase[] = [
  { id: 'class-fair', problemId: 'normalizer:classification', description: 'fair', input: 'fair', expectedCorrect: true, expectedNormalized: 'fair', prdReason: 'P6/P7 use fair.' },
  { id: 'class-Fair', problemId: 'normalizer:classification', description: 'fair, mixed case', input: 'Fair', expectedCorrect: true, expectedNormalized: 'fair', prdReason: 'Classification is case-insensitive.' },
  { id: 'class-FAIR', problemId: 'normalizer:classification', description: 'fair, upper case', input: 'FAIR', expectedCorrect: true, expectedNormalized: 'fair', prdReason: 'Classification is case-insensitive.' },
  { id: 'class-favorable', problemId: 'normalizer:classification', description: 'favorable', input: 'favorable', expectedCorrect: true, expectedNormalized: 'favorable', prdReason: 'P6 game B is favorable.' },
  { id: 'class-fav', problemId: 'normalizer:classification', description: 'favorable synonym', input: 'fav', expectedCorrect: true, expectedNormalized: 'favorable', prdReason: 'Unambiguous synonym accepted.' },
  { id: 'class-unfavorable', problemId: 'normalizer:classification', description: 'unfavorable', input: 'unfavorable', expectedCorrect: true, expectedNormalized: 'unfavorable', prdReason: 'P6 game C is unfavorable.' },
  { id: 'class-unfav', problemId: 'normalizer:classification', description: 'unfavorable synonym', input: 'unfav', expectedCorrect: true, expectedNormalized: 'unfavorable', prdReason: 'Unambiguous synonym accepted.' },
  { id: 'class-reject-ambiguous', problemId: 'normalizer:classification', description: 'ambiguous word rejected', input: 'maybe', expectedCorrect: false, prdReason: 'Ambiguous input must not be silently classified.' },
]

// ---------------------------------------------------------------------------
// 4. Per-problem accepted / rejected cases (checkProblem dispatch)
//    expectedCorrect === canComplete. expectedMistakeType is the checker's
//    mistakeType for graded-wrong answers; '' marks an incomplete guard.
// ---------------------------------------------------------------------------

export const problemAnswerCases: ValidationCase[] = [
  // ---- Problem 1: long-run average (multiple choice 0/5/10) ----
  { id: 'p1-correct-5', problemId: 'problem-1', description: '$5 after 100+ spins', input: { predictionSubmitted: true, totalSpins: 120, finalAnswer: 5 } satisfies Problem1CheckInput, expectedCorrect: true, prdReason: 'Long-run average is halfway between $10 and $0 = $5.' },
  { id: 'p1-wrong-0', problemId: 'problem-1', description: 'picked extreme outcome $0', input: { predictionSubmitted: true, totalSpins: 120, finalAnswer: 0 } satisfies Problem1CheckInput, expectedCorrect: false, expectedMistakeType: 'chose-extreme-outcome', prdReason: 'Mistake: chose an extreme outcome.' },
  { id: 'p1-wrong-10', problemId: 'problem-1', description: 'picked extreme outcome $10', input: { predictionSubmitted: true, totalSpins: 120, finalAnswer: 10 } satisfies Problem1CheckInput, expectedCorrect: false, expectedMistakeType: 'chose-extreme-outcome', prdReason: 'Mistake: chose an extreme outcome.' },
  { id: 'p1-guard-no-prediction', problemId: 'problem-1', description: 'no prediction submitted', input: { predictionSubmitted: false, totalSpins: 0, finalAnswer: null } satisfies Problem1CheckInput, expectedCorrect: false, expectedMistakeType: '', prdReason: 'Guard: must submit a prediction first (not a graded attempt).' },
  { id: 'p1-guard-under-100', problemId: 'problem-1', description: 'fewer than 100 spins', input: { predictionSubmitted: true, totalSpins: 50, finalAnswer: 5 } satisfies Problem1CheckInput, expectedCorrect: false, expectedMistakeType: '', prdReason: 'Guard: must run at least 100 spins (not a graded attempt).' },

  // ---- Problem 2: weighted average ----
  { id: 'p2-correct', problemId: 'problem-2', description: 'correct pairing + EV 5', input: { slots: ['$20', '25%', '$0', '75%'], evAnswer: '5' } satisfies Problem2CheckInput, expectedCorrect: true, prdReason: '20×0.25 + 0×0.75 = 5.' },
  { id: 'p2-correct-currency', problemId: 'problem-2', description: 'EV as $5.00', input: { slots: ['$20', '25%', '$0', '75%'], evAnswer: '$5.00' } satisfies Problem2CheckInput, expectedCorrect: true, prdReason: 'EV accepts 5, 5.0, $5.' },
  { id: 'p2-correct-swapped-pairs', problemId: 'problem-2', description: 'pairs in $0/75% then $20/25% order', input: { slots: ['$0', '75%', '$20', '25%'], evAnswer: '5' } satisfies Problem2CheckInput, expectedCorrect: true, prdReason: 'Either valid pairing order is accepted.' },
  { id: 'p2-wrong-reversed', problemId: 'problem-2', description: 'reversed outcome/probability', input: { slots: ['25%', '$20', '75%', '$0'], evAnswer: '5' } satisfies Problem2CheckInput, expectedCorrect: false, expectedMistakeType: 'reversed-outcome-probability', prdReason: 'Mistake: reversed outcome and probability.' },
  { id: 'p2-wrong-omitted', problemId: 'problem-2', description: 'omitted a probability slot', input: { slots: ['$20', '25%', '$0', ''], evAnswer: '5' } satisfies Problem2CheckInput, expectedCorrect: false, expectedMistakeType: 'omitted-probability', prdReason: 'Mistake: omitted a probability.' },
  { id: 'p2-wrong-largest-payout', problemId: 'problem-2', description: 'used 20 as final answer', input: { slots: ['$20', '25%', '$0', '75%'], evAnswer: '20' } satisfies Problem2CheckInput, expectedCorrect: false, expectedMistakeType: 'used-largest-payout', prdReason: 'Mistake: used the largest payout as the EV.' },

  // ---- Problem 3: probability from counts ----
  { id: 'p3-correct-fractions', problemId: 'problem-3', description: '1/6, 2/6, 3/6', input: { allRevealed: true, rows: [{ outcome: 12, count: '1', probability: '1/6' }, { outcome: 6, count: '2', probability: '2/6' }, { outcome: 0, count: '3', probability: '3/6' }] } satisfies Problem3CheckInput, expectedCorrect: true, prdReason: 'Counts→probabilities: 1/6, 2/6, 3/6.' },
  { id: 'p3-correct-decimals', problemId: 'problem-3', description: '0.1667, 1/3, 1/2', input: { allRevealed: true, rows: [{ outcome: 12, count: '1', probability: '0.1667' }, { outcome: 6, count: '2', probability: '1/3' }, { outcome: 0, count: '3', probability: '1/2' }] } satisfies Problem3CheckInput, expectedCorrect: true, prdReason: 'Decimal/reduced equivalents accepted.' },
  { id: 'p3-wrong-count-as-prob', problemId: 'problem-3', description: 'raw count typed as probability', input: { allRevealed: true, rows: [{ outcome: 12, count: '1', probability: '1/6' }, { outcome: 6, count: '2', probability: '2' }, { outcome: 0, count: '3', probability: '3/6' }] } satisfies Problem3CheckInput, expectedCorrect: false, expectedMistakeType: 'counts-as-probabilities', prdReason: 'Mistake: entered counts as probabilities.' },
  { id: 'p3-wrong-zero-row', problemId: 'problem-3', description: 'wrong probability for $0 row', input: { allRevealed: true, rows: [{ outcome: 12, count: '1', probability: '1/6' }, { outcome: 6, count: '2', probability: '2/6' }, { outcome: 0, count: '3', probability: '1/6' }] } satisfies Problem3CheckInput, expectedCorrect: false, expectedMistakeType: 'unknown', prdReason: 'Mistake: mishandled the $0 outcome row.' },
  { id: 'p3-guard-not-revealed', problemId: 'problem-3', description: 'boxes not all revealed', input: { allRevealed: false, rows: [{ outcome: 12, count: '1', probability: '1/6' }, { outcome: 6, count: '2', probability: '2/6' }, { outcome: 0, count: '3', probability: '3/6' }] } satisfies Problem3CheckInput, expectedCorrect: false, expectedMistakeType: '', prdReason: 'Guard: reveal all six boxes first (not a graded attempt).' },

  // ---- Problem 4: calculate EV ----
  { id: 'p4-correct', problemId: 'problem-4', description: 'contribs 2,2,0 EV 4', input: { contributions: ['2', '2', '0'], evAnswer: '4' } satisfies Problem4CheckInput, expectedCorrect: true, prdReason: '12×1/6=2, 6×2/6=2, 0×3/6=0 → EV 4.' },
  { id: 'p4-correct-currency', problemId: 'problem-4', description: 'currency-formatted contribs/EV', input: { contributions: ['$2.00', '2', '0'], evAnswer: '$4' } satisfies Problem4CheckInput, expectedCorrect: true, prdReason: 'EV accepts 4, 4.0, $4.' },
  { id: 'p4-wrong-unweighted', problemId: 'problem-4', description: 'summed raw payouts', input: { contributions: ['12', '6', '0'], evAnswer: '18' } satisfies Problem4CheckInput, expectedCorrect: false, expectedMistakeType: 'unweighted-sum', prdReason: 'Mistake: summed payouts without weighting.' },
  { id: 'p4-wrong-omitted-zero', problemId: 'problem-4', description: 'treated $0 row as nonzero', input: { contributions: ['2', '2', '3'], evAnswer: '7' } satisfies Problem4CheckInput, expectedCorrect: false, expectedMistakeType: 'omitted-zero-row', prdReason: 'Mistake: omitted/mishandled the $0 row.' },
  { id: 'p4-wrong-arithmetic', problemId: 'problem-4', description: 'arithmetic error on a row', input: { contributions: ['1', '2', '0'], evAnswer: '3' } satisfies Problem4CheckInput, expectedCorrect: false, expectedMistakeType: 'arithmetic-error', prdReason: 'Mistake: arithmetic error.' },
  { id: 'p4-guard-empty', problemId: 'problem-4', description: 'a contribution cell empty', input: { contributions: ['2', '2', ''], evAnswer: '4' } satisfies Problem4CheckInput, expectedCorrect: false, expectedMistakeType: '', prdReason: 'Guard: fill all three contributions (not a graded attempt).' },

  // ---- Problem 5: payout vs profit ----
  { id: 'p5-correct', problemId: 'problem-5', description: 'expected profit 1', input: { formulaSelected: true, profitAnswer: '1' } satisfies Problem5CheckInput, expectedCorrect: true, prdReason: 'profit = payout $4 − cost $3 = $1.' },
  { id: 'p5-correct-currency', problemId: 'problem-5', description: 'profit as $1.00', input: { formulaSelected: true, profitAnswer: '$1.00' } satisfies Problem5CheckInput, expectedCorrect: true, prdReason: 'Profit accepts 1, 1.0, $1.' },
  { id: 'p5-wrong-payout', problemId: 'problem-5', description: 'answered payout $4', input: { formulaSelected: true, profitAnswer: '4' } satisfies Problem5CheckInput, expectedCorrect: false, expectedMistakeType: 'answered-payout', prdReason: 'Mistake: answered expected payout, not profit.' },
  { id: 'p5-wrong-added-cost', problemId: 'problem-5', description: 'added cost instead of subtracting', input: { formulaSelected: true, profitAnswer: '7' } satisfies Problem5CheckInput, expectedCorrect: false, expectedMistakeType: 'added-cost', prdReason: 'Mistake: added the cost instead of subtracting.' },
  { id: 'p5-guard-no-formula', problemId: 'problem-5', description: 'cost block not selected', input: { formulaSelected: false, profitAnswer: '1' } satisfies Problem5CheckInput, expectedCorrect: false, expectedMistakeType: '', prdReason: 'Guard: build payout − cost first (not a graded attempt).' },

  // ---- Problem 6: fairness sort ----
  { id: 'p6-correct', problemId: 'problem-6', description: 'A=fair, B=favorable, C=unfavorable', input: { assignments: { A: 'fair', B: 'favorable', C: 'unfavorable' } } satisfies Problem6CheckInput, expectedCorrect: true, prdReason: 'A=$0 fair, B=+$2 favorable, C=−$2 unfavorable.' },
  { id: 'p6-correct-case', problemId: 'problem-6', description: 'case-insensitive + synonyms', input: { assignments: { A: 'Fair', B: 'FAVORABLE', C: 'unfav' } } satisfies Problem6CheckInput, expectedCorrect: true, prdReason: 'Classification accepts case variants / synonyms.' },
  { id: 'p6-wrong-positive-payout', problemId: 'problem-6', description: 'C marked favorable (positive payout)', input: { assignments: { A: 'fair', B: 'favorable', C: 'favorable' } } satisfies Problem6CheckInput, expectedCorrect: false, expectedMistakeType: 'positive-payout-favorable', prdReason: 'Mistake: positive payout treated as favorable.' },
  { id: 'p6-wrong-fair-confused', problemId: 'problem-6', description: 'A marked favorable (fair confused)', input: { assignments: { A: 'favorable', B: 'favorable', C: 'unfavorable' } } satisfies Problem6CheckInput, expectedCorrect: false, expectedMistakeType: 'confused-fair-favorable', prdReason: 'Mistake: confused fair with favorable.' },
  { id: 'p6-guard-missing', problemId: 'problem-6', description: 'a card not placed', input: { assignments: { A: 'fair', B: 'favorable' } } satisfies Problem6CheckInput, expectedCorrect: false, expectedMistakeType: '', prdReason: 'Guard: place all three cards (not a graded attempt).' },

  // ---- Problem 7: whole EV model ----
  { id: 'p7-correct', problemId: 'problem-7', description: 'full model, fractions', input: { probabilities: ['1/10', '2/10', '7/10'], contributions: ['3', '2', '0'], expectedPayout: '5', expectedProfit: '0', decision: 'fair' } satisfies Problem7CheckInput, expectedCorrect: true, prdReason: 'Probabilities .1/.2/.7, contribs 3/2/0, payout 5, profit 0, fair.' },
  { id: 'p7-correct-decimals', problemId: 'problem-7', description: 'full model, decimals', input: { probabilities: ['0.1', '0.2', '0.7'], contributions: ['3', '2', '0'], expectedPayout: '5', expectedProfit: '0', decision: 'fair' } satisfies Problem7CheckInput, expectedCorrect: true, prdReason: 'Decimal probabilities accepted.' },
  { id: 'p7-wrong-count-not-prob', problemId: 'problem-7', description: 'section counts as probabilities', input: { probabilities: ['1', '2', '7'], contributions: ['3', '2', '0'], expectedPayout: '5', expectedProfit: '0', decision: 'fair' } satisfies Problem7CheckInput, expectedCorrect: false, expectedMistakeType: 'count-not-probability', prdReason: 'Mistake: counted sections but did not convert to probability.' },
  { id: 'p7-wrong-denominator', problemId: 'problem-7', description: 'wrong denominator on $30 row', input: { probabilities: ['1/6', '2/10', '7/10'], contributions: ['3', '2', '0'], expectedPayout: '5', expectedProfit: '0', decision: 'fair' } satisfies Problem7CheckInput, expectedCorrect: false, expectedMistakeType: 'wrong-denominator', prdReason: 'Mistake: wrong denominator.' },
  { id: 'p7-wrong-payout-not-profit', problemId: 'problem-7', description: 'profit left equal to payout', input: { probabilities: ['1/10', '2/10', '7/10'], contributions: ['3', '2', '0'], expectedPayout: '5', expectedProfit: '5', decision: 'fair' } satisfies Problem7CheckInput, expectedCorrect: false, expectedMistakeType: 'payout-not-profit', prdReason: 'Mistake: calculated payout but not profit.' },
  { id: 'p7-wrong-fair-favorable', problemId: 'problem-7', description: 'fair marked favorable', input: { probabilities: ['1/10', '2/10', '7/10'], contributions: ['3', '2', '0'], expectedPayout: '5', expectedProfit: '0', decision: 'favorable' } satisfies Problem7CheckInput, expectedCorrect: false, expectedMistakeType: 'fair-marked-favorable', prdReason: 'Mistake: marked fair as favorable because payout is positive.' },
  { id: 'p7-guard-empty', problemId: 'problem-7', description: 'a table cell empty', input: { probabilities: ['1/10', '2/10', ''], contributions: ['3', '2', '0'], expectedPayout: '5', expectedProfit: '0', decision: 'fair' } satisfies Problem7CheckInput, expectedCorrect: false, expectedMistakeType: '', prdReason: 'Guard: fill every cell first (not a graded attempt).' },

  // ---- Problem 8: same EV, different risk ----
  { id: 'p8-correct', problemId: 'problem-8', description: 'EV(A)=5, EV(B)=5, B riskier, correct reason', input: { gameASimulated: true, gameBSimulated: true, evA: '5', evB: '5', higherRisk: 'Game B', reason: 'variable-outcomes' } satisfies Problem8CheckInput, expectedCorrect: true, prdReason: 'Same EV but Game B has variable outcomes.' },
  { id: 'p8-correct-freetext-reason', problemId: 'problem-8', description: 'free-text "same average but more spread"', input: { gameASimulated: true, gameBSimulated: true, evA: '5', evB: '5', higherRisk: 'Game B', reason: 'same average but more spread' } satisfies Problem8CheckInput, expectedCorrect: true, prdReason: 'Deterministic keyword match accepts equivalent reasoning.' },
  { id: 'p8-wrong-b-higher-ev', problemId: 'problem-8', description: 'said Game B has EV 10', input: { gameASimulated: true, gameBSimulated: true, evA: '5', evB: '10', higherRisk: 'Game B', reason: 'variable-outcomes' } satisfies Problem8CheckInput, expectedCorrect: false, expectedMistakeType: 'b-higher-ev', prdReason: 'Mistake: Game B has higher EV because it can pay $10.' },
  { id: 'p8-wrong-identical', problemId: 'problem-8', description: 'said games are identical', input: { gameASimulated: true, gameBSimulated: true, evA: '5', evB: '5', higherRisk: 'Game A', reason: 'identical' } satisfies Problem8CheckInput, expectedCorrect: false, expectedMistakeType: 'identical-games', prdReason: 'Mistake: games are identical because EV is identical.' },
  { id: 'p8-wrong-avg-vs-guaranteed', problemId: 'problem-8', description: 'confused average with guaranteed result for A', input: { gameASimulated: true, gameBSimulated: true, evA: '10', evB: '5', higherRisk: 'Game B', reason: 'variable-outcomes' } satisfies Problem8CheckInput, expectedCorrect: false, expectedMistakeType: 'average-vs-guaranteed', prdReason: 'Mistake: confused average with guaranteed result.' },
  { id: 'p8-guard-not-simulated', problemId: 'problem-8', description: 'simulations not run', input: { gameASimulated: false, gameBSimulated: true, evA: '5', evB: '5', higherRisk: 'Game B', reason: 'variable-outcomes' } satisfies Problem8CheckInput, expectedCorrect: false, expectedMistakeType: '', prdReason: 'Guard: run 20 trials for each game (not a graded attempt).' },
]

// ---------------------------------------------------------------------------
// 5. Direct correction cases — a wrong graded answer followed by a corrected
//    resubmission must pass without any reset. Because the checker is pure,
//    resubmitting corrected input deterministically returns canComplete=true.
//    (The UI-level "stale feedback clears on edit" behaviour is asserted
//    structurally in problemBehaviorValidation.ts and via manual QA.)
// ---------------------------------------------------------------------------

export const directCorrectionCases: ValidationCase[] = [
  { id: 'p2-correction-step1-wrong', problemId: 'problem-2', description: 'reversed pair (graded wrong)', input: { slots: ['25%', '$20', '75%', '$0'], evAnswer: '5' } satisfies Problem2CheckInput, expectedCorrect: false, expectedMistakeType: 'reversed-outcome-probability', prdReason: 'First submit is a graded mistake.' },
  { id: 'p2-correction-step2-fixed', problemId: 'problem-2', description: 'corrected pairing resubmitted', input: { slots: ['$20', '25%', '$0', '75%'], evAnswer: '5' } satisfies Problem2CheckInput, expectedCorrect: true, prdReason: 'Correcting the answer and resubmitting passes — no reset required.' },
  { id: 'p5-correction-step1-wrong', problemId: 'problem-5', description: 'answered payout (graded wrong)', input: { formulaSelected: true, profitAnswer: '4' } satisfies Problem5CheckInput, expectedCorrect: false, expectedMistakeType: 'answered-payout', prdReason: 'First submit is a graded mistake.' },
  { id: 'p5-correction-step2-fixed', problemId: 'problem-5', description: 'corrected profit resubmitted', input: { formulaSelected: true, profitAnswer: '1' } satisfies Problem5CheckInput, expectedCorrect: true, prdReason: 'Correcting the answer and resubmitting passes — no reset required.' },
  { id: 'p7-correction-step1-wrong', problemId: 'problem-7', description: 'fair marked favorable (graded wrong)', input: { probabilities: ['1/10', '2/10', '7/10'], contributions: ['3', '2', '0'], expectedPayout: '5', expectedProfit: '0', decision: 'favorable' } satisfies Problem7CheckInput, expectedCorrect: false, expectedMistakeType: 'fair-marked-favorable', prdReason: 'First submit is a graded mistake.' },
  { id: 'p7-correction-step2-fixed', problemId: 'problem-7', description: 'corrected decision resubmitted', input: { probabilities: ['1/10', '2/10', '7/10'], contributions: ['3', '2', '0'], expectedPayout: '5', expectedProfit: '0', decision: 'fair' } satisfies Problem7CheckInput, expectedCorrect: true, prdReason: 'Correcting only the decision passes — no reset required.' },
]

// ---------------------------------------------------------------------------
// 6. Completion rule cases — each problem has at least one "incomplete guard"
//    state (must NOT complete, must NOT count as a graded attempt) and one
//    fully-correct state (must complete).
// ---------------------------------------------------------------------------

export const completionRuleCases: ValidationCase[] = [
  { id: 'p1-complete', problemId: 'problem-1', description: 'prediction + 100 spins + $5', input: { predictionSubmitted: true, totalSpins: 100, finalAnswer: 5 } satisfies Problem1CheckInput, expectedCorrect: true, prdReason: 'Completion: prediction, ≥100 spins, identify $5.' },
  { id: 'p1-incomplete', problemId: 'problem-1', description: 'spins below threshold', input: { predictionSubmitted: true, totalSpins: 99, finalAnswer: 5 } satisfies Problem1CheckInput, expectedCorrect: false, expectedMistakeType: '', prdReason: 'Completion blocked below 100 spins.' },
  { id: 'p3-complete', problemId: 'problem-3', description: 'all revealed + all cells correct', input: { allRevealed: true, rows: [{ outcome: 12, count: '1', probability: '1/6' }, { outcome: 6, count: '2', probability: '2/6' }, { outcome: 0, count: '3', probability: '3/6' }] } satisfies Problem3CheckInput, expectedCorrect: true, prdReason: 'Completion: reveal all boxes and complete all cells.' },
  { id: 'p3-incomplete', problemId: 'problem-3', description: 'not all revealed', input: { allRevealed: false, rows: [{ outcome: 12, count: '1', probability: '1/6' }, { outcome: 6, count: '2', probability: '2/6' }, { outcome: 0, count: '3', probability: '3/6' }] } satisfies Problem3CheckInput, expectedCorrect: false, expectedMistakeType: '', prdReason: 'Completion blocked until all boxes revealed.' },
  { id: 'p8-complete', problemId: 'problem-8', description: 'both sims + EVs + risk + reason', input: { gameASimulated: true, gameBSimulated: true, evA: '5', evB: '5', higherRisk: 'Game B', reason: 'variable-outcomes' } satisfies Problem8CheckInput, expectedCorrect: true, prdReason: 'Completion: both sims, EVs, higher-risk game, correct reason.' },
  { id: 'p8-incomplete', problemId: 'problem-8', description: 'game B not simulated', input: { gameASimulated: true, gameBSimulated: false, evA: '5', evB: '5', higherRisk: 'Game B', reason: 'variable-outcomes' } satisfies Problem8CheckInput, expectedCorrect: false, expectedMistakeType: '', prdReason: 'Completion blocked until both simulations run.' },
]

/** All checker-driven arrays (problemId is a real `problem-N`). */
export const allProblemCheckerCases: ValidationCase[] = [
  ...problemAnswerCases,
  ...directCorrectionCases,
  ...completionRuleCases,
]
