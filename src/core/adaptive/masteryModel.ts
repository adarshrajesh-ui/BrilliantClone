import type { ProblemAttempt } from '../../types/problem'
import { isGradedAttemptMode } from '../persistence/migration'
import { normalizeSkillIds, SKILL_CATALOG } from './skillCatalog'
import { clampScore, scheduleNextReview } from './scheduler'
import type { SkillId, SkillState } from './types'

const INITIAL_SCORE = 0.2
const MAX_RECENT_MISTAKES = 5

export function createInitialSkillState(skillId: SkillId, nowIso: string): SkillState {
  return {
    skillId,
    score: INITIAL_SCORE,
    evidenceCount: 0,
    lastPracticedAt: null,
    nextReviewAt: nowIso,
    consecutiveCorrect: 0,
    recentMistakeTypes: [],
  }
}

export function createInitialSkillStates(nowIso: string): Record<SkillId, SkillState> {
  return Object.fromEntries(
    SKILL_CATALOG.map((skill) => [skill.skillId, createInitialSkillState(skill.skillId, nowIso)]),
  ) as Record<SkillId, SkillState>
}

function scoreDeltaForAttempt(attempt: ProblemAttempt, repeatedMistake: boolean): number {
  const graded = isGradedAttemptMode(attempt.attemptMode)
  if (attempt.isCorrect) {
    if (!graded) {
      return 0.06
    }
    return attempt.hintUsed ? 0.08 : 0.18
  }
  if (!graded) {
    return -0.03
  }
  return repeatedMistake ? -0.15 : -0.1
}

/**
 * Advance a single skill's state by one graded attempt. Exported so the live
 * Practice session can move a skill's `score` / `nextReviewAt` immediately after
 * an answer using the EXACT logic `deriveSkillStates` replays from history, so an
 * in-session update and a later cold derive land on the same state.
 */
export function updateSkillState(state: SkillState, attempt: ProblemAttempt): SkillState {
  const mistakeType = attempt.mistakeType && attempt.mistakeType.length > 0
    ? attempt.mistakeType
    : null
  const repeatedMistake = mistakeType ? state.recentMistakeTypes.includes(mistakeType) : false
  const nextScore = clampScore(state.score + scoreDeltaForAttempt(attempt, repeatedMistake))
  const recentMistakeTypes = mistakeType
    ? [mistakeType, ...state.recentMistakeTypes.filter((type) => type !== mistakeType)].slice(
        0,
        MAX_RECENT_MISTAKES,
      )
    : state.recentMistakeTypes

  return {
    ...state,
    score: nextScore,
    evidenceCount: state.evidenceCount + 1,
    lastPracticedAt: attempt.createdAt,
    nextReviewAt: scheduleNextReview({
      score: nextScore,
      practicedAt: attempt.createdAt,
      wasCorrect: attempt.isCorrect,
      repeatedMistake,
    }),
    consecutiveCorrect: attempt.isCorrect ? state.consecutiveCorrect + 1 : 0,
    recentMistakeTypes,
  }
}

export function deriveSkillStates(
  attempts: readonly ProblemAttempt[],
  nowIso = new Date().toISOString(),
): Record<SkillId, SkillState> {
  const states = createInitialSkillStates(nowIso)
  const finalAttempts = [...attempts]
    .filter((attempt) => attempt.stepId === 'final')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  for (const attempt of finalAttempts) {
    const skillIds = normalizeSkillIds(attempt.masteryTagsTested)
    for (const skillId of skillIds) {
      states[skillId] = updateSkillState(states[skillId], attempt)
    }
  }

  return states
}
