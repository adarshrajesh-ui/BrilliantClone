import type { CheckResult } from '../../types/problem'

interface FeedbackPanelProps {
  message: string | null
  type: 'info' | 'success' | 'error'
}

const META: Record<FeedbackPanelProps['type'], { icon: string; title: string }> = {
  success: { icon: '✓', title: 'Nice work!' },
  error: { icon: '!', title: 'Not quite' },
  info: { icon: 'i', title: 'Keep going' },
}

export function FeedbackPanel({ message, type }: FeedbackPanelProps) {
  if (!message) {
    return null
  }

  const { icon, title } = META[type]

  return (
    <section
      className={`card feedback-panel feedback-${type}`}
      role="status"
      aria-live="polite"
    >
      <span className="feedback-icon" aria-hidden="true">
        {icon}
      </span>
      <div className="feedback-body">
        <p className="feedback-title">{title}</p>
        <p className="feedback-message">{message}</p>
      </div>
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
