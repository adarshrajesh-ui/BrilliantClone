import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { CheckResult, ProblemDefinition, ProblemHint } from '../../types/problem'
import {
  CHAPTER_PROBLEMS,
  getAdjacentNextProblemId,
  getAdjacentPreviousProblemId,
  getProblemMeta,
} from '../../data/chapter'
import {
  getNextImplementedProblemId,
  getPreviousImplementedProblemId,
} from '../../data/implementedProblems'
import { HintPanel } from './HintPanel'
import {
  ResponsiveProblemShell,
  WorkspaceSteps,
  LearningCoachPanel,
  ProblemIntroDemo,
  ReviewModeBanner,
  ShowDemoAgainAction,
  TeachingExplanationSection,
  useDemoVisibility,
  checkResultToCoachFeedback,
  configKeyFor,
} from '../../features/learning-experience'
import type { DemoStepConfig, WorkspaceStepDef } from '../../features/learning-experience'

const CHAPTER_PATH = '/chapter/expected-value-intro'

const VISUAL_CUES: Record<string, string> = {
  spinner: 'the running-average graph',
  'spinner-graph': 'the running-average graph',
  'dice-tray': 'the running-average graph and the sum histogram',
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
  /**
   * Legacy stacked problem content. Optional: when `steps` is provided the
   * workspace renders those instead and `children` is ignored.
   */
  children?: ReactNode
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
  /**
   * Ordered no-scroll step panels. When provided (and the problem is in the
   * interactive, non-review state), the workspace renders ONE step at a time
   * inside a fixed-viewport panel with a Prev/Next bottom bar + step indicator.
   * The Learning Coach feedback and Continue action render in the same bottom
   * bar (same panel as the attempted action). When omitted, `children` render
   * as before (legacy scroll fallback).
   */
  steps?: WorkspaceStepDef[]
  /**
   * Forwarded to WorkspaceSteps.onStepChange. Pass `session.clearFeedback` so
   * stale coach feedback clears when the learner moves between steps and never
   * bleeds across them.
   */
  onStepChange?: () => void
}

/**
 * Completed-problem review: confirmation, teaching explanation, and attempt stats.
 * Never surfaces a bare "your final answer" recap — the teaching block carries the
 * intuition instead.
 */
function ReviewDetail({
  problem,
  completionMessage,
  previousProblemId,
  nextProblemId,
  attemptCount,
  reviewHintUsed,
}: {
  problem: ProblemDefinition
  completionMessage?: string
  previousProblemId?: string
  nextProblemId?: string
  attemptCount?: number
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

      {problem.teachingExplanation && (
        <TeachingExplanationSection explanation={problem.teachingExplanation} />
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
        <ProblemNavigationControls
          previousProblemId={previousProblemId}
          nextProblemId={nextProblemId}
          nextEnabled
        />
        <Link to={CHAPTER_PATH} className="btn-text-link">
          Back to course map
        </Link>
      </div>
    </section>
  )
}

function problemHref(problemId: string): string {
  return `${CHAPTER_PATH}/problem/${problemId}`
}

function ProblemNavigationControls({
  previousProblemId,
  nextProblemId,
  nextEnabled,
}: {
  previousProblemId?: string
  nextProblemId?: string
  nextEnabled: boolean
}) {
  if (!previousProblemId && !nextProblemId) {
    return null
  }

  return (
    <nav className="problem-nav-controls" aria-label="Problem navigation">
      {previousProblemId && (
        <Link to={problemHref(previousProblemId)} className="btn-text problem-prev-link">
          ← Previous problem
        </Link>
      )}
      {nextProblemId &&
        (nextEnabled ? (
          <Link to={problemHref(nextProblemId)} className="btn-secondary touch-target problem-next-link">
            Next problem →
          </Link>
        ) : (
          <button
            type="button"
            className="btn-secondary touch-target problem-next-link"
            disabled
            title="Answer this problem correctly to unlock Next."
          >
            Next problem →
          </button>
        ))}
    </nav>
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
  reviewHintUsed,
  demoSteps,
  demoFinalCta,
  conceptSummary,
  steps: workspaceSteps,
  onStepChange,
}: ProblemLayoutProps) {
  const freshlyCompleted = feedback?.canComplete === true && !restarted
  const showReview = completed && !restarted && !freshlyCompleted
  const showInteractive = !showReview
  const useWorkspace = !!workspaceSteps && workspaceSteps.length > 0

  // Single source of truth for ordering: derive the displayed problem number and
  // the "next problem" target from the canonical chapter model (keyed by storage
  // ID), so in-problem navigation and the chapter map always agree. The passed
  // props are kept as fallbacks for any non-canonical/standalone usage.
  const canonicalMeta = getProblemMeta(problem.problemId)
  const resolvedProblemNumber = canonicalMeta ? canonicalMeta.globalProblemIndex + 1 : problemNumber
  // Advance to the next problem that actually has an interactive implementation,
  // skipping unimplemented placeholders. Falls back to the strictly-adjacent
  // problem (then the passed prop) only when no implemented problem remains.
  const resolvedNextProblemId =
    getNextImplementedProblemId(problem.problemId) ??
    getAdjacentNextProblemId(problem.problemId) ??
    nextProblemId
  const resolvedPreviousProblemId =
    getPreviousImplementedProblemId(problem.problemId) ??
    getAdjacentPreviousProblemId(problem.problemId)
  const canNavigateNextProblem = completed || feedback?.canComplete === true

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
        <Link to={CHAPTER_PATH}>← Back to course map</Link>
      </nav>
      <header className="problem-header">
        <p className="chapter-eyebrow">
          Problem {resolvedProblemNumber} of {totalProblems}
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
    ? checkResultToCoachFeedback(feedback, {
        conceptSummary,
        teaching: problem.teachingExplanation,
      })
    : null
  const hintsRemaining = problem.hints.length - revealedHintIds.length
  const revealNextHint = () => {
    const next = problem.hints.find((h) => !revealedHintIds.includes(h.id))
    if (next) {
      onRevealHint(next.id)
    }
  }

  // Shared pieces reused by both the no-scroll workspace and the legacy shell.
  const restartBanner =
    completed && restarted ? (
      <section className="card restart-banner" role="status">
        <p className="restart-banner-title">Restarted practice attempt</p>
        <p className="restart-banner-sub">
          This is a fresh attempt — your chapter progress is already saved and won't change.
        </p>
        {onReview && (
          <button type="button" className="btn-text" onClick={onReview}>
            ← Back to review
          </button>
        )}
      </section>
    ) : undefined

  const learningCoachNode = coachFeedback ? (
    <LearningCoachPanel
      feedback={coachFeedback}
      onRequestHint={hideHints ? undefined : revealNextHint}
      hintsRemaining={hideHints ? 0 : hintsRemaining}
    />
  ) : null
  const problemNavigationNode = (
    <ProblemNavigationControls
      previousProblemId={resolvedPreviousProblemId}
      nextProblemId={resolvedNextProblemId}
      nextEnabled={canNavigateNextProblem}
    />
  )
  const coachPanelNode = learningCoachNode || !useWorkspace ? (
    <div className="problem-coach-stack">
      {learningCoachNode}
      {!useWorkspace && problemNavigationNode}
    </div>
  ) : null

  const hintPanelNode = !hideHints ? (
    <HintPanel
      hints={problem.hints}
      revealedHintIds={revealedHintIds}
      onRevealHint={onRevealHint}
      visualCue={visualCueFor(problem.visualType)}
    />
  ) : undefined

  // No-scroll Brilliant-like workspace. Applies only to the interactive solving
  // state; review/demo keep their existing rendering. The workspace renders its
  // own compact header, so the legacy back-nav/header stack is omitted here.
  if (useWorkspace && showInteractive) {
    return (
      <div className="page problem-page">
        <WorkspaceSteps
          problemTitle={problem.title}
          scenarioText={problem.scenarioText}
          problemNumber={resolvedProblemNumber}
          totalProblems={totalProblems}
          steps={workspaceSteps!}
          banner={restartBanner}
          coachPanel={coachPanelNode}
          previousProblemHref={
            resolvedPreviousProblemId ? problemHref(resolvedPreviousProblemId) : undefined
          }
          nextProblemHref={resolvedNextProblemId ? problemHref(resolvedNextProblemId) : undefined}
          nextProblemEnabled={canNavigateNextProblem}
          hintPanel={hintPanelNode}
          backHref={CHAPTER_PATH}
          onStepChange={() => onStepChange?.()}
        />
      </div>
    )
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
            previousProblemId={resolvedPreviousProblemId}
            nextProblemId={resolvedNextProblemId}
            attemptCount={attemptCount}
            reviewHintUsed={reviewHintUsed}
          />
        </>
      )}

      {showInteractive && (
        <ResponsiveProblemShell
          banner={restartBanner}
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
          coachPanel={coachPanelNode}
          hintPanel={hintPanelNode}
        >
          {children}
        </ResponsiveProblemShell>
      )}
    </div>
  )
}

export type { ProblemHint }
