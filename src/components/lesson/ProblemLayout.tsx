import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { CheckResult, ProblemDefinition, ProblemHint } from '../../types/problem'
import { CHAPTER_PROBLEMS } from '../../data/chapter'
import { HintPanel } from './HintPanel'
import {
  ResponsiveProblemShell,
  LearningCoachPanel,
  ProblemIntroDemo,
  ReviewModeBanner,
  ShowDemoAgainAction,
  useDemoVisibility,
  buildFallbackDemoSteps,
  checkResultToCoachFeedback,
  configKeyFor,
} from '../../features/learning-experience'
import type { DemoStepConfig } from '../../features/learning-experience'

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
  /**
   * Optional problem-specific demo steps (Agents 3/4). When omitted, a generic
   * fallback demo is derived from the problem definition.
   */
  demoSteps?: DemoStepConfig[]
  /** Closing call-to-action shown on the last demo step. */
  demoFinalCta?: string
  /** Short concept reinforcement shown by the coach on a correct answer. */
  conceptSummary?: string
}

function ReviewDetail({
  problem,
  completionMessage,
  nextProblemId,
  attemptCount,
  lastSubmittedAnswer,
  reviewHintUsed,
}: {
  problem: ProblemDefinition
  completionMessage?: string
  nextProblemId?: string
  attemptCount?: number
  lastSubmittedAnswer?: string | null
  reviewHintUsed?: boolean
}) {
  const correctFeedback =
    problem.feedback.correct ??
    completionMessage ??
    'You met all completion requirements for this problem.'

  return (
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
            Continue to next problem
          </Link>
        )}
        <Link to={CHAPTER_PATH} className="btn-text-link">
          Back to chapter
        </Link>
      </div>
    </section>
  )
}

export function ProblemLayout({
  problem,
  problemNumber,
  totalProblems = CHAPTER_PROBLEMS.length,
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
  demoSteps,
  demoFinalCta,
  conceptSummary,
}: ProblemLayoutProps) {
  const navigate = useNavigate()
  const showReview = completed && !restarted
  const showInteractive = !completed || restarted

  // Demo gating. The demo never auto-shows on a completed problem (review is the
  // default); it can still be re-opened explicitly. Local-only state — no
  // attempts, hints, or progress are touched.
  const demo = useDemoVisibility(configKeyFor(problem.problemId), { disabled: completed })
  const steps = demoSteps ?? buildFallbackDemoSteps(problem)

  const header = (
    <>
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
    </>
  )

  // Pre-problem (or replay) demo takes over the page until skipped/started.
  if (demo.showDemo) {
    return (
      <div className="page problem-page">
        {header}
        <ProblemIntroDemo
          steps={steps}
          finalCallToAction={demoFinalCta}
          onSkip={demo.markSeen}
          onStart={demo.markSeen}
        />
      </div>
    )
  }

  const coachFeedback = feedback
    ? checkResultToCoachFeedback(feedback, { conceptSummary })
    : null
  const hintsRemaining = problem.hints.length - revealedHintIds.length
  const revealNextHint = () => {
    const next = problem.hints.find((h) => !revealedHintIds.includes(h.id))
    if (next) {
      onRevealHint(next.id)
    }
  }

  return (
    <div className="page problem-page">
      {header}

      {showReview && (
        <>
          <ReviewModeBanner onRestart={onRestart} onShowDemo={demo.showAgain} />
          <ReviewDetail
            problem={problem}
            completionMessage={completionMessage}
            nextProblemId={nextProblemId}
            attemptCount={attemptCount}
            lastSubmittedAnswer={lastSubmittedAnswer}
            reviewHintUsed={reviewHintUsed}
          />
        </>
      )}

      {showInteractive && (
        <ResponsiveProblemShell
          banner={
            completed && restarted ? (
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
            ) : undefined
          }
          taskPanel={
            taskGuide ? (
              <div className="task-area">
                {taskGuide}
                <div className="task-area-actions">
                  <ShowDemoAgainAction onShowDemo={demo.showAgain} />
                </div>
              </div>
            ) : undefined
          }
          coachPanel={
            <LearningCoachPanel
              feedback={coachFeedback}
              onContinue={
                feedback?.canComplete && nextProblemId
                  ? () => navigate(`${CHAPTER_PATH}/problem/${nextProblemId}`)
                  : undefined
              }
              continueLabel="Continue to next problem"
              onRequestHint={hideHints ? undefined : revealNextHint}
              hintsRemaining={hideHints ? 0 : hintsRemaining}
            />
          }
          hintPanel={
            !hideHints ? (
              <HintPanel
                hints={problem.hints}
                revealedHintIds={revealedHintIds}
                onRevealHint={onRevealHint}
                visualCue={visualCueFor(problem.visualType)}
              />
            ) : undefined
          }
        >
          {children}
        </ResponsiveProblemShell>
      )}
    </div>
  )
}

export type { ProblemHint }
