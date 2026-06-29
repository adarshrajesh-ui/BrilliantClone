import { CardDealScene, EvBadge } from '../visuals/cards'
import { PokerChipLoader } from '../PokerChipLoader'
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
    return <PokerChipLoader label="Loading problem…" />
  }

  const showStatus = Boolean(session.feedback && !session.feedback.isCorrect && session.feedback.mistakeType)
  const contribStatus: FieldStatus[] | undefined = showStatus
    ? state.contributions.map((c, i) => numericFieldStatus(c, EXPECTED_CONTRIBS[i]))
    : undefined
  const evStatus: FieldStatus | undefined = showStatus
    ? numericFieldStatus(state.evAnswer, DEALT_HAND_L3P2_EV)
    : undefined

  const allContribsFilled = state.contributions.every((c) => c.trim() !== '')
  const canSubmit = allContribsFilled && state.evAnswer.trim() !== ''
  const canShowSolutionExplanation = session.completed || session.feedback?.canComplete === true
  const layoutProblem = canShowSolutionExplanation
    ? PROBLEM_4
    : { ...PROBLEM_4, teachingExplanation: undefined }

  const update = (i: number, val: string) =>
    setState((p) => ({
      ...p,
      activeRow: i,
      contributions: p.contributions.map((c, idx) => (idx === i ? val : c)) as State['contributions'],
    }))

  const statusClass = (s: FieldStatus | undefined) => (s ? ` cell-status cell-status-${s}` : '')

  const renderVisual = (autoPlay = true) => (
    <div className="ws-visual">
      <CardDealScene
        cards={DEALT_HAND_L3P2}
        groups={DEALT_HAND_L3P2_GROUPS}
        highlightValue={state.activeRow !== null ? ROW_VALUES[state.activeRow] : null}
        showCounts
        showContributions={session.completed}
        visualCap={4}
        caption="An 8-card hand, grouped by value"
        autoPlay={autoPlay}
      />
      {session.completed && <EvBadge value={DEALT_HAND_L3P2_EV} label="Expected value per card" />}
    </div>
  )

  const steps: WorkspaceStepDef[] = [
    {
      id: 'contribs',
      title: 'Fill each contribution',
      prompt: 'Fill each contribution.',
      canAdvance: allContribsFilled,
      advanceHint: 'Fill all three contributions to continue.',
      content: (
        <>
          {renderVisual()}
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
      prompt: 'Add the three contributions to find the expected value of one random card drawn from the hand.',
      action: (
        <button type="button" className="btn-secondary touch-target" disabled={session.submitting || !canSubmit}
          onClick={() => void session.handleCheck(
            checkDealtHand({ contributions: state.contributions, evAnswer: state.evAnswer }),
            'final', formatAnswer(state), formatAnswer(state),
          )}>{session.submitting ? 'Saving…' : 'Submit answer'}</button>
      ),
      content: (
        <>
          {renderVisual(false)}
          {allContribsFilled && (
            <p className="section-note">Add the three contributions, then type the expected value per card.</p>
          )}
          <label className={`field-label${evStatus ? ` cell-status cell-status-${evStatus}` : ''}`}>Expected value per card
            <input className="touch-input" value={state.evAnswer} inputMode="decimal"
              aria-label="Expected value of one random card drawn from the hand"
              onChange={(e) => setState((p) => ({ ...p, evAnswer: e.target.value }))} />
          </label>
          <p className="sr-only" role="status" aria-live="polite">
            {allContribsFilled ? 'Add the three contributions, then type the expected value per card.' : 'Fill each contribution: value times probability.'}
          </p>
        </>
      ),
    },
  ]

  return (
    <ProblemLayout problem={layoutProblem} problemNumber={7} workspaceMinimalHeader feedback={session.feedback} completed={session.completed} justCompleted={session.justCompleted} streakResult={session.streakResult}
      revealedHintIds={session.revealedHintIds} onRevealHint={session.revealHint} nextProblemId="ev-l3-p3"
      restarted={session.restarted} onRestart={() => { reset(); session.restart() }} onReview={session.backToReview}
      attemptCount={session.finalAttemptCount} lastSubmittedAnswer={session.lastSubmittedAnswer} reviewHintUsed={session.reviewHintUsed}
      completionMessage="You completed the contribution table and found the expected value per card."
      steps={steps} onStepChange={session.clearFeedback} />
  )
}
