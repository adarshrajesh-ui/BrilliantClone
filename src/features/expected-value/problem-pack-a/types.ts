// Pack-local type definitions for Expected Value Problem Pack A (Problems 1–10).
//
// This pack is intentionally self-contained. It reuses the shared `CheckResult`
// shape so that Agent 1 can wire `problemPackACheckers` directly into the
// existing `useProblemSession` flow without any adapter. Everything else
// (extended problem metadata, demo configs, current-task configs, simulation,
// review serializers, restart-compatible initial state) lives inside the pack.

import type { CheckResult } from '../../../types/problem'

export type { CheckResult }

export const PACK_CHAPTER_ID = 'expected-value-intro' as const

/** Canonical slugs in canonical chapter order for Problems 1–10. */
export type CanonicalSlug =
  | 'l1-long-run-average'
  | 'l1-unequal-spinner'
  | 'l1-short-run-vs-long-run'
  | 'l1-compare-spinners'
  | 'l2-build-weighted-average'
  | 'l2-match-outcomes-probabilities'
  | 'l2-fill-missing-formula'
  | 'l2-diagnose-bad-ev-setups'
  | 'l3-mystery-box-outcomes'
  | 'l3-calculate-ev-from-table'

export interface PackHint {
  id: string
  label: string
  content: string
  visualType?: string
}

export interface PackMistakeRule {
  mistakeType: string
  feedback: string
}

/** Three-part wrong-answer feedback per the PRD (what / why / next). */
export interface WrongFeedback {
  whatHappened: string
  whyWrong: string
  nextAction: string
}

/** Compose a single deterministic feedback string from the 3-part structure. */
export function composeWrongFeedback(wf: WrongFeedback): string {
  return `${wf.whatHappened} ${wf.whyWrong} ${wf.nextAction}`.replace(/\s+/g, ' ').trim()
}

export interface DemoStep {
  id: string
  title: string
  body: string
  /** Optional id of the visual region the demo step should highlight. */
  highlight?: string
}

export interface DemoConfig {
  problemSlug: CanonicalSlug
  /** Interaction type the demo introduces (drives full demo vs short recap). */
  interactionType: string
  steps: DemoStep[]
  closingPrompt: string
  /**
   * Demos never count as an attempt / hint / completed action and never move
   * progress. This flag documents that contract for the demo renderer.
   */
  countsAsAttempt: false
}

export interface CurrentTaskStep {
  id: string
  label: string
}

export interface CurrentTaskConfig {
  /** "What am I looking at / what should I do first" summary. */
  intro: string
  steps: CurrentTaskStep[]
}

export interface AnimationSpec {
  id: string
  description: string
  /** Every animation must have an immediate-state alternative under reduced motion. */
  reducedMotionSafe: boolean
}

export interface PackProblem {
  // --- identity -----------------------------------------------------------
  canonicalSlug: CanonicalSlug
  /** Persisted id used for progress (problem-1.. for originals, slug for new). */
  storageId: string
  /** Present only for original problems whose persisted id must be preserved. */
  legacyProblemId?: string
  chapterId: typeof PACK_CHAPTER_ID
  lessonId: string
  /** 0-based lesson index within the chapter. */
  lessonIndex: number
  /** 0-based index within the lesson. */
  problemIndexWithinLesson: number
  /** 0-based index within this pack (0–9). */
  globalProblemIndex: number

  // --- content ------------------------------------------------------------
  title: string
  concept: string
  difficulty: number
  scenarioText: string
  visualType: string
  interactionType: string
  givenData: Record<string, unknown>
  requiredActions: string[]
  answerInputs: string[]
  correctAnswers: Record<string, unknown>
  acceptedFormats: Record<string, string[]>
  mistakeRules: PackMistakeRule[]
  /** Includes the `correct` key; other keys are mistakeType -> composed string. */
  feedback: Record<string, string>
  /** Structured 3-part wrong feedback by mistakeType (UI-friendly). */
  wrongFeedback: Record<string, WrongFeedback>
  hints: PackHint[]
  demoConfig: DemoConfig
  currentTaskConfig: CurrentTaskConfig
  completionRule: string
  masteryTags: string[]

  // --- visual / interaction metadata -------------------------------------
  /** Tap-first interaction metadata; drag is never required for correctness. */
  placement?: PlacementMeta
  /** Active-row / color-link visual grouping for table-style problems. */
  visualGroups?: VisualGroup[]
  /** Per-field inline validation metadata. */
  fieldValidation?: Record<string, FieldValidationMeta>
  animations: AnimationSpec[]
}

export interface PlacementMeta {
  tapToSelect: true
  tapToPlace: true
  dragOptional: boolean
  canClear: boolean
  canReplace: boolean
  /** A single wrong placement must not clear correct placements. */
  wrongPlacementClearsOthers: false
}

export interface VisualGroup {
  /** e.g. an outcome value, used to tie a table row to its visual tokens. */
  key: string
  label: string
  /** Stable color token name (correctness must never rely on color alone). */
  colorToken: string
  /** Indices of the visual items (boxes/sections) that belong to this group. */
  itemIndices: number[]
}

export interface FieldValidationMeta {
  kind: 'money' | 'numeric' | 'probability' | 'classification' | 'choice'
  /** Tolerance used for equivalence (probability/numeric), where relevant. */
  tolerance?: number
}

// ---------------------------------------------------------------------------
// Checker input types
// ---------------------------------------------------------------------------

export interface LongRunAverageInput {
  predictionSubmitted: boolean
  totalSpins: number
  finalAnswer: string | number | null
}

export interface UnequalSpinnerInput {
  predictionSubmitted: boolean
  totalSpins: number
  finalAnswer: string | number | null
}

export interface ShortRunVsLongRunInput {
  shortRunSpins: number
  longRunSpins: number
  /** "Must 10 spins average exactly $5?" — expect a "no"-style answer. */
  shortSampleMustEqualEV: string | null
  /** Which graph is stronger evidence — expect the 500-spin / long-run choice. */
  strongerGraph: string | null
}

export interface CompareSpinnersInput {
  /** 'a' | 'b' | 'same' */
  choice: string | null
  /** explanation multiple-choice id, expected 'both-average-5' */
  explanation: string | null
}

export interface BuildWeightedAverageInput {
  slots: [string, string, string, string]
  evAnswer: string
}

export interface MatchOutcomesInput {
  /** keyed by outcome value as string ('12','3','0') -> probability card value. */
  assignments: Record<string, string | null>
}

export interface FillMissingFormulaInput {
  /** outcome slot before "× 0.4" — expected 10. */
  outcomeSlot: string | null
  /** probability slot after "5 ×" — expected 0.5. */
  probabilitySlot: string | null
  /** optional contribution chips (4, 2.5, 0) once placement is correct. */
  contributions?: [string, string, string]
  evAnswer: string
}

export interface DiagnoseBadSetupsInput {
  /** 'A' | 'B' | 'C' — the valid setup. */
  validChoice: string | null
  /** diagnosis id for setup A. */
  defectA: string | null
  /** diagnosis id for setup B. */
  defectB: string | null
}

export interface MysteryBoxRow {
  outcome: number
  count: string
  probability: string
}

export interface MysteryBoxInput {
  allRevealed: boolean
  rows: MysteryBoxRow[]
}

export interface CalculateEvFromTableInput {
  contributions: [string, string, string]
  evAnswer: string
}

export type PackChecker = (input: never) => CheckResult

export interface PackManifestEntry {
  canonicalSlug: CanonicalSlug
  storageId: string
  legacyProblemId?: string
  lessonId: string
  lessonIndex: number
  problemIndexWithinLesson: number
  globalProblemIndex: number
  isNew: boolean
  /** Names of the exported artifacts for this problem (for Agent 1 wiring). */
  checkerKey: CanonicalSlug
  demoConfigKey: CanonicalSlug
  initialStateFactoryKey: CanonicalSlug
  reviewSerializerKey: CanonicalSlug
  validationCaseKey: CanonicalSlug
  visualType: string
  interactionType: string
  masteryTags: string[]
}
