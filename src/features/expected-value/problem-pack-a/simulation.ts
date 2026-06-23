// Deterministic, injectable simulation support for the Lesson 1 spinner problems.
//
// Production code may pass a real `Math.random`-backed source; tests inject a
// seeded source or a fixed outcome sequence so results are fully reproducible.
// Completion logic NEVER depends on a sample landing on the exact EV — these
// helpers only produce the running-average series used by the visuals and by
// the seeded-graph tests.

export type RandomSource = () => number

/** Mulberry32 — small, fast, deterministic PRNG in [0, 1). */
export function createSeededRandom(seed: number): RandomSource {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface Segment {
  value: number
  /** Relative weight (need not sum to 1). */
  weight: number
}

/** Pick one segment value using the random source, weighted by `weight`. */
export function sampleSegment(segments: Segment[], rnd: RandomSource): number {
  const total = segments.reduce((sum, s) => sum + s.weight, 0)
  let r = rnd() * total
  for (const seg of segments) {
    if (r < seg.weight) {
      return seg.value
    }
    r -= seg.weight
  }
  return segments[segments.length - 1].value
}

export interface SimulationResult {
  spins: number
  totalWinnings: number
  average: number
  /** Running average after each spin (length === spins). */
  runningAverages: number[]
  /** The raw outcome sequence (useful for review snapshots / debugging). */
  outcomes: number[]
}

function summarize(outcomes: number[]): SimulationResult {
  let total = 0
  const runningAverages: number[] = []
  outcomes.forEach((o, i) => {
    total += o
    runningAverages.push(total / (i + 1))
  })
  return {
    spins: outcomes.length,
    totalWinnings: total,
    average: outcomes.length ? total / outcomes.length : 0,
    runningAverages,
    outcomes,
  }
}

/** Simulate `count` spins of a weighted spinner using an injectable source. */
export function simulateSpins(
  segments: Segment[],
  count: number,
  source: RandomSource,
): SimulationResult {
  const outcomes: number[] = []
  for (let i = 0; i < count; i += 1) {
    outcomes.push(sampleSegment(segments, source))
  }
  return summarize(outcomes)
}

/** Build a simulation result directly from an injected outcome sequence. */
export function simulateFromOutcomes(outcomes: number[]): SimulationResult {
  return summarize([...outcomes])
}

/**
 * Append `count` more spins onto an existing result (used when the learner taps
 * Spin Once / Spin 10 / Spin 100 repeatedly). Pure — returns a new result.
 */
export function extendSimulation(
  prev: SimulationResult,
  segments: Segment[],
  count: number,
  source: RandomSource,
): SimulationResult {
  const next = [...prev.outcomes]
  for (let i = 0; i < count; i += 1) {
    next.push(sampleSegment(segments, source))
  }
  return summarize(next)
}

/**
 * Down-sample a running-average series to at most `maxPoints` points for a
 * compact review snapshot (keeps the first and last points). Practical for
 * 500-spin runs where storing every point is unnecessary.
 */
export function compactSeries(series: number[], maxPoints = 50): number[] {
  if (series.length <= maxPoints) {
    return [...series]
  }
  const step = (series.length - 1) / (maxPoints - 1)
  const out: number[] = []
  for (let i = 0; i < maxPoints; i += 1) {
    out.push(series[Math.round(i * step)])
  }
  return out
}

// Canonical spinner definitions used by Lesson 1 problems.
export const SPINNER_5050: Segment[] = [
  { value: 10, weight: 0.5 },
  { value: 0, weight: 0.5 },
]

export const SPINNER_2575: Segment[] = [
  { value: 20, weight: 0.25 },
  { value: 0, weight: 0.75 },
]
