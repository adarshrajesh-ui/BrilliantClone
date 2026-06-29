import {
  areNumbersClose,
  normalizeClassificationAnswer,
  normalizeMoneyAnswer,
} from '../../lib/answerParser'
import { cardValue, RANKS, SUITS } from '../../data/cards'
import type { CardRank, CardSuit } from '../../data/cards'
import type { CheckResult, WorkedSolutionRow } from '../../types/problem'
import type { SkillId } from '../../core/adaptive/types'
import { formatProbability } from './formatProbability'
import { buildPracticeBody } from './difficultyMatrix'

export type GeneratedTemplateKind =
  | 'weighted-average'
  | 'payout-vs-profit'
  | 'fairness-classification'
  | 'compare-ev'
  | 'same-ev-risk'
  | 'card-hand-ev'
  | 'card-deck-ev'
  | 'dice-ev'
  | 'profession-payout'
  | 'fair-price-to-play'

export type GeneratedAnswerInput =
  | 'expectedValue'
  | 'expectedProfit'
  | 'classification'
  | 'bestChoice'
  | 'riskChoice'

export interface GeneratedOutcome {
  label: string
  value: number
  probability: number
}

export interface GeneratedGame {
  id: string
  label: string
  outcomes: GeneratedOutcome[]
  cost?: number
}

export interface GeneratedPracticeProblem {
  id: string
  schemaVersion: 'ev-practice-v1'
  templateKind: GeneratedTemplateKind
  skillIds: SkillId[]
  difficulty: 1 | 2 | 3 | 4 | 5
  title: string
  scenarioText: string
  prompt: string
  givenData: {
    outcomes?: GeneratedOutcome[]
    games?: GeneratedGame[]
    cost?: number
    cards?: Array<{ rank: CardRank; suit: CardSuit }>
    dice?: { count: number; sides: number }
  }
  answerInputs: GeneratedAnswerInput[]
  hints: Array<{ id: string; label: string; content: string }>
  feedback: GeneratedFeedback
  constraints: {
    numericTolerance: number
  }
  source: 'ai' | 'deterministic-fallback'
}

/** A misconception-aware wrong-answer rule (what / why / repair). */
export interface GeneratedMistakeRule {
  mistakeType: string
  whatHappened: string
  whyItMatters: string
  repairStep: string
}

/**
 * Deterministic feedback contract attached to every generated problem. The
 * `conceptSummary` must never equal the prompt; `mistakeRules` carry structured
 * misconception copy so wrong answers always explain what happened and how to
 * fix it. The worked solution is computed at grading time from the answer key.
 */
export interface GeneratedFeedback {
  correct: string
  conceptSummary: string
  mistakeRules: GeneratedMistakeRule[]
}

export interface GeneratedAnswerKey {
  expectedValue?: number
  expectedProfit?: number
  classification?: 'fair' | 'favorable' | 'unfavorable'
  bestChoice?: string
  riskChoice?: string
}

export interface GeneratedPracticeInstance {
  problem: GeneratedPracticeProblem
  answerKey: GeneratedAnswerKey
  generationNote?: string
}

export interface GeneratedAnswerSubmission {
  expectedValue?: string
  expectedProfit?: string
  classification?: string
  bestChoice?: string
  riskChoice?: string
}

function sumOutcomes(outcomes: readonly GeneratedOutcome[]): number {
  return outcomes.reduce((total, outcome) => total + outcome.value * outcome.probability, 0)
}

function classifyProfit(profit: number): 'fair' | 'favorable' | 'unfavorable' {
  if (areNumbersClose(profit, 0, 0.01)) {
    return 'fair'
  }
  return profit > 0 ? 'favorable' : 'unfavorable'
}

// --- Deterministic feedback contract ---------------------------------------
// Concept summaries, misconception rules, and worked solutions are computed
// here (not by the AI) so the math is always correct and client + server agree.

/** Templates whose values are dollars (the rest are plain points/values). */
const MONEY_TEMPLATES = new Set<GeneratedTemplateKind>([
  'weighted-average',
  'payout-vs-profit',
  'fairness-classification',
  'fair-price-to-play',
  'profession-payout',
  'compare-ev',
  'same-ev-risk',
])

function formatNumber(value: number): string {
  // Round to 2 decimals and drop trailing zeros (10.5, not 10.50).
  return String(Math.round(value * 100) / 100)
}

function unitFor(templateKind: GeneratedTemplateKind): string {
  return MONEY_TEMPLATES.has(templateKind) ? '$' : ''
}

function money(value: number, unit: string): string {
  return value < 0 ? `-${unit}${formatNumber(Math.abs(value))}` : `${unit}${formatNumber(value)}`
}

const CORRECT_SUMMARY: Record<GeneratedTemplateKind, string> = {
  'card-hand-ev': 'Correct. The expected value is the average of the card values.',
  'dice-ev': 'Correct. Each die averages (sides + 1) / 2, times the number of dice.',
  'card-deck-ev': 'Correct. You weighted each value by how often it appears in the deck.',
  'profession-payout': 'Correct. You weighted each payout by its probability.',
  'weighted-average': 'Correct. You weighted each payout by how often it happens.',
  'payout-vs-profit': 'Correct. You subtracted the cost from the expected payout.',
  'fairness-classification': 'Correct. You classified the game by its expected profit.',
  'fair-price-to-play': 'Correct. A fair price equals the expected payout, so expected profit is zero.',
  'compare-ev': 'Correct. You compared the weighted averages, not the biggest single prize.',
  'same-ev-risk': 'Correct. With equal expected values, the wider spread is the riskier game.',
}

/** A concept recap that is always distinct from the question prompt. */
function buildConceptSummary(problem: GeneratedPracticeProblem): string {
  switch (problem.templateKind) {
    case 'card-hand-ev':
      return 'Each card is equally likely, so the expected value is the average of the card values (A = 1, J/Q/K = 10).'
    case 'dice-ev': {
      const sides = problem.givenData.dice?.sides ?? 6
      const count = problem.givenData.dice?.count ?? 1
      return `A fair ${sides}-sided die averages (sides + 1) / 2 = ${formatNumber((sides + 1) / 2)}; multiply by ${count} ${count === 1 ? 'die' : 'dice'} for the expected sum.`
    }
    case 'card-deck-ev':
      return 'Weight each card value by how often it appears in the deck, then add the contributions.'
    case 'profession-payout':
      return 'Multiply each payout by its probability and add the products to get the long-run average.'
    case 'weighted-average':
      return 'Expected value multiplies each payout by its probability, then adds those contributions.'
    case 'payout-vs-profit':
      return 'Expected profit is the expected payout minus the cost to play.'
    case 'fairness-classification':
      return 'Compare expected payout with the cost: above is favorable, equal is fair, below is unfavorable.'
    case 'fair-price-to-play':
      return 'A fair price equals the expected payout, because that makes the expected profit zero.'
    case 'compare-ev':
      return 'The better game has the higher weighted average, no matter which one shows the bigger single prize.'
    case 'same-ev-risk':
      return 'Both games share the same expected value, so the riskier one is the game whose outcomes swing wider.'
    default:
      return 'Expected value weights each value by its probability and adds the contributions.'
  }
}

type MistakeCopy = Omit<GeneratedMistakeRule, 'mistakeType'>

const MISTAKE_RULE_COPY: Record<string, MistakeCopy> = {
  'unweighted-sum': {
    whatHappened: 'You added the values without weighting them by probability.',
    whyItMatters: 'Expected value counts likely outcomes more heavily than rare ones.',
    repairStep: 'Multiply each value by its probability, then add those products.',
  },
  'arithmetic-error': {
    whatHappened: "That total doesn't match the weighted sum of the outcomes.",
    whyItMatters: 'A slip in one product changes the whole expected value.',
    repairStep: 'Recompute each value × probability, then add every contribution again.',
  },
  'answered-payout': {
    whatHappened: 'You reported the expected payout, not the profit.',
    whyItMatters: 'Profit subtracts what it costs to play from what you expect to win.',
    repairStep: 'Take the expected payout and subtract the cost to play.',
  },
  'wrong-classification': {
    whatHappened: 'You sorted the game into the wrong fairness category.',
    whyItMatters: 'Fairness depends on expected profit: positive favors the player, zero is fair, negative is unfavorable.',
    repairStep: 'Find expected payout minus cost, then label it by its sign.',
  },
  'chose-worse-game': {
    whatHappened: 'You picked the game with the lower expected value.',
    whyItMatters: 'The better game has the higher long-run average, not the bigger single prize.',
    repairStep: 'Compute each game’s weighted average and choose the larger one.',
  },
  'confused-risk-with-ev': {
    whatHappened: 'You compared expected values, but both games share the same EV.',
    whyItMatters: 'Risk is about how widely outcomes swing, not the average.',
    repairStep: 'Compare the gap between each game’s best and worst outcome; the wider spread is riskier.',
  },
}

function rule(mistakeType: string, overrides: Partial<MistakeCopy> = {}): GeneratedMistakeRule {
  const base = MISTAKE_RULE_COPY[mistakeType] ?? {
    whatHappened: 'That answer is not right yet.',
    whyItMatters: 'The result does not match the expected value of this setup.',
    repairStep: 'Re-check your setup and try again.',
  }
  return { mistakeType, ...base, ...overrides }
}

/** Structured misconception rules covering every mistakeType the checker emits. */
function buildMistakeRules(problem: GeneratedPracticeProblem): GeneratedMistakeRule[] {
  switch (problem.templateKind) {
    case 'dice-ev': {
      const sides = problem.givenData.dice?.sides ?? 6
      const count = problem.givenData.dice?.count ?? 1
      const avg = (sides + 1) / 2
      return [
        rule('arithmetic-error', {
          whatHappened: 'That sum does not match the dice average.',
          whyItMatters: `A fair ${sides}-sided die averages (sides + 1) / 2 = ${formatNumber(avg)} — only a 6-sided die averages 3.5.`,
          repairStep: `Multiply ${formatNumber(avg)} by ${count} ${count === 1 ? 'die' : 'dice'} for the expected sum.`,
        }),
      ]
    }
    case 'card-hand-ev':
      return [
        rule('unweighted-sum', {
          whatHappened: 'That looks like the total of the card values.',
          whyItMatters: 'A random draw is equally likely to be any card, so you need the average, not the sum.',
          repairStep: 'Divide the sum of the card values by the number of cards.',
        }),
        rule('arithmetic-error', {
          repairStep: 'Re-add the card values, then divide by the number of cards.',
        }),
      ]
    case 'payout-vs-profit':
      return [rule('answered-payout'), rule('arithmetic-error')]
    case 'fairness-classification':
      return [rule('wrong-classification')]
    case 'compare-ev':
      return [rule('chose-worse-game')]
    case 'same-ev-risk':
      return [rule('confused-risk-with-ev')]
    case 'fair-price-to-play':
      return [
        rule('unweighted-sum', {
          repairStep: 'Multiply each payout by its probability and add them — that weighted total is the fair price.',
        }),
        rule('arithmetic-error'),
      ]
    default:
      return [rule('unweighted-sum'), rule('arithmetic-error')]
  }
}

/** Build the full deterministic feedback payload for a generated problem. */
export function buildDeterministicFeedback(problem: GeneratedPracticeProblem): GeneratedFeedback {
  return {
    correct: CORRECT_SUMMARY[problem.templateKind] ?? 'Correct.',
    conceptSummary: buildConceptSummary(problem),
    mistakeRules: buildMistakeRules(problem),
  }
}

function contributionRows(
  outcomes: readonly GeneratedOutcome[],
  unit: string,
  totalLabel: string,
): WorkedSolutionRow[] {
  const rows: WorkedSolutionRow[] = outcomes.map((outcome) => ({
    label: outcome.label,
    expression: `${money(outcome.value, unit)} × ${formatProbability(outcome.probability)}`,
    value: money(outcome.value * outcome.probability, unit),
  }))
  rows.push({
    label: totalLabel,
    expression: 'add the contributions',
    value: money(sumOutcomes(outcomes), unit),
  })
  return rows
}

/**
 * A contribution-style worked solution computed from public data + the answer
 * key. Shown after a correct answer so the learner sees value × probability →
 * contribution → total, never just a bare number.
 */
export function buildWorkedSolution(
  problem: GeneratedPracticeProblem,
  answerKey: GeneratedAnswerKey,
): WorkedSolutionRow[] {
  const unit = unitFor(problem.templateKind)
  const outcomes = problem.givenData.outcomes ?? []
  const games = problem.givenData.games ?? []

  if (problem.templateKind === 'card-hand-ev') {
    const cards = problem.givenData.cards ?? []
    if (cards.length === 0) {
      return []
    }
    const sum = cards.reduce((total, card) => total + cardValue(card.rank), 0)
    return [
      {
        label: 'Sum of values',
        expression: cards.map((card) => formatNumber(cardValue(card.rank))).join(' + '),
        value: formatNumber(sum),
      },
      { label: 'Number of cards', expression: 'count the cards', value: String(cards.length) },
      {
        label: 'Expected value',
        expression: `${formatNumber(sum)} ÷ ${cards.length}`,
        value: formatNumber(sum / cards.length),
      },
    ]
  }

  if (problem.templateKind === 'dice-ev') {
    const sides = problem.givenData.dice?.sides ?? 6
    const count = problem.givenData.dice?.count ?? 1
    const avg = (sides + 1) / 2
    return [
      {
        label: 'One die average',
        expression: `(${sides} + 1) ÷ 2`,
        value: formatNumber(avg),
      },
      {
        label: 'Expected sum',
        expression: `${count} × ${formatNumber(avg)}`,
        value: formatNumber(count * avg),
      },
    ]
  }

  if (problem.templateKind === 'compare-ev') {
    const rows: WorkedSolutionRow[] = games.map((game) => ({
      label: game.label,
      expression: 'weighted average',
      value: money(sumOutcomes(game.outcomes) - (game.cost ?? 0), unit),
    }))
    const best = games.find((game) => game.id === answerKey.bestChoice)
    rows.push({
      label: 'Better game',
      expression: 'higher expected value',
      value: best?.label ?? answerKey.bestChoice ?? '',
    })
    return rows
  }

  if (problem.templateKind === 'same-ev-risk') {
    const rows: WorkedSolutionRow[] = games.map((game) => {
      const values = game.outcomes.map((outcome) => outcome.value)
      const spread = Math.max(...values) - Math.min(...values)
      return {
        label: game.label,
        expression: `spread ${money(Math.min(...values), unit)} to ${money(Math.max(...values), unit)}`,
        value: money(spread, unit),
      }
    })
    const riskiest = games.find((game) => game.id === answerKey.riskChoice)
    rows.push({
      label: 'Riskier game',
      expression: 'wider spread',
      value: riskiest?.label ?? answerKey.riskChoice ?? '',
    })
    return rows
  }

  if (outcomes.length === 0) {
    return []
  }

  const cost = problem.givenData.cost
  if (problem.templateKind === 'payout-vs-profit' && cost !== undefined) {
    const payout = sumOutcomes(outcomes)
    const rows = contributionRows(outcomes, unit, 'Expected payout')
    rows.push({ label: 'Cost to play', expression: 'subtract the cost', value: money(-cost, unit) })
    rows.push({
      label: 'Expected profit',
      expression: 'payout − cost',
      value: money(payout - cost, unit),
    })
    return rows
  }

  if (problem.templateKind === 'fairness-classification' && cost !== undefined) {
    const payout = sumOutcomes(outcomes)
    const profit = payout - cost
    const rows = contributionRows(outcomes, unit, 'Expected payout')
    rows.push({ label: 'Cost to play', expression: 'subtract the cost', value: money(-cost, unit) })
    rows.push({ label: 'Expected profit', expression: 'payout − cost', value: money(profit, unit) })
    rows.push({
      label: 'Verdict',
      expression: 'compare profit with $0',
      value: classifyProfit(profit),
    })
    return rows
  }

  if (problem.templateKind === 'fair-price-to-play') {
    const rows = contributionRows(outcomes, unit, 'Expected payout')
    rows.push({
      label: 'Fair price',
      expression: 'equals the expected payout',
      value: money(sumOutcomes(outcomes), unit),
    })
    return rows
  }

  return contributionRows(outcomes, unit, 'Expected value')
}

export function computeGeneratedAnswerKey(problem: GeneratedPracticeProblem): GeneratedAnswerKey {
  if (problem.templateKind === 'card-hand-ev') {
    const cards = problem.givenData.cards ?? []
    if (cards.length > 0) {
      return {
        expectedValue: cards.reduce((sum, card) => sum + cardValue(card.rank), 0) / cards.length,
      }
    }
    return {}
  }

  if (problem.templateKind === 'dice-ev') {
    const dice = problem.givenData.dice
    if (dice) {
      return { expectedValue: (dice.count * (dice.sides + 1)) / 2 }
    }
    return {}
  }

  const outcomes = problem.givenData.outcomes ?? []
  const games = problem.givenData.games ?? []
  const expectedValue = outcomes.length > 0 ? sumOutcomes(outcomes) : undefined
  const expectedProfit =
    expectedValue !== undefined && problem.givenData.cost !== undefined
      ? expectedValue - problem.givenData.cost
      : undefined

  if (problem.templateKind === 'compare-ev') {
    const values = games.map((game) => ({
      id: game.id,
      ev: sumOutcomes(game.outcomes) - (game.cost ?? 0),
    }))
    const best = [...values].sort((a, b) => b.ev - a.ev || a.id.localeCompare(b.id))[0]
    return { bestChoice: best?.id }
  }

  if (problem.templateKind === 'same-ev-risk') {
    const spreads = games.map((game) => {
      const values = game.outcomes.map((outcome) => outcome.value)
      return { id: game.id, spread: Math.max(...values) - Math.min(...values) }
    })
    const riskiest = [...spreads].sort((a, b) => b.spread - a.spread || a.id.localeCompare(b.id))[0]
    return { riskChoice: riskiest?.id }
  }

  return {
    expectedValue,
    expectedProfit,
    classification: expectedProfit === undefined ? undefined : classifyProfit(expectedProfit),
  }
}

export function validateGeneratedPracticeInstance(
  instance: GeneratedPracticeInstance,
): string[] {
  const errors: string[] = []
  const { problem, answerKey } = instance
  const outcomes = problem.givenData.outcomes ?? []
  const games = problem.givenData.games ?? []
  const probabilityGroups = [
    outcomes,
    ...games.map((game) => game.outcomes),
  ].filter((group) => group.length > 0)

  if (problem.schemaVersion !== 'ev-practice-v1') {
    errors.push('Unsupported schema version.')
  }
  if (problem.difficulty < 1 || problem.difficulty > 5) {
    errors.push('Difficulty must be between 1 and 5.')
  }
  if (problem.answerInputs.length === 0) {
    errors.push('At least one answer input is required.')
  }
  for (const group of probabilityGroups) {
    const totalProbability = group.reduce((total, outcome) => total + outcome.probability, 0)
    if (!areNumbersClose(totalProbability, 1, 0.001)) {
      errors.push('Outcome probabilities must sum to 1.')
    }
  }

  if (problem.templateKind === 'card-hand-ev') {
    const cards = problem.givenData.cards ?? []
    if (cards.length < 2 || cards.length > 12) {
      errors.push('A card hand must have between 2 and 12 cards.')
    }
    const hasInvalidCard = cards.some(
      (card) => !RANKS.includes(card.rank) || !SUITS.includes(card.suit),
    )
    if (hasInvalidCard) {
      errors.push('Card hand contains an invalid rank or suit.')
    }
  }

  if (problem.templateKind === 'dice-ev') {
    const dice = problem.givenData.dice
    const validSides = [4, 6, 8, 10, 12, 20]
    if (
      !dice ||
      !Number.isInteger(dice.count) ||
      dice.count < 1 ||
      dice.count > 6 ||
      !validSides.includes(dice.sides)
    ) {
      errors.push('A dice roll must use 1 to 6 dice with 4, 6, 8, 10, 12, or 20 sides.')
    }
  }

  if (problem.templateKind === 'card-deck-ev' && outcomes.length === 0) {
    errors.push('A deck draw must list at least one value outcome.')
  }

  if (problem.templateKind === 'profession-payout' && outcomes.length === 0) {
    errors.push('A profession payout must list at least one outcome.')
  }

  if (problem.templateKind === 'fair-price-to-play' && outcomes.length === 0) {
    errors.push('A fair-price game must list at least one outcome.')
  }

  if (problem.templateKind === 'compare-ev' || problem.templateKind === 'same-ev-risk') {
    const ids = games.map((game) => game.id)
    if (games.length < 2 || new Set(ids).size !== ids.length) {
      errors.push('Game comparisons need at least two games with unique ids.')
    }
    if (problem.templateKind === 'same-ev-risk' && games.length >= 2) {
      const expectedValues = games.map((game) => sumOutcomes(game.outcomes))
      const maxAbsEv = Math.max(...expectedValues.map((ev) => Math.abs(ev)))
      const equalEvTolerance = Math.max(0.01, maxAbsEv * 0.02)
      const shareSameEv = expectedValues.every((ev) =>
        areNumbersClose(ev, expectedValues[0], equalEvTolerance),
      )
      if (!shareSameEv) {
        errors.push('Same-EV risk games must share the same expected value.')
      }
    }
  }

  const recomputed = computeGeneratedAnswerKey(problem)
  for (const key of Object.keys(answerKey) as Array<keyof GeneratedAnswerKey>) {
    const expected = answerKey[key]
    const actual = recomputed[key]
    if (typeof expected === 'number' && typeof actual === 'number') {
      if (!areNumbersClose(expected, actual, problem.constraints.numericTolerance)) {
        errors.push(`Answer key mismatch for ${key}.`)
      }
    } else if (expected !== actual) {
      errors.push(`Answer key mismatch for ${key}.`)
    }
  }

  return errors
}

function correct(
  problem: GeneratedPracticeProblem,
  answerKey: GeneratedAnswerKey,
): CheckResult {
  return {
    isCorrect: true,
    mistakeType: null,
    feedback: problem.feedback.correct,
    canComplete: true,
    explanation: {
      conceptSummary: problem.feedback.conceptSummary,
      workedSolution: buildWorkedSolution(problem, answerKey),
    },
  }
}

function guard(feedback: string): CheckResult {
  return { isCorrect: false, mistakeType: '', feedback, canComplete: false }
}

/** Build a wrong-answer result from the problem's structured misconception rule. */
function fail(problem: GeneratedPracticeProblem, mistakeType: string): CheckResult {
  const rule =
    problem.feedback.mistakeRules.find((entry) => entry.mistakeType === mistakeType) ?? null
  const whyItMatters = rule?.whyItMatters ?? 'That is not the expected result yet.'
  const repairStep = rule?.repairStep ?? 'Re-check your setup, then try again.'
  return {
    isCorrect: false,
    mistakeType,
    feedback: whyItMatters,
    canComplete: false,
    explanation: {
      whatHappened: rule?.whatHappened,
      whyItMatters,
      repairStep,
    },
  }
}

export function checkGeneratedAnswer(
  problem: GeneratedPracticeProblem,
  answerKey: GeneratedAnswerKey,
  submission: GeneratedAnswerSubmission,
): CheckResult {
  const tolerance = problem.constraints.numericTolerance

  if (problem.answerInputs.includes('expectedValue')) {
    const parsed = normalizeMoneyAnswer(submission.expectedValue)
    if (parsed === null) {
      return guard('Enter the expected value first.')
    }
    if (!areNumbersClose(parsed, answerKey.expectedValue ?? Number.NaN, tolerance)) {
      const rawSum = problem.givenData.outcomes?.reduce((total, outcome) => total + outcome.value, 0)
      const mistakeType =
        rawSum !== undefined && areNumbersClose(parsed, rawSum, tolerance)
          ? 'unweighted-sum'
          : 'arithmetic-error'
      return fail(problem, mistakeType)
    }
  }

  if (problem.answerInputs.includes('expectedProfit')) {
    const parsed = normalizeMoneyAnswer(submission.expectedProfit)
    if (parsed === null) {
      return guard('Enter the expected profit first.')
    }
    if (!areNumbersClose(parsed, answerKey.expectedProfit ?? Number.NaN, tolerance)) {
      const payout = answerKey.expectedValue
      const mistakeType =
        payout !== undefined && areNumbersClose(parsed, payout, tolerance)
          ? 'answered-payout'
          : 'arithmetic-error'
      return fail(problem, mistakeType)
    }
  }

  if (problem.answerInputs.includes('classification')) {
    const parsed = normalizeClassificationAnswer(submission.classification)
    if (parsed === null) {
      return guard('Choose fair, favorable, or unfavorable.')
    }
    if (parsed !== answerKey.classification) {
      return fail(problem, 'wrong-classification')
    }
  }

  if (problem.answerInputs.includes('bestChoice')) {
    if (!submission.bestChoice) {
      return guard('Choose the game with the better expected value.')
    }
    if (submission.bestChoice !== answerKey.bestChoice) {
      return fail(problem, 'chose-worse-game')
    }
  }

  if (problem.answerInputs.includes('riskChoice')) {
    if (!submission.riskChoice) {
      return guard('Choose the riskier game.')
    }
    if (submission.riskChoice !== answerKey.riskChoice) {
      return fail(problem, 'confused-risk-with-ev')
    }
  }

  return correct(problem, answerKey)
}

function seededNumber(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return hash
}

export function templateForSkill(skillId: SkillId): GeneratedTemplateKind {
  if (skillId === 'payout-vs-profit') {
    return 'payout-vs-profit'
  }
  if (skillId === 'fairness-classification') {
    return 'fairness-classification'
  }
  if (skillId === 'compare-ev' || skillId === 'compare-expected-profit') {
    return 'compare-ev'
  }
  if (skillId === 'same-ev-different-risk' || skillId === 'risk-spread') {
    return 'same-ev-risk'
  }
  return 'weighted-average'
}

const PLACEHOLDER_FEEDBACK: GeneratedFeedback = {
  correct: '',
  conceptSummary: '',
  mistakeRules: [],
}

/** Attach deterministic feedback + recompute the answer key for a finished problem. */
function finalize(problem: GeneratedPracticeProblem): GeneratedPracticeInstance {
  problem.feedback = buildDeterministicFeedback(problem)
  return { problem, answerKey: computeGeneratedAnswerKey(problem) }
}

export function createDeterministicPracticeInstance(args: {
  skillId: SkillId
  difficulty: number
  seed: string
  templateKind?: GeneratedTemplateKind
}): GeneratedPracticeInstance {
  const n = seededNumber(args.seed)
  // A second, independent seed value lets one dimension (e.g. dice sides) vary
  // without being locked to another (e.g. dice count) while staying deterministic.
  const n2 = seededNumber(`${args.seed}#alt`)
  const difficulty = Math.max(1, Math.min(5, Math.round(args.difficulty))) as 1 | 2 | 3 | 4 | 5
  const templateKind = args.templateKind ?? templateForSkill(args.skillId)

  // The canonical difficulty matrix owns every 1-5 scaling decision (outcome
  // counts, probability spread, dice/deck/comparison structure). The client and
  // server fallbacks both read it, so they cannot drift.
  const body = buildPracticeBody(templateKind, difficulty, n, n2)
  const problem: GeneratedPracticeProblem = {
    id: `local-${args.seed}`,
    schemaVersion: 'ev-practice-v1',
    templateKind,
    skillIds: [args.skillId],
    difficulty,
    title: body.title,
    scenarioText: body.scenarioText,
    prompt: body.prompt,
    givenData: body.givenData,
    answerInputs: body.answerInputs,
    hints: body.hints,
    feedback: PLACEHOLDER_FEEDBACK,
    constraints: body.constraints,
    source: 'deterministic-fallback',
  }
  return finalize(problem)
}
