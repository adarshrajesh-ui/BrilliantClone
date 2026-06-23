import { Link } from 'react-router-dom'
import {
  CHAPTER_PROBLEMS,
  CHAPTER_SUBTITLE,
  TOTAL_LESSONS,
  getLessonProgressViews,
} from '../data/chapter'

const CHAPTER_PATH = '/chapter/expected-value-intro'

interface CoursePathwayProps {
  completedProblemIds: string[]
  continueProblemId: string
  allComplete: boolean
}

function problemTitle(problemId: string): string {
  return CHAPTER_PROBLEMS.find((p) => p.problemId === problemId)?.title ?? problemId
}

function problemOrder(problemId: string): number {
  return CHAPTER_PROBLEMS.find((p) => p.problemId === problemId)?.order ?? 0
}

export function CoursePathway({
  completedProblemIds,
  continueProblemId,
  allComplete,
}: CoursePathwayProps) {
  const lessons = getLessonProgressViews(completedProblemIds, continueProblemId, allComplete)
  const currentHole = allComplete
    ? CHAPTER_PROBLEMS.length
    : CHAPTER_PROBLEMS.findIndex((p) => p.problemId === continueProblemId) + 1
  const currentLesson = lessons.find((l) => l.isCurrent)
  const lastProblemId = CHAPTER_PROBLEMS[CHAPTER_PROBLEMS.length - 1]?.problemId

  let holeCounter = 0

  return (
    <section className="card course" aria-label="Expected Value course map">
      <div className="course-hero">
        <div>
          <p className="chapter-eyebrow course-eyebrow">Expected Value Course</p>
          <p className="course-subtitle">{CHAPTER_SUBTITLE}</p>
        </div>
        <span className="course-ribbon">
          {allComplete
            ? 'Course complete 🏆'
            : `Lesson ${currentLesson?.order ?? 1} of ${TOTAL_LESSONS} · Hole ${currentHole} of ${CHAPTER_PROBLEMS.length}`}
        </span>
      </div>

      <ol className="course-track">
        {lessons.map((lesson) => {
          const zoneState = lesson.isComplete ? 'complete' : lesson.isCurrent ? 'current' : 'upcoming'
          return (
            <li key={lesson.lessonId} className="course-zone-wrap">
              <div className={`course-zone-header course-zone-${zoneState}`}>
                <span className="course-zone-eyebrow">Lesson {lesson.order}</span>
                <span className="course-zone-title">{lesson.title}</span>
                <span className="course-zone-status">
                  {lesson.isComplete
                    ? 'Cleared'
                    : `${lesson.completedCount}/${lesson.problemIds.length}`}
                </span>
              </div>

              <ol className="course-holes">
                {lesson.problemIds.map((problemId) => {
                  holeCounter += 1
                  const isComplete = completedProblemIds.includes(problemId)
                  const isCurrent = !allComplete && problemId === continueProblemId
                  const isFinal = problemId === lastProblemId
                  const side = holeCounter % 2 === 1 ? 'left' : 'right'
                  const state = isComplete ? 'complete' : isCurrent ? 'current' : 'upcoming'

                  return (
                    <li
                      key={problemId}
                      className={`course-hole course-hole-${side} course-hole-${state}${isFinal ? ' course-hole-final' : ''}`}
                    >
                      <Link to={`${CHAPTER_PATH}/problem/${problemId}`} className="course-hole-link">
                        <span className="course-pin" aria-hidden="true">
                          <span className="course-flag" />
                          <span className="course-cup">
                            {isComplete ? '✓' : problemOrder(problemId)}
                          </span>
                          {isCurrent && <span className="course-ball" aria-hidden="true" />}
                        </span>
                        <span className="course-hole-info">
                          <span className="course-hole-label">
                            Hole {problemOrder(problemId)}
                            {isFinal && <span className="course-final-tag">Capstone</span>}
                          </span>
                          <span className="course-hole-title">{problemTitle(problemId)}</span>
                          <span className={`course-hole-status course-status-${state}`}>
                            {isComplete ? 'Sunk' : isCurrent ? 'Tee off →' : 'Upcoming'}
                          </span>
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ol>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
