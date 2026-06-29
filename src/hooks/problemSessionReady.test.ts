import { describe, expect, it } from 'vitest'
import { computeProblemSessionReady } from './problemSessionReady'

describe('computeProblemSessionReady', () => {
  it('is not ready while the per-problem session is still loading', () => {
    expect(
      computeProblemSessionReady({
        sessionLoaded: false,
        progressLoading: false,
        alreadyComplete: false,
        justCompleted: false,
      }),
    ).toBe(false)
  })

  it('holds the loader when session is loaded but completion status is unknown', () => {
    // Core regression: revisiting a completed problem must not render the active
    // workspace before chapter progress (completedProblemIds) has resolved.
    expect(
      computeProblemSessionReady({
        sessionLoaded: true,
        progressLoading: true,
        alreadyComplete: false,
        justCompleted: false,
      }),
    ).toBe(false)
  })

  it('shows immediately for a locally-known completed problem even while progress reloads', () => {
    // Seeded local progress already tells us this is complete, so review/retry
    // can render without waiting for the Firestore round-trip.
    expect(
      computeProblemSessionReady({
        sessionLoaded: true,
        progressLoading: true,
        alreadyComplete: true,
        justCompleted: false,
      }),
    ).toBe(true)
  })

  it('stays ready during the progress reload triggered by a fresh completion', () => {
    // finishIfComplete() calls reload() (progressLoading flips true) and sets
    // justCompleted; we must not re-block the loader in that window.
    expect(
      computeProblemSessionReady({
        sessionLoaded: true,
        progressLoading: true,
        alreadyComplete: false,
        justCompleted: true,
      }),
    ).toBe(true)
  })

  it('becomes ready for an incomplete problem once chapter progress resolves', () => {
    expect(
      computeProblemSessionReady({
        sessionLoaded: true,
        progressLoading: false,
        alreadyComplete: false,
        justCompleted: false,
      }),
    ).toBe(true)
  })

  it('never reports ready before the session loads, regardless of completion', () => {
    expect(
      computeProblemSessionReady({
        sessionLoaded: false,
        progressLoading: false,
        alreadyComplete: true,
        justCompleted: true,
      }),
    ).toBe(false)
  })
})
