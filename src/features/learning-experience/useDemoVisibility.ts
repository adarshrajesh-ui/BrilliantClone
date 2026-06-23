import { useCallback, useEffect, useState } from 'react'

/**
 * Local, non-authoritative demo-seen state.
 *
 * The PRD explicitly allows demo-seen state to be stored locally when Firestore
 * persistence is not yet safe, and requires that it NEVER counts as an attempt,
 * sets hintUsed, or moves progress. This hook only reads/writes localStorage and
 * is fully owned by the presentation layer. Agent 1 may later promote this to
 * `problemProgress.demoSeen` (see handoff doc) — the public shape stays the same.
 */

const STORAGE_PREFIX = 'evlab.demoSeen.'

function storageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`
}

function readSeen(key: string): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false
    }
    return window.localStorage.getItem(storageKey(key)) === '1'
  } catch {
    return false
  }
}

function writeSeen(key: string, seen: boolean): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }
    if (seen) {
      window.localStorage.setItem(storageKey(key), '1')
    } else {
      window.localStorage.removeItem(storageKey(key))
    }
  } catch {
    /* storage unavailable — demo simply shows again, which is harmless */
  }
}

export interface DemoVisibility {
  /** Whether the demo should be presented before the graded problem. */
  showDemo: boolean
  /** Whether the demo has been seen at least once. */
  seen: boolean
  /** Record the demo as seen (called on Skip or Start Problem). */
  markSeen: () => void
  /** Explicitly re-open the demo ("Show demo again"). */
  showAgain: () => void
  /** Dismiss a re-opened demo without changing seen state. */
  dismiss: () => void
}

/**
 * @param configKey  Stable key (canonical slug preferred, legacy id otherwise).
 * @param options.disabled  When true the demo never auto-shows (e.g. completed
 *   review mode). The learner can still trigger `showAgain`.
 * @param options.forceFirstVisit  When true, ignore stored state and show the
 *   demo on first mount (used by tests / previews).
 */
export function useDemoVisibility(
  configKey: string,
  options: { disabled?: boolean; forceFirstVisit?: boolean } = {},
): DemoVisibility {
  const { disabled = false, forceFirstVisit = false } = options
  const [seen, setSeen] = useState(() => (forceFirstVisit ? false : readSeen(configKey)))
  const [manuallyOpen, setManuallyOpen] = useState(false)

  useEffect(() => {
    setSeen(forceFirstVisit ? false : readSeen(configKey))
    setManuallyOpen(false)
  }, [configKey, forceFirstVisit])

  const markSeen = useCallback(() => {
    setSeen(true)
    setManuallyOpen(false)
    writeSeen(configKey, true)
  }, [configKey])

  const showAgain = useCallback(() => {
    setManuallyOpen(true)
  }, [])

  const dismiss = useCallback(() => {
    setManuallyOpen(false)
  }, [])

  const showDemo = manuallyOpen || (!disabled && !seen)

  return { showDemo, seen, markSeen, showAgain, dismiss }
}
