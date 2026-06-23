import { areNumbersClose, areProbabilitiesEquivalent, normalizeMoneyAnswer } from './answerParser'

export type FieldStatus = 'ok' | 'bad' | 'empty' | undefined

/** Inline status for a numeric/money cell against its expected value. */
export function numericFieldStatus(value: string, expected: number, tolerance = 0.01): FieldStatus {
  if (value.trim() === '') {
    return 'empty'
  }
  const parsed = normalizeMoneyAnswer(value)
  if (parsed === null) {
    return 'bad'
  }
  return areNumbersClose(parsed, expected, tolerance) ? 'ok' : 'bad'
}

/** Inline status for a probability cell against its expected value. */
export function probabilityFieldStatus(value: string, expected: number): FieldStatus {
  if (value.trim() === '') {
    return 'empty'
  }
  return areProbabilitiesEquivalent(value, expected) ? 'ok' : 'bad'
}
