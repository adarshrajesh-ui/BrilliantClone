import { useParams } from 'react-router-dom'
import type { ComponentType } from 'react'
import { normalizeToStorageId } from '../core/progression/canonical'
import type { ImplementedProblemId } from '../data/implementedProblems'
import { useTrackCurrentProblem } from '../hooks/useTrackCurrentProblem'
import { Problem1LongRunAverage } from '../components/problems/Problem1LongRunAverage'
import { Problem2WeightedAverage } from '../components/problems/Problem2WeightedAverage'
import { Problem4DealtHandContributions } from '../components/problems/Problem4DealtHandContributions'
import { Problem5PayoutVsProfit } from '../components/problems/Problem5PayoutVsProfit'
import { Problem6FairnessSort } from '../components/problems/Problem6FairnessSort'
import { Problem7WholeEVModel } from '../components/problems/Problem7WholeEVModel'
import { Problem8SameEVDifferentRisk } from '../components/problems/Problem8SameEVDifferentRisk'
import { EvL1P2UnequalSpinner } from '../components/problems/EvL1P2UnequalSpinner'
import { EvL1P3CompareGames } from '../components/problems/EvL1P3CompareGames'
import { EvL2P2MatchOutcomes } from '../components/problems/EvL2P2MatchOutcomes'
import { EvL2P3DiagnoseSetups } from '../components/problems/EvL2P3DiagnoseSetups'
import { EvL3P3MiniDeckTable } from '../components/problems/EvL3P3MiniDeckTable'
import { EvL4P3BetterGame } from '../components/problems/EvL4P3BetterGame'
import { EvL5P3FinalDecision } from '../components/problems/EvL5P3FinalDecision'
import { ProblemPlaceholderPage } from './ProblemPlaceholderPage'

// Keyed by STORAGE ID. The key type is pinned to ImplementedProblemId so this
// map and the implemented-problem registry can never silently drift apart.
const PROBLEM_COMPONENTS: Record<ImplementedProblemId, ComponentType> = {
  'problem-1': Problem1LongRunAverage, // ev-l1-p1
  'ev-l1-p2': EvL1P2UnequalSpinner,
  'ev-l1-p3': EvL1P3CompareGames,
  'problem-2': Problem2WeightedAverage, // ev-l2-p1
  'ev-l2-p2': EvL2P2MatchOutcomes,
  'ev-l2-p3': EvL2P3DiagnoseSetups,
  'problem-4': Problem4DealtHandContributions, // ev-l3-p2
  'ev-l3-p3': EvL3P3MiniDeckTable,
  'problem-5': Problem5PayoutVsProfit, // ev-l4-p1
  'problem-6': Problem6FairnessSort, // ev-l4-p2
  'ev-l4-p3': EvL4P3BetterGame,
  'problem-7': Problem7WholeEVModel, // ev-l5-p1
  'problem-8': Problem8SameEVDifferentRisk, // ev-l5-p2
  'ev-l5-p3': EvL5P3FinalDecision,
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
