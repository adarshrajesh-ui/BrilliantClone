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

  // Whether this problem is recorded complete in chapter progress. Chapter
  // progress loads asynchronously, so we sync into local state below — otherwise
  // returning to a completed problem would render it as a fresh (restarted) run.
  const alreadyComplete = progress?.completedProblemIds.includes(problem.problemId) ?? false
  const [justCompleted, setJustCompleted] = useState(false)
  // Explicit, learner-initiated fresh practice attempt on a completed problem.
  const [restarted, setRestarted] = useState(false)
  const completed = alreadyComplete || justCompleted

  // Review-mode summary data (sourced from recorded attempts so it survives the
  // session being cleared on completion).
  const [finalAttemptCount, setFinalAttemptCount] = useState(0)
  const [lastSubmittedAnswer, setLastSubmittedAnswer] = useState<string | null>(null)
  const [reviewHintUsed, setReviewHintUsed] = useState(false)

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
      const finals = attempts.filter(
        (a) => a.problemId === problem.problemId && a.stepId === 'final',
      )
      const lastFinal = finals[finals.length - 1]
      setRevealedHintIds(session.revealedHintIds ?? [])
      setFinalAttemptCount(finals.length)
      setLastSubmittedAnswer(lastFinal ? lastFinal.submittedAnswer : null)
      setReviewHintUsed(
        attempts.some((a) => a.problemId === problem.problemId && a.hintUsed),
      )
      setAttemptNumber(countFinalAttempts(attempts, problem.problemId) + 1)
      setSessionLoaded(true)
    })()

    return () => {
      cancelled = true
    }
  }, [user, problem.problemId])

  useEffect(() => {
    // Don't persist session state for completed problems (review or restart);
    // completion is the source of truth and restart attempts are ephemeral.
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

      // Keep the review summary in sync with the latest final attempt so a
      // restart → re-complete cycle shows up-to-date info without a remount.
      if (stepId === 'final') {
        setFinalAttemptCount((c) => c + 1)
        setLastSubmittedAnswer(submittedAnswer)
        if (hintUsed) {
          setReviewHintUsed(true)
        }
      }
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
        setJustCompleted(true)
        // A finished restart attempt returns to review mode automatically.
        setRestarted(false)
        return true
      } finally {
        setSubmitting(false)
      }
    },
    [user, problem.problemId, reload],
  )

  // Explicit restart: make a completed problem interactive again for a fresh
  // practice attempt. Completion + chapter progress are preserved.
  const restart = useCallback(() => {
    setRestarted(true)
    setFeedback(null)
    lastSubmittedSignature.current = null
  }, [])

  // Return from a restart attempt back to the completed review view.
  const backToReview = useCallback(() => {
    setRestarted(false)
    setFeedback(null)
    lastSubmittedSignature.current = null
  }, [])

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
    restarted,
    restart,
    backToReview,
    finalAttemptCount,
    lastSubmittedAnswer,
    reviewHintUsed,
    submitting,
    hintUsed,
    handleCheck,
    finishIfComplete,
    recordAttempt,
    sessionLoaded,
  }
}
