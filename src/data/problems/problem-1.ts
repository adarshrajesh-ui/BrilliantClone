import type { CheckResult, ProblemDefinition } from '../../types/problem'
import { normalizeNumericAnswer, areNumbersClose } from '../../lib/answerParser'

// Canonical metadata fields land on `ProblemDefinition` during Agent 1's
// integration; until then they live on this local widening so the defs compile.
type CanonicalDefinition = ProblemDefinition & { canonicalSlug?: string; legacyProblemId?: string }

export const PROBLEM_1: CanonicalDefinition = {
  problemId: 'problem-1',
  canonicalSlug: 'ev-l1-p1',
  legacyProblemId: 'l1-long-run-average',
  title: 'Two-Dice Roll Average',
  concept: 'Expected value is the average outcome over many repetitions of a random process.',
  difficulty: 1,
  scenarioText:
    'Pick up two dice and throw them into the tray. Each roll lands on some sum from 2 to 12. Throw the pair many times and watch where the average sum per roll settles.',
  visualType: 'dice-tray',
  interactionType: 'simulate-and-predict',
  givenData: {
    dice: 2,
    faces: [1, 2, 3, 4, 5, 6],
    sumRange: [2, 12],
    expectedSum: 7,
    minTotalThrows: 100,
  },
  requiredActions: ['throw-dice', 'reach-100-rolls', 'identify-average-sum'],
  answerInputs: ['finalAnswer'],
  correctAnswers: { finalAnswer: 7 },
  acceptedFormats: { finalAnswer: ['7', '7.0', '7.00', '7 sum', '7 per roll', '7 per throw'] },
  mistakeRules: [
    { mistakeType: 'chose-extreme-outcome', feedback: 'You picked a single extreme sum (2 or 12). Those are the rarest results, not the average — expected value is what the sum averages to over many rolls.' },
    { mistakeType: 'used-single-die-average', feedback: 'That is the average of ONE die. With two dice the averages add: 3.5 + 3.5 = 7. Aim for the average of the sum, not a single die.' },
    { mistakeType: 'assumed-sample-equals-ev', feedback: 'That looks like the sample average you happened to roll. The theoretical long-run average sum is exactly 7 — keep rolling and watch the line settle toward it.' },
  ],
  feedback: {
    correct: 'Correct — 7 is the long-run average sum. Each die averages 3.5, so the two add to 3.5 + 3.5 = 7. The sums 2..12 are not equally likely; 7 is the most likely sum, so the average per roll settles on 7.',
  },
  teachingExplanation: {
    title: 'Why this makes sense',
    body: [
      'A single roll shows one sum between 2 and 12 — but expected value is not about one roll. It is the average sum per roll if you threw the pair thousands of times.',
      'Each fair die averages (1 + 2 + 3 + 4 + 5 + 6) ÷ 6 = 3.5. With two dice the averages simply add: 3.5 + 3.5 = 7. And the sums are not equally likely — there is one way to roll a 2 (1+1) but six ways to roll a 7, so a histogram of sums peaks at 7. The running-average line wobbles early, then hugs 7.',
    ],
    takeaway: 'Expected value is the long-run average per trial; for two dice the average sum is 7.',
  },
  hints: [
    { id: 'p1-h1', label: 'Watch the line', content: 'Watch the running-average graph after each roll. Early on it jumps around; after many rolls it settles toward one value.' },
    { id: 'p1-h2', label: 'Average one die', content: 'One fair die averages (1 + 2 + 3 + 4 + 5 + 6) ÷ 6 = 3.5.' },
    { id: 'p1-h3', label: 'Add the dice', content: 'Two dice average 3.5 + 3.5 = 7, and 7 is the most common sum (the histogram peaks there).' },
  ],
  completionRule:
    'Reach at least 100 total rolls and identify 7 as the long-run average sum.',
  masteryTags: ['long-run-average'],
}

// ---------------------------------------------------------------------------
// Deterministic two-dice model (no AI). The sum for a given throw index is a
// pure function of the session seed + index, so drag-release, tap-to-throw,
// batch throws, and reduced-motion all yield the SAME roll for the same throw
// index. Each die uses an independent hash index so the two are uncorrelated.
// ---------------------------------------------------------------------------

/** Pure 32-bit hash → [0,1). Deterministic for a (seed, index) pair. */
function hash01(seed: number, index: number): number {
  let h = (seed ^ (index + 0x9e3779b9)) >>> 0
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0
  h = (h ^ (h >>> 16)) >>> 0
  return h / 0x100000000
}

export interface DiceRoll {
  d1: number
  d2: number
  sum: number
}

/**
 * Deterministic two-dice roll for throw `index` under `seed`. Each die is a fair
 * 1..6 draw from an independent hash index, so EV(sum) = 7.
 */
export function diceRollForThrow(seed: number, index: number): DiceRoll {
  const d1 = Math.floor(hash01(seed, index * 2) * 6) + 1
  const d2 = Math.floor(hash01(seed, index * 2 + 1) * 6) + 1
  return { d1, d2, sum: d1 + d2 }
}

export interface Problem1DiceCheckInput {
  totalThrows: number
  finalAnswer: string
}

const guard = (feedback: string): CheckResult => ({
  isCorrect: false,
  mistakeType: '',
  feedback,
  canComplete: false,
})

const wrong = (mistakeType: string, feedback: string): CheckResult => ({
  isCorrect: false,
  mistakeType,
  feedback,
  canComplete: false,
})

export function checkProblem1Dice(input: Problem1DiceCheckInput): CheckResult {
  if (input.totalThrows < 100) {
    return guard(`Reach at least 100 total rolls (${input.totalThrows}/100).`)
  }

  // Strip per-roll/per-throw and "sum" phrasing before numeric parsing.
  const cleaned = input.finalAnswer
    .replace(/per\s*(roll|throw)/gi, '')
    .replace(/rolls?|throws?/gi, '')
    .replace(/sum/gi, '')
  const value = cleaned.includes('%') ? null : normalizeNumericAnswer(cleaned)
  if (value === null) {
    return guard('Enter the long-run average sum per roll.')
  }
  if (areNumbersClose(value, 7)) {
    return {
      isCorrect: true,
      mistakeType: null,
      feedback: PROBLEM_1.feedback.correct,
      canComplete: true,
    }
  }
  if (areNumbersClose(value, 2) || areNumbersClose(value, 12)) {
    return wrong('chose-extreme-outcome', PROBLEM_1.mistakeRules[0].feedback)
  }
  if (areNumbersClose(value, 3.5)) {
    return wrong('used-single-die-average', PROBLEM_1.mistakeRules[1].feedback)
  }
  return wrong('assumed-sample-equals-ev', PROBLEM_1.mistakeRules[2].feedback)
}
