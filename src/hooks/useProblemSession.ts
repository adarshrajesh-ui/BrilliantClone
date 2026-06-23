import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from './useAuth'
import { useChapterData } from './useChapterData'
import { isGradedAttempt } from '../lib/answerChecker'
import { markProblemComplete } from '../lib/chapterProgressService'
import { syncMilestonesForCompletion } from '../lib/milestonesService'
import { evaluateMastery } from '../lib/masteryService'
import {
  countFinalAttempts,
  getChapterAttempts,
  recordProblemAttempt,
} from '../lib/problemAttemptService'
import {
  clearProblemSession,
  loadProblemSession,
  saveProblemSession,
} from '../lib/problemSessionService'
import type { CheckResult, ProblemDefinition } from '../types/problem'

export function useProblemSession(
  problem: ProblemDefinition,
  problemState?: Record<string, unknown> | object,
) {
  const { user } = useAuth()
  const { reload, progress } = useChapterData()
  const [revealedHintIds, setRevealedHintIds] = useState<string[]>([])
  const [feedback, setFeedback] = useState<CheckResult | null>(null)
  const [attemptNumber, setAttemptNumber] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [sessionLoaded, setSessionLoaded] = useState(false)

  const alreadyComplete = progress?.completedProblemIds.includes(problem.problemId) ?? false
  const [completed, setCompleted] = useState(alreadyComplete)

  useEffect(() => {
    if (!user) {
      setSessionLoaded(true)
      return
    }

    let cancelled = false
    void (async () => {
      const [session, attempts] = await Promise.all([
        loadProblemSession(user.uid, problem.problemId),
        getChapterAttempts(user.uid),
      ])
      if (cancelled) {
        return
      }
      setRevealedHintIds(session.revealedHintIds ?? [])
      setAttemptNumber(countFinalAttempts(attempts, problem.problemId) + 1)
      setSessionLoaded(true)
    })()

    return () => {
      cancelled = true
    }
  }, [user, problem.problemId])

  useEffect(() => {
    if (!user || !sessionLoaded || completed || !problemState) {
      return
    }
    void saveProblemSession(user.uid, problem.problemId, problemState as Record<string, unknown>, revealedHintIds)
  }, [user, problem.problemId, problemState, revealedHintIds, sessionLoaded, completed])

  const hintUsed = revealedHintIds.length > 0

  // Direct correction: when the learner edits their answer, clear the stale
  // feedback from the previous submit so the old mistake no longer lingers.
  const stateSignature = problemState ? JSON.stringify(problemState) : ''
  const lastSubmittedSignature = useRef<string | null>(null)
  useEffect(() => {
    if (!sessionLoaded) {
      return
    }
    if (lastSubmittedSignature.current === null) {
      return
    }
    if (stateSignature !== lastSubmittedSignature.current) {
      setFeedback(null)
      lastSubmittedSignature.current = null
    }
  }, [stateSignature, sessionLoaded])

  const clearFeedback = useCallback(() => {
    setFeedback(null)
    lastSubmittedSignature.current = null
  }, [])

  const revealHint = useCallback(
    (hintId: string) => {
      setRevealedHintIds((prev) => {
        const next = prev.includes(hintId) ? prev : [...prev, hintId]
        if (user && problemState) {
          void saveProblemSession(user.uid, problem.problemId, problemState as Record<string, unknown>, next)
        }
        return next
      })
    },
    [user, problem.problemId, problemState],
  )

  const recordAttempt = useCallback(
    async (
      result: CheckResult,
      stepId: string,
      submittedAnswer: string,
      normalizedAnswer: string | number,
    ) => {
      if (!user) {
        return
      }

      await recordProblemAttempt({
        userId: user.uid,
        chapterId: 'expected-value-intro',
        problemId: problem.problemId,
        stepId,
        submittedAnswer,
        normalizedAnswer,
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
        await evaluateMastery(user.uid)
        await clearProblemSession(user.uid, problem.problemId)
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
    async (
      result: CheckResult,
      stepId: string,
      submittedAnswer: string,
      normalizedAnswer: string | number = result.isCorrect ? 'correct' : result.mistakeType ?? 'incorrect',
    ) => {
      setFeedback(result)
      lastSubmittedSignature.current = stateSignature

      // Guard results (no mistakeType, not correct) mean the learner has not
      // finished entering an answer yet — e.g. "fill all fields" / "run 100 spins".
      // Those are not graded attempts, so we don't record them or inflate the
      // attempt count that mastery depends on.
      if (isGradedAttempt(result)) {
        await recordAttempt(result, stepId, submittedAnswer, normalizedAnswer)
      }

      if (result.canComplete) {
        await finishIfComplete(result)
      }
      return result
    },
    [recordAttempt, finishIfComplete, stateSignature],
  )

  return {
    revealedHintIds,
    revealHint,
    feedback,
    setFeedback,
    clearFeedback,
    completed,
    submitting,
    hintUsed,
    handleCheck,
    finishIfComplete,
    recordAttempt,
    sessionLoaded,
  }
}
