/**
 * How an attempt should be counted:
 * - `graded`: a first-pass graded submission.
 * - `corrected_resubmission`: a graded resubmission after a direct correction.
 * - `practice_restart`: a post-completion practice attempt; excluded from
 *   mastery penalties and never moves progression backward.
 * Attempts persisted before this field existed default to `graded` on read.
 */
export type AttemptMode = 'graded' | 'corrected_resubmission' | 'practice_restart'

export interface ProblemAttempt {
  attemptId: string
  userId: string
  chapterId: string
  problemId: string
  stepId: string
  submittedAnswer: string
  normalizedAnswer: number | string | Record<string, unknown>
  isCorrect: boolean
  attemptNumber: number
  /** Optional for backward compatibility; defaults to `graded` when absent. */
  attemptMode?: AttemptMode
  hintUsed: boolean
  mistakeType: string | null
  masteryTagsTested: string[]
  createdAt: string
}

export interface ProblemHint {
  id: string
  label: string
  content: string
  visualType?: string
}

export interface MistakeRule {
  mistakeType: string
  feedback: string
}

/** Hand-written post-completion teaching copy shown after a correct answer. */
export interface TeachingExplanation {
  /** Section heading, e.g. "Why this makes sense". */
  title: string
  /** One or more paragraphs of intuition-building explanation. */
  body: string[]
  /** Optional one-line concept the learner should remember. */
  takeaway?: string
}

export interface ProblemDefinition {
  problemId: string
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
  mistakeRules: MistakeRule[]
  feedback: Record<string, string>
  /** Rich teaching explanation shown on correct completion (not the raw answer). */
  teachingExplanation?: TeachingExplanation
  hints: ProblemHint[]
  completionRule: string
  masteryTags: string[]
  /** Canonical slug (`ev-l{N}-p{M}`); optional metadata mirrored from the model. */
  canonicalSlug?: string
  /** Prior canonical slug for backward-compatible references. */
  legacyProblemId?: string
  /** PRD workspace layout hints (descriptive metadata). */
  desktopWorkspaceLayout?: string
  mobileWorkspaceLayout?: string
}

export interface CheckResult {
  isCorrect: boolean
  mistakeType: string | null
  feedback: string
  canComplete: boolean
}

// CheckInput shapes for the three checkers that still live in
// `src/lib/answerChecker.ts` (problem-3/4/6). The other twelve problems define
// their CheckInput types co-located with their component/checker files.
export interface Problem3CheckInput {
  allRevealed: boolean
  rows: Array<{ outcome: number; count: string; probability: string }>
}

export interface Problem4CheckInput {
  contributions: [string, string, string]
  evAnswer: string
}

export interface Problem6CheckInput {
  assignments: Record<string, string>
}
