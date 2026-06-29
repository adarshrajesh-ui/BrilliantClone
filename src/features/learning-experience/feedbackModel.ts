import type { CheckResult, TeachingExplanation, WorkedSolutionRow } from '../../types/problem'
import type { CoachFeedback, CoachTone } from './types'

/**
 * Pure mapping from the deterministic check result (Agent 3/4 + answer checker)
 * into the Learning Coach display model. This layer contains NO answer-checking
 * logic — it only decides how an already-computed result is presented.
 */

/** Decide the coach tone from a check result. */
export function coachToneForResult(result: CheckResult): CoachTone {
  if (result.canComplete || result.isCorrect) {
    return 'correct'
  }
  if (result.mistakeType) {
    return 'incorrect'
  }
  return 'info'
}

/**
 * Friendly label for a mistake-type slug. Falls back to a humanized version of
 * the slug so unknown/new mistake types still read reasonably.
 */
const MISTAKE_LABELS: Record<string, string> = {
  chose_extreme_outcome: 'Picked a single extreme outcome',
  single_vs_longrun: 'Confused one trial with the long-run average',
  assumed_observed_equals_theoretical: 'Assumed the observed average must equal EV',
  picked_largest_payout: 'Picked the biggest payout',
  ignored_probability: 'Ignored the probability',
  reversed_outcome_probability: 'Swapped outcome and probability',
  wrong_pairing: 'Matched an outcome to the wrong probability',
  omitted_zero_outcome: 'Left out the $0 outcome',
  omitted_zero_row: 'Left out the $0 row',
  summed_raw_payouts: 'Added raw payouts instead of contributions',
  wrong_denominator: 'Used the wrong denominator',
  count_as_probability: 'Entered a count where a probability belongs',
  added_cost: 'Added the cost instead of subtracting it',
  reported_payout_not_profit: 'Reported expected payout, not profit',
  positive_payout_is_favorable: 'Assumed any positive payout is favorable',
  higher_payout_is_better: 'Compared payout instead of profit',
  same_ev_means_identical: 'Treated equal EV as identical games',
  fixed_outcome_is_riskier: 'Called the guaranteed game riskier',
}

export function humanizeMistakeType(mistakeType: string | null | undefined): string | null {
  if (!mistakeType) {
    return null
  }
  if (MISTAKE_LABELS[mistakeType]) {
    return MISTAKE_LABELS[mistakeType]
  }
  const normalized = mistakeType.replace(/-/g, '_')
  if (MISTAKE_LABELS[normalized]) {
    return MISTAKE_LABELS[normalized]
  }
  return mistakeType
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

export interface CoachFeedbackOptions {
  /** Structured wrong-answer override (Agent 3/4 may supply richer copy). */
  structured?: Partial<Pick<CoachFeedback, 'whatHappened' | 'whyWrong' | 'whatNext'>>
  /** Default "what to do next" guidance when the result has none. */
  nextActionText?: string
  /** Concept reinforcement shown on a correct answer. */
  conceptSummary?: string
  /** Worked solution rows shown on a correct answer. */
  workedSolution?: WorkedSolutionRow[]
  /** Rich teaching copy shown on a correct answer. */
  teaching?: TeachingExplanation
}

/**
 * Build the coach display model from a check result. When `structured` copy is
 * provided it is used for the three wrong-answer sections; otherwise the single
 * `result.feedback` string is shown as the body and `nextActionText` (or a
 * generic prompt) becomes the "what next" guidance.
 */
export function checkResultToCoachFeedback(
  result: CheckResult,
  options: CoachFeedbackOptions = {},
): CoachFeedback {
  const tone = coachToneForResult(result)

  if (tone === 'correct') {
    return {
      tone,
      title: 'Correct',
      message: result.feedback,
      conceptSummary: options.conceptSummary,
      workedSolution: options.workedSolution,
      teaching: options.teaching,
    }
  }

  if (tone === 'info') {
    return {
      tone,
      title: 'Keep going',
      message: result.feedback,
    }
  }

  // Incorrect: prefer structured copy, else fall back to the single message.
  const structured = options.structured ?? {}
  return {
    tone,
    title: 'Not quite',
    mistakeLabel: humanizeMistakeType(result.mistakeType),
    whatHappened: structured.whatHappened,
    whyWrong: structured.whyWrong ?? result.feedback,
    whatNext:
      structured.whatNext ??
      options.nextActionText ??
      'Adjust your answer and submit again — your other correct work stays in place.',
  }
}
