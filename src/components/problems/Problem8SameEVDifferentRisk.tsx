import { useCallback } from 'react'
import { RiskComparisonGraph } from '../visuals/RiskComparisonGraph'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { TaskGuide } from '../lesson/TaskGuide'
import { useProblemSession } from '../../hooks/useProblemSession'
import { usePersistedProblemState } from '../../hooks/usePersistedProblemState'
import { PROBLEM_8 } from '../../data/problems/problem-8'
import { checkProblem8 } from '../../lib/answerChecker'

interface P8State {
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
  gameASimulated: false, gameBSimulated: false, gameAAverages: [], gameBAverages: [],
  evA: '', evB: '', higherRisk: '', reason: '',
}

export function Problem8SameEVDifferentRisk() {
  const { state, setState, loaded, reset } = usePersistedProblemState<P8State>('problem-8', DEFAULT)
  const session = useProblemSession(PROBLEM_8, state)

  const runA = useCallback(() => {
    const avgs: number[] = []; let total = 0
    for (let i = 1; i <= 20; i += 1) { total += 5; avgs.push(total / i) }
    setState((p) => ({ ...p, gameAAverages: avgs, gameASimulated: true }))
  }, [setState])

  const runB = useCallback(() => {
    const avgs: number[] = []; let total = 0
    for (let i = 1; i <= 20; i += 1) { total += Math.random() < 0.5 ? 10 : 0; avgs.push(total / i) }
    setState((p) => ({ ...p, gameBAverages: avgs, gameBSimulated: true }))
  }, [setState])

  if (!loaded || !session.sessionLoaded) return <div className="loading-screen"><div className="spinner" /><p>Loading…</p></div>

  const bothSimulated = state.gameASimulated && state.gameBSimulated
  const evsFilled = state.evA.trim() !== '' && state.evB.trim() !== ''
  const currentTask = !bothSimulated
    ? 'Run 20 simulated trials for each game.'
    : !evsFilled
      ? 'Enter the expected value for each game.'
      : 'Identify which game is riskier and why.'

  const taskGuide = (
    <TaskGuide
      currentTask={currentTask}
      steps={[
        { id: 'sim', label: 'Run both simulations', done: bothSimulated },
        { id: 'ev', label: 'Compare the expected values', done: evsFilled },
        { id: 'risk', label: 'Identify the higher-risk game and why', done: session.completed },
      ]}
    />
  )

  return (
    <ProblemLayout problem={PROBLEM_8} problemNumber={8} feedback={session.feedback} completed={session.completed}
      revealedHintIds={session.revealedHintIds} onRevealHint={session.revealHint}
      restarted={session.restarted} onRestart={() => { reset(); session.restart() }} onReview={session.backToReview}
      attemptCount={session.finalAttemptCount} lastSubmittedAnswer={session.lastSubmittedAnswer} reviewHintUsed={session.reviewHintUsed}
      taskGuide={taskGuide}
      completionMessage="You compared two games with the same EV but different risk profiles.">
      <section className="card problem-section">
        <div className="risk-cards">
          <div className="risk-card">
            <h3>Game A — guaranteed $5</h3>
            <div className="solid-bar">$5 every trial</div>
            <button type="button" className="btn-secondary touch-target" onClick={runA} disabled={state.gameASimulated}>Run 20 trials</button>
          </div>
          <div className="risk-card">
            <h3>Game B — 50/50 $10 or $0</h3>
            <div className="split-bar"><span>$10</span><span>$0</span></div>
            <button type="button" className="btn-secondary touch-target" onClick={runB} disabled={state.gameBSimulated}>Run 20 trials</button>
          </div>
        </div>
        <RiskComparisonGraph gameAAverages={state.gameAAverages} gameBAverages={state.gameBAverages} />
      </section>
      <section className="card problem-section">
        <div className="field-grid">
          <label className="field-label">EV Game A<input className="touch-input" value={state.evA} onChange={(e) => setState((p) => ({ ...p, evA: e.target.value }))} /></label>
          <label className="field-label">EV Game B<input className="touch-input" value={state.evB} onChange={(e) => setState((p) => ({ ...p, evB: e.target.value }))} /></label>
          <label className="field-label">Higher risk
            <select className="touch-input" value={state.higherRisk} onChange={(e) => setState((p) => ({ ...p, higherRisk: e.target.value }))}>
              <option value="">Choose…</option><option value="A">Game A</option><option value="B">Game B</option>
            </select>
          </label>
          <label className="field-label">Why?
            <select className="touch-input" value={state.reason} onChange={(e) => setState((p) => ({ ...p, reason: e.target.value }))}>
              <option value="">Choose…</option>
              <option value="variable-outcomes">Variable outcomes despite same long-run average</option>
              <option value="higher-ev">Game B has higher EV</option>
              <option value="identical">Games are identical</option>
            </select>
          </label>
        </div>
        <button type="button" className="btn-secondary touch-target" disabled={session.submitting}
          onClick={() => void session.handleCheck(checkProblem8({
            gameASimulated: state.gameASimulated, gameBSimulated: state.gameBSimulated,
            evA: state.evA, evB: state.evB, higherRisk: state.higherRisk, reason: state.reason,
          }), 'final', JSON.stringify(state), state.reason)}>Submit answer</button>
      </section>
    </ProblemLayout>
  )
}
