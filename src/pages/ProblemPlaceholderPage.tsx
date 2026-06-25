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
          <p>This problem does not exist in this course.</p>
          <Link to={CHAPTER_PATH} className="btn-secondary">
            Back to course map
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
          This problem page is being updated. Your progress stays saved as you complete
          available problems.
        </p>
        <div className="placeholder-actions">
          <Link to={CHAPTER_PATH} className="btn-secondary">
            Back to course map
          </Link>
        </div>
      </section>
    </div>
  )
}
