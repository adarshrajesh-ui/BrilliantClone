import { describe, expect, it } from 'vitest'
import type { CheckResult } from '../../../types/problem'
import {
  checkResultToCoachFeedback,
  coachToneForResult,
  humanizeMistakeType,
} from '../feedbackModel'

const result = (over: Partial<CheckResult>): CheckResult => ({
  isCorrect: false,
  mistakeType: null,
  feedback: '',
  canComplete: false,
  ...over,
})

describe('coachToneForResult', () => {
  it('maps completion/correct to correct', () => {
    expect(coachToneForResult(result({ canComplete: true }))).toBe('correct')
    expect(coachToneForResult(result({ isCorrect: true }))).toBe('correct')
  })
  it('maps a mistake to incorrect', () => {
    expect(coachToneForResult(result({ mistakeType: 'ignored_probability' }))).toBe('incorrect')
  })
  it('maps a guard (no mistake, not correct) to info', () => {
    expect(coachToneForResult(result({ feedback: 'Run 100 spins first.' }))).toBe('info')
  })
})

describe('humanizeMistakeType', () => {
  it('uses known friendly labels', () => {
    expect(humanizeMistakeType('picked_largest_payout')).toBe('Picked the biggest payout')
  })
  it('humanizes unknown slugs', () => {
    expect(humanizeMistakeType('some_new_mistake')).toBe('Some New Mistake')
  })
  it('returns null for empty input', () => {
    expect(humanizeMistakeType(null)).toBeNull()
  })
})

describe('checkResultToCoachFeedback', () => {
  it('builds a correct model with concept summary', () => {
    const fb = checkResultToCoachFeedback(
      result({ isCorrect: true, canComplete: true, feedback: 'Correct — $5.' }),
      { conceptSummary: 'EV balances $0 and $10.' },
    )
    expect(fb.tone).toBe('correct')
    expect(fb.message).toBe('Correct — $5.')
    expect(fb.conceptSummary).toBe('EV balances $0 and $10.')
  })

  it('falls back to the single message for the why + generic next step', () => {
    const fb = checkResultToCoachFeedback(
      result({ mistakeType: 'ignored_probability', feedback: 'You ignored the chance.' }),
    )
    expect(fb.tone).toBe('incorrect')
    expect(fb.mistakeLabel).toBe('Ignored the probability')
    expect(fb.whyWrong).toBe('You ignored the chance.')
    expect(fb.whatNext).toBeTruthy()
  })

  it('prefers structured copy when provided', () => {
    const fb = checkResultToCoachFeedback(
      result({ mistakeType: 'wrong_denominator', feedback: 'fallback' }),
      {
        structured: {
          whatHappened: 'You used /10.',
          whyWrong: 'There are 8 tickets.',
          whatNext: 'Use /8.',
        },
      },
    )
    expect(fb.whatHappened).toBe('You used /10.')
    expect(fb.whyWrong).toBe('There are 8 tickets.')
    expect(fb.whatNext).toBe('Use /8.')
  })

  it('treats guards as info with the message intact', () => {
    const fb = checkResultToCoachFeedback(result({ feedback: 'Fill every field first.' }))
    expect(fb.tone).toBe('info')
    expect(fb.message).toBe('Fill every field first.')
  })
})
