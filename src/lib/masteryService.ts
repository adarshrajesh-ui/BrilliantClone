import { CHAPTER_PROBLEMS } from '../data/chapter'
import type { MasteryStatus } from '../types/chapter'
import {
  buildCorrectByProblemGraded,
  buildGradedFinalAttemptCounts,
  countFinalAttempts,
  getChapterAttempts,
} from './problemAttemptService'
import { getChapterProgress, saveProgressDirect } from './chapterProgressService'
import { syncMilestonesForCompletion, setChapterMastered } from './milestonesService'
import { deriveMasteryStatus, evaluateChapterMastery } from '../core/mastery/mastery'
import { uniqueCompletedCount } from '../core/progression/selectors'

export async function evaluateMastery(userId: string): Promise<{
  masteryStatus: MasteryStatus
  chapterMastered: boolean
}> {
  const progress = await getChapterProgress(userId)
  if (!progress) {
    return { masteryStatus: 'Not Started', chapterMastered: false }
  }

  const completedCount = uniqueCompletedCount(progress.completedProblemIds)
  if (completedCount === 0) {
    return { masteryStatus: 'Not Started', chapterMastered: false }
  }

  const attempts = await getChapterAttempts(userId)

  // Practice restarts are excluded by buildGradedFinalAttemptCounts /
  // buildCorrectByProblemGraded, so they never reduce earned mastery.
  const { mastered } = evaluateChapterMastery({
    completedProblemIds: progress.completedProblemIds,
    correctByProblem: buildCorrectByProblemGraded(attempts),
    gradedFinalAttemptsByProblem: buildGradedFinalAttemptCounts(attempts),
  })

  const masteryStatus = deriveMasteryStatus({ completedCount, mastered })

  if (progress.masteryStatus !== masteryStatus) {
    await saveProgressDirect({ ...progress, masteryStatus })
  }

  if (mastered) {
    await setChapterMastered(userId)
  } else {
    await syncMilestonesForCompletion(userId, completedCount)
  }

  return { masteryStatus, chapterMastered: mastered }
}

export interface ReviewSuggestion {
  problemId: string
  title: string
  reason: string
}

export async function getSuggestedReview(userId: string): Promise<ReviewSuggestion[]> {
  const progress = await getChapterProgress(userId)
  if (!progress) {
    return []
  }

  const attempts = await getChapterAttempts(userId)
  const suggestions: ReviewSuggestion[] = []

  for (const problem of CHAPTER_PROBLEMS) {
    const finals = countFinalAttempts(attempts, problem.problemId)
    const mistakes = attempts.filter(
      (a) => a.problemId === problem.problemId && a.mistakeType && a.stepId === 'final',
    )

    if (finals > 2) {
      suggestions.push({
        problemId: problem.problemId,
        title: problem.title,
        reason: `Took ${finals} tries to complete — review this concept.`,
      })
    } else if (mistakes.some((m) => m.hintUsed)) {
      suggestions.push({
        problemId: problem.problemId,
        title: problem.title,
        reason: 'Needed a hint — worth a quick review.',
      })
    } else if (
      problem.problemId === 'problem-5' &&
      mistakes.some((m) => m.mistakeType === 'answered-payout')
    ) {
      suggestions.push({
        problemId: problem.problemId,
        title: problem.title,
        reason: 'Review expected payout vs expected profit.',
      })
    } else if (
      problem.problemId === 'problem-3' &&
      mistakes.some((m) => m.mistakeType === 'counts-as-probabilities')
    ) {
      suggestions.push({
        problemId: problem.problemId,
        title: problem.title,
        reason: 'Review converting counts to probabilities.',
      })
    } else if (
      problem.problemId === 'problem-8' &&
      mistakes.some((m) => m.mistakeType === 'b-higher-ev' || m.mistakeType === 'identical-games')
    ) {
      suggestions.push({
        problemId: problem.problemId,
        title: problem.title,
        reason: 'Review same EV vs different risk.',
      })
    }
  }

  return suggestions.slice(0, 3)
}
