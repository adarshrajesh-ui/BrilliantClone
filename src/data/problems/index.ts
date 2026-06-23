import { PROBLEM_1 } from './problem-1'
import { PROBLEM_2 } from './problem-2'
import { PROBLEM_3 } from './problem-3'
import { PROBLEM_4 } from './problem-4'
import { PROBLEM_5 } from './problem-5'
import { PROBLEM_6 } from './problem-6'
import { PROBLEM_7 } from './problem-7'
import { PROBLEM_8 } from './problem-8'
import type { ProblemDefinition } from '../../types/problem'

export const ALL_PROBLEMS: ProblemDefinition[] = [
  PROBLEM_1,
  PROBLEM_2,
  PROBLEM_3,
  PROBLEM_4,
  PROBLEM_5,
  PROBLEM_6,
  PROBLEM_7,
  PROBLEM_8,
]

export function getProblemDefinition(problemId: string): ProblemDefinition | undefined {
  return ALL_PROBLEMS.find((p) => p.problemId === problemId)
}
