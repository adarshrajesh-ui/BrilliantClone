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
}): string {
  if (!args.wasCorrect) {
    return addMs(args.practicedAt, 10 * MINUTE)
  }
  return addMs(args.practicedAt, reviewIntervalMs(args.score))
}

export function targetDifficultyForScore(score: number): number {
  return Math.max(1, Math.min(5, Math.round(1 + clampScore(score) * 4)))
}

export function isReviewDue(nextReviewAt: string, nowIso: string): boolean {
  return new Date(nextReviewAt).getTime() <= new Date(nowIso).getTime()
}
