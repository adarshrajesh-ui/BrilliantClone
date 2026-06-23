import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { CheckResult, ProblemDefinition, ProblemHint } from '../../types/problem'
import { FeedbackPanel, resultToFeedbackType } from './FeedbackPanel'
import { HintPanel } from './HintPanel'

const CHAPTER_PATH = '/chapter/expected-value-intro'

interface ProblemLayoutProps {
  problem: ProblemDefinition
  problemNumber: number
  totalProblems?: number
  children: ReactNode
  feedback: CheckResult | null
  completed: boolean
  revealedHintIds: string[]
  onRevealHint: (hintId: string) => void
  nextProblemId?: string
  completionMessage?: string
  hideHints?: boolean
}

export function ProblemLayout({
  problem,
  problemNumber,
  totalProblems = 8,
  children,
  feedback,
  completed,
  revealedHintIds,
  onRevealHint,
  nextProblemId,
  completionMessage,
  hideHints,
}: ProblemLayoutProps) {
  return (
    <div className="page problem-page">
      <nav className="problem-nav">
        <Link to={CHAPTER_PATH}>← Back to chapter</Link>
      </nav>

      <header className="problem-header">
        <p className="chapter-eyebrow">
          Problem {problemNumber} of {totalProblems}
        </p>
        <h1>{problem.title}</h1>
        <p className="problem-concept">{problem.concept}</p>
        <p>{problem.scenarioText}</p>
      </header>

      {completed ? (
        <section className="card feedback-success">
          <h2>Problem complete!</h2>
          <p>
            {completionMessage ??
              'You met all completion requirements for this problem.'}
          </p>
          <div className="placeholder-actions">
            {nextProblemId && (
              <Link to={`${CHAPTER_PATH}/problem/${nextProblemId}`} className="btn-secondary">
                Next problem
              </Link>
            )}
            <Link to={CHAPTER_PATH} className="btn-text-link">
              Back to chapter
            </Link>
          </div>
        </section>
      ) : (
        <>
          {children}
          {!hideHints && (
            <HintPanel
              hints={problem.hints}
              revealedHintIds={revealedHintIds}
              onRevealHint={onRevealHint}
            />
          )}
        </>
      )}

      {!completed && feedback && (
        <FeedbackPanel
          message={feedback.feedback}
          type={resultToFeedbackType(feedback)}
        />
      )}
    </div>
  )
}

export type { ProblemHint }
