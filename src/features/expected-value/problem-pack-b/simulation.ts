// Deterministic, injectable simulation helpers for the Lesson 5 risk problems
// (l5-same-ev-different-risk, l5-low-risk-vs-high-risk).
//
// The random source is always injected so tests are fully deterministic. No AI,
// no hidden global randomness in the checking path.

/** A random source returning a float in [0, 1). Defaults to Math.random. */
export type RandomSource = () => number

/**
 * A small, seedable PRNG (mulberry32). Used by tests to inject a deterministic
 * stream so simulation outcomes are reproducible.
 */
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

export interface GameOutcome {
  value: number
  /** Probability in [0, 1]. Probabilities across a game must sum to 1. */
  probability: number
}

export interface SimulationResult {
  results: number[]
  total: number
  /** Observed running average after each trial (length === trials). */
  runningAverage: number[]
  average: number
  trials: number
}

/**
 * Run `trials` independent draws from a discrete game using the injected RNG.
 * Cumulative probability buckets keep the mapping deterministic for a given RNG
 * stream.
 */
export function simulateGame(
  outcomes: GameOutcome[],
  trials: number,
  rng: RandomSource = Math.random,
): SimulationResult {
  const results: number[] = []
  const runningAverage: number[] = []
  let total = 0

  for (let i = 0; i < trials; i += 1) {
    const r = rng()
    let acc = 0
    let drawn = outcomes[outcomes.length - 1]?.value ?? 0
    for (const outcome of outcomes) {
      acc += outcome.probability
      if (r < acc) {
        drawn = outcome.value
        break
      }
    }
    results.push(drawn)
    total += drawn
    runningAverage.push(total / (i + 1))
  }

  return {
    results,
    total,
    runningAverage,
    average: trials > 0 ? total / trials : 0,
    trials,
  }
}

/** Theoretical expected value of a discrete game (deterministic, no RNG). */
export function expectedValue(outcomes: GameOutcome[]): number {
  return outcomes.reduce((sum, o) => sum + o.value * o.probability, 0)
}

/**
 * Population variance — a simple, deterministic risk measure used to confirm
 * that a "riskier" game genuinely has wider spread regardless of EV.
 */
export function variance(outcomes: GameOutcome[]): number {
  const ev = expectedValue(outcomes)
  return outcomes.reduce((sum, o) => sum + o.probability * (o.value - ev) ** 2, 0)
}

export const SAME_EV_REQUIRED_TRIALS = 20
export const LOW_HIGH_REQUIRED_TRIALS = 20

/** Whether enough trials have been run for the simulation to "count" as done. */
export function isSimulationComplete(trialsRun: number, required: number): boolean {
  return trialsRun >= required
}

// ---------------------------------------------------------------------------
// Pre-built game definitions used by the two risk problems.
// ---------------------------------------------------------------------------

/** l5-same-ev-different-risk: guaranteed $5 vs 50/50 $10/$0 (EV 5 each). */
export const SAME_EV_GAME_A: GameOutcome[] = [{ value: 5, probability: 1 }]
export const SAME_EV_GAME_B: GameOutcome[] = [
  { value: 10, probability: 0.5 },
  { value: 0, probability: 0.5 },
]

/** l5-low-risk-vs-high-risk: guaranteed $6 vs 50/50 $12/$0 (EV 6 each). */
export const LOW_HIGH_GAME_A: GameOutcome[] = [{ value: 6, probability: 1 }]
export const LOW_HIGH_GAME_B: GameOutcome[] = [
  { value: 12, probability: 0.5 },
  { value: 0, probability: 0.5 },
]
