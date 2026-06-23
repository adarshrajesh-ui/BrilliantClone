import { describe, expect, it } from 'vitest'
import { initialStateFactories, reviewSerializers } from '../state'
import type { CanonicalSlug } from '../types'

const SLUGS: CanonicalSlug[] = [
  'l1-long-run-average',
  'l1-unequal-spinner',
  'l1-short-run-vs-long-run',
  'l1-compare-spinners',
  'l2-build-weighted-average',
  'l2-match-outcomes-probabilities',
  'l2-fill-missing-formula',
  'l2-diagnose-bad-ev-setups',
  'l3-mystery-box-outcomes',
  'l3-calculate-ev-from-table',
]

describe('initial-state factories (restart compatibility)', () => {
  it('exist for every problem', () => {
    for (const slug of SLUGS) {
      expect(typeof initialStateFactories[slug]).toBe('function')
    }
  })

  it('return a fresh, independent object each call', () => {
    for (const slug of SLUGS) {
      const a = initialStateFactories[slug]()
      const b = initialStateFactories[slug]()
      expect(a).not.toBe(b)
      // mutating one must not affect the other (deep independence on arrays)
      expect(a).toEqual(b)
    }
  })

  it('long-run-average starts empty (restart yields clean slate)', () => {
    const s = initialStateFactories['l1-long-run-average']()
    expect(s.totalSpins).toBe(0)
    expect(s.predictionSubmitted).toBe(false)
    expect(s.runningAverages).toEqual([])
  })

  it('mystery boxes start unrevealed with blank rows', () => {
    const s = initialStateFactories['l3-mystery-box-outcomes']()
    expect(s.revealed).toEqual([false, false, false, false, false, false])
    expect(s.rows.every((r) => r.count === '' && r.probability === '')).toBe(true)
  })

  it('mutating a restarted state does not leak into the next restart', () => {
    const first = initialStateFactories['l2-build-weighted-average']()
    first.slots[0] = '$20'
    const second = initialStateFactories['l2-build-weighted-average']()
    expect(second.slots[0]).toBe('')
  })
})

describe('review serializers (compact snapshots)', () => {
  it('exist for every problem', () => {
    for (const slug of SLUGS) {
      expect(typeof reviewSerializers[slug]).toBe('function')
    }
  })

  it('long-run-average snapshot retains a compact graph + final answer', () => {
    const series = Array.from({ length: 500 }, () => 5)
    const snap = reviewSerializers['l1-long-run-average']({
      prediction: 5,
      predictionSubmitted: true,
      finalAnswer: '$5',
      totalSpins: 500,
      totalWinnings: 2500,
      runningAverages: series,
      lastOutcome: 0,
    })
    expect(snap.slug).toBe('l1-long-run-average')
    expect(snap.summary.finalAnswer).toBe('$5')
    expect((snap.summary.graph as number[]).length).toBeLessThanOrEqual(50)
    expect(snap.summary.observedAverage).toBe(5)
  })

  it('mystery box snapshot reconstructs the final table', () => {
    const snap = reviewSerializers['l3-mystery-box-outcomes']({
      revealed: [true, true, true, true, true, true],
      rows: [
        { outcome: 12, count: '1', probability: '1/6' },
        { outcome: 6, count: '2', probability: '1/3' },
        { outcome: 0, count: '3', probability: '1/2' },
      ],
    })
    expect((snap.summary.rows as unknown[]).length).toBe(3)
    expect((snap.summary.revealed as boolean[]).every(Boolean)).toBe(true)
  })
})
