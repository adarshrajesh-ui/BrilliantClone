import { describe, expect, it } from 'vitest'
import {
  canGoBack,
  canGoNext,
  demoNavReducer,
  isFirstStep,
  isLastStep,
  type DemoNavState,
} from '../demoReducer'

const state = (index: number, total: number): DemoNavState => ({ index, total })

describe('demoNavReducer', () => {
  it('advances and goes back within bounds', () => {
    expect(demoNavReducer(state(0, 4), { type: 'next' }).index).toBe(1)
    expect(demoNavReducer(state(2, 4), { type: 'back' }).index).toBe(1)
  })

  it('clamps at the first and last step', () => {
    expect(demoNavReducer(state(0, 4), { type: 'back' }).index).toBe(0)
    expect(demoNavReducer(state(3, 4), { type: 'next' }).index).toBe(3)
  })

  it('clamps goto to valid range', () => {
    expect(demoNavReducer(state(0, 4), { type: 'goto', index: 99 }).index).toBe(3)
    expect(demoNavReducer(state(0, 4), { type: 'goto', index: -5 }).index).toBe(0)
    expect(demoNavReducer(state(0, 4), { type: 'goto', index: 2 }).index).toBe(2)
  })

  it('handles empty step lists safely', () => {
    expect(demoNavReducer(state(0, 0), { type: 'next' }).index).toBe(0)
  })
})

describe('demo nav predicates', () => {
  it('reports first/last correctly', () => {
    expect(isFirstStep(state(0, 4))).toBe(true)
    expect(isFirstStep(state(1, 4))).toBe(false)
    expect(isLastStep(state(3, 4))).toBe(true)
    expect(isLastStep(state(2, 4))).toBe(false)
  })

  it('gates Back/Next controls', () => {
    expect(canGoBack(state(0, 4))).toBe(false)
    expect(canGoBack(state(1, 4))).toBe(true)
    expect(canGoNext(state(3, 4))).toBe(false)
    expect(canGoNext(state(2, 4))).toBe(true)
  })
})
