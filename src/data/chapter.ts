import type { ChapterProblem, MilestoneDefinition } from '../types/chapter'

export const CHAPTER_TITLE = 'Expected Value — The Average Outcome of Uncertainty'

export const CHAPTER_DESCRIPTION =
  'Eight visual, interactive problems that move you from observing a simulation to building and interpreting an expected value model.'

export const CHAPTER_PROBLEMS: ChapterProblem[] = [
  {
    problemId: 'problem-1',
    title: 'The Long-Run Average',
    concept: 'EV is the average outcome over many repetitions.',
    order: 1,
  },
  {
    problemId: 'problem-2',
    title: 'Build the Weighted Average',
    concept: 'EV is a weighted average of outcomes.',
    order: 2,
  },
  {
    problemId: 'problem-3',
    title: 'Mystery Box Outcomes',
    concept: 'EV can be calculated from counts, not just percentages.',
    order: 3,
  },
  {
    problemId: 'problem-4',
    title: 'Calculate EV from the Table',
    concept: 'Sum each outcome × probability contribution.',
    order: 4,
  },
  {
    problemId: 'problem-5',
    title: 'Expected Payout vs Expected Profit',
    concept: 'Payout and profit differ when there is a cost to play.',
    order: 5,
  },
  {
    problemId: 'problem-6',
    title: 'Fair, Favorable, or Unfavorable?',
    concept: 'Positive expected profit is favorable; zero is fair; negative is unfavorable.',
    order: 6,
  },
  {
    problemId: 'problem-7',
    title: 'Build the Whole EV Model',
    concept: 'Independently convert a game into an EV calculation.',
    order: 7,
  },
  {
    problemId: 'problem-8',
    title: 'Same Expected Value, Different Risk',
    concept: 'EV does not describe the full experience of uncertainty.',
    order: 8,
  },
]

export const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  {
    id: 'chapter-started',
    label: 'Chapter started',
    description: 'Opened the Expected Value chapter.',
  },
  {
    id: 'first-problem-complete',
    label: 'First win',
    description: 'Completed your first problem.',
  },
  {
    id: 'half-chapter',
    label: 'Halfway there',
    description: 'Completed 4 of 8 problems.',
  },
  {
    id: 'chapter-complete',
    label: 'Chapter complete',
    description: 'Finished all 8 problems.',
  },
  {
    id: 'chapter-mastered',
    label: 'Chapter mastered',
    description: 'Met mastery criteria for this chapter.',
  },
]

export function getProblemById(problemId: string): ChapterProblem | undefined {
  return CHAPTER_PROBLEMS.find((p) => p.problemId === problemId)
}

export function getContinueProblemId(progress: {
  currentProblemIndex: number
  completedProblemIds: string[]
}): string {
  const nextIncomplete = CHAPTER_PROBLEMS.find(
    (p) => !progress.completedProblemIds.includes(p.problemId),
  )
  if (nextIncomplete) {
    return nextIncomplete.problemId
  }
  return CHAPTER_PROBLEMS[progress.currentProblemIndex]?.problemId ?? CHAPTER_PROBLEMS[0].problemId
}
