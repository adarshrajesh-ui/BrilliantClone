import { MysteryBoxes, MYSTERY_BOXES_P3 } from '../visuals/MysteryBoxes'
import { ProbabilityTable } from '../visuals/ProbabilityTable'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { useProblemSession } from '../../hooks/useProblemSession'
import { usePersistedProblemState } from '../../hooks/usePersistedProblemState'
import { PROBLEM_3 } from '../../data/problems/problem-3'
import { checkProblem3 } from '../../lib/answerChecker'

interface P3State {
  revealed: number[]
  activeRow: number | null
  rows: Array<{ outcome: string; count: string; probability: string }>
}

const DEFAULT: P3State = {
  revealed: [],
  activeRow: null,
  rows: [
    { outcome: '$12', count: '', probability: '' },
    { outcome: '$6', count: '', probability: '' },
    { outcome: '$0', count: '', probability: '' },
  ],
}

export function Problem3MysteryBoxes() {
  const { state, setState, loaded } = usePersistedProblemState<P3State>('problem-3', DEFAULT)
  const session = useProblemSession(PROBLEM_3, state)

  const highlightValue = state.activeRow !== null ? [12, 6, 0][state.activeRow] : null

  if (!loaded || !session.sessionLoaded) {
    return <div className="loading-screen"><div className="spinner" /><p>Loading problem…</p></div>
  }

  return (
    <ProblemLayout problem={PROBLEM_3} problemNumber={3} feedback={session.feedback} completed={session.completed}
      revealedHintIds={session.revealedHintIds} onRevealHint={session.revealHint} nextProblemId="problem-4">
      <section className="card problem-section">
        <MysteryBoxes boxes={MYSTERY_BOXES_P3} revealedIds={state.revealed}
          onReveal={(id) => setState((p) => ({ ...p, revealed: [...p.revealed, id] }))} highlightValue={highlightValue} />
      </section>
      <section className="card problem-section">
        <h2>Probability table</h2>
        <ProbabilityTable rows={state.rows} activeRow={state.activeRow}
          onChange={(i, field, val) => setState((p) => ({
            ...p, activeRow: i,
            rows: p.rows.map((r, idx) => idx === i ? { ...r, [field]: val } : r),
          }))} />
        <button type="button" className="btn-secondary touch-target" disabled={session.submitting}
          onClick={() => void session.handleCheck(checkProblem3({
            allRevealed: state.revealed.length === 6,
            rows: state.rows.map((row, i) => ({ outcome: [12, 6, 0][i], count: row.count, probability: row.probability })),
          }), 'final', JSON.stringify(state.rows), JSON.stringify(state.rows))}>Submit answer</button>
      </section>
    </ProblemLayout>
  )
}
