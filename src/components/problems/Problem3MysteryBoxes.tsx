import { useState } from 'react'
import { MysteryBoxes, MYSTERY_BOXES_P3 } from '../visuals/MysteryBoxes'
import { ProbabilityTable } from '../visuals/ProbabilityTable'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { useProblemSession } from '../../hooks/useProblemSession'
import { PROBLEM_3 } from '../../data/problems/problem-3'
import { checkProblem3 } from '../../lib/answerChecker'

export function Problem3MysteryBoxes() {
  const session = useProblemSession(PROBLEM_3)
  const [revealed, setRevealed] = useState<number[]>([])
  const [activeRow, setActiveRow] = useState<number | null>(null)
  const [rows, setRows] = useState([
    { outcome: '$12', count: '', probability: '' },
    { outcome: '$6', count: '', probability: '' },
    { outcome: '$0', count: '', probability: '' },
  ])

  const highlightValue = activeRow !== null ? [12, 6, 0][activeRow] : null

  const submit = async () => {
    const r = checkProblem3({
      allRevealed: revealed.length === 6,
      rows: rows.map((row, i) => ({ outcome: [12, 6, 0][i], count: row.count, probability: row.probability })),
    })
    await session.handleCheck(r, 'final', JSON.stringify(rows))
  }

  return (
    <ProblemLayout problem={PROBLEM_3} problemNumber={3} feedback={session.feedback} completed={session.completed}
      revealedHintIds={session.revealedHintIds} onRevealHint={session.revealHint} nextProblemId="problem-4">
      <section className="card problem-section">
        <MysteryBoxes boxes={MYSTERY_BOXES_P3} revealedIds={revealed} onReveal={(id) => setRevealed((p) => [...p, id])} highlightValue={highlightValue} />
      </section>
      <section className="card problem-section">
        <h2>Probability table</h2>
        <ProbabilityTable rows={rows} activeRow={activeRow}
          onChange={(i, field, val) => {
            setActiveRow(i)
            setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))
          }} />
        <button type="button" className="btn-secondary" disabled={session.submitting} onClick={() => void submit()}>Submit answer</button>
      </section>
    </ProblemLayout>
  )
}
