import { FairnessNumberLine } from '../visuals/FairnessNumberLine'
import { CarnivalWheel } from '../visuals/CarnivalWheel'
import { ProbabilityTable } from '../visuals/ProbabilityTable'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { useProblemSession } from '../../hooks/useProblemSession'
import { usePersistedProblemState } from '../../hooks/usePersistedProblemState'
import { PROBLEM_7 } from '../../data/problems/problem-7'
import { checkProblem7 } from '../../lib/answerChecker'

interface P7State {
  selectedPayout: number | null
  probabilities: [string, string, string]
  contributions: [string, string, string]
  expectedPayout: string
  expectedProfit: string
  decision: string
}

const DEFAULT: P7State = {
  selectedPayout: null,
  probabilities: ['', '', ''],
  contributions: ['', '', ''],
  expectedPayout: '',
  expectedProfit: '',
  decision: '',
}

export function Problem7WholeEVModel() {
  const { state, setState, loaded } = usePersistedProblemState<P7State>('problem-7', DEFAULT)
  const session = useProblemSession(PROBLEM_7, state)

  const rows = [
    { outcome: '$30', count: '1 section', probability: state.probabilities[0], color: 'green' },
    { outcome: '$10', count: '2 sections', probability: state.probabilities[1], color: 'blue' },
    { outcome: '$0', count: '7 sections', probability: state.probabilities[2], color: 'gray' },
  ]

  if (!loaded || !session.sessionLoaded) return <div className="loading-screen"><div className="spinner" /><p>Loading…</p></div>

  return (
    <ProblemLayout problem={PROBLEM_7} problemNumber={7} feedback={session.feedback} completed={session.completed}
      revealedHintIds={session.revealedHintIds} onRevealHint={session.revealHint} nextProblemId="problem-8">
      <section className="card problem-section">
        <h2>Carnival wheel (10 sections)</h2>
        <CarnivalWheel selectedValue={state.selectedPayout} onSelectValue={(v) => setState((p) => ({ ...p, selectedPayout: v }))} />
        <p className="section-note">Cost to spin: $5</p>
      </section>
      <section className="card problem-section">
        <ProbabilityTable rows={rows}
          onChange={(i, field, val) => { if (field === 'probability') setState((p) => ({ ...p, probabilities: p.probabilities.map((x, idx) => idx === i ? val : x) as typeof p.probabilities })) }}
          extraColumns={[{ key: 'c', label: 'Contribution', values: [...state.contributions], onChange: (i, val) => setState((p) => ({ ...p, contributions: p.contributions.map((x, idx) => idx === i ? val : x) as typeof p.contributions })) }]} />
        <div className="field-grid">
          <label className="field-label">Expected payout<input className="touch-input" value={state.expectedPayout} onChange={(e) => setState((p) => ({ ...p, expectedPayout: e.target.value }))} /></label>
          <label className="field-label">Expected profit<input className="touch-input" value={state.expectedProfit} onChange={(e) => setState((p) => ({ ...p, expectedProfit: e.target.value }))} /></label>
          <label className="field-label">Decision
            <select className="touch-input" value={state.decision} onChange={(e) => setState((p) => ({ ...p, decision: e.target.value }))}>
              <option value="">Choose…</option><option value="fair">Fair</option><option value="favorable">Favorable</option><option value="unfavorable">Unfavorable</option>
            </select>
          </label>
        </div>
        <FairnessNumberLine value={parseFloat(state.expectedProfit) || null} />
        <button type="button" className="btn-secondary touch-target" disabled={session.submitting}
          onClick={() => void session.handleCheck(checkProblem7({
            probabilities: state.probabilities, contributions: state.contributions,
            expectedPayout: state.expectedPayout, expectedProfit: state.expectedProfit, decision: state.decision,
          }), 'final', JSON.stringify(state), state.decision)}>Submit answer</button>
      </section>
    </ProblemLayout>
  )
}
