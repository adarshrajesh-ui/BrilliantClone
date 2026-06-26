import type { ProblemAttempt } from '../../types/problem'

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

export interface SkillDefinition {
  skillId: SkillId
  label: string
  domain: 'foundations' | 'discrete-models' | 'game-economics' | 'risk-integration'
  level: 1 | 2 | 3
  prerequisites: SkillId[]
}

export interface SkillState {
  skillId: SkillId
  score: number
  evidenceCount: number
  lastPracticedAt: string | null
  nextReviewAt: string
  consecutiveCorrect: number
  recentMistakeTypes: string[]
}

export interface PracticeCandidate {
  problemId: string
  canonicalSlug: string
  title: string
  concept: string
  difficulty: number
  globalProblemIndex: number
  lessonId: string
  skillIds: SkillId[]
}

export interface PracticeRecommendation extends PracticeCandidate {
  primarySkillId: SkillId
  score: number
  reason: string
  dueReview: boolean
  targetDifficulty: number
}

export interface AdaptiveSnapshot {
  attempts: ProblemAttempt[]
  completedProblemIds: string[]
  skillStates: Record<SkillId, SkillState>
}
