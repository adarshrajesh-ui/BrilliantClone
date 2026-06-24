import { useParams } from 'react-router-dom'
import type { ComponentType } from 'react'
import { normalizeToStorageId } from '../core/progression/canonical'
import type { ImplementedProblemId } from '../data/implementedProblems'
import { useTrackCurrentProblem } from '../hooks/useTrackCurrentProblem'
import { Problem1LongRunAverage } from '../components/problems/Problem1LongRunAverage'
import { Problem2WeightedAverage } from '../components/problems/Problem2WeightedAverage'
import { Problem3MysteryBoxes } from '../components/problems/Problem3MysteryBoxes'
import { Problem4CalculateEV } from '../components/problems/Problem4CalculateEV'
import { Problem5PayoutVsProfit } from '../components/problems/Problem5PayoutVsProfit'
import { Problem6FairnessSort } from '../components/problems/Problem6FairnessSort'
import { Problem7WholeEVModel } from '../components/problems/Problem7WholeEVModel'
import { Problem8SameEVDifferentRisk } from '../components/problems/Problem8SameEVDifferentRisk'
import { ProblemPlaceholderPage } from './ProblemPlaceholderPage'

// Keyed by STORAGE ID. The key type is pinned to ImplementedProblemId so this
// map and the implemented-problem registry can never silently drift apart.
const PROBLEM_COMPONENTS: Record<ImplementedProblemId, ComponentType> = {
  'problem-1': Problem1LongRunAverage,
  'problem-2': Problem2WeightedAverage,
  'problem-3': Problem3MysteryBoxes,
  'problem-4': Problem4CalculateEV,
  'problem-5': Problem5PayoutVsProfit,
  'problem-6': Problem6FairnessSort,
  'problem-7': Problem7WholeEVModel,
  'problem-8': Problem8SameEVDifferentRisk,
}

export function ProblemPage() {
  useTrackCurrentProblem()
  const { problemId } = useParams<{ problemId: string }>()

  // Accept either a canonical slug or a storage ID in the URL and resolve it to
  // the storage ID the registry is keyed by, so implemented problems always load
  // their interactive component instead of falling through to the placeholder.
  const storageId = problemId ? normalizeToStorageId(problemId) : undefined
  const Component = storageId
    ? PROBLEM_COMPONENTS[storageId as ImplementedProblemId]
    : undefined

  if (Component) {
    return <Component />
  }

  return <ProblemPlaceholderPage />
}
