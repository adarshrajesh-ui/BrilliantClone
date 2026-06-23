// Validation cases for Problem Pack A. Each case is a (slug, input, expectation)
// triple that the pack tests (and any later cross-pack runner) can replay against
// the deterministic checkers. Expectations assert either completion or a specific
// mistakeType, plus whether the case is a graded attempt.

import type { CanonicalSlug } from './types'

export interface ValidationCase {
  id: string
  slug: CanonicalSlug
  description: string
  /** Checker input (typed loosely so cases can live in data form). */
  input: Record<string, unknown>
  expect: {
    canComplete: boolean
    /** null = no specific mistake asserted; '' = guard (non-graded). */
    mistakeType: string | null
    /** Whether this counts as a graded attempt (correct or wrong-with-type). */
    graded: boolean
  }
}

export const problemPackAValidationCases: ValidationCase[] = [
  // --- l1-long-run-average -------------------------------------------------
  {
    id: 'l1-lra-correct',
    slug: 'l1-long-run-average',
    description: 'prediction + 120 spins + $5 -> complete',
    input: { predictionSubmitted: true, totalSpins: 120, finalAnswer: '$5.00' },
    expect: { canComplete: true, mistakeType: null, graded: true },
  },
  {
    id: 'l1-lra-extreme-0',
    slug: 'l1-long-run-average',
    description: '$0 chosen -> extreme outcome',
    input: { predictionSubmitted: true, totalSpins: 120, finalAnswer: '0' },
    expect: { canComplete: false, mistakeType: 'chose-extreme-outcome', graded: true },
  },
  {
    id: 'l1-lra-largest-10',
    slug: 'l1-long-run-average',
    description: '$10 chosen -> largest payout',
    input: { predictionSubmitted: true, totalSpins: 120, finalAnswer: '10' },
    expect: { canComplete: false, mistakeType: 'selected-largest-payout', graded: true },
  },
  {
    id: 'l1-lra-guard-spins',
    slug: 'l1-long-run-average',
    description: 'fewer than 100 spins -> guard (not graded)',
    input: { predictionSubmitted: true, totalSpins: 40, finalAnswer: '5' },
    expect: { canComplete: false, mistakeType: '', graded: false },
  },

  // --- l1-unequal-spinner --------------------------------------------------
  {
    id: 'l1-us-correct',
    slug: 'l1-unequal-spinner',
    description: '$5 after 100 spins -> complete',
    input: { predictionSubmitted: true, totalSpins: 100, finalAnswer: '5' },
    expect: { canComplete: true, mistakeType: null, graded: true },
  },
  {
    id: 'l1-us-largest',
    slug: 'l1-unequal-spinner',
    description: '$20 -> largest payout',
    input: { predictionSubmitted: true, totalSpins: 100, finalAnswer: '20' },
    expect: { canComplete: false, mistakeType: 'selected-largest-payout', graded: true },
  },
  {
    id: 'l1-us-misapplied',
    slug: 'l1-unequal-spinner',
    description: '0.8 (20/25) -> misapplied probability',
    input: { predictionSubmitted: true, totalSpins: 100, finalAnswer: '0.8' },
    expect: { canComplete: false, mistakeType: 'misapplied-probability', graded: true },
  },
  {
    id: 'l1-us-ignored',
    slug: 'l1-unequal-spinner',
    description: '15 -> ignored probability',
    input: { predictionSubmitted: true, totalSpins: 100, finalAnswer: '15' },
    expect: { canComplete: false, mistakeType: 'ignored-probability', graded: true },
  },

  // --- l1-short-run-vs-long-run -------------------------------------------
  {
    id: 'l1-srlr-correct',
    slug: 'l1-short-run-vs-long-run',
    description: 'both run, No + 500 -> complete',
    input: { shortRunSpins: 10, longRunSpins: 500, shortSampleMustEqualEV: 'No', strongerGraph: '500 spins' },
    expect: { canComplete: true, mistakeType: null, graded: true },
  },
  {
    id: 'l1-srlr-small-sample',
    slug: 'l1-short-run-vs-long-run',
    description: 'Yes to must-equal -> small-sample misconception',
    input: { shortRunSpins: 10, longRunSpins: 500, shortSampleMustEqualEV: 'Yes', strongerGraph: '500' },
    expect: { canComplete: false, mistakeType: 'small-sample-misconception', graded: true },
  },
  {
    id: 'l1-srlr-short-graph',
    slug: 'l1-short-run-vs-long-run',
    description: 'picks 10-spin graph -> selected-short-run-graph',
    input: { shortRunSpins: 10, longRunSpins: 500, shortSampleMustEqualEV: 'No', strongerGraph: '10 spins' },
    expect: { canComplete: false, mistakeType: 'selected-short-run-graph', graded: true },
  },
  {
    id: 'l1-srlr-guard',
    slug: 'l1-short-run-vs-long-run',
    description: 'short sample not run -> guard',
    input: { shortRunSpins: 0, longRunSpins: 0, shortSampleMustEqualEV: null, strongerGraph: null },
    expect: { canComplete: false, mistakeType: '', graded: false },
  },

  // --- l1-compare-spinners -------------------------------------------------
  {
    id: 'l1-cs-correct',
    slug: 'l1-compare-spinners',
    description: 'same + both-average-5 -> complete',
    input: { choice: 'same', explanation: 'both-average-5' },
    expect: { canComplete: true, mistakeType: null, graded: true },
  },
  {
    id: 'l1-cs-max-payout',
    slug: 'l1-compare-spinners',
    description: 'chose B -> maximum-payout misconception',
    input: { choice: 'b', explanation: null },
    expect: { canComplete: false, mistakeType: 'maximum-payout-misconception', graded: true },
  },
  {
    id: 'l1-cs-win-freq',
    slug: 'l1-compare-spinners',
    description: 'chose A -> win-frequency misconception',
    input: { choice: 'a', explanation: null },
    expect: { canComplete: false, mistakeType: 'win-frequency-misconception', graded: true },
  },

  // --- l2-build-weighted-average ------------------------------------------
  {
    id: 'l2-bwa-correct',
    slug: 'l2-build-weighted-average',
    description: 'correct pairs + EV 5 -> complete',
    input: { slots: ['$20', '25%', '$0', '75%'], evAnswer: '5' },
    expect: { canComplete: true, mistakeType: null, graded: true },
  },
  {
    id: 'l2-bwa-reversed',
    slug: 'l2-build-weighted-average',
    description: 'reversed types -> reversed-outcome-probability',
    input: { slots: ['25%', '$20', '75%', '$0'], evAnswer: '5' },
    expect: { canComplete: false, mistakeType: 'reversed-outcome-probability', graded: true },
  },
  {
    id: 'l2-bwa-largest',
    slug: 'l2-build-weighted-average',
    description: 'EV 20 -> used-largest-payout',
    input: { slots: ['$20', '25%', '$0', '75%'], evAnswer: '20' },
    expect: { canComplete: false, mistakeType: 'used-largest-payout', graded: true },
  },

  // --- l2-match-outcomes-probabilities ------------------------------------
  {
    id: 'l2-mop-correct',
    slug: 'l2-match-outcomes-probabilities',
    description: 'all three correct -> complete',
    input: { assignments: { '12': '1/3', '3': '1/2', '0': '1/6' } },
    expect: { canComplete: true, mistakeType: null, graded: true },
  },
  {
    id: 'l2-mop-ranked',
    slug: 'l2-match-outcomes-probabilities',
    description: '$12 with 1/2 -> ranked-by-size',
    input: { assignments: { '12': '1/2', '3': '1/3', '0': '1/6' } },
    expect: { canComplete: false, mistakeType: 'ranked-by-size', graded: true },
  },
  {
    id: 'l2-mop-omit-zero',
    slug: 'l2-match-outcomes-probabilities',
    description: '$0 unmatched -> omitted-zero-outcome',
    input: { assignments: { '12': '1/3', '3': '1/2', '0': null } },
    expect: { canComplete: false, mistakeType: 'omitted-zero-outcome', graded: true },
  },

  // --- l2-fill-missing-formula --------------------------------------------
  {
    id: 'l2-fmf-correct',
    slug: 'l2-fill-missing-formula',
    description: '10 + 0.5 + EV 6.5 -> complete',
    input: { outcomeSlot: '10', probabilitySlot: '0.5', evAnswer: '6.5' },
    expect: { canComplete: true, mistakeType: null, graded: true },
  },
  {
    id: 'l2-fmf-slot-type',
    slug: 'l2-fill-missing-formula',
    description: 'reversed slots -> slot-type-error',
    input: { outcomeSlot: '0.5', probabilitySlot: '10', evAnswer: '6.5' },
    expect: { canComplete: false, mistakeType: 'slot-type-error', graded: true },
  },
  {
    id: 'l2-fmf-unweighted',
    slug: 'l2-fill-missing-formula',
    description: 'EV 15 -> unweighted-sum',
    input: { outcomeSlot: '10', probabilitySlot: '0.5', evAnswer: '15' },
    expect: { canComplete: false, mistakeType: 'unweighted-sum', graded: true },
  },

  // --- l2-diagnose-bad-ev-setups ------------------------------------------
  {
    id: 'l2-dbs-correct',
    slug: 'l2-diagnose-bad-ev-setups',
    description: 'C + correct diagnoses -> complete',
    input: { validChoice: 'C', defectA: 'no probability weighting', defectB: 'omits zero outcome' },
    expect: { canComplete: true, mistakeType: null, graded: true },
  },
  {
    id: 'l2-dbs-chose-a',
    slug: 'l2-diagnose-bad-ev-setups',
    description: 'chose A -> summed-raw-payouts',
    input: { validChoice: 'A', defectA: null, defectB: null },
    expect: { canComplete: false, mistakeType: 'summed-raw-payouts', graded: true },
  },
  {
    id: 'l2-dbs-chose-b',
    slug: 'l2-diagnose-bad-ev-setups',
    description: 'chose B -> chose-incomplete-setup',
    input: { validChoice: 'B', defectA: null, defectB: null },
    expect: { canComplete: false, mistakeType: 'chose-incomplete-setup', graded: true },
  },

  // --- l3-mystery-box-outcomes --------------------------------------------
  {
    id: 'l3-mbo-correct',
    slug: 'l3-mystery-box-outcomes',
    description: 'all revealed + correct table -> complete',
    input: {
      allRevealed: true,
      rows: [
        { outcome: 12, count: '1', probability: '1/6' },
        { outcome: 6, count: '2', probability: '1/3' },
        { outcome: 0, count: '3', probability: '0.5' },
      ],
    },
    expect: { canComplete: true, mistakeType: null, graded: true },
  },
  {
    id: 'l3-mbo-counts-as-prob',
    slug: 'l3-mystery-box-outcomes',
    description: 'count typed as probability -> counts-as-probabilities',
    input: {
      allRevealed: true,
      rows: [
        { outcome: 12, count: '1', probability: '1/6' },
        { outcome: 6, count: '2', probability: '2' },
        { outcome: 0, count: '3', probability: '3/6' },
      ],
    },
    expect: { canComplete: false, mistakeType: 'counts-as-probabilities', graded: true },
  },
  {
    id: 'l3-mbo-wrong-denominator',
    slug: 'l3-mystery-box-outcomes',
    description: 'wrong denominator -> wrong-denominator',
    input: {
      allRevealed: true,
      rows: [
        { outcome: 12, count: '1', probability: '1/8' },
        { outcome: 6, count: '2', probability: '1/3' },
        { outcome: 0, count: '3', probability: '1/2' },
      ],
    },
    expect: { canComplete: false, mistakeType: 'wrong-denominator', graded: true },
  },
  {
    id: 'l3-mbo-omitted-zero',
    slug: 'l3-mystery-box-outcomes',
    description: '$0 row blank while others filled -> omitted-zero',
    input: {
      allRevealed: true,
      rows: [
        { outcome: 12, count: '1', probability: '1/6' },
        { outcome: 6, count: '2', probability: '1/3' },
        { outcome: 0, count: '', probability: '' },
      ],
    },
    expect: { canComplete: false, mistakeType: 'omitted-zero', graded: true },
  },

  // --- l3-calculate-ev-from-table -----------------------------------------
  {
    id: 'l3-cet-correct',
    slug: 'l3-calculate-ev-from-table',
    description: 'contributions 2,2,0 + EV 4 -> complete',
    input: { contributions: ['2', '2', '0'], evAnswer: '4' },
    expect: { canComplete: true, mistakeType: null, graded: true },
  },
  {
    id: 'l3-cet-unweighted',
    slug: 'l3-calculate-ev-from-table',
    description: 'raw payouts -> unweighted-sum',
    input: { contributions: ['12', '6', '0'], evAnswer: '18' },
    expect: { canComplete: false, mistakeType: 'unweighted-sum', graded: true },
  },
  {
    id: 'l3-cet-omitted-zero',
    slug: 'l3-calculate-ev-from-table',
    description: 'nonzero $0 row -> omitted-zero-row',
    input: { contributions: ['2', '2', '3'], evAnswer: '7' },
    expect: { canComplete: false, mistakeType: 'omitted-zero-row', graded: true },
  },
]

export function getValidationCasesForSlug(slug: CanonicalSlug): ValidationCase[] {
  return problemPackAValidationCases.filter((c) => c.slug === slug)
}
