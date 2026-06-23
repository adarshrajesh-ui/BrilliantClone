import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SpinnerWheel } from '../visuals/SpinnerWheel'
import { RunningAverageGraph } from '../visuals/RunningAverageGraph'
import { useAuth } from '../../hooks/useAuth'
import { useChapterData } from '../../hooks/useChapterData'
import { PROBLEM_1 } from '../../data/problems/problem-1'
import {
  checkProblem1Completion,
  checkProblem1Prediction,
} from '../../lib/answerChecker'
import { markProblemComplete } from '../../lib/chapterProgressService'
import { syncMilestonesForCompletion } from '../../lib/milestonesService'
import { recordProblemAttempt } from '../../lib/problemAttemptService'
import type { Problem1Choice } from '../../types/problem'

const CHAPTER_PATH = '/chapter/expected-value-intro'
const CHOICES: Problem1Choice[] = [0, 5, 10]

function spinOutcome(): Problem1Choice {
  return Math.random() < 0.5 ? 10 : 0
}

function formatMoney(value: number) {
  return `$${value}`
}

export function Problem1LongRunAverage() {
  const { user } = useAuth()
  const { reload } = useChapterData()

  const [prediction, setPrediction] = useState<Problem1Choice | null>(null)
  const [predictionSubmitted, setPredictionSubmitted] = useState(false)
  const [finalAnswer, setFinalAnswer] = useState<Problem1Choice | null>(null)

  const [totalSpins, setTotalSpins] = useState(0)
  const [totalWinnings, setTotalWinnings] = useState(0)
  const [runningAverages, setRunningAverages] = useState<number[]>([])
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [lastOutcome, setLastOutcome] = useState<number | null>(null)

  const [feedback, setFeedback] = useState<string | null>(null)
  const [feedbackType, setFeedbackType] = useState<'info' | 'success' | 'error'>('info')
  const [completed, setCompleted] = useState(false)
  const [attemptNumber, setAttemptNumber] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  const averagePerSpin = totalSpins > 0 ? totalWinnings / totalSpins : 0

  const runSpins = useCallback(
    async (count: number) => {
      if (!predictionSubmitted || spinning) {
        return
      }

      setSpinning(true)
      await new Promise((resolve) => setTimeout(resolve, 350))

      let spins = totalSpins
      let winnings = totalWinnings
      const newAverages = [...runningAverages]
      let last = lastOutcome

      for (let i = 0; i < count; i += 1) {
        const outcome = spinOutcome()
        winnings += outcome
        spins += 1
        newAverages.push(winnings / spins)
        last = outcome
      }

      setTotalSpins(spins)
      setTotalWinnings(winnings)
      setRunningAverages(newAverages)
      setRotation((prev) => prev + count * 47 + 360)
      setLastOutcome(last)
      setSpinning(false)
    },
    [predictionSubmitted, spinning, totalSpins, totalWinnings, runningAverages, lastOutcome],
  )

  const handleSubmitPrediction = useCallback(() => {
    if (prediction === null) {
      setFeedback('Choose a prediction before submitting.')
      setFeedbackType('error')
      return
    }

    const result = checkProblem1Prediction(prediction, totalSpins)
    setPredictionSubmitted(true)
    setFeedback(result.feedback)
    setFeedbackType(result.isCorrect ? 'success' : 'info')
  }, [prediction, totalSpins])

  const handleSubmitFinal = useCallback(async () => {
    if (!user) {
      return
    }

    const result = checkProblem1Completion({
      predictionSubmitted,
      totalSpins,
      finalAnswer,
    })

    setFeedback(result.feedback)
    setFeedbackType(result.isCorrect ? 'success' : 'error')

    await recordProblemAttempt({
      userId: user.uid,
      chapterId: 'expected-value-intro',
      problemId: PROBLEM_1.problemId,
      stepId: 'final-answer',
      submittedAnswer: finalAnswer !== null ? String(finalAnswer) : '',
      normalizedAnswer: finalAnswer ?? '',
      isCorrect: result.isCorrect,
      attemptNumber,
      hintUsed: false,
      mistakeType: result.mistakeType,
      masteryTagsTested: PROBLEM_1.masteryTags,
    })

    setAttemptNumber((n) => n + 1)

    if (!result.canComplete) {
      return
    }

    setSubmitting(true)
    try {
      const progress = await markProblemComplete(user.uid, PROBLEM_1.problemId)
      await syncMilestonesForCompletion(user.uid, progress.completedProblemIds.length)
      await reload()
      setCompleted(true)
    } finally {
      setSubmitting(false)
    }
  }, [
    user,
    predictionSubmitted,
    totalSpins,
    finalAnswer,
    attemptNumber,
    reload,
  ])

  const canSpin = predictionSubmitted && !spinning && !completed
  const canSubmitFinal = predictionSubmitted && totalSpins >= 100 && !completed

  const stats = useMemo(
    () => [
      { label: 'Total spins', value: String(totalSpins) },
      { label: 'Total winnings', value: formatMoney(totalWinnings) },
      { label: 'Average per spin', value: formatMoney(Number(averagePerSpin.toFixed(2))) },
    ],
    [totalSpins, totalWinnings, averagePerSpin],
  )

  return (
    <div className="page problem-page">
      <nav className="problem-nav">
        <Link to={CHAPTER_PATH}>← Back to chapter</Link>
      </nav>

      <header className="problem-header">
        <p className="chapter-eyebrow">Problem 1 of 8</p>
        <h1>{PROBLEM_1.title}</h1>
        <p className="problem-concept">{PROBLEM_1.concept}</p>
        <p>{PROBLEM_1.scenarioText}</p>
      </header>

      {completed ? (
        <section className="card feedback-success">
          <h2>Problem complete!</h2>
          <p>
            You predicted, ran {totalSpins} spins, and identified $5 as the long-run average.
            Equal chance of $10 and $0 averages halfway between them.
          </p>
          <div className="placeholder-actions">
            <Link to={`${CHAPTER_PATH}/problem/problem-2`} className="btn-secondary">
              Next problem
            </Link>
            <Link to={CHAPTER_PATH} className="btn-text-link">
              Back to chapter
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="card problem-section">
            <h2>Step 1 — Predict the long-run average</h2>
            <p className="section-note">
              Before spinning, what do you think the average winnings per spin will be over many
              spins?
            </p>
            <div className="choice-row" role="group" aria-label="Prediction choices">
              {CHOICES.map((choice) => (
                <button
                  key={`pred-${choice}`}
                  type="button"
                  className={`choice-btn${prediction === choice ? ' choice-btn-selected' : ''}`}
                  onClick={() => setPrediction(choice)}
                  disabled={predictionSubmitted}
                >
                  {formatMoney(choice)}
                </button>
              ))}
            </div>
            {!predictionSubmitted && (
              <button type="button" className="btn-secondary" onClick={handleSubmitPrediction}>
                Submit prediction
              </button>
            )}
            {predictionSubmitted && (
              <p className="step-done">Prediction submitted: {formatMoney(prediction ?? 0)}</p>
            )}
          </section>

          <section className={`card problem-section${!predictionSubmitted ? ' section-disabled' : ''}`}>
            <h2>Step 2 — Spin and observe</h2>
            <div className="problem-visual-row">
              <SpinnerWheel rotation={rotation} spinning={spinning} lastOutcome={lastOutcome} />
              <div className="problem-side-panel">
                <ul className="stat-list">
                  {stats.map((stat) => (
                    <li key={stat.label}>
                      <span>{stat.label}</span>
                      <strong>{stat.value}</strong>
                    </li>
                  ))}
                </ul>
                <div className="spin-buttons">
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={!canSpin}
                    onClick={() => void runSpins(1)}
                  >
                    Spin once
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={!canSpin}
                    onClick={() => void runSpins(10)}
                  >
                    Spin 10 times
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={!canSpin}
                    onClick={() => void runSpins(100)}
                  >
                    Spin 100 times
                  </button>
                </div>
                {totalSpins < 100 && predictionSubmitted && (
                  <p className="spin-requirement">
                    Run at least 100 total spins ({totalSpins}/100).
                  </p>
                )}
              </div>
            </div>
            <RunningAverageGraph averages={runningAverages} />
          </section>

          <section className={`card problem-section${!canSubmitFinal ? ' section-disabled' : ''}`}>
            <h2>Step 3 — Identify the long-run average</h2>
            <p className="section-note">
              Based on your spins, what is the long-run average per spin?
            </p>
            <div className="choice-row" role="group" aria-label="Final answer choices">
              {CHOICES.map((choice) => (
                <button
                  key={`final-${choice}`}
                  type="button"
                  className={`choice-btn${finalAnswer === choice ? ' choice-btn-selected' : ''}`}
                  onClick={() => setFinalAnswer(choice)}
                  disabled={!canSubmitFinal}
                >
                  {formatMoney(choice)}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn-secondary"
              disabled={!canSubmitFinal || finalAnswer === null || submitting}
              onClick={() => void handleSubmitFinal()}
            >
              {submitting ? 'Saving…' : 'Submit answer'}
            </button>
          </section>
        </>
      )}

      {feedback && !completed && (
        <section
          className={`card feedback-panel feedback-${feedbackType}`}
          role="status"
          aria-live="polite"
        >
          {feedback}
        </section>
      )}
    </div>
  )
}
