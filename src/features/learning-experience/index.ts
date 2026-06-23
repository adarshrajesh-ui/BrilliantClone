// Reusable learning-experience shell (Agent 2). Presentation only — no
// progression, persistence, attempt, or answer-checking logic lives here.

export { ProblemIntroDemo } from './ProblemIntroDemo'
export type { ProblemIntroDemoProps } from './ProblemIntroDemo'
export { DemoStep } from './DemoStep'
export { DemoProgress } from './DemoProgress'
export { InteractionCallout } from './InteractionCallout'
export { CurrentTaskPanel } from './CurrentTaskPanel'
export {
  ProblemStepChecklist,
  resolveStepStatuses,
  countDoneSteps,
} from './ProblemStepChecklist'
export { LearningCoachPanel } from './LearningCoachPanel'
export type { LearningCoachPanelProps } from './LearningCoachPanel'
export { InlineFieldStatus, toInlineStatus } from './InlineFieldStatus'
export { ReviewModeBanner } from './ReviewModeBanner'
export { RestartProblemAction } from './RestartProblemAction'
export { ShowDemoAgainAction } from './ShowDemoAgainAction'
export { ResponsiveProblemShell } from './ResponsiveProblemShell'

export { useDemoVisibility } from './useDemoVisibility'
export type { DemoVisibility } from './useDemoVisibility'
export { buildFallbackDemoSteps, fallbackDemoFromProblem } from './fallbackDemo'

export {
  demoNavReducer,
  canGoBack,
  canGoNext,
  isFirstStep,
  isLastStep,
} from './demoReducer'
export type { DemoNavState, DemoNavAction } from './demoReducer'

export {
  checkResultToCoachFeedback,
  coachToneForResult,
  humanizeMistakeType,
} from './feedbackModel'
export type { CoachFeedbackOptions } from './feedbackModel'

export {
  ANIM,
  animationClass,
  usePrefersReducedMotion,
  getPrefersReducedMotion,
} from './animations'
export type { AnimationName } from './animations'

export {
  CANONICAL_PROBLEM_SLUGS,
  SLUG_TO_LEGACY_ID,
  isCanonicalSlug,
  canonicalSlugIndex,
  legacyIdForSlug,
  slugForLegacyId,
  configKeyFor,
} from './slugContract'
export type { CanonicalProblemSlug } from './slugContract'

export type {
  DemoStepConfig,
  DemoConfig,
  ChecklistStepStatus,
  ChecklistStepView,
  CoachTone,
  CoachFeedback,
  InlineStatus,
} from './types'
