import { MysteryBoxes, MYSTERY_BOXES_P3 } from '../visuals/MysteryBoxes'
import { ProbabilityTable } from '../visuals/ProbabilityTable'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { TaskGuide } from '../lesson/TaskGuide'
import { useProblemSession } from '../../hooks/useProblemSession'
import { usePersistedProblemState } from '../../hooks/usePersistedProblemState'
import { PROBLEM_3 } from '../../data/problems/problem-3'
import { PROBLEM_3_DEMO, PROBLEM_3_DEMO_CTA } from '../lesson/problemDemos'
import { checkProblem3 } from '../../lib/answerChecker'
import { probabilityFieldStatus } from '../../lib/fieldStatus'

const EXPECTED_COUNTS = [1, 2, 3]
const EXPECTED_PROBS = [1 / 6, 2 / 6, 3 / 6]

interface P3State {
  revealed: number[]
  activeRow: number | null
  rows: Array<{ outcome: string; count: string; probability: string }>
}

const DEFAULT: P3State = {
  revealed: [],
  activeRow: null,
  rows: [
    { outcome: '$12', count: '1', probability: '' },
    { outcome: '$6', count: '2', probability: '' },
    { outcome: '$0', count: '3', probability: '' },
  ],
}

/** Human-readable summary of the learner's submitted table (no raw JSON in review). */
function formatRows(rows: P3State['rows']): string {
  return rows
    .map((r) => `${r.outcome} → count ${r.count} → probability ${r.probability || '—'}`)
    .join('; ')
}

export function Problem3MysteryBoxes() {
  const { state, setState, loaded, reset } = usePersistedProblemState<P3State>('problem-3', DEFAULT)
  const session = useProblemSession(PROBLEM_3, state)

  const highlightValue = state.activeRow !== null ? [12, 6, 0][state.activeRow] : null

  if (!loaded || !session.sessionLoaded) {
    return <div className="loading-screen"><div className="spinner" /><p>Loading problem…</p></div>
  }

  const allRevealed = state.revealed.length === 6
  const showStatus = Boolean(session.feedback && !session.feedback.isCorrect && session.feedback.mistakeType)
  const probabilityStatus = showStatus ? state.rows.map((r, i) => probabilityFieldStatus(r.probability, EXPECTED_PROBS[i])) : undefined

  // The number of boxes for each prize is given in the scenario, so it is shown
  // as fixed (read-only) data. The learner only fills the probability column.
  const tableRows = state.rows.map((r, i) => ({ ...r, count: String(EXPECTED_COUNTS[i]) }))

  const currentTask = !allRevealed
    ? `Reveal all six boxes by tapping them (${state.revealed.length}/6).`
    : 'For each prize, convert its given count to a probability (count ÷ 6).'

  const taskGuide = (
    <TaskGuide
      currentTask={currentTask}
      steps={[
        { id: 'reveal', label: 'Reveal all six boxes', done: allRevealed },
        { id: 'probs', label: 'Convert each given count to a probability (count ÷ 6)', done: session.completed },
      ]}
    />
  )

  return (
    <ProblemLayout problem={PROBLEM_3} problemNumber={3} feedback={session.feedback} completed={session.completed}
      revealedHintIds={session.revealedHintIds} onRevealHint={session.revealHint} nextProblemId="problem-4"
      restarted={session.restarted} onRestart={() => { reset(); session.restart() }} onReview={session.backToReview}
      attemptCount={session.finalAttemptCount} lastSubmittedAnswer={session.lastSubmittedAnswer} reviewHintUsed={session.reviewHintUsed}
      taskGuide={taskGuide}
      demoSteps={PROBLEM_3_DEMO} demoFinalCta={PROBLEM_3_DEMO_CTA}>
      <section className="card problem-section">
        <MysteryBoxes boxes={MYSTERY_BOXES_P3} revealedIds={state.revealed}
          onReveal={(id) => setState((p) => ({ ...p, revealed: [...p.revealed, id] }))} highlightValue={highlightValue} />
      </section>
      <section className="card problem-section">
        <h2>Probability table</h2>
        <p className="section-note tap-hint">The number of boxes is given. Answer here: probability = number of boxes with that prize ÷ 6 total boxes.</p>
        <ProbabilityTable rows={tableRows} activeRow={state.activeRow} countReadOnly
          probabilityStatus={probabilityStatus}
          onChange={(i, field, val) => setState((p) => ({
            ...p, activeRow: i,
            rows: p.rows.map((r, idx) => idx === i ? { ...r, [field]: val } : r),
          }))} />
        <button type="button" className="btn-secondary touch-target" disabled={session.submitting}
          onClick={() => void session.handleCheck(checkProblem3({
            allRevealed: state.revealed.length === 6,
            rows: tableRows.map((row, i) => ({ outcome: [12, 6, 0][i], count: row.count, probability: row.probability })),
          }), 'final', formatRows(tableRows), formatRows(tableRows))}>Submit answer</button>
      </section>
    </ProblemLayout>
  )
}
