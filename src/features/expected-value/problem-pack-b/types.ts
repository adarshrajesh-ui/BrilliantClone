// Problem Pack B — Agent 4 (Problems 11–20).
// Isolated type surface for the pack. Imports the shared ProblemDefinition shape
// (read-only) so pack definitions stay assignable to the central problem model,
// then layers on the lesson/demo/animation/review metadata the PRD requires.

import type { CheckResult, ProblemDefinition } from '../../../types/problem'

export type { CheckResult }

// ---------------------------------------------------------------------------
// Canonical slugs and storage IDs
// ---------------------------------------------------------------------------

export type PackCanonicalSlug =
  | 'l3-repair-probability-table'
  | 'l3-prize-bag-ev-table'
  | 'l4-payout-vs-profit'
  | 'l4-fair-favorable-unfavorable'
  | 'l4-find-fair-price'
  | 'l4-choose-better-game-after-cost'
  | 'l5-build-whole-ev-model'
  | 'l5-same-ev-different-risk'
  | 'l5-low-risk-vs-high-risk'
  | 'l5-final-capstone-ev-decision'

// ---------------------------------------------------------------------------
// Demo + task + animation metadata (PRD problem object fields not present on the
// shared ProblemDefinition yet — Agent 1 can lift these into the central type).
// ---------------------------------------------------------------------------

export interface DemoStep {
  id: string
  title: string
  body: string
  /** Optional highlight key the visual layer can use to spotlight a region. */
  highlight?: string
}

export interface DemoConfig {
  canonicalSlug: PackCanonicalSlug
  /** Full demo when a new interaction type is introduced; recap otherwise. */
  kind: 'full' | 'recap'
  steps: DemoStep[]
  /** Final prompt shown on the last demo step. */
  closingPrompt: string
}

export interface ChecklistItem {
  id: string
  label: string
}

export interface CurrentTaskConfig {
  /** What am I looking at? */
  intro: string
  /** What should I tap or enter first? */
  firstStep: string
  /** What remains before completion? */
  checklist: ChecklistItem[]
}

export interface AnimationSpec {
  id: string
  /** Short description of the teaching motion. */
  describe: string
  /** Immediate-state alternative used under reduced-motion. */
  reducedMotion: string
}

// ---------------------------------------------------------------------------
// Pack problem definition
// ---------------------------------------------------------------------------

export interface PackProblemDefinition extends ProblemDefinition {
  /** Stable, lesson-aware identity. */
  canonicalSlug: PackCanonicalSlug
  /** The Firestore/registry storage ID (preserved for original problems). */
  storageId: string
  /** Legacy ID for migration compatibility (same as storageId for originals). */
  legacyProblemId?: string
  lessonId: string
  /** 0-based lesson index within the chapter. */
  lessonIndex: number
  /** 0-based index within the lesson. */
  problemIndexWithinLesson: number
  /** 0-based index within the whole chapter (Problems 11–20 → indices 10–19). */
  globalProblemIndex: number
  demoConfig: DemoConfig
  currentTaskConfig: CurrentTaskConfig
  animations: AnimationSpec[]
  /** Key into problemPackBCheckers. */
  checkerKey: PackCanonicalSlug
}

// ---------------------------------------------------------------------------
// Per-problem checker inputs
// ---------------------------------------------------------------------------

export interface TableRowInput {
  outcome: number
  count: string
  probability: string
}

/** 11 — l3-repair-probability-table */
export interface RepairTableInput {
  rows: TableRowInput[]
}

export interface EvTableRowInput {
  outcome: number
  count: string
  probability: string
  contribution: string
}

/** 12 — l3-prize-bag-ev-table */
export interface PrizeBagInput {
  rows: EvTableRowInput[]
  evAnswer: string
}

/** 13 — l4-payout-vs-profit */
export interface PayoutVsProfitInput {
  formulaSelected: boolean
  profitAnswer: string
}

/** 14 — l4-fair-favorable-unfavorable */
export interface FairnessSortInput {
  assignments: Record<string, string>
}

/** 15 — l4-find-fair-price */
export interface FindFairPriceInput {
  expectedPayout: string
  fairCost: string
  expectedProfit: string
  classification: string
}

/** 16 — l4-choose-better-game-after-cost */
export interface ChooseBetterGameInput {
  profitA: string
  profitB: string
  betterGame: string
}

/** 17 — l5-build-whole-ev-model */
export interface WholeEvModelInput {
  probabilities: string[]
  contributions: string[]
  expectedPayout: string
  expectedProfit: string
  decision: string
}

/** 18 — l5-same-ev-different-risk */
export interface SameEvDifferentRiskInput {
  gameASimulated: boolean
  gameBSimulated: boolean
  evA: string
  evB: string
  higherRisk: string
  reason: string
}

/** 19 — l5-low-risk-vs-high-risk */
export interface LowVsHighRiskInput {
  gameASimulated: boolean
  gameBSimulated: boolean
  evA: string
  evB: string
  higherRisk: string
  reason: string
}

/** 20 — l5-final-capstone-ev-decision */
export interface CapstoneInput {
  probabilities: string[]
  contributions: string[]
  expectedPayout: string
  expectedProfit: string
  decision: string
  riskExplanation: string
}

export type PackCheckInput =
  | RepairTableInput
  | PrizeBagInput
  | PayoutVsProfitInput
  | FairnessSortInput
  | FindFairPriceInput
  | ChooseBetterGameInput
  | WholeEvModelInput
  | SameEvDifferentRiskInput
  | LowVsHighRiskInput
  | CapstoneInput

export type PackChecker = (input: PackCheckInput) => CheckResult

// ---------------------------------------------------------------------------
// Manifest + validation types
// ---------------------------------------------------------------------------

export interface ManifestEntry {
  canonicalSlug: PackCanonicalSlug
  storageId: string
  legacyProblemId?: string
  /** True for the four pre-existing problems whose progress must be preserved. */
  isOriginal: boolean
  lessonId: string
  lessonIndex: number
  problemIndexWithinLesson: number
  globalProblemIndex: number
  /** PRD problem number (11–20). */
  prdProblemNumber: number
  checkerKey: PackCanonicalSlug
  /** Export keys Agent 1 wires into the central shell. */
  visualType: string
  interactionType: string
  demoConfigKey: PackCanonicalSlug
  initialStateFactoryKey: PackCanonicalSlug
  reviewSerializerKey: PackCanonicalSlug
  masteryTags: string[]
  acceptedFormats: Record<string, string[]>
  knownMistakeTypes: string[]
  completionRule: string
}

export interface PackValidationCase {
  id: string
  canonicalSlug: PackCanonicalSlug
  description: string
  input: PackCheckInput
  /** Whether the checker should accept (canComplete). */
  expectedCorrect: boolean
  /**
   * Expected mistakeType for graded-wrong answers. `''` marks an incomplete
   * guard that must NOT count as a graded attempt. `undefined` = not asserted.
   */
  expectedMistakeType?: string
  prdReason: string
}
