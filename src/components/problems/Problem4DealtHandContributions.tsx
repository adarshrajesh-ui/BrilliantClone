import { CardDealScene, EvBadge } from '../visuals/cards'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { useProblemSession } from '../../hooks/useProblemSession'
import { usePersistedProblemState } from '../../hooks/usePersistedProblemState'
import { PROBLEM_4 } from '../../data/problems/problem-4'
import { checkDealtHand } from './Problem4DealtHandContributions.checker'
import { numericFieldStatus, type FieldStatus } from '../../lib/fieldStatus'
import { DEALT_HAND_L3P2, DEALT_HAND_L3P2_GROUPS, DEALT_HAND_L3P2_EV } from '../../data/cards'
import type { WorkspaceStepDef } from '../../features/learning-experience'
import './Problem4DealtHandContributions.css'

// Ascending value order [2, 4, 10] — matches DEALT_HAND_L3P2_GROUPS.
const ROW_VALUES = [2, 4, 10]
const ROW_PROBS = ['1/4', '1/4', '1/2']
const EXPECTED_CONTRIBS = [0.5, 1.0, 5.0]

interface State {
  activeRow: number | null
  contributions: [string, string, string]
  evAnswer: string
}

const DEFAULT: State = {
  activeRow: null,
  contributions: ['', '', ''],
  evAnswer: '',
}

function formatAnswer(state: State): string {
  return state.contributions
    .map((c, i) => `value ${ROW_VALUES[i]} → ${c || '—'}`)
    .join('; ') + `; EV ${state.evAnswer || '—'}`
}

export function Problem4DealtHandContributions() {
  const { state, setState, loaded, reset } = usePersistedProblemState<State>('problem-4', DEFAULT)
  const session = useProblemSession(PROBLEM_4, state)

  if (!loaded || !session.sessionLoaded) {
    return <div className="loading-screen"><div className="spinner" /><p>Loading problem…</p></div>
  }

  const showStatus = Boolean(session.feedback && !session.feedback.isCorrect && session.feedback.mistakeType)
  const contribStatus: FieldStatus[] | undefined = showStatus
    ? state.contributions.map((c, i) => numericFieldStatus(c, EXPECTED_CONTRIBS[i]))
    : undefined

  const allContribsFilled = state.contributions.every((c) => c.trim() !== '')

  const update = (i: number, val: string) =>
    setState((p) => ({
      ...p,
      activeRow: i,
      contributions: p.contributions.map((c, idx) => (idx === i ? val : c)) as State['contributions'],
    }))

  const statusClass = (s: FieldStatus | undefined) => (s ? ` cell-status cell-status-${s}` : '')

  const visual = (
    <div className="ws-visual">
      <CardDealScene
        cards={DEALT_HAND_L3P2}
        groups={DEALT_HAND_L3P2_GROUPS}
        highlightValue={state.activeRow !== null ? ROW_VALUES[state.activeRow] : null}
        showCounts
        showContributions
        caption="An 8-card hand, grouped by value"
      />
      {session.completed && <EvBadge value={DEALT_HAND_L3P2_EV} />}
    </div>
  )

  const steps: WorkspaceStepDef[] = [
    {
      id: 'contribs',
      title: 'Fill each contribution',
      prompt: 'For each value group, use the probability shown to fill the contribution = value × probability.',
      canAdvance: allContribsFilled,
      advanceHint: 'Fill all three contributions to continue.',
      content: (
        <>
          {visual}
          <p className="section-note tap-hint">Contribution = value × probability.</p>
          <div className="table-wrap">
            <table className="prob-table dealt-hand-table">
              <thead>
                <tr>
                  <th>Value</th>
                  <th>Probability</th>
                  <th>Contribution</th>
                </tr>
              </thead>
              <tbody>
                {ROW_VALUES.map((value, i) => (
                  <tr key={value} className={state.activeRow === i ? 'prob-row-active' : ''}>
                    <td data-label="Value"><span className="prob-cell-given">{value}</span></td>
                    <td data-label="Probability"><span className="prob-cell-given">{ROW_PROBS[i]}</span></td>
                    <td data-label="Contribution" className={statusClass(contribStatus?.[i])}>
                      <input className="touch-input" type="text" value={state.contributions[i]} inputMode="decimal"
                        aria-label={`Contribution for value ${value} (${value} times ${ROW_PROBS[i]})`}
                        onChange={(e) => update(i, e.target.value)}
                        onFocus={() => setState((p) => ({ ...p, activeRow: i }))} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'ev',
      title: 'Add the contributions',
      prompt: 'Add the three contributions to find the expected value of the hand.',
      content: (
        <>
          {visual}
          {allContribsFilled && (
            <p className="section-note" aria-hidden="true">Add the three contributions, then type the expected value.</p>
          )}
          <label className="field-label">Expected value
            <input className="touch-input" value={state.evAnswer} inputMode="decimal"
              aria-label="Expected value of the hand"
              onChange={(e) => setState((p) => ({ ...p, evAnswer: e.target.value }))} />
          </label>
          <p className="sr-only" role="status" aria-live="polite">
            {allContribsFilled ? 'Add the three contributions, then type the expected value.' : 'Fill each contribution: value times probability.'}
          </p>
          <button type="button" className="btn-secondary touch-target" disabled={session.submitting}
            onClick={() => void session.handleCheck(
              checkDealtHand({ contributions: state.contributions, evAnswer: state.evAnswer }),
              'final', formatAnswer(state), formatAnswer(state),
            )}>Submit answer</button>
        </>
      ),
    },
  ]

  return (
    <ProblemLayout problem={PROBLEM_4} problemNumber={8} feedback={session.feedback} completed={session.completed}
      revealedHintIds={session.revealedHintIds} onRevealHint={session.revealHint} nextProblemId="ev-l3-p3"
      restarted={session.restarted} onRestart={() => { reset(); session.restart() }} onReview={session.backToReview}
      attemptCount={session.finalAttemptCount} lastSubmittedAnswer={session.lastSubmittedAnswer} reviewHintUsed={session.reviewHintUsed}
      steps={steps} />
  )
}
