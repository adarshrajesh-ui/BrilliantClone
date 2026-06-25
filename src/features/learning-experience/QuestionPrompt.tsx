import type { ReactNode } from 'react'
import './workspace.css'

export interface QuestionPromptProps {
  /** The actual question/task text to emphasize. */
  children: ReactNode
  /**
   * Optional small eyebrow label rendered above the question
   * (e.g. "Your task", "Question"). Defaults to "Your task".
   */
  label?: string
  /** When true, render without the eyebrow label (text-only emphasis). */
  hideLabel?: boolean
  /** Extra className passthrough. */
  className?: string
}

/**
 * Shared, themed primitive that makes the single actual question/task stand out
 * as the most prominent element of a problem's prompt area. Presentation only —
 * no state or logic. Works inside the workspace header (`.ws-prompt`), inline in
 * step content (`.ws-step`), and the legacy `taskGuide` panel (`.task-area`).
 */
export function QuestionPrompt({
  children,
  label = 'Your task',
  hideLabel = false,
  className = '',
}: QuestionPromptProps) {
  return (
    <div className={`question-prompt${className ? ` ${className}` : ''}`}>
      {!hideLabel && <span className="question-prompt-label">{label}</span>}
      <div className="question-prompt-text">{children}</div>
    </div>
  )
}
