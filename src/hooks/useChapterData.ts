import { useCallback, useEffect, useState } from 'react'
import { FirebaseError } from 'firebase/app'
import { useAuth } from './useAuth'
import { ensureChapterProgress } from '../lib/chapterProgressService'
import { ensureMilestones } from '../lib/milestonesService'
import { evaluateMastery } from '../lib/masteryService'
import { getFirestoreErrorMessage } from '../lib/authErrors'
import { readLocalProgress } from '../lib/localProgressStore'
import { normalizeChapterProgress } from '../core/persistence/migration'
import { TOTAL_PROBLEMS } from '../data/chapter'
import type { ChapterProgress, Milestones } from '../types/chapter'

interface ChapterState {
  progress: ChapterProgress | null
  milestones: Milestones | null
  loading: boolean
  error: string | null
  syncWarning: string | null
}

export function useChapterData() {
  const { user } = useAuth()
  const [state, setState] = useState<ChapterState>({
    progress: null,
    milestones: null,
    loading: true,
    error: null,
    syncWarning: null,
  })

  const load = useCallback(async () => {
    if (!user) {
      setState({
        progress: null,
        milestones: null,
        loading: false,
        error: null,
        syncWarning: null,
      })
      return
    }

    // Seed from the on-device copy so a same-device revisit knows completion
    // status immediately, before the Firestore round-trip. This lets a finished
    // problem render its review/retry view without first flashing the workspace.
    const seeded = readLocalProgress(user.uid)
    setState((prev) => ({
      ...prev,
      progress: seeded ? normalizeChapterProgress(seeded, user.uid) : prev.progress,
      loading: true,
      error: null,
    }))

    try {
      const [progress] = await Promise.all([
        ensureChapterProgress(user.uid),
        ensureMilestones(user.uid),
      ])
      if (progress.completedProblemIds.length === TOTAL_PROBLEMS) {
        await evaluateMastery(user.uid)
      }
      const [updatedProgress, updatedMilestones] = await Promise.all([
        ensureChapterProgress(user.uid),
        ensureMilestones(user.uid),
      ])
      setState({
        progress: updatedProgress,
        milestones: updatedMilestones,
        loading: false,
        error: null,
        syncWarning: null,
      })
    } catch (error) {
      const isPermission =
        error instanceof FirebaseError && error.code === 'permission-denied'
      setState({
        progress: null,
        milestones: null,
        loading: false,
        error: isPermission ? null : getFirestoreErrorMessage(error),
        syncWarning: isPermission ? getFirestoreErrorMessage(error) : null,
      })
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  return { ...state, reload: load }
}
