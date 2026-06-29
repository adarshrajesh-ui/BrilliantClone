/**
 * How an attempt should be counted:
 * - `graded`: a first-pass graded submission.
 * - `corrected_resubmission`: a graded resubmission after a direct correction.
 * - `practice_restart`: a post-completion practice attempt; excluded from
 *   mastery penalties and never moves progression backward.
 * Attempts persisted before this field existed default to `graded` on read.
 */
export type AttemptMode = 'graded' | 'corrected_resubmission' | 'practice_restart'

/** Why the adaptive scheduler surfaced a practice question (see practiceThemes). */
export type PracticeSelectionReason =
  | 'due-review'
  | 'cousin'
  | 'weak-skill'
  | 'mixed'
  | 'new-skill'

/**
 * Lightweight, optional analytics payload attached to a Practice Mode attempt.
 * Primitive-typed on purpose so the persistence/types layer stays free of any
 * feature-module dependency; the metrics module narrows these as needed. Absent
 * on non-practice (chapter) attempts, so reading code must treat it as optional.
 */
export interface PracticeAttemptMeta {
  templateKind: string
  difficulty: number
  skillFamily: string
  selectionReason: PracticeSelectionReason
  isReview: boolean
  scaffoldTier: string
  hintCount: number
  wasSkipped: boolean
  /** ISO timestamp the question was shown (for time-on-task and review delay). */
  questionStartedAt: string
  /** ISO timestamp the graded answer was submitted. */
  answeredAt: string
}

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
  /** Present only on Practice Mode attempts; powers the practice metrics. */
  practice?: PracticeAttemptMeta
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

/** One row of a contribution-style worked solution (value × probability …). */
export interface WorkedSolutionRow {
  /** Row label, e.g. an outcome name or "Expected value". */
  label: string
  /** The arithmetic for this step, e.g. "$8 × 1/4". */
  expression: string
  /** Optional running/result value for the row, e.g. "$2". */
  value?: string
}

/**
 * Optional structured explanation attached to a graded result so the Learning
 * Coach can show a real concept recap + worked solution (correct) or a
 * misconception-aware repair (incorrect) instead of repeating the prompt.
 */
export interface CheckResultExplanation {
  /** Concept recap shown on a correct answer; never the raw prompt. */
  conceptSummary?: string
  /** Contribution rows shown after a correct answer. */
  workedSolution?: WorkedSolutionRow[]
  /** What the learner most likely did (wrong answers). */
  whatHappened?: string
  /** Why that approach is not right yet (wrong answers). */
  whyItMatters?: string
  /** The concrete next step to fix it (wrong answers). */
  repairStep?: string
}

export interface CheckResult {
  isCorrect: boolean
  mistakeType: string | null
  feedback: string
  canComplete: boolean
  /** Optional richer explanation used by generated practice feedback. */
  explanation?: CheckResultExplanation
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
