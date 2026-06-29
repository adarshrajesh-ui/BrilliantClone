// Pure theme-rotation model for the Practice "Start" flow. No React, no I/O.
// The rotation decides which templateKind is generated and which skill mastery
// the attempt is recorded against; the adaptive engine still sets difficulty.

import type { PracticeRecommendation, SkillId, SkillState } from '../../core/adaptive/types'
import { isReviewDue, targetDifficultyForScore } from '../../core/adaptive/scheduler'
import type { PracticeSelectionReason } from '../../types/problem'
import type { GeneratedTemplateKind } from './generatedPractice'

/**
 * Skill families group themes that exercise the same underlying idea so the
 * session scheduler can interleave related-but-distinct surfaces and cap how
 * often one family dominates. Used for cousin-problem review and diversity caps.
 */
export type PracticeFamily = 'probability' | 'ev-setup' | 'net-value' | 'comparison'

export const FAMILY_LABEL: Record<PracticeFamily, string> = {
  probability: 'Probability from counts',
  'ev-setup': 'Expected value setup',
  'net-value': 'Net value & fairness',
  comparison: 'Comparison & risk',
}

export interface PracticeTheme {
  id: string
  label: string
  templateKind: GeneratedTemplateKind
  skillId: SkillId
  /** Skill family used for interleaving + diversity caps. */
  family: PracticeFamily
}

/** Themes in fixed rotation order. Extend by appending new entries. */
export const PRACTICE_THEMES: PracticeTheme[] = [
  {
    id: 'card-hand-ev',
    label: 'Card Hands',
    templateKind: 'card-hand-ev',
    skillId: 'ev-from-table',
    family: 'probability',
  },
  {
    id: 'dice-ev',
    label: 'Dice Roll',
    templateKind: 'dice-ev',
    skillId: 'long-run-average',
    family: 'ev-setup',
  },
  {
    id: 'card-deck-ev',
    label: 'Deck Draw',
    templateKind: 'card-deck-ev',
    skillId: 'probability-from-counts',
    family: 'probability',
  },
  {
    id: 'profession-payout',
    label: 'Payday',
    templateKind: 'profession-payout',
    skillId: 'weighted-average',
    family: 'ev-setup',
  },
  {
    id: 'payout-vs-profit',
    label: 'Profit After Cost',
    templateKind: 'payout-vs-profit',
    skillId: 'payout-vs-profit',
    family: 'net-value',
  },
  {
    id: 'fairness-classification',
    label: 'Fair or Not?',
    templateKind: 'fairness-classification',
    skillId: 'fairness-classification',
    family: 'net-value',
  },
  {
    id: 'compare-ev',
    label: 'Better Game',
    templateKind: 'compare-ev',
    skillId: 'compare-ev',
    family: 'comparison',
  },
  {
    id: 'same-ev-risk',
    label: 'Riskier Bet',
    templateKind: 'same-ev-risk',
    skillId: 'same-ev-different-risk',
    family: 'comparison',
  },
  {
    id: 'fair-price-to-play',
    label: 'Fair Price',
    templateKind: 'fair-price-to-play',
    skillId: 'payout-vs-profit',
    family: 'ev-setup',
  },
]

const THEME_BY_ID: Record<string, PracticeTheme> = Object.fromEntries(
  PRACTICE_THEMES.map((theme) => [theme.id, theme]),
)

/** The family a theme id belongs to (undefined for unknown ids). */
export function familyForThemeId(themeId: string): PracticeFamily | undefined {
  return THEME_BY_ID[themeId]?.family
}

/** Sibling themes in the same family, excluding the given theme id. */
export function cousinThemesFor(themeId: string): PracticeTheme[] {
  const family = familyForThemeId(themeId)
  if (!family) {
    return []
  }
  return PRACTICE_THEMES.filter((theme) => theme.family === family && theme.id !== themeId)
}

/** Resolve a theme for any integer index (wraps safely, including negatives). */
export function themeAt(index: number): PracticeTheme {
  const length = PRACTICE_THEMES.length
  const wrapped = ((Math.trunc(index) % length) + length) % length
  return PRACTICE_THEMES[wrapped]
}

/** The next rotation index. themeAt wraps, so this can grow without bound. */
export function nextThemeIndex(index: number): number {
  return Math.trunc(index) + 1
}

/** Difficulty seed for the rotation: the top recommendation's target, else 2. */
export function difficultyForPlan(plan: PracticeRecommendation[]): number {
  return plan[0]?.targetDifficulty ?? 2
}

// --- Balanced, mastery-driven theme selection -------------------------------
// `selectNextTheme` avoids only an immediate back-to-back repeat of the single
// most-recent theme, then lets spaced retrieval win: among themes whose review
// window is due it takes the MOST overdue (ties → weakest skill, then least
// recently shown). With nothing due it falls back to highest-need rotation.
// Pure: no React, no I/O.

/** Extra need for a skill whose spaced-repetition review is due. */
const DUE_REVIEW_BONUS = 0.5

/** How much a theme's mapped skill needs practice: weaker score + due bonus. */
function baseNeed(
  theme: PracticeTheme,
  skillStates: Record<SkillId, SkillState>,
  nowIso: string,
): number {
  const state = skillStates[theme.skillId]
  const score = state?.score ?? 0
  let need = 1 - score
  if (state && isReviewDue(state.nextReviewAt, nowIso)) {
    need += DUE_REVIEW_BONUS
  }
  return need
}

/** Epoch ms of a theme skill's next review (0 when unknown = maximally overdue). */
function reviewDueTime(theme: PracticeTheme, skillStates: Record<SkillId, SkillState>): number {
  const nextReviewAt = skillStates[theme.skillId]?.nextReviewAt
  return nextReviewAt ? new Date(nextReviewAt).getTime() : 0
}

/** Position in the recent list; not-recent sorts last (least recently shown). */
function recencyRank(themeId: string, recentThemeIds: string[]): number {
  const index = recentThemeIds.indexOf(themeId)
  return index === -1 ? Number.POSITIVE_INFINITY : index
}

/**
 * Pick the more urgent of two due themes: most overdue first, then the skill that
 * needs the most work, then the least recently shown. Returns `best` on a full
 * tie so the earliest PRACTICE_THEMES entry wins.
 */
function moreUrgentReview(
  best: PracticeTheme,
  candidate: PracticeTheme,
  skillStates: Record<SkillId, SkillState>,
  recentThemeIds: string[],
  nowIso: string,
): PracticeTheme {
  const dueDelta = reviewDueTime(candidate, skillStates) - reviewDueTime(best, skillStates)
  if (dueDelta !== 0) {
    return dueDelta < 0 ? candidate : best
  }
  const needDelta = baseNeed(candidate, skillStates, nowIso) - baseNeed(best, skillStates, nowIso)
  if (needDelta !== 0) {
    return needDelta > 0 ? candidate : best
  }
  const recencyDelta =
    recencyRank(candidate.id, recentThemeIds) - recencyRank(best.id, recentThemeIds)
  return recencyDelta > 0 ? candidate : best
}

// --- Session diversity constraints ------------------------------------------
// `recentThemeIds` is the raw, most-recent-first session log (no de-duplication).

/** A theme cannot repeat within this many questions. */
const THEME_COOLDOWN = 3
/** Look-back window for the per-family cap. */
const FAMILY_WINDOW = 6
/** Max questions from one family inside FAMILY_WINDOW. */
const FAMILY_WINDOW_CAP = 3
/** Look-back window for the per-skill session cap. */
const SESSION_WINDOW = 10
/** Max questions from one skill inside SESSION_WINDOW (50% of the window). */
const SKILL_SESSION_CAP = Math.floor(SESSION_WINDOW * 0.5)

export interface SelectNextThemeOptions {
  /** When the previous answer was wrong, steer toward a same-family cousin. */
  cousinThemeId?: string | null
  /** Drill Mode lifts the per-skill session cap so one skill can dominate. */
  drillMode?: boolean
}

function countInWindow(log: string[], window: number, matches: (id: string) => boolean): number {
  let count = 0
  for (let i = 0; i < Math.min(window, log.length); i += 1) {
    if (matches(log[i])) {
      count += 1
    }
  }
  return count
}

interface PoolConstraints {
  cooldown: number
  enforceFamilyCap: boolean
  enforceSkillCap: boolean
}

function buildPool(log: string[], constraints: PoolConstraints): PracticeTheme[] {
  const cooldownIds = new Set(log.slice(0, constraints.cooldown))
  return PRACTICE_THEMES.filter((theme) => {
    if (cooldownIds.has(theme.id)) {
      return false
    }
    if (constraints.enforceFamilyCap) {
      const familyCount = countInWindow(
        log,
        FAMILY_WINDOW - 1,
        (id) => familyForThemeId(id) === theme.family,
      )
      if (familyCount >= FAMILY_WINDOW_CAP) {
        return false
      }
    }
    if (constraints.enforceSkillCap) {
      const skillCount = countInWindow(
        log,
        SESSION_WINDOW - 1,
        (id) => THEME_BY_ID[id]?.skillId === theme.skillId,
      )
      if (skillCount >= SKILL_SESSION_CAP) {
        return false
      }
    }
    return true
  })
}

/**
 * Build the eligible pool under diversity caps, relaxing one constraint at a
 * time so a pick is always available: skill cap → family cap → cooldown to 1 →
 * everything. Drill Mode skips the skill cap entirely.
 */
function eligiblePool(log: string[], options: SelectNextThemeOptions): PracticeTheme[] {
  const enforceSkillCap = !options.drillMode
  const ladder: PoolConstraints[] = [
    { cooldown: THEME_COOLDOWN, enforceFamilyCap: true, enforceSkillCap },
    { cooldown: THEME_COOLDOWN, enforceFamilyCap: true, enforceSkillCap: false },
    { cooldown: THEME_COOLDOWN, enforceFamilyCap: false, enforceSkillCap: false },
    { cooldown: 1, enforceFamilyCap: false, enforceSkillCap: false },
  ]
  for (const constraints of ladder) {
    const pool = buildPool(log, constraints)
    if (pool.length > 0) {
      return pool
    }
  }
  return PRACTICE_THEMES
}

/** Pick the highest-need / most-overdue theme inside an already-constrained pool. */
function pickFromPool(
  pool: PracticeTheme[],
  skillStates: Record<SkillId, SkillState>,
  log: string[],
  nowIso: string,
): PracticeTheme {
  const due = pool.filter((theme) => {
    const state = skillStates[theme.skillId]
    return state ? isReviewDue(state.nextReviewAt, nowIso) : false
  })
  if (due.length > 0) {
    return due.reduce(
      (best, theme) => moreUrgentReview(best, theme, skillStates, log, nowIso),
      due[0],
    )
  }
  return pool.reduce(
    (best, theme) =>
      baseNeed(theme, skillStates, nowIso) > baseNeed(best, skillStates, nowIso) ? theme : best,
    pool[0],
  )
}

/**
 * Session-aware theme selection. Applies a diversity ladder (no theme within 3
 * questions, no family more than 3 of any 6, no weak skill past 50% of a 10-
 * question window) and, right after a miss, prefers a same-family cousin so the
 * concept is re-tested on a fresh surface instead of the identical template.
 * Inside the constrained pool, due reviews win, then highest mastery need.
 */
export function selectNextTheme(
  skillStates: Record<SkillId, SkillState>,
  recentThemeIds: string[],
  options: SelectNextThemeOptions = {},
): PracticeTheme {
  const nowIso = new Date().toISOString()
  const pool = eligiblePool(recentThemeIds, options)

  if (options.cousinThemeId) {
    const cousinIds = new Set(cousinThemesFor(options.cousinThemeId).map((theme) => theme.id))
    const cousinPool = pool.filter((theme) => cousinIds.has(theme.id))
    if (cousinPool.length > 0) {
      return pickFromPool(cousinPool, skillStates, recentThemeIds, nowIso)
    }
  }

  return pickFromPool(pool, skillStates, recentThemeIds, nowIso)
}

/**
 * Why a question was selected, used for the question header. `cousin` is a
 * same-family transfer check right after a miss; `due-review` is a genuine
 * spaced re-encounter; `weak-skill` strengthens a low skill; `mixed` interleaves
 * to keep coverage balanced; `new-skill` is a first look.
 */
export type SelectionKind = PracticeSelectionReason

export interface SelectionInfo {
  isReview: boolean
  reason: string
  kind: SelectionKind
}

/**
 * Human-readable why-this-theme for the question header. When `cousinOfThemeId`
 * is the theme the learner just missed and this theme is a same-family cousin,
 * the pick is explained as related transfer practice. Otherwise `isReview` is
 * true only when the skill already has evidence AND its review window is due.
 */
export function describeSelection(
  theme: PracticeTheme,
  skillStates: Record<SkillId, SkillState>,
  nowIso: string,
  cousinOfThemeId?: string | null,
): SelectionInfo {
  if (cousinOfThemeId) {
    const family = familyForThemeId(cousinOfThemeId)
    if (family && familyForThemeId(theme.id) === family && theme.id !== cousinOfThemeId) {
      return {
        isReview: false,
        kind: 'cousin',
        reason: `Related practice — same idea (${FAMILY_LABEL[family]}) on a new surface`,
      }
    }
  }

  const state = skillStates[theme.skillId]
  const hasHistory = (state?.evidenceCount ?? 0) > 0
  const due = state ? isReviewDue(state.nextReviewAt, nowIso) : false

  if (state && hasHistory && due) {
    const missedRecently = state.recentMistakeTypes.length > 0 || state.score < 0.4
    return {
      isReview: true,
      kind: 'due-review',
      reason: missedRecently
        ? 'Due for review — you missed this recently'
        : 'Due for review — spaced practice keeps it sharp',
    }
  }

  if (hasHistory && (state?.score ?? 1) < 0.4) {
    return {
      isReview: false,
      kind: 'weak-skill',
      reason: 'Strengthening a skill you’re still building',
    }
  }

  return {
    isReview: false,
    kind: hasHistory ? 'mixed' : 'new-skill',
    reason: hasHistory
      ? 'Mixing in review to keep your coverage balanced'
      : 'New skill to build up',
  }
}

/** Per-skill target difficulty (1-5) for a theme, from its current mastery. */
export function difficultyForTheme(
  skillStates: Record<SkillId, SkillState>,
  theme: PracticeTheme,
): number {
  return targetDifficultyForScore(skillStates[theme.skillId]?.score ?? 0)
}
