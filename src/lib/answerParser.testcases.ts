// Internal accepted-answer test list (no test runner configured yet).
//
// This documents the deterministic formats each problem must accept, and provides
// a runnable self-check (`runAnswerNormalizationSelfTests`) that can be called
// from a dev console or a future test runner. It is intentionally NOT imported by
// the app, so it has zero runtime cost in production.

import {
  areProbabilitiesEquivalent,
  normalizeClassificationAnswer,
  normalizeMoneyAnswer,
  parseProbabilityAnswer,
} from './answerParser'

interface MoneyCase {
  input: string
  expected: number
}

export const MONEY_ACCEPTED_CASES: MoneyCase[] = [
  { input: '5', expected: 5 },
  { input: '5.0', expected: 5 },
  { input: '5.00', expected: 5 },
  { input: '$5', expected: 5 },
  { input: '$5.00', expected: 5 },
  { input: '5 dollars', expected: 5 },
  { input: '5 per spin', expected: 5 },
  { input: '  5  ', expected: 5 },
  { input: '$1', expected: 1 },
  { input: '4', expected: 4 },
]

interface ProbabilityCase {
  input: string
  target: number
}

export const PROBABILITY_ACCEPTED_CASES: ProbabilityCase[] = [
  { input: '25%', target: 0.25 },
  { input: '0.25', target: 0.25 },
  { input: '.25', target: 0.25 },
  { input: '1/4', target: 0.25 },
  { input: '25 / 100', target: 0.25 },
  { input: '1/6', target: 1 / 6 },
  { input: '0.1667', target: 1 / 6 },
  { input: '0.167', target: 1 / 6 },
  { input: '2/6', target: 2 / 6 },
  { input: '1/3', target: 1 / 3 },
  { input: '0.3333', target: 1 / 3 },
  { input: '0.333', target: 1 / 3 },
  { input: '3/6', target: 0.5 },
  { input: '1/2', target: 0.5 },
  { input: '0.5', target: 0.5 },
  { input: '.5', target: 0.5 },
  { input: '1/10', target: 0.1 },
  { input: '0.1', target: 0.1 },
  { input: '.1', target: 0.1 },
  { input: '2/10', target: 0.2 },
  { input: '1/5', target: 0.2 },
  { input: '0.2', target: 0.2 },
  { input: '7/10', target: 0.7 },
  { input: '0.7', target: 0.7 },
  { input: '.7', target: 0.7 },
]

interface ClassificationCase {
  input: string
  expected: 'fair' | 'favorable' | 'unfavorable'
}

export const CLASSIFICATION_ACCEPTED_CASES: ClassificationCase[] = [
  { input: 'fair', expected: 'fair' },
  { input: 'Fair', expected: 'fair' },
  { input: 'FAIR', expected: 'fair' },
  { input: 'favorable', expected: 'favorable' },
  { input: 'fav', expected: 'favorable' },
  { input: 'positive', expected: 'favorable' },
  { input: 'good for player', expected: 'favorable' },
  { input: 'unfavorable', expected: 'unfavorable' },
  { input: 'unfav', expected: 'unfavorable' },
  { input: 'negative', expected: 'unfavorable' },
  { input: 'bad for player', expected: 'unfavorable' },
]

export function runAnswerNormalizationSelfTests(): { passed: number; failed: string[] } {
  const failed: string[] = []
  let passed = 0

  for (const c of MONEY_ACCEPTED_CASES) {
    const got = normalizeMoneyAnswer(c.input)
    if (got !== null && Math.abs(got - c.expected) <= 0.001) {
      passed += 1
    } else {
      failed.push(`money "${c.input}" -> ${got}, expected ${c.expected}`)
    }
  }

  for (const c of PROBABILITY_ACCEPTED_CASES) {
    if (areProbabilitiesEquivalent(c.input, c.target)) {
      passed += 1
    } else {
      failed.push(`probability "${c.input}" -> ${parseProbabilityAnswer(c.input)}, expected ~${c.target}`)
    }
  }

  for (const c of CLASSIFICATION_ACCEPTED_CASES) {
    if (normalizeClassificationAnswer(c.input) === c.expected) {
      passed += 1
    } else {
      failed.push(`classification "${c.input}" -> ${normalizeClassificationAnswer(c.input)}, expected ${c.expected}`)
    }
  }

  return { passed, failed }
}
