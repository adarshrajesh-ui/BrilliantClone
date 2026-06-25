// Validation and Test Coverage — Expected Value Lab (15-problem chapter)
// ----------------------------------------------------------------------
// A PRD-aligned checklist for the full 5-lesson × 3-problem chapter. This is a
// validation artifact, not a runtime test result. Items whose requirement is
// fully covered by the deterministic layer carry status 'pass' and name the
// asserting test (prdCoverage.test.ts / liveCheckerValidation.test.ts). Items
// requiring the live app, Firebase, or visual/animation/a11y inspection are
// 'not_run' (tracked in docs/validation-plan.md manual audit).

export type ChecklistCategory =
  | 'scope'
  | 'structure'
  | 'auth'
  | 'progress'
  | 'migration'
  | 'problem engine'
  | 'answer checking'
  | 'gates'
  | 'layout'
  | 'accessibility'
  | 'visual interactions'
  | 'mobile'
  | 'persistence'
  | 'mastery'
  | 'guardrails'

export type ChecklistStatus = 'not_run' | 'pass' | 'fail'

export interface ChecklistItem {
  id: string
  category: ChecklistCategory
  requirement: string
  validationMethod: string
  status: ChecklistStatus
  notes: string
}

export const prdValidationChecklist: ChecklistItem[] = [
  // ---- scope ----
  { id: 'scope-single-chapter', category: 'scope', requirement: 'Exactly one chapter: Expected Value, with 5 lessons and 15 interactive problems.', validationMethod: 'prdCoverage.test.ts asserts ALL_PROBLEMS.length === 15.', status: 'pass', notes: 'No additional chapters.' },
  { id: 'scope-no-ai', category: 'scope', requirement: 'No AI tutor / hints / feedback / generated problems / model calls anywhere.', validationMethod: 'Code review: checkers are pure & synchronous; hints/feedback are static strings.', status: 'pass', notes: 'PRD hard guardrail; deterministic checkers verified by liveCheckerValidation.test.ts.' },

  // ---- structure ----
  { id: 'structure-5x3', category: 'structure', requirement: '5 lessons × 3 problems = 15; each lesson has exactly 3 problems.', validationMethod: 'prdCoverage.test.ts: PROBLEMS_PER_LESSON === 3 and each lesson has 3.', status: 'pass', notes: 'CANONICAL_LESSONS × getProblemsForLesson.' },
  { id: 'structure-global-index', category: 'structure', requirement: 'globalProblemIndex runs 0..14 in canonical order.', validationMethod: 'prdCoverage.test.ts asserts contiguous 0..14.', status: 'pass', notes: 'Recomputed on the 15-problem scale.' },
  { id: 'structure-legacy-ids', category: 'structure', requirement: 'Legacy storage IDs problem-1..8 preserved on their canonical slots.', validationMethod: 'prdCoverage.test.ts checks each legacy storage ID resolves to expected slug.', status: 'pass', notes: 'problem-1→ev-l1-p1 … problem-8→ev-l5-p2.' },
  { id: 'structure-implemented', category: 'structure', requirement: 'Every IMPLEMENTED_PROBLEM_ID has a ProblemDefinition.', validationMethod: 'prdCoverage.test.ts: getProblemDefinition(id) defined for all 15.', status: 'pass', notes: 'Routing never lands on a placeholder.' },

  // ---- migration ----
  { id: 'migration-removed-slugs', category: 'migration', requirement: 'Removed legacy slugs resolve to their mapped successor problem.', validationMethod: 'prdCoverage.test.ts: resolveCanonicalProblem(removedSlug) === successor.', status: 'pass', notes: 'l1-short-run-vs-long-run→ev-l1-p2; l5-low-risk-vs-high-risk→ev-l5-p3; etc.' },
  { id: 'migration-completion-counts', category: 'migration', requirement: 'Completion of a removed slug counts as completion of its successor for progress/percentage.', validationMethod: 'prdCoverage.test.ts: uniqueCompletedCount([removedSlug]) === 1.', status: 'pass', notes: 'completedProblemIds keep historical IDs; resolver maps them.' },

  // ---- progress ----
  { id: 'progress-chapter-pct', category: 'progress', requirement: 'Chapter completion = completed unique canonical problems ÷ 15 × 100.', validationMethod: 'prdCoverage.test.ts: getChapterCompletionPercentage.', status: 'pass', notes: '3 of 15 → 20%.' },
  { id: 'progress-lesson-pct', category: 'progress', requirement: 'Lesson completion = completed in lesson ÷ 3 × 100.', validationMethod: 'prdCoverage.test.ts: getLessonCompletionPercentage.', status: 'pass', notes: '1 of 3 → 33%.' },
  { id: 'progress-continue', category: 'progress', requirement: 'Continue routes to the first incomplete problem (globalProblemIndex 0..14).', validationMethod: 'getContinueProblemId selector (Agent 1) + manual QA.', status: 'not_run', notes: 'Selector unit-tested in core suite; end-to-end needs live app.' },
  { id: 'progress-resume', category: 'progress', requirement: 'Learner resumes at the same problem after leaving mid-chapter.', validationMethod: 'Manual QA: leave mid-chapter, return.', status: 'not_run', notes: 'Requires session persistence + live app.' },

  // ---- problem engine / answer checking ----
  { id: 'engine-completion-rules', category: 'problem engine', requirement: 'Each problem enforces its completion rule before allowing completion.', validationMethod: 'liveCheckerValidation.test.ts: every correct case canComplete; guards do not.', status: 'pass', notes: 'All 15 live checkers exercised.' },
  { id: 'answer-accepted-formats', category: 'answer checking', requirement: 'Accepted money / probability / classification formats normalize correctly.', validationMethod: 'liveCheckerValidation.test.ts normalizer cases.', status: 'pass', notes: 'Shared parser, ±0.01 tolerance.' },
  { id: 'answer-mistake-types', category: 'answer checking', requirement: 'Incorrect answers are rejected with the PRD-correct mistakeType.', validationMethod: 'liveCheckerValidation.test.ts mistake cases per problem.', status: 'pass', notes: 'Exact mistakeType asserted against live checkers.' },
  { id: 'answer-attempt-counting', category: 'answer checking', requirement: 'Guard submits do not count as attempts; graded wrong/correct submits do.', validationMethod: 'liveCheckerValidation.test.ts via isGradedAttempt (empty-string AND null guard conventions).', status: 'pass', notes: 'Two guard conventions exist across checkers; both handled.' },
  { id: 'answer-direct-correction', category: 'answer checking', requirement: 'Correcting a wrong answer and resubmitting passes without reset.', validationMethod: 'liveCheckerValidation.test.ts correction pair (pure checker resubmit).', status: 'pass', notes: 'UI stale-feedback-clears verified structurally.' },
  { id: 'answer-feedback-under-100ms', category: 'problem engine', requirement: 'Feedback is instant (<100ms), deterministic, specific.', validationMethod: 'Code review: synchronous, no async/AI; manual timing.', status: 'pass', notes: 'No model calls in the checker path.' },

  // ---- gates (the five P1 fun-interaction gates) ----
  { id: 'gate-l1p1-total-rolls', category: 'gates', requirement: 'L1P1: ≥100 total throws before the final answer validates.', validationMethod: 'liveCheckerValidation.test.ts guard l1p1-guard-total.', status: 'pass', notes: 'No prediction or manual-roll minimum.' },
  { id: 'gate-l2p1-board-before-formula', category: 'gates', requirement: 'L2P1: formula locked until both board tokens dropped.', validationMethod: 'liveCheckerValidation.test.ts guard l2p1-guard-board.', status: 'pass', notes: 'Board-before-formula gate.' },
  { id: 'gate-l3p1-fields-filled', category: 'gates', requirement: 'L3P1: the average-card-value answer is guarded until the 10-group count, deck total, and EV are all filled.', validationMethod: 'liveCheckerValidation.test.ts guard l3p1-guard-empty.', status: 'pass', notes: 'Card-deal scene auto-plays; the checker guards on empty fields rather than a reveal gate.' },
  { id: 'gate-l4p1-cost-before-profit', category: 'gates', requirement: 'L4P1: profit input locked until the $3 cost token is placed.', validationMethod: 'liveCheckerValidation.test.ts guard l4p1-guard-cost.', status: 'pass', notes: 'Cost-before-profit gate.' },
  { id: 'gate-l5p1-both-preview', category: 'gates', requirement: 'L5P1: both 5-round previews required before the MC is graded.', validationMethod: 'liveCheckerValidation.test.ts guard l5p1-guard-preview.', status: 'pass', notes: 'Both-preview gate.' },
  { id: 'gate-l5p3-group-wheel', category: 'gates', requirement: 'L5P3 capstone: wheel must be grouped before the table validates.', validationMethod: 'liveCheckerValidation.test.ts guard l5p3-guard-grouped.', status: 'pass', notes: 'Tap-to-group gate.' },

  // ---- cohesion ----
  { id: 'cohesion-l5p2-distinct', category: 'answer checking', requirement: 'L5P2 numbers ($6 vs $12/$0) are distinct from L5P1 ($5 vs $10/$0); checker rejects L5P1 payouts.', validationMethod: 'liveCheckerValidation.test.ts l5p2-mistake-l5p1numbers (EV $5 → ev-arithmetic-error).', status: 'pass', notes: 'Cohesion guard prevents duplicate-scenario regression.' },

  // ---- layout / accessibility / mobile (manual) ----
  { id: 'layout-no-scroll-chasing', category: 'layout', requirement: 'No scroll-chasing: visual + active control + feedback stay spatially connected at 1280×720.', validationMethod: 'Manual audit at 1280×720 (docs/validation-plan.md §A11y).', status: 'not_run', notes: 'Two-region desktop workspace; feedback beneath the active control.' },
  { id: 'layout-feedback-beside-control', category: 'layout', requirement: 'Feedback appears beside/beneath the active control, never at page bottom.', validationMethod: 'Manual audit per problem.', status: 'not_run', notes: 'Wrong-answer feedback must be visible without scroll.' },
  { id: 'a11y-tap-to-place', category: 'accessibility', requirement: 'Every drag/drop also supports tap-to-select / tap-to-place; correctness never depends on drag.', validationMethod: 'Manual QA per interactive problem.', status: 'not_run', notes: 'Tap is the default on mobile.' },
  { id: 'a11y-touch-targets', category: 'accessibility', requirement: 'Touch targets ≥44px (≥48px on dice/throw zone).', validationMethod: 'Manual audit at mobile viewport.', status: 'not_run', notes: 'No horizontal scrolling on mobile.' },
  { id: 'a11y-live-regions', category: 'accessibility', requirement: 'Live region announces each result/feedback within 100ms; graphs have text summaries.', validationMethod: 'Manual screen-reader audit.', status: 'not_run', notes: 'Keyboard focus order task→controls→input→check→feedback→continue.' },
  { id: 'a11y-reduced-motion', category: 'accessibility', requirement: 'Reduced-motion paths skip animation but preserve identical deterministic outcomes.', validationMethod: 'Seeded outcome functions (feature unit tests) + manual visual audit.', status: 'not_run', notes: 'tap == drag == keyboard == reduced-motion for the same index.' },
  { id: 'mobile-responsive', category: 'mobile', requirement: 'All screens work at phone width; sticky task strip; feedback auto-scrolls into view.', validationMethod: 'Manual QA at mobile viewport.', status: 'not_run', notes: 'Requires live app / device emulation.' },

  // ---- persistence ----
  { id: 'persist-completed-ids', category: 'persistence', requirement: 'Completed problem IDs persist across sessions as storage IDs.', validationMethod: 'Manual QA + read chapterProgressService.', status: 'not_run', notes: 'Structural confirmation in code.' },
  { id: 'persist-attempts', category: 'persistence', requirement: 'Attempts, hint usage, normalized answers, mistake types, attemptMode recorded.', validationMethod: 'Manual QA + read problemAttemptService.', status: 'not_run', notes: 'Requires Firestore writes.' },
  { id: 'persist-no-env-committed', category: 'persistence', requirement: 'No .env / secrets committed to the repo.', validationMethod: 'Manual QA: inspect git status / .gitignore.', status: 'not_run', notes: 'Verify before any commit.' },

  // ---- mastery ----
  { id: 'mastery-rule', category: 'mastery', requirement: 'Mastery: all 15 complete, capstone (ev-l5-p3) + payout-vs-profit (ev-l4-p1) + same-EV-vs-risk (ev-l5-p2) correct, ≥11/15 within ≤2 graded attempts.', validationMethod: 'prdCoverage.test.ts: STRONG_ATTEMPT_THRESHOLD === 11 + evaluateChapterMastery scenarios.', status: 'pass', notes: 'Practice restarts excluded from strong count.' },
  { id: 'mastery-states', category: 'mastery', requirement: 'Mastery states: Not Started, Learning, Developing, Mastered.', validationMethod: 'prdCoverage.test.ts: deriveMasteryStatus boundaries.', status: 'pass', notes: 'Developing at ≥ ceil(15/2)=8 completed.' },

  // ---- guardrails ----
  { id: 'guard-no-dragdrop-correctness', category: 'guardrails', requirement: 'No drag/drop-only correctness; tap-to-select/tap-to-place remains required.', validationMethod: 'Manual QA per interactive problem.', status: 'not_run', notes: 'PRD hard guardrail.' },
  { id: 'guard-no-leaderboards-payments-social', category: 'guardrails', requirement: 'No leaderboards, payments, teacher dashboards, or social features.', validationMethod: 'Manual review of UI/features.', status: 'not_run', notes: 'PRD hard guardrail.' },
  { id: 'guard-no-extra-chapters', category: 'guardrails', requirement: 'No additional chapters or full course.', validationMethod: 'prdCoverage.test.ts (single chapter) + manual review.', status: 'pass', notes: 'PRD hard guardrail.' },
]

export const checklistCategories: ChecklistCategory[] = [
  'scope',
  'structure',
  'auth',
  'progress',
  'migration',
  'problem engine',
  'answer checking',
  'gates',
  'layout',
  'accessibility',
  'visual interactions',
  'mobile',
  'persistence',
  'mastery',
  'guardrails',
]

export function checklistByCategory(category: ChecklistCategory): ChecklistItem[] {
  return prdValidationChecklist.filter((item) => item.category === category)
}

/** Counts by status, for a quick "what's automated vs manual" summary. */
export function checklistSummary(): Record<ChecklistStatus, number> {
  return prdValidationChecklist.reduce(
    (acc, item) => {
      acc[item.status] += 1
      return acc
    },
    { not_run: 0, pass: 0, fail: 0 } as Record<ChecklistStatus, number>,
  )
}
