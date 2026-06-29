/**
 * Readiness rule for a problem page's interactive workspace.
 *
 * A completed problem must never flash its interactive workspace before flipping
 * to the review/retry view. Completion is derived from chapter progress, which
 * loads asynchronously, so the problem UI has to hold its loader until that
 * signal arrives — unless we already know the problem is complete (seeded local
 * progress, or a fresh completion this session), in which case there is nothing
 * to wait for and review/retry can render immediately.
 *
 * Kept pure (no React / Firestore) so the gating rule is unit-testable in
 * isolation.
 */
export function computeProblemSessionReady(input: {
  /** The per-problem session + attempt history has finished loading. */
  sessionLoaded: boolean
  /** Chapter progress (which holds completedProblemIds) is still loading. */
  progressLoading: boolean
  /** This problem is already recorded complete in chapter progress. */
  alreadyComplete: boolean
  /** This problem was just completed during the current session. */
  justCompleted: boolean
}): boolean {
  const { sessionLoaded, progressLoading, alreadyComplete, justCompleted } = input

  if (!sessionLoaded) {
    return false
  }

  // Known completion means review/retry can render right away; we must not
  // re-block during the chapter-progress refresh that a fresh completion kicks
  // off, otherwise finishing a problem would flicker the loader.
  if (alreadyComplete || justCompleted) {
    return true
  }

  // Otherwise hold the loader until completion status is known, so a completed
  // problem is never momentarily shown as an active attempt.
  return !progressLoading
}
