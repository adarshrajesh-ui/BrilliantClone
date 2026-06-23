export interface ProblemAttempt {
  attemptId: string
  userId: string
  chapterId: string
  problemId: string
  stepId: string
  submittedAnswer: string
  normalizedAnswer: number | string
  isCorrect: boolean
  attemptNumber: number
  hintUsed: boolean
  mistakeType: string | null
  masteryTagsTested: string[]
  createdAt: string
}

export interface ProblemDefinition {
  problemId: string
  title: string
  concept: string
  difficulty: number
  scenarioText: string
  visualType: string
  interactionType: string
  masteryTags: string[]
}

export type Problem1Choice = 0 | 5 | 10

export interface Problem1CheckInput {
  predictionSubmitted: boolean
  totalSpins: number
  finalAnswer: Problem1Choice | null
}

export interface CheckResult {
  isCorrect: boolean
  mistakeType: string | null
  feedback: string
  canComplete: boolean
}
