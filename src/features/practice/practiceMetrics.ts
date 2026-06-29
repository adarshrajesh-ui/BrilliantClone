// Pure reporting over recorded Practice Mode attempts. No React, no I/O — feed it
// `ProblemAttempt[]` (e.g. from problemAttemptService) and it answers the Phase 3
// measurement questions:
//   - Are delayed reviews improving without more hints?  → dueReviewAccuracy
//   - Are weak skills repeating too much?                → repetition + family share
//   - Does difficulty 4 reduce accuracy or just relabel? → difficultyAccuracyBands
// Only attempts carrying a `practice` payload are considered; chapter attempts
// (no payload) are ignored so the two flows never contaminate each other.

import type { PracticeAttemptMeta, ProblemAttempt } from '../../types/problem'

/** A practice attempt known to carry its analytics payload. */
export type PracticeAttemptRecord = ProblemAttempt & { practice: PracticeAttemptMeta }

/** First-try, no-hint correctness target band for desirable difficulty. */
export const DIFFICULTY_TARGET_BAND = { min: 0.65, max: 0.85 } as const

export interface AccuracyStat {
  attempts: number
  correct: number
  /** correct / attempts, or 0 when there are no attempts. */
  accuracy: number
}

export interface DifficultyBandStat extends AccuracyStat {
  difficulty: number
  /** Whether first-try no-hint accuracy sits inside DIFFICULTY_TARGET_BAND. */
  inTargetBand: boolean
}

export interface RecurrenceStat {
  skill: string
  /** Total graded wrong attempts for the skill. */
  wrong: number
  /** Wrong attempts whose mistakeType had already occurred for this skill. */
  repeated: number
  /** repeated / wrong, or 0 when there are no wrong attempts. */
  recurrenceRate: number
}

export interface ConversionStat {
  /** Distinct wrong attempts that had a later correct attempt for the same skill. */
  converted: number
  /** Total wrong attempts considered. */
  wrong: number
  /** converted / wrong, or 0 when there are no wrong attempts. */
  conversionRate: number
}

/** Keep only attempts that carry the practice analytics payload. */
export function withPracticeMeta(attempts: ProblemAttempt[]): PracticeAttemptRecord[] {
  return attempts.filter((attempt): attempt is PracticeAttemptRecord => attempt.practice != null)
}

/** Stable chronological order (createdAt, then attemptId) so replays are deterministic. */
function chronological(records: PracticeAttemptRecord[]): PracticeAttemptRecord[] {
  return [...records].sort((a, b) => {
    const at = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    return at !== 0 ? at : a.attemptId.localeCompare(b.attemptId)
  })
}

function statOf(records: PracticeAttemptRecord[]): AccuracyStat {
  const attempts = records.length
  const correct = records.filter((record) => record.isCorrect).length
  return { attempts, correct, accuracy: attempts === 0 ? 0 : correct / attempts }
}

/** A clean retrieval signal: first attempt on the question, no hints revealed. */
function isFirstTryNoHint(record: PracticeAttemptRecord): boolean {
  return record.attemptNumber === 1 && record.practice.hintCount === 0
}

/**
 * Due-review, no-hint, first-try accuracy. This is the headline retention metric:
 * how well the learner recalls a skill when it resurfaces, unaided.
 */
export function dueReviewAccuracy(attempts: ProblemAttempt[]): AccuracyStat {
  return statOf(
    withPracticeMeta(attempts).filter(
      (record) => record.practice.isReview && isFirstTryNoHint(record),
    ),
  )
}

/**
 * First-try, no-hint accuracy bucketed by difficulty, each flagged against the
 * desirable-difficulty band. Lets us see whether higher difficulty actually
 * lowers accuracy (real demand) rather than only changing the label.
 */
export function difficultyAccuracyBands(attempts: ProblemAttempt[]): DifficultyBandStat[] {
  const cleanByDifficulty = new Map<number, PracticeAttemptRecord[]>()
  for (const record of withPracticeMeta(attempts)) {
    if (!isFirstTryNoHint(record)) {
      continue
    }
    const bucket = cleanByDifficulty.get(record.practice.difficulty) ?? []
    bucket.push(record)
    cleanByDifficulty.set(record.practice.difficulty, bucket)
  }
  return [...cleanByDifficulty.entries()]
    .sort(([a], [b]) => a - b)
    .map(([difficulty, records]) => {
      const stat = statOf(records)
      return {
        difficulty,
        ...stat,
        inTargetBand:
          stat.attempts > 0 &&
          stat.accuracy >= DIFFICULTY_TARGET_BAND.min &&
          stat.accuracy <= DIFFICULTY_TARGET_BAND.max,
      }
    })
}

/**
 * Per-skill recurrence of the SAME mistake type. A wrong attempt counts as
 * "repeated" when that mistakeType already appeared earlier for the skill, so a
 * high recurrence rate flags a misconception that feedback is not repairing.
 */
export function repeatedMistakeBySkill(attempts: ProblemAttempt[]): RecurrenceStat[] {
  const seenMistakes = new Map<string, Set<string>>()
  const totals = new Map<string, { wrong: number; repeated: number }>()

  for (const record of chronological(withPracticeMeta(attempts))) {
    if (record.isCorrect || !record.mistakeType) {
      continue
    }
    for (const skill of record.masteryTagsTested) {
      const seen = seenMistakes.get(skill) ?? new Set<string>()
      const tally = totals.get(skill) ?? { wrong: 0, repeated: 0 }
      tally.wrong += 1
      if (seen.has(record.mistakeType)) {
        tally.repeated += 1
      }
      seen.add(record.mistakeType)
      seenMistakes.set(skill, seen)
      totals.set(skill, tally)
    }
  }

  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([skill, { wrong, repeated }]) => ({
      skill,
      wrong,
      repeated,
      recurrenceRate: wrong === 0 ? 0 : repeated / wrong,
    }))
}

/**
 * Wrong-to-correct conversion: of all wrong attempts, how many had a later
 * correct attempt on the same skill. Answers "did feedback eventually land?".
 */
export function wrongToCorrectConversion(attempts: ProblemAttempt[]): ConversionStat {
  const ordered = chronological(withPracticeMeta(attempts))
  // Latest correct timestamp per skill, scanned from the end so each wrong
  // attempt can ask "was this skill answered correctly after me?".
  const lastCorrectAt = new Map<string, number>()
  for (let i = ordered.length - 1; i >= 0; i -= 1) {
    const record = ordered[i]
    if (!record.isCorrect) {
      continue
    }
    const time = new Date(record.createdAt).getTime()
    for (const skill of record.masteryTagsTested) {
      if (!lastCorrectAt.has(skill)) {
        lastCorrectAt.set(skill, time)
      }
    }
  }

  let wrong = 0
  let converted = 0
  for (const record of ordered) {
    if (record.isCorrect) {
      continue
    }
    wrong += 1
    const time = new Date(record.createdAt).getTime()
    const recovered = record.masteryTagsTested.some((skill) => (lastCorrectAt.get(skill) ?? -1) > time)
    if (recovered) {
      converted += 1
    }
  }

  return { converted, wrong, conversionRate: wrong === 0 ? 0 : converted / wrong }
}

/**
 * Transfer accuracy: once a skill family has at least one success, accuracy on a
 * DIFFERENT template within that same family. High transfer means the learner
 * grasped the idea, not just one template's surface.
 */
export function transferAccuracyAfterSuccess(attempts: ProblemAttempt[]): AccuracyStat {
  const succeededTemplates = new Map<string, Set<string>>()
  const transferRecords: PracticeAttemptRecord[] = []

  for (const record of chronological(withPracticeMeta(attempts))) {
    const family = record.practice.skillFamily
    const template = record.practice.templateKind
    const priorTemplates = succeededTemplates.get(family) ?? new Set<string>()
    // A transfer probe: family already had a success on some OTHER template.
    const hasOtherSuccess = [...priorTemplates].some((prior) => prior !== template)
    if (hasOtherSuccess) {
      transferRecords.push(record)
    }
    if (record.isCorrect) {
      priorTemplates.add(template)
      succeededTemplates.set(family, priorTemplates)
    }
  }

  return statOf(transferRecords)
}

/** Repetition rate of an ordered sequence: 1 - distinct/total (0 for <2 items). */
export function sequenceRepetitionRate(sequence: string[]): number {
  if (sequence.length < 2) {
    return 0
  }
  return 1 - new Set(sequence).size / sequence.length
}

/** Largest count of any single value inside a sliding window of the sequence. */
export function maxInWindow(sequence: string[], windowSize: number): number {
  let max = 0
  for (let start = 0; start < sequence.length; start += 1) {
    const window = sequence.slice(start, start + windowSize)
    const counts = new Map<string, number>()
    for (const value of window) {
      const next = (counts.get(value) ?? 0) + 1
      counts.set(value, next)
      max = Math.max(max, next)
    }
  }
  return max
}

/** Fraction of practice attempts contributed by each key (template or family). */
function shareBy(
  records: PracticeAttemptRecord[],
  keyOf: (record: PracticeAttemptRecord) => string,
): Record<string, number> {
  const counts = new Map<string, number>()
  for (const record of records) {
    counts.set(keyOf(record), (counts.get(keyOf(record)) ?? 0) + 1)
  }
  const total = records.length
  const share: Record<string, number> = {}
  for (const [key, count] of counts) {
    share[key] = total === 0 ? 0 : count / total
  }
  return share
}

export interface PracticeMetricsSummary {
  totalAttempts: number
  dueReview: AccuracyStat
  difficultyBands: DifficultyBandStat[]
  repeatedMistakes: RecurrenceStat[]
  conversion: ConversionStat
  transfer: AccuracyStat
  templateShare: Record<string, number>
  familyShare: Record<string, number>
  /** Repetition rate across the full chronological template sequence. */
  templateRepetitionRate: number
}

/** One call that bundles every Phase 3 practice metric for a learner's attempts. */
export function summarizePracticeMetrics(attempts: ProblemAttempt[]): PracticeMetricsSummary {
  const records = chronological(withPracticeMeta(attempts))
  return {
    totalAttempts: records.length,
    dueReview: dueReviewAccuracy(attempts),
    difficultyBands: difficultyAccuracyBands(attempts),
    repeatedMistakes: repeatedMistakeBySkill(attempts),
    conversion: wrongToCorrectConversion(attempts),
    transfer: transferAccuracyAfterSuccess(attempts),
    templateShare: shareBy(records, (record) => record.practice.templateKind),
    familyShare: shareBy(records, (record) => record.practice.skillFamily),
    templateRepetitionRate: sequenceRepetitionRate(
      records.map((record) => record.practice.templateKind),
    ),
  }
}
