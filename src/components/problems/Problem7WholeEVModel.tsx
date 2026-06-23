import { useState } from 'react'
import { FairnessNumberLine } from '../visuals/FairnessNumberLine'
import { ProbabilityTable } from '../visuals/ProbabilityTable'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { useProblemSession } from '../../hooks/useProblemSession'
import { PROBLEM_7 } from '../../data/problems/problem-7'
import { checkProblem7 } from '../../lib/answerChecker'

const SECTIONS = [30, 10, 10, 0, 0, 0, 0, 0, 0, 0]

export function Problem7WholeEVModel() {
  const session = useProblemSession(PROBLEM_7)
  const [probabilities, setProbabilities] = useState(['', '', ''])
  const [contributions, setContributions] = useState(['', '', ''])
  const [expectedPayout, setExpectedPayout] = useState('')
  const [expectedProfit, setExpectedProfit] = useState('')
  const [decision, setDecision] = useState('')

  const rows = [
    { outcome: '$30', count: '1 section', probability: probabilities[0], color: 'green' },
    { outcome: '$10', count: '2 sections', probability: probabilities[1], color: 'blue' },
    { outcome: '$0', count: '7 sections', probability: probabilities[2], color: 'gray' },
  ]

  const submit = async () => {
    const r = checkProblem7({
      probabilities: probabilities as [string, string, string],
      contributions: contributions as [string, string, string],
      expectedPayout, expectedProfit, decision,
    })
    await session.handleCheck(r, 'final', JSON.stringify({ probabilities, contributions, expectedPayout, expectedProfit, decision }))
  }

  return (
    <ProblemLayout problem={PROBLEM_7} problemNumber={7} feedback={session.feedback} completed={session.completed}
      revealedHintIds={session.revealedHintIds} onRevealHint={session.revealHint} nextProblemId="problem-8">
      <section className="card problem-section">
        <h2>Carnival wheel (10 sections)</h2>
        <div className="wheel-sections">
          {SECTIONS.map((v, i) => (
            <div key={i} className={`wheel-section wheel-v${v}`} title={`$${v}`}>${v}</div>
          ))}
        </div>
        <p className="section-note">Cost to spin: $5</p>
      </section>
      <section className="card problem-section">
        <ProbabilityTable rows={rows} readOnly={false}
          onChange={(i, field, val) => {
            if (field === 'probability') setProbabilities((p) => p.map((x, idx) => idx === i ? val : x))
          }}
          extraColumns={[{ key: 'c', label: 'Contribution', values: contributions, onChange: (i, val) => setContributions((p) => p.map((x, idx) => idx === i ? val : x)) }]} />
        <div className="field-grid">
          <label className="field-label">Expected payout <input value={expectedPayout} onChange={(e) => setExpectedPayout(e.target.value)} /></label>
          <label className="field-label">Expected profit <input value={expectedProfit} onChange={(e) => setExpectedProfit(e.target.value)} /></label>
          <label className="field-label">Decision
            <select value={decision} onChange={(e) => setDecision(e.target.value)}>
              <option value="">Choose…</option>
              <option value="fair">Fair</option>
              <option value="favorable">Favorable</option>
              <option value="unfavorable">Unfavorable</option>
            </select>
          </label>
        </div>
        <FairnessNumberLine value={parseFloat(expectedProfit) || null} />
        <button type="button" className="btn-secondary" disabled={session.submitting} onClick={() => void submit()}>Submit answer</button>
      </section>
    </ProblemLayout>
  )
}
