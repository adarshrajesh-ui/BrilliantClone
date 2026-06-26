import {
  areNumbersClose,
  normalizeClassificationAnswer,
  normalizeMoneyAnswer,
} from '../../lib/answerParser'
import type { CheckResult } from '../../types/problem'
import type { SkillId } from '../../core/adaptive/types'

export type GeneratedTemplateKind =
  | 'weighted-average'
  | 'payout-vs-profit'
  | 'fairness-classification'
  | 'compare-ev'
  | 'same-ev-risk'

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
  }
  answerInputs: GeneratedAnswerInput[]
  hints: Array<{ id: string; label: string; content: string }>
  feedback: {
    correct: string
    mistakeRules: Array<{ mistakeType: string; feedback: string }>
  }
  constraints: {
    numericTolerance: number
  }
  source: 'ai' | 'deterministic-fallback'
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

export function computeGeneratedAnswerKey(problem: GeneratedPracticeProblem): GeneratedAnswerKey {
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

function correct(feedback: string): CheckResult {
  return { isCorrect: true, mistakeType: null, feedback, canComplete: true }
}

function guard(feedback: string): CheckResult {
  return { isCorrect: false, mistakeType: '', feedback, canComplete: false }
}

function fail(mistakeType: string, feedback: string): CheckResult {
  return { isCorrect: false, mistakeType, feedback, canComplete: false }
}

function mistakeFeedback(
  problem: GeneratedPracticeProblem,
  mistakeType: string,
  fallback: string,
): string {
  return problem.feedback.mistakeRules.find((rule) => rule.mistakeType === mistakeType)?.feedback ?? fallback
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
      return fail(
        mistakeType,
        mistakeFeedback(problem, mistakeType, 'Use each outcome multiplied by its probability.'),
      )
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
      return fail(
        mistakeType,
        mistakeFeedback(problem, mistakeType, 'Subtract the cost after finding expected payout.'),
      )
    }
  }

  if (problem.answerInputs.includes('classification')) {
    const parsed = normalizeClassificationAnswer(submission.classification)
    if (parsed === null) {
      return guard('Choose fair, favorable, or unfavorable.')
    }
    if (parsed !== answerKey.classification) {
      return fail(
        'wrong-classification',
        mistakeFeedback(problem, 'wrong-classification', 'Classify by expected profit: positive, zero, or negative.'),
      )
    }
  }

  if (problem.answerInputs.includes('bestChoice')) {
    if (!submission.bestChoice) {
      return guard('Choose the game with the better expected value.')
    }
    if (submission.bestChoice !== answerKey.bestChoice) {
      return fail(
        'chose-worse-game',
        mistakeFeedback(problem, 'chose-worse-game', 'Compare the weighted averages, not the biggest single prize.'),
      )
    }
  }

  if (problem.answerInputs.includes('riskChoice')) {
    if (!submission.riskChoice) {
      return guard('Choose the riskier game.')
    }
    if (submission.riskChoice !== answerKey.riskChoice) {
      return fail(
        'confused-risk-with-ev',
        mistakeFeedback(problem, 'confused-risk-with-ev', 'Risk is about spread, not just expected value.'),
      )
    }
  }

  return correct(problem.feedback.correct)
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

export function createDeterministicPracticeInstance(args: {
  skillId: SkillId
  difficulty: number
  seed: string
}): GeneratedPracticeInstance {
  const n = seededNumber(args.seed)
  const high = 8 + (n % 5) * 2
  const low = 1 + (n % 4)
  const probability = args.difficulty >= 4 ? 0.25 : 0.5
  const cost = Math.max(1, Math.round((high * probability + low * (1 - probability)) - 1))
  const templateKind = templateForSkill(args.skillId)
  const base = {
    id: `local-${args.seed}`,
    schemaVersion: 'ev-practice-v1' as const,
    templateKind,
    skillIds: [args.skillId],
    difficulty: Math.max(1, Math.min(5, Math.round(args.difficulty))) as 1 | 2 | 3 | 4 | 5,
    hints: [
      {
        id: 'weighted-average',
        label: 'Pair values and chances',
        content: 'Multiply each value by its probability before adding.',
      },
      {
        id: 'cost',
        label: 'Account for cost',
        content: 'Expected profit is expected payout minus the cost to play.',
      },
    ],
    constraints: { numericTolerance: 0.01 },
    source: 'deterministic-fallback' as const,
  }

  const weightedProblem: GeneratedPracticeProblem = {
    ...base,
    title: 'Practice Prize Bag',
    scenarioText: `A prize bag pays $${high} on a rare ticket and $${low} otherwise.`,
    prompt: 'What is the expected payout?',
    givenData: {
      outcomes: [
        { label: 'Rare ticket', value: high, probability },
        { label: 'Common ticket', value: low, probability: 1 - probability },
      ],
    },
    answerInputs: ['expectedValue'],
    feedback: {
      correct: 'Correct. You weighted each payout by how often it happens.',
      mistakeRules: [
        { mistakeType: 'unweighted-sum', feedback: 'That adds the payouts without weighting them by probability.' },
        { mistakeType: 'arithmetic-error', feedback: 'Check each contribution, then add them.' },
      ],
    },
  }

  if (templateKind === 'payout-vs-profit' || templateKind === 'fairness-classification') {
    const problem: GeneratedPracticeProblem = {
      ...weightedProblem,
      templateKind,
      title: templateKind === 'payout-vs-profit' ? 'Practice Ticket Profit' : 'Practice Fairness Sort',
      scenarioText: `${weightedProblem.scenarioText} It costs $${cost} to play.`,
      prompt:
        templateKind === 'payout-vs-profit'
          ? 'What is the expected profit?'
          : 'Is this game fair, favorable, or unfavorable for the player?',
      givenData: { ...weightedProblem.givenData, cost },
      answerInputs: templateKind === 'payout-vs-profit' ? ['expectedProfit'] : ['classification'],
      feedback: {
        correct:
          templateKind === 'payout-vs-profit'
            ? 'Correct. You subtracted the cost from expected payout.'
            : 'Correct. You classified the game by expected profit.',
        mistakeRules: [
          { mistakeType: 'answered-payout', feedback: 'That is expected payout. Profit subtracts the cost.' },
          { mistakeType: 'wrong-classification', feedback: 'Use expected profit: positive is favorable, zero is fair, negative is unfavorable.' },
          { mistakeType: 'arithmetic-error', feedback: 'Recalculate the payout first, then subtract the cost.' },
        ],
      },
    }
    return { problem, answerKey: computeGeneratedAnswerKey(problem) }
  }

  if (templateKind === 'compare-ev' || templateKind === 'same-ev-risk') {
    const games: GeneratedGame[] = [
      {
        id: 'steady',
        label: 'Steady Game',
        outcomes: [
          { label: 'Every play', value: 6, probability: 1 },
        ],
      },
      {
        id: 'swingy',
        label: 'Swingy Game',
        outcomes: [
          { label: 'Win', value: 12, probability: 0.5 },
          { label: 'Miss', value: 0, probability: 0.5 },
        ],
      },
    ]
    const problem: GeneratedPracticeProblem = {
      ...base,
      title: templateKind === 'compare-ev' ? 'Practice Game Comparison' : 'Practice Risk Comparison',
      scenarioText: 'Two games have different outcome patterns.',
      prompt:
        templateKind === 'compare-ev'
          ? 'Which game has the better expected value?'
          : 'Which game is riskier even though the expected values match?',
      givenData: { games },
      answerInputs: templateKind === 'compare-ev' ? ['bestChoice'] : ['riskChoice'],
      feedback: {
        correct: 'Correct. You compared the games using the right EV idea.',
        mistakeRules: [
          { mistakeType: 'chose-worse-game', feedback: 'Compute each weighted average before choosing.' },
          { mistakeType: 'confused-risk-with-ev', feedback: 'The riskier game has the wider spread of outcomes.' },
        ],
      },
    }
    return { problem, answerKey: computeGeneratedAnswerKey(problem) }
  }

  return { problem: weightedProblem, answerKey: computeGeneratedAnswerKey(weightedProblem) }
}
