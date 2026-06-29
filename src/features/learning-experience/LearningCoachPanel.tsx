import { useEffect, useId, useRef, useState } from 'react'
import type { CoachFeedback } from './types'
import { TeachingExplanationSection } from './TeachingExplanationSection'
import { getPrefersReducedMotion } from './animations'

export interface LearningCoachPanelProps {
  /** The current feedback message, or null for the idle state. */
  feedback: CoachFeedback | null
  /** Continue/next action shown on a correct answer. */
  onContinue?: () => void
  continueLabel?: string
  /** Reveal the next hint (rendered as a quick link when hints remain). */
  onRequestHint?: () => void
  hintsRemaining?: number
  /** Idle guidance shown before any submission. Kept for API compatibility; idle panels are not rendered. */
  idleMessage?: string
  /**
   * Auto-scroll the panel into the viewport when fresh feedback arrives. PRD
   * requirement: on mobile (where the coach sits above the answer controls)
   * feedback must enter the viewport so the learner never returns to the page
   * top to read a result. Defaults to true; `block: 'nearest'` keeps it a no-op
   * on desktop where the sticky rail is already visible.
   */
  scrollIntoViewOnFeedback?: boolean
}

/**
 * Feedback panel. Lives in the right rail on desktop (sticky, visible
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
  idleMessage: _idleMessage = 'Work through the steps, then submit to get feedback.',
  scrollIntoViewOnFeedback = true,
}: LearningCoachPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const [teachingExpanded, setTeachingExpanded] = useState(false)
  const bodyId = useId()
  const teachingId = useId()
  const panelRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (feedback) {
      setExpanded(feedback.tone !== 'info')
      setTeachingExpanded(false)
    }
  }, [feedback])

  // Bring fresh, non-idle feedback into the viewport. `block: 'nearest'` means a
  // panel already on screen (e.g. the sticky desktop rail) does not move, while
  // an off-screen mobile panel scrolls just into view beneath the checked input.
  useEffect(() => {
    if (!feedback) {
      return
    }
    if (!scrollIntoViewOnFeedback) {
      return
    }
    const node = panelRef.current
    if (!node || typeof node.scrollIntoView !== 'function') {
      return
    }
    node.scrollIntoView({
      block: 'nearest',
      behavior: getPrefersReducedMotion() ? 'auto' : 'smooth',
    })
  }, [feedback, scrollIntoViewOnFeedback])

  if (!feedback) {
    return null
  }

  const tone = feedback.tone

  const showHint = onRequestHint && hintsRemaining > 0

  return (
    <section
      ref={panelRef}
      className={`card coach-panel coach-${tone}`}
      role="status"
      aria-live="polite"
      aria-label="Feedback"
    >
      <button
        type="button"
        className="coach-head coach-toggle touch-target"
        aria-expanded={expanded}
        aria-controls={bodyId}
        onClick={() => setExpanded((open) => !open)}
      >
        <span className="coach-avatar" aria-hidden="true">
          {tone === 'correct' ? '✓' : tone === 'incorrect' ? '!' : 'i'}
        </span>
        <span className="coach-heading-copy">
          <span className="coach-title">{feedback.title}</span>
          {feedback.mistakeLabel && (
            <span className="coach-mistake-label">{feedback.mistakeLabel}</span>
          )}
        </span>
        <span className="coach-toggle-label">{expanded ? 'Minimize' : 'Show'}</span>
      </button>

      <div id={bodyId} hidden={!expanded}>
        {tone === 'correct' && (
          <div className="coach-body">
            {feedback.message && <p className="coach-confirm">{feedback.message}</p>}
            {feedback.conceptSummary && (
              <p className="coach-concept">{feedback.conceptSummary}</p>
            )}
            {feedback.workedSolution && feedback.workedSolution.length > 0 && (
              <table className="coach-worked">
                <caption className="coach-worked-caption">Worked solution</caption>
                <tbody>
                  {feedback.workedSolution.map((row, index) => (
                    <tr key={`${row.label}-${index}`}>
                      <th scope="row">{row.label}</th>
                      <td>{row.expression}</td>
                      <td>{row.value !== undefined ? `= ${row.value}` : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {feedback.teaching && teachingExpanded && (
              <TeachingExplanationSection
                id={teachingId}
                explanation={feedback.teaching}
                className="teaching-explanation-compact"
              />
            )}
          </div>
        )}

        {tone === 'info' && (
          <div className="coach-body">
            <p>{feedback.message}</p>
          </div>
        )}

        {tone === 'incorrect' && (
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
          {tone === 'correct' && feedback.teaching && (
            <button
              type="button"
              className="btn-text coach-explanation-link touch-target"
              aria-expanded={teachingExpanded}
              aria-controls={teachingExpanded ? teachingId : undefined}
              onClick={() => setTeachingExpanded((open) => !open)}
            >
              {teachingExpanded ? 'Hide explanation' : 'Show explanation'}
            </button>
          )}
          {tone !== 'correct' && showHint && (
            <button type="button" className="btn-text coach-hint-link touch-target" onClick={onRequestHint}>
              Need a hint? ({hintsRemaining} left)
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
