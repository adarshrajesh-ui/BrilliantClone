import { doc, getDoc, setDoc } from 'firebase/firestore'
import { FirebaseError } from 'firebase/app'
import { db } from './firebase'
import {
  STREAK_MILESTONES,
  type RecordActivityResult,
  type StreakMilestone,
  type StreakState,
  type WeekActivity,
} from '../types/streak'

/**
 * Trailing window (in days, inclusive of today) retained in `weekActivity`.
 * Spans roughly a full month so the calendar can show the current month's
 * previously completed days as the learner builds history.
 */
const MONTH_WINDOW_DAYS = 31

/** Days after which a consumed freeze is re-granted. */
const FREEZE_REPLENISH_DAYS = 7

const STREAK_KEY_PREFIX = 'evl_streak_'

/** Firestore collection holding one streak doc per user (`streaks/{userId}`). */
const STREAK_COLLECTION = 'streaks'

function streakKey(userId: string): string {
  return `${STREAK_KEY_PREFIX}${userId}`
}

function requireDb() {
  if (!db) {
    throw new Error('Firestore is not configured')
  }
  return db
}

/**
 * Timezone-correct LOCAL calendar date as YYYY-MM-DD. Unlike
 * `new Date().toISOString().slice(0, 10)` (which is UTC and rolls the day over
 * at the wrong moment for most users), this reads the device's LOCAL date
 * components, so "today" matches the learner's actual calendar day.
 */
export function localDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Stable integer day index for a YYYY-MM-DD string (DST-proof day math). */
function dayIndex(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number)
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000)
}

/** Whole days from `from` to `to` (`to - from`); negative if `to` precedes `from`. */
function daysBetween(from: string, to: string): number {
  return dayIndex(to) - dayIndex(from)
}

export function createDefaultStreakState(userId: string): StreakState {
  const now = new Date()
  return {
    userId,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    freezeAvailable: true,
    freezeUpdatedDate: localDateString(now),
    weekActivity: {},
    totalActiveDays: 0,
    updatedAt: now.toISOString(),
  }
}

/** Drop weekActivity entries that fall outside the trailing month-long window. */
function pruneWeekActivity(weekActivity: WeekActivity, today: string): WeekActivity {
  const pruned: WeekActivity = {}
  for (const [date, count] of Object.entries(weekActivity)) {
    const age = daysBetween(date, today) // today - date
    if (age >= 0 && age < MONTH_WINDOW_DAYS) {
      pruned[date] = count
    }
  }
  return pruned
}

function milestoneFor(streak: number): StreakMilestone | null {
  return (STREAK_MILESTONES as readonly number[]).includes(streak)
    ? (streak as StreakMilestone)
    : null
}

/**
 * Pure streak transition for recording a genuine learning activity on `today`.
 *
 * Handles: same-day no-op (no increment, but the day's count still bumps),
 * consecutive-day increment, single-miss grace (consumes the freeze and keeps
 * the streak), multi-miss reset to 1, weekly freeze replenish, milestone
 * detection, and weekActivity / longestStreak / totalActiveDays bookkeeping.
 *
 * Deterministic given (prev, today, userId) aside from the `updatedAt` stamp,
 * so it is straightforward to unit-test. `today` MUST be a LOCAL YYYY-MM-DD
 * string (see `localDateString`).
 */
export function computeStreak(
  prev: StreakState | null,
  today: string,
  userId: string,
): RecordActivityResult {
  const defaults = createDefaultStreakState(prev?.userId || userId)
  // Spread defaults first so partial/legacy docs get safe values for every field.
  const base: StreakState = { ...defaults, ...(prev ?? {}) }
  const weekActivityBase = base.weekActivity ?? {}

  const previousStreak = base.currentStreak
  const priorTodayCount = weekActivityBase[today] ?? 0
  const isFirstActivityToday = priorTodayCount === 0

  // Weekly replenish of a previously consumed freeze (before any consumption).
  let freezeAvailable = base.freezeAvailable
  let freezeUpdatedDate = base.freezeUpdatedDate || today
  if (
    !freezeAvailable &&
    daysBetween(freezeUpdatedDate, today) >= FREEZE_REPLENISH_DAYS
  ) {
    freezeAvailable = true
    freezeUpdatedDate = today
  }

  let currentStreak: number
  if (!base.lastActiveDate) {
    // First genuine activity ever.
    currentStreak = 1
  } else {
    const gap = daysBetween(base.lastActiveDate, today) // today - lastActive
    if (gap <= 0) {
      // Same day (or a clock that went backwards): no increment.
      currentStreak = base.currentStreak
    } else if (gap === 1) {
      // Consecutive day.
      currentStreak = base.currentStreak + 1
    } else if (gap === 2 && freezeAvailable) {
      // Exactly one missed day, absorbed by the grace freeze.
      currentStreak = base.currentStreak + 1
      freezeAvailable = false
      freezeUpdatedDate = today
    } else {
      // More than one day missed (or one miss with no freeze left): restart.
      currentStreak = 1
    }
  }

  // weekActivity: prune to the trailing window, then count today's completion.
  const weekActivity = pruneWeekActivity(weekActivityBase, today)
  weekActivity[today] = priorTodayCount + 1

  // Never let lastActiveDate move backwards (defensive against clock skew).
  const lastActiveDate = base.lastActiveDate > today ? base.lastActiveDate : today
  const longestStreak = Math.max(base.longestStreak, currentStreak)
  const totalActiveDays = base.totalActiveDays + (isFirstActivityToday ? 1 : 0)
  const streakIncreased = currentStreak > previousStreak

  const state: StreakState = {
    userId: base.userId || userId,
    currentStreak,
    longestStreak,
    lastActiveDate,
    freezeAvailable,
    freezeUpdatedDate,
    weekActivity,
    totalActiveDays,
    updatedAt: new Date().toISOString(),
  }

  return {
    state,
    streakIncreased,
    previousStreak,
    currentStreak,
    isFirstActivityToday,
    milestoneReached: streakIncreased ? milestoneFor(currentStreak) : null,
  }
}

/**
 * Effective current streak for DISPLAY as of `today`, accounting for missed
 * days WITHOUT persisting anything. Returns the stored streak when today or
 * yesterday was active, keeps it when a single missed day is still covered by an
 * available freeze, and otherwise returns 0 (the streak has lapsed and will
 * restart at 1 on the next genuine activity). Pure.
 */
export function getDisplayStreak(
  state: StreakState | null,
  today: string = localDateString(),
): number {
  if (!state || !state.lastActiveDate) {
    return 0
  }
  const gap = daysBetween(state.lastActiveDate, today)
  if (gap <= 1) {
    return state.currentStreak
  }
  if (gap === 2 && state.freezeAvailable) {
    return state.currentStreak
  }
  return 0
}

function readLocalStreak(userId: string): StreakState | null {
  try {
    const raw = localStorage.getItem(streakKey(userId))
    return raw ? (JSON.parse(raw) as StreakState) : null
  } catch {
    return null
  }
}

function writeLocalStreak(state: StreakState): void {
  try {
    localStorage.setItem(streakKey(state.userId), JSON.stringify(state))
  } catch {
    // Ignore storage failures (private mode / quota); the streak is non-critical.
  }
}

async function readFirestoreStreak(userId: string): Promise<StreakState | null> {
  try {
    const snap = await getDoc(doc(requireDb(), STREAK_COLLECTION, userId))
    return snap.exists() ? (snap.data() as StreakState) : null
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'permission-denied') {
      return null
    }
    throw error
  }
}

/** Pick the most recently updated of two candidate states. */
function pickFreshest(
  a: StreakState | null,
  b: StreakState | null,
): StreakState | null {
  if (!a) {
    return b
  }
  if (!b) {
    return a
  }
  const aTime = new Date(a.updatedAt).getTime() || 0
  const bTime = new Date(b.updatedAt).getTime() || 0
  return aTime >= bTime ? a : b
}

/** Persist to localStorage (always) + Firestore (best-effort, owner-only). */
async function saveStreak(state: StreakState): Promise<StreakState> {
  writeLocalStreak(state)

  if (!db) {
    return state
  }

  try {
    await setDoc(doc(requireDb(), STREAK_COLLECTION, state.userId), state)
  } catch (error) {
    if (!(error instanceof FirebaseError && error.code === 'permission-denied')) {
      throw error
    }
  }

  return state
}

/**
 * Read the current streak state, merging Firestore (when configured) with the
 * localStorage mirror and keeping the mirror current. Returns a fresh default
 * (currentStreak 0) when nothing is stored anywhere.
 *
 * This is a pure READ: it never advances or resets the streak. The
 * displayed/effective streak after a gap is resolved by the next
 * `recordDailyActivity()`, or computed on demand via `getDisplayStreak()`.
 */
export async function getStreakState(userId: string): Promise<StreakState> {
  const local = readLocalStreak(userId)

  if (!db) {
    return local ?? createDefaultStreakState(userId)
  }

  try {
    const remote = await readFirestoreStreak(userId)
    const best = pickFreshest(remote, local)
    if (best) {
      // Keep the local mirror current for offline / fallback reads.
      if (best !== local) {
        writeLocalStreak(best)
      }
      return best
    }
    return createDefaultStreakState(userId)
  } catch {
    return local ?? createDefaultStreakState(userId)
  }
}

/**
 * Record a genuine daily learning activity (a real problem completion or a
 * correct graded practice answer) for the user's LOCAL today. Loads the latest
 * state, applies the pure `computeStreak` transition, persists it (localStorage
 * + best-effort Firestore), and returns the celebration-ready result.
 *
 * Call this ONLY on a genuine learning event — never on app-open or restart.
 */
export async function recordDailyActivity(
  userId: string,
): Promise<RecordActivityResult> {
  const prev = await getStreakState(userId)
  const result = computeStreak(prev, localDateString(), userId)
  await saveStreak(result.state)
  return result
}
