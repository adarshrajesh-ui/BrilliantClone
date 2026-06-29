import { useCallback, useMemo } from 'react'
import { ConfigurableSpinner, SPINNER_P2 } from '../visuals/ConfigurableSpinner'
import { RunningAverageGraph } from '../visuals/RunningAverageGraph'
import { PokerChipLoader } from '../PokerChipLoader'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { useProblemSession } from '../../hooks/useProblemSession'
import { usePersistedProblemState } from '../../hooks/usePersistedProblemState'
import type { DemoStepConfig, WorkspaceStepDef } from '../../features/learning-experience'
import './l1-workspace.css'
import { PROBLEM_EV_L1_P2, checkEvL1P2, evL1P2SpinOutcome } from '../../data/problems/ev-l1-p2'

const PREDICTIONS = [0, 5, 20]

const DEMO: DemoStepConfig[] = [
  { id: 'evl1p2-quarter', title: 'One quarter pays $20', body: 'The gold $20 section is one quarter of the wheel — a 25% chance.' },
  { id: 'evl1p2-rest', title: 'Three quarters pay $0', body: 'The gray $0 section fills the other three quarters — a 75% chance. Section size is probability.' },
  { id: 'evl1p2-settle', title: 'Watch the average', body: 'Spin many times. The running-average line settles toward the weighted average, not the biggest prize.' },
]
const DEMO_CTA = 'Predict the average, then run at least 100 spins to confirm.'

interface State {
  prediction: number | null
  predictionSubmitted: boolean
  seed: number
  totalSpins: number
  totalWinnings: number
  runningAverages: number[]
  rotation: number
  lastOutcome: number | null
  finalAnswer: string
  liveMessage: string
}

const DEFAULT: State = {
  prediction: null,
  predictionSubmitted: false,
  seed: 0,
  totalSpins: 0,
  totalWinnings: 0,
  runningAverages: [],
  rotation: 0,
  lastOutcome: null,
  finalAnswer: '',
  liveMessage: '',
}

function ensureSeed(seed: number): number {
  if (seed !== 0) return seed
  const candidate = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0
  return candidate === 0 ? 0x2c3d4e5f : candidate
}

export function EvL1P2UnequalSpinner() {
  const { state, setState, loaded, reset } = usePersistedProblemState<State>('ev-l1-p2', DEFAULT)
  const session = useProblemSession(PROBLEM_EV_L1_P2, state)

  const runSpins = useCallback(
    (count: number) => {
      setState((prev) => {
        if (!prev.predictionSubmitted) return prev
        const seed = ensureSeed(prev.seed)
        let spins = prev.totalSpins
        let winnings = prev.totalWinnings
        const avgs = [...prev.runningAverages]
        let last = prev.lastOutcome
        for (let i = 0; i < count; i += 1) {
          const outcome = evL1P2SpinOutcome(seed, spins)
          winnings += outcome
          spins += 1
          avgs.push(winnings / spins)
          last = outcome
        }
        const avg = winnings / spins
        return {
          ...prev,
          seed,
          totalSpins: spins,
          totalWinnings: winnings,
          runningAverages: avgs,
          rotation: prev.rotation + count * 53 + 360,
          lastOutcome: last,
          liveMessage: `Spun $${last}. Average after ${spins} spins: $${avg.toFixed(2)}.`,
        }
      })
    },
    [setState],
  )

  const average = state.totalSpins ? state.totalWinnings / state.totalSpins : 0
  const stats = useMemo(
    () => [
      { label: 'Spins', value: String(state.totalSpins) },
      { label: 'Total winnings', value: `$${state.totalWinnings}` },
      { label: 'Average per spin', value: `$${state.totalSpins ? average.toFixed(2) : '0.00'}` },
    ],
    [state.totalSpins, state.totalWinnings, average],
  )

  if (!loaded || !session.sessionLoaded) {
    return <PokerChipLoader label="Loading problem…" />
  }

  const steps: WorkspaceStepDef[] = [
    {
      id: 'predict',
      title: 'Predict the long-run average',
      prompt: 'Which average payout per spin do you expect?',
      canAdvance: state.predictionSubmitted,
      advanceHint: 'Submit a prediction to continue.',
      content: (
        <>
          <div className="ws-options">
            {PREDICTIONS.map((c) => (
              <button
                key={c}
                type="button"
                className={`choice-btn ws-option touch-target${state.prediction === c ? ' choice-btn-selected' : ''}`}
                aria-pressed={state.prediction === c}
                onClick={() => {
                  setState((p) => ({ ...p, prediction: c }))
                  session.clearFeedback()
                }}
                disabled={state.predictionSubmitted}
              >
                ${c}
              </button>
            ))}
          </div>
          {!state.predictionSubmitted ? (
            <button
              type="button"
              className="btn-secondary touch-target"
              onClick={() => {
                if (state.prediction === null) {
                  session.setFeedback({ isCorrect: false, mistakeType: null, feedback: 'Choose a prediction first.', canComplete: false })
                  return
                }
                setState((p) => ({ ...p, predictionSubmitted: true }))
                session.setFeedback({ isCorrect: false, mistakeType: null, feedback: 'Prediction locked in. Now spin many times and watch the average.', canComplete: false })
              }}
            >
              Submit prediction
            </button>
          ) : (
            <p className="step-done">Prediction submitted: ${state.prediction}</p>
          )}
        </>
      ),
    },
    {
      id: 'spin',
      title: 'Spin and observe',
      prompt: 'Spin many times and watch the average settle.',
      canAdvance: state.totalSpins >= 100,
      advanceHint: 'Run at least 100 spins to continue.',
      content: (
        <>
          <div className="l1-play">
            <div className="ws-visual">
              <ConfigurableSpinner segments={SPINNER_P2} rotation={state.rotation} spinning={false} lastOutcome={state.lastOutcome} />
            </div>
            <div className="l1-side">
              <ul className="stat-list">
                {stats.map((s) => (
                  <li key={s.label}>
                    <span>{s.label}</span>
                    <strong>{s.value}</strong>
                  </li>
                ))}
              </ul>
              <div className="spin-buttons">
                {[1, 10, 100].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="btn-secondary touch-target"
                    disabled={!state.predictionSubmitted}
                    onClick={() => runSpins(n)}
                  >
                    Spin {n === 1 ? 'once' : `${n} times`}
                  </button>
                ))}
              </div>
              {state.totalSpins < 100 && state.predictionSubmitted && (
                <p className="spin-requirement l1-mobile-gate-hint">Run at least 100 spins ({state.totalSpins}/100) to unlock Next.</p>
              )}
            </div>
            <div className="l1-graph">
              <RunningAverageGraph averages={state.runningAverages} target={5} maxY={20} showTarget={session.completed} />
            </div>
          </div>
          <p className="sr-only" aria-live="polite">{state.liveMessage}</p>
        </>
      ),
    },
    {
      id: 'identify',
      title: 'Identify the long-run average',
      prompt: 'What is the long-run average per spin?',
      action: (
        <button
          type="button"
          className="btn-secondary touch-target"
          disabled={state.totalSpins < 100 || session.submitting}
          onClick={() =>
            void session.handleCheck(
              checkEvL1P2({ predictionSubmitted: state.predictionSubmitted, totalSpins: state.totalSpins, finalAnswer: state.finalAnswer }),
              'final',
              state.finalAnswer,
              state.finalAnswer,
            )
          }
        >
          {session.submitting ? 'Saving…' : 'Submit answer'}
        </button>
      ),
      content: (
        <>
          <label className="ws-field field-label">
            Long-run average per spin
            <input
              type="text"
              className="touch-input"
              inputMode="decimal"
              value={state.finalAnswer}
              onChange={(e) => setState((p) => ({ ...p, finalAnswer: e.target.value }))}
              placeholder="Type your answer"
              disabled={state.totalSpins < 100}
            />
          </label>
        </>
      ),
    },
  ]

  return (
    <ProblemLayout
      problem={PROBLEM_EV_L1_P2}
      problemNumber={2}
      workspaceMinimalHeader
      feedback={session.feedback}
      completed={session.completed}
      justCompleted={session.justCompleted}
      streakResult={session.streakResult}
      revealedHintIds={session.revealedHintIds}
      onRevealHint={session.revealHint}
      nextProblemId="ev-l1-p3"
      restarted={session.restarted}
      onRestart={() => {
        reset()
        session.restart()
      }}
      onReview={session.backToReview}
      attemptCount={session.finalAttemptCount}
      lastSubmittedAnswer={session.lastSubmittedAnswer}
      reviewHintUsed={session.reviewHintUsed}
      demoSteps={DEMO}
      demoFinalCta={DEMO_CTA}
      completionMessage="You predicted, ran 100+ spins on the 25/75 spinner, and identified $5 as the long-run average."
      steps={steps}
      onStepChange={session.clearFeedback}
    />
  )
}
