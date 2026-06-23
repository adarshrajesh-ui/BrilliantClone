// Problem Pack B — Agent 4 (Expected Value Problems 11–20).
//
// Isolated module. Agent 1 performs central integration using the manifest.
//
// Required exports:
//   - problemPackB             : PackProblemDefinition[] (10 problems)
//   - problemPackBManifest      : integration manifest (storage IDs, indices, keys)
//   - problemPackBCheckers       : canonicalSlug → deterministic checker
//   - problemPackBDemoConfigs     : canonicalSlug → pre-problem mini-demo
//   - problemPackBValidationCases  : deterministic accept/reject cases

export { problemPackB, getPackProblemBySlug, getPackProblemByStorageId } from './problems'
export { problemPackBManifest } from './manifest'
export type { ProblemPackBManifest } from './manifest'
export {
  problemPackBCheckers,
  checkPackProblem,
  isGradedAttempt,
  evaluateExplanation,
  PACK_ANSWER_KEYS,
} from './checkers'
export { problemPackBDemoConfigs } from './demoConfigs'
export { problemPackBValidationCases } from './validationCases'

export {
  problemPackBInitialStateFactories,
  problemPackBReviewSerializers,
  serializeReview,
  summarizeSimulation,
  summarizeSeries,
} from './state'
export type { ReviewSnapshot, SimulationSummary } from './state'

export {
  createSeededRandom,
  simulateGame,
  expectedValue,
  variance,
  isSimulationComplete,
  SAME_EV_GAME_A,
  SAME_EV_GAME_B,
  LOW_HIGH_GAME_A,
  LOW_HIGH_GAME_B,
  SAME_EV_REQUIRED_TRIALS,
  LOW_HIGH_REQUIRED_TRIALS,
} from './simulation'
export type { RandomSource, GameOutcome, SimulationResult } from './simulation'

export type {
  PackProblemDefinition,
  PackCanonicalSlug,
  PackChecker,
  PackCheckInput,
  PackValidationCase,
  ManifestEntry,
  DemoConfig,
  CurrentTaskConfig,
  AnimationSpec,
  CheckResult,
} from './types'
