import { describe, expect, it } from 'vitest'
import {
  constantGame,
  createSeededRandom,
  drawOutcome,
  expectedValue,
  hashSeed,
  isSimulationComplete,
  rollDie,
  runDeterministicBatch,
  sectionsToOutcomes,
  simulateDice,
  simulateDiscrete,
  simulateSections,
  variance,
  type DiscreteOutcome,
} from './simulation'

const BOOTH_B: DiscreteOutcome[] = [
  { value: 10, probability: 0.5 },
  { value: 0, probability: 0.5 },
]
const GAME_A: DiscreteOutcome[] = constantGame(6)
const GAME_B: DiscreteOutcome[] = [
  { value: 12, probability: 0.5 },
  { value: 0, probability: 0.5 },
]
const WHEEL_12 = [36, 12, 12, 12, 0, 0, 0, 0, 0, 0, 0, 0]

describe('createSeededRandom', () => {
  it('produces an identical stream for the same seed', () => {
    const a = createSeededRandom(42)
    const b = createSeededRandom(42)
    const seqA = [a(), a(), a(), a()]
    const seqB = [b(), b(), b(), b()]
    expect(seqA).toEqual(seqB)
  })

  it('produces a different stream for a different seed', () => {
    const a = createSeededRandom(1)
    const b = createSeededRandom(2)
    expect([a(), a(), a()]).not.toEqual([b(), b(), b()])
  })

  it('only returns floats in [0, 1)', () => {
    const rng = createSeededRandom(7)
    for (let i = 0; i < 500; i += 1) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('hashSeed', () => {
  it('is deterministic for the same input', () => {
    expect(hashSeed('problem-7-boothB-3')).toBe(hashSeed('problem-7-boothB-3'))
  })

  it('differs for different inputs', () => {
    expect(hashSeed('problem-7-boothB-3')).not.toBe(hashSeed('problem-7-boothB-4'))
  })

  it('returns an unsigned 32-bit integer', () => {
    const h = hashSeed('anything')
    expect(Number.isInteger(h)).toBe(true)
    expect(h).toBeGreaterThanOrEqual(0)
    expect(h).toBeLessThanOrEqual(0xffffffff)
  })
})

describe('simulateDiscrete', () => {
  it('is reproducible across reduced-motion and animated paths (same seed)', () => {
    const animated = simulateDiscrete(BOOTH_B, 5, createSeededRandom(99))
    const reduced = simulateDiscrete(BOOTH_B, 5, createSeededRandom(99))
    expect(animated.results).toEqual(reduced.results)
    expect(animated.runningAverage).toEqual(reduced.runningAverage)
    expect(animated.average).toBe(reduced.average)
  })

  it('maps a guaranteed game to a flat series regardless of RNG', () => {
    const sim = simulateDiscrete(GAME_A, 20, createSeededRandom(3))
    expect(sim.results.every((r) => r === 6)).toBe(true)
    expect(sim.average).toBe(6)
    expect(sim.runningAverage.every((avg) => avg === 6)).toBe(true)
  })

  it('only draws defined outcome values', () => {
    const sim = simulateDiscrete(GAME_B, 100, createSeededRandom(123))
    expect(sim.results.every((r) => r === 0 || r === 12)).toBe(true)
  })

  it('records a running average for every trial', () => {
    const sim = simulateDiscrete(GAME_B, 20, createSeededRandom(9))
    expect(sim.runningAverage).toHaveLength(20)
    expect(sim.trials).toBe(20)
  })

  it('returns a zeroed result for zero trials', () => {
    const sim = simulateDiscrete(GAME_B, 0, createSeededRandom(9))
    expect(sim.results).toEqual([])
    expect(sim.average).toBe(0)
  })
})

describe('drawOutcome', () => {
  it('selects the first bucket for a low RNG value', () => {
    expect(drawOutcome(BOOTH_B, () => 0.1)).toBe(10)
  })

  it('selects the later bucket for a high RNG value', () => {
    expect(drawOutcome(BOOTH_B, () => 0.9)).toBe(0)
  })
})

describe('expectedValue & variance', () => {
  it('computes EV for guaranteed and 50/50 games (both $6)', () => {
    expect(expectedValue(GAME_A)).toBe(6)
    expect(expectedValue(GAME_B)).toBe(6)
  })

  it('a guaranteed game has zero variance; the spread game has more', () => {
    expect(variance(GAME_A)).toBe(0)
    expect(variance(GAME_B)).toBeGreaterThan(variance(GAME_A))
  })

  it('booth A ($5) and booth B (50/50 $10/$0) share EV but differ in spread', () => {
    expect(expectedValue(constantGame(5))).toBe(5)
    expect(expectedValue(BOOTH_B)).toBe(5)
    expect(variance(BOOTH_B)).toBeGreaterThan(variance(constantGame(5)))
  })

  it('the 12-section capstone wheel has expected payout $6', () => {
    expect(expectedValue(sectionsToOutcomes(WHEEL_12))).toBeCloseTo(6, 10)
  })

  it('converges near the theoretical EV over many trials', () => {
    const sim = simulateDiscrete(GAME_B, 5000, createSeededRandom(2024))
    expect(Math.abs(sim.average - 6)).toBeLessThan(0.5)
  })
})

describe('sectionsToOutcomes', () => {
  it('assigns equal probability to every section', () => {
    const outcomes = sectionsToOutcomes(WHEEL_12)
    expect(outcomes).toHaveLength(12)
    expect(outcomes.every((o) => Math.abs(o.probability - 1 / 12) < 1e-9)).toBe(true)
  })

  it('handles an empty list', () => {
    expect(sectionsToOutcomes([])).toEqual([])
  })
})

describe('simulateSections & dice', () => {
  it('only draws section values from the wheel', () => {
    const sim = simulateSections(WHEEL_12, 200, createSeededRandom(5))
    expect(sim.results.every((r) => WHEEL_12.includes(r))).toBe(true)
  })

  it('rolls a die within 1..sides', () => {
    const rng = createSeededRandom(11)
    for (let i = 0; i < 200; i += 1) {
      const face = rollDie(6, rng)
      expect(face).toBeGreaterThanOrEqual(1)
      expect(face).toBeLessThanOrEqual(6)
    }
  })

  it('simulates dice with a six-face average near 3.5', () => {
    const sim = simulateDice(6, 5000, createSeededRandom(77))
    expect(Math.abs(sim.average - 3.5)).toBeLessThan(0.3)
  })
})

describe('isSimulationComplete', () => {
  it('requires the configured number of trials', () => {
    expect(isSimulationComplete(19, 20)).toBe(false)
    expect(isSimulationComplete(20, 20)).toBe(true)
    expect(isSimulationComplete(25, 20)).toBe(true)
  })
})

describe('runDeterministicBatch', () => {
  it('produces identical outcomes for the same run key', () => {
    const a = runDeterministicBatch(BOOTH_B, 5, 'problem-7-boothB-1')
    const b = runDeterministicBatch(BOOTH_B, 5, 'problem-7-boothB-1')
    expect(a.results).toEqual(b.results)
  })

  it('produces different outcomes for different run keys', () => {
    const a = runDeterministicBatch(BOOTH_B, 8, 'problem-7-boothB-1')
    const b = runDeterministicBatch(BOOTH_B, 8, 'problem-7-boothB-2')
    expect(a.results).not.toEqual(b.results)
  })
})
