import type { CheckResult, ProblemDefinition } from '../../types/problem'
import { areNumbersClose, normalizeNumericAnswer } from '../../lib/answerParser'

// Canonical metadata fields land on `ProblemDefinition` during Agent 1's
// integration; until then they live on this local widening so the defs compile.
type CanonicalDefinition = ProblemDefinition & { canonicalSlug?: string; legacyProblemId?: string }

/** Minimum number of claw drops before the contribution/formula phase unlocks. */
export const REQUIRED_GRABS = 8

export const PROBLEM_2: CanonicalDefinition = {
  problemId: 'problem-2',
  canonicalSlug: 'ev-l2-p1',
  legacyProblemId: 'l2-build-weighted-average',
  title: 'Claw Machine Expected Value',
  concept: 'Expected value is a weighted average: each outcome contributes payout × probability, according to how much chance-space it occupies.',
  difficulty: 2,
  scenarioText:
    'A carnival claw machine hovers over a pit split into 4 equal floor zones: one small $20 prize zone (25%) and three empty $0 zones (75%). Run several claw grabs and watch the payout tray fill up — short runs are noisy. Then compress the pit into contribution blocks and submit the expected value of one grab.',
  visualType: 'claw-machine',
  interactionType: 'claw-grab-then-formula',
  givenData: {
    outcomes: [20, 0],
    probabilities: [0.25, 0.75],
    cards: ['$20', '$0', '25%', '75%'],
    zones: 4,
    prizeZones: 1,
    requiredGrabs: 8,
  },
  requiredActions: ['run-8-grabs', 'view-contribution-compression', 'place-formula-pairs', 'submit-ev'],
  answerInputs: ['grabs', 'formulaSlots', 'evAnswer'],
  correctAnswers: { slots: ['$20', '25%', '$0', '75%'], ev: 5 },
  acceptedFormats: { ev: ['5', '5.0', '5.00', '$5', '$5.00'] },
  mistakeRules: [
    { mistakeType: 'reversed-outcome-probability', feedback: 'A dollar value is an outcome and a percent is a probability. Pair $20 with 25% and $0 with 75% — not $20 with 75%.' },
    { mistakeType: 'omitted-probability', feedback: 'Every outcome needs a probability in the formula. Fill all four slots, including the common $0 zones.' },
    { mistakeType: 'used-largest-payout', feedback: 'You used $20 as the answer because it is the best prize. EV weights each outcome by its probability, so the rare $20 grab only contributes 20 × 0.25 = $5.' },
  ],
  feedback: {
    correct: 'Correct! 20 × 0.25 + 0 × 0.75 = $5. The rare $20 grab (25% of the pit) contributes the whole $5; the common $0 zones add nothing.',
  },
  teachingExplanation: {
    title: 'What this teaches',
    body: [
      'A handful of claw drops is noisy — you might snag the $20 twice in a row or miss it eight times. The short-run tray total is not the expected value. EV is what each grab is worth on average once the luck evens out.',
      'The pit makes probability visible as chance-space. The $20 prize zone is one quarter of the floor, so even though it pays the most, it only contributes 20 × 0.25 = $5. The three $0 zones fill three quarters of the pit but still add 0 × 0.75 = $0. Compressing the pit into contribution blocks shows $5 + $0 = $5.',
      'Your formula paired $20 with 25% and $0 with 75%, giving 20 × 0.25 + 0 × 0.75 = 5 + 0 = $5. Each block’s width mirrors its probability: bigger chance-space, bigger weight.',
    ],
    takeaway: 'EV is a weighted average: each payout times its probability, summed together — not the best prize and not a short run of luck.',
  },
  hints: [
    { id: 'p2-h1', label: 'Run your grabs', content: 'Drop the claw several times and watch how often you snag $20 versus an empty $0 zone. Roughly one grab in four lands the $20.' },
    { id: 'p2-h2', label: 'Match pairs', content: 'Pair each payout with its probability: $20 with 25%, $0 with 75%.' },
    { id: 'p2-h3', label: 'Multiply and add', content: 'Multiply each payout by its probability, then add both contributions.' },
  ],
  completionRule: 'Run at least 8 claw drops, view the contribution compression, pair $20 with 25% and $0 with 75%, and submit a final EV of $5.',
  masteryTags: ['weighted-average'],
}

export interface Problem2PrizeBoardCheckInput {
  /** True once the learner has run >= REQUIRED_GRABS claw drops AND viewed the
   *  contribution compression. Replaces the old `bothDropped` gate. */
  grabsComplete: boolean
  /** Formula pairing slots, in order [payoutA, probA, payoutB, probB]. */
  slots: [string, string, string, string]
  /** Raw EV text the learner typed. */
  evAnswer: string
}

const guard = (feedback: string): CheckResult => ({ isCorrect: false, mistakeType: '', feedback, canComplete: false })
const wrong = (mistakeType: string, feedback: string): CheckResult => ({ isCorrect: false, mistakeType, feedback, canComplete: false })

function matchesMoneyValue(value: string, targets: number[], tolerance = 0.01): boolean {
  if (value.includes('%')) {
    return false
  }

  const parsed = normalizeNumericAnswer(value)
  return parsed !== null && targets.some((target) => areNumbersClose(parsed, target, tolerance))
}

export function checkProblem2PrizeBoard(input: Problem2PrizeBoardCheckInput): CheckResult {
  if (!input.grabsComplete) {
    return guard('Run all your claw drops and view the contribution breakdown before pairing the formula.')
  }

  const [a, b, c, d] = input.slots
  const filledCount = [a, b, c, d].filter(Boolean).length
  if (filledCount === 0) {
    return guard('Select a card, then tap an empty formula slot to place it.')
  }
  if (filledCount < 4) {
    return wrong('omitted-probability', PROBLEM_2.mistakeRules[1].feedback)
  }

  const correctPairs =
    (a === '$20' && b === '25%' && c === '$0' && d === '75%') ||
    (a === '$0' && b === '75%' && c === '$20' && d === '25%')

  if (!correctPairs) {
    return wrong('reversed-outcome-probability', PROBLEM_2.mistakeRules[0].feedback)
  }

  if (matchesMoneyValue(input.evAnswer, [20])) {
    return wrong('used-largest-payout', PROBLEM_2.mistakeRules[2].feedback)
  }
  if (!matchesMoneyValue(input.evAnswer, [5])) {
    return wrong('arithmetic-error', 'Compute EV = 20 × 0.25 + 0 × 0.75 = $5.')
  }

  return { isCorrect: true, mistakeType: null, feedback: PROBLEM_2.feedback.correct, canComplete: true }
}
