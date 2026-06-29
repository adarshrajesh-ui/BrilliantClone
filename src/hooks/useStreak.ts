import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import {
  createDefaultStreakState,
  getStreakState,
  recordDailyActivity,
} from '../lib/streakService'
import type {
  RecordActivityResult,
  StreakState,
  WeekActivity,
} from '../types/streak'

export interface UseStreakResult {
  /** Latest streak state, or null while loading / when signed out. */
  streak: StreakState | null
  /** Convenience mirror of `streak.weekActivity` (empty map until loaded). */
  weekActivity: WeekActivity
  /** True while the initial state is loading for the current user. */
  loading: boolean
  /**
   * Outcome of the most recent `recordActivity()` this session
   * (`streakIncreased`, `milestoneReached`, `currentStreak`, ...), or null until
   * one occurs. Drives celebration UIs; call `clearCelebration()` once shown.
   */
  lastActivity: RecordActivityResult | null
  /**
   * Record a genuine learning completion for today. Updates local state and
   * returns the celebration-ready result (null when signed out). Safe to call on
   * every genuine completion — same-day repeats do not inflate the streak.
   */
  recordActivity: () => Promise<RecordActivityResult | null>
  /** Clear `lastActivity` after a celebration has been shown. */
  clearCelebration: () => void
  /** Re-read the streak from persistence. */
  reload: () => Promise<void>
}

/**
 * Loads and subscribes to the current user's streak state and exposes a
 * `recordActivity()` action plus the `weekActivity` map. The streak is the new
 * source of truth for daily consistency (see `src/lib/streakService.ts`);
 * `recordActivity()` must be called only on a GENUINE learning event.
 */
export function useStreak(): UseStreakResult {
  const { user } = useAuth()
  const [streak, setStreak] = useState<StreakState | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastActivity, setLastActivity] = useState<RecordActivityResult | null>(null)

  const load = useCallback(async () => {
    if (!user) {
      setStreak(null)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const state = await getStreakState(user.uid)
      setStreak(state)
    } catch {
      // Never let a streak read failure break the surrounding UI.
      setStreak(createDefaultStreakState(user.uid))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  const recordActivity = useCallback(async () => {
    if (!user) {
      return null
    }
    const result = await recordDailyActivity(user.uid)
    setStreak(result.state)
    setLastActivity(result)
    return result
  }, [user])

  const clearCelebration = useCallback(() => {
    setLastActivity(null)
  }, [])

  return {
    streak,
    weekActivity: streak?.weekActivity ?? {},
    loading,
    lastActivity,
    recordActivity,
    clearCelebration,
    reload: load,
  }
}
