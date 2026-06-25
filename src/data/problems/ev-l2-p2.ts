import type { CheckResult, ProblemDefinition } from '../../types/problem'
import { areProbabilitiesEquivalent } from '../../lib/answerParser'

// Canonical metadata fields land on `ProblemDefinition` during Agent 1's
// integration; until then they live on this local widening so the defs compile.
type CanonicalDefinition = ProblemDefinition & { canonicalSlug?: string; legacyProblemId?: string }

export const PROBLEM_EV_L2_P2: CanonicalDefinition = {
  problemId: 'ev-l2-p2',
  canonicalSlug: 'ev-l2-p2',
  legacyProblemId: 'l2-match-outcomes-probabilities',
  title: 'Match Outcomes to Probabilities',
  concept: 'Every outcome must be paired with the probability of that exact outcome.',
  difficulty: 2,
  scenarioText:
    'A game pays $12 with probability 1/3, $3 with probability 1/2, and $0 with probability 1/6. Match each payout to its own probability.',
  visualType: 'weighted-average',
  interactionType: 'tap-to-match',
  givenData: {
    outcomes: ['$12', '$3', '$0'],
    probabilities: ['1/3', '1/2', '1/6'],
    pairs: { '12': '1/3', '3': '1/2', '0': '1/6' },
  },
  requiredActions: ['match-all-pairs'],
  answerInputs: ['assignments'],
  correctAnswers: { '12': '1/3', '3': '1/2', '0': '1/6' },
  acceptedFormats: { assignments: ['1/3', '1/2', '1/6', '0.3333', '0.5', '0.1667', '33.33%', '50%', '16.67%'] },
  mistakeRules: [
    { mistakeType: 'ranked-by-size', feedback: 'You ranked the cards by size — largest payout to largest probability. Read the game data instead: $12 happens with probability 1/3, not 1/2.' },
    { mistakeType: 'reused-probability', feedback: 'Each probability card can only be used once. Every outcome needs its own probability.' },
    { mistakeType: 'wrong-pairing', feedback: 'Each payout needs the probability of receiving that exact payout. Read the game data and connect each outcome to its own chance: $12 ↔ 1/3, $3 ↔ 1/2, $0 ↔ 1/6.' },
  ],
  feedback: { correct: 'Correct! $12 ↔ 1/3, $3 ↔ 1/2, $0 ↔ 1/6. The largest payout does not get the largest probability.' },
  teachingExplanation: {
    title: 'Why this makes sense',
    body: [
      'It is tempting to line the cards up by size, giving the biggest prize the biggest chance. But probability comes from the game data, not from how large the payout is.',
      'Here $3 is the most likely outcome (1/2), the $12 prize happens only 1/3 of the time, and $0 is rarest at 1/6. Each outcome must be paired with the probability of that exact outcome before you can weight it.',
    ],
    takeaway: 'Pair every outcome with the probability of that exact outcome — never rank cards by size.',
  },
  hints: [
    { id: 'evl2p2-h1', label: 'Read the data', content: 'The game states each chance directly: $12 → 1/3, $3 → 1/2, $0 → 1/6.' },
    { id: 'evl2p2-h2', label: 'Most likely', content: '1/2 is the largest probability, and it belongs to $3 — the most frequent payout, not the biggest.' },
    { id: 'evl2p2-h3', label: 'Each once', content: 'Use each probability card exactly once, and leave no outcome unmatched.' },
  ],
  completionRule: 'Match all three outcomes to their correct probabilities: $12 ↔ 1/3, $3 ↔ 1/2, $0 ↔ 1/6.',
  masteryTags: ['weighted-average', 'outcome-probability-pairing'],
}

export type EvL2P2Outcome = '12' | '3' | '0'

export interface EvL2P2CheckInput {
  assignments: Record<EvL2P2Outcome, string>
}

const CORRECT: Record<EvL2P2Outcome, { label: string; value: number }> = {
  '12': { label: '1/3', value: 1 / 3 },
  '3': { label: '1/2', value: 1 / 2 },
  '0': { label: '1/6', value: 1 / 6 },
}

const guard = (feedback: string): CheckResult => ({ isCorrect: false, mistakeType: '', feedback, canComplete: false })
const wrong = (mistakeType: string, feedback: string): CheckResult => ({ isCorrect: false, mistakeType, feedback, canComplete: false })

function probabilityMatches(value: string, target: number): boolean {
  return areProbabilitiesEquivalent(value, target)
}

function probabilityKey(value: string): string {
  const normalized = value.trim().toLowerCase()
  for (const target of Object.values(CORRECT)) {
    if (probabilityMatches(value, target.value)) {
      return target.label
    }
  }
  return normalized
}

export function checkEvL2P2(input: EvL2P2CheckInput): CheckResult {
  const outcomes: EvL2P2Outcome[] = ['12', '3', '0']
  const values = outcomes.map((o) => input.assignments[o].trim())

  if (values.some((v) => !v)) {
    return guard('Match all three outcomes to a probability before checking.')
  }

  const used = new Set(values.map(probabilityKey))
  if (used.size < values.length) {
    return wrong('reused-probability', PROBLEM_EV_L2_P2.mistakeRules[1].feedback)
  }

  const allCorrect = outcomes.every((o) => probabilityMatches(input.assignments[o], CORRECT[o].value))
  if (allCorrect) {
    return { isCorrect: true, mistakeType: null, feedback: PROBLEM_EV_L2_P2.feedback.correct, canComplete: true }
  }

  // Ranking by size: largest payout ($12) paired with the largest probability (1/2).
  if (probabilityMatches(input.assignments['12'], CORRECT['3'].value)) {
    return wrong('ranked-by-size', PROBLEM_EV_L2_P2.mistakeRules[0].feedback)
  }

  return wrong('wrong-pairing', PROBLEM_EV_L2_P2.mistakeRules[2].feedback)
}
