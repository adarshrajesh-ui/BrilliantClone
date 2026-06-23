import { useCallback, useMemo } from 'react'
import { ConfigurableSpinner, SPINNER_P1, spinFromSegments } from '../visuals/ConfigurableSpinner'
import { RunningAverageGraph } from '../visuals/RunningAverageGraph'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { TaskGuide } from '../lesson/TaskGuide'
import { useProblemSession } from '../../hooks/useProblemSession'
import { usePersistedProblemState } from '../../hooks/usePersistedProblemState'
import { PROBLEM_1 } from '../../data/problems/problem-1'
import { checkProblem1Completion, checkProblem1Prediction } from '../../lib/answerChecker'
import type { Problem1Choice } from '../../types/problem'

const CHOICES: Problem1Choice[] = [0, 5, 10]

interface P1State {
  prediction: Problem1Choice | null
  predictionSubmitted: boolean
  finalAnswer: Problem1Choice | null
  totalSpins: number
  totalWinnings: number
  runningAverages: number[]
  rotation: number
  lastOutcome: number | null
}

const DEFAULT: P1State = {
  prediction: null,
  predictionSubmitted: false,
  finalAnswer: null,
  totalSpins: 0,
  totalWinnings: 0,
  runningAverages: [],
  rotation: 0,
  lastOutcome: null,
}

export function Problem1LongRunAverage() {
  const { state, setState, loaded, reset } = usePersistedProblemState<P1State>('problem-1', DEFAULT)
  const session = useProblemSession(PROBLEM_1, state)

  const runSpins = useCallback(
    async (count: number) => {
      if (!state.predictionSubmitted) return
      await new Promise((r) => setTimeout(r, 350))
      setState((prev) => {
        let spins = prev.totalSpins, winnings = prev.totalWinnings
        const avgs = [...prev.runningAverages]
        let last = prev.lastOutcome
        for (let i = 0; i < count; i += 1) {
          const o = spinFromSegments(SPINNER_P1)
          winnings += o; spins += 1; avgs.push(winnings / spins); last = o
        }
        return { ...prev, totalSpins: spins, totalWinnings: winnings, runningAverages: avgs, rotation: prev.rotation + count * 47 + 360, lastOutcome: last }
      })
    },
    [state.predictionSubmitted, setState],
  )

  const stats = useMemo(() => [
    { label: 'Total spins', value: String(state.totalSpins) },
    { label: 'Total winnings', value: `$${state.totalWinnings}` },
    { label: 'Average per spin', value: `$${state.totalSpins ? (state.totalWinnings / state.totalSpins).toFixed(2) : '0'}` },
  ], [state.totalSpins, state.totalWinnings])

  if (!loaded || !session.sessionLoaded) {
    return <div className="loading-screen"><div className="spinner" /><p>Loading problem…</p></div>
  }

  const currentTask = !state.predictionSubmitted
    ? 'First, predict the long-run average, then submit it.'
    : state.totalSpins < 100
      ? `Now spin at least 100 times (${state.totalSpins}/100).`
      : state.finalAnswer === null
        ? 'Watch where the average settles, then choose the long-run average.'
        : 'Submit your long-run average answer.'

  const taskGuide = (
    <TaskGuide
      currentTask={currentTask}
      steps={[
        { id: 'predict', label: 'Predict the long-run average', done: state.predictionSubmitted },
        { id: 'spin', label: 'Spin at least 100 times', done: state.totalSpins >= 100 },
        { id: 'identify', label: 'Identify the $5 long-run average', done: session.completed },
      ]}
    />
  )

  return (
    <ProblemLayout problem={PROBLEM_1} problemNumber={1} feedback={session.feedback} completed={session.completed}
      revealedHintIds={session.revealedHintIds} onRevealHint={session.revealHint} nextProblemId="problem-2"
      restarted={session.restarted} onRestart={() => { reset(); session.restart() }} onReview={session.backToReview}
      attemptCount={session.finalAttemptCount} lastSubmittedAnswer={session.lastSubmittedAnswer} reviewHintUsed={session.reviewHintUsed}
      taskGuide={taskGuide}
      completionMessage="You predicted, ran 100+ spins, and identified $5 as the long-run average.">
      <section className="card problem-section">
        <h2>Step 1 — Predict the long-run average</h2>
        <div className="choice-row">
          {CHOICES.map((c) => (
            <button key={c} type="button" className={`choice-btn touch-target${state.prediction === c ? ' choice-btn-selected' : ''}`}
              onClick={() => setState((p) => ({ ...p, prediction: c }))} disabled={state.predictionSubmitted}>${c}</button>
          ))}
        </div>
        {!state.predictionSubmitted && (
          <button type="button" className="btn-secondary touch-target" onClick={() => {
            if (state.prediction === null) { session.setFeedback({ isCorrect: false, mistakeType: null, feedback: 'Choose a prediction.', canComplete: false }); return }
            setState((p) => ({ ...p, predictionSubmitted: true }))
            session.setFeedback(checkProblem1Prediction(state.prediction, state.totalSpins))
          }}>Submit prediction</button>
        )}
        {state.predictionSubmitted && <p className="step-done">Prediction submitted: ${state.prediction}</p>}
      </section>
      <section className={`card problem-section${!state.predictionSubmitted ? ' section-disabled' : ''}`}>
        <h2>Step 2 — Spin and observe</h2>
        <div className="problem-visual-row">
          <ConfigurableSpinner segments={SPINNER_P1} rotation={state.rotation} spinning={false} lastOutcome={state.lastOutcome} />
          <div className="problem-side-panel">
            <ul className="stat-list">{stats.map((s) => <li key={s.label}><span>{s.label}</span><strong>{s.value}</strong></li>)}</ul>
            <div className="spin-buttons">
              {[1, 10, 100].map((n) => (
                <button key={n} type="button" className="btn-secondary touch-target" disabled={!state.predictionSubmitted}
                  onClick={() => void runSpins(n)}>Spin {n === 1 ? 'once' : `${n} times`}</button>
              ))}
            </div>
            {state.totalSpins < 100 && state.predictionSubmitted && <p className="spin-requirement">Run at least 100 spins ({state.totalSpins}/100).</p>}
          </div>
        </div>
        <RunningAverageGraph averages={state.runningAverages} target={5} />
      </section>
      <section className={`card problem-section${state.totalSpins < 100 ? ' section-disabled' : ''}`}>
        <h2>Step 3 — Identify the long-run average</h2>
        <div className="choice-row">
          {CHOICES.map((c) => (
            <button key={c} type="button" className={`choice-btn touch-target${state.finalAnswer === c ? ' choice-btn-selected' : ''}`}
              onClick={() => setState((p) => ({ ...p, finalAnswer: c }))} disabled={state.totalSpins < 100}>${c}</button>
          ))}
        </div>
        <button type="button" className="btn-secondary touch-target" disabled={state.totalSpins < 100 || state.finalAnswer === null || session.submitting}
          onClick={() => void session.handleCheck(
            checkProblem1Completion({ predictionSubmitted: state.predictionSubmitted, totalSpins: state.totalSpins, finalAnswer: state.finalAnswer }),
            'final', String(state.finalAnswer), state.finalAnswer ?? '',
          )}>{session.submitting ? 'Saving…' : 'Submit answer'}</button>
      </section>
    </ProblemLayout>
  )
}
