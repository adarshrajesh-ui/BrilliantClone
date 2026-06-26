import { buildPracticeCandidates } from '../core/adaptive/problemIndex'
import { deriveSkillStates } from '../core/adaptive/masteryModel'
import { selectPracticeRecommendations } from '../core/adaptive/selector'
import type { AdaptiveSnapshot, PracticeRecommendation } from '../core/adaptive/types'
import type { ChapterProgress } from '../types/chapter'
import { getChapterAttempts } from './problemAttemptService'

export async function buildAdaptiveSnapshot(
  userId: string,
  progress: ChapterProgress | null,
): Promise<AdaptiveSnapshot> {
  const attempts = await getChapterAttempts(userId)
  return {
    attempts,
    completedProblemIds: progress?.completedProblemIds ?? [],
    skillStates: deriveSkillStates(attempts),
  }
}

export async function getAdaptivePracticePlan(args: {
  userId: string
  progress: ChapterProgress | null
  limit?: number
}): Promise<PracticeRecommendation[]> {
  const snapshot = await buildAdaptiveSnapshot(args.userId, args.progress)
  return selectPracticeRecommendations(snapshot, {
    candidates: buildPracticeCandidates(),
    limit: args.limit ?? 3,
  })
}
