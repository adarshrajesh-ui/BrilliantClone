import { BalanceScale } from '../visuals/BalanceScale'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { TaskGuide } from '../lesson/TaskGuide'
import { useProblemSession } from '../../hooks/useProblemSession'
import { usePersistedProblemState } from '../../hooks/usePersistedProblemState'
import { PROBLEM_5 } from '../../data/problems/problem-5'
import { checkProblem5 } from '../../lib/answerChecker'

interface P5State { costPlaced: boolean; profitAnswer: string }
const DEFAULT: P5State = { costPlaced: false, profitAnswer: '' }

export function Problem5PayoutVsProfit() {
  const { state, setState, loaded, reset } = usePersistedProblemState<P5State>('problem-5', DEFAULT)
  const session = useProblemSession(PROBLEM_5, state)

  if (!loaded || !session.sessionLoaded) return <div className="loading-screen"><div className="spinner" /><p>Loading…</p></div>

  const currentTask = !state.costPlaced
    ? 'Tap the cost block to subtract the cost from the expected payout.'
    : 'Now enter the expected profit: expected payout − cost.'

  const taskGuide = (
    <TaskGuide
      currentTask={currentTask}
      steps={[
        { id: 'cost', label: 'Subtract cost from expected payout', done: state.costPlaced },
        { id: 'profit', label: 'Enter the expected profit', done: session.completed },
      ]}
    />
  )

  return (
    <ProblemLayout problem={PROBLEM_5} problemNumber={5} feedback={session.feedback} completed={session.completed}
      revealedHintIds={session.revealedHintIds} onRevealHint={session.revealHint} nextProblemId="problem-6"
      restarted={session.restarted} onRestart={() => { reset(); session.restart() }} onReview={session.backToReview}
      attemptCount={session.finalAttemptCount} lastSubmittedAnswer={session.lastSubmittedAnswer} reviewHintUsed={session.reviewHintUsed}
      taskGuide={taskGuide}>
      <section className="card problem-section">
        <BalanceScale payout={4} cost={3} costPlaced={state.costPlaced} onPlaceCost={() => setState((p) => ({ ...p, costPlaced: true }))} />
        <label className="field-label">Expected profit
          <input className="touch-input" value={state.profitAnswer} onChange={(e) => setState((p) => ({ ...p, profitAnswer: e.target.value }))} disabled={!state.costPlaced} />
        </label>
        <button type="button" className="btn-secondary touch-target" disabled={!state.costPlaced || session.submitting}
          onClick={() => void session.handleCheck(checkProblem5({ formulaSelected: state.costPlaced, profitAnswer: state.profitAnswer }), 'final', state.profitAnswer, state.profitAnswer)}>Submit answer</button>
      </section>
    </ProblemLayout>
  )
}
