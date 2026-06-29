import { describe, expect, it } from 'vitest'
import {
  computeStreak,
  createDefaultStreakState,
  getDisplayStreak,
  localDateString,
} from './streakService'
import { STREAK_MILESTONES, type StreakState } from '../types/streak'

const USER_ID = 'user-1'
/** Fixed mid-month anchor so day math never crosses a month boundary by hand. */
const TODAY = '2026-03-15'

/**
 * Shift a YYYY-MM-DD string by whole days using UTC math, mirroring the
 * service's own `dayIndex`/`daysBetween` so the offsets line up exactly.
 */
function shiftDate(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const shifted = new Date(Date.UTC(year, month - 1, day) + days * 86_400_000)
  const y = shifted.getUTCFullYear()
  const m = String(shifted.getUTCMonth() + 1).padStart(2, '0')
  const d = String(shifted.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** `n` whole days before {@link TODAY} as a YYYY-MM-DD string. */
const daysAgo = (n: number): string => shiftDate(TODAY, -n)

/** Build a streak state from explicit fields layered on top of the real defaults. */
function makeState(overrides: Partial<StreakState> = {}): StreakState {
  return { ...createDefaultStreakState(USER_ID), ...overrides }
}

describe('localDateString', () => {
  it('formats a local date as zero-padded YYYY-MM-DD', () => {
    expect(localDateString(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(localDateString(new Date(2026, 8, 9))).toBe('2026-09-09')
    expect(localDateString(new Date(2026, 11, 31))).toBe('2026-12-31')
  })

  it('reads the LOCAL calendar day, not the UTC day', () => {
    // Late local evening stays on its local calendar date even though the same
    // instant rolls to the next day in UTC for timezones ahead of UTC.
    const lateLocalNye = new Date(2025, 11, 31, 23, 30, 0)
    expect(localDateString(lateLocalNye)).toBe('2025-12-31')
    expect(localDateString(lateLocalNye)).toBe(
      `${lateLocalNye.getFullYear()}-` +
        `${String(lateLocalNye.getMonth() + 1).padStart(2, '0')}-` +
        `${String(lateLocalNye.getDate()).padStart(2, '0')}`,
    )
  })

  it('defaults to the current local date when no argument is given', () => {
    const now = new Date()
    const expected =
      `${now.getFullYear()}-` +
      `${String(now.getMonth() + 1).padStart(2, '0')}-` +
      `${String(now.getDate()).padStart(2, '0')}`
    expect(localDateString()).toBe(expected)
  })
})

describe('createDefaultStreakState', () => {
  it('starts a new user with a zeroed, freeze-banked streak', () => {
    const state = createDefaultStreakState(USER_ID)
    expect(state).toMatchObject({
      userId: USER_ID,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
      freezeAvailable: true,
      weekActivity: {},
      totalActiveDays: 0,
    })
    expect(state.freezeUpdatedDate).toBe(localDateString())
    expect(Number.isNaN(Date.parse(state.updatedAt))).toBe(false)
  })
})

describe('computeStreak — first activity', () => {
  it('starts a streak at 1 from a null previous state', () => {
    const result = computeStreak(null, TODAY, USER_ID)
    expect(result.currentStreak).toBe(1)
    expect(result.previousStreak).toBe(0)
    expect(result.streakIncreased).toBe(true)
    expect(result.isFirstActivityToday).toBe(true)
    expect(result.milestoneReached).toBe(null)
    expect(result.state.currentStreak).toBe(1)
    expect(result.state.longestStreak).toBe(1)
    expect(result.state.lastActiveDate).toBe(TODAY)
    expect(result.state.totalActiveDays).toBe(1)
    expect(result.state.weekActivity).toEqual({ [TODAY]: 1 })
    expect(result.state.userId).toBe(USER_ID)
  })

  it('treats a fresh default state the same as null', () => {
    const result = computeStreak(createDefaultStreakState(USER_ID), TODAY, USER_ID)
    expect(result.currentStreak).toBe(1)
    expect(result.previousStreak).toBe(0)
    expect(result.isFirstActivityToday).toBe(true)
    expect(result.state.totalActiveDays).toBe(1)
  })
})

describe('computeStreak — same-day repeat', () => {
  it('does not advance the streak for a second activity on the same day', () => {
    const prev = makeState({
      currentStreak: 4,
      longestStreak: 4,
      lastActiveDate: TODAY,
      totalActiveDays: 9,
      weekActivity: { [TODAY]: 1 },
    })
    const result = computeStreak(prev, TODAY, USER_ID)
    expect(result.currentStreak).toBe(4)
    expect(result.previousStreak).toBe(4)
    expect(result.streakIncreased).toBe(false)
    expect(result.isFirstActivityToday).toBe(false)
    expect(result.milestoneReached).toBe(null)
  })

  it("bumps today's activity count while leaving totals flat", () => {
    const prev = makeState({
      currentStreak: 4,
      lastActiveDate: TODAY,
      totalActiveDays: 9,
      weekActivity: { [TODAY]: 2 },
    })
    const result = computeStreak(prev, TODAY, USER_ID)
    expect(result.state.weekActivity[TODAY]).toBe(3)
    expect(result.state.totalActiveDays).toBe(9)
  })
})

describe('computeStreak — consecutive day', () => {
  it('increments the streak on the next calendar day', () => {
    const prev = makeState({
      currentStreak: 4,
      longestStreak: 4,
      lastActiveDate: daysAgo(1),
      totalActiveDays: 4,
      freezeAvailable: true,
      freezeUpdatedDate: daysAgo(1),
      weekActivity: { [daysAgo(1)]: 1 },
    })
    const result = computeStreak(prev, TODAY, USER_ID)
    expect(result.currentStreak).toBe(5)
    expect(result.previousStreak).toBe(4)
    expect(result.streakIncreased).toBe(true)
    expect(result.isFirstActivityToday).toBe(true)
    expect(result.state.lastActiveDate).toBe(TODAY)
    expect(result.state.totalActiveDays).toBe(5)
    expect(result.state.weekActivity[TODAY]).toBe(1)
    expect(result.state.weekActivity[daysAgo(1)]).toBe(1)
  })

  it('does not consume the freeze on a consecutive day', () => {
    const prev = makeState({
      currentStreak: 2,
      lastActiveDate: daysAgo(1),
      freezeAvailable: true,
      freezeUpdatedDate: daysAgo(1),
    })
    const result = computeStreak(prev, TODAY, USER_ID)
    expect(result.state.freezeAvailable).toBe(true)
  })
})

describe('computeStreak — single missed day (grace freeze)', () => {
  it('absorbs a one-day gap with the freeze and keeps the streak going', () => {
    const prev = makeState({
      currentStreak: 5,
      longestStreak: 5,
      lastActiveDate: daysAgo(2), // yesterday was missed
      freezeAvailable: true,
      freezeUpdatedDate: daysAgo(2),
      totalActiveDays: 5,
    })
    const result = computeStreak(prev, TODAY, USER_ID)
    // The missed day is absorbed, so today counts as the next day in the run.
    expect(result.currentStreak).toBe(6)
    expect(result.previousStreak).toBe(5)
    expect(result.streakIncreased).toBe(true)
    expect(result.state.freezeAvailable).toBe(false) // freeze consumed
    expect(result.state.freezeUpdatedDate).toBe(TODAY)
    expect(result.state.longestStreak).toBe(6)
    expect(result.state.totalActiveDays).toBe(6)
  })
})

describe('computeStreak — reset', () => {
  it('resets to 1 on a single missed day when no freeze is banked', () => {
    const prev = makeState({
      currentStreak: 9,
      longestStreak: 12,
      lastActiveDate: daysAgo(2),
      freezeAvailable: false,
      freezeUpdatedDate: daysAgo(2), // recent → weekly replenish not yet due
      totalActiveDays: 20,
    })
    const result = computeStreak(prev, TODAY, USER_ID)
    expect(result.currentStreak).toBe(1)
    expect(result.previousStreak).toBe(9)
    expect(result.streakIncreased).toBe(false)
    expect(result.milestoneReached).toBe(null)
    expect(result.state.longestStreak).toBe(12) // record preserved across reset
    expect(result.state.totalActiveDays).toBe(21)
  })

  it('resets to 1 after a multi-day gap and does not consume the freeze', () => {
    const prev = makeState({
      currentStreak: 9,
      longestStreak: 9,
      lastActiveDate: daysAgo(3), // two missed days — beyond the one-day grace
      freezeAvailable: true,
      freezeUpdatedDate: daysAgo(3),
      totalActiveDays: 9,
    })
    const result = computeStreak(prev, TODAY, USER_ID)
    expect(result.currentStreak).toBe(1)
    expect(result.streakIncreased).toBe(false)
    expect(result.state.freezeAvailable).toBe(true) // freeze only covers ONE day
    expect(result.state.longestStreak).toBe(9)
  })
})

describe('computeStreak — weekly freeze replenishment', () => {
  it('re-grants a consumed freeze once the window has elapsed (>= 7 days)', () => {
    const prev = makeState({
      currentStreak: 3,
      lastActiveDate: daysAgo(1), // consecutive, so the freeze is not needed
      freezeAvailable: false,
      freezeUpdatedDate: daysAgo(7), // exactly the replenish threshold
    })
    const result = computeStreak(prev, TODAY, USER_ID)
    expect(result.state.freezeAvailable).toBe(true)
    expect(result.state.freezeUpdatedDate).toBe(TODAY)
    expect(result.currentStreak).toBe(4)
  })

  it('does not replenish before the window has elapsed (< 7 days)', () => {
    const prev = makeState({
      currentStreak: 3,
      lastActiveDate: daysAgo(1),
      freezeAvailable: false,
      freezeUpdatedDate: daysAgo(6), // one day short of the threshold
    })
    const result = computeStreak(prev, TODAY, USER_ID)
    expect(result.state.freezeAvailable).toBe(false)
    expect(result.state.freezeUpdatedDate).toBe(daysAgo(6))
  })

  it('replenishes then immediately re-consumes the freeze to cover a one-day gap', () => {
    const prev = makeState({
      currentStreak: 3,
      lastActiveDate: daysAgo(2), // a one-day gap waiting to be absorbed
      freezeAvailable: false,
      freezeUpdatedDate: daysAgo(7), // replenish window has elapsed
    })
    const result = computeStreak(prev, TODAY, USER_ID)
    expect(result.currentStreak).toBe(4) // gap absorbed by the freshly re-granted freeze
    expect(result.state.freezeAvailable).toBe(false) // re-consumed in the same run
    expect(result.state.freezeUpdatedDate).toBe(TODAY)
  })
})

describe('computeStreak — milestones', () => {
  it.each([...STREAK_MILESTONES])(
    'flags reaching the %i-day milestone',
    (milestone) => {
      const prev = makeState({
        currentStreak: milestone - 1,
        longestStreak: milestone - 1,
        lastActiveDate: daysAgo(1),
        freezeUpdatedDate: daysAgo(1),
        totalActiveDays: milestone - 1,
      })
      const result = computeStreak(prev, TODAY, USER_ID)
      expect(result.currentStreak).toBe(milestone)
      expect(result.streakIncreased).toBe(true)
      expect(result.milestoneReached).toBe(milestone)
      expect(result.state.longestStreak).toBe(milestone)
    },
  )

  it('does not flag a milestone on a non-milestone day', () => {
    const prev = makeState({
      currentStreak: 7, // a milestone value...
      longestStreak: 7,
      lastActiveDate: daysAgo(1),
      freezeUpdatedDate: daysAgo(1),
    })
    const result = computeStreak(prev, TODAY, USER_ID)
    expect(result.currentStreak).toBe(8) // ...but advancing to 8 is not a milestone
    expect(result.milestoneReached).toBe(null)
  })

  it('does not re-flag a milestone on a same-day repeat', () => {
    const prev = makeState({
      currentStreak: 7,
      longestStreak: 7,
      lastActiveDate: TODAY,
      freezeUpdatedDate: daysAgo(1),
      weekActivity: { [TODAY]: 1 },
    })
    const result = computeStreak(prev, TODAY, USER_ID)
    expect(result.currentStreak).toBe(7)
    expect(result.streakIncreased).toBe(false)
    expect(result.milestoneReached).toBe(null) // no advance → no milestone
  })

  it('flags a milestone reached via the grace freeze', () => {
    const prev = makeState({
      currentStreak: 2,
      longestStreak: 2,
      lastActiveDate: daysAgo(2), // one missed day, absorbed by the freeze
      freezeAvailable: true,
      freezeUpdatedDate: daysAgo(2),
    })
    const result = computeStreak(prev, TODAY, USER_ID)
    expect(result.currentStreak).toBe(3)
    expect(result.state.freezeAvailable).toBe(false)
    expect(result.milestoneReached).toBe(3)
  })
})

describe('computeStreak — longestStreak bookkeeping', () => {
  it('raises longestStreak when the current run sets a new record', () => {
    const prev = makeState({
      currentStreak: 6,
      longestStreak: 6,
      lastActiveDate: daysAgo(1),
      freezeUpdatedDate: daysAgo(1),
    })
    const result = computeStreak(prev, TODAY, USER_ID)
    expect(result.state.currentStreak).toBe(7)
    expect(result.state.longestStreak).toBe(7)
  })

  it('keeps the longer historical record when the current streak is shorter', () => {
    const prev = makeState({
      currentStreak: 2,
      longestStreak: 30,
      lastActiveDate: daysAgo(1),
      freezeUpdatedDate: daysAgo(1),
    })
    const result = computeStreak(prev, TODAY, USER_ID)
    expect(result.state.currentStreak).toBe(3)
    expect(result.state.longestStreak).toBe(30)
  })
})

describe('computeStreak — weekActivity window', () => {
  it('prunes activity entries older than the trailing 31-day month window', () => {
    const prev = makeState({
      currentStreak: 1,
      lastActiveDate: daysAgo(1),
      freezeUpdatedDate: daysAgo(1),
      weekActivity: {
        [daysAgo(32)]: 5, // outside the window → dropped
        [daysAgo(31)]: 2, // age 31 is not < 31 → dropped (boundary)
        [daysAgo(30)]: 1, // inside the window → kept
        [daysAgo(1)]: 1, // inside the window → kept
      },
    })
    const result = computeStreak(prev, TODAY, USER_ID)
    expect(result.state.weekActivity).toEqual({
      [daysAgo(30)]: 1,
      [daysAgo(1)]: 1,
      [TODAY]: 1,
    })
  })
})

describe('getDisplayStreak', () => {
  it('returns 0 for a null state', () => {
    expect(getDisplayStreak(null, TODAY)).toBe(0)
  })

  it('returns 0 when the user has never been active', () => {
    expect(getDisplayStreak(makeState({ lastActiveDate: '' }), TODAY)).toBe(0)
  })

  it('returns the stored streak when today was the active day', () => {
    const state = makeState({ currentStreak: 5, lastActiveDate: TODAY })
    expect(getDisplayStreak(state, TODAY)).toBe(5)
  })

  it('returns the stored streak when yesterday was the active day', () => {
    const state = makeState({ currentStreak: 5, lastActiveDate: daysAgo(1) })
    expect(getDisplayStreak(state, TODAY)).toBe(5)
  })

  it('keeps the streak after a single missed day while a freeze is available', () => {
    const state = makeState({
      currentStreak: 5,
      lastActiveDate: daysAgo(2),
      freezeAvailable: true,
    })
    expect(getDisplayStreak(state, TODAY)).toBe(5)
  })

  it('decays to 0 after a single missed day with no freeze', () => {
    const state = makeState({
      currentStreak: 5,
      lastActiveDate: daysAgo(2),
      freezeAvailable: false,
    })
    expect(getDisplayStreak(state, TODAY)).toBe(0)
  })

  it('decays to 0 after a multi-day gap even with a freeze available', () => {
    const state = makeState({
      currentStreak: 5,
      lastActiveDate: daysAgo(3),
      freezeAvailable: true,
    })
    expect(getDisplayStreak(state, TODAY)).toBe(0)
  })

  it('does not mutate the state it reads', () => {
    const state = makeState({
      currentStreak: 5,
      lastActiveDate: daysAgo(3),
      freezeAvailable: true,
    })
    const snapshot = JSON.parse(JSON.stringify(state))
    getDisplayStreak(state, TODAY)
    expect(state).toEqual(snapshot)
  })

  it('defaults the comparison date to the current local day', () => {
    const state = makeState({ currentStreak: 4, lastActiveDate: localDateString() })
    expect(getDisplayStreak(state)).toBe(4)
  })
})
