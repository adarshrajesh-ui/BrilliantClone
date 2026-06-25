import { CardDealScene, EvBadge } from '../visuals/cards'
import { MINI_DECK_L3P3, MINI_DECK_L3P3_GROUPS } from '../../data/cards'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { useProblemSession } from '../../hooks/useProblemSession'
import { usePersistedProblemState } from '../../hooks/usePersistedProblemState'
import { EV_L3_P3 } from '../../data/problems/ev-l3-p3'
import { checkMiniDeck } from './EvL3P3MiniDeckTable.checker'
import { areNumbersClose, normalizeNumericAnswer } from '../../lib/answerParser'
import { probabilityFieldStatus, type FieldStatus } from '../../lib/fieldStatus'
import type { WorkspaceStepDef } from '../../features/learning-experience'
import './EvL3P3MiniDeckTable.css'

const VALUES = [1, 7, 10]
const EXPECTED_COUNTS = [3, 3, 4]
const EXPECTED_PROBS = [3 / 10, 3 / 10, 4 / 10]
const EXPECTED_CONTRIBS = [0.3, 2.1, 4.0]
const EV = 6.4

interface Row {
  count: string
  probability: string
  contribution: string
}

interface State {
  activeRow: number | null
  rows: [Row, Row, Row]
  evAnswer: string
}

const DEFAULT: State = {
  activeRow: null,
  rows: [
    { count: '', probability: '', contribution: '' },
    { count: '', probability: '', contribution: '' },
    { count: '', probability: '', contribution: '' },
  ],
  evAnswer: '',
}

function tableNumericFieldStatus(value: string, expected: number, tolerance = 0.01): FieldStatus {
  if (value.trim() === '') {
    return 'empty'
  }
  if (value.trim().endsWith('%')) {
    return 'bad'
  }
  const parsed = normalizeNumericAnswer(value)
  if (parsed === null) {
    return 'bad'
  }
  return areNumbersClose(parsed, expected, tolerance) ? 'ok' : 'bad'
}

function rowComplete(r: Row, i: number): boolean {
  return (
    tableNumericFieldStatus(r.count, EXPECTED_COUNTS[i]) === 'ok' &&
    probabilityFieldStatus(r.probability, EXPECTED_PROBS[i]) === 'ok' &&
    tableNumericFieldStatus(r.contribution, EXPECTED_CONTRIBS[i]) === 'ok'
  )
}

function formatRows(rows: State['rows']): string {
  return rows
    .map((r, i) => `value ${VALUES[i]} → count ${r.count || '—'}, prob ${r.probability || '—'}, contribution ${r.contribution || '—'}`)
    .join('; ')
}

export function EvL3P3MiniDeckTable() {
  const { state, setState, loaded, reset } = usePersistedProblemState<State>('ev-l3-p3', DEFAULT)
  const session = useProblemSession(EV_L3_P3, state)

  if (!loaded || !session.sessionLoaded) {
    return <div className="loading-screen"><div className="spinner" /><p>Loading problem…</p></div>
  }

  const showStatus = Boolean(session.feedback && !session.feedback.isCorrect && session.feedback.mistakeType)
  const countStatus: FieldStatus[] | undefined = showStatus
    ? state.rows.map((r, i) => tableNumericFieldStatus(r.count, EXPECTED_COUNTS[i]))
    : undefined
  const probStatus: FieldStatus[] | undefined = showStatus
    ? state.rows.map((r, i) => probabilityFieldStatus(r.probability, EXPECTED_PROBS[i]))
    : undefined
  const contribStatus: FieldStatus[] | undefined = showStatus
    ? state.rows.map((r, i) => tableNumericFieldStatus(r.contribution, EXPECTED_CONTRIBS[i]))
    : undefined

  const rowsDone = state.rows.map((r, i) => rowComplete(r, i))
  const allRowsDone = rowsDone.every(Boolean)
  const activeRowValue = state.activeRow !== null ? VALUES[state.activeRow] : null

  const update = (i: number, field: keyof Row, val: string) =>
    setState((p) => ({
      ...p,
      activeRow: i,
      rows: p.rows.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)) as State['rows'],
    }))

  const statusClass = (s: FieldStatus | undefined) => (s ? ` cell-status cell-status-${s}` : '')

  const steps: WorkspaceStepDef[] = [
    {
      id: 'deck',
      title: 'Inspect the dealt mini-deck',
      prompt: 'Ten cards are dealt and grouped by value. Count how many cards share each value (Aces = 1; J, Q, K = 10).',
      content: (
        <div className="ws-visual">
          <CardDealScene
            cards={MINI_DECK_L3P3}
            groups={MINI_DECK_L3P3_GROUPS}
            showCounts
            visualCap={4}
            highlightValue={activeRowValue}
            caption="One draw from the 10-card mini deck"
          />
          {session.completed && <EvBadge value={EV} />}
        </div>
      ),
    },
    {
      id: 'table',
      title: 'Build the table and find the EV',
      prompt: 'For each value fill count, probability (count ÷ 10) and contribution (value × probability), then add the contributions for the expected value.',
      content: (
        <div className="mini-deck-workspace">
          <p className="section-note tap-hint">Probability = count ÷ 10 total cards. Contribution = value × probability. EV = sum of the contributions.</p>
          <div className="mini-deck-grid">
            <div className="mini-deck-visual" aria-label="Mini-deck cards grouped by value">
              <CardDealScene
                cards={MINI_DECK_L3P3}
                groups={MINI_DECK_L3P3_GROUPS}
                showCounts
                visualCap={4}
                highlightValue={activeRowValue}
                caption="Use these groups while filling the table"
                autoPlay={false}
              />
            </div>
            <div className="mini-deck-table-panel">
              <div className="table-wrap mini-deck-table-wrap">
                <table className="prob-table mini-deck-table">
                  <thead>
                    <tr>
                      <th>Value</th>
                      <th>Count</th>
                      <th>Probability</th>
                      <th>Contribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.rows.map((r, i) => (
                      <tr key={VALUES[i]} className={state.activeRow === i ? 'prob-row-active' : ''}>
                        <td data-label="Value"><span className="prob-cell-given">{VALUES[i]}</span></td>
                        <td data-label="Count" className={statusClass(countStatus?.[i])}>
                          <input className="touch-input" type="text" value={r.count} inputMode="numeric"
                            aria-label={`Count for value ${VALUES[i]}`}
                            onChange={(e) => update(i, 'count', e.target.value)}
                            onFocus={() => setState((p) => ({ ...p, activeRow: i }))} />
                        </td>
                        <td data-label="Probability" className={statusClass(probStatus?.[i])}>
                          <input className="touch-input" type="text" value={r.probability} inputMode="decimal"
                            aria-label={`Probability for value ${VALUES[i]}`}
                            onChange={(e) => update(i, 'probability', e.target.value)}
                            onFocus={() => setState((p) => ({ ...p, activeRow: i }))} />
                        </td>
                        <td data-label="Contribution" className={statusClass(contribStatus?.[i])}>
                          <input className="touch-input" type="text" value={r.contribution} inputMode="decimal"
                            aria-label={`Contribution for value ${VALUES[i]}`}
                            onChange={(e) => update(i, 'contribution', e.target.value)}
                            onFocus={() => setState((p) => ({ ...p, activeRow: i }))} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <label className="field-label mini-deck-ev-field">Expected value
                <input className="touch-input" value={state.evAnswer} inputMode="decimal"
                  aria-label="Expected value"
                  onChange={(e) => setState((p) => ({ ...p, evAnswer: e.target.value }))} />
              </label>
            </div>
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {allRowsDone ? 'Add the contributions you entered, then type the expected value.' : 'Fill the count, probability, and contribution for each row, then the expected value.'}
          </p>
          <button type="button" className="btn-secondary touch-target" disabled={session.submitting}
            onClick={() => void session.handleCheck(
              checkMiniDeck({ rows: state.rows, evAnswer: state.evAnswer }),
              'final', formatRows(state.rows), formatRows(state.rows),
            )}>Submit answer</button>
        </div>
      ),
    },
  ]

  return (
    <ProblemLayout problem={EV_L3_P3} problemNumber={9} feedback={session.feedback} completed={session.completed}
      revealedHintIds={session.revealedHintIds} onRevealHint={session.revealHint} nextProblemId="problem-5"
      restarted={session.restarted} onRestart={() => { reset(); session.restart() }} onReview={session.backToReview}
      attemptCount={session.finalAttemptCount} lastSubmittedAnswer={session.lastSubmittedAnswer} reviewHintUsed={session.reviewHintUsed}
      steps={steps} />
  )
}
