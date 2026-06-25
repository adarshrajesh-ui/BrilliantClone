interface ShowDemoAgainActionProps {
  onShowDemo: () => void
  label?: string
  variant?: 'text' | 'outline'
}

/**
 * Reusable "Show demo again" control. Triggering it must only re-open the demo;
 * it never resets answers, attempts, hints, or completion.
 */
export function ShowDemoAgainAction({
  onShowDemo,
  label = 'Show demo again',
  variant = 'text',
}: ShowDemoAgainActionProps) {
  const className = variant === 'outline' ? 'btn-outline touch-target' : 'btn-text touch-target'
  return (
    <button type="button" className={className} onClick={onShowDemo}>
      {label}
    </button>
  )
}
