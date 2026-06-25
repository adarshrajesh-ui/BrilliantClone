import type { CheckResult, ProblemDefinition } from '../../types/problem'
import { normalizeNumericAnswer, areNumbersClose } from '../../lib/answerParser'

/** ProblemDefinition + canonical-model metadata (Agent 1 reconciles at integration). */
export interface CanonicalProblemDefinition extends ProblemDefinition {
  canonicalSlug?: string
  legacyProblemId?: string
  desktopWorkspaceLayout?: string
  mobileWorkspaceLayout?: string
}

/** Wider-Spread answer payload. New, local CheckInput type (listed for Agent 1). */
export interface WiderSpreadCheckInput {
  gameASimulated: boolean
  gameBSimulated: boolean
  evA: string
  evB: string
  /** 'A' | 'B' */
  higherRisk: string
  /** explanation option key */
  reason: string
}

const ok = (feedback: string, canComplete = false): CheckResult => ({
  isCorrect: canComplete,
  mistakeType: null,
  feedback,
  canComplete,
})

const guard = (feedback: string): CheckResult => ({
  isCorrect: false,
  mistakeType: null,
  feedback,
  canComplete: false,
})

const fail = (mistakeType: string, feedback: string): CheckResult => ({
  isCorrect: false,
  mistakeType,
  feedback,
  canComplete: false,
})

const normalizeEvAnswer = (raw: string): number | null => {
  if (raw.includes('%')) {
    return null
  }
  return normalizeNumericAnswer(raw)
}

const matches = (raw: string, target: number): boolean => {
  const v = normalizeEvAnswer(raw)
  return v !== null && areNumbersClose(v, target, 0.01)
}

const CORRECT_REASONS = new Set(['wider-spread', 'variable-outcomes', 'can-be-0-or-12'])

/**
 * Deterministic checker for "Wider Spread, Same Average" ($6 vs $12/$0). Requires
 * EV computation. Cohesion guard: rejects the L5P1 booth payouts ($5 average),
 * keeping this problem distinct from the qualitative preview before it.
 */
export function checkWiderSpread(input: WiderSpreadCheckInput): CheckResult {
  if (!input.gameASimulated || !input.gameBSimulated) {
    return guard('Run 20 simulated trials for each game first.')
  }

  if (normalizeEvAnswer(input.evA) === null) {
    return guard('Enter the expected value for Game A.')
  }
  // Cohesion: $5 belongs to the previous booth game (L5P1), not this one.
  if (matches(input.evA, 5)) {
    return fail(
      'ev-arithmetic-error',
      '$5 was the average in the previous booth game. Here Game A pays $6 every round, so EV(A) = $6.',
    )
  }
  if (!matches(input.evA, 6)) {
    return fail('ev-arithmetic-error', 'Game A pays a guaranteed $6 every round, so EV(A) = $6.')
  }

  if (normalizeEvAnswer(input.evB) === null) {
    return guard('Enter the expected value for Game B.')
  }
  if (matches(input.evB, 12)) {
    return fail(
      'claimed-game-b-has-higher-ev',
      'You used Game B’s top payout. $12 happens only half the time — compute 12 × 0.5 + 0 × 0.5 = $6, the same as Game A.',
    )
  }
  // Cohesion: $5 / $10 are the previous game's numbers.
  if (matches(input.evB, 5) || matches(input.evB, 10)) {
    return fail(
      'ev-arithmetic-error',
      'Those are the previous booth game’s numbers. Game B here is 12 × 0.5 + 0 × 0.5 = $6.',
    )
  }
  if (!matches(input.evB, 6)) {
    return fail('ev-arithmetic-error', 'Compute Game B: 12 × 0.5 + 0 × 0.5 = $6.')
  }

  const risk = input.higherRisk.trim().toLowerCase()
  if (risk === '') {
    return guard('Select which game is riskier.')
  }
  if (risk.includes('a') && !risk.includes('b')) {
    return fail(
      'selected-game-a-as-riskier',
      'Game A guarantees $6 with zero spread, while Game B ranges from $0 to $12. The wider spread makes Game B the riskier game.',
    )
  }
  if (!risk.includes('b')) {
    return guard('Select which game is riskier.')
  }

  const reason = input.reason.trim().toLowerCase()
  if (reason === '') {
    return guard('Select the explanation for why Game B is riskier.')
  }
  if (reason === 'higher-ev') {
    return fail(
      'claimed-game-b-has-higher-ev',
      'Game B does not have a higher EV — both average $6. It is riskier because its outcomes spread from $0 to $12.',
    )
  }
  if (reason === 'identical') {
    return fail(
      'claimed-games-identical',
      'The games share the same $6 EV, but they are not identical: Game B’s outcomes spread from $0 to $12 while Game A always pays $6.',
    )
  }
  if (!CORRECT_REASONS.has(reason)) {
    return fail(
      'claimed-games-identical',
      'Game B is riskier because its outcomes vary from $0 to $12, even though the long-run average matches Game A.',
    )
  }

  return ok(
    'Correct — both average $6, but Game B is riskier because its outcomes vary from $0 to $12 while Game A guarantees $6 every time.',
    true,
  )
}

export const PROBLEM_8: CanonicalProblemDefinition = {
  problemId: 'problem-8',
  canonicalSlug: 'ev-l5-p2',
  legacyProblemId: 'l5-same-ev-different-risk',
  title: 'Wider Spread, Same Average',
  concept: 'Two games can share the same expected value but carry very different risk.',
  difficulty: 8,
  scenarioText:
    'Game A — Sure Six pays a guaranteed $6 every round. Game B — Double or Nothing pays $12 half the time and $0 the other half. Run the simulations, compute both expected values, and decide which game is riskier.',
  visualType: 'risk-comparison',
  interactionType: 'simulate-and-compare',
  givenData: { trials: 20, gameA: 6, gameB: [12, 0] },
  requiredActions: ['simulate-both', 'ev-both', 'identify-risk', 'select-reason'],
  answerInputs: ['evA', 'evB', 'higherRisk', 'reason'],
  correctAnswers: { evA: 6, evB: 6, higherRisk: 'B', reason: 'wider-spread' },
  acceptedFormats: {
    ev: ['6', '6.0', '$6', '$6.00'],
    higherRisk: ['B', 'Game B', 'game-b'],
    reason: ['variable outcomes', 'wider spread', 'can be 0 or 12'],
  },
  mistakeRules: [
    { mistakeType: 'claimed-game-b-has-higher-ev', feedback: '$12 happens only half the time. 12 × 0.5 + 0 × 0.5 = $6, same as Game A.' },
    { mistakeType: 'claimed-games-identical', feedback: 'Same EV does not mean identical — Game B spreads from $0 to $12.' },
    { mistakeType: 'confused-average-with-guaranteed', feedback: 'Game A is guaranteed $6 every round; Game B only averages $6.' },
    { mistakeType: 'selected-game-a-as-riskier', feedback: 'Game A has zero spread; Game B ranges $0–$12, so Game B is riskier.' },
    { mistakeType: 'ev-arithmetic-error', feedback: 'EV(A) = 6 and EV(B) = 12 × 0.5 + 0 × 0.5 = 6.' },
  ],
  feedback: {
    correct:
      'Correct — both average $6, but Game B is riskier because its outcomes vary from $0 to $12 while Game A guarantees $6 every time.',
  },
  teachingExplanation: {
    title: 'Same EV, wider spread',
    body: [
      'Game A pays $6 every single round, so its running-average line is flat at $6. Game B pays $12 half the time and $0 the other half; 12 × 0.5 + 0 × 0.5 = $6, so it averages to the same value.',
      'The expected values are equal, but the risk is not. Game B’s outcomes spread from $0 to $12 while Game A never moves off $6. Wider spread around the same average means more risk.',
    ],
    takeaway: 'Equal expected values can hide very different spreads — wider spread means more risk.',
  },
  hints: [
    { id: 'p8-h1', label: 'Watch the spread', content: 'Game A never moves off $6. Watch Game B’s outcomes jump between $0 and $12.' },
    { id: 'p8-h2', label: 'Compute Game B', content: 'EV(B) = 12 × 0.5 + 0 × 0.5.' },
    { id: 'p8-h3', label: 'Same average, wider spread', content: 'Equal averages, but Game B’s wider spread means more risk → Game B.' },
  ],
  completionRule:
    'Run both 20-trial simulations, enter EV(A) = 6 and EV(B) = 6, select Game B as riskier, and choose the correct explanation.',
  masteryTags: ['same-ev-different-risk'],
}
