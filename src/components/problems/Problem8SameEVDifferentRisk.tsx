import { useCallback } from 'react'
import { RiskComparisonGraph } from '../visuals/RiskComparisonGraph'
import { PokerChipLoader } from '../PokerChipLoader'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { useProblemSession } from '../../hooks/useProblemSession'
import { usePersistedProblemState } from '../../hooks/usePersistedProblemState'
import { QuestionPrompt } from '../../features/learning-experience'
import type { WorkspaceStepDef } from '../../features/learning-experience'
import { PROBLEM_8, checkWiderSpread } from '../../data/problems/problem-8'
import { constantGame, runDeterministicBatch, type DiscreteOutcome } from '../../lib/simulation'
import './lesson5.css'

const TRIALS = 20
const GAME_A = constantGame(6)
const GAME_B: DiscreteOutcome[] = [
  { value: 12, probability: 0.5 },
  { value: 0, probability: 0.5 },
]

const EXPLANATIONS = [
  { value: 'wider-spread', label: 'Game B has a wider spread of outcomes ($0–$12)' },
  { value: 'variable-outcomes', label: 'Game B’s outcomes vary while Game A is fixed' },
  { value: 'can-be-0-or-12', label: 'Game B can land on $0 or $12 on any play' },
  { value: 'higher-ev', label: 'Game B has a higher expected value' },
  { value: 'identical', label: 'The two games are identical' },
]

interface P8State {
  gameARuns: number
  gameBRuns: number
  gameASimulated: boolean
  gameBSimulated: boolean
  gameAAverages: number[]
  gameBAverages: number[]
  evA: string
  evB: string
  higherRisk: string
  reason: string
}

const DEFAULT: P8State = {
  gameARuns: 0,
  gameBRuns: 0,
  gameASimulated: false,
  gameBSimulated: false,
  gameAAverages: [],
  gameBAverages: [],
  evA: '',
  evB: '',
  higherRisk: '',
  reason: '',
}

export function Problem8SameEVDifferentRisk() {
  const { state, setState, loaded, reset } = usePersistedProblemState<P8State>('problem-8', DEFAULT)
  const session = useProblemSession(PROBLEM_8, state)

  const runA = useCallback(() => {
    setState((p) => {
      const runIndex = p.gameARuns + 1
      const sim = runDeterministicBatch(GAME_A, TRIALS, `problem-8-gameA-${runIndex}`)
      return { ...p, gameARuns: runIndex, gameASimulated: true, gameAAverages: sim.runningAverage }
    })
  }, [setState])

  const runB = useCallback(() => {
    setState((p) => {
      const runIndex = p.gameBRuns + 1
      const sim = runDeterministicBatch(GAME_B, TRIALS, `problem-8-gameB-${runIndex}`)
      return { ...p, gameBRuns: runIndex, gameBSimulated: true, gameBAverages: sim.runningAverage }
    })
  }, [setState])

  if (!loaded || !session.sessionLoaded) {
    return <PokerChipLoader label="Loading…" />
  }

  const bothSimulated = state.gameASimulated && state.gameBSimulated
  const evsFilled = state.evA.trim() !== '' && state.evB.trim() !== ''

  const steps: WorkspaceStepDef[] = [
    {
      id: 'simulate',
      title: 'Simulate both games',
      prompt: <QuestionPrompt>Run 20 simulated trials for each game.</QuestionPrompt>,
      canAdvance: bothSimulated,
      advanceHint: 'Run both simulations to continue.',
      content: (
        <>
          <div className="risk-cards">
            <div className="risk-card">
              <h3>Game A — Sure Six</h3>
              <div className="solid-bar">$6 every trial</div>
              <button type="button" className="btn-secondary touch-target" onClick={runA} disabled={state.gameASimulated}>
                Run 20 trials
              </button>
            </div>
            <div className="risk-card">
              <h3>Game B — Double or Nothing</h3>
              <div className="split-bar"><span>$12</span><span>$0</span></div>
              <button type="button" className="btn-secondary touch-target" onClick={runB} disabled={state.gameBSimulated}>
                Run 20 trials
              </button>
            </div>
          </div>
          <div className="ws-visual">
            <RiskComparisonGraph
              gameAAverages={state.gameAAverages}
              gameBAverages={state.gameBAverages}
              target={6}
              maxY={12}
              labelA="Game A — guaranteed $6"
              labelB="Game B — 50/50 $12 or $0"
            />
          </div>
          <p className="l5-live" role="status" aria-live="polite">
            {bothSimulated
              ? 'Game A repeats one steady payout. Game B alternates between a high payout and no payout.'
              : ''}
          </p>
        </>
      ),
    },
    {
      id: 'ev',
      title: 'Expected value of each game',
      prompt: <QuestionPrompt>Enter the expected value for each game.</QuestionPrompt>,
      canAdvance: evsFilled,
      advanceHint: 'Enter both expected values to continue.',
      content: (
        <div className="field-grid">
          <label className="field-label">EV Game A
            <input className="touch-input" value={state.evA} inputMode="decimal" onChange={(e) => setState((p) => ({ ...p, evA: e.target.value }))} placeholder="Type the expected value" />
          </label>
          <label className="field-label">EV Game B
            <input className="touch-input" value={state.evB} inputMode="decimal" onChange={(e) => setState((p) => ({ ...p, evB: e.target.value }))} placeholder="Type the expected value" />
          </label>
        </div>
      ),
    },
    {
      id: 'risk',
      title: 'Which game is riskier?',
      prompt: <QuestionPrompt>Select the riskier game and the reason why, then submit.</QuestionPrompt>,
      action: (
        <button
          type="button"
          className="btn-secondary touch-target"
          disabled={session.submitting}
          onClick={() => void session.handleCheck(
            checkWiderSpread({
              gameASimulated: state.gameASimulated,
              gameBSimulated: state.gameBSimulated,
              evA: state.evA,
              evB: state.evB,
              higherRisk: state.higherRisk,
              reason: state.reason,
            }),
            'final',
            JSON.stringify({ evA: state.evA, evB: state.evB, higherRisk: state.higherRisk, reason: state.reason }),
            state.reason,
          )}
        >
          Submit answer
        </button>
      ),
      content: (
        <>
          <div className="field-grid">
            <label className="field-label">Riskier game
              <select className="touch-input" value={state.higherRisk} onChange={(e) => setState((p) => ({ ...p, higherRisk: e.target.value }))}>
                <option value="">Choose…</option>
                <option value="A">Game A</option>
                <option value="B">Game B</option>
              </select>
            </label>
          </div>

          <fieldset className="l5-question">
            <legend>Why is that game riskier?</legend>
            <div className="l5-options">
              {EXPLANATIONS.map((opt) => (
                <label key={opt.value} className={`l5-option touch-target${state.reason === opt.value ? ' l5-option-selected' : ''}`}>
                  <input type="radio" name="reason" value={opt.value} checked={state.reason === opt.value} onChange={() => setState((p) => ({ ...p, reason: opt.value }))} />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

        </>
      ),
    },
  ]

  return (
    <ProblemLayout
      problem={PROBLEM_8}
      problemNumber={13}
      feedback={session.feedback}
      completed={session.completed}
      revealedHintIds={session.revealedHintIds}
      onRevealHint={session.revealHint}
      restarted={session.restarted}
      onRestart={() => { reset(); session.restart() }}
      onReview={session.backToReview}
      attemptCount={session.finalAttemptCount}
      lastSubmittedAnswer={session.lastSubmittedAnswer}
      reviewHintUsed={session.reviewHintUsed}
      completionMessage="You confirmed two games with the same $6 EV carry different risk — Game B’s wider spread."
      steps={steps}
    />
  )
}
