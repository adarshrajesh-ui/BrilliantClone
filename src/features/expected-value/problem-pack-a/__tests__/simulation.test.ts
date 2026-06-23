import { describe, expect, it } from 'vitest'
import {
  SPINNER_5050,
  compactSeries,
  createSeededRandom,
  extendSimulation,
  sampleSegment,
  simulateFromOutcomes,
  simulateSpins,
} from '../simulation'

describe('seeded random', () => {
  it('is deterministic for a given seed', () => {
    const a = createSeededRandom(42)
    const b = createSeededRandom(42)
    const seqA = Array.from({ length: 5 }, () => a())
    const seqB = Array.from({ length: 5 }, () => b())
    expect(seqA).toEqual(seqB)
  })

  it('produces values in [0,1)', () => {
    const r = createSeededRandom(7)
    for (let i = 0; i < 50; i += 1) {
      const v = r()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('sampleSegment', () => {
  it('selects by weight using the injected source', () => {
    // source < 0.5 -> first segment (10), else second (0)
    expect(sampleSegment(SPINNER_5050, () => 0.1)).toBe(10)
    expect(sampleSegment(SPINNER_5050, () => 0.9)).toBe(0)
  })
})

describe('simulateFromOutcomes', () => {
  it('computes running averages from an injected trial sequence', () => {
    const result = simulateFromOutcomes([10, 0, 10, 0])
    expect(result.spins).toBe(4)
    expect(result.totalWinnings).toBe(20)
    expect(result.average).toBe(5)
    expect(result.runningAverages).toEqual([10, 5, 20 / 3, 5])
  })
})

describe('simulateSpins (seeded graph calculations)', () => {
  it('is reproducible across runs with the same seed', () => {
    const r1 = simulateSpins(SPINNER_5050, 200, createSeededRandom(123))
    const r2 = simulateSpins(SPINNER_5050, 200, createSeededRandom(123))
    expect(r1.runningAverages).toEqual(r2.runningAverages)
    expect(r1.spins).toBe(200)
  })

  it('stabilizes near the EV for a large seeded sample (not exact)', () => {
    const r = simulateSpins(SPINNER_5050, 2000, createSeededRandom(999))
    // EV is 5; a large sample is close but need not be exact.
    expect(Math.abs(r.average - 5)).toBeLessThan(1)
  })
})

describe('extendSimulation', () => {
  it('appends spins immutably', () => {
    const first = simulateFromOutcomes([10, 0])
    const more = extendSimulation(first, SPINNER_5050, 2, () => 0.1)
    expect(first.spins).toBe(2)
    expect(more.spins).toBe(4)
    expect(more.outcomes.slice(0, 2)).toEqual([10, 0])
  })
})

describe('compactSeries', () => {
  it('keeps short series intact', () => {
    expect(compactSeries([1, 2, 3], 50)).toEqual([1, 2, 3])
  })
  it('down-samples long series keeping first and last', () => {
    const series = Array.from({ length: 500 }, (_, i) => i)
    const out = compactSeries(series, 50)
    expect(out.length).toBe(50)
    expect(out[0]).toBe(0)
    expect(out[out.length - 1]).toBe(499)
  })
})
