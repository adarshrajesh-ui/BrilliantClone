import type { CheckResult } from '../../types/problem'

interface FeedbackPanelProps {
  message: string | null
  type: 'info' | 'success' | 'error'
}

export function FeedbackPanel({ message, type }: FeedbackPanelProps) {
  if (!message) {
    return null
  }

  return (
    <section
      className={`card feedback-panel feedback-${type}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </section>
  )
}

export function resultToFeedbackType(result: CheckResult): 'info' | 'success' | 'error' {
  if (result.canComplete || result.isCorrect) {
    return 'success'
  }
  if (result.mistakeType) {
    return 'error'
  }
  return 'info'
}
