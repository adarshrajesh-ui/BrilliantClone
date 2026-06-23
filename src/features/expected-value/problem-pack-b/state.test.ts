import { describe, expect, it } from 'vitest'
import {
  problemPackBInitialStateFactories,
  problemPackBReviewSerializers,
  serializeReview,
  summarizeSeries,
  summarizeSimulation,
} from './state'
import { createSeededRandom, simulateGame, SAME_EV_GAME_B } from './simulation'
import { problemPackB } from './problems'
import type { PackCanonicalSlug } from './types'

const SLUGS = problemPackB.map((p) => p.canonicalSlug)

describe('initial-state factories (restart / fresh session)', () => {
  it('provides a factory for every problem', () => {
    for (const slug of SLUGS) {
      expect(typeof problemPackBInitialStateFactories[slug]).toBe('function')
    }
  })

  it('returns a fresh, mutation-isolated object each call (restart safety)', () => {
    const make = problemPackBInitialStateFactories['l3-prize-bag-ev-table']
    const a = make()
    const b = make()
    expect(a).not.toBe(b)
    expect(a).toEqual(b)
  })

  it('ships the repair table with the known errors to repair', () => {
    const state = problemPackBInitialStateFactories['l3-repair-probability-table']() as {
      rows: { outcome: number; probability: string }[]
    }
    expect(state.rows[1].probability).toBe('3/10') // $4 ships wrong
    expect(state.rows[2].probability).toBe('') // $0 ships blank
  })

  it('starts simulation problems with both sims unrun and blank answers', () => {
    const state = problemPackBInitialStateFactories['l5-same-ev-different-risk']() as {
      gameASimulated: boolean
      gameBSimulated: boolean
      evA: string
    }
    expect(state.gameASimulated).toBe(false)
    expect(state.gameBSimulated).toBe(false)
    expect(state.evA).toBe('')
  })
})

describe('review serialization', () => {
  it('provides a serializer for every problem and round-trips through JSON', () => {
    for (const slug of SLUGS) {
      const factory = problemPackBInitialStateFactories[slug]
      const snapshot = problemPackBReviewSerializers[slug](factory())
      expect(snapshot.canonicalSlug).toBe(slug)
      // Compact + serializable.
      expect(() => JSON.parse(JSON.stringify(snapshot))).not.toThrow()
    }
  })

  it('captures the correct answer and explanation for a completed problem', () => {
    const completed = {
      probabilities: ['1/10', '2/10', '7/10'],
      contributions: ['3', '2', '0'],
      expectedPayout: '5',
      expectedProfit: '0',
      decision: 'fair',
    }
    const snapshot = serializeReview('l5-build-whole-ev-model' as PackCanonicalSlug, completed)
    expect(snapshot.correct.decision).toBe('fair')
    expect(snapshot.explanation).toContain('fair')
    expect(snapshot.submitted).toEqual(completed)
  })
})

describe('simulation review summary (compact, no raw events)', () => {
  it('down-samples a long series to at most 20 points', () => {
    const series = Array.from({ length: 500 }, (_, i) => i / 100)
    expect(summarizeSeries(series).length).toBeLessThanOrEqual(20)
  })

  it('summarizes a simulation into trials + average + trimmed series', () => {
    const sim = simulateGame(SAME_EV_GAME_B, 200, createSeededRandom(5))
    const summary = summarizeSimulation(sim)
    expect(summary.trials).toBe(200)
    expect(summary.runningAverage.length).toBeLessThanOrEqual(20)
    expect(typeof summary.observedAverage).toBe('number')
  })
})
