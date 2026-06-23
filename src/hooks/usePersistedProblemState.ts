import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from './useAuth'
import { loadProblemSession, saveProblemSession } from '../lib/problemSessionService'

export function usePersistedProblemState<T>(
  problemId: string,
  defaultState: T,
) {
  const { user } = useAuth()
  const [state, setStateInternal] = useState<T>(defaultState)
  const [loaded, setLoaded] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!user) {
      setLoaded(true)
      return
    }

    let cancelled = false
    void loadProblemSession(user.uid, problemId).then((session) => {
      if (cancelled) {
        return
      }
      if (session.state && Object.keys(session.state).length > 0) {
        setStateInternal({ ...defaultState, ...(session.state as Partial<T>) })
      }
      setLoaded(true)
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- defaultState is stable per problem
  }, [user, problemId])

  const setState = useCallback((updater: T | ((prev: T) => T)) => {
    setStateInternal(updater)
  }, [])

  const persist = useCallback(
    (nextState: T, revealedHintIds: string[]) => {
      if (!user) {
        return
      }
      if (saveTimer.current) {
        clearTimeout(saveTimer.current)
      }
      saveTimer.current = setTimeout(() => {
        void saveProblemSession(user.uid, problemId, nextState as Record<string, unknown>, revealedHintIds)
      }, 400)
    },
    [user, problemId],
  )

  return { state, setState, loaded, persist }
}
