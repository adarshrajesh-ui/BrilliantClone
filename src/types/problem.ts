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
  hints: ProblemHint[]
  completionRule: string
  masteryTags: string[]
}

export interface CheckResult {
  isCorrect: boolean
  mistakeType: string | null
  feedback: string
  canComplete: boolean
}

export type Problem1Choice = 0 | 5 | 10

export interface Problem1CheckInput {
  predictionSubmitted: boolean
  totalSpins: number
  finalAnswer: Problem1Choice | null
}

export interface Problem2CheckInput {
  slots: [string, string, string, string]
  evAnswer: string
}

export interface Problem3CheckInput {
  allRevealed: boolean
  rows: Array<{ outcome: number; count: string; probability: string }>
}

export interface Problem4CheckInput {
  contributions: [string, string, string]
  evAnswer: string
}

export interface Problem5CheckInput {
  formulaSelected: boolean
  profitAnswer: string
}

export interface Problem6CheckInput {
  assignments: Record<string, string>
}

export interface Problem7CheckInput {
  probabilities: [string, string, string]
  contributions: [string, string, string]
  expectedPayout: string
  expectedProfit: string
  decision: string
}

export interface Problem8CheckInput {
  gameASimulated: boolean
  gameBSimulated: boolean
  evA: string
  evB: string
  higherRisk: string
  reason: string
}

export type ProblemCheckInput =
  | Problem1CheckInput
  | Problem2CheckInput
  | Problem3CheckInput
  | Problem4CheckInput
  | Problem5CheckInput
  | Problem6CheckInput
  | Problem7CheckInput
  | Problem8CheckInput
