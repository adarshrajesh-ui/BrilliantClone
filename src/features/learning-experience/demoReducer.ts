/**
 * Pure, deterministic step-navigation logic for the pre-problem mini-demo.
 * Kept separate from the React component so it can be unit-tested without a DOM.
 *
 * The reducer never triggers grading, hint usage, or progress; it only computes
 * the next visible step index. Side effects (skip / start) are emitted by the
 * component as callbacks, not handled here.
 */

export interface DemoNavState {
  /** 0-based index of the visible step. */
  index: number
  /** Total number of steps. */
  total: number
}

export type DemoNavAction =
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'goto'; index: number }

function clampIndex(index: number, total: number): number {
  if (total <= 0) {
    return 0
  }
  if (index < 0) {
    return 0
  }
  if (index > total - 1) {
    return total - 1
  }
  return index
}

export function demoNavReducer(state: DemoNavState, action: DemoNavAction): DemoNavState {
  switch (action.type) {
    case 'next':
      return { ...state, index: clampIndex(state.index + 1, state.total) }
    case 'back':
      return { ...state, index: clampIndex(state.index - 1, state.total) }
    case 'goto':
      return { ...state, index: clampIndex(action.index, state.total) }
    default:
      return state
  }
}

export function isFirstStep(state: DemoNavState): boolean {
  return state.index <= 0
}

export function isLastStep(state: DemoNavState): boolean {
  return state.total === 0 || state.index >= state.total - 1
}

/** Whether the Back control should be enabled. */
export function canGoBack(state: DemoNavState): boolean {
  return !isFirstStep(state)
}

/** Whether the Next control should be enabled. */
export function canGoNext(state: DemoNavState): boolean {
  return !isLastStep(state)
}
