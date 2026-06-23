import { ProbabilityTable } from '../visuals/ProbabilityTable'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { useProblemSession } from '../../hooks/useProblemSession'
import { usePersistedProblemState } from '../../hooks/usePersistedProblemState'
import { PROBLEM_4 } from '../../data/problems/problem-4'
import { checkProblem4 } from '../../lib/answerChecker'

interface P4State { contributions: [string, string, string]; evAnswer: string }
const DEFAULT: P4State = { contributions: ['', '', ''], evAnswer: '' }

export function Problem4CalculateEV() {
  const { state, setState, loaded } = usePersistedProblemState<P4State>('problem-4', DEFAULT)
  const session = useProblemSession(PROBLEM_4, state)
  const rows = [
    { outcome: '$12 (× 1/6)', count: '—', probability: '1/6', color: 'green' },
    { outcome: '$6 (× 2/6)', count: '—', probability: '2/6', color: 'blue' },
    { outcome: '$0 (× 3/6)', count: '—', probability: '3/6', color: 'gray' },
  ]

  if (!loaded || !session.sessionLoaded) return <div className="loading-screen"><div className="spinner" /><p>Loading…</p></div>

  return (
    <ProblemLayout problem={PROBLEM_4} problemNumber={4} feedback={session.feedback} completed={session.completed}
      revealedHintIds={session.revealedHintIds} onRevealHint={session.revealHint} nextProblemId="problem-5">
      <section className="card problem-section">
        <div className="ev-chunks">
          <span className="ev-chunk ev-chunk-green">12 × 1/6</span>+<span className="ev-chunk ev-chunk-blue">6 × 2/6</span>+<span className="ev-chunk ev-chunk-gray">0 × 3/6</span>
        </div>
        <ProbabilityTable rows={rows} readOnly extraColumns={[{
          key: 'c', label: 'Contribution', values: [...state.contributions],
          onChange: (i, val) => setState((p) => ({ ...p, contributions: p.contributions.map((c, idx) => idx === i ? val : c) as typeof p.contributions })),
        }]} />
        <label className="field-label">Final EV<input className="touch-input" value={state.evAnswer} onChange={(e) => setState((p) => ({ ...p, evAnswer: e.target.value }))} /></label>
        <button type="button" className="btn-secondary touch-target" disabled={session.submitting}
          onClick={() => void session.handleCheck(checkProblem4({ contributions: state.contributions, evAnswer: state.evAnswer }), 'final', state.evAnswer, state.evAnswer)}>Submit answer</button>
      </section>
    </ProblemLayout>
  )
}
