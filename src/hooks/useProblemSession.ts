import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from './useAuth'
import { useChapterData } from './useChapterData'
import { useStreak } from './useStreak'
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
import { beginPracticeRestart } from '../core/persistence/problemProgressService'
import { computeProblemSessionReady } from './problemSessionReady'
import type { CheckResult, ProblemDefinition } from '../types/problem'
import type { RecordActivityResult } from '../types/streak'

export function useProblemSession(
  problem: ProblemDefinition,
  problemState?: Record<string, unknown> | object,
) {
  const { user } = useAuth()
  const { reload, progress, loading: progressLoading } = useChapterData()
  const { recordActivity: recordStreakActivity } = useStreak()
  const [revealedHintIds, setRevealedHintIds] = useState<string[]>([])
  const [feedback, setFeedback] = useState<CheckResult | null>(null)
  const [attemptNumber, setAttemptNumber] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [sessionLoaded, setSessionLoaded] = useState(false)

  // Whether this problem is recorded complete in chapter progress. Chapter
  // progress loads asynchronously, so until it resolves we hold readiness (below)
  // — otherwise returning to a completed problem would briefly render it as a
  // fresh (restarted) run before flipping to review/retry.
  const alreadyComplete = progress?.completedProblemIds.includes(problem.problemId) ?? false
  const [justCompleted, setJustCompleted] = useState(false)
  // Explicit, learner-initiated fresh practice attempt on a completed problem.
  const [restarted, setRestarted] = useState(false)
  const completed = alreadyComplete || justCompleted

  // The problem page is only ready to render its interactive workspace once we
  // know whether this problem is already complete. This gates the loader that
  // every problem component shows on `!session.sessionLoaded`, so a completed
  // problem never flashes the active workspace before the review/retry view.
  const ready = computeProblemSessionReady({
    sessionLoaded,
    progressLoading,
    alreadyComplete,
    justCompleted,
  })

  // Review-mode summary data (sourced from recorded attempts so it survives the
  // session being cleared on completion).
  const [finalAttemptCount, setFinalAttemptCount] = useState(0)
  const [lastSubmittedAnswer, setLastSubmittedAnswer] = useState<string | null>(null)
  const [reviewHintUsed, setReviewHintUsed] = useState(false)

  // Streak delta from the completion that just happened (for celebration UIs).
  const [streakResult, setStreakResult] = useState<RecordActivityResult | null>(null)

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
    // Completion feedback must survive benign state syncs (e.g. reveal flags set
    // in the same click handler as handleCheck) until the learner navigates away.
    if (feedback?.canComplete === true) {
      return
    }
    if (stateSignature !== lastSubmittedSignature.current) {
      setFeedback(null)
      lastSubmittedSignature.current = null
    }
  }, [stateSignature, sessionLoaded, feedback?.canComplete])

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
        attemptMode: restarted ? 'practice_restart' : 'graded',
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
    [user, problem, attemptNumber, hintUsed, restarted],
  )

  const finishIfComplete = useCallback(
    async (result: CheckResult) => {
      if (!user || !result.canComplete) {
        return false
      }

      setSubmitting(true)
      try {
        const prog = await markProblemComplete(user.uid, problem.problemId)
        // A genuine learning event: completing a problem correctly is what drives
        // the daily streak (never app-open). Capture the delta so the completion
        // UI can celebrate an increment / milestone.
        const streak = await recordStreakActivity()
        setStreakResult(streak)
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
    [user, problem.problemId, reload, recordStreakActivity],
  )

  // Explicit restart: make a completed problem interactive again for a fresh
  // practice attempt. Completion + chapter progress are preserved.
  const restart = useCallback(() => {
    if (user) {
      void beginPracticeRestart(user.uid, problem.problemId)
    }
    setRestarted(true)
    setFeedback(null)
    lastSubmittedSignature.current = null
  }, [user, problem.problemId])

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
      if (stepId === 'final' && isGradedAttempt(result)) {
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
    justCompleted,
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
    // Gated readiness: the per-problem session has loaded AND completion status
    // is known (or already known complete / freshly completed). Problem
    // components key their loader off this to avoid the completed-problem flash.
    sessionLoaded: ready,
    // Streak delta from the latest completion (null until one happens this mount).
    streakResult,
  }
}
