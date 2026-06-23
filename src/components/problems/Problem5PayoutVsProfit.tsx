import { useState } from 'react'
import { BalanceScale } from '../visuals/BalanceScale'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { useProblemSession } from '../../hooks/useProblemSession'
import { PROBLEM_5 } from '../../data/problems/problem-5'
import { checkProblem5 } from '../../lib/answerChecker'

export function Problem5PayoutVsProfit() {
  const session = useProblemSession(PROBLEM_5)
  const [costPlaced, setCostPlaced] = useState(false)
  const [profitAnswer, setProfitAnswer] = useState('')

  const submit = async () => {
    const r = checkProblem5({ formulaSelected: costPlaced, profitAnswer })
    await session.handleCheck(r, 'final', profitAnswer)
  }

  return (
    <ProblemLayout problem={PROBLEM_5} problemNumber={5} feedback={session.feedback} completed={session.completed}
      revealedHintIds={session.revealedHintIds} onRevealHint={session.revealHint} nextProblemId="problem-6">
      <section className="card problem-section">
        <BalanceScale payout={4} cost={3} costPlaced={costPlaced} onPlaceCost={() => setCostPlaced(true)} />
        <label className="field-label">
          Expected profit
          <input type="text" value={profitAnswer} onChange={(e) => setProfitAnswer(e.target.value)} placeholder="$1" disabled={!costPlaced} />
        </label>
        <button type="button" className="btn-secondary" disabled={!costPlaced || session.submitting} onClick={() => void submit()}>Submit answer</button>
      </section>
    </ProblemLayout>
  )
}
