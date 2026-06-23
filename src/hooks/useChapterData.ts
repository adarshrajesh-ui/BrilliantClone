import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { ensureChapterProgress } from '../lib/chapterProgressService'
import { ensureMilestones } from '../lib/milestonesService'
import type { ChapterProgress, Milestones } from '../types/chapter'

interface ChapterState {
  progress: ChapterProgress | null
  milestones: Milestones | null
  loading: boolean
  error: string | null
}

export function useChapterData() {
  const { user } = useAuth()
  const [state, setState] = useState<ChapterState>({
    progress: null,
    milestones: null,
    loading: true,
    error: null,
  })

  const load = useCallback(async () => {
    if (!user) {
      setState({ progress: null, milestones: null, loading: false, error: null })
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const [progress, milestones] = await Promise.all([
        ensureChapterProgress(user.uid),
        ensureMilestones(user.uid),
      ])
      setState({ progress, milestones, loading: false, error: null })
    } catch (error) {
      setState({
        progress: null,
        milestones: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load chapter data',
      })
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  return { ...state, reload: load }
}
