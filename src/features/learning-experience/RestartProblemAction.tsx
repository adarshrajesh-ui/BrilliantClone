interface RestartProblemActionProps {
  /** Begin a fresh practice attempt. Persistence/progress are unaffected. */
  onRestart: () => void
  variant?: 'outline' | 'text'
  label?: string
}

/**
 * Explicit "Restart This Problem" control. The action is always learner-
 * initiated (never automatic) and only invokes the supplied callback — it owns
 * no persistence logic.
 */
export function RestartProblemAction({
  onRestart,
  variant = 'outline',
  label = 'Restart This Problem',
}: RestartProblemActionProps) {
  const className = variant === 'text' ? 'btn-text' : 'btn-outline touch-target'
  return (
    <button type="button" className={className} onClick={onRestart}>
      {label}
    </button>
  )
}
