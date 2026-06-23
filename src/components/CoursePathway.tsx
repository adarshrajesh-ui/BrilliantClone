import { Link } from 'react-router-dom'
import { CHAPTER_PROBLEMS } from '../data/chapter'

const CHAPTER_PATH = '/chapter/expected-value-intro'

interface CoursePathwayProps {
  completedProblemIds: string[]
  continueProblemId: string
  allComplete: boolean
}

export function CoursePathway({
  completedProblemIds,
  continueProblemId,
  allComplete,
}: CoursePathwayProps) {
  const currentHole = allComplete
    ? CHAPTER_PROBLEMS.length
    : CHAPTER_PROBLEMS.findIndex((p) => p.problemId === continueProblemId) + 1

  return (
    <section className="card course" aria-label="Expected Value course map">
      <div className="course-hero">
        <div>
          <p className="chapter-eyebrow course-eyebrow">Expected Value Course</p>
          <p className="course-subtitle">
            Play through 8 visual challenges to master long-run average, payout, profit,
            fairness, and risk.
          </p>
        </div>
        <span className="course-ribbon">
          {allComplete ? 'Course complete 🏆' : `Hole ${currentHole} of ${CHAPTER_PROBLEMS.length}`}
        </span>
      </div>

      <ol className="course-track">
        {CHAPTER_PROBLEMS.map((problem, i) => {
          const isComplete = completedProblemIds.includes(problem.problemId)
          const isCurrent = !allComplete && problem.problemId === continueProblemId
          const isFinal = i === CHAPTER_PROBLEMS.length - 1
          const side = i % 2 === 0 ? 'left' : 'right'
          const state = isComplete ? 'complete' : isCurrent ? 'current' : 'upcoming'

          return (
            <li
              key={problem.problemId}
              className={`course-hole course-hole-${side} course-hole-${state}${isFinal ? ' course-hole-final' : ''}`}
            >
              <Link to={`${CHAPTER_PATH}/problem/${problem.problemId}`} className="course-hole-link">
                <span className="course-pin" aria-hidden="true">
                  <span className="course-flag" />
                  <span className="course-cup">
                    {isComplete ? '✓' : problem.order}
                  </span>
                  {isCurrent && <span className="course-ball" aria-hidden="true" />}
                </span>
                <span className="course-hole-info">
                  <span className="course-hole-label">
                    Hole {problem.order}
                    {isFinal && <span className="course-final-tag">Final</span>}
                  </span>
                  <span className="course-hole-title">{problem.title}</span>
                  <span className={`course-hole-status course-status-${state}`}>
                    {isComplete ? 'Sunk' : isCurrent ? 'Tee off →' : 'Upcoming'}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
