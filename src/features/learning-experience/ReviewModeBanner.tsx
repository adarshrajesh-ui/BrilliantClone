import type { ReactNode } from 'react'

interface ReviewModeBannerProps {
  /** Restart control (explicit practice). */
  onRestart?: () => void
  /** Optional "Show demo" affordance (never auto-plays in review). */
  onShowDemo?: () => void
  /** Optional extra actions (e.g. Continue/Next). */
  children?: ReactNode
}

/**
 * Banner shown atop a completed problem in Review Mode. Review is the default
 * for completed problems; restart and demo are explicit, never automatic.
 */
export function ReviewModeBanner({ onRestart, onShowDemo, children }: ReviewModeBannerProps) {
  return (
    <section className="card review-banner" aria-label="Completed problem — review mode">
      <div className="review-banner-head">
        <span className="review-badge" aria-hidden="true">
          ✓
        </span>
        <div>
          <p className="review-banner-title">Completed — Review Mode</p>
          <p className="review-banner-sub">
            Revisit your result, replay the demo, or start a fresh practice attempt. Your
            chapter progress stays exactly where it is.
          </p>
        </div>
      </div>
      <div className="review-actions">
        <span className="btn-secondary review-mode-active" aria-current="true">
          Review Problem
        </span>
        {onShowDemo && (
          <button type="button" className="btn-text touch-target" onClick={onShowDemo}>
            Show demo
          </button>
        )}
        {onRestart && (
          <button type="button" className="btn-outline touch-target" onClick={onRestart}>
            Restart This Problem
          </button>
        )}
        {children}
      </div>
    </section>
  )
}
