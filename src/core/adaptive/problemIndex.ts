import { ALL_PROBLEMS } from '../../data/problems'
import {
  getGlobalProblemIndex,
  resolveCanonicalProblem,
} from '../progression/canonical'
import { normalizeSkillIds } from './skillCatalog'
import type { PracticeCandidate } from './types'

export function buildPracticeCandidates(): PracticeCandidate[] {
  return ALL_PROBLEMS.flatMap((problem) => {
    const meta = resolveCanonicalProblem(problem.problemId)
    const skillIds = normalizeSkillIds(problem.masteryTags)
    if (!meta || skillIds.length === 0) {
      return []
    }

    return [
      {
        problemId: problem.problemId,
        canonicalSlug: meta.canonicalSlug,
        title: problem.title,
        concept: problem.concept,
        difficulty: problem.difficulty,
        globalProblemIndex: getGlobalProblemIndex(problem.problemId),
        lessonId: meta.lessonId,
        skillIds,
      },
    ]
  })
}
