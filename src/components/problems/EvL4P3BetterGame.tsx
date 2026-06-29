import './EvL4P3BetterGame.css'
import './l4-workspace.css'
import { useState } from 'react'
import { ProfitMeter } from '../visuals/ProfitMeter'
import { PokerChipLoader } from '../PokerChipLoader'
import { ProblemLayout } from '../lesson/ProblemLayout'
import type { WorkspaceStepDef } from '../../features/learning-experience'
import { useProblemSession } from '../../hooks/useProblemSession'
import { usePersistedProblemState } from '../../hooks/usePersistedProblemState'
import { EV_L4_P3 } from '../../data/problems/ev-l4-p3'
import { checkEvL4P3, checkEvL4P3Profits, checkEvL4P3Choice } from './EvL4P3BetterGame.checker'
import { numericFieldStatus, type FieldStatus } from '../../lib/fieldStatus'
import { normalizeMoneyAnswer } from '../../lib/answerParser'
import type { CheckResult } from '../../types/problem'

const GAMES = [
  { id: 'A', payout: 9, cost: 7, profit: 2 },
  { id: 'B', payout: 6, cost: 3, profit: 3 },
]
const BAR_MAX = Math.max(...GAMES.flatMap((g) => [g.payout, g.cost]))

function barWidth(value: number): string {
  return `${(value / BAR_MAX) * 100}%`
}

interface State {
  profitA: string
  profitB: string
  choice: string
}

const DEFAULT: State = { profitA: '', profitB: '', choice: '' }

/** Per-step badge state. `undefined` = not yet checked (or cleared on edit). */
type StepStatus = 'correct' | 'incorrect' | undefined
type Checks = { profits: StepStatus; choice: StepStatus }
const NO_CHECKS: Checks = { profits: undefined, choice: undefined }

// Map a CheckResult to a badge status: 'correct' when right, 'incorrect' on a
// real mistake, undefined for guard results (not yet answerable).
function statusFromResult(result: CheckResult): StepStatus {
  if (result.isCorrect) return 'correct'
  if (result.mistakeType === '') return undefined
  return 'incorrect'
}

const ADVANCE_HINT = 'Check this step and fix it to continue.'

export function EvL4P3BetterGame() {
  const { state, setState, loaded, reset } = usePersistedProblemState<State>('ev-l4-p3', DEFAULT)
  const session = useProblemSession(EV_L4_P3, state)
  // Per-step check results drive the status badge AND the Next gate. Editing a
  // profit or picking a new game clears that step's flag (direct-correction).
  const [checks, setChecks] = useState<Checks>(NO_CHECKS)

  if (!loaded || !session.sessionLoaded) return <PokerChipLoader label="Loading…" />

  const profitValues = [state.profitA, state.profitB]
  const profitsFilled = profitValues.every((p) => p.trim() !== '')
  const showStatus = Boolean(session.feedback && !session.feedback.isCorrect && session.feedback.mistakeType)
  const profitStatus: (FieldStatus | undefined)[] = GAMES.map((g, i) =>
    showStatus ? numericFieldStatus(profitValues[i], g.profit) : undefined,
  )

  const setProfit = (id: string, val: string) => {
    setState((p) => (id === 'A' ? { ...p, profitA: val } : { ...p, profitB: val }))
    setChecks((p) => ({ ...p, profits: undefined }))
  }

  // Check the 'profits' step in isolation; badge + Next gate read from `checks`.
  const checkProfits = () => {
    const result = checkEvL4P3Profits(state.profitA, state.profitB)
    setChecks((p) => ({ ...p, profits: statusFromResult(result) }))
    void session.handleCheck(
      result,
      'profits',
      `A profit ${state.profitA || '—'}, B profit ${state.profitB || '—'}`,
      `${state.profitA};${state.profitB}`,
    )
  }

  // Final step: the holistic checker drives completion (stepId 'final'). By now
  // 'profits' is already correct (Next was gated), so this validates the choice
  // and finishes the problem. The badge is set from the choice-only checker.
  const checkFinal = () => {
    const result = checkEvL4P3({ profitA: state.profitA, profitB: state.profitB, choice: state.choice })
    setChecks((p) => ({ ...p, choice: statusFromResult(checkEvL4P3Choice(state.choice)) }))
    void session.handleCheck(
      result,
      'final',
      `A profit ${state.profitA || '—'}, B profit ${state.profitB || '—'}, choice ${state.choice || '—'}`,
      state.choice,
    )
  }

  const profitsStep: WorkspaceStepDef = {
    id: 'profits',
    title: 'Find each game\u2019s profit',
    prompt: 'Work out each game\u2019s expected profit: payout − cost.',
    status: checks.profits,
    canAdvance: checks.profits === 'correct',
    advanceHint: ADVANCE_HINT,
    action: (
      <button
        type="button"
        className="btn-secondary touch-target ws-step-check"
        disabled={session.submitting || !profitsFilled}
        onClick={checkProfits}
      >
        Check
      </button>
    ),
    content: (
      <div className="l4-better-step ws-compact">
        <p className="section-note tap-hint">The bigger payout is not always the better game. Subtract each cost first.</p>
        <div className="game-cards better-game-cards">
          {GAMES.map((g, i) => {
            const entered = normalizeMoneyAnswer(profitValues[i])
            return (
              <div key={g.id} className="game-card better-game-card">
                <strong>Game {g.id}</strong>
                <div className="bar-row"><span>Payout</span><div className="bar bar-payout" style={{ width: barWidth(g.payout) }}>${g.payout}</div></div>
                <div className="bar-row"><span>Cost</span><div className="bar bar-cost" style={{ width: barWidth(g.cost) }}>${g.cost}</div></div>
                <div className="better-game-profit-row">
                  <label className={`field-label better-game-profit-field${profitStatus[i] ? ` cell-status cell-status-${profitStatus[i]}` : ''}`}>
                    Expected profit
                    <input className="touch-input" value={profitValues[i]} inputMode="decimal"
                      aria-label={`Expected profit for Game ${g.id}`}
                      onChange={(e) => setProfit(g.id, e.target.value)} />
                  </label>
                  <ProfitMeter value={entered ?? 0} max={g.payout} />
                </div>
              </div>
            )
          })}
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {profitsFilled
            ? `Game A profit entered ${state.profitA || 'blank'}, Game B profit entered ${state.profitB || 'blank'}.${state.choice ? ` Selected Game ${state.choice}.` : ''}`
            : 'Enter the expected profit for each game.'}
        </p>
      </div>
    ),
  }

  const chooseStep: WorkspaceStepDef = {
    id: 'choose',
    title: 'Pick the better game',
    status: checks.choice,
    prompt: 'Which is the better game for the player?',
    action: (
      <button type="button" className="btn-secondary touch-target ws-step-check"
        disabled={session.submitting || state.choice === ''}
        onClick={checkFinal}>
        {session.submitting ? 'Saving…' : 'Submit answer'}
      </button>
    ),
    content: (
      <div className="l4-better-step ws-compact">
        <div className="better-game-recap" aria-label="Your computed profits">
          <p className="section-note">
            Game A expected profit: <strong>{state.profitA || '—'}</strong>
            {' · '}
            Game B expected profit: <strong>{state.profitB || '—'}</strong>
          </p>
        </div>
        <fieldset className="better-game-selector">
          <legend>Which is the better game?</legend>
          <div className="better-game-choices">
            {GAMES.map((g) => (
              <button key={g.id} type="button"
                className={`btn-choice touch-target${state.choice === g.id ? ' btn-choice-selected' : ''}`}
                aria-pressed={state.choice === g.id}
                onClick={() => {
                  setState((p) => ({ ...p, choice: g.id }))
                  setChecks((p) => ({ ...p, choice: undefined }))
                }}>
                Game {g.id}
              </button>
            ))}
          </div>
        </fieldset>

      </div>
    ),
  }

  const steps: WorkspaceStepDef[] = [profitsStep, chooseStep]

  return (
    <ProblemLayout problem={EV_L4_P3} problemNumber={12} workspaceMinimalHeader feedback={session.feedback} completed={session.completed} justCompleted={session.justCompleted} streakResult={session.streakResult}
      revealedHintIds={session.revealedHintIds} onRevealHint={session.revealHint} nextProblemId="problem-7"
      restarted={session.restarted} onRestart={() => { reset(); setChecks(NO_CHECKS); session.restart() }} onReview={session.backToReview}
      attemptCount={session.finalAttemptCount} lastSubmittedAnswer={session.lastSubmittedAnswer} reviewHintUsed={session.reviewHintUsed}
      completionMessage="You found Game A keeps $2 and Game B keeps $3 — Game B is the better game."
      steps={steps} onStepChange={session.clearFeedback} />
  )
}
