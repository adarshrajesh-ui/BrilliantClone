import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { QuestionPrompt } from './QuestionPrompt'
import './workspace.css'

/**
 * A single no-scroll step panel for the problem workspace. Presentation only —
 * `canAdvance` is a convenience gate for the Next button and MUST NOT be the
 * only thing enforcing correctness; real completion still flows through the
 * existing checker/session logic in the problem component.
 */
export interface WorkspaceStepDef {
  /** Stable id, unique within the problem (e.g. 'predict', 'throw', 'identify'). */
  id: string
  /** Short step title shown in the step header (e.g. "Predict the average"). */
  title?: string
  /** One-line current-task / prompt for this step (shown near the top of the panel). */
  prompt?: ReactNode
  /** The step's visual + interaction content (the work for this step). */
  content: ReactNode
  /** Primary action rendered in the sticky bottom bar (for example Check/Finish). */
  action?: ReactNode
  /**
   * Gate for the Next button. When false, Next is disabled and `advanceHint`
   * (if any) explains why. Default true.
   */
  canAdvance?: boolean
  /** Helper text shown when Next is gated (canAdvance === false). */
  advanceHint?: string
  /**
   * Optional per-step status badge in the step header. Set by the problem from
   * its own state: 'correct' after a correct per-step check, 'incorrect' after a
   * wrong one, 'unanswered' / undefined otherwise.
   */
  status?: 'unanswered' | 'correct' | 'incorrect'
}

export interface WorkspaceStepsProps {
  /** Problem title shown in the compact workspace header. */
  problemTitle: string
  /** Secondary setup/context for the problem, shown below the title. */
  scenarioText?: string
  /** Ordered step panels. Exactly one is visible at a time; the rest stay mounted but hidden. */
  steps: WorkspaceStepDef[]
  /** Optional banner row (e.g. restart-practice notice). */
  banner?: ReactNode
  /** The Learning Coach panel (feedback + hint link). Lives in the bottom action bar. */
  coachPanel: ReactNode
  /** Previous problem target used when the learner is on the first step. */
  previousProblemHref?: string
  /** Next problem target used when the learner is on the last step. */
  nextProblemHref?: string
  /** Whether the next problem link is unlocked at the last step. */
  nextProblemEnabled?: boolean
  /** Optional hint panel, surfaced in a bounded drawer above the action bar. */
  hintPanel?: ReactNode
  /** Reveal the next hint from the compact footer hint button. */
  onTakeHint?: () => void
  /** Number of unrevealed hints available. */
  hintsRemaining?: number
  /** Optional explanation content opened from the Brilliant-style "Why?" action. */
  explanationPanel?: ReactNode
  /** Href for the "back to chapter" link in the header. */
  backHref: string
  /**
   * Called whenever the active step index changes (Prev/Next). The shell uses
   * this to clear stale coach feedback so each step starts clean and feedback
   * never bleeds across steps.
   */
  onStepChange?: (newIndex: number) => void
}

/**
 * No-scroll, Brilliant-like problem workspace. Fills the viewport below the
 * global app header and never scrolls the page: a compact problem header, a
 * flexible step-content region that shows ONE step at a time, and a sticky
 * bottom action bar holding the Learning Coach feedback plus one Previous and
 * one Next control. At problem boundaries those controls navigate between
 * problems; otherwise they move between steps.
 *
 * Step panels are kept mounted (hidden via the `hidden` attribute) so moving
 * Previous never loses any entered DOM/input values. Problem state itself lives
 * in the problem component, so visibility toggling is always safe.
 */
export function WorkspaceSteps({
  problemTitle,
  scenarioText,
  steps,
  banner,
  coachPanel,
  previousProblemHref,
  nextProblemHref,
  nextProblemEnabled = false,
  hintPanel,
  onTakeHint,
  hintsRemaining = 0,
  explanationPanel,
  backHref,
  onStepChange,
}: WorkspaceStepsProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [hintsOpen, setHintsOpen] = useState(false)
  const [explanationOpen, setExplanationOpen] = useState(false)
  const workspaceRef = useRef<HTMLDivElement>(null)
  const advanceHintId = useId()
  const nextProblemLockedHintId = useId()
  const hintDrawerId = useId()
  const stepCount = steps.length

  useEffect(() => {
    const workspace = workspaceRef.current
    if (!workspace || typeof window === 'undefined' || !('matchMedia' in window)) {
      return
    }

    const phoneViewport = window.matchMedia('(max-width: 768px)')
    const handleFocusIn = (event: FocusEvent) => {
      if (!phoneViewport.matches) {
        return
      }
      const target = event.target
      if (!(target instanceof HTMLElement)) {
        return
      }
      const step = target.closest<HTMLElement>('.ws-step')
      if (!step || step.hidden || !workspace.contains(step)) {
        return
      }

      window.setTimeout(() => {
        target.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' })
      }, 0)
    }

    workspace.addEventListener('focusin', handleFocusIn)
    return () => {
      workspace.removeEventListener('focusin', handleFocusIn)
    }
  }, [])

  // Move to a new step index (clamped) and notify the shell so it can clear
  // stale per-step feedback. Notify only on an actual index change.
  const goToStep = (target: number) => {
    const clamped = Math.min(Math.max(target, 0), Math.max(stepCount - 1, 0))
    setActiveIndex((current) => {
      const safeCurrent = Math.min(Math.max(current, 0), Math.max(stepCount - 1, 0))
      if (clamped !== safeCurrent) {
        onStepChange?.(clamped)
      }
      return clamped
    })
  }

  // Clamp in case the step list shrinks between renders.
  const safeIndex = Math.min(Math.max(activeIndex, 0), Math.max(stepCount - 1, 0))
  const activeStep = steps[safeIndex]
  const isMultiStep = stepCount > 1
  const atFirst = safeIndex === 0
  const atLast = safeIndex >= stepCount - 1
  const canAdvance = activeStep?.canAdvance !== false
  const resultState = activeStep?.status === 'correct'
    ? 'correct'
    : activeStep?.status === 'incorrect'
      ? 'incorrect'
      : activeStep?.action
        ? 'selected'
        : 'idle'
  const nextDisabled = atLast ? !nextProblemHref || !nextProblemEnabled : !canAdvance
  const previousDisabled = atFirst ? !previousProblemHref : false
  const showAdvanceHint = !canAdvance && !atLast && !!activeStep?.advanceHint
  const nextDisabledTitle = atLast
    ? nextProblemHref
      ? 'Answer this problem correctly to unlock Next.'
      : undefined
    : activeStep?.advanceHint
  const nextButtonDescriptionId = nextDisabled
    ? showAdvanceHint
      ? advanceHintId
      : atLast && nextProblemHref && !nextProblemEnabled
        ? nextProblemLockedHintId
        : undefined
    : undefined
  const prompt =
    typeof activeStep?.prompt === 'string'
      ? <QuestionPrompt>{activeStep.prompt}</QuestionPrompt>
      : activeStep?.prompt
  const takeHint = () => {
    if (onTakeHint && hintsRemaining > 0) {
      onTakeHint()
      setHintsOpen(true)
      return
    }

    setHintsOpen((open) => !open)
  }

  return (
    <div className="problem-workspace" data-result={resultState} ref={workspaceRef}>
      <header className="ws-header">
        <div className="ws-header-top">
          <Link to={backHref} className="ws-back">
            Course map
          </Link>
          {isMultiStep && (
            <span className="ws-step-indicator" aria-label={`Step ${safeIndex + 1} of ${stepCount}`}>
              Step {safeIndex + 1} of {stepCount}
            </span>
          )}
          {activeStep?.status === 'correct' && (
            <span className="ws-step-status ws-step-status-correct" role="status" aria-label="Step correct">
              ✓
            </span>
          )}
          {activeStep?.status === 'incorrect' && (
            <span className="ws-step-status ws-step-status-incorrect" role="status" aria-label="Step incorrect">
              !
            </span>
          )}
        </div>
        <h1 className="ws-title">{problemTitle}</h1>
        {scenarioText && <p className="ws-scenario">{scenarioText}</p>}
        {activeStep?.title && <p className="ws-step-title">{activeStep.title}</p>}
        {prompt && <div className="ws-prompt">{prompt}</div>}
      </header>

      {banner && <div className="ws-banner">{banner}</div>}

      <div className="ws-body" role="group" aria-label="Current step">
        <div className="ws-card">
          {steps.map((step, i) => (
            <section key={step.id} className="ws-step" hidden={i !== safeIndex}>
              {step.content}
            </section>
          ))}
        </div>
      </div>

      <div className="ws-actionbar">
        {hintPanel && hintsOpen && (
          <div id={hintDrawerId} className="ws-hint-drawer">
            {hintPanel}
          </div>
        )}
        {coachPanel && <div className="ws-coach-slot">{coachPanel}</div>}
        <div className="ws-controls">
          {(hintPanel || explanationPanel) && (
            <div className="ws-side-actions">
              {hintPanel && (
                <button
                  type="button"
                  className="btn-text ws-hint-toggle touch-target"
                  aria-expanded={hintsOpen}
                  aria-controls={hintsOpen ? hintDrawerId : undefined}
                  onClick={takeHint}
                >
                  {hintsRemaining > 0 ? 'Take hint' : hintsOpen ? 'Hide hints' : 'Hints'}
                </button>
              )}
              {explanationPanel && (
                <button
                  type="button"
                  className="btn-text ws-hint-toggle touch-target"
                  aria-haspopup="dialog"
                  onClick={() => setExplanationOpen(true)}
                >
                  Why?
                </button>
              )}
            </div>
          )}
          {activeStep?.action && <div className="ws-primary-action">{activeStep.action}</div>}
          <div className="ws-nav">
            {atFirst && previousProblemHref ? (
              <Link to={previousProblemHref} className="btn-secondary touch-target ws-prev">
                Previous
              </Link>
            ) : (
              <button
                type="button"
                className="btn-secondary touch-target ws-prev"
                disabled={previousDisabled}
                onClick={() => goToStep(safeIndex - 1)}
              >
                Previous
              </button>
            )}
            <div className="ws-next-wrap">
              {atLast && nextProblemHref && nextProblemEnabled ? (
                <Link to={nextProblemHref} className="btn-secondary touch-target ws-next">
                  {activeStep?.status === 'correct' ? 'Continue' : 'Next'}
                </Link>
              ) : (
                <button
                  type="button"
                  className="btn-secondary touch-target ws-next"
                  disabled={nextDisabled}
                  aria-describedby={nextButtonDescriptionId}
                  title={nextDisabled ? nextDisabledTitle : undefined}
                  onClick={() => goToStep(safeIndex + 1)}
                >
                  {atLast ? 'Continue' : 'Next'}
                </button>
              )}
            </div>
          </div>
          {showAdvanceHint && (
            <span id={advanceHintId} className="ws-advance-hint">
              {activeStep?.advanceHint}
            </span>
          )}
          {atLast && nextProblemHref && !nextProblemEnabled && (
            <span id={nextProblemLockedHintId} className="ws-advance-hint">
              Answer this problem correctly to unlock Next.
            </span>
          )}
        </div>
      </div>
      {explanationOpen && explanationPanel && (
        <div className="ws-modal-backdrop" role="presentation">
          <section className="ws-explanation-modal" role="dialog" aria-modal="true" aria-label="Explanation">
            <div className="ws-modal-head">
              <h2>Explanation</h2>
              <button
                type="button"
                className="btn-text touch-target ws-modal-close"
                aria-label="Close explanation"
                onClick={() => setExplanationOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="ws-modal-body">{explanationPanel}</div>
          </section>
        </div>
      )}
    </div>
  )
}
