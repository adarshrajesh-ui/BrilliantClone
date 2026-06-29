export type SkillId =
  | 'long-run-average'
  | 'sampling-variation'
  | 'weighted-average'
  | 'outcome-probability-pairing'
  | 'compare-ev'
  | 'complete-ev-model'
  | 'probability-from-counts'
  | 'ev-from-table'
  | 'payout-vs-profit'
  | 'fairness-classification'
  | 'compare-expected-profit'
  | 'same-ev-different-risk'
  | 'risk-spread'
  | 'full-ev-model'

export interface WorkedSolutionRow {
  label: string
  expression: string
  value?: string
}

export interface CheckResultExplanation {
  conceptSummary?: string
  workedSolution?: WorkedSolutionRow[]
  whatHappened?: string
  whyItMatters?: string
  repairStep?: string
}

export interface CheckResult {
  isCorrect: boolean
  mistakeType: string | null
  feedback: string
  canComplete: boolean
  explanation?: CheckResultExplanation
}
