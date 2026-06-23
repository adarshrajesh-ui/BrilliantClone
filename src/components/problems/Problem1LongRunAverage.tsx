import { useCallback, useMemo, useState } from 'react'
import { ConfigurableSpinner, SPINNER_P1, spinFromSegments } from '../visuals/ConfigurableSpinner'
import { RunningAverageGraph } from '../visuals/RunningAverageGraph'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { useProblemSession } from '../../hooks/useProblemSession'
import { PROBLEM_1 } from '../../data/problems/problem-1'
import { checkProblem1Completion, checkProblem1Prediction } from '../../lib/answerChecker'
import type { Problem1Choice } from '../../types/problem'

const CHOICES: Problem1Choice[] = [0, 5, 10]

export function Problem1LongRunAverage() {
  const session = useProblemSession(PROBLEM_1)
  const [prediction, setPrediction] = useState<Problem1Choice | null>(null)
  const [predictionSubmitted, setPredictionSubmitted] = useState(false)
  const [finalAnswer, setFinalAnswer] = useState<Problem1Choice | null>(null)
  const [totalSpins, setTotalSpins] = useState(0)
  const [totalWinnings, setTotalWinnings] = useState(0)
  const [runningAverages, setRunningAverages] = useState<number[]>([])
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [lastOutcome, setLastOutcome] = useState<number | null>(null)

  const runSpins = useCallback(
    async (count: number) => {
      if (!predictionSubmitted || spinning) return
      setSpinning(true)
      await new Promise((r) => setTimeout(r, 350))
      let spins = totalSpins, winnings = totalWinnings
      const avgs = [...runningAverages]
      let last = lastOutcome
      for (let i = 0; i < count; i += 1) {
        const o = spinFromSegments(SPINNER_P1)
        winnings += o; spins += 1; avgs.push(winnings / spins); last = o
      }
      setTotalSpins(spins); setTotalWinnings(winnings); setRunningAverages(avgs)
      setRotation((p) => p + count * 47 + 360); setLastOutcome(last); setSpinning(false)
    },
    [predictionSubmitted, spinning, totalSpins, totalWinnings, runningAverages, lastOutcome],
  )

  const submitPrediction = () => {
    if (prediction === null) { session.setFeedback({ isCorrect: false, mistakeType: null, feedback: 'Choose a prediction.', canComplete: false }); return }
    const r = checkProblem1Prediction(prediction, totalSpins)
    setPredictionSubmitted(true)
    session.setFeedback(r)
  }

  const submitFinal = async () => {
    const r = checkProblem1Completion({ predictionSubmitted, totalSpins, finalAnswer })
    await session.handleCheck(r, 'final', String(finalAnswer))
  }

  const stats = useMemo(() => [
    { label: 'Total spins', value: String(totalSpins) },
    { label: 'Total winnings', value: `$${totalWinnings}` },
    { label: 'Average per spin', value: `$${totalSpins ? (totalWinnings / totalSpins).toFixed(2) : '0'}` },
  ], [totalSpins, totalWinnings])

  return (
    <ProblemLayout problem={PROBLEM_1} problemNumber={1} feedback={session.feedback} completed={session.completed}
      revealedHintIds={session.revealedHintIds} onRevealHint={session.revealHint} nextProblemId="problem-2"
      completionMessage="You predicted, ran 100+ spins, and identified $5 as the long-run average.">
      <section className="card problem-section">
        <h2>Step 1 — Predict the long-run average</h2>
        <div className="choice-row">
          {CHOICES.map((c) => (
            <button key={c} type="button" className={`choice-btn${prediction === c ? ' choice-btn-selected' : ''}`}
              onClick={() => setPrediction(c)} disabled={predictionSubmitted}>${c}</button>
          ))}
        </div>
        {!predictionSubmitted && <button type="button" className="btn-secondary" onClick={submitPrediction}>Submit prediction</button>}
        {predictionSubmitted && <p className="step-done">Prediction submitted: ${prediction}</p>}
      </section>
      <section className={`card problem-section${!predictionSubmitted ? ' section-disabled' : ''}`}>
        <h2>Step 2 — Spin and observe</h2>
        <div className="problem-visual-row">
          <ConfigurableSpinner segments={SPINNER_P1} rotation={rotation} spinning={spinning} lastOutcome={lastOutcome} />
          <div className="problem-side-panel">
            <ul className="stat-list">{stats.map((s) => <li key={s.label}><span>{s.label}</span><strong>{s.value}</strong></li>)}</ul>
            <div className="spin-buttons">
              <button type="button" className="btn-secondary" disabled={!predictionSubmitted || spinning} onClick={() => void runSpins(1)}>Spin once</button>
              <button type="button" className="btn-secondary" disabled={!predictionSubmitted || spinning} onClick={() => void runSpins(10)}>Spin 10 times</button>
              <button type="button" className="btn-secondary" disabled={!predictionSubmitted || spinning} onClick={() => void runSpins(100)}>Spin 100 times</button>
            </div>
            {totalSpins < 100 && predictionSubmitted && <p className="spin-requirement">Run at least 100 spins ({totalSpins}/100).</p>}
          </div>
        </div>
        <RunningAverageGraph averages={runningAverages} target={5} />
      </section>
      <section className={`card problem-section${totalSpins < 100 ? ' section-disabled' : ''}`}>
        <h2>Step 3 — Identify the long-run average</h2>
        <div className="choice-row">
          {CHOICES.map((c) => (
            <button key={c} type="button" className={`choice-btn${finalAnswer === c ? ' choice-btn-selected' : ''}`}
              onClick={() => setFinalAnswer(c)} disabled={totalSpins < 100}>${c}</button>
          ))}
        </div>
        <button type="button" className="btn-secondary" disabled={totalSpins < 100 || finalAnswer === null || session.submitting}
          onClick={() => void submitFinal()}>{session.submitting ? 'Saving…' : 'Submit answer'}</button>
      </section>
    </ProblemLayout>
  )
}
