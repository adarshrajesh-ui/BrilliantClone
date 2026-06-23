import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { setCurrentProblem } from '../lib/chapterProgressService'

export function useTrackCurrentProblem() {
  const { problemId } = useParams<{ problemId: string }>()
  const { user } = useAuth()

  useEffect(() => {
    if (!user || !problemId) {
      return
    }
    void setCurrentProblem(user.uid, problemId)
  }, [user, problemId])
}
