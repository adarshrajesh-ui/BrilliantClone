import type { CheckResult, ProblemDefinition } from '../../types/problem'

/**
 * ProblemDefinition extended with the canonical-model metadata fields the PRD
 * (Page 10) adds. Declared locally because Agent 1 owns `src/types/problem.ts`;
 * these optional fields are a superset and Agent 1 reconciles them at integration.
 */
export interface CanonicalProblemDefinition extends ProblemDefinition {
  canonicalSlug?: string
  legacyProblemId?: string
  desktopWorkspaceLayout?: string
  mobileWorkspaceLayout?: string
}

/**
 * Answer payload for "Same Average, Different Ride" (L5P1). The learner runs
 * two machines that share EV = $10 (Money Printer always $10; Jackpot Slot 60%
 * $0 / 40% $25) and then answers three qualitative questions.
 */
export interface SameAverageRideCheckInput {
  /** cumulative runs on Money Printer (Game A) */
  printerTrials: number
  /** cumulative runs on Jackpot Slot (Game B) */
  slotTrials: number
  /** true once a 100-run batch has been pressed on either machine */
  ranHundredBatch: boolean
  /** Q1: 'yes' | 'no' */
  sameEV: string
  /** Q2: 'slot' | 'printer' | 'neither' */
  riskier: string
  /** Q3: 'same-avg-different-spread' | 'slot-higher-average' | 'printer-pays-less' */
  why: string
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

/**
 * Deterministic checker for "Same Average, Different Ride". The learner must
 * exercise both machines enough to see the averages converge before the three
 * qualitative questions are graded.
 *
 * Gate order:
 *  1. each machine run >= 10 times
 *  2. at least one 100-run batch pressed on either machine
 *  3-5. each of the three questions answered
 */
export function checkSameAverageDifferentRide(input: SameAverageRideCheckInput): CheckResult {
  if (input.printerTrials < 10 || input.slotTrials < 10) {
    return guard('Run each machine at least 10 times.')
  }
  if (!input.ranHundredBatch) {
    return guard('Run at least one 100-run batch on either machine.')
  }
  if (input.sameEV.trim() === '') {
    return guard('Answer the first question: do the two machines have the same average payout?')
  }
  if (input.riskier.trim() === '') {
    return guard('Answer the second question: which machine is riskier?')
  }
  if (input.why.trim() === '') {
    return guard('Answer the third question: why does the riskier machine feel different?')
  }

  if (input.sameEV === 'no') {
    return fail(
      'claimed-different-ev',
      'Both machines average $10. The Money Printer always pays $10, and the Jackpot Slot averages 0.6 × $0 + 0.4 × $25 = $10 over many runs. Watch the 100-run batch settle near $10.',
    )
  }

  if (input.riskier === 'printer') {
    return fail(
      'selected-printer-as-riskier',
      'The Money Printer pays exactly $10 every single time — there is no risk at all. The Jackpot Slot is the risky one because it swings between $0 and $25.',
    )
  }
  if (input.riskier === 'neither') {
    return fail(
      'claimed-no-risk-difference',
      'The two machines do differ in risk. The Money Printer never changes, but the Jackpot Slot jumps between $0 and $25 — that swing is what makes it riskier.',
    )
  }

  if (input.why === 'slot-higher-average') {
    return fail(
      'claimed-slot-higher-ev',
      'The Jackpot Slot does NOT have a higher average. It averages $10, exactly the same as the Money Printer — it just gets there with big swings between $0 and $25.',
    )
  }
  if (input.why === 'printer-pays-less') {
    return fail(
      'misjudged-printer-payout',
      'The Money Printer does not pay less — it pays exactly $10 every run, which is the same long-run average as the Jackpot Slot. The difference is spread, not average.',
    )
  }

  return ok(
    'Both machines average $10 — the Money Printer always pays $10, and the Jackpot Slot averages 0.6 × $0 + 0.4 × $25 = $10 — but the Slot is riskier because its outcomes swing between $0 and $25 while the Printer never moves.',
    true,
  )
}

export const PROBLEM_7: CanonicalProblemDefinition = {
  problemId: 'problem-7',
  canonicalSlug: 'ev-l5-p1',
  legacyProblemId: 'l5-build-whole-ev-model',
  title: 'Same Average, Different Ride',
  concept: 'Same expected value, different risk.',
  difficulty: 7,
  scenarioText:
    'Two machines sit side by side. Game A — the 3D Money Printer pays exactly $10 every time you run it. Game B — the 3D Jackpot Slot pays $0 about 60% of the time and $25 about 40% of the time. Run each machine at least 10 times, and run at least one 100-run batch so the averages settle, then answer the questions.',
  visualType: 'same-average-ride',
  interactionType: 'qualitative-compare',
  givenData: {
    printer: { value: 10 },
    slot: { outcomes: [25, 0], probabilities: [0.4, 0.6] },
    controls: [1, 10, 100],
  },
  requiredActions: [
    'run-printer-10',
    'run-slot-10',
    'run-hundred-batch',
    'answer-same-ev',
    'answer-riskier',
    'answer-why',
  ],
  answerInputs: ['sameEV', 'riskier', 'why'],
  correctAnswers: { sameEV: 'yes', riskier: 'slot', why: 'same-avg-different-spread' },
  acceptedFormats: {
    sameEV: ['yes'],
    riskier: ['slot'],
    why: ['same-avg-different-spread'],
  },
  mistakeRules: [
    {
      mistakeType: 'claimed-different-ev',
      feedback:
        'Both machines average $10. The Money Printer is always $10; the Jackpot Slot averages 0.6 × $0 + 0.4 × $25 = $10. Run a 100-run batch and watch it settle near $10.',
    },
    {
      mistakeType: 'selected-printer-as-riskier',
      feedback:
        'The Money Printer pays $10 every time with no surprises. The Jackpot Slot is the risky one — it swings between $0 and $25.',
    },
    {
      mistakeType: 'claimed-no-risk-difference',
      feedback:
        'There is a risk difference: the Printer never changes, but the Slot jumps between $0 and $25. Same average, very different ride.',
    },
    {
      mistakeType: 'claimed-slot-higher-ev',
      feedback:
        'The Jackpot Slot is not higher on average — it also averages $10. It just reaches that average with big swings instead of a steady payout.',
    },
    {
      mistakeType: 'misjudged-printer-payout',
      feedback:
        'The Money Printer pays exactly $10 each run, the same long-run average as the Slot. The machines differ in spread (risk), not in average.',
    },
  ],
  feedback: {
    correct:
      'Both machines average $10 — the Money Printer always pays $10, and the Jackpot Slot averages 0.6 × $0 + 0.4 × $25 = $10 — but the Slot is riskier because its outcomes swing between $0 and $25 while the Printer never moves.',
  },
  teachingExplanation: {
    title: 'Same average, different risk',
    body: [
      'The 3D Money Printer pays exactly $10 on every run, so its running-average line is flat at $10 from the very first run. The 3D Jackpot Slot pays $0 about 60% of the time and $25 about 40% of the time; over many runs that averages to 0.6 × $0 + 0.4 × $25 = $10. Both machines share the same expected value.',
      'Equal expected value does not mean equal experience. The Slot’s outcomes swing all the way from $0 to $25, so its running-average line is jagged and only settles toward $10 after many runs, while the Printer never moves. That swing — the spread of possible outcomes — is what we call risk. Same average, very different ride.',
    ],
    takeaway: 'Two games can share the same expected value yet differ sharply in risk (spread).',
  },
  hints: [
    {
      id: 'p7-h1',
      label: 'Add up the Slot',
      content: 'The Jackpot Slot averages 0.6 × $0 + 0.4 × $25 = $10 — exactly the Money Printer’s steady $10.',
    },
    {
      id: 'p7-h2',
      label: 'Watch the 100-run batch',
      content: 'Run a 100-run batch on the Slot: its jagged average line settles near $10, while the Printer’s line is flat at $10 from the start.',
    },
    {
      id: 'p7-h3',
      label: 'Risk is spread',
      content: 'Risk is about how far outcomes swing. The Printer never moves; the Slot bounces between $0 and $25 — that swing makes it riskier even with the same average.',
    },
  ],
  completionRule:
    'Run each machine at least 10 times AND run at least one 100-run batch, then answer that the machines have the same average (Yes), the Jackpot Slot is riskier, and the reason is the same average but the Slot varies $0–$25 while the Printer is always $10.',
  masteryTags: ['same-ev-different-risk'],
}
