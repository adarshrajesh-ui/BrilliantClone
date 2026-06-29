import './agent3.css'
import { useState } from 'react'
import { PokerChipLoader } from '../PokerChipLoader'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { useProblemSession } from '../../hooks/useProblemSession'
import { usePersistedProblemState } from '../../hooks/usePersistedProblemState'
import type { WorkspaceStepDef } from '../../features/learning-experience'
import type { CheckResult } from '../../types/problem'
import {
  PROBLEM_EV_L2_P3,
  checkEvL2P3,
  checkEvL2P3ValidStep,
  checkEvL2P3DefectA,
  checkEvL2P3DefectB,
  type EvL2P3Defect,
  type EvL2P3Formula,
} from '../../data/problems/ev-l2-p3'

const FORMULAS: Array<{ id: EvL2P3Formula; expr: string }> = [
  { id: 'A', expr: '20 + 4 + 0' },
  { id: 'B', expr: '20 × 0.25 + 4 × 0.25' },
  { id: 'C', expr: '20 × 0.25 + 4 × 0.25 + 0 × 0.5' },
]

const CRITERIA = ['Uses outcome × probability', 'Includes all outcomes', 'Accounts for total probability']

const DEFECTS: Array<{ id: EvL2P3Defect; label: string }> = [
  { id: 'no-probability', label: 'Sums raw payouts without probability' },
  { id: 'omits-zero', label: 'Omits the $0 outcome' },
  { id: 'wrong-multiplication', label: 'Multiplies the numbers incorrectly' },
  { id: 'nothing-wrong', label: 'Nothing is wrong' },
]

interface State {
  valid: EvL2P3Formula | null
  defectA: EvL2P3Defect | null
  defectB: EvL2P3Defect | null
}

const DEFAULT: State = { valid: null, defectA: null, defectB: null }

/** Per-step badge state. `undefined` = not yet checked (or cleared on edit). */
type StepStatus = 'correct' | 'incorrect' | undefined
type Checks = { valid: StepStatus; defectA: StepStatus; defectB: StepStatus }
const NO_CHECKS: Checks = { valid: undefined, defectA: undefined, defectB: undefined }

// Map a CheckResult to a badge status: 'correct' when right, 'incorrect' when a
// real mistake, undefined for guard results (not yet answerable).
function statusFromResult(result: CheckResult): StepStatus {
  if (result.isCorrect) return 'correct'
  if (!result.mistakeType) return undefined
  return 'incorrect'
}

const ADVANCE_HINT = 'Check this step and fix it to continue.'
const SETUP_CONTEXT = 'Game setup: $20 with 25% chance, $4 with 25% chance, and $0 with 50% chance.'

export function EvL2P3DiagnoseSetups() {
  const { state, setState, loaded, reset } = usePersistedProblemState<State>('ev-l2-p3', DEFAULT)
  const session = useProblemSession(PROBLEM_EV_L2_P3, state)
  // Per-step check results drive the status badge AND the Next gate. Selecting a
  // new option clears that step's flag (direct-correction), so a stale ✓/! never
  // lingers after the learner changes their mind.
  const [checks, setChecks] = useState<Checks>(NO_CHECKS)

  if (!loaded || !session.sessionLoaded) {
    return <PokerChipLoader label="Loading problem…" />
  }

  // Check the 'valid' step in isolation; badge + Next gate read from `checks`.
  const checkValid = () => {
    const result = checkEvL2P3ValidStep(state.valid)
    setChecks((p) => ({ ...p, valid: statusFromResult(result) }))
    void session.handleCheck(result, 'valid', `valid=${state.valid ?? ''}`, state.valid ?? '')
  }

  // Check the 'diagnose-a' step in isolation.
  const checkDefectA = () => {
    const result = checkEvL2P3DefectA(state.defectA)
    setChecks((p) => ({ ...p, defectA: statusFromResult(result) }))
    void session.handleCheck(result, 'diagnose-a', `A=${state.defectA ?? ''}`, state.defectA ?? '')
  }

  // Final step: the holistic checker drives completion (stepId 'final'). By now
  // 'valid' and 'diagnose-a' are already correct (Next was gated), so this really
  // validates Formula B and finishes the problem.
  const checkFinal = () => {
    const result = checkEvL2P3({ valid: state.valid, defectA: state.defectA, defectB: state.defectB })
    setChecks((p) => ({ ...p, defectB: statusFromResult(checkEvL2P3DefectB(state.defectB)) }))
    void session.handleCheck(
      result,
      'final',
      `valid=${state.valid};A=${state.defectA ?? ''};B=${state.defectB ?? ''}`,
      state.valid ?? '',
    )
  }

  const steps: WorkspaceStepDef[] = [
    {
      id: 'valid',
      title: 'Pick the valid EV formula',
      prompt: 'Select the formula that is a valid, complete EV model.',
      status: checks.valid,
      canAdvance: checks.valid === 'correct',
      advanceHint: ADVANCE_HINT,
      action: (
        <button
          type="button"
          className="btn-secondary touch-target ws-step-check"
          disabled={state.valid === null}
          onClick={checkValid}
        >
          Check
        </button>
      ),
      content: (
        <>
          <p className="diagnose-setup-context section-note">{SETUP_CONTEXT}</p>
          <div className="diagnose-criteria" aria-label="Valid EV checklist">
            <ul className="diagnose-checklist">
              {CRITERIA.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <div className="diagnose-cards">
            {FORMULAS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`diagnose-card touch-target${state.valid === f.id ? ' diagnose-card-selected' : ''}`}
                aria-pressed={state.valid === f.id}
                aria-label={`Formula ${f.id}: ${f.expr}${state.valid === f.id ? ', selected as valid' : ''}`}
                onClick={() => {
                  setState((p) => ({ ...p, valid: f.id }))
                  setChecks((p) => ({ ...p, valid: undefined }))
                }}
              >
                <span className="diagnose-card-name">Formula {f.id}</span>
                <span className="diagnose-card-expr">{f.expr}</span>
                <span className="diagnose-pick">{state.valid === f.id ? 'Selected as valid ✓' : 'Tap to mark valid'}</span>
              </button>
            ))}
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {state.valid ? `Formula ${state.valid} selected as the valid model.` : 'No formula selected yet.'}
          </p>
        </>
      ),
    },
    {
      id: 'diagnose-a',
      title: 'Diagnose Formula A',
      prompt: 'What is wrong with Formula A?',
      status: checks.defectA,
      canAdvance: checks.defectA === 'correct',
      advanceHint: ADVANCE_HINT,
      action: (
        <button
          type="button"
          className="btn-secondary touch-target ws-step-check"
          disabled={state.defectA === null}
          onClick={checkDefectA}
        >
          Check
        </button>
      ),
      content: (
        <div className="diagnose-defect">
          <p className="diagnose-setup-context diagnose-setup-context-compact section-note">{SETUP_CONTEXT}</p>
          <p className="diagnose-defect-label">Formula A — 20 + 4 + 0</p>
          <div className="choice-column ws-options">
            {DEFECTS.map((d) => (
              <button
                key={d.id}
                type="button"
                className={`choice-btn touch-target ws-option${state.defectA === d.id ? ' choice-btn-selected' : ''}`}
                aria-pressed={state.defectA === d.id}
                onClick={() => {
                  setState((p) => ({ ...p, defectA: d.id }))
                  setChecks((p) => ({ ...p, defectA: undefined }))
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {state.defectA ? `Formula A diagnosis selected: ${state.defectA}.` : 'No Formula A diagnosis selected yet.'}
          </p>
        </div>
      ),
    },
    {
      id: 'diagnose-b',
      title: 'Diagnose Formula B',
      prompt: 'What is wrong with Formula B?',
      status: checks.defectB,
      canAdvance: checks.defectB === 'correct',
      advanceHint: ADVANCE_HINT,
      action: (
        <button
          type="button"
          className="btn-secondary touch-target ws-step-check"
          disabled={session.submitting || state.defectB === null}
          onClick={checkFinal}
        >
          {session.submitting ? 'Saving…' : 'Check answer'}
        </button>
      ),
      content: (
        <>
          <div className="diagnose-defect">
            <p className="diagnose-setup-context diagnose-setup-context-compact section-note">{SETUP_CONTEXT}</p>
            <p className="diagnose-defect-label">Formula B — 20 × 0.25 + 4 × 0.25</p>
            <div className="choice-column ws-options">
              {DEFECTS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className={`choice-btn touch-target ws-option${state.defectB === d.id ? ' choice-btn-selected' : ''}`}
                  aria-pressed={state.defectB === d.id}
                  onClick={() => {
                    setState((p) => ({ ...p, defectB: d.id }))
                    setChecks((p) => ({ ...p, defectB: undefined }))
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <p className="sr-only" role="status" aria-live="polite">
              {state.defectB ? `Formula B diagnosis selected: ${state.defectB}.` : 'No Formula B diagnosis selected yet.'}
            </p>
          </div>

        </>
      ),
    },
  ]

  return (
    <ProblemLayout
      problem={PROBLEM_EV_L2_P3}
      problemNumber={6}
      workspaceMinimalHeader
      feedback={session.feedback}
      completed={session.completed}
      justCompleted={session.justCompleted}
      streakResult={session.streakResult}
      revealedHintIds={session.revealedHintIds}
      onRevealHint={session.revealHint}
      nextProblemId="problem-4"
      restarted={session.restarted}
      onRestart={() => {
        reset()
        setChecks(NO_CHECKS)
        session.restart()
      }}
      onReview={session.backToReview}
      attemptCount={session.finalAttemptCount}
      lastSubmittedAnswer={session.lastSubmittedAnswer}
      reviewHintUsed={session.reviewHintUsed}
      completionMessage="You selected C as valid and diagnosed A (raw sum) and B (omits the $0 outcome)."
      steps={steps}
      onStepChange={session.clearFeedback}
    />
  )
}
