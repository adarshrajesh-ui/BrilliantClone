// Restart-compatible initial-state factories and compact review serializers.
//
// Initial-state factories return a *fresh* object every call, so "Restart This
// Problem" gets a clean practice session without mutating any prior state.
// Review serializers produce a compact snapshot that can reconstruct the
// completed learning view (including a down-sampled graph series for sims).

import { compactSeries } from './simulation'
import type { CanonicalSlug } from './types'

// ---------------------------------------------------------------------------
// Initial state shapes (also the persisted session-state shapes)
// ---------------------------------------------------------------------------

export interface LongRunAverageState {
  prediction: number | null
  predictionSubmitted: boolean
  finalAnswer: string | null
  totalSpins: number
  totalWinnings: number
  runningAverages: number[]
  lastOutcome: number | null
}

export interface UnequalSpinnerState extends LongRunAverageState {}

export interface ShortRunState {
  shortRunSpins: number
  shortRunAverages: number[]
  longRunSpins: number
  longRunAverages: number[]
  shortSampleMustEqualEV: string | null
  strongerGraph: string | null
}

export interface CompareSpinnersState {
  choice: string | null
  explanation: string | null
}

export interface BuildWeightedState {
  slots: [string, string, string, string]
  evAnswer: string
}

export interface MatchOutcomesState {
  assignments: Record<string, string | null>
}

export interface FillFormulaState {
  outcomeSlot: string | null
  probabilitySlot: string | null
  evAnswer: string
}

export interface DiagnoseState {
  validChoice: string | null
  defectA: string | null
  defectB: string | null
}

export interface MysteryBoxState {
  revealed: boolean[]
  rows: { outcome: number; count: string; probability: string }[]
}

export interface CalculateEvState {
  contributions: [string, string, string]
  evAnswer: string
}

// ---------------------------------------------------------------------------
// Initial-state factories
// ---------------------------------------------------------------------------

const emptySpinState = (): LongRunAverageState => ({
  prediction: null,
  predictionSubmitted: false,
  finalAnswer: null,
  totalSpins: 0,
  totalWinnings: 0,
  runningAverages: [],
  lastOutcome: null,
})

export const initialStateFactories = {
  'l1-long-run-average': (): LongRunAverageState => emptySpinState(),
  'l1-unequal-spinner': (): UnequalSpinnerState => emptySpinState(),
  'l1-short-run-vs-long-run': (): ShortRunState => ({
    shortRunSpins: 0,
    shortRunAverages: [],
    longRunSpins: 0,
    longRunAverages: [],
    shortSampleMustEqualEV: null,
    strongerGraph: null,
  }),
  'l1-compare-spinners': (): CompareSpinnersState => ({ choice: null, explanation: null }),
  'l2-build-weighted-average': (): BuildWeightedState => ({ slots: ['', '', '', ''], evAnswer: '' }),
  'l2-match-outcomes-probabilities': (): MatchOutcomesState => ({
    assignments: { '12': null, '3': null, '0': null },
  }),
  'l2-fill-missing-formula': (): FillFormulaState => ({
    outcomeSlot: null,
    probabilitySlot: null,
    evAnswer: '',
  }),
  'l2-diagnose-bad-ev-setups': (): DiagnoseState => ({
    validChoice: null,
    defectA: null,
    defectB: null,
  }),
  'l3-mystery-box-outcomes': (): MysteryBoxState => ({
    revealed: [false, false, false, false, false, false],
    rows: [
      { outcome: 12, count: '', probability: '' },
      { outcome: 6, count: '', probability: '' },
      { outcome: 0, count: '', probability: '' },
    ],
  }),
  'l3-calculate-ev-from-table': (): CalculateEvState => ({ contributions: ['', '', ''], evAnswer: '' }),
} as const

// ---------------------------------------------------------------------------
// Review serializers — compact snapshots for the completed-problem review view
// ---------------------------------------------------------------------------

export interface ReviewSnapshot {
  slug: CanonicalSlug
  summary: Record<string, unknown>
}

export const reviewSerializers = {
  'l1-long-run-average': (s: LongRunAverageState): ReviewSnapshot => ({
    slug: 'l1-long-run-average',
    summary: {
      prediction: s.prediction,
      totalSpins: s.totalSpins,
      observedAverage: s.totalSpins ? Number((s.totalWinnings / s.totalSpins).toFixed(2)) : 0,
      finalAnswer: s.finalAnswer,
      graph: compactSeries(s.runningAverages),
    },
  }),
  'l1-unequal-spinner': (s: UnequalSpinnerState): ReviewSnapshot => ({
    slug: 'l1-unequal-spinner',
    summary: {
      prediction: s.prediction,
      totalSpins: s.totalSpins,
      observedAverage: s.totalSpins ? Number((s.totalWinnings / s.totalSpins).toFixed(2)) : 0,
      finalAnswer: s.finalAnswer,
      graph: compactSeries(s.runningAverages),
    },
  }),
  'l1-short-run-vs-long-run': (s: ShortRunState): ReviewSnapshot => ({
    slug: 'l1-short-run-vs-long-run',
    summary: {
      shortRunSpins: s.shortRunSpins,
      longRunSpins: s.longRunSpins,
      shortGraph: compactSeries(s.shortRunAverages, 20),
      longGraph: compactSeries(s.longRunAverages),
      shortSampleMustEqualEV: s.shortSampleMustEqualEV,
      strongerGraph: s.strongerGraph,
    },
  }),
  'l1-compare-spinners': (s: CompareSpinnersState): ReviewSnapshot => ({
    slug: 'l1-compare-spinners',
    summary: { choice: s.choice, explanation: s.explanation },
  }),
  'l2-build-weighted-average': (s: BuildWeightedState): ReviewSnapshot => ({
    slug: 'l2-build-weighted-average',
    summary: { slots: s.slots, evAnswer: s.evAnswer },
  }),
  'l2-match-outcomes-probabilities': (s: MatchOutcomesState): ReviewSnapshot => ({
    slug: 'l2-match-outcomes-probabilities',
    summary: { assignments: { ...s.assignments } },
  }),
  'l2-fill-missing-formula': (s: FillFormulaState): ReviewSnapshot => ({
    slug: 'l2-fill-missing-formula',
    summary: { outcomeSlot: s.outcomeSlot, probabilitySlot: s.probabilitySlot, evAnswer: s.evAnswer },
  }),
  'l2-diagnose-bad-ev-setups': (s: DiagnoseState): ReviewSnapshot => ({
    slug: 'l2-diagnose-bad-ev-setups',
    summary: { validChoice: s.validChoice, defectA: s.defectA, defectB: s.defectB },
  }),
  'l3-mystery-box-outcomes': (s: MysteryBoxState): ReviewSnapshot => ({
    slug: 'l3-mystery-box-outcomes',
    summary: { revealed: [...s.revealed], rows: s.rows.map((r) => ({ ...r })) },
  }),
  'l3-calculate-ev-from-table': (s: CalculateEvState): ReviewSnapshot => ({
    slug: 'l3-calculate-ev-from-table',
    summary: { contributions: s.contributions, evAnswer: s.evAnswer },
  }),
} as const
