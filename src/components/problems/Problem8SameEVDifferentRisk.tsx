import { useCallback, useState } from 'react'
import { RiskComparisonGraph } from '../visuals/RiskComparisonGraph'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { useProblemSession } from '../../hooks/useProblemSession'
import { PROBLEM_8 } from '../../data/problems/problem-8'
import { checkProblem8 } from '../../lib/answerChecker'

export function Problem8SameEVDifferentRisk() {
  const session = useProblemSession(PROBLEM_8)
  const [gameASimulated, setGameASimulated] = useState(false)
  const [gameBSimulated, setGameBSimulated] = useState(false)
  const [gameAAverages, setGameAAverages] = useState<number[]>([])
  const [gameBAverages, setGameBAverages] = useState<number[]>([])
  const [evA, setEvA] = useState('')
  const [evB, setEvB] = useState('')
  const [higherRisk, setHigherRisk] = useState('')
  const [reason, setReason] = useState('')

  const runA = useCallback(() => {
    const avgs: number[] = []
    let total = 0
    for (let i = 1; i <= 20; i += 1) { total += 5; avgs.push(total / i) }
    setGameAAverages(avgs); setGameASimulated(true)
  }, [])

  const runB = useCallback(() => {
    const avgs: number[] = []
    let total = 0
    for (let i = 1; i <= 20; i += 1) {
      total += Math.random() < 0.5 ? 10 : 0
      avgs.push(total / i)
    }
    setGameBAverages(avgs); setGameBSimulated(true)
  }, [])

  const submit = async () => {
    const r = checkProblem8({ gameASimulated, gameBSimulated, evA, evB, higherRisk, reason })
    await session.handleCheck(r, 'final', JSON.stringify({ evA, evB, higherRisk, reason }))
  }

  return (
    <ProblemLayout problem={PROBLEM_8} problemNumber={8} feedback={session.feedback} completed={session.completed}
      revealedHintIds={session.revealedHintIds} onRevealHint={session.revealHint}
      completionMessage="You compared two games with the same EV but different risk profiles.">
      <section className="card problem-section">
        <div className="risk-cards">
          <div className="risk-card">
            <h3>Game A — guaranteed $5</h3>
            <div className="solid-bar" style={{ width: '50%' }}>$5 every trial</div>
            <button type="button" className="btn-secondary" onClick={runA} disabled={gameASimulated}>Run 20 trials</button>
          </div>
          <div className="risk-card">
            <h3>Game B — 50/50 $10 or $0</h3>
            <div className="split-bar"><span>$10</span><span>$0</span></div>
            <button type="button" className="btn-secondary" onClick={runB} disabled={gameBSimulated}>Run 20 trials</button>
          </div>
        </div>
        <RiskComparisonGraph gameAAverages={gameAAverages} gameBAverages={gameBAverages} />
      </section>
      <section className="card problem-section">
        <div className="field-grid">
          <label className="field-label">EV for Game A <input value={evA} onChange={(e) => setEvA(e.target.value)} /></label>
          <label className="field-label">EV for Game B <input value={evB} onChange={(e) => setEvB(e.target.value)} /></label>
          <label className="field-label">Higher risk game
            <select value={higherRisk} onChange={(e) => setHigherRisk(e.target.value)}>
              <option value="">Choose…</option>
              <option value="A">Game A</option>
              <option value="B">Game B</option>
            </select>
          </label>
          <label className="field-label">Why?
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="">Choose…</option>
              <option value="variable-outcomes">Variable outcomes despite same long-run average</option>
              <option value="higher-ev">Game B has higher EV</option>
              <option value="identical">Games are identical</option>
            </select>
          </label>
        </div>
        <button type="button" className="btn-secondary" disabled={session.submitting} onClick={() => void submit()}>Submit answer</button>
      </section>
    </ProblemLayout>
  )
}
