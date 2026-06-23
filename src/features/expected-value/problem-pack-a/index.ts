// Expected Value — Problem Pack A (Problems 1–10).
//
// Self-contained problem pack owned by Agent 3. The five required exports below
// are the public contract Agent 1 wires into the central registry, routing, and
// session flow. Pack-local types and helpers are also re-exported for convenience.
//
// Required exports:
//   - problemPackA               (10 problem definitions, canonical order)
//   - problemPackAManifest        (wiring manifest: slug/storageId/indices/artifacts)
//   - problemPackACheckers        (canonical-slug -> deterministic checker)
//   - problemPackADemoConfigs     (canonical-slug -> pre-problem mini-demo)
//   - problemPackAValidationCases (replayable checker test cases)

export { problemPackA, getPackProblemBySlug, getPackProblemByStorageId } from './problems'
export {
  problemPackACheckers,
  problemPackACheckersByStorageId,
  isPackGradedAttempt,
  checkLongRunAverage,
  checkUnequalSpinner,
  checkShortRunVsLongRun,
  checkCompareSpinners,
  checkBuildWeightedAverage,
  checkMatchOutcomes,
  checkFillMissingFormula,
  checkDiagnoseBadSetups,
  checkMysteryBoxOutcomes,
  checkCalculateEvFromTable,
} from './checkers'
export {
  problemPackADemoConfigs,
  problemPackACurrentTaskConfigs,
} from './demoConfigs'
export {
  problemPackAManifest,
  legacyIdToCanonicalSlug,
  canonicalSlugToStorageId,
  getManifestEntry,
} from './manifest'
export {
  problemPackAValidationCases,
  getValidationCasesForSlug,
} from './validationCases'
export {
  initialStateFactories,
  reviewSerializers,
} from './state'
export {
  createSeededRandom,
  sampleSegment,
  simulateSpins,
  simulateFromOutcomes,
  extendSimulation,
  compactSeries,
  SPINNER_5050,
  SPINNER_2575,
} from './simulation'

export { composeWrongFeedback } from './types'

export type {
  CanonicalSlug,
  PackProblem,
  PackHint,
  PackMistakeRule,
  WrongFeedback,
  DemoConfig,
  DemoStep,
  CurrentTaskConfig,
  CurrentTaskStep,
  AnimationSpec,
  PlacementMeta,
  VisualGroup,
  FieldValidationMeta,
  PackManifestEntry,
  PackChecker,
  CheckResult,
  LongRunAverageInput,
  UnequalSpinnerInput,
  ShortRunVsLongRunInput,
  CompareSpinnersInput,
  BuildWeightedAverageInput,
  MatchOutcomesInput,
  FillMissingFormulaInput,
  DiagnoseBadSetupsInput,
  MysteryBoxInput,
  MysteryBoxRow,
  CalculateEvFromTableInput,
} from './types'
export type { ValidationCase } from './validationCases'
export type {
  ReviewSnapshot,
  LongRunAverageState,
  UnequalSpinnerState,
  ShortRunState,
  CompareSpinnersState,
  BuildWeightedState,
  MatchOutcomesState,
  FillFormulaState,
  DiagnoseState,
  MysteryBoxState,
  CalculateEvState,
} from './state'
export type { RandomSource, Segment, SimulationResult } from './simulation'
