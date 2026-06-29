/**
 * Streak feature types.
 *
 * The streak rewards a GENUINE daily learning action (a completed problem or a
 * correct graded practice answer), framed around daily consistency across the
 * month with a built-in recovery "freeze" (grace day). The authoritative source
 * of truth is the streak document persisted by `src/lib/streakService.ts`.
 */

/** Streak lengths (in days) that trigger an inline milestone celebration. */
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100] as const

/** A streak length that is celebrated as a milestone. */
export type StreakMilestone = (typeof STREAK_MILESTONES)[number]

/**
 * Map of local calendar date (YYYY-MM-DD) -> number of genuine learning
 * completions recorded that day. Pruned to the trailing ~month (31-day) window
 * so the home calendar can render the current month's history. (The field name
 * `weekActivity` is retained for backward compatibility with persisted docs.)
 */
export type WeekActivity = Record<string, number>

/**
 * Persisted, per-user streak state. Stored at Firestore `streaks/{userId}` and
 * mirrored to localStorage under `evl_streak_{userId}`.
 */
export interface StreakState {
  userId: string
  /** Consecutive active-day count through `lastActiveDate`. 0 before any activity. */
  currentStreak: number
  /** Highest `currentStreak` ever reached. */
  longestStreak: number
  /**
   * Local calendar date (YYYY-MM-DD) of the most recent active day, or '' when
   * the user has never recorded a genuine activity.
   */
  lastActiveDate: string
  /**
   * A single banked grace day ("freeze") that absorbs exactly one missed day so
   * one lapse does not reset the streak. Replenishes ~weekly after use.
   */
  freezeAvailable: boolean
  /**
   * Local date (YYYY-MM-DD) the freeze state last changed (granted or consumed).
   * The weekly replenish timer counts from here.
   */
  freezeUpdatedDate: string
  /** Trailing ~month (31-day) map of local date -> genuine-completion count. */
  weekActivity: WeekActivity
  /** Total distinct local days with at least one genuine completion. */
  totalActiveDays: number
  /** ISO timestamp of the last write. */
  updatedAt: string
}

/**
 * Outcome of recording a genuine learning activity. Carries everything a
 * celebration UI needs without re-reading state.
 */
export interface RecordActivityResult {
  /** The new, persisted streak state after recording the activity. */
  state: StreakState
  /** True when this activity advanced `currentStreak` vs. the prior value. */
  streakIncreased: boolean
  /** `currentStreak` before this activity (0 for a brand-new streak). */
  previousStreak: number
  /** `currentStreak` after this activity (mirror of `state.currentStreak`). */
  currentStreak: number
  /**
   * True when this is the first genuine completion recorded *today*, so the UI
   * can celebrate once per day rather than on every correct answer.
   */
  isFirstActivityToday: boolean
  /**
   * A milestone newly reached by this activity (one of STREAK_MILESTONES), or
   * null. Only set when the streak actually advanced to that number.
   */
  milestoneReached: StreakMilestone | null
}
