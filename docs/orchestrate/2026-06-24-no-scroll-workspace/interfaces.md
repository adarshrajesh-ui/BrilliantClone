# Shared Interfaces — 2026-06-24-no-scroll-workspace

This is the contract between the foundation task (T-001) and the per-lesson tasks
(T-101..T-105). Phase 2 agents rely on this without reading foundation source.

> **Status:** FINAL — implemented by agent-1-core (T-001). The exported names, props, and
> CSS classes below match shipped code (`src/features/learning-experience/WorkspaceSteps.tsx`,
> `src/features/learning-experience/workspace.css`, `src/components/lesson/ProblemLayout.tsx`).
> Build/lint/test green (572 tests). Phase 2 agents build against this contract.

---

## 1. Step API (provided by foundation)

New module: `src/features/learning-experience/WorkspaceSteps.tsx`, re-exported from
`src/features/learning-experience/index.ts`.

Exact exports (verified):

```ts
// from 'src/features/learning-experience' (the feature barrel)
export { WorkspaceSteps } from './WorkspaceSteps'
export type { WorkspaceStepDef, WorkspaceStepsProps } from './WorkspaceSteps'
```

`WorkspaceSteps.tsx` imports `./workspace.css` itself, so the no-scroll theme loads
automatically wherever the workspace renders — Phase 2 agents do NOT need to import any CSS.

```ts
import type { ReactNode } from 'react'

export interface WorkspaceStepDef {
  /** Stable id, unique within the problem (e.g. 'predict', 'throw', 'identify'). */
  id: string
  /** Short step title shown in the step header (e.g. "Predict the average"). */
  title?: string
  /**
   * One-line current-task / prompt for this step (shown near the top of the panel).
   * Presentation only.
   */
  prompt?: ReactNode
  /** The step's visual + interaction content (the work for this step). */
  content: ReactNode
  /**
   * Gate for the Next button. When false, Next is disabled and `advanceHint`
   * (if any) explains why. Default true. Presentation-only gate — it MUST NOT be the
   * only thing enforcing correctness; real completion still flows through the existing
   * checker/session logic.
   */
  canAdvance?: boolean
  /** Helper text shown when Next is gated (canAdvance === false). */
  advanceHint?: string
}
```

## 2. ProblemLayout — new optional prop

`src/components/lesson/ProblemLayout.tsx` gains ONE optional prop. All existing props and
behavior are unchanged, with one non-breaking relaxation: `children` is now OPTIONAL (so a
converted problem can pass `steps` and omit `children` entirely).

```ts
interface ProblemLayoutProps {
  // ...all existing props unchanged...
  children?: ReactNode // was required; now optional (ignored when `steps` is provided)
  /**
   * Ordered no-scroll step panels. When provided (and the problem is in the interactive,
   * non-review state), the workspace renders ONE step at a time inside a fixed-viewport
   * panel with a Prev/Next bottom bar + step indicator. The Learning Coach feedback and
   * Continue action render in the same bottom bar (same panel as the attempted action).
   * When omitted, `children` render as before (legacy scroll fallback).
   */
  steps?: WorkspaceStepDef[]
}
```

Import the type from the feature barrel:

```ts
import type { WorkspaceStepDef } from '../../features/learning-experience'
```

Rules foundation guarantees:
- Active step index is internal shell state, starting at 0; Prev/Next move within bounds.
- Prev never unmounts/destroys completed-step DOM in a way that loses entered values:
  step panels are kept mounted (hidden) OR state lives in the problem component (it does —
  all problems use `usePersistedProblemState`/session), so toggling visibility is safe.
- Next is disabled when `canAdvance === false` for the active step; `advanceHint` is shown
  next to Next (desktop) and on the button `title`. Prev is disabled on the first step.
- On the LAST step there is no further step, so Next is disabled there; completion is driven
  by the existing checker/session and the **Continue to next problem** button appears inside
  the Learning Coach in the bottom bar (via the existing `feedback.canComplete` flow).
- When `steps.length === 1`, the shell renders no Prev/Next nav and no step indicator (the
  whole problem is a single panel) — it still gets the Brilliant-like chrome + bottom bar.
- A step indicator ("Step 2 of 3") is rendered by the shell (only when >1 step) — lesson
  agents do NOT add one.
- A "💡 Hints" toggle in the bottom bar opens a bounded hint drawer (the existing `HintPanel`)
  above the action bar; the coach's "Need a hint?" link also reveals the next hint. Lesson
  agents keep passing `revealedHintIds` / `onRevealHint` exactly as today.
- The active step's `title` and `prompt` are rendered in the compact workspace header by the
  shell — do NOT re-render the problem title or add `<h2>` step headers inside `content`.
- The shell renders the existing `LearningCoachPanel` (feedback) and the Continue-to-next-
  problem action in the bottom action bar. Lesson agents keep passing `feedback`,
  `completed`, `nextProblemId`, etc. exactly as today.
- On completion, the shell surfaces the completion state + Continue in the bottom bar.

## 3. CSS classes (provided by foundation; lesson agents may apply these)

Foundation provides these in `workspace.css` / `index.css`. Lesson agents APPLY them but do
not redefine them (no editing `index.css`/`workspace.css` in Phase 2).

| Class | Use |
|---|---|
| `.ws-visual` | Wrapper around a teaching visual; constrains it to available panel height, centers it, prevents overflow. Wrap large SVG/canvas visuals in `<div className="ws-visual">…</div>`. |
| `.ws-prompt` | Styling applied by the shell to the step `prompt` prop (header). You normally do NOT apply this yourself. |
| `.ws-prompt-inline` | Optional inline prompt styling for a prompt placed inside `content` (rather than via the `prompt` prop). |
| `.ws-options` | Vertical, single-column list container for choice options (Brilliant-like full-width rows). |
| `.ws-option` | A full-width selectable option row (works with existing `.choice-btn`, add `.ws-option` for full-width). |
| `.ws-field` | Compact labeled input row. |
| `.ws-row` | Generic compact flex row (wraps, gap). |
| `.ws-compact` | Tightens spacing inside a dense step. |

Existing reusable classes still valid: `.card`, `.btn-secondary`, `.btn-text`,
`.choice-btn`, `.choice-btn-selected`, `.touch-target`, `.touch-input`, `.field-label`,
`.stat-list`, `.sr-only`.

Foundation also ensures: no element forces horizontal scroll; the workspace fills the
viewport below the global header and does not scroll the page; visuals scale down on mobile.

## 4. Conversion pattern (worked example)

BEFORE (legacy, stacked sections — causes page scroll):

```tsx
return (
  <ProblemLayout problem={P} ... taskGuide={taskGuide}>
    <section className="card problem-section">
      <h2>Step 1 — Predict</h2>
      {/* prediction controls */}
    </section>
    <section className="card problem-section">
      <h2>Step 2 — Throw</h2>
      {/* visual + controls */}
    </section>
    <section className="card problem-section">
      <h2>Step 3 — Identify</h2>
      {/* input + check */}
    </section>
  </ProblemLayout>
)
```

AFTER (no-scroll step panels — same checkers/state, just regrouped). Real Problem 1 shape:

```tsx
import type { WorkspaceStepDef } from '../../features/learning-experience'

// ...inside the component, after state/session are set up...
const steps: WorkspaceStepDef[] = [
  {
    id: 'predict',
    title: 'Predict the long-run average',
    prompt: 'Pick the average payout per throw you expect, then submit it.',
    canAdvance: state.predictionSubmitted,
    advanceHint: 'Submit a prediction to continue.',
    content: (
      <>
        {/* the SAME choice buttons + Submit prediction JSX that was in Step 1.
            Use .ws-options on the row to get full-width stacked choices. */}
      </>
    ),
  },
  {
    id: 'throw',
    title: 'Throw the die',
    prompt: 'Throw at least 5 times yourself, then batch to 100+ throws.',
    canAdvance: state.totalThrows >= 100,
    advanceHint: 'Reach 100 total throws to continue.',
    content: (
      <>
        <div className="ws-visual">
          <DiceThrowZone /* ...unchanged props... */ />
        </div>
        {/* stats + Throw 10 / Throw 100 buttons — unchanged JSX */}
        <RunningAverageGraph averages={state.runningAverages} target={5} />
      </>
    ),
  },
  {
    id: 'identify',
    title: 'Identify the long-run average',
    prompt: 'Enter the long-run average per throw and check.',
    content: (
      <>
        <label className="ws-field">
          Long-run average per throw
          <input
            className="touch-input"
            value={state.finalAnswer}
            onChange={(e) => setState((p) => ({ ...p, finalAnswer: e.target.value }))}
          />
        </label>
        <button
          type="button"
          className="btn-secondary touch-target"
          disabled={state.totalThrows < 100 || session.submitting}
          onClick={() =>
            void session.handleCheck(
              checkProblem1Dice({ /* ...unchanged args... */ }),
              'final',
              state.finalAnswer,
              state.finalAnswer,
            )
          }
        >
          {session.submitting ? 'Saving…' : 'Submit answer'}
        </button>
      </>
    ),
  },
]

// taskGuide is now OPTIONAL — the per-step `prompt` replaces the current-task line.
// You may drop `taskGuide` (and the TaskGuide import) entirely, or keep passing it; the
// shell ignores it in workspace mode. Drop `children`.
return (
  <ProblemLayout
    problem={PROBLEM_1}
    problemNumber={1}
    feedback={session.feedback}
    completed={session.completed}
    revealedHintIds={session.revealedHintIds}
    onRevealHint={session.revealHint}
    nextProblemId="ev-l1-p2"
    /* ...all other existing props unchanged... */
    steps={steps}
  />
)
```

Notes:
- Move the JSX that was inside each `<section>` into the matching step `content`. Drop the
  outer `.card`/`<h2>` wrappers (the shell renders the step title + panel chrome).
- Keep EVERY `session.handleCheck(...)`, `checkXxx(...)`, `setState(...)`, `reset()` call
  exactly as-is. Do not touch imported checkers/data.
- `canAdvance` mirrors the gate that the problem already enforces (e.g. prediction
  submitted, ≥100 throws). It is a convenience for the Next button only.
- A problem that already fits one screen may use a single step (whole problem as one panel)
  — still pass it via `steps` so it gets the Brilliant-like chrome and (trivially) no Next.
- The final check / completion still drives the Continue button via existing props.

## 5. Hard guarantees for Phase 2 agents
- Presentation only. No change to: checker imports, `*.checker.ts`, `src/data/**`,
  accepted answers, mistake types, completion conditions, persistence keys, routing.
- Do not edit `index.css`, `workspace.css`, shell, layout, or visual components.
- Each active step must fit without page scroll at desktop (1280×720) and mobile (≤390px);
  if a step is too tall, split it into more steps rather than relying on scroll.
- Keep accessibility: `sr-only` live regions, labels, ≥44px targets, tap fallbacks.
