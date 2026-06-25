import { PROBLEM_1 } from './problem-1'
import { PROBLEM_2 } from './problem-2'
import { PROBLEM_4 } from './problem-4'
import { PROBLEM_5 } from './problem-5'
import { PROBLEM_6 } from './problem-6'
import { PROBLEM_7 } from './problem-7'
import { PROBLEM_8 } from './problem-8'
import { PROBLEM_EV_L1_P2 } from './ev-l1-p2'
import { PROBLEM_EV_L1_P3 } from './ev-l1-p3'
import { PROBLEM_EV_L2_P2 } from './ev-l2-p2'
import { PROBLEM_EV_L2_P3 } from './ev-l2-p3'
import { EV_L3_P3 } from './ev-l3-p3'
import { EV_L4_P3 } from './ev-l4-p3'
import { EV_L5_P3 } from './ev-l5-p3'
import type { ProblemDefinition } from '../../types/problem'

// Ordered by canonical chapter order (globalProblemIndex 0..14). Storage IDs for
// the original eight problems are preserved (problem-1..8); the seven others use
// their canonical slug as the storage ID.
export const ALL_PROBLEMS: ProblemDefinition[] = [
  PROBLEM_1, // ev-l1-p1
  PROBLEM_EV_L1_P2, // ev-l1-p2
  PROBLEM_EV_L1_P3, // ev-l1-p3
  PROBLEM_2, // ev-l2-p1
  PROBLEM_EV_L2_P2, // ev-l2-p2
  PROBLEM_EV_L2_P3, // ev-l2-p3
  PROBLEM_4, // ev-l3-p2
  EV_L3_P3, // ev-l3-p3
  PROBLEM_5, // ev-l4-p1
  PROBLEM_6, // ev-l4-p2
  EV_L4_P3, // ev-l4-p3
  PROBLEM_7, // ev-l5-p1
  PROBLEM_8, // ev-l5-p2
  EV_L5_P3, // ev-l5-p3
]

export function getProblemDefinition(problemId: string): ProblemDefinition | undefined {
  return ALL_PROBLEMS.find((p) => p.problemId === problemId)
}
