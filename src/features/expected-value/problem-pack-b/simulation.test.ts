import { describe, expect, it } from 'vitest'
import {
  createSeededRandom,
  expectedValue,
  isSimulationComplete,
  LOW_HIGH_GAME_A,
  LOW_HIGH_GAME_B,
  SAME_EV_GAME_A,
  SAME_EV_GAME_B,
  simulateGame,
  variance,
} from './simulation'

describe('injected deterministic random source', () => {
  it('produces identical results for the same seed', () => {
    const a = simulateGame(SAME_EV_GAME_B, 20, createSeededRandom(42))
    const b = simulateGame(SAME_EV_GAME_B, 20, createSeededRandom(42))
    expect(a.results).toEqual(b.results)
    expect(a.average).toBe(b.average)
  })

  it('produces different streams for different seeds', () => {
    const a = simulateGame(SAME_EV_GAME_B, 50, createSeededRandom(1))
    const b = simulateGame(SAME_EV_GAME_B, 50, createSeededRandom(2))
    expect(a.results).not.toEqual(b.results)
  })

  it('maps a guaranteed game to a flat series regardless of RNG', () => {
    const sim = simulateGame(SAME_EV_GAME_A, 20, createSeededRandom(7))
    expect(sim.results.every((r) => r === 5)).toBe(true)
    expect(sim.average).toBe(5)
  })

  it('only draws the defined outcome values', () => {
    const sim = simulateGame(SAME_EV_GAME_B, 100, createSeededRandom(123))
    expect(sim.results.every((r) => r === 0 || r === 10)).toBe(true)
  })
})

describe('equal-EV, different-risk invariants', () => {
  it('both same-EV games have theoretical EV 5 but B has more variance', () => {
    expect(expectedValue(SAME_EV_GAME_A)).toBe(5)
    expect(expectedValue(SAME_EV_GAME_B)).toBe(5)
    expect(variance(SAME_EV_GAME_A)).toBe(0)
    expect(variance(SAME_EV_GAME_B)).toBeGreaterThan(variance(SAME_EV_GAME_A))
  })

  it('both low/high games have theoretical EV 6 but B has more variance', () => {
    expect(expectedValue(LOW_HIGH_GAME_A)).toBe(6)
    expect(expectedValue(LOW_HIGH_GAME_B)).toBe(6)
    expect(variance(LOW_HIGH_GAME_B)).toBeGreaterThan(variance(LOW_HIGH_GAME_A))
  })

  it('simulated averages converge near the theoretical EV over many trials', () => {
    const sim = simulateGame(SAME_EV_GAME_B, 5000, createSeededRandom(2024))
    expect(Math.abs(sim.average - 5)).toBeLessThan(0.5)
  })
})

describe('simulation completion requirement', () => {
  it('requires the configured number of trials', () => {
    expect(isSimulationComplete(19, 20)).toBe(false)
    expect(isSimulationComplete(20, 20)).toBe(true)
    expect(isSimulationComplete(25, 20)).toBe(true)
  })

  it('records a running average for each trial', () => {
    const sim = simulateGame(LOW_HIGH_GAME_B, 20, createSeededRandom(9))
    expect(sim.runningAverage).toHaveLength(20)
    expect(sim.trials).toBe(20)
  })
})
