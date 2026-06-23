import type { Problem1CheckInput, CheckResult } from '../types/problem'

const CORRECT_VALUE = 5
const MIN_SPINS = 100

export function normalizeProblem1Answer(value: number): number {
  return value
}

export function checkProblem1Completion(input: Problem1CheckInput): CheckResult {
  if (!input.predictionSubmitted) {
    return {
      isCorrect: false,
      mistakeType: null,
      feedback: 'Submit your prediction before spinning.',
      canComplete: false,
    }
  }

  if (input.totalSpins < MIN_SPINS) {
    return {
      isCorrect: false,
      mistakeType: null,
      feedback: `Run at least ${MIN_SPINS} total spins to see the long-run pattern. (${input.totalSpins}/${MIN_SPINS} so far)`,
      canComplete: false,
    }
  }

  if (input.finalAnswer === null) {
    return {
      isCorrect: false,
      mistakeType: null,
      feedback: 'Choose the long-run average based on what you observed.',
      canComplete: false,
    }
  }

  if (input.finalAnswer === CORRECT_VALUE) {
    return {
      isCorrect: true,
      mistakeType: null,
      feedback:
        'Correct! With an equal chance of $10 and $0, the long-run average is halfway between them — $5 per spin.',
      canComplete: true,
    }
  }

  if (input.finalAnswer === 0 || input.finalAnswer === 10) {
    return {
      isCorrect: false,
      mistakeType: 'chose-extreme-outcome',
      feedback:
        'The long-run average is not one of the individual outcomes. It is what you expect per spin over many tries — halfway between $10 and $0.',
      canComplete: false,
    }
  }

  return {
    isCorrect: false,
    mistakeType: 'unknown',
    feedback: 'That is not the long-run average for this spinner.',
    canComplete: false,
  }
}

export function checkProblem1Prediction(
  answer: number,
  totalSpins: number,
): CheckResult {
  if (totalSpins > 0 && totalSpins < MIN_SPINS) {
    return {
      isCorrect: false,
      mistakeType: 'confused-single-spin',
      feedback:
        'One or a few spins show a single outcome, not the long-run average. Keep spinning to see the pattern.',
      canComplete: false,
    }
  }

  if (answer === CORRECT_VALUE) {
    return {
      isCorrect: true,
      mistakeType: null,
      feedback: 'Good prediction! Now spin many times to confirm.',
      canComplete: false,
    }
  }

  if (answer === 0 || answer === 10) {
    return {
      isCorrect: false,
      mistakeType: 'chose-extreme-outcome',
      feedback:
        'You picked one of the possible outcomes. The long-run average is what you expect per spin over many repetitions.',
      canComplete: false,
    }
  }

  return {
    isCorrect: false,
    mistakeType: 'unknown',
    feedback: 'Try thinking about the average of $10 and $0 over many equal spins.',
    canComplete: false,
  }
}
