const MINUTE = 60 * 1000
const DAY = 24 * 60 * MINUTE

function addMs(isoDate: string, ms: number): string {
  return new Date(new Date(isoDate).getTime() + ms).toISOString()
}

export function clampScore(score: number): number {
  return Math.max(0, Math.min(1, Number(score.toFixed(3))))
}

export function reviewIntervalMs(score: number): number {
  if (score < 0.35) {
    return 10 * MINUTE
  }
  if (score < 0.55) {
    return DAY
  }
  if (score < 0.75) {
    return 3 * DAY
  }
  if (score < 0.9) {
    return 7 * DAY
  }
  return 14 * DAY
}

export function scheduleNextReview(args: {
  score: number
  practicedAt: string
  wasCorrect: boolean
  /** A repeat of a recent mistake type pulls the retry forward (5 vs 10 min). */
  repeatedMistake?: boolean
}): string {
  if (!args.wasCorrect) {
    return addMs(args.practicedAt, (args.repeatedMistake ? 5 : 10) * MINUTE)
  }
  return addMs(args.practicedAt, reviewIntervalMs(args.score))
}

export function targetDifficultyForScore(score: number): number {
  return Math.max(1, Math.min(5, Math.round(1 + clampScore(score) * 4)))
}

export function isReviewDue(nextReviewAt: string, nowIso: string): boolean {
  return new Date(nextReviewAt).getTime() <= new Date(nowIso).getTime()
}

/**
 * Amount of scaffolding a learner needs at a given mastery level. Ordered from
 * most support to least: `guided` (<0.4) walks through the approach, `supported`
 * (0.4–0.7) keeps hints on tap, `independent` (>0.7) removes the scaffold.
 */
export type ScaffoldTier = 'guided' | 'supported' | 'independent'

export function scaffoldTierForScore(score: number): ScaffoldTier {
  const clamped = clampScore(score)
  if (clamped < 0.4) {
    return 'guided'
  }
  if (clamped > 0.7) {
    return 'independent'
  }
  return 'supported'
}
