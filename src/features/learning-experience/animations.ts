import { useEffect, useState } from 'react'

/**
 * Generic teaching-animation primitives. These are intentionally just stable
 * CSS class-name hooks (the keyframes live in index.css) plus a reduced-motion
 * helper. Using class names keeps the animation system dependency-free and lets
 * the global `prefers-reduced-motion` rule neutralize motion automatically.
 */

export const ANIM = {
  /** Soft attention pulse on a highlighted target. */
  pulseHighlight: 'anim-pulse-highlight',
  /** Glow ring around a selected/active element. */
  selectionGlow: 'anim-selection-glow',
  /** Card snapping into a formula/table slot. */
  snapIntoSlot: 'anim-snap-into-slot',
  /** A contribution chunk transferring toward a total. */
  contributionTransfer: 'anim-contribution-transfer',
  /** A marker sliding along the fairness number line. */
  numberLineMove: 'anim-number-line-move',
  /** A graph/path line drawing into place. */
  graphLineReveal: 'anim-graph-line-reveal',
  /** Completion check pop. */
  completionCheck: 'anim-completion-check',
} as const

export type AnimationName = keyof typeof ANIM

/**
 * Compose an animation class with a reduced-motion fallback class. When motion
 * is reduced the `anim-reduced` class is added so components can opt into an
 * immediate-state alternative if needed (the global media query already
 * collapses durations to ~0ms).
 */
export function animationClass(name: AnimationName, reducedMotion: boolean): string {
  if (reducedMotion) {
    return `${ANIM[name]} anim-reduced`
  }
  return ANIM[name]
}

/**
 * React hook reporting the user's reduced-motion preference. Safe in non-DOM
 * environments (returns false) so it does not break SSR or tests.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => getPrefersReducedMotion())

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    onChange()
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  return reduced
}

/** Non-hook reader for the current reduced-motion preference. */
export function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Canonical reduced-motion primitive for problem agents (PRD/interface name).
 *
 * Usage pattern in a problem component:
 *
 * ```ts
 * import { prefersReducedMotion } from '../../features/learning-experience'
 *
 * const reduced = prefersReducedMotion()
 * // Build the deterministic outcome FIRST (seeded RNG, fixed sequence), then
 * // only branch on `reduced` for HOW it is presented — never for WHAT the
 * // result is. Reduced path: skip arcs/tumble/bounce/sparkle and apply the
 * // final state instantly. The outcome must be identical either way.
 * if (reduced) {
 *   applyFinalStateInstantly(result)
 * } else {
 *   playAnimation(result)
 * }
 * ```
 *
 * Prefer the `usePrefersReducedMotion` hook inside React components so the value
 * stays reactive to OS-level changes; use this synchronous reader in event
 * handlers, reducers, or non-React helpers.
 */
export const prefersReducedMotion = getPrefersReducedMotion
