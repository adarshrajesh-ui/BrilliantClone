import { describe, expect, it } from 'vitest'
import {
  buildDeterministicFeedback,
  checkGeneratedAnswer,
  computeGeneratedAnswerKey,
  createDeterministicPracticeInstance,
  validateGeneratedPracticeInstance,
  type GeneratedAnswerSubmission,
  type GeneratedOutcome,
  type GeneratedPracticeInstance,
  type GeneratedTemplateKind,
} from './generatedPractice'
import type { SkillId } from '../../core/adaptive/types'
import { cardValue, type CardRank, type CardSuit } from '../../data/cards'

describe('generated practice validation and checking', () => {
  it('recomputes weighted-average answers from public data', () => {
    const instance = createDeterministicPracticeInstance({
      skillId: 'weighted-average',
      difficulty: 2,
      seed: 'weighted-average-test',
    })

    expect(computeGeneratedAnswerKey(instance.problem).expectedValue).toBe(
      instance.answerKey.expectedValue,
    )
    expect(validateGeneratedPracticeInstance(instance)).toEqual([])
  })

  it('rejects generated outcomes whose probabilities do not sum to one', () => {
    const instance = createDeterministicPracticeInstance({
      skillId: 'weighted-average',
      difficulty: 2,
      seed: 'invalid-probability-test',
    })
    const invalid: GeneratedPracticeInstance = {
      ...instance,
      problem: {
        ...instance.problem,
        givenData: {
          outcomes: [
            { label: 'A', value: 10, probability: 0.7 },
            { label: 'B', value: 2, probability: 0.7 },
          ],
        },
      },
    }

    expect(validateGeneratedPracticeInstance(invalid)).toContain(
      'Outcome probabilities must sum to 1.',
    )
  })

  it('grades expected payout answers deterministically', () => {
    const instance = createDeterministicPracticeInstance({
      skillId: 'weighted-average',
      difficulty: 2,
      seed: 'checker-test',
    })
    const correct = checkGeneratedAnswer(instance.problem, instance.answerKey, {
      expectedValue: String(instance.answerKey.expectedValue),
    })
    const wrong = checkGeneratedAnswer(instance.problem, instance.answerKey, {
      expectedValue: '999',
    })

    expect(correct.canComplete).toBe(true)
    expect(wrong.mistakeType).toBe('arithmetic-error')
  })

  it('detects expected-payout answers submitted for profit prompts', () => {
    const instance = createDeterministicPracticeInstance({
      skillId: 'payout-vs-profit',
      difficulty: 3,
      seed: 'profit-test',
    })
    const result = checkGeneratedAnswer(instance.problem, instance.answerKey, {
      expectedProfit: String(instance.answerKey.expectedValue),
    })

    expect(result.canComplete).toBe(false)
    expect(result.mistakeType).toBe('answered-payout')
  })
})

describe('card-hand-ev generated practice', () => {
  function cardHandInstance(
    cards: Array<{ rank: CardRank; suit: CardSuit }>,
  ): GeneratedPracticeInstance {
    const base = createDeterministicPracticeInstance({
      skillId: 'ev-from-table',
      difficulty: 2,
      seed: 'card-hand-fixture',
      templateKind: 'card-hand-ev',
    })
    const problem = { ...base.problem, givenData: { cards } }
    return { problem, answerKey: computeGeneratedAnswerKey(problem) }
  }

  it('computes the expected value as the average card value', () => {
    expect(
      computeGeneratedAnswerKey(
        cardHandInstance([
          { rank: 'A', suit: 'spades' },
          { rank: '3', suit: 'hearts' },
          { rank: '5', suit: 'diamonds' },
          { rank: '7', suit: 'clubs' },
          { rank: '9', suit: 'spades' },
        ]).problem,
      ).expectedValue,
    ).toBe(5)

    expect(
      computeGeneratedAnswerKey(
        cardHandInstance([
          { rank: '2', suit: 'clubs' },
          { rank: '4', suit: 'hearts' },
          { rank: '6', suit: 'spades' },
          { rank: '8', suit: 'diamonds' },
          { rank: '10', suit: 'clubs' },
        ]).problem,
      ).expectedValue,
    ).toBe(6)
  })

  it('accepts a valid card hand and rejects malformed ones', () => {
    const valid = cardHandInstance([
      { rank: 'A', suit: 'spades' },
      { rank: '3', suit: 'hearts' },
      { rank: '5', suit: 'diamonds' },
      { rank: '7', suit: 'clubs' },
      { rank: '9', suit: 'spades' },
    ])
    expect(validateGeneratedPracticeInstance(valid)).toEqual([])

    const tooFewCards = cardHandInstance([{ rank: 'A', suit: 'spades' }])
    expect(validateGeneratedPracticeInstance(tooFewCards)).toContain(
      'A card hand must have between 2 and 12 cards.',
    )

    const invalidRank = cardHandInstance([
      { rank: 'A', suit: 'spades' },
      { rank: '11' as CardRank, suit: 'hearts' },
    ])
    expect(validateGeneratedPracticeInstance(invalidRank)).toContain(
      'Card hand contains an invalid rank or suit.',
    )
  })

  it('builds a deterministic card hand whose answer key is the average', () => {
    const instance = createDeterministicPracticeInstance({
      skillId: 'ev-from-table',
      difficulty: 2,
      seed: 'card-hand-deterministic',
      templateKind: 'card-hand-ev',
    })
    const cards = instance.problem.givenData.cards ?? []

    expect(cards.length).toBeGreaterThanOrEqual(2)
    expect(cards.length).toBeLessThanOrEqual(12)

    const average =
      cards.reduce((sum, card) => sum + cardValue(card.rank), 0) / cards.length
    expect(instance.answerKey.expectedValue).toBeCloseTo(average)
    expect(validateGeneratedPracticeInstance(instance)).toEqual([])
  })
})

describe('dice-ev generated practice', () => {
  function diceInstance(dice: { count: number; sides: number }): GeneratedPracticeInstance {
    const base = createDeterministicPracticeInstance({
      skillId: 'long-run-average',
      difficulty: 2,
      seed: 'dice-fixture',
      templateKind: 'dice-ev',
    })
    const problem = { ...base.problem, givenData: { dice } }
    return { problem, answerKey: computeGeneratedAnswerKey(problem) }
  }

  it('computes the expected sum as count * (sides + 1) / 2', () => {
    expect(
      computeGeneratedAnswerKey(diceInstance({ count: 2, sides: 6 }).problem).expectedValue,
    ).toBe(7)
    expect(
      computeGeneratedAnswerKey(diceInstance({ count: 3, sides: 6 }).problem).expectedValue,
    ).toBe(10.5)
  })

  it('accepts valid dice and rejects bad counts or sides', () => {
    expect(validateGeneratedPracticeInstance(diceInstance({ count: 2, sides: 6 }))).toEqual([])

    const diceError = 'A dice roll must use 1 to 6 dice with 4, 6, 8, 10, 12, or 20 sides.'
    expect(validateGeneratedPracticeInstance(diceInstance({ count: 0, sides: 6 }))).toContain(
      diceError,
    )
    expect(validateGeneratedPracticeInstance(diceInstance({ count: 2, sides: 7 }))).toContain(
      diceError,
    )
  })

  it('builds a deterministic dice roll whose answer key matches the closed form', () => {
    const instance = createDeterministicPracticeInstance({
      skillId: 'long-run-average',
      difficulty: 2,
      seed: 'dice-deterministic',
      templateKind: 'dice-ev',
    })
    expect(instance.problem.templateKind).toBe('dice-ev')
    expect(instance.problem.answerInputs).toEqual(['expectedValue'])

    const dice = instance.problem.givenData.dice ?? { count: 0, sides: 0 }
    expect(dice.count).toBeGreaterThanOrEqual(1)
    expect(instance.answerKey.expectedValue).toBeCloseTo((dice.count * (dice.sides + 1)) / 2)
    expect(validateGeneratedPracticeInstance(instance)).toEqual([])
  })
})

describe('card-deck-ev generated practice', () => {
  function standardDeckOutcomes(): GeneratedOutcome[] {
    const outcomes: GeneratedOutcome[] = []
    for (let value = 1; value <= 9; value += 1) {
      outcomes.push({ label: `Value ${value}`, value, probability: 4 / 52 })
    }
    outcomes.push({ label: 'Value 10', value: 10, probability: 16 / 52 })
    return outcomes
  }

  function deckInstance(outcomes: GeneratedOutcome[]): GeneratedPracticeInstance {
    const base = createDeterministicPracticeInstance({
      skillId: 'probability-from-counts',
      difficulty: 2,
      seed: 'deck-fixture',
      templateKind: 'card-deck-ev',
    })
    const problem = { ...base.problem, givenData: { outcomes } }
    return { problem, answerKey: computeGeneratedAnswerKey(problem) }
  }

  it('computes the expected value of one card from the standard 52-card distribution', () => {
    expect(
      computeGeneratedAnswerKey(deckInstance(standardDeckOutcomes()).problem).expectedValue,
    ).toBeCloseTo(340 / 52, 3)
  })

  it('rejects a deck draw with no value outcomes', () => {
    expect(validateGeneratedPracticeInstance(deckInstance([]))).toContain(
      'A deck draw must list at least one value outcome.',
    )
  })

  it('builds a deterministic deck draw whose answer key sums value * probability', () => {
    const instance = createDeterministicPracticeInstance({
      skillId: 'probability-from-counts',
      difficulty: 2,
      seed: 'deck-deterministic',
      templateKind: 'card-deck-ev',
    })
    expect(instance.problem.templateKind).toBe('card-deck-ev')
    expect(instance.problem.answerInputs).toEqual(['expectedValue'])

    // The deck variant (and thus its EV) now depends on difficulty, so the key
    // is recomputed from the actual outcomes rather than pinned to the full
    // 52-card 340/52 value (which is the difficulty-5 variant — see below).
    const outcomes = instance.problem.givenData.outcomes ?? []
    const expectedValue = outcomes.reduce(
      (sum, outcome) => sum + outcome.value * outcome.probability,
      0,
    )
    expect(instance.answerKey.expectedValue).toBeCloseTo(expectedValue)
    expect(validateGeneratedPracticeInstance(instance)).toEqual([])
  })
})

describe('profession-payout generated practice', () => {
  function professionInstance(outcomes: GeneratedOutcome[]): GeneratedPracticeInstance {
    const base = createDeterministicPracticeInstance({
      skillId: 'weighted-average',
      difficulty: 2,
      seed: 'profession-fixture',
      templateKind: 'profession-payout',
    })
    const problem = { ...base.problem, givenData: { outcomes } }
    return { problem, answerKey: computeGeneratedAnswerKey(problem) }
  }

  it('computes the expected payout as the weighted average of outcomes', () => {
    expect(
      computeGeneratedAnswerKey(
        professionInstance([
          { label: 'Strong month', value: 10000, probability: 0.5 },
          { label: 'Slow month', value: 5000, probability: 0.5 },
        ]).problem,
      ).expectedValue,
    ).toBe(7500)
  })

  it('rejects a profession payout with no outcomes', () => {
    expect(validateGeneratedPracticeInstance(professionInstance([]))).toContain(
      'A profession payout must list at least one outcome.',
    )
  })

  it('builds a deterministic profession payout whose answer key sums value * probability', () => {
    const instance = createDeterministicPracticeInstance({
      skillId: 'weighted-average',
      difficulty: 2,
      seed: 'profession-deterministic',
      templateKind: 'profession-payout',
    })
    expect(instance.problem.templateKind).toBe('profession-payout')
    expect(instance.problem.answerInputs).toEqual(['expectedValue'])

    const outcomes = instance.problem.givenData.outcomes ?? []
    // d2 Payday: exactly two outcomes whose probabilities sum to 1.
    expect(outcomes.length).toBe(2)
    expect(outcomes.reduce((sum, outcome) => sum + outcome.probability, 0)).toBeCloseTo(1)
    const expectedValue = outcomes.reduce(
      (sum, outcome) => sum + outcome.value * outcome.probability,
      0,
    )
    expect(instance.answerKey.expectedValue).toBeCloseTo(expectedValue)
    expect(instance.answerKey.expectedValue ?? 0).toBeGreaterThan(0)
    expect(validateGeneratedPracticeInstance(instance)).toEqual([])
  })
})

describe('payout-vs-profit generated practice', () => {
  it('computes expected profit as expected payout minus cost', () => {
    const instance = createDeterministicPracticeInstance({
      skillId: 'payout-vs-profit',
      difficulty: 2,
      seed: 'payout-profit-fixture',
      templateKind: 'payout-vs-profit',
    })

    const outcomes = instance.problem.givenData.outcomes ?? []
    const cost = instance.problem.givenData.cost ?? 0
    const expectedPayout = outcomes.reduce((sum, outcome) => sum + outcome.value * outcome.probability, 0)

    expect(instance.problem.answerInputs).toEqual(['expectedProfit'])
    expect(instance.problem.givenData.cost).toBeDefined()
    expect(instance.answerKey.expectedProfit).toBeCloseTo(expectedPayout - cost)
    expect(validateGeneratedPracticeInstance(instance)).toEqual([])
  })

  it('accepts the expected profit and rejects a wrong number', () => {
    const instance = createDeterministicPracticeInstance({
      skillId: 'payout-vs-profit',
      difficulty: 2,
      seed: 'payout-profit-checker',
      templateKind: 'payout-vs-profit',
    })

    const correct = checkGeneratedAnswer(instance.problem, instance.answerKey, {
      expectedProfit: String(instance.answerKey.expectedProfit),
    })
    const wrong = checkGeneratedAnswer(instance.problem, instance.answerKey, {
      expectedProfit: '-999',
    })

    expect(correct.canComplete).toBe(true)
    expect(wrong.canComplete).toBe(false)
  })
})

describe('fairness-classification generated practice', () => {
  it('classifies by expected profit and validates', () => {
    const instance = createDeterministicPracticeInstance({
      skillId: 'fairness-classification',
      difficulty: 2,
      seed: 'fairness-fixture',
      templateKind: 'fairness-classification',
    })

    expect(instance.problem.templateKind).toBe('fairness-classification')
    expect(instance.problem.answerInputs).toEqual(['classification'])
    expect(instance.problem.givenData.cost).toBeDefined()
    expect(['fair', 'favorable', 'unfavorable']).toContain(instance.answerKey.classification)
    expect(validateGeneratedPracticeInstance(instance)).toEqual([])
  })

  it('accepts the right classification and rejects a wrong one', () => {
    const instance = createDeterministicPracticeInstance({
      skillId: 'fairness-classification',
      difficulty: 2,
      seed: 'fairness-checker',
      templateKind: 'fairness-classification',
    })
    const correctLabel = instance.answerKey.classification as string
    const wrongLabel = correctLabel === 'favorable' ? 'unfavorable' : 'favorable'

    const correct = checkGeneratedAnswer(instance.problem, instance.answerKey, {
      classification: correctLabel,
    })
    const wrong = checkGeneratedAnswer(instance.problem, instance.answerKey, {
      classification: wrongLabel,
    })

    expect(correct.canComplete).toBe(true)
    expect(wrong.mistakeType).toBe('wrong-classification')
  })
})

describe('compare-ev generated practice', () => {
  it('builds at least two distinct games and picks the higher expected value', () => {
    const instance = createDeterministicPracticeInstance({
      skillId: 'compare-ev',
      difficulty: 2,
      seed: 'compare-fixture',
      templateKind: 'compare-ev',
    })

    const games = instance.problem.givenData.games ?? []
    expect(games.length).toBeGreaterThanOrEqual(2)
    expect(new Set(games.map((game) => game.id)).size).toBe(games.length)
    expect(instance.problem.answerInputs).toEqual(['bestChoice'])
    expect(validateGeneratedPracticeInstance(instance)).toEqual([])

    const evById = games.map((game) => ({
      id: game.id,
      ev: game.outcomes.reduce((sum, outcome) => sum + outcome.value * outcome.probability, 0) - (game.cost ?? 0),
    }))
    const bestId = [...evById].sort((a, b) => b.ev - a.ev)[0].id
    expect(instance.answerKey.bestChoice).toBe(bestId)
  })

  it('accepts the best game and rejects a worse one', () => {
    const instance = createDeterministicPracticeInstance({
      skillId: 'compare-ev',
      difficulty: 2,
      seed: 'compare-checker',
      templateKind: 'compare-ev',
    })
    const games = instance.problem.givenData.games ?? []
    const worseId = games.find((game) => game.id !== instance.answerKey.bestChoice)?.id

    const correct = checkGeneratedAnswer(instance.problem, instance.answerKey, {
      bestChoice: instance.answerKey.bestChoice,
    })
    const wrong = checkGeneratedAnswer(instance.problem, instance.answerKey, {
      bestChoice: worseId,
    })

    expect(correct.canComplete).toBe(true)
    expect(wrong.mistakeType).toBe('chose-worse-game')
  })
})

describe('same-ev-risk generated practice', () => {
  it('builds two equal-EV games and picks the wider spread', () => {
    const instance = createDeterministicPracticeInstance({
      skillId: 'same-ev-different-risk',
      difficulty: 2,
      seed: 'risk-fixture',
      templateKind: 'same-ev-risk',
    })

    const games = instance.problem.givenData.games ?? []
    expect(games.length).toBeGreaterThanOrEqual(2)
    expect(instance.problem.answerInputs).toEqual(['riskChoice'])
    expect(validateGeneratedPracticeInstance(instance)).toEqual([])

    const expectedValues = games.map((game) =>
      game.outcomes.reduce((sum, outcome) => sum + outcome.value * outcome.probability, 0),
    )
    for (const ev of expectedValues) {
      expect(ev).toBeCloseTo(expectedValues[0])
    }

    const spreads = games.map((game) => ({
      id: game.id,
      spread:
        Math.max(...game.outcomes.map((outcome) => outcome.value)) -
        Math.min(...game.outcomes.map((outcome) => outcome.value)),
    }))
    const riskiest = [...spreads].sort((a, b) => b.spread - a.spread)[0].id
    expect(instance.answerKey.riskChoice).toBe(riskiest)
  })

  it('rejects games whose expected values differ', () => {
    const base = createDeterministicPracticeInstance({
      skillId: 'same-ev-different-risk',
      difficulty: 2,
      seed: 'risk-invalid',
      templateKind: 'same-ev-risk',
    })
    const invalid: GeneratedPracticeInstance = {
      ...base,
      problem: {
        ...base.problem,
        givenData: {
          games: [
            { id: 'a', label: 'Game A', outcomes: [{ label: 'Flat', value: 4, probability: 1 }] },
            {
              id: 'b',
              label: 'Game B',
              outcomes: [
                { label: 'Win', value: 20, probability: 0.5 },
                { label: 'Miss', value: 0, probability: 0.5 },
              ],
            },
          ],
        },
      },
    }

    expect(validateGeneratedPracticeInstance(invalid)).toContain(
      'Same-EV risk games must share the same expected value.',
    )
  })
})

describe('fair-price-to-play generated practice', () => {
  it('computes the fair price as the expected payout with no cost', () => {
    const instance = createDeterministicPracticeInstance({
      skillId: 'payout-vs-profit',
      difficulty: 2,
      seed: 'fair-price-fixture',
      templateKind: 'fair-price-to-play',
    })

    const outcomes = instance.problem.givenData.outcomes ?? []
    const expectedPayout = outcomes.reduce((sum, outcome) => sum + outcome.value * outcome.probability, 0)

    expect(instance.problem.templateKind).toBe('fair-price-to-play')
    expect(instance.problem.answerInputs).toEqual(['expectedValue'])
    expect(instance.problem.givenData.cost).toBeUndefined()
    expect(instance.answerKey.expectedValue).toBeCloseTo(expectedPayout)
    expect(validateGeneratedPracticeInstance(instance)).toEqual([])
  })

  it('grades the fair price as correct and a different number as wrong', () => {
    const instance = createDeterministicPracticeInstance({
      skillId: 'payout-vs-profit',
      difficulty: 2,
      seed: 'fair-price-checker',
      templateKind: 'fair-price-to-play',
    })

    const correct = checkGeneratedAnswer(instance.problem, instance.answerKey, {
      expectedValue: String(instance.answerKey.expectedValue),
    })
    const wrong = checkGeneratedAnswer(instance.problem, instance.answerKey, {
      expectedValue: '0',
    })

    expect(correct.canComplete).toBe(true)
    expect(wrong.canComplete).toBe(false)
  })
})

describe('feedback contract', () => {
  // One representative skill per template kind so we can build every template.
  const TEMPLATE_SKILLS: Array<[GeneratedTemplateKind, SkillId]> = [
    ['card-hand-ev', 'ev-from-table'],
    ['dice-ev', 'long-run-average'],
    ['card-deck-ev', 'probability-from-counts'],
    ['profession-payout', 'weighted-average'],
    ['weighted-average', 'weighted-average'],
    ['payout-vs-profit', 'payout-vs-profit'],
    ['fairness-classification', 'fairness-classification'],
    ['fair-price-to-play', 'payout-vs-profit'],
    ['compare-ev', 'compare-ev'],
    ['same-ev-risk', 'same-ev-different-risk'],
  ]

  function correctSubmissionFor(instance: GeneratedPracticeInstance): GeneratedAnswerSubmission {
    const { answerInputs } = instance.problem
    const key = instance.answerKey
    const submission: GeneratedAnswerSubmission = {}
    if (answerInputs.includes('expectedValue')) submission.expectedValue = String(key.expectedValue)
    if (answerInputs.includes('expectedProfit')) submission.expectedProfit = String(key.expectedProfit)
    if (answerInputs.includes('classification')) submission.classification = key.classification
    if (answerInputs.includes('bestChoice')) submission.bestChoice = key.bestChoice
    if (answerInputs.includes('riskChoice')) submission.riskChoice = key.riskChoice
    return submission
  }

  function wrongSubmissionFor(instance: GeneratedPracticeInstance): GeneratedAnswerSubmission {
    const { answerInputs, givenData } = instance.problem
    const key = instance.answerKey
    const submission: GeneratedAnswerSubmission = {}
    if (answerInputs.includes('expectedValue')) submission.expectedValue = '99999'
    if (answerInputs.includes('expectedProfit')) submission.expectedProfit = '99999'
    if (answerInputs.includes('classification')) {
      submission.classification = key.classification === 'favorable' ? 'unfavorable' : 'favorable'
    }
    if (answerInputs.includes('bestChoice')) {
      submission.bestChoice = (givenData.games ?? []).find((g) => g.id !== key.bestChoice)?.id
    }
    if (answerInputs.includes('riskChoice')) {
      submission.riskChoice = (givenData.games ?? []).find((g) => g.id !== key.riskChoice)?.id
    }
    return submission
  }

  it('never reuses the prompt as the concept summary, for every template', () => {
    for (const [templateKind, skillId] of TEMPLATE_SKILLS) {
      const instance = createDeterministicPracticeInstance({
        skillId,
        difficulty: 3,
        seed: `concept-${templateKind}`,
        templateKind,
      })
      const summary = instance.problem.feedback.conceptSummary
      expect(summary.length).toBeGreaterThan(0)
      expect(summary).not.toBe(instance.problem.prompt)
    }
  })

  it('attaches a concept summary + worked solution on a correct answer', () => {
    for (const [templateKind, skillId] of TEMPLATE_SKILLS) {
      const instance = createDeterministicPracticeInstance({
        skillId,
        difficulty: 3,
        seed: `correct-${templateKind}`,
        templateKind,
      })
      const result = checkGeneratedAnswer(
        instance.problem,
        instance.answerKey,
        correctSubmissionFor(instance),
      )
      expect(result.isCorrect).toBe(true)
      expect(result.explanation?.conceptSummary).toBe(instance.problem.feedback.conceptSummary)
      expect((result.explanation?.workedSolution ?? []).length).toBeGreaterThan(0)
    }
  })

  it('gives what-happened / why / repair on a wrong answer, for every template', () => {
    for (const [templateKind, skillId] of TEMPLATE_SKILLS) {
      const instance = createDeterministicPracticeInstance({
        skillId,
        difficulty: 3,
        seed: `wrong-${templateKind}`,
        templateKind,
      })
      const result = checkGeneratedAnswer(
        instance.problem,
        instance.answerKey,
        wrongSubmissionFor(instance),
      )
      expect(result.isCorrect).toBe(false)
      expect(result.mistakeType).toBeTruthy()
      expect(result.explanation?.whatHappened).toBeTruthy()
      expect(result.explanation?.whyItMatters).toBeTruthy()
      expect(result.explanation?.repairStep).toBeTruthy()
    }
  })

  it('uses the actual die size in dice feedback (d20 averages 10.5, not 3.5)', () => {
    const base = createDeterministicPracticeInstance({
      skillId: 'long-run-average',
      difficulty: 5,
      seed: 'dice-feedback',
      templateKind: 'dice-ev',
    })
    const problem = { ...base.problem, givenData: { dice: { count: 1, sides: 20 } } }
    problem.feedback = buildDeterministicFeedback(problem)
    const answerKey = computeGeneratedAnswerKey(problem)

    expect(problem.feedback.conceptSummary).toContain('10.5')
    const oneDieRow = checkGeneratedAnswer(problem, answerKey, {
      expectedValue: String(answerKey.expectedValue),
    }).explanation?.workedSolution?.find((row) => row.label === 'One die average')
    expect(oneDieRow?.value).toBe('10.5')

    const wrong = checkGeneratedAnswer(problem, answerKey, { expectedValue: '3.5' })
    expect(wrong.mistakeType).toBe('arithmetic-error')
    expect(wrong.explanation?.whyItMatters).toContain('10.5')
  })

  it('shows contribution rows for deck / fairness / profit answers', () => {
    const deck = createDeterministicPracticeInstance({
      skillId: 'probability-from-counts',
      difficulty: 3,
      seed: 'deck-rows',
      templateKind: 'card-deck-ev',
    })
    const deckRows =
      checkGeneratedAnswer(deck.problem, deck.answerKey, {
        expectedValue: String(deck.answerKey.expectedValue),
      }).explanation?.workedSolution ?? []
    // One row per outcome plus a total row.
    expect(deckRows.length).toBe((deck.problem.givenData.outcomes ?? []).length + 1)
    expect(deckRows.some((row) => row.label === 'Expected value')).toBe(true)

    const profit = createDeterministicPracticeInstance({
      skillId: 'payout-vs-profit',
      difficulty: 3,
      seed: 'profit-rows',
      templateKind: 'payout-vs-profit',
    })
    const profitRows =
      checkGeneratedAnswer(profit.problem, profit.answerKey, {
        expectedProfit: String(profit.answerKey.expectedProfit),
      }).explanation?.workedSolution ?? []
    expect(profitRows.some((row) => row.label === 'Cost to play')).toBe(true)
    expect(profitRows.some((row) => row.label === 'Expected profit')).toBe(true)

    const fairness = createDeterministicPracticeInstance({
      skillId: 'fairness-classification',
      difficulty: 3,
      seed: 'fairness-rows',
      templateKind: 'fairness-classification',
    })
    const fairnessRows =
      checkGeneratedAnswer(fairness.problem, fairness.answerKey, {
        classification: fairness.answerKey.classification,
      }).explanation?.workedSolution ?? []
    expect(fairnessRows.some((row) => row.label === 'Verdict')).toBe(true)
  })
})

describe('fallback difficulty scaling', () => {
  const DIFFICULTIES = [1, 2, 3, 4, 5] as const

  // Every generated instance must still validate and carry a self-consistent
  // expected-value answer key, regardless of difficulty.
  function expectValidWithKey(instance: GeneratedPracticeInstance): void {
    expect(validateGeneratedPracticeInstance(instance)).toEqual([])
    const outcomes = instance.problem.givenData.outcomes ?? []
    if (outcomes.length > 0) {
      const ev = outcomes.reduce((sum, outcome) => sum + outcome.value * outcome.probability, 0)
      expect(instance.answerKey.expectedValue).toBeCloseTo(ev)
    }
  }

  it('grows the card-hand card count with difficulty (3 at d1, 8 at d5)', () => {
    const counts = DIFFICULTIES.map((difficulty) => {
      const instance = createDeterministicPracticeInstance({
        skillId: 'ev-from-table',
        difficulty,
        seed: 'card-hand-scale',
        templateKind: 'card-hand-ev',
      })
      expect(validateGeneratedPracticeInstance(instance)).toEqual([])
      const cards = instance.problem.givenData.cards ?? []
      // The key is the average card value; confirm it tracks the actual hand.
      const average = cards.reduce((sum, card) => sum + cardValue(card.rank), 0) / cards.length
      expect(instance.answerKey.expectedValue).toBeCloseTo(average)
      return cards.length
    })

    expect(counts[0]).toBe(3)
    expect(counts[counts.length - 1]).toBe(8)
    for (let i = 1; i < counts.length; i += 1) {
      expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1])
    }
    expect(counts[counts.length - 1]).toBeGreaterThan(counts[0])
  })

  it('scales dice count and sides with difficulty (d1/d2 six-sided, higher uses bigger dice)', () => {
    const seed = 'dice-scale'
    const d1 = createDeterministicPracticeInstance({
      skillId: 'long-run-average',
      difficulty: 1,
      seed,
      templateKind: 'dice-ev',
    })
    const d2 = createDeterministicPracticeInstance({
      skillId: 'long-run-average',
      difficulty: 2,
      seed,
      templateKind: 'dice-ev',
    })
    const d5 = createDeterministicPracticeInstance({
      skillId: 'long-run-average',
      difficulty: 5,
      seed,
      templateKind: 'dice-ev',
    })

    // d1/d2 stay on ordinary six-sided dice; count and sides only grow later.
    expect(d1.problem.givenData.dice).toEqual({ count: 1, sides: 6 })
    expect(d2.problem.givenData.dice?.sides).toBe(6)
    expect(d2.problem.givenData.dice?.count).toBe(2)
    // d5 uses more dice with more than six sides.
    expect(d5.problem.givenData.dice?.count ?? 0).toBeGreaterThanOrEqual(4)
    expect(d5.problem.givenData.dice?.sides ?? 0).toBeGreaterThan(6)

    for (const instance of [d1, d2, d5]) {
      expect(validateGeneratedPracticeInstance(instance)).toEqual([])
      const dice = instance.problem.givenData.dice ?? { count: 0, sides: 0 }
      expect(instance.answerKey.expectedValue).toBeCloseTo((dice.count * (dice.sides + 1)) / 2)
    }
  })

  it('picks the deck variant by difficulty (tiny two-value deck at d1, full 52-card at d5)', () => {
    const seed = 'deck-scale'
    const easy = createDeterministicPracticeInstance({
      skillId: 'probability-from-counts',
      difficulty: 1,
      seed,
      templateKind: 'card-deck-ev',
    })
    const hard = createDeterministicPracticeInstance({
      skillId: 'probability-from-counts',
      difficulty: 5,
      seed,
      templateKind: 'card-deck-ev',
    })

    // d1 is a 2-value deck (only two outcomes); d5 is the full weighted 52-card
    // deck (10 outcomes, EV 340/52) — so the structure changes with difficulty.
    expect((easy.problem.givenData.outcomes ?? []).length).toBe(2)
    expect((hard.problem.givenData.outcomes ?? []).length).toBe(10)
    expect(hard.answerKey.expectedValue).toBeCloseTo(340 / 52, 3)
    expect(easy.answerKey.expectedValue).not.toBeCloseTo(hard.answerKey.expectedValue ?? 0, 3)

    expectValidWithKey(easy)
    expectValidWithKey(hard)
  })

  it('grows the prize-bag outcome count with difficulty (2 at d1, 4 at d5)', () => {
    const seed = 'prize-scale'
    const lengths = DIFFICULTIES.map((difficulty) => {
      const instance = createDeterministicPracticeInstance({
        skillId: 'weighted-average',
        difficulty,
        seed,
        templateKind: 'weighted-average',
      })
      expectValidWithKey(instance)
      return (instance.problem.givenData.outcomes ?? []).length
    })

    expect(lengths[0]).toBe(2)
    expect(lengths[lengths.length - 1]).toBe(4)
    for (let i = 1; i < lengths.length; i += 1) {
      expect(lengths[i]).toBeGreaterThanOrEqual(lengths[i - 1])
    }
    expect(lengths[lengths.length - 1]).toBeGreaterThan(lengths[0])
  })
})
