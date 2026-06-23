import { useCallback, useState } from 'react'
import { useAuth } from './useAuth'
import { useChapterData } from './useChapterData'
import { markProblemComplete } from '../lib/chapterProgressService'
import { syncMilestonesForCompletion } from '../lib/milestonesService'
import { recordProblemAttempt } from '../lib/problemAttemptService'
import type { CheckResult, ProblemDefinition } from '../types/problem'

export function useProblemSession(problem: ProblemDefinition) {
  const { user } = useAuth()
  const { reload, progress } = useChapterData()
  const [revealedHintIds, setRevealedHintIds] = useState<string[]>([])
  const [feedback, setFeedback] = useState<CheckResult | null>(null)
  const [attemptNumber, setAttemptNumber] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  const alreadyComplete = progress?.completedProblemIds.includes(problem.problemId) ?? false
  const [completed, setCompleted] = useState(alreadyComplete)

  const hintUsed = revealedHintIds.length > 0

  const revealHint = useCallback((hintId: string) => {
    setRevealedHintIds((prev) => (prev.includes(hintId) ? prev : [...prev, hintId]))
  }, [])

  const recordAttempt = useCallback(
    async (result: CheckResult, stepId: string, submittedAnswer: string) => {
      if (!user) {
        return
      }

      await recordProblemAttempt({
        userId: user.uid,
        chapterId: 'expected-value-intro',
        problemId: problem.problemId,
        stepId,
        submittedAnswer,
        normalizedAnswer: result.isCorrect ? 'correct' : result.mistakeType ?? 'incorrect',
        isCorrect: result.isCorrect,
        attemptNumber,
        hintUsed,
        mistakeType: result.mistakeType,
        masteryTagsTested: problem.masteryTags,
      })

      setAttemptNumber((n) => n + 1)
    },
    [user, problem, attemptNumber, hintUsed],
  )

  const finishIfComplete = useCallback(
    async (result: CheckResult) => {
      if (!user || !result.canComplete) {
        return false
      }

      setSubmitting(true)
      try {
        const prog = await markProblemComplete(user.uid, problem.problemId)
        await syncMilestonesForCompletion(user.uid, prog.completedProblemIds.length)
        await reload()
        setCompleted(true)
        return true
      } finally {
        setSubmitting(false)
      }
    },
    [user, problem.problemId, reload],
  )

  const handleCheck = useCallback(
    async (result: CheckResult, stepId: string, submittedAnswer: string) => {
      setFeedback(result)
      await recordAttempt(result, stepId, submittedAnswer)
      if (result.canComplete) {
        await finishIfComplete(result)
      }
      return result
    },
    [recordAttempt, finishIfComplete],
  )

  return {
    revealedHintIds,
    revealHint,
    feedback,
    setFeedback,
    completed,
    submitting,
    hintUsed,
    handleCheck,
    finishIfComplete,
    recordAttempt,
  }
}
