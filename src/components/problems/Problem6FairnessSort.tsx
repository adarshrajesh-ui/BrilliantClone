import { FairnessNumberLine } from '../visuals/FairnessNumberLine'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { useProblemSession } from '../../hooks/useProblemSession'
import { usePersistedProblemState } from '../../hooks/usePersistedProblemState'
import { PROBLEM_6 } from '../../data/problems/problem-6'
import { checkProblem6 } from '../../lib/answerChecker'

const GAMES = [
  { id: 'A', payout: 5, cost: 5, profit: 0 },
  { id: 'B', payout: 7, cost: 5, profit: 2 },
  { id: 'C', payout: 3, cost: 5, profit: -2 },
]

interface P6State { selectedGame: string | null; assignments: Record<string, string> }
const DEFAULT: P6State = { selectedGame: null, assignments: {} }

export function Problem6FairnessSort() {
  const { state, setState, loaded } = usePersistedProblemState<P6State>('problem-6', DEFAULT)
  const session = useProblemSession(PROBLEM_6, state)

  if (!loaded || !session.sessionLoaded) return <div className="loading-screen"><div className="spinner" /><p>Loading…</p></div>

  return (
    <ProblemLayout problem={PROBLEM_6} problemNumber={6} feedback={session.feedback} completed={session.completed}
      revealedHintIds={session.revealedHintIds} onRevealHint={session.revealHint} nextProblemId="problem-7">
      <section className="card problem-section">
        <div className="game-cards">
          {GAMES.map((g) => (
            <button key={g.id} type="button" className={`game-card touch-target${state.selectedGame === g.id ? ' game-card-selected' : ''}${state.assignments[g.id] ? ' game-card-placed' : ''}`}
              disabled={!!state.assignments[g.id]} onClick={() => setState((p) => ({ ...p, selectedGame: g.id }))}>
              <strong>Game {g.id}</strong>
              <div className="bar-row"><span>Payout</span><div className="bar bar-payout" style={{ width: `${g.payout * 10}px` }}>${g.payout}</div></div>
              <div className="bar-row"><span>Cost</span><div className="bar bar-cost" style={{ width: `${g.cost * 10}px` }}>${g.cost}</div></div>
              <p className="profit-meter">Profit: {g.profit >= 0 ? '+' : ''}${g.profit}</p>
              {state.assignments[g.id] && <span className="placed-tag">{state.assignments[g.id]}</span>}
            </button>
          ))}
        </div>
        <FairnessNumberLine highlightZero />
        <div className="bucket-row">
          {(['favorable', 'fair', 'unfavorable'] as const).map((b) => (
            <button key={b} type="button" className={`bucket bucket-${b} touch-target${state.selectedGame ? ' bucket-ready' : ''}`}
              onClick={() => {
                if (!state.selectedGame) return
                setState((p) => ({ ...p, assignments: { ...p.assignments, [p.selectedGame!]: b }, selectedGame: null }))
              }}>
              {b.charAt(0).toUpperCase() + b.slice(1)}
              <div className="bucket-contents">{GAMES.filter((g) => state.assignments[g.id] === b).map((g) => g.id).join(', ')}</div>
            </button>
          ))}
        </div>
        <button type="button" className="btn-secondary touch-target" disabled={session.submitting}
          onClick={() => void session.handleCheck(checkProblem6({ assignments: state.assignments }), 'final', JSON.stringify(state.assignments), JSON.stringify(state.assignments))}>Submit answer</button>
      </section>
    </ProblemLayout>
  )
}
