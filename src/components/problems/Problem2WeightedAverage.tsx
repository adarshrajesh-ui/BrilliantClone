import { useState } from 'react'
import { ConfigurableSpinner, SPINNER_P2 } from '../visuals/ConfigurableSpinner'
import { FormulaBuilder } from '../visuals/FormulaBuilder'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { useProblemSession } from '../../hooks/useProblemSession'
import { PROBLEM_2 } from '../../data/problems/problem-2'
import { checkProblem2 } from '../../lib/answerChecker'

const CARDS = ['$20', '$0', '25%', '75%']

export function Problem2WeightedAverage() {
  const session = useProblemSession(PROBLEM_2)
  const [slots, setSlots] = useState<[string, string, string, string]>(['', '', '', ''])
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [evAnswer, setEvAnswer] = useState('')

  const placeSlot = (index: 0 | 1 | 2 | 3) => {
    if (!selectedCard) return
    const next = [...slots] as [string, string, string, string]
    next[index] = selectedCard
    setSlots(next)
    setSelectedCard(null)
  }

  const submit = async () => {
    const r = checkProblem2({ slots, evAnswer })
    await session.handleCheck(r, 'final', JSON.stringify({ slots, evAnswer }))
  }

  return (
    <ProblemLayout problem={PROBLEM_2} problemNumber={2} feedback={session.feedback} completed={session.completed}
      revealedHintIds={session.revealedHintIds} onRevealHint={session.revealHint} nextProblemId="problem-3">
      <section className="card problem-section">
        <ConfigurableSpinner segments={SPINNER_P2} rotation={0} spinning={false} lastOutcome={null} />
      </section>
      <section className="card problem-section">
        <h2>Build the formula</h2>
        <FormulaBuilder slots={slots} selectedCard={selectedCard} cards={CARDS}
          onSelectCard={(c) => setSelectedCard(selectedCard === c ? null : c)}
          onPlaceSlot={placeSlot} onClearSlot={(i) => { const n = [...slots] as typeof slots; n[i] = ''; setSlots(n) }} />
        <label className="field-label">
          Expected value
          <input type="text" value={evAnswer} onChange={(e) => setEvAnswer(e.target.value)} placeholder="$5" />
        </label>
        <button type="button" className="btn-secondary" disabled={session.submitting} onClick={() => void submit()}>Submit answer</button>
      </section>
    </ProblemLayout>
  )
}
