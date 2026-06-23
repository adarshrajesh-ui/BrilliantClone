// Validation and Test Coverage — Expected Value Lab MVP
// ------------------------------------------------------
// A PRD-aligned checklist for the established 8-problem MVP. This is a validation
// artifact, not a runtime test result: most items are status "not_run" because
// they require the running app, Firebase, or manual QA. Items whose requirement
// is fully covered by the deterministic matrix point to that as their
// validationMethod, but are still left "not_run" here so the source of truth for
// pass/fail stays the runner (./runValidation.ts), never this static file.

export type ChecklistCategory =
  | 'scope'
  | 'auth'
  | 'progress'
  | 'problem engine'
  | 'answer checking'
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
  { id: 'scope-single-chapter', category: 'scope', requirement: 'Exactly one chapter: Expected Value, with 8 interactive problems.', validationMethod: 'Inspect ALL_PROBLEMS (length 8) and chapter data; manual review.', status: 'not_run', notes: 'Confirm no additional chapters exist.' },
  { id: 'scope-no-new-architecture', category: 'scope', requirement: 'No new 5-lesson architecture or new problems beyond the 8-problem MVP.', validationMethod: 'Manual review of problem data files.', status: 'not_run', notes: 'Out of scope for this validation layer.' },

  // ---- auth ----
  { id: 'auth-google-signin', category: 'auth', requirement: 'Google sign-in gates the chapter; profile created on first login.', validationMethod: 'Manual QA: sign in, verify profile doc.', status: 'not_run', notes: 'Requires Firebase Auth + live app.' },
  { id: 'auth-protected-routes', category: 'auth', requirement: 'Chapter/problem routes require an authenticated user.', validationMethod: 'Manual QA / read ProtectedRoute.', status: 'not_run', notes: 'Structural — verified by reading route guards.' },

  // ---- progress ----
  { id: 'progress-completion-percentage', category: 'progress', requirement: 'Completion percentage reflects completed problem count.', validationMethod: 'Manual QA after completing problems.', status: 'not_run', notes: 'Requires live progress state.' },
  { id: 'progress-resume', category: 'progress', requirement: 'Learner resumes at the same problem after leaving mid-chapter.', validationMethod: 'Manual QA: leave mid-chapter, return.', status: 'not_run', notes: 'Requires session persistence + live app.' },

  // ---- problem engine ----
  { id: 'engine-completion-rules', category: 'problem engine', requirement: 'Each problem enforces its completion rule before allowing completion.', validationMethod: 'Deterministic: completionRuleCases via runValidation.', status: 'not_run', notes: 'Run the validator to assert.' },
  { id: 'engine-required-actions', category: 'problem engine', requirement: 'Each problem requires its specified learner actions before grading.', validationMethod: 'Deterministic guard cases + problemBehaviors review.', status: 'not_run', notes: 'Guard cases assert non-graded incomplete states.' },
  { id: 'engine-feedback-under-100ms', category: 'problem engine', requirement: 'Feedback is instant (<100ms), deterministic, specific.', validationMethod: 'Manual QA timing; deterministic checker has no async/AI.', status: 'not_run', notes: 'No model calls in the checker path.' },

  // ---- answer checking ----
  { id: 'answer-accepted-formats', category: 'answer checking', requirement: 'Accepted answer formats (money/probability/classification) normalize correctly.', validationMethod: 'Deterministic: money/probability/classification cases via runValidation.', status: 'not_run', notes: 'Run the validator to assert.' },
  { id: 'answer-incorrect-rejection', category: 'answer checking', requirement: 'Incorrect answers are rejected with the correct mistakeType.', validationMethod: 'Deterministic: problemAnswerCases via runValidation.', status: 'not_run', notes: 'Run the validator to assert.' },
  { id: 'answer-direct-correction', category: 'answer checking', requirement: 'Correcting a wrong answer and resubmitting passes without reset.', validationMethod: 'Deterministic: directCorrectionCases via runValidation.', status: 'not_run', notes: 'Run the validator to assert.' },
  { id: 'answer-attempt-counting', category: 'answer checking', requirement: 'Guard submits do not count as attempts; graded wrong/correct submits do.', validationMethod: 'Deterministic: gradedAttemptExpectations via runValidation.', status: 'not_run', notes: 'Run the validator to assert.' },

  // ---- visual interactions ----
  { id: 'visual-tap-fallback', category: 'visual interactions', requirement: 'Every drag/drop interaction also supports tap-to-select/tap-to-place.', validationMethod: 'Manual QA on each interactive problem.', status: 'not_run', notes: 'Correctness must never depend on drag/drop.' },
  { id: 'visual-first-feedback', category: 'visual interactions', requirement: 'Hints/feedback are visual-first and hand-written.', validationMethod: 'Manual QA + read problem data hints.', status: 'not_run', notes: 'No AI-generated hints.' },

  // ---- mobile ----
  { id: 'mobile-responsive', category: 'mobile', requirement: 'All screens work at phone width with tap as the default interaction.', validationMethod: 'Manual QA at mobile viewport.', status: 'not_run', notes: 'Requires live app / device emulation.' },

  // ---- persistence ----
  { id: 'persist-completed-ids', category: 'persistence', requirement: 'Completed problem IDs persist across sessions.', validationMethod: 'Manual QA + read chapterProgressService.', status: 'not_run', notes: 'Structural confirmation available in code.' },
  { id: 'persist-attempts', category: 'persistence', requirement: 'Attempts, hint usage, normalized answers, and mistake types are recorded.', validationMethod: 'Manual QA + read problemAttemptService.', status: 'not_run', notes: 'Requires Firestore writes.' },
  { id: 'persist-no-env-committed', category: 'persistence', requirement: 'No .env / secrets committed to the repo.', validationMethod: 'Manual QA: inspect git status / .gitignore.', status: 'not_run', notes: 'Verify before any commit.' },

  // ---- mastery ----
  { id: 'mastery-rule', category: 'mastery', requirement: 'Mastery requires all 8 complete, P7 & P8 correct, ≥6/8 within 2 attempts, payout-vs-profit and same-EV-vs-risk distinguished.', validationMethod: 'Manual QA + read masteryService.', status: 'not_run', notes: 'Requires full run-through with attempt history.' },
  { id: 'mastery-states', category: 'mastery', requirement: 'Mastery states: Not Started, Learning, Developing, Mastered.', validationMethod: 'Read masteryService state machine.', status: 'not_run', notes: 'Structural confirmation in code.' },

  // ---- guardrails ----
  { id: 'guard-no-ai-tutor', category: 'guardrails', requirement: 'No AI tutor.', validationMethod: 'Code review: no model/inference calls in app paths.', status: 'not_run', notes: 'PRD hard guardrail.' },
  { id: 'guard-no-ai-hints', category: 'guardrails', requirement: 'No AI hints — all hints are hand-written.', validationMethod: 'Read problem data hints; no API calls.', status: 'not_run', notes: 'PRD hard guardrail.' },
  { id: 'guard-no-generated-problems', category: 'guardrails', requirement: 'No generated problems.', validationMethod: 'Problems are static data files.', status: 'not_run', notes: 'PRD hard guardrail.' },
  { id: 'guard-no-model-calls', category: 'guardrails', requirement: 'No model calls anywhere in the answer path.', validationMethod: 'Code review of answerChecker/answerParser.', status: 'not_run', notes: 'Checker is pure and synchronous.' },
  { id: 'guard-no-extra-chapters', category: 'guardrails', requirement: 'No additional chapters.', validationMethod: 'Manual review of chapter data.', status: 'not_run', notes: 'PRD hard guardrail.' },
  { id: 'guard-no-leaderboards', category: 'guardrails', requirement: 'No leaderboards.', validationMethod: 'Manual review of UI/features.', status: 'not_run', notes: 'PRD hard guardrail.' },
  { id: 'guard-no-payments', category: 'guardrails', requirement: 'No payments.', validationMethod: 'Manual review of UI/features.', status: 'not_run', notes: 'PRD hard guardrail.' },
  { id: 'guard-no-teacher-dashboards', category: 'guardrails', requirement: 'No teacher dashboards.', validationMethod: 'Manual review of UI/features.', status: 'not_run', notes: 'PRD hard guardrail.' },
  { id: 'guard-no-social', category: 'guardrails', requirement: 'No social features.', validationMethod: 'Manual review of UI/features.', status: 'not_run', notes: 'PRD hard guardrail.' },
  { id: 'guard-no-dragdrop-correctness', category: 'guardrails', requirement: 'No drag/drop-only correctness; tap-to-select/tap-to-place remains required.', validationMethod: 'Manual QA per interactive problem.', status: 'not_run', notes: 'PRD hard guardrail.' },
]

export const checklistCategories: ChecklistCategory[] = [
  'scope',
  'auth',
  'progress',
  'problem engine',
  'answer checking',
  'visual interactions',
  'mobile',
  'persistence',
  'mastery',
  'guardrails',
]

export function checklistByCategory(category: ChecklistCategory): ChecklistItem[] {
  return prdValidationChecklist.filter((item) => item.category === category)
}
