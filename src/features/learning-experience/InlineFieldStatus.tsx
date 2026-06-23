import type { FieldStatus } from '../../lib/fieldStatus'
import type { InlineStatus } from './types'

/**
 * Map the answer-checker's `FieldStatus` ('ok' | 'bad' | 'empty' | undefined)
 * onto the richer presentation status used by the UI. `undefined` is treated as
 * the neutral "current" (being worked on) state.
 */
export function toInlineStatus(status: FieldStatus): InlineStatus {
  switch (status) {
    case 'ok':
      return 'correct'
    case 'bad':
      return 'needs-correction'
    case 'empty':
      return 'empty'
    default:
      return 'current'
  }
}

const META: Record<InlineStatus, { className: string; glyph: string; label: string }> = {
  correct: { className: 'inline-status-correct', glyph: '✓', label: 'Looks right' },
  'needs-correction': {
    className: 'inline-status-bad',
    glyph: '!',
    label: 'Needs correction',
  },
  empty: { className: 'inline-status-empty', glyph: '', label: 'Not filled in' },
  current: { className: 'inline-status-current', glyph: '', label: 'In progress' },
}

interface InlineFieldStatusProps {
  status: InlineStatus | FieldStatus
  /** Hide the text label and show only the glyph (compact cells). */
  iconOnly?: boolean
}

function normalize(status: InlineStatus | FieldStatus): InlineStatus {
  if (status === 'ok' || status === 'bad' || status === 'empty' || status === undefined) {
    return toInlineStatus(status as FieldStatus)
  }
  return status
}

/**
 * Small inline indicator for a single answer field. Never relies on color
 * alone — always pairs a glyph/label with the color (accessibility rule).
 */
export function InlineFieldStatus({ status, iconOnly = false }: InlineFieldStatusProps) {
  const resolved = normalize(status)
  if (resolved === 'empty' || resolved === 'current') {
    return null
  }
  const meta = META[resolved]
  return (
    <span className={`inline-status ${meta.className}`} role="status">
      <span className="inline-status-glyph" aria-hidden="true">
        {meta.glyph}
      </span>
      {!iconOnly && <span className="inline-status-label">{meta.label}</span>}
      <span className="sr-only">{meta.label}</span>
    </span>
  )
}
