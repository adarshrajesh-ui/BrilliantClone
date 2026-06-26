import { describe, expect, it } from 'vitest'
import {
  checkGeneratedAnswer,
  computeGeneratedAnswerKey,
  createDeterministicPracticeInstance,
  validateGeneratedPracticeInstance,
  type GeneratedPracticeInstance,
} from './generatedPractice'

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
