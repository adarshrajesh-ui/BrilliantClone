import { useParams } from 'react-router-dom'
import { getProblemById } from '../data/chapter'
import { Problem1LongRunAverage } from '../components/problems/Problem1LongRunAverage'
import { ProblemPlaceholderPage } from './ProblemPlaceholderPage'

export function ProblemPage() {
  const { problemId } = useParams<{ problemId: string }>()

  if (problemId === 'problem-1') {
    return <Problem1LongRunAverage />
  }

  const problem = problemId ? getProblemById(problemId) : undefined
  if (!problem) {
    return <ProblemPlaceholderPage />
  }

  return <ProblemPlaceholderPage />
}
