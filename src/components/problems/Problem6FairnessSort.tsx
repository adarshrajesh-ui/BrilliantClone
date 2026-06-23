import { useState } from 'react'
import { FairnessNumberLine } from '../visuals/FairnessNumberLine'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { useProblemSession } from '../../hooks/useProblemSession'
import { PROBLEM_6 } from '../../data/problems/problem-6'
import { checkProblem6 } from '../../lib/answerChecker'

const GAMES = [
  { id: 'A', payout: 5, cost: 5, profit: 0 },
  { id: 'B', payout: 7, cost: 5, profit: 2 },
  { id: 'C', payout: 3, cost: 5, profit: -2 },
]
const BUCKETS = ['favorable', 'fair', 'unfavorable'] as const

export function Problem6FairnessSort() {
  const session = useProblemSession(PROBLEM_6)
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [assignments, setAssignments] = useState<Record<string, string>>({})

  const unassigned = GAMES.filter((g) => !assignments[g.id])

  const submit = async () => {
    const r = checkProblem6({ assignments })
    await session.handleCheck(r, 'final', JSON.stringify(assignments))
  }

  return (
    <ProblemLayout problem={PROBLEM_6} problemNumber={6} feedback={session.feedback} completed={session.completed}
      revealedHintIds={session.revealedHintIds} onRevealHint={session.revealHint} nextProblemId="problem-7">
      <section className="card problem-section">
        <div className="game-cards">
          {GAMES.map((g) => (
            <div key={g.id} className={`game-card${selectedGame === g.id ? ' game-card-selected' : ''}${assignments[g.id] ? ' game-card-placed' : ''}`}
              onClick={() => !assignments[g.id] && setSelectedGame(g.id)}>
              <strong>Game {g.id}</strong>
              <div className="bar-row"><span>Payout</span><div className="bar bar-payout" style={{ width: `${g.payout * 10}px` }}>${g.payout}</div></div>
              <div className="bar-row"><span>Cost</span><div className="bar bar-cost" style={{ width: `${g.cost * 10}px` }}>${g.cost}</div></div>
              <p className="profit-meter">Profit: {g.profit >= 0 ? '+' : ''}${g.profit}</p>
              {assignments[g.id] && <span className="placed-tag">{assignments[g.id]}</span>}
            </div>
          ))}
        </div>
        <FairnessNumberLine highlightZero />
        <div className="bucket-row">
          {BUCKETS.map((b) => (
            <button key={b} type="button" className={`bucket bucket-${b}${selectedGame ? ' bucket-ready' : ''}`}
              onClick={() => {
                if (!selectedGame) return
                setAssignments((p) => ({ ...p, [selectedGame]: b }))
                setSelectedGame(null)
              }}>
              {b.charAt(0).toUpperCase() + b.slice(1)}
              <div className="bucket-contents">{GAMES.filter((g) => assignments[g.id] === b).map((g) => g.id).join(', ')}</div>
            </button>
          ))}
        </div>
        <p className="section-note">Tap a game card, then tap a bucket. {unassigned.length} remaining.</p>
        <button type="button" className="btn-secondary" disabled={session.submitting} onClick={() => void submit()}>Submit answer</button>
      </section>
    </ProblemLayout>
  )
}
