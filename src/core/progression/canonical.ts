// Canonical 15-problem chapter model (Agent 1 — Core Architecture).
//
// This is the single source of truth for the five-lesson active problem
// progression. Ordering is driven by `globalProblemIndex`.
//
// Backward compatibility: the original eight problems keep their stored
// `problem-N` IDs. New problems use their canonical slug (`ev-l{N}-p{M}`) as the
// storage ID. `completedProblemIds` continue to be persisted as STORAGE IDs;
// selectors normalize storage IDs <-> canonical slugs <-> legacy slugs so older
// saved progress (including removed legacy slugs) keeps resolving
// against the shrunk 15-problem model.

export interface CanonicalProblem {
  /** Stable canonical slug (`ev-l{N}-p{M}`) used for cross-agent integration. */
  canonicalSlug: string
  /**
   * Persistence ID. For the original eight problems this is the historical
   * `problem-N` ID; for new problems it equals the canonical slug.
   */
  storageId: string
  /**
   * Prior canonical slug for this problem (pre-15-problem PRD). Retained so old
   * saved progress and milestone/mastery slug lookups keep resolving.
   */
  legacyProblemId: string
  /** Lesson this problem belongs to. */
  lessonId: string
  /** 0-based lesson index within the chapter. */
  lessonIndex: number
  /** 0-based index of the problem within its lesson (0..2). */
  problemIndexWithinLesson: number
  /** 0-based index of the problem within the whole chapter. */
  globalProblemIndex: number
  /** Navigation title (structural metadata, not problem answer content). */
  title: string
  /** One-line concept summary used by navigation surfaces. */
  concept: string
}

export interface CanonicalLesson {
  lessonId: string
  title: string
  /** 1-based lesson order within the chapter. */
  order: number
  goal: string
}

export const CHAPTER_ID = 'expected-value-intro' as const

export const CANONICAL_LESSONS: readonly CanonicalLesson[] = [
  {
    lessonId: 'lesson-1',
    title: 'Expected Value as a Long-Run Average',
    order: 1,
    goal: 'Understand expected value as the average result over many repetitions.',
  },
  {
    lessonId: 'lesson-2',
    title: 'Expected Value as a Weighted Average',
    order: 2,
    goal: 'Construct expected value by pairing each outcome with its probability.',
  },
  {
    lessonId: 'lesson-3',
    title: 'Counts, Tables, and Discrete Outcomes',
    order: 3,
    goal: 'Convert physical counts into probabilities and EV contributions.',
  },
  {
    lessonId: 'lesson-4',
    title: 'Expected Payout, Expected Profit, and Fairness',
    order: 4,
    goal: 'Distinguish payout from profit, account for cost, and classify fairness.',
  },
  {
    lessonId: 'lesson-5',
    title: 'Same EV, Different Risk, and Full EV Models',
    order: 5,
    goal: 'See that equal EV does not imply equal risk, then build a full EV model.',
  },
] as const

/**
 * Raw ordered definition: [canonicalSlug, storageId, legacyProblemId, lessonId,
 * title, concept]. Storage IDs `problem-1..8` are
 * preserved for the originally-implemented problems.
 */
const RAW_ORDER: ReadonlyArray<
  readonly [
    slug: string,
    storageId: string,
    legacyProblemId: string,
    lessonId: string,
    title: string,
    concept: string,
  ]
> = [
  // Lesson 1 — Long-Run Average
  ['ev-l1-p1', 'problem-1', 'l1-long-run-average', 'lesson-1', 'Two-Dice Roll Average', 'EV is the average outcome over many repetitions.'],
  ['ev-l1-p2', 'ev-l1-p2', 'l1-unequal-spinner', 'lesson-1', 'Unequal Section Game', 'EV stays a long-run average when outcomes are not equally likely.'],
  ['ev-l1-p3', 'ev-l1-p3', 'l1-compare-spinners', 'lesson-1', 'Which Game Has the Best Long-Run Average?', 'Compare games by long-run average, not biggest prize or highest win rate.'],
  // Lesson 2 — Weighted Average
  ['ev-l2-p1', 'problem-2', 'l2-build-weighted-average', 'lesson-2', 'Claw Machine Expected Value', 'EV is a weighted average of outcomes.'],
  ['ev-l2-p2', 'ev-l2-p2', 'l2-match-outcomes-probabilities', 'lesson-2', 'Match Outcomes to Probabilities', 'Each outcome pairs with the probability of that exact outcome.'],
  ['ev-l2-p3', 'ev-l2-p3', 'l2-diagnose-bad-ev-setups', 'lesson-2', 'Diagnose Bad EV Setups', 'A complete EV model multiplies every outcome by its probability.'],
  // Lesson 3 — Counts, Tables, Discrete Outcomes
  ['ev-l3-p2', 'problem-4', 'l3-calculate-ev-from-table', 'lesson-3', 'Dealt-Hand Contributions', 'Sum each outcome × probability contribution.'],
  ['ev-l3-p3', 'ev-l3-p3', 'l3-prize-bag-ev-table', 'lesson-3', 'Mini-Deck EV Table', 'Build a complete EV table from physical counts.'],
  // Lesson 4 — Payout, Profit, Fairness
  ['ev-l4-p1', 'problem-5', 'l4-payout-vs-profit', 'lesson-4', 'Expected Payout vs Expected Profit', 'Payout and profit differ when there is a cost to play.'],
  ['ev-l4-p2', 'problem-6', 'l4-fair-favorable-unfavorable', 'lesson-4', 'Fair, Favorable, or Unfavorable?', 'Positive profit is favorable; zero is fair; negative is unfavorable.'],
  ['ev-l4-p3', 'ev-l4-p3', 'l4-choose-better-game-after-cost', 'lesson-4', 'Choose the Better Game After Cost', 'The better game is decided by expected profit, not payout alone.'],
  // Lesson 5 — Same EV, Different Risk, Full Models
  ['ev-l5-p1', 'problem-7', 'l5-build-whole-ev-model', 'lesson-5', 'Same Average, Different Ride', 'Two games can share an expected value yet differ sharply in risk.'],
  ['ev-l5-p2', 'problem-8', 'l5-same-ev-different-risk', 'lesson-5', 'Wider Spread, Same Average', 'Equal EV does not imply equal risk; wider spread means more risk.'],
  ['ev-l5-p3', 'ev-l5-p3', 'l5-final-capstone-ev-decision', 'lesson-5', 'Final Carnival Decision', 'Use payout, cost, fairness, and risk together.'],
] as const

/**
 * Removed slugs/IDs map to the canonical slug of their successor problem;
 * completion of a removed identifier counts as completion of the successor for
 * progression and percentage.
 */
export const REMOVED_SLUG_SUCCESSORS: Readonly<Record<string, string>> = {
  'l1-short-run-vs-long-run': 'ev-l1-p2',
  'l2-fill-missing-formula': 'ev-l2-p3',
  'ev-l3-p1': 'ev-l3-p2',
  'problem-3': 'ev-l3-p2',
  'l3-mystery-box-outcomes': 'ev-l3-p2',
  'l3-repair-probability-table': 'ev-l3-p3',
  'l4-find-fair-price': 'ev-l4-p3',
  'l5-low-risk-vs-high-risk': 'ev-l5-p3',
} as const

function buildCanonicalProblems(): readonly CanonicalProblem[] {
  const withinLessonCounters: Record<string, number> = {}
  return RAW_ORDER.map(
    ([canonicalSlug, storageId, legacyProblemId, lessonId, title, concept], globalProblemIndex) => {
      const lesson = CANONICAL_LESSONS.find((l) => l.lessonId === lessonId)
      if (!lesson) {
        throw new Error(`Canonical model error: unknown lessonId "${lessonId}"`)
      }
      const problemIndexWithinLesson = withinLessonCounters[lessonId] ?? 0
      withinLessonCounters[lessonId] = problemIndexWithinLesson + 1
      return {
        canonicalSlug,
        storageId,
        legacyProblemId,
        lessonId,
        lessonIndex: lesson.order - 1,
        problemIndexWithinLesson,
        globalProblemIndex,
        title,
        concept,
      }
    },
  )
}

export const CANONICAL_PROBLEMS: readonly CanonicalProblem[] = buildCanonicalProblems()

export const TOTAL_PROBLEMS = CANONICAL_PROBLEMS.length
export const TOTAL_LESSONS = CANONICAL_LESSONS.length
export const PROBLEMS_PER_LESSON = TOTAL_PROBLEMS / TOTAL_LESSONS

// ---- Lookup maps -----------------------------------------------------------

const BY_STORAGE_ID = new Map(CANONICAL_PROBLEMS.map((p) => [p.storageId, p]))
const BY_SLUG = new Map(CANONICAL_PROBLEMS.map((p) => [p.canonicalSlug, p]))
const BY_LEGACY = new Map(CANONICAL_PROBLEMS.map((p) => [p.legacyProblemId, p]))

/**
 * Resolve a problem by storage ID, canonical slug, legacy slug, or a REMOVED
 * legacy slug (which resolves to its successor problem). This is what lets old
 * saved `completedProblemIds` keep counting against the shrunk model.
 */
export function resolveCanonicalProblem(id: string): CanonicalProblem | undefined {
  const direct = BY_STORAGE_ID.get(id) ?? BY_SLUG.get(id) ?? BY_LEGACY.get(id)
  if (direct) {
    return direct
  }
  const successorSlug = REMOVED_SLUG_SUCCESSORS[id]
  if (successorSlug) {
    return BY_SLUG.get(successorSlug)
  }
  return undefined
}

/** Map a legacy/storage problem ID to its canonical slug (identity for slugs). */
export function mapLegacyProblemIdToCanonicalSlug(id: string): string | undefined {
  return resolveCanonicalProblem(id)?.canonicalSlug
}

/** Map any accepted identifier to its storage/persistence ID. */
export function mapCanonicalSlugToStorageId(slug: string): string | undefined {
  return resolveCanonicalProblem(slug)?.storageId
}

/** Normalize any accepted identifier to a storage ID (used for persistence). */
export function normalizeToStorageId(id: string): string | undefined {
  return resolveCanonicalProblem(id)?.storageId
}

/** Normalize any accepted identifier to its canonical slug. */
export function normalizeToCanonicalSlug(id: string): string | undefined {
  return resolveCanonicalProblem(id)?.canonicalSlug
}

/** 0-based ordered index within the chapter, or -1 if unrecognized. */
export function getGlobalProblemIndex(id: string): number {
  return resolveCanonicalProblem(id)?.globalProblemIndex ?? -1
}

export function getLessonById(lessonId: string): CanonicalLesson | undefined {
  return CANONICAL_LESSONS.find((l) => l.lessonId === lessonId)
}

export function getProblemsForLesson(lessonId: string): readonly CanonicalProblem[] {
  return CANONICAL_PROBLEMS.filter((p) => p.lessonId === lessonId)
}
