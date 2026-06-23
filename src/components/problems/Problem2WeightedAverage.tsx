import { FormulaBuilder } from '../visuals/FormulaBuilder'
import { ConfigurableSpinner, SPINNER_P2 } from '../visuals/ConfigurableSpinner'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { TaskGuide } from '../lesson/TaskGuide'
import { useProblemSession } from '../../hooks/useProblemSession'
import { usePersistedProblemState } from '../../hooks/usePersistedProblemState'
import { PROBLEM_2 } from '../../data/problems/problem-2'
import { checkProblem2 } from '../../lib/answerChecker'

const CARDS = ['$20', '$0', '25%', '75%']

interface P2State {
  slots: [string, string, string, string]
  selectedCard: string | null
  evAnswer: string
}

const DEFAULT: P2State = { slots: ['', '', '', ''], selectedCard: null, evAnswer: '' }

export function Problem2WeightedAverage() {
  const { state, setState, loaded } = usePersistedProblemState<P2State>('problem-2', DEFAULT)
  const session = useProblemSession(PROBLEM_2, state)

  if (!loaded || !session.sessionLoaded) {
    return <div className="loading-screen"><div className="spinner" /><p>Loading problem…</p></div>
  }

  const slotsFilled = state.slots.filter(Boolean).length
  const allPlaced = slotsFilled === 4
  const currentTask = state.selectedCard
    ? 'Now tap an empty formula slot to place the card.'
    : !allPlaced
      ? 'Select a card, then tap an empty formula slot.'
      : 'Now compute the expected value and enter it.'

  const taskGuide = (
    <TaskGuide
      currentTask={currentTask}
      steps={[
        { id: 'pairs', label: 'Pair each payout with its probability', done: allPlaced },
        { id: 'ev', label: 'Enter the expected value', done: session.completed },
      ]}
    />
  )

  return (
    <ProblemLayout problem={PROBLEM_2} problemNumber={2} feedback={session.feedback} completed={session.completed}
      revealedHintIds={session.revealedHintIds} onRevealHint={session.revealHint} nextProblemId="problem-3"
      taskGuide={taskGuide}>
      <section className="card problem-section">
        <ConfigurableSpinner segments={SPINNER_P2} rotation={0} spinning={false} lastOutcome={null} />
      </section>
      <section className="card problem-section">
        <h2>Build the formula</h2>
        <FormulaBuilder slots={state.slots} selectedCard={state.selectedCard} cards={CARDS}
          onSelectCard={(c) => setState((p) => ({ ...p, selectedCard: p.selectedCard === c ? null : c }))}
          onPlaceSlot={(index) => {
            if (!state.selectedCard) return
            setState((p) => { const n = [...p.slots] as typeof p.slots; n[index] = p.selectedCard!; return { ...p, slots: n, selectedCard: null } })
          }}
          onClearSlot={(i) => setState((p) => { const n = [...p.slots] as typeof p.slots; n[i] = ''; return { ...p, slots: n } })} />
        <label className="field-label">Expected value
          <input type="text" className="touch-input" value={state.evAnswer} onChange={(e) => setState((p) => ({ ...p, evAnswer: e.target.value }))} placeholder="$5" />
        </label>
        <button type="button" className="btn-secondary touch-target" disabled={session.submitting}
          onClick={() => void session.handleCheck(checkProblem2({ slots: state.slots, evAnswer: state.evAnswer }), 'final', state.evAnswer, state.evAnswer)}>Submit answer</button>
      </section>
    </ProblemLayout>
  )
}
