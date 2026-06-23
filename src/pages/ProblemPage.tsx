import type { ComponentType } from 'react'
import { useParams } from 'react-router-dom'
import { getProblemDefinition } from '../data/problems'
import { Problem1LongRunAverage } from '../components/problems/Problem1LongRunAverage'
import { Problem2WeightedAverage } from '../components/problems/Problem2WeightedAverage'
import { Problem3MysteryBoxes } from '../components/problems/Problem3MysteryBoxes'
import { Problem4CalculateEV } from '../components/problems/Problem4CalculateEV'
import { Problem5PayoutVsProfit } from '../components/problems/Problem5PayoutVsProfit'
import { Problem6FairnessSort } from '../components/problems/Problem6FairnessSort'
import { Problem7WholeEVModel } from '../components/problems/Problem7WholeEVModel'
import { Problem8SameEVDifferentRisk } from '../components/problems/Problem8SameEVDifferentRisk'
import { ProblemPlaceholderPage } from './ProblemPlaceholderPage'

const PROBLEM_COMPONENTS: Record<string, ComponentType> = {
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
  const { problemId } = useParams<{ problemId: string }>()

  if (!problemId) {
    return <ProblemPlaceholderPage />
  }

  const Component = PROBLEM_COMPONENTS[problemId]
  if (Component) {
    return <Component />
  }

  if (getProblemDefinition(problemId)) {
    return <ProblemPlaceholderPage />
  }

  return <ProblemPlaceholderPage />
}
