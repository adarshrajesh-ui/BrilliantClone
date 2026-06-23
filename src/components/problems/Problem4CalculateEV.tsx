import { useState } from 'react'
import { ProbabilityTable } from '../visuals/ProbabilityTable'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { useProblemSession } from '../../hooks/useProblemSession'
import { PROBLEM_4 } from '../../data/problems/problem-4'
import { checkProblem4 } from '../../lib/answerChecker'

export function Problem4CalculateEV() {
  const session = useProblemSession(PROBLEM_4)
  const [contributions, setContributions] = useState(['', '', ''])
  const [evAnswer, setEvAnswer] = useState('')

  const rows = [
    { outcome: '$12 (× 1/6)', count: '—', probability: '1/6', color: 'green' },
    { outcome: '$6 (× 2/6)', count: '—', probability: '2/6', color: 'blue' },
    { outcome: '$0 (× 3/6)', count: '—', probability: '3/6', color: 'gray' },
  ]

  const submit = async () => {
    const r = checkProblem4({ contributions: contributions as [string, string, string], evAnswer })
    await session.handleCheck(r, 'final', JSON.stringify({ contributions, evAnswer }))
  }

  return (
    <ProblemLayout problem={PROBLEM_4} problemNumber={4} feedback={session.feedback} completed={session.completed}
      revealedHintIds={session.revealedHintIds} onRevealHint={session.revealHint} nextProblemId="problem-5">
      <section className="card problem-section">
        <h2>EV contributions</h2>
        <div className="ev-chunks">
          <span className="ev-chunk ev-chunk-green">12 × 1/6</span>
          <span>+</span>
          <span className="ev-chunk ev-chunk-blue">6 × 2/6</span>
          <span>+</span>
          <span className="ev-chunk ev-chunk-gray">0 × 3/6</span>
        </div>
        <ProbabilityTable rows={rows} readOnly extraColumns={[{
          key: 'contrib', label: 'Contribution', values: contributions,
          onChange: (i, val) => setContributions((p) => p.map((c, idx) => idx === i ? val : c)),
        }]} />
        <label className="field-label">Final EV <input type="text" value={evAnswer} onChange={(e) => setEvAnswer(e.target.value)} placeholder="$4" /></label>
        <button type="button" className="btn-secondary" disabled={session.submitting} onClick={() => void submit()}>Submit answer</button>
      </section>
    </ProblemLayout>
  )
}
