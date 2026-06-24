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
   * Optional demo steps. A demo is shown ONLY when a problem introduces a
   * brand-new UI interaction and these steps are supplied. When omitted, no
   * demo (and no demo affordances) are shown — problems do not get a demo just
   * for existing, and demos never repeat the problem statement.
   */
  demoSteps?: DemoStepConfig[]
  /** Closing call-to-action shown on the last demo step. */
  demoFinalCta?: string
  /** Short concept reinforcement shown by the coach on a correct answer. */
  conceptSummary?: string
}

/**
 * Render a recorded final answer for review. Most problems store a short string,
 * but defensively handle any legacy structured answers (e.g. a JSON array of
 * probability-table rows) so learners never see raw JSON in review/completed state.
 */
function ReviewAnswer({ value }: { value: string }) {
  const trimmed = value.trim()
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed)
      const rows = Array.isArray(parsed) ? parsed : [parsed]
      const looksLikeTableRows = rows.every(
        (r) => r && typeof r === 'object' && ('outcome' in r || 'count' in r || 'probability' in r),
      )
      if (looksLikeTableRows) {
        return (
          <ul className="review-answer-rows">
            {rows.map((r, i) => {
              const outcome = r.outcome != null ? String(r.outcome) : '—'
              const count = r.count != null && r.count !== '' ? String(r.count) : '—'
              const probability =
                r.probability != null && r.probability !== '' ? String(r.probability) : '—'
              return (
                <li key={i}>
                  {outcome} → count {count} → probability {probability}
                </li>
              )
            })}
          </ul>
        )
      }
    } catch {
      // Not valid JSON — fall through and render as plain text.
    }
  }
  return <p className="review-row-value">{value}</p>
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
          <ReviewAnswer value={lastSubmittedAnswer} />
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

  // A demo exists only when the problem introduces a brand-new UI interaction
  // and supplies steps for it. Otherwise there is no demo at all.
  const steps = demoSteps ?? []
  const hasDemo = steps.length > 0

  // Demo gating. The demo never auto-shows on a completed problem (review is the
  // default); it can still be re-opened explicitly. Local-only state — no
  // attempts, hints, or progress are touched.
  const demo = useDemoVisibility(configKeyFor(problem.problemId), {
    disabled: completed || !hasDemo,
  })

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
  if (hasDemo && demo.showDemo) {
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
          <ReviewModeBanner
            onRestart={onRestart}
            onShowDemo={hasDemo ? demo.showAgain : undefined}
          />
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
                {hasDemo && (
                  <div className="task-area-actions">
                    <ShowDemoAgainAction onShowDemo={demo.showAgain} />
                  </div>
                )}
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
