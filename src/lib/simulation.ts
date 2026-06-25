// Pure, seeded, deterministic simulation helpers for the Expected Value Lab.
//
// Every random draw flows through an injected `RandomSource`. Components derive a
// stable seed from the problem id + a per-run counter, so the *same* outcome
// sequence is produced whether the learner watches the full animation or uses
// the reduced-motion / tap fallback. No AI, no hidden global randomness, no
// Date/Math.random in the checking path — outcomes are reproducible and unit
// testable.
//
// Owned by Agent 5 (Lesson 5 + shared sim helpers). Lesson 1 may adopt this
// helper later; for this run it is the single shared seeded-RNG source.

/** A random source returning a float in [0, 1). Defaults to `Math.random`. */
export type RandomSource = () => number

/**
 * A small, seedable PRNG (mulberry32). Identical seed → identical stream, so a
 * reduced-motion render and an animated render share the exact same outcomes.
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

/**
 * Deterministically hash a string (e.g. `${problemId}-boothB-3`) into a 32-bit
 * seed. Lets components turn a stable per-run key into a reproducible stream
 * without storing the whole outcome array up front.
 */
export function hashSeed(input: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export interface DiscreteOutcome {
  value: number
  /** Probability in [0, 1]. Probabilities across a game must sum to 1. */
  probability: number
}

export interface SimulationResult {
  /** Drawn outcome value per trial. */
  results: number[]
  /** Sum of all drawn values. */
  total: number
  /** Observed running average after each trial (length === trials). */
  runningAverage: number[]
  /** Final observed average (total / trials), or 0 when no trials were run. */
  average: number
  trials: number
}

/** Draw a single outcome from a discrete game using cumulative buckets. */
export function drawOutcome(
  outcomes: DiscreteOutcome[],
  rng: RandomSource = Math.random,
): number {
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
  return drawn
}

/**
 * Run `trials` independent draws from a discrete game using the injected RNG.
 * Cumulative probability buckets keep the mapping deterministic for a given RNG
 * stream.
 */
export function simulateDiscrete(
  outcomes: DiscreteOutcome[],
  trials: number,
  rng: RandomSource = Math.random,
): SimulationResult {
  const results: number[] = []
  const runningAverage: number[] = []
  let total = 0

  for (let i = 0; i < trials; i += 1) {
    const drawn = drawOutcome(outcomes, rng)
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
export function expectedValue(outcomes: DiscreteOutcome[]): number {
  return outcomes.reduce((sum, o) => sum + o.value * o.probability, 0)
}

/**
 * Population variance — a deterministic risk measure used to confirm a "riskier"
 * game genuinely has wider spread regardless of EV.
 */
export function variance(outcomes: DiscreteOutcome[]): number {
  const ev = expectedValue(outcomes)
  return outcomes.reduce((sum, o) => sum + o.probability * (o.value - ev) ** 2, 0)
}

/** Whether enough trials have been run for a simulation to "count" as done. */
export function isSimulationComplete(trialsRun: number, required: number): boolean {
  return trialsRun >= required
}

// ---------------------------------------------------------------------------
// Convenience builders for the carnival domains (booth / spinner / dice).
// ---------------------------------------------------------------------------

/** A guaranteed-payout game: one outcome with probability 1. */
export function constantGame(value: number): DiscreteOutcome[] {
  return [{ value, probability: 1 }]
}

/**
 * Turn a list of equally-likely section values (a spinner or carnival wheel)
 * into a discrete game where every section has probability 1 / n.
 */
export function sectionsToOutcomes(values: number[]): DiscreteOutcome[] {
  if (values.length === 0) {
    return []
  }
  const probability = 1 / values.length
  return values.map((value) => ({ value, probability }))
}

/** Simulate spinning an equally-divided wheel/spinner of section values. */
export function simulateSections(
  values: number[],
  trials: number,
  rng: RandomSource = Math.random,
): SimulationResult {
  return simulateDiscrete(sectionsToOutcomes(values), trials, rng)
}

/** Roll a single fair die with `sides` faces (1..sides). */
export function rollDie(sides: number, rng: RandomSource = Math.random): number {
  return Math.floor(rng() * sides) + 1
}

/** Simulate `trials` rolls of a fair `sides`-faced die (values 1..sides). */
export function simulateDice(
  sides: number,
  trials: number,
  rng: RandomSource = Math.random,
): SimulationResult {
  const faces = Array.from({ length: sides }, (_, i) => i + 1)
  return simulateSections(faces, trials, rng)
}

/**
 * Run a deterministic batch for a single game keyed by a stable run key (e.g.
 * `${problemId}-boothB-${runCount}`). Watching the animation and using the
 * reduced-motion fallback both call this with the same key → identical outcomes.
 */
export function runDeterministicBatch(
  outcomes: DiscreteOutcome[],
  trials: number,
  runKey: string,
): SimulationResult {
  return simulateDiscrete(outcomes, trials, createSeededRandom(hashSeed(runKey)))
}
