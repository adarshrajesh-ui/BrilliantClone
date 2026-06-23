import { Link, useParams } from 'react-router-dom'
import { CHAPTER_PROBLEMS, getProblemById } from '../data/chapter'

const CHAPTER_PATH = '/chapter/expected-value-intro'

export function ProblemPlaceholderPage() {
  const { problemId } = useParams<{ problemId: string }>()
  const problem = problemId ? getProblemById(problemId) : undefined

  if (!problem) {
    return (
      <div className="page">
        <section className="card">
          <h1>Problem not found</h1>
          <p>This problem does not exist in the Expected Value chapter.</p>
          <Link to={CHAPTER_PATH} className="btn-secondary">
            Back to chapter
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className="page">
      <section className="card">
        <p className="chapter-eyebrow">
          Problem {problem.order} of {CHAPTER_PROBLEMS.length}
        </p>
        <h1>{problem.title}</h1>
        <p>{problem.concept}</p>
        <p className="placeholder-note">
          Interactive visuals and answer checking for this problem will be added in a later
          checkpoint. Your progress is saved when you complete problems.
        </p>
        <div className="placeholder-actions">
          <Link to={CHAPTER_PATH} className="btn-secondary">
            Back to chapter
          </Link>
        </div>
      </section>
    </div>
  )
}
