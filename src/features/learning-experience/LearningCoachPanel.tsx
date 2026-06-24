import type { CoachFeedback } from './types'

export interface LearningCoachPanelProps {
  /** The current coach message, or null for the idle state. */
  feedback: CoachFeedback | null
  /** Continue/next action shown on a correct answer. */
  onContinue?: () => void
  continueLabel?: string
  /** Reveal the next hint (rendered as a quick link when hints remain). */
  onRequestHint?: () => void
  hintsRemaining?: number
  /** Idle guidance shown before any submission. */
  idleMessage?: string
}

/**
 * Learning Coach panel. Lives in the right rail on desktop (sticky, visible
 * without scrolling) and directly below the current task on mobile. Never
 * buried at the bottom of the page.
 *
 * Wrong answers render the structured what-happened / why / what-next layout;
 * correct answers render confirmation + concept summary + a Continue action.
 *
 * The panel is a polite live region kept visible by layout (sticky right rail
 * on desktop, high in the column on mobile), so feedback surfaces without ever
 * moving the viewport — typing, selecting, or submitting must not scroll the page.
 */
export function LearningCoachPanel({
  feedback,
  onContinue,
  continueLabel = 'Continue',
  onRequestHint,
  hintsRemaining = 0,
  idleMessage = "Work through the steps, then submit. I'll check your answer and help if it isn't right yet.",
}: LearningCoachPanelProps) {
  const tone = feedback?.tone ?? 'idle'

  const showHint = onRequestHint && hintsRemaining > 0

  return (
    <section
      className={`card coach-panel coach-${tone}`}
      role="status"
      aria-live="polite"
      aria-label="Learning coach"
    >
      <div className="coach-head">
        <span className="coach-avatar" aria-hidden="true">
          {tone === 'correct' ? '✓' : tone === 'incorrect' ? '!' : '🧭'}
        </span>
        <div>
          <p className="coach-title">{feedback?.title ?? 'Learning coach'}</p>
          {feedback?.mistakeLabel && (
            <span className="coach-mistake-label">{feedback.mistakeLabel}</span>
          )}
        </div>
      </div>

      {tone === 'idle' && <p className="coach-idle">{idleMessage}</p>}

      {tone === 'correct' && feedback && (
        <div className="coach-body">
          {feedback.message && <p className="coach-confirm">{feedback.message}</p>}
          {feedback.conceptSummary && (
            <p className="coach-concept">{feedback.conceptSummary}</p>
          )}
        </div>
      )}

      {tone === 'info' && feedback && (
        <div className="coach-body">
          <p>{feedback.message}</p>
        </div>
      )}

      {tone === 'incorrect' && feedback && (
        <div className="coach-body coach-structured">
          {feedback.whatHappened && (
            <div className="coach-section">
              <span className="coach-section-label">What happened</span>
              <p>{feedback.whatHappened}</p>
            </div>
          )}
          {feedback.whyWrong && (
            <div className="coach-section">
              <span className="coach-section-label">Why it isn't right yet</span>
              <p>{feedback.whyWrong}</p>
            </div>
          )}
          {feedback.whatNext && (
            <div className="coach-section">
              <span className="coach-section-label">What to do next</span>
              <p>{feedback.whatNext}</p>
            </div>
          )}
          {feedback.message && !feedback.whyWrong && <p>{feedback.message}</p>}
        </div>
      )}

      <div className="coach-actions">
        {tone === 'correct' && onContinue && (
          <button type="button" className="btn-secondary touch-target" onClick={onContinue}>
            {continueLabel}
          </button>
        )}
        {tone !== 'correct' && showHint && (
          <button type="button" className="btn-text coach-hint-link" onClick={onRequestHint}>
            Need a hint? ({hintsRemaining} left)
          </button>
        )}
      </div>
    </section>
  )
}
