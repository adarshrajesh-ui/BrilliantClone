import type { CheckResult, ProblemDefinition } from '../../types/problem'

// Canonical metadata fields land on `ProblemDefinition` during Agent 1's
// integration; until then they live on this local widening so the defs compile.
type CanonicalDefinition = ProblemDefinition & { canonicalSlug?: string; legacyProblemId?: string }

export const PROBLEM_EV_L1_P3: CanonicalDefinition = {
  problemId: 'ev-l1-p3',
  canonicalSlug: 'ev-l1-p3',
  legacyProblemId: 'l1-compare-spinners',
  title: 'Which Game Has the Best Long-Run Average?',
  concept: 'Expected value compares games by long-run average, not biggest prize or highest win rate.',
  difficulty: 2,
  scenarioText:
    'Game A pays $10 half the time and $0 half the time. Game B pays $25 one fifth of the time and $0 the rest of the time. Game C pays $6 four fifths of the time and $0 the rest of the time. Which game has the highest long-run average?',
  visualType: 'chance-bars',
  interactionType: 'multiselect-fluency-check',
  givenData: {
    gameA: { outcomes: [10, 0], probabilities: [0.5, 0.5] },
    gameB: { outcomes: [25, 0], probabilities: [0.2, 0.8] },
    gameC: { outcomes: [6, 0], probabilities: [0.8, 0.2] },
  },
  requiredActions: ['select-game-a', 'select-game-b', 'avoid-game-c', 'choose-reason'],
  answerInputs: ['selectedGames', 'reason'],
  correctAnswers: { selectedGames: ['a', 'b'], reason: 'same-average' },
  acceptedFormats: { selectedGames: ['A and B', 'Game A and Game B'], reason: ['Game A and Game B are tied because both average $5 over many plays.'] },
  mistakeRules: [
    { mistakeType: 'chose-bigger-prize', feedback: 'Game B has the biggest prize, but it pays less often. Its long-run average is $5, the same as Game A.' },
    { mistakeType: 'chose-highest-win-rate', feedback: 'Game C wins most often, but the payout is smaller. Winning more often does not automatically mean a higher long-run average.' },
    { mistakeType: 'missed-tie', feedback: 'This is a tie. Game A averages $5, and Game B also averages $5, so both should be selected.' },
    { mistakeType: 'ignored-probabilities', feedback: 'Compare each payout with its probability. A: 10 × 0.5 = $5. B: 25 × 0.2 = $5. C: 6 × 0.8 = $4.80.' },
    { mistakeType: 'expected-value-is-guaranteed', feedback: 'Expected value is a long-run average over many plays, not a guaranteed result on each play.' },
  ],
  feedback: { correct: 'Correct. Game A and Game B both average $5 per play. Game C wins more often, but its long-run average is only $4.80.' },
  teachingExplanation: {
    title: 'Why A and B are tied',
    body: [
      'Game B can pay the biggest prize, but it pays only 20% of the time. Game C wins most often, but its prize is smaller. Neither clue alone decides the best game.',
      'Multiply payout by probability for each: A is 10 × 0.5 = $5, B is 25 × 0.2 = $5, and C is 6 × 0.8 = $4.80. The highest long-run average is shared by A and B.',
    ],
    takeaway: 'Compare games by long-run average: payout times probability, not prize size or win rate alone.',
  },
  hints: [
    { id: 'evl1p3-h1', label: 'Game A', content: 'Game A: 10 × 0.5 = $5.' },
    { id: 'evl1p3-h2', label: 'Game B', content: 'Game B: 25 × 0.2 = $5.' },
    { id: 'evl1p3-h3', label: 'Game C', content: 'Game C: 6 × 0.8 = $4.80.' },
  ],
  completionRule: 'Select Game A and Game B, leave Game C unselected, and choose the reason that A and B are tied at $5 over many plays.',
  masteryTags: ['long-run-average', 'weighted-average', 'compare-ev'],
}

export type EvL1P3Game = 'a' | 'b' | 'c'
export type EvL1P3Reason = 'same-average' | 'biggest-prize' | 'highest-win-rate' | 'payouts-only' | 'guaranteed-result'

export interface EvL1P3CheckInput {
  selectedGames: EvL1P3Game[]
  reason: EvL1P3Reason | null
}

const guard = (feedback: string): CheckResult => ({ isCorrect: false, mistakeType: '', feedback, canComplete: false })
const wrong = (mistakeType: string, feedback: string): CheckResult => ({ isCorrect: false, mistakeType, feedback, canComplete: false })

export function checkEvL1P3(input: EvL1P3CheckInput): CheckResult {
  const selected = new Set(input.selectedGames)

  if (selected.size === 0) {
    return guard('Select every game with the highest long-run average.')
  }
  if (selected.size === 1 && selected.has('b')) {
    return wrong('chose-bigger-prize', PROBLEM_EV_L1_P3.mistakeRules[0].feedback)
  }
  if (selected.has('c')) {
    return wrong('chose-highest-win-rate', PROBLEM_EV_L1_P3.mistakeRules[1].feedback)
  }
  if (!(selected.has('a') && selected.has('b') && selected.size === 2)) {
    return wrong('missed-tie', PROBLEM_EV_L1_P3.mistakeRules[2].feedback)
  }
  if (input.reason === null) {
    return guard('Choose the reason that explains the tie.')
  }
  if (input.reason === 'biggest-prize') {
    return wrong('chose-bigger-prize', PROBLEM_EV_L1_P3.mistakeRules[0].feedback)
  }
  if (input.reason === 'highest-win-rate') {
    return wrong('chose-highest-win-rate', PROBLEM_EV_L1_P3.mistakeRules[1].feedback)
  }
  if (input.reason === 'guaranteed-result') {
    return wrong('expected-value-is-guaranteed', PROBLEM_EV_L1_P3.mistakeRules[4].feedback)
  }
  if (input.reason === 'payouts-only') {
    return wrong('ignored-probabilities', PROBLEM_EV_L1_P3.mistakeRules[3].feedback)
  }
  return { isCorrect: true, mistakeType: null, feedback: PROBLEM_EV_L1_P3.feedback.correct, canComplete: true }
}
