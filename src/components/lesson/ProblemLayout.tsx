import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { CheckResult, ProblemDefinition, ProblemHint } from '../../types/problem'
import { FeedbackPanel, resultToFeedbackType } from './FeedbackPanel'
import { HintPanel } from './HintPanel'

const CHAPTER_PATH = '/chapter/expected-value-intro'

const VISUAL_CUES: Record<string, string> = {
  spinner: 'the running-average graph',
  'spinner-graph': 'the running-average graph',
  'formula-builder': 'the formula you built',
  'weighted-average': 'the formula you built',
  'mystery-boxes': 'the revealed boxes',
  'ev-table': 'the contribution column',
  'balance-scale': 'the balance scale',
  'fairness-buckets': 'the fairness number line',
  'wheel-table': 'the wheel and the probability table',
  'risk-graph': 'the flat line versus the jagged line',
}

function visualCueFor(visualType: string): string {
  return VISUAL_CUES[visualType] ?? 'the diagram above'
}

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
  taskGuide?: ReactNode
  /** Whether the learner has explicitly restarted this completed problem. */
  restarted?: boolean
  /** Begin a fresh practice attempt on a completed problem. */
  onRestart?: () => void
  /** Return from a restart attempt to the completed review view. */
  onReview?: () => void
  /** Number of recorded final attempts (for the review summary). */
  attemptCount?: number
  /** The learner's last submitted final answer, if recorded. */
  lastSubmittedAnswer?: string | null
  /** Whether any recorded attempt used a hint. */
  reviewHintUsed?: boolean
}

function ReviewMode({
  problem,
  completionMessage,
  nextProblemId,
  onRestart,
  attemptCount,
  lastSubmittedAnswer,
  reviewHintUsed,
}: {
  problem: ProblemDefinition
  completionMessage?: string
  nextProblemId?: string
  onRestart?: () => void
  attemptCount?: number
  lastSubmittedAnswer?: string | null
  reviewHintUsed?: boolean
}) {
  const correctFeedback =
    problem.feedback.correct ??
    completionMessage ??
    'You met all completion requirements for this problem.'

  return (
    <>
      <section className="card review-banner">
        <div className="review-banner-head">
          <span className="review-badge" aria-hidden="true">
            ✓
          </span>
          <div>
            <p className="review-banner-title">Completed — Review or restart</p>
            <p className="review-banner-sub">
              You can revisit your result, or start a fresh practice attempt.
            </p>
          </div>
        </div>
        <div className="review-actions">
          <span className="btn-secondary review-mode-active" aria-current="true">
            Review Problem
          </span>
          {onRestart && (
            <button type="button" className="btn-outline touch-target" onClick={onRestart}>
              Restart This Problem
            </button>
          )}
        </div>
      </section>

      <section className="card review-detail" aria-label="Completed problem review">
        <p className="review-state-label">Completed — Review Mode</p>

        <div className="review-row">
          <span className="review-row-label">Correct result</span>
          <p className="review-row-value">{correctFeedback}</p>
        </div>

        {lastSubmittedAnswer != null && lastSubmittedAnswer !== '' && (
          <div className="review-row">
            <span className="review-row-label">Your final answer</span>
            <p className="review-row-value">{lastSubmittedAnswer}</p>
          </div>
        )}

        {completionMessage && (
          <div className="review-row">
            <span className="review-row-label">What you did</span>
            <p className="review-row-value">{completionMessage}</p>
          </div>
        )}

        <ul className="review-summary-stats">
          <li>
            <span>Status</span>
            <strong className="review-stat-complete">Complete ✓</strong>
          </li>
          {typeof attemptCount === 'number' && attemptCount > 0 && (
            <li>
              <span>Attempts</span>
              <strong>{attemptCount}</strong>
            </li>
          )}
          <li>
            <span>Hints used</span>
            <strong>{reviewHintUsed ? 'Yes' : 'No'}</strong>
          </li>
        </ul>

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
    </>
  )
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
  taskGuide,
  restarted = false,
  onRestart,
  onReview,
  attemptCount,
  lastSubmittedAnswer,
  reviewHintUsed,
}: ProblemLayoutProps) {
  const showReview = completed && !restarted
  const showInteractive = !completed || restarted

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

      {showReview && (
        <ReviewMode
          problem={problem}
          completionMessage={completionMessage}
          nextProblemId={nextProblemId}
          onRestart={onRestart}
          attemptCount={attemptCount}
          lastSubmittedAnswer={lastSubmittedAnswer}
          reviewHintUsed={reviewHintUsed}
        />
      )}

      {showInteractive && (
        <>
          {completed && restarted && (
            <section className="card restart-banner" role="status">
              <p className="restart-banner-title">Restarted practice attempt</p>
              <p className="restart-banner-sub">
                This is a fresh attempt — your chapter progress is already saved and
                won't change.
              </p>
              {onReview && (
                <button type="button" className="btn-text" onClick={onReview}>
                  ← Back to review
                </button>
              )}
            </section>
          )}
          {taskGuide}
          {children}
          {!hideHints && (
            <HintPanel
              hints={problem.hints}
              revealedHintIds={revealedHintIds}
              onRevealHint={onRevealHint}
              visualCue={visualCueFor(problem.visualType)}
            />
          )}
          {feedback && (
            <FeedbackPanel
              message={feedback.feedback}
              type={resultToFeedbackType(feedback)}
            />
          )}
        </>
      )}
    </div>
  )
}

export type { ProblemHint }
