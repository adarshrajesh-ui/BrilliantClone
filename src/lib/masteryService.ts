import { CHAPTER_PROBLEMS } from '../data/chapter'
import type { MasteryStatus } from '../types/chapter'
import {
  countFinalAttempts,
  getChapterAttempts,
  wasProblemCompletedCorrectly,
} from './problemAttemptService'
import { getChapterProgress, saveProgressDirect } from './chapterProgressService'
import { syncMilestonesForCompletion, setChapterMastered } from './milestonesService'

const TOTAL = CHAPTER_PROBLEMS.length

export async function evaluateMastery(userId: string): Promise<{
  masteryStatus: MasteryStatus
  chapterMastered: boolean
}> {
  const progress = await getChapterProgress(userId)
  if (!progress) {
    return { masteryStatus: 'Not Started', chapterMastered: false }
  }

  const completedCount = progress.completedProblemIds.length

  if (completedCount === 0) {
    return { masteryStatus: 'Not Started', chapterMastered: false }
  }

  if (completedCount < TOTAL) {
    if (completedCount >= 4) {
      return { masteryStatus: 'Developing', chapterMastered: false }
    }
    return { masteryStatus: 'Learning', chapterMastered: false }
  }

  const attempts = await getChapterAttempts(userId)

  const p7Correct = wasProblemCompletedCorrectly(attempts, 'problem-7')
  const p8Correct = wasProblemCompletedCorrectly(attempts, 'problem-8')
  const p5Correct = wasProblemCompletedCorrectly(attempts, 'problem-5')

  let withinTwoAttempts = 0
  for (const problem of CHAPTER_PROBLEMS) {
    if (progress.completedProblemIds.includes(problem.problemId)) {
      if (countFinalAttempts(attempts, problem.problemId) <= 2) {
        withinTwoAttempts += 1
      }
    }
  }

  const chapterMastered =
    completedCount === TOTAL &&
    p7Correct &&
    p8Correct &&
    p5Correct &&
    withinTwoAttempts >= 6

  const masteryStatus: MasteryStatus = chapterMastered ? 'Mastered' : 'Developing'

  if (progress.masteryStatus !== masteryStatus) {
    await saveProgressDirect({ ...progress, masteryStatus })
  }

  if (chapterMastered) {
    await setChapterMastered(userId)
  } else {
    await syncMilestonesForCompletion(userId, completedCount)
  }

  return { masteryStatus, chapterMastered }
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
