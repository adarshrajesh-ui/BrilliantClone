import { useState } from 'react'
import { CarnivalWheel, buildWheelSections } from '../visuals/CarnivalWheel'
import { FairnessNumberLine } from '../visuals/FairnessNumberLine'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { useProblemSession } from '../../hooks/useProblemSession'
import { usePersistedProblemState } from '../../hooks/usePersistedProblemState'
import { QuestionPrompt, type WorkspaceStepDef } from '../../features/learning-experience'
import type { CheckResult } from '../../types/problem'
import {
  EV_L5_P3,
  checkFinalDecision,
  checkEvL5P3Table,
  checkEvL5P3Payout,
  checkEvL5P3Profit,
  checkEvL5P3Decision,
  checkEvL5P3Risk,
} from '../../data/problems/ev-l5-p3'
import { probabilityFieldStatus, type FieldStatus } from '../../lib/fieldStatus'
import { areNumbersClose, normalizeNumericAnswer } from '../../lib/answerParser'
import './lesson5.css'

const WHEEL_SECTIONS = buildWheelSections([
  { value: 36, count: 1 },
  { value: 12, count: 3 },
  { value: 0, count: 8 },
])
const PAYOUT_GROUPS = [36, 12, 0]
const EXPECTED_PROBS = [1 / 12, 3 / 12, 8 / 12]
const EXPECTED_CONTRIBS = [3, 3, 0]

const RISK_OPTIONS = [
  { value: 'variable-outcomes', label: 'It’s fair on average, but a single play can still return $0, $12, or $36.' },
  { value: 'guaranteed', label: 'Fair means you always get your $6 back on every play.' },
  { value: 'no-risk', label: 'A fair game carries no risk at all.' },
]

interface P3State {
  selectedPayout: number | null
  viewedPayouts: number[]
  probabilities: [string, string, string]
  contributions: [string, string, string]
  expectedPayout: string
  expectedProfit: string
  decision: string
  riskChoice: string
}

const DEFAULT: P3State = {
  selectedPayout: null,
  viewedPayouts: [],
  probabilities: ['', '', ''],
  contributions: ['', '', ''],
  expectedPayout: '',
  expectedProfit: '',
  decision: '',
  riskChoice: '',
}

/** Per-step badge state. `undefined` = not yet checked (or cleared on edit). */
type StepStatus = 'correct' | 'incorrect' | undefined
type Checks = {
  table: StepStatus
  payout: StepStatus
  profit: StepStatus
  decision: StepStatus
  risk: StepStatus
}
const NO_CHECKS: Checks = {
  table: undefined,
  payout: undefined,
  profit: undefined,
  decision: undefined,
  risk: undefined,
}

// Map a CheckResult to a badge status: 'correct' when right, 'incorrect' when a
// real mistake, undefined for guard results (not yet answerable).
function statusFromResult(result: CheckResult): StepStatus {
  if (result.isCorrect) return 'correct'
  if (result.mistakeType === '') return undefined
  return 'incorrect'
}

const ADVANCE_HINT = 'Check this step and fix it to continue.'

function parseMoney(raw: string): number | null {
  if (raw.includes('%')) {
    return null
  }
  return normalizeNumericAnswer(raw)
}

function amountFieldStatus(value: string, expected: number, tolerance = 0.01): FieldStatus {
  if (value.trim() === '') {
    return 'empty'
  }
  if (value.includes('%')) {
    return 'bad'
  }
  const parsed = normalizeNumericAnswer(value)
  if (parsed === null) {
    return 'bad'
  }
  return areNumbersClose(parsed, expected, tolerance) ? 'ok' : 'bad'
}

export function EvL5P3FinalDecision() {
  const { state, setState, loaded, reset } = usePersistedProblemState<P3State>('ev-l5-p3', DEFAULT)
  const session = useProblemSession(EV_L5_P3, state)
  // Per-step check results drive the status badge AND the Next gate. Editing a
  // field clears that step's flag (direct-correction) so a stale ✓/! never lingers.
  const [checks, setChecks] = useState<Checks>(NO_CHECKS)

  if (!loaded || !session.sessionLoaded) {
    return <div className="loading-screen"><div className="spinner" /><p>Loading…</p></div>
  }

  const grouped = PAYOUT_GROUPS.every((v) => state.viewedPayouts.includes(v))
  const probsFilled = state.probabilities.every((x) => x.trim() !== '')
  const contribsFilled = state.contributions.every((x) => x.trim() !== '')
  const payoutFilled = state.expectedPayout.trim() !== ''
  const profitFilled = state.expectedProfit.trim() !== ''
  const decisionFilled = state.decision !== ''
  const riskFilled = state.riskChoice !== ''

  const filled = [grouped, contribsFilled, payoutFilled, profitFilled, decisionFilled, riskFilled]
  const activeIndex = filled.findIndex((f) => !f)
  const allFilled = activeIndex === -1
  const reached = (i: number) => allFilled || i <= activeIndex

  // Inline cell statuses only appear after an incorrect table check (direct correction).
  const showStatus = checks.table === 'incorrect'
  const probStatus: FieldStatus[] | undefined = showStatus
    ? state.probabilities.map((x, i) => probabilityFieldStatus(x, EXPECTED_PROBS[i]))
    : undefined
  const contribStatus: FieldStatus[] | undefined = showStatus
    ? state.contributions.map((x, i) => amountFieldStatus(x, EXPECTED_CONTRIBS[i]))
    : undefined

  const profitValue = parseMoney(state.expectedProfit)

  const stepClass = (index: number, done: boolean) =>
    `l5-step${done ? ' l5-step-done' : activeIndex === index ? ' l5-step-active' : reached(index) ? '' : ' l5-step-locked'}`

  const rows = [
    { outcome: '$36', count: '1 section', prob: 0 },
    { outcome: '$12', count: '3 sections', prob: 1 },
    { outcome: '$0', count: '8 sections', prob: 2 },
  ]

  const cellStatusClass = (status: FieldStatus) => (status ? ` cell-status cell-status-${status}` : '')

  // Per-step checks — each validates ONLY its own field(s), drives the badge and
  // the Next gate, and records an attempt under its own stepId.
  const checkTable = () => {
    const result = checkEvL5P3Table(state.probabilities, state.contributions)
    setChecks((p) => ({ ...p, table: statusFromResult(result) }))
    void session.handleCheck(
      result,
      'table',
      `probs=${state.probabilities.join(',')};contribs=${state.contributions.join(',')}`,
      state.contributions.join(','),
    )
  }

  const checkPayout = () => {
    const result = checkEvL5P3Payout(state.expectedPayout)
    setChecks((p) => ({ ...p, payout: statusFromResult(result) }))
    void session.handleCheck(result, 'payout', `payout=${state.expectedPayout}`, state.expectedPayout)
  }

  const checkProfit = () => {
    const result = checkEvL5P3Profit(state.expectedProfit)
    setChecks((p) => ({ ...p, profit: statusFromResult(result) }))
    void session.handleCheck(result, 'profit', `profit=${state.expectedProfit}`, state.expectedProfit)
  }

  const checkDecision = () => {
    const result = checkEvL5P3Decision(state.decision)
    setChecks((p) => ({ ...p, decision: statusFromResult(result) }))
    void session.handleCheck(result, 'decide', `decision=${state.decision}`, state.decision)
  }

  // Final step: the holistic checker drives completion (stepId 'final'). Earlier
  // steps are already correct (Next was gated), so this validates the risk choice
  // alongside the full model and finishes the problem.
  const checkFinal = () => {
    const result = checkFinalDecision({
      grouped,
      probabilities: state.probabilities,
      contributions: state.contributions,
      expectedPayout: state.expectedPayout,
      expectedProfit: state.expectedProfit,
      decision: state.decision,
      riskChoice: state.riskChoice,
    })
    setChecks((p) => ({ ...p, risk: statusFromResult(checkEvL5P3Risk(state.riskChoice)) }))
    void session.handleCheck(result, 'final', JSON.stringify(state), state.decision)
  }

  const steps: WorkspaceStepDef[] = [
    {
      id: 'group',
      title: 'Carnival wheel (12 sections)',
      prompt: <QuestionPrompt>Tap the wheel sections to group them by payout.</QuestionPrompt>,
      canAdvance: grouped,
      advanceHint: 'Tap all three payout groups to continue.',
      content: (
        <>
          <div className="ws-visual">
            <CarnivalWheel
              sections={WHEEL_SECTIONS}
              selectedValue={state.selectedPayout}
              onSelectValue={(v) => setState((p) => ({
                ...p,
                selectedPayout: v,
                viewedPayouts: p.viewedPayouts.includes(v) ? p.viewedPayouts : [...p.viewedPayouts, v],
              }))}
            />
          </div>
          <p className="section-note">Cost to play: $6 · Tap each payout group to build the table.</p>
        </>
      ),
    },
    {
      id: 'table',
      title: 'Build the probability table',
      prompt: <QuestionPrompt>Enter each probability (sections ÷ 12), then each contribution (outcome × probability).</QuestionPrompt>,
      status: checks.table,
      canAdvance: checks.table === 'correct',
      advanceHint: ADVANCE_HINT,
      content: (
        <>
          <table className="l5-section-table">
            <thead>
              <tr><th>Outcome</th><th>Sections</th><th>Probability (÷ 12)</th><th>Contribution</th></tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.outcome}>
                  <td data-label="Outcome">{row.outcome}</td>
                  <td data-label="Sections">{row.count}</td>
                  <td data-label="Probability" className={cellStatusClass(probStatus?.[row.prob])}>
                    <input
                      className="touch-input"
                      inputMode="decimal"
                      value={state.probabilities[row.prob]}
                      disabled={!grouped}
                      aria-label={`Probability for ${row.outcome}`}
                      onChange={(e) => {
                        const value = e.target.value
                        setState((p) => ({
                          ...p,
                          probabilities: p.probabilities.map((x, idx) => (idx === row.prob ? value : x)) as [string, string, string],
                        }))
                        setChecks((p) => ({ ...p, table: undefined }))
                      }}
                    />
                  </td>
                  <td data-label="Contribution" className={cellStatusClass(contribStatus?.[row.prob])}>
                    <input
                      className="touch-input"
                      inputMode="decimal"
                      value={state.contributions[row.prob]}
                      disabled={!probsFilled}
                      aria-label={`Contribution for ${row.outcome}`}
                      onChange={(e) => {
                        const value = e.target.value
                        setState((p) => ({
                          ...p,
                          contributions: p.contributions.map((x, idx) => (idx === row.prob ? value : x)) as [string, string, string],
                        }))
                        setChecks((p) => ({ ...p, table: undefined }))
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            className="btn-secondary touch-target ws-step-check"
            disabled={!probsFilled || !contribsFilled}
            onClick={checkTable}
          >
            Check
          </button>
        </>
      ),
    },
    {
      id: 'payout',
      title: 'Expected payout',
      prompt: <QuestionPrompt>Add the contributions for the expected payout.</QuestionPrompt>,
      status: checks.payout,
      canAdvance: checks.payout === 'correct',
      advanceHint: ADVANCE_HINT,
      content: (
        <div className={stepClass(2, checks.payout === 'correct')}>
          <div className="l5-step-head">
            <span className="l5-step-title">Expected payout</span>
            {checks.payout === 'correct' && <span className="l5-step-badge">✓</span>}
          </div>
          <input
            className="touch-input"
            inputMode="decimal"
            value={state.expectedPayout}
            placeholder="Sum of contributions"
            aria-label="Expected payout"
            onChange={(e) => {
              const value = e.target.value
              setState((p) => ({ ...p, expectedPayout: value }))
              setChecks((p) => ({ ...p, payout: undefined }))
            }}
          />
          <button
            type="button"
            className="btn-secondary touch-target ws-step-check"
            disabled={!payoutFilled}
            onClick={checkPayout}
          >
            Check
          </button>
        </div>
      ),
    },
    {
      id: 'profit',
      title: 'Expected profit',
      prompt: <QuestionPrompt>Subtract the $6 cost for the expected profit.</QuestionPrompt>,
      status: checks.profit,
      canAdvance: checks.profit === 'correct',
      advanceHint: ADVANCE_HINT,
      content: (
        <div className={stepClass(3, checks.profit === 'correct')}>
          <div className="l5-step-head">
            <span className="l5-step-title">Expected profit</span>
            <span className="l5-cost-block">Cost to play: $6</span>
          </div>
          <input
            className="touch-input"
            inputMode="decimal"
            value={state.expectedProfit}
            placeholder="Payout − $6 cost"
            aria-label="Expected profit"
            onChange={(e) => {
              const value = e.target.value
              setState((p) => ({ ...p, expectedProfit: value }))
              setChecks((p) => ({ ...p, profit: undefined }))
            }}
          />
          <button
            type="button"
            className="btn-secondary touch-target ws-step-check"
            disabled={!profitFilled}
            onClick={checkProfit}
          >
            Check
          </button>
        </div>
      ),
    },
    {
      id: 'decide',
      title: 'Decision',
      prompt: <QuestionPrompt label="Question">Is the game fair, favorable, or unfavorable?</QuestionPrompt>,
      status: checks.decision,
      canAdvance: checks.decision === 'correct',
      advanceHint: ADVANCE_HINT,
      content: (
        <div className={stepClass(4, checks.decision === 'correct')}>
          <div className="l5-step-head">
            <span className="l5-step-title">Decision</span>
          </div>
          <select
            className="touch-input"
            value={state.decision}
            aria-label="Fairness decision"
            onChange={(e) => {
              const value = e.target.value
              setState((p) => ({ ...p, decision: value }))
              setChecks((p) => ({ ...p, decision: undefined }))
            }}
          >
            <option value="">Choose…</option>
            <option value="fair">Fair</option>
            <option value="favorable">Favorable</option>
            <option value="unfavorable">Unfavorable</option>
          </select>
          <FairnessNumberLine value={profitValue} highlightZero={profitValue === 0} />
          <button
            type="button"
            className="btn-secondary touch-target ws-step-check"
            disabled={!decisionFilled}
            onClick={checkDecision}
          >
            Check
          </button>
        </div>
      ),
    },
    {
      id: 'risk',
      title: 'Interpret the risk',
      prompt: (
        <>
          <QuestionPrompt>Interpret the remaining risk.</QuestionPrompt>
          Then submit your full model.
        </>
      ),
      status: checks.risk,
      content: (
        <>
          <fieldset className={stepClass(5, checks.risk === 'correct')}>
            <div className="l5-step-head">
              <span className="l5-step-title">Interpret the risk</span>
            </div>
            <div className="l5-options">
              {RISK_OPTIONS.map((opt) => (
                <label key={opt.value} className={`l5-option${state.riskChoice === opt.value ? ' l5-option-selected' : ''}`}>
                  <input
                    type="radio"
                    name="riskChoice"
                    value={opt.value}
                    checked={state.riskChoice === opt.value}
                    onChange={() => {
                      setState((p) => ({ ...p, riskChoice: opt.value }))
                      setChecks((p) => ({ ...p, risk: undefined }))
                    }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            className="btn-secondary touch-target"
            disabled={session.submitting || !riskFilled}
            onClick={checkFinal}
          >
            {session.submitting ? 'Saving…' : 'Submit full model'}
          </button>
        </>
      ),
    },
  ]

  return (
    <ProblemLayout
      problem={EV_L5_P3}
      problemNumber={15}
      feedback={session.feedback}
      completed={session.completed}
      revealedHintIds={session.revealedHintIds}
      onRevealHint={session.revealHint}
      restarted={session.restarted}
      onRestart={() => { reset(); setChecks(NO_CHECKS); session.restart() }}
      onReview={session.backToReview}
      attemptCount={session.finalAttemptCount}
      lastSubmittedAnswer={session.lastSubmittedAnswer}
      reviewHintUsed={session.reviewHintUsed}
      completionMessage="You built the full capstone model: payout $6, cost $6, profit $0 — a fair game that still carries round-to-round risk."
      steps={steps}
      onStepChange={session.clearFeedback}
    />
  )
}
