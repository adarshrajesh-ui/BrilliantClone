// Canonical 20-problem chapter model (Agent 1 — Core Architecture).
//
// This is the single source of truth for the five-lesson / twenty-problem
// ordered progression. Ordering is driven by `globalProblemIndex` (0-based).
//
// Backward compatibility: the original eight problems keep their stored
// `problem-N` IDs. New problems use their canonical slug as the storage ID.
// `completedProblemIds` continue to be persisted as STORAGE IDs; selectors
// normalize storage IDs <-> canonical slugs so older saved progress keeps
// resolving against the expanded model.

export interface CanonicalProblem {
  /** Stable, human-readable semantic slug used for cross-agent integration. */
  canonicalSlug: string
  /**
   * Persistence ID. For the original eight problems this is the historical
   * `problem-N` ID; for new problems it equals the canonical slug.
   */
  storageId: string
  /** Lesson this problem belongs to. */
  lessonId: string
  /** 0-based lesson index within the chapter. */
  lessonIndex: number
  /** 0-based index of the problem within its lesson (0..3). */
  problemIndexWithinLesson: number
  /** 0-based index of the problem within the whole chapter (0..19). */
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
    goal: 'Build full EV models and see that equal EV does not imply equal risk.',
  },
] as const

/** Raw ordered definition: [canonicalSlug, storageId, lessonId, title, concept]. */
const RAW_ORDER: ReadonlyArray<
  readonly [slug: string, storageId: string, lessonId: string, title: string, concept: string]
> = [
  // Lesson 1 — Long-Run Average
  ['l1-long-run-average', 'problem-1', 'lesson-1', 'The Long-Run Average', 'EV is the average outcome over many repetitions.'],
  ['l1-unequal-spinner', 'l1-unequal-spinner', 'lesson-1', 'Unequal Spinner Simulation', 'EV stays a long-run average when outcomes are not equally likely.'],
  ['l1-short-run-vs-long-run', 'l1-short-run-vs-long-run', 'lesson-1', 'Short-Run vs Long-Run', 'Larger samples give better evidence of the long-run average.'],
  ['l1-compare-spinners', 'l1-compare-spinners', 'lesson-1', 'Compare Two Spinners', 'Compare games by weighted long-run averages, not just top payout.'],
  // Lesson 2 — Weighted Average
  ['l2-build-weighted-average', 'problem-2', 'lesson-2', 'Build the Weighted Average', 'EV is a weighted average of outcomes.'],
  ['l2-match-outcomes-probabilities', 'l2-match-outcomes-probabilities', 'lesson-2', 'Match Outcomes to Probabilities', 'Each outcome pairs with the probability of that exact outcome.'],
  ['l2-fill-missing-formula', 'l2-fill-missing-formula', 'lesson-2', 'Fill Missing Formula Terms', 'EV is the sum of outcome × probability contributions.'],
  ['l2-diagnose-bad-ev-setups', 'l2-diagnose-bad-ev-setups', 'lesson-2', 'Diagnose Bad EV Setups', 'A complete EV model multiplies every outcome by its probability.'],
  // Lesson 3 — Counts, Tables, Discrete Outcomes
  ['l3-mystery-box-outcomes', 'problem-3', 'lesson-3', 'Mystery Box Outcomes', 'EV can be calculated from counts, not just percentages.'],
  ['l3-calculate-ev-from-table', 'problem-4', 'lesson-3', 'Calculate EV from the Table', 'Sum each outcome × probability contribution.'],
  ['l3-repair-probability-table', 'l3-repair-probability-table', 'lesson-3', 'Repair the Probability Table', 'Probabilities must match counts and the full sample space.'],
  ['l3-prize-bag-ev-table', 'l3-prize-bag-ev-table', 'lesson-3', 'Prize Bag EV Table', 'Build a complete EV table from physical counts.'],
  // Lesson 4 — Payout, Profit, Fairness
  ['l4-payout-vs-profit', 'problem-5', 'lesson-4', 'Expected Payout vs Expected Profit', 'Payout and profit differ when there is a cost to play.'],
  ['l4-fair-favorable-unfavorable', 'problem-6', 'lesson-4', 'Fair, Favorable, or Unfavorable?', 'Positive profit is favorable; zero is fair; negative is unfavorable.'],
  ['l4-find-fair-price', 'l4-find-fair-price', 'lesson-4', 'Find the Fair Price', 'A fair game has expected profit equal to zero.'],
  ['l4-choose-better-game-after-cost', 'l4-choose-better-game-after-cost', 'lesson-4', 'Choose the Better Game After Cost', 'The better game is decided by expected profit, not payout alone.'],
  // Lesson 5 — Same EV, Different Risk, Full Models
  ['l5-build-whole-ev-model', 'problem-7', 'lesson-5', 'Build the Whole EV Model', 'Independently convert a game into an EV calculation.'],
  ['l5-same-ev-different-risk', 'problem-8', 'lesson-5', 'Same Expected Value, Different Risk', 'EV does not describe the full experience of uncertainty.'],
  ['l5-low-risk-vs-high-risk', 'l5-low-risk-vs-high-risk', 'lesson-5', 'Low-Risk vs High-Risk Same EV', 'Two games can share an EV while having different variability.'],
  ['l5-final-capstone-ev-decision', 'l5-final-capstone-ev-decision', 'lesson-5', 'Final Capstone EV Decision', 'Use payout, cost, fairness, and risk together.'],
] as const

function buildCanonicalProblems(): readonly CanonicalProblem[] {
  const withinLessonCounters: Record<string, number> = {}
  return RAW_ORDER.map(([canonicalSlug, storageId, lessonId, title, concept], globalProblemIndex) => {
    const lesson = CANONICAL_LESSONS.find((l) => l.lessonId === lessonId)
    if (!lesson) {
      throw new Error(`Canonical model error: unknown lessonId "${lessonId}"`)
    }
    const problemIndexWithinLesson = withinLessonCounters[lessonId] ?? 0
    withinLessonCounters[lessonId] = problemIndexWithinLesson + 1
    return {
      canonicalSlug,
      storageId,
      lessonId,
      lessonIndex: lesson.order - 1,
      problemIndexWithinLesson,
      globalProblemIndex,
      title,
      concept,
    }
  })
}

export const CANONICAL_PROBLEMS: readonly CanonicalProblem[] = buildCanonicalProblems()

export const TOTAL_PROBLEMS = CANONICAL_PROBLEMS.length
export const TOTAL_LESSONS = CANONICAL_LESSONS.length
export const PROBLEMS_PER_LESSON = TOTAL_PROBLEMS / TOTAL_LESSONS

// ---- Lookup maps -----------------------------------------------------------

const BY_STORAGE_ID = new Map(CANONICAL_PROBLEMS.map((p) => [p.storageId, p]))
const BY_SLUG = new Map(CANONICAL_PROBLEMS.map((p) => [p.canonicalSlug, p]))

/** Resolve a problem by either its storage ID or its canonical slug. */
export function resolveCanonicalProblem(id: string): CanonicalProblem | undefined {
  return BY_STORAGE_ID.get(id) ?? BY_SLUG.get(id)
}

/** Map a legacy/storage problem ID to its canonical slug (identity for slugs). */
export function mapLegacyProblemIdToCanonicalSlug(id: string): string | undefined {
  return resolveCanonicalProblem(id)?.canonicalSlug
}

/** Map a canonical slug to its storage/persistence ID (identity for new problems). */
export function mapCanonicalSlugToStorageId(slug: string): string | undefined {
  return BY_SLUG.get(slug)?.storageId
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
