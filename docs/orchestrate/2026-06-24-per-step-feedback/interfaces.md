# Interfaces: per-step-feedback (contract Phase 2 must honor)

Phase 1 (T-001) implements this; Phase 2 workers CONSUME it without editing
the infra files.

## 1. WorkspaceStepDef (extended) — `src/features/learning-experience` (re-exported)

```ts
export interface WorkspaceStepDef {
  id: string
  title?: string
  prompt?: ReactNode
  content: ReactNode
  /**
   * Gate for the Next button. For gradable steps this MUST mean "this step is
   * answered correctly" (not merely filled), so the learner cannot advance past
   * a wrong step. Default true (non-gradable / exploratory steps).
   */
  canAdvance?: boolean
  /** Helper text shown when Next is gated (canAdvance === false). */
  advanceHint?: string
  /**
   * Optional per-step status badge in the step header. Set by the problem from
   * its own state: 'correct' after a correct per-step check, 'incorrect' after a
   * wrong one, 'unanswered' / undefined otherwise.
   */
  status?: 'unanswered' | 'correct' | 'incorrect'
}
```

## 2. WorkspaceSteps (new prop) — `WorkspaceSteps.tsx`

```ts
export interface WorkspaceStepsProps {
  // ...existing...
  /**
   * Called whenever the active step index changes (Prev/Next). The shell uses
   * this to clear stale coach feedback so each step starts clean and feedback
   * never bleeds across steps.
   */
  onStepChange?: (newIndex: number) => void
}
```

Behavior added by T-001:
- When the active step changes, call `onStepChange(newIndex)`.
- Render `step.status` as a small badge (✓ / ! ) next to the step indicator.

## 3. ProblemLayout (new prop) — `ProblemLayout.tsx`

```ts
interface ProblemLayoutProps {
  // ...existing...
  /** Forwarded to WorkspaceSteps.onStepChange. Pass session.clearFeedback. */
  onStepChange?: () => void
}
```

ProblemLayout forwards `onStepChange` into `WorkspaceSteps`.

## 4. useProblemSession

`clearFeedback()` already exists and is exported. Problems pass it as
`onStepChange={session.clearFeedback}` to ProblemLayout.

`handleCheck(result, stepId, submittedAnswer, normalizedAnswer)` already supports
arbitrary `stepId`. Per-step checks call it with the step's own id (e.g.
`'diagnose-a'`) so each attempt is recorded and feedback shows in the shared
coach panel. The FINAL completion check keeps `stepId === 'final'` and returns a
result with `canComplete: true` when everything is correct.

## 5. Per-step migration pattern (each problem)

For every answer-bearing step:
1. Add a per-step "Check" button inside the step content (label "Check"). It
   calls `session.handleCheck(stepResult, '<stepId>', submitted, normalized)`
   where `stepResult` is a `CheckResult` validating ONLY that step's field(s).
   - Add small per-step checker helpers next to the holistic checker in the
     problem's data file (e.g. `checkEvL2P3ValidStep`, `checkEvL2P3DefectA`).
2. `canAdvance` for the step = "that step's answer is correct" (compute from
   local state). Set `advanceHint` to e.g. "Check this step and fix it to
   continue.".
3. `status` for the step reflects last check: 'correct' | 'incorrect' | undefined.
   Track via a per-step `checked`/`correct` flag in component state so the badge
   and gating are stable across re-renders. (Selecting a new option clears that
   step's checked flag — same direct-correction spirit as feedback clearing.)
4. The LAST step keeps the existing completion check (holistic checker, stepId
   'final', canComplete). By the time the learner reaches it, earlier steps are
   already correct, so completion validates the final field and finishes.
5. Pass `onStepChange={session.clearFeedback}` to ProblemLayout.

Exploratory/no-answer steps (e.g. "run the machines", "two carnival spinners")
keep `canAdvance` based on their existing gate (filled / ran simulation) — they
have no per-step Check.

## CheckResult shape (existing) — `src/types/problem.ts`

```ts
interface CheckResult {
  isCorrect: boolean
  mistakeType: string | null
  feedback: string
  canComplete: boolean
}
```
Guard (not-yet-answerable) results: `mistakeType: ''`, `isCorrect: false`,
`canComplete: false`.

## FINALIZED by T-001 (no deviations — Phase 2 build against this)

The contract above was implemented exactly. Concrete facts Phase 2 can copy:

### Prop signatures (final)
- `WorkspaceStepDef.status?: 'unanswered' | 'correct' | 'incorrect'`
- `WorkspaceStepsProps.onStepChange?: (newIndex: number) => void`
- `ProblemLayoutProps.onStepChange?: () => void` — pass `session.clearFeedback`.

### Per-step checker convention
Each per-step checker validates ONLY its own field and returns a `CheckResult`
with `canComplete: false` (never completes — completion stays on the holistic
`final` check). Guard results use `mistakeType: ''`. Reference helpers in
`ev-l2-p3.ts`:
- `checkEvL2P3ValidStep(valid: EvL2P3Formula | null): CheckResult`
- `checkEvL2P3DefectA(defectA: EvL2P3Defect | null): CheckResult`
- `checkEvL2P3DefectB(defectB: EvL2P3Defect | null): CheckResult`

### Component state pattern (copyable)
1. Keep answer fields in persisted problem state (unchanged).
2. Add a local (non-persisted) `useState` map of per-step badge status:
   `type StepStatus = 'correct' | 'incorrect' | undefined`.
3. `statusFromResult(result)`: `isCorrect → 'correct'`; `mistakeType === '' →
   undefined` (guard); else `'incorrect'`.
4. Per gradable step: a `Check` button (class `ws-step-check`, disabled until the
   field is filled) calls `session.handleCheck(stepResult, '<stepId>', …)` and
   sets that step's status via `statusFromResult`.
5. Step fields: `status: checks.<field>`, `canAdvance: checks.<field> ===
   'correct'`, `advanceHint: 'Check this step and fix it to continue.'`.
6. Selecting a new option for a step ALSO clears that step's badge
   (`setChecks((p) => ({ ...p, <field>: undefined }))`) — direct correction.
7. LAST step: holistic checker, `stepId: 'final'`, no `canAdvance` gate (it's the
   last step); still set its badge from the per-step checker for that field.
8. `onStepChange={session.clearFeedback}` on `ProblemLayout`; also reset the
   `checks` map inside `onRestart`.

### Status badge rendering (in WorkspaceSteps header)
`step.status === 'correct'` → `✓` (`.ws-step-status.ws-step-status-correct`);
`'incorrect'` → `!` (`.ws-step-status.ws-step-status-incorrect`). Shown for the
active step only, next to the `.ws-step-indicator`.
