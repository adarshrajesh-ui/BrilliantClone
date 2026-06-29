import { describe, expect, it } from 'vitest'
// Load both copies of the canonical matrix as raw text (Vite `?raw`, typed via
// vite/client) so the parity check needs no Node fs types under the app tsconfig.
import clientMatrixSource from './difficultyMatrix.ts?raw'
import serverMatrixSource from '../../../functions/src/difficultyMatrix.ts?raw'
import {
  createDeterministicPracticeInstance,
  validateGeneratedPracticeInstance,
  type GeneratedGame,
  type GeneratedTemplateKind,
} from './generatedPractice'
import { practiceComplexityScore } from './difficultyMatrix'

const ALL_TEMPLATES: GeneratedTemplateKind[] = [
  'weighted-average',
  'payout-vs-profit',
  'fairness-classification',
  'compare-ev',
  'same-ev-risk',
  'card-hand-ev',
  'card-deck-ev',
  'dice-ev',
  'profession-payout',
  'fair-price-to-play',
]

const DIFFICULTIES = [1, 2, 3, 4, 5] as const
const SEEDS = ['alpha', 'bravo', 'charlie', 'delta']

function instanceFor(templateKind: GeneratedTemplateKind, difficulty: number, seed: string) {
  return createDeterministicPracticeInstance({
    skillId: 'weighted-average',
    difficulty,
    seed: `${templateKind}-${seed}`,
    templateKind,
  })
}

function gameEv(game: GeneratedGame): number {
  return game.outcomes.reduce((total, outcome) => total + outcome.value * outcome.probability, 0)
}

describe('difficulty matrix parity', () => {
  it('keeps the client and server difficulty matrices byte-for-byte identical', () => {
    expect(serverMatrixSource).toBe(clientMatrixSource)
  })
})

describe('difficulty matrix scaling', () => {
  it('produces a valid instance at every difficulty 1-5 for every template', () => {
    for (const templateKind of ALL_TEMPLATES) {
      for (const difficulty of DIFFICULTIES) {
        for (const seed of SEEDS) {
          const instance = instanceFor(templateKind, difficulty, seed)
          expect(instance.problem.difficulty).toBe(difficulty)
          expect(validateGeneratedPracticeInstance(instance)).toEqual([])
        }
      }
    }
  })

  it('strictly increases a complexity dimension at every level for every template', () => {
    for (const templateKind of ALL_TEMPLATES) {
      for (const seed of SEEDS) {
        const scores = DIFFICULTIES.map((difficulty) =>
          practiceComplexityScore(templateKind, instanceFor(templateKind, difficulty, seed).problem.givenData),
        )
        for (let level = 1; level < scores.length; level += 1) {
          expect(
            scores[level],
            `${templateKind} seed=${seed} d${level + 1} (${scores[level]}) should exceed d${level} (${scores[level - 1]})`,
          ).toBeGreaterThan(scores[level - 1])
        }
      }
    }
  })

  it('makes difficulty 5 structurally different from difficulty 2 for every template', () => {
    for (const templateKind of ALL_TEMPLATES) {
      const seed = 'structure'
      const d2 = practiceComplexityScore(templateKind, instanceFor(templateKind, 2, seed).problem.givenData)
      const d5 = practiceComplexityScore(templateKind, instanceFor(templateKind, 5, seed).problem.givenData)
      expect(d5).not.toBe(d2)
    }
  })
})

describe('comparison templates stay well-posed across difficulty', () => {
  it('keeps a single clearly-better game for compare-ev at every difficulty', () => {
    for (const difficulty of DIFFICULTIES) {
      const instance = instanceFor('compare-ev', difficulty, 'seed')
      const games = instance.problem.givenData.games ?? []
      expect(games.length).toBeGreaterThanOrEqual(2)
      const best = games.find((game) => game.id === instance.answerKey.bestChoice)
      const others = games.filter((game) => game.id !== instance.answerKey.bestChoice)
      expect(best).toBeDefined()
      for (const other of others) {
        // The winner's expected value beats every rival by a clear margin.
        expect(gameEv(best as GeneratedGame) - gameEv(other)).toBeGreaterThan(0.1)
      }
    }
  })

  it('keeps equal expected values but a clear riskier game for same-ev-risk at every difficulty', () => {
    for (const difficulty of DIFFICULTIES) {
      const instance = instanceFor('same-ev-risk', difficulty, 'seed')
      const games = instance.problem.givenData.games ?? []
      expect(games.length).toBeGreaterThanOrEqual(2)
      const evs = games.map(gameEv)
      for (const ev of evs) {
        expect(Math.abs(ev - evs[0])).toBeLessThan(0.13)
      }
      const riskiest = games.find((game) => game.id === instance.answerKey.riskChoice)
      expect(riskiest).toBeDefined()
      const spread = (game: GeneratedGame) => {
        const values = game.outcomes.map((outcome) => outcome.value)
        return Math.max(...values) - Math.min(...values)
      }
      for (const other of games.filter((game) => game.id !== instance.answerKey.riskChoice)) {
        expect(spread(riskiest as GeneratedGame)).toBeGreaterThan(spread(other))
      }
    }
  })
})

describe('fairness fallback distribution', () => {
  it('produces favorable, fair, and unfavorable classifications across seeds', () => {
    const classes = new Set<string>()
    for (let i = 0; i < 30; i += 1) {
      const instance = instanceFor('fairness-classification', 3, `fairness-${i}`)
      if (instance.answerKey.classification) {
        classes.add(instance.answerKey.classification)
      }
    }
    expect(classes.has('favorable')).toBe(true)
    expect(classes.has('fair')).toBe(true)
    expect(classes.has('unfavorable')).toBe(true)
  })
})
