// Initial-state factories and review serializers for Problem Pack B.
//
// - Initial state: the blank interactive state a fresh (or restarted) session
//   starts from. Restart resets only this temporary state; completion/progress
//   are owned by the central progress service (not here).
// - Review serializer: a compact, JSON-serializable snapshot used to reconstruct
//   the completed-problem review view without re-running the problem. For
//   simulations we store a summary (EVs + a trimmed running-average series),
//   never every raw random event.

import { checkPackProblem, PACK_ANSWER_KEYS } from './checkers'
import type { SimulationResult } from './simulation'
import type {
  CapstoneInput,
  ChooseBetterGameInput,
  FairnessSortInput,
  FindFairPriceInput,
  LowVsHighRiskInput,
  PackCanonicalSlug,
  PackCheckInput,
  PayoutVsProfitInput,
  PrizeBagInput,
  RepairTableInput,
  SameEvDifferentRiskInput,
  WholeEvModelInput,
} from './types'

// ---------------------------------------------------------------------------
// Initial-state factories
// ---------------------------------------------------------------------------

export const initialRepairTableState = (): RepairTableInput => ({
  // $16 ships correct, $4 ships wrong (3/10), $0 ships blank — learner repairs.
  rows: [
    { outcome: 16, count: '1', probability: '1/8' },
    { outcome: 4, count: '3', probability: '3/10' },
    { outcome: 0, count: '4', probability: '' },
  ],
})

export const initialPrizeBagState = (): PrizeBagInput => ({
  rows: [
    { outcome: 15, count: '', probability: '', contribution: '' },
    { outcome: 5, count: '', probability: '', contribution: '' },
    { outcome: 0, count: '', probability: '', contribution: '' },
  ],
  evAnswer: '',
})

export const initialPayoutVsProfitState = (): PayoutVsProfitInput => ({
  formulaSelected: false,
  profitAnswer: '',
})

export const initialFairnessSortState = (): FairnessSortInput => ({
  assignments: {},
})

export const initialFindFairPriceState = (): FindFairPriceInput => ({
  expectedPayout: '',
  fairCost: '',
  expectedProfit: '',
  classification: '',
})

export const initialChooseBetterGameState = (): ChooseBetterGameInput => ({
  profitA: '',
  profitB: '',
  betterGame: '',
})

export const initialWholeEvModelState = (): WholeEvModelInput => ({
  probabilities: ['', '', ''],
  contributions: ['', '', ''],
  expectedPayout: '',
  expectedProfit: '',
  decision: '',
})

export const initialSameEvDifferentRiskState = (): SameEvDifferentRiskInput => ({
  gameASimulated: false,
  gameBSimulated: false,
  evA: '',
  evB: '',
  higherRisk: '',
  reason: '',
})

export const initialLowVsHighRiskState = (): LowVsHighRiskInput => ({
  gameASimulated: false,
  gameBSimulated: false,
  evA: '',
  evB: '',
  higherRisk: '',
  reason: '',
})

export const initialCapstoneState = (): CapstoneInput => ({
  probabilities: ['', '', ''],
  contributions: ['', '', ''],
  expectedPayout: '',
  expectedProfit: '',
  decision: '',
  riskExplanation: '',
})

export const problemPackBInitialStateFactories: Record<
  PackCanonicalSlug,
  () => PackCheckInput
> = {
  'l3-repair-probability-table': initialRepairTableState,
  'l3-prize-bag-ev-table': initialPrizeBagState,
  'l4-payout-vs-profit': initialPayoutVsProfitState,
  'l4-fair-favorable-unfavorable': initialFairnessSortState,
  'l4-find-fair-price': initialFindFairPriceState,
  'l4-choose-better-game-after-cost': initialChooseBetterGameState,
  'l5-build-whole-ev-model': initialWholeEvModelState,
  'l5-same-ev-different-risk': initialSameEvDifferentRiskState,
  'l5-low-risk-vs-high-risk': initialLowVsHighRiskState,
  'l5-final-capstone-ev-decision': initialCapstoneState,
}

// ---------------------------------------------------------------------------
// Review snapshots
// ---------------------------------------------------------------------------

export interface ReviewSnapshot {
  canonicalSlug: PackCanonicalSlug
  /** The learner's final submitted answer (compact, serializable). */
  submitted: Record<string, unknown>
  /** The normalized correct result shown in review. */
  correct: Record<string, unknown>
  /** Final deterministic explanation (the correct-feedback string). */
  explanation: string
}

/** Trim a running-average series to at most `max` points for compact storage. */
export function summarizeSeries(series: number[], max = 20): number[] {
  if (series.length <= max) {
    return series.map((v) => Number(v.toFixed(3)))
  }
  const step = (series.length - 1) / (max - 1)
  const out: number[] = []
  for (let i = 0; i < max; i += 1) {
    out.push(Number(series[Math.round(i * step)].toFixed(3)))
  }
  return out
}

export interface SimulationSummary {
  trials: number
  observedAverage: number
  /** Down-sampled running average for redrawing the completed graph. */
  runningAverage: number[]
}

export function summarizeSimulation(result: SimulationResult): SimulationSummary {
  return {
    trials: result.trials,
    observedAverage: Number(result.average.toFixed(3)),
    runningAverage: summarizeSeries(result.runningAverage),
  }
}

const repairCorrect = () => ({
  rows: PACK_ANSWER_KEYS.repair.rows.map((r) => ({
    outcome: r.outcome,
    count: r.count,
    probability: `${r.count}/${PACK_ANSWER_KEYS.repair.total}`,
  })),
})

const prizeBagCorrect = () => ({
  rows: PACK_ANSWER_KEYS.prizeBag.rows.map((r) => ({
    outcome: r.outcome,
    count: r.count,
    probability: r.prob,
    contribution: r.contribution,
  })),
  ev: PACK_ANSWER_KEYS.prizeBag.ev,
})

const wholeModelCorrect = () => ({
  probabilities: PACK_ANSWER_KEYS.wholeModel.probs,
  contributions: PACK_ANSWER_KEYS.wholeModel.contribs,
  expectedPayout: 5,
  expectedProfit: 0,
  decision: 'fair',
})

const capstoneCorrect = () => ({
  probabilities: PACK_ANSWER_KEYS.capstone.probs,
  contributions: PACK_ANSWER_KEYS.capstone.contribs,
  expectedPayout: 6,
  expectedProfit: 0,
  decision: 'fair',
})

/**
 * Build a review snapshot for any pack problem. The `correct` payload is fixed
 * per problem; `submitted` is the learner's final input. The explanation is the
 * checker's own correct-feedback string, regenerated deterministically.
 */
export function serializeReview(
  slug: PackCanonicalSlug,
  finalInput: PackCheckInput,
): ReviewSnapshot {
  const result = checkPackProblem(slug, finalInput)
  const explanation = result.isCorrect
    ? result.feedback
    : 'Completed — see the worked solution.'

  let correct: Record<string, unknown>
  switch (slug) {
    case 'l3-repair-probability-table':
      correct = repairCorrect()
      break
    case 'l3-prize-bag-ev-table':
      correct = prizeBagCorrect()
      break
    case 'l4-payout-vs-profit':
      correct = { profit: 1, formula: 'payout − cost = 4 − 3' }
      break
    case 'l4-fair-favorable-unfavorable':
      correct = { A: 'fair', B: 'favorable', C: 'unfavorable' }
      break
    case 'l4-find-fair-price':
      correct = { expectedPayout: 4, fairCost: 4, expectedProfit: 0, classification: 'fair' }
      break
    case 'l4-choose-better-game-after-cost':
      correct = { profitA: 2, profitB: 3, betterGame: 'B' }
      break
    case 'l5-build-whole-ev-model':
      correct = wholeModelCorrect()
      break
    case 'l5-same-ev-different-risk':
      correct = { evA: 5, evB: 5, higherRisk: 'B', reason: 'variable-outcomes' }
      break
    case 'l5-low-risk-vs-high-risk':
      correct = { evA: 6, evB: 6, higherRisk: 'B', reason: 'wider-spread' }
      break
    case 'l5-final-capstone-ev-decision':
      correct = { ...capstoneCorrect(), riskExplanation: 'fair-but-variable' }
      break
    default:
      correct = {}
  }

  return {
    canonicalSlug: slug,
    submitted: finalInput as unknown as Record<string, unknown>,
    correct,
    explanation,
  }
}

export const problemPackBReviewSerializers: Record<
  PackCanonicalSlug,
  (input: PackCheckInput) => ReviewSnapshot
> = {
  'l3-repair-probability-table': (i) => serializeReview('l3-repair-probability-table', i),
  'l3-prize-bag-ev-table': (i) => serializeReview('l3-prize-bag-ev-table', i),
  'l4-payout-vs-profit': (i) => serializeReview('l4-payout-vs-profit', i),
  'l4-fair-favorable-unfavorable': (i) => serializeReview('l4-fair-favorable-unfavorable', i),
  'l4-find-fair-price': (i) => serializeReview('l4-find-fair-price', i),
  'l4-choose-better-game-after-cost': (i) => serializeReview('l4-choose-better-game-after-cost', i),
  'l5-build-whole-ev-model': (i) => serializeReview('l5-build-whole-ev-model', i),
  'l5-same-ev-different-risk': (i) => serializeReview('l5-same-ev-different-risk', i),
  'l5-low-risk-vs-high-risk': (i) => serializeReview('l5-low-risk-vs-high-risk', i),
  'l5-final-capstone-ev-decision': (i) => serializeReview('l5-final-capstone-ev-decision', i),
}
