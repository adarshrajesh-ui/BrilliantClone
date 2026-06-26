import type { ProblemAttempt } from '../../types/problem'
import { isGradedAttemptMode } from '../persistence/migration'
import { getSkillDefinition } from './skillCatalog'
import { isReviewDue, targetDifficultyForScore } from './scheduler'
import type {
  AdaptiveSnapshot,
  PracticeCandidate,
  PracticeRecommendation,
  SkillId,
  SkillState,
} from './types'

export interface SelectionOptions {
  nowIso?: string
  limit?: number
  candidates: PracticeCandidate[]
}

function latestAttemptByProblem(attempts: readonly ProblemAttempt[]): Record<string, string> {
  const latest: Record<string, string> = {}
  for (const attempt of attempts) {
    const current = latest[attempt.problemId]
    if (!current || new Date(attempt.createdAt).getTime() > new Date(current).getTime()) {
      latest[attempt.problemId] = attempt.createdAt
    }
  }
  return latest
}

function recentlySeenPenalty(lastSeenAt: string | undefined, nowIso: string): number {
  if (!lastSeenAt) {
    return 0
  }
  const hoursAgo =
    (new Date(nowIso).getTime() - new Date(lastSeenAt).getTime()) / (60 * 60 * 1000)
  if (hoursAgo < 1) {
    return 3
  }
  if (hoursAgo < 24) {
    return 1.5
  }
  return 0
}

function prerequisiteReadiness(
  skillId: SkillId,
  skillStates: Record<SkillId, SkillState>,
): number {
  const prerequisites = getSkillDefinition(skillId).prerequisites
  if (prerequisites.length === 0) {
    return 1
  }
  const readyCount = prerequisites.filter((id) => skillStates[id].score >= 0.45).length
  return readyCount / prerequisites.length
}

function primarySkillForCandidate(
  candidate: PracticeCandidate,
  skillStates: Record<SkillId, SkillState>,
): SkillId {
  return [...candidate.skillIds].sort((a, b) => {
    const scoreDelta = skillStates[a].score - skillStates[b].score
    if (scoreDelta !== 0) {
      return scoreDelta
    }
    return getSkillDefinition(a).level - getSkillDefinition(b).level
  })[0]
}

function reasonForRecommendation(args: {
  skillState: SkillState
  dueReview: boolean
  targetDifficulty: number
}): string {
  if (args.dueReview && args.skillState.evidenceCount > 0) {
    return 'Due for spaced review'
  }
  if (args.skillState.score < 0.45) {
    return 'Strengthens a weak skill'
  }
  return `Good match for difficulty ${args.targetDifficulty}`
}

export function selectPracticeRecommendations(
  snapshot: AdaptiveSnapshot,
  options: SelectionOptions,
): PracticeRecommendation[] {
  const nowIso = options.nowIso ?? new Date().toISOString()
  const limit = options.limit ?? 3
  const lastSeen = latestAttemptByProblem(snapshot.attempts)
  const hasSkillEvidence = Object.values(snapshot.skillStates).some(
    (state) => state.evidenceCount > 0,
  )

  if (!hasSkillEvidence) {
    return [...options.candidates]
      .sort((a, b) => a.globalProblemIndex - b.globalProblemIndex || a.problemId.localeCompare(b.problemId))
      .slice(0, limit)
      .map((candidate) => {
        const primarySkillId = primarySkillForCandidate(candidate, snapshot.skillStates)
        const targetDifficulty = targetDifficultyForScore(snapshot.skillStates[primarySkillId].score)
        return {
          ...candidate,
          primarySkillId,
          score: Number((10 - candidate.globalProblemIndex * 0.01).toFixed(3)),
          reason: 'Good first practice item',
          dueReview: false,
          targetDifficulty,
        }
      })
  }

  return options.candidates
    .map((candidate): PracticeRecommendation => {
      const primarySkillId = primarySkillForCandidate(candidate, snapshot.skillStates)
      const skillState = snapshot.skillStates[primarySkillId]
      const dueReview = skillState.evidenceCount > 0 && isReviewDue(skillState.nextReviewAt, nowIso)
      const targetDifficulty = targetDifficultyForScore(skillState.score)
      const gradedAttemptsForProblem = snapshot.attempts.filter(
        (attempt) =>
          attempt.problemId === candidate.problemId &&
          attempt.stepId === 'final' &&
          isGradedAttemptMode(attempt.attemptMode),
      ).length
      const score =
        (dueReview ? 6 : 0) +
        (1 - skillState.score) * 5 +
        prerequisiteReadiness(primarySkillId, snapshot.skillStates) * 2 -
        Math.abs(candidate.difficulty - targetDifficulty) * 0.8 -
        recentlySeenPenalty(lastSeen[candidate.problemId], nowIso) -
        gradedAttemptsForProblem * 0.15

      return {
        ...candidate,
        primarySkillId,
        score: Number(score.toFixed(3)),
        reason: reasonForRecommendation({ skillState, dueReview, targetDifficulty }),
        dueReview,
        targetDifficulty,
      }
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }
      if (a.globalProblemIndex !== b.globalProblemIndex) {
        return a.globalProblemIndex - b.globalProblemIndex
      }
      return a.problemId.localeCompare(b.problemId)
    })
    .slice(0, limit)
}
