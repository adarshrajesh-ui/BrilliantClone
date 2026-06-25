# Handoff — agent-1-core (T-001) — No-scroll workspace shell + step API + theme

**Status:** DONE. Build, lint, test all green (572 tests pass). `interfaces.md` is marked
FINAL and matches shipped code. The new workspace is dormant until a problem passes `steps`,
so the app keeps building/working on the legacy path before lessons migrate.

---

## What I built

A single, no-scroll, Brilliant-like problem workspace (UX inspiration only — no Brilliant
code/assets copied; colors are our own tokens).

- **`src/features/learning-experience/WorkspaceSteps.tsx`** (NEW) — the no-scroll workspace.
  Fills the viewport below the global app `.header` and never scrolls the page. Layout is a
  flex column: compact problem header → flexible one-step-at-a-time content region → sticky
  bottom action bar (Learning Coach feedback + Prev/Next + Hints toggle + Continue). It
  imports its own `workspace.css`.
- **`src/features/learning-experience/workspace.css`** (NEW) — the no-scroll theme and all
  `.ws-*` affordance classes. The page-lock is scoped with `:has()` so ONLY pages containing
  a `.problem-workspace` are locked to the viewport; every other page is untouched.
- **`src/components/lesson/ProblemLayout.tsx`** — added the optional `steps` prop. When
  `steps` is provided AND the problem is in the interactive (non-review) state, it renders
  the `WorkspaceSteps` workspace (its own compact header, so the legacy back-nav/header stack
  is omitted in that mode). When `steps` is omitted, behavior is byte-for-byte the previous
  `ResponsiveProblemShell` + `children` path. `children` is now optional.
- **`src/features/learning-experience/index.ts`** — re-exports `WorkspaceSteps` and the
  types `WorkspaceStepDef`, `WorkspaceStepsProps`.
- `LearningCoachPanel.tsx`, `TaskGuide.tsx`, `HintPanel.tsx`, `index.css`,
  `ResponsiveProblemShell.tsx` — reviewed; no edits needed (the coach panel is restyled from
  `workspace.css` when it sits inside the bottom bar, so no source change was required).

The Learning Coach remains the single `aria-live` region (one DOM node), now inside the
bottom action bar, so feedback always appears in the same panel as the attempted action —
never on a scrolled-away region. Review mode and the pre-problem demo are unchanged.

---

## EXACT public API (build against this)

### Step type + component (from the feature barrel)

```ts
import { WorkspaceSteps } from '../../features/learning-experience'        // component (used by ProblemLayout; lessons don't render it directly)
import type { WorkspaceStepDef } from '../../features/learning-experience' // the type lessons use
```

```ts
export interface WorkspaceStepDef {
  id: string                 // stable, unique within the problem
  title?: string             // short step title (rendered in the header by the shell)
  prompt?: ReactNode         // one-line current-task (rendered in the header by the shell)
  content: ReactNode         // the step's visual + interaction (the work)
  canAdvance?: boolean       // default true; false ⇒ Next disabled
  advanceHint?: string       // shown next to Next + as its title when gated
}
```

### ProblemLayout new prop

```ts
steps?: WorkspaceStepDef[]   // optional; when present + interactive ⇒ no-scroll workspace
children?: ReactNode         // now OPTIONAL (was required); ignored when `steps` is set
```

All other `ProblemLayout` props are unchanged. Keep passing `feedback`, `completed`,
`revealedHintIds`, `onRevealHint`, `nextProblemId`, `restarted`, `onRestart`, `onReview`,
`attemptCount`, `lastSubmittedAnswer`, `reviewHintUsed`, `conceptSummary`, `demoSteps`,
`demoFinalCta`, `completionMessage` exactly as today.

### CSS classes provided (apply these; do NOT redefine — `index.css`/`workspace.css` are off-limits in Phase 2)

| Class | Use |
|---|---|
| `.ws-visual` | Wrap a big SVG/canvas/img visual; constrains it to the panel height, centers it, no overflow. |
| `.ws-options` | Vertical single-column container for choice options (Brilliant-like full-width rows). |
| `.ws-option` | Full-width selectable row. Combine with existing `.choice-btn` (`className="choice-btn ws-option"`). |
| `.ws-field` | Compact labeled input row. |
| `.ws-row` | Generic compact wrapping flex row. |
| `.ws-compact` | Tighten spacing inside a dense step. |
| `.ws-prompt-inline` | Inline prompt text styling when you put a prompt inside `content` instead of the `prompt` prop. |

The shell owns `.problem-workspace`, `.ws-header`, `.ws-step-indicator`, `.ws-body`,
`.ws-step`, `.ws-actionbar`, `.ws-coach-slot`, `.ws-nav`, `.ws-prev`, `.ws-next`,
`.ws-hint-toggle`, `.ws-hint-drawer`, `.ws-prompt` — you do not apply those.
Existing reusable classes still valid: `.card`, `.btn-secondary`, `.btn-text`, `.choice-btn`,
`.choice-btn-selected`, `.touch-target`, `.touch-input`, `.field-label`, `.stat-list`,
`.sr-only`.

---

## How a lesson agent converts a problem (short version)

1. Build a `WorkspaceStepDef[]` from the existing stacked `<section className="card">` blocks
   — one step per logical phase. Move the JSX that was inside each section into that step's
   `content`. **Drop** the outer `.card` wrapper and the `<h2>Step N — …</h2>` heading: the
   shell renders the step `title` + `prompt` + "Step X of Y" indicator for you.
2. Set `canAdvance` to mirror the gate the problem already enforces (e.g.
   `state.predictionSubmitted`, `state.totalThrows >= 100`) and give a friendly `advanceHint`.
3. Wrap large visuals in `<div className="ws-visual">…</div>`; make choice rows
   `<div className="ws-options">` with `className="choice-btn ws-option"` buttons.
4. Pass `steps={steps}` to `ProblemLayout` and remove `children`. `taskGuide` becomes optional
   (the per-step `prompt` replaces the current-task line) — drop it or leave it (ignored in
   workspace mode).
5. Keep EVERY `session.handleCheck(...)`, `checkXxx(...)`, `setState(...)`, `reset()` call
   byte-for-byte. No checker/data/validation/persistence changes.
6. If a step is too tall to fit one screen at 1280×720 or ≤390px, split it into more steps
   rather than relying on scroll. A problem that already fits one screen may use a single step
   (no Prev/Next is rendered for a one-step problem).

A full, copy-pasteable Problem-1 example is in `interfaces.md` §4.

---

## Changes vs the draft contract

- **`children` is now optional** on `ProblemLayout` (was required). Non-breaking: existing
  callers still pass children; converted problems pass `steps` and omit children.
  `interfaces.md` §2 updated.
- The shell renders the active step's `title` AND `prompt` in the compact header (the draft
  only mentioned the prompt). Lessons must not add their own `<h2>`/title.
- Added `.ws-prompt-inline` (the draft reused `.ws-prompt` for inline prompts). `.ws-prompt`
  is now reserved for the shell's header prompt styling. `interfaces.md` §3 updated.
- Hints in the workspace: a "💡 Hints" toggle in the bottom bar opens a bounded drawer that
  reuses the existing `HintPanel`; the coach's "Need a hint?" link also still reveals hints.
- On the last step, Next is disabled (no further step); completion's "Continue to next
  problem" appears inside the coach in the bottom bar via the existing `feedback.canComplete`
  flow. `interfaces.md` §2 documents this.

## Implementation notes for reviewers / Phase 3

- **No-scroll mechanism:** `workspace.css` uses `.layout:has(.problem-workspace)` to set the
  app shell to `height: 100dvh; overflow: hidden`, zero `.main` padding, and turn `.main >
  .problem-page` into a flex pass-through so `.problem-workspace` fills the area below the
  global header. The step-content region (`.ws-body`/`.ws-step`) has `min-height: 0` and
  `overflow: auto` as a safety net so an oversized step scrolls WITHIN the workspace, never
  the page. `:has()` is supported by the project's modern (Vite/esbuild) target.
- Step panels stay mounted; inactive ones use the `hidden` attribute
  (`.problem-workspace .ws-step[hidden] { display:none }`), so Previous never loses entered
  DOM/input values. Problem state lives in `usePersistedProblemState`/session regardless.
- The active step index is internal `useState` in `WorkspaceSteps` (starts at 0), clamped to
  the step range on every render.

## Commands run + results

- `npm run test` → **572 passed (30 files)** — before and after my changes.
- `npm run build` (`tsc -b && vite build`) → **success**, no type errors.
- `npm run lint` (`oxlint`) → **0 errors**; only the repo's pre-existing
  `only-export-components` fast-refresh warnings (none in my new files).
- Dev server (`npm run dev`) boots and serves 200; legacy problem pages render unchanged
  (no problem passes `steps` yet, so the workspace path is dormant — as intended).

## Blockers / notes for the orchestrator

- None blocking. The workspace path cannot be exercised end-to-end until a Phase 2 lesson
  passes `steps` (I'm scoped out of `src/components/problems/**`), so the live no-scroll
  acceptance spot-check (desktop 1280×720, mobile ≤390px) should be done in Phase 3 once at
  least one problem is converted.
- If a lesson finds it needs a shell/CSS capability not covered here (e.g. a new `.ws-*`
  class), record it as a blocker for a follow-up T-001 change rather than editing
  `index.css`/`workspace.css`/the shell in Phase 2.
