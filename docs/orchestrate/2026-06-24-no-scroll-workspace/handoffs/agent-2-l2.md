# Handoff — agent-2-l2 (T-102) — Lesson 2 no-scroll workspace

**Status:** DONE. All 3 Lesson 2 problems converted to the `WorkspaceStepDef[]` step API
and passed to `ProblemLayout` via the new `steps` prop. My files type-check clean, lint
clean, and the full test suite is green (572 passed).

---

## Files changed (only my allowed files)
- `src/components/problems/Problem2WeightedAverage.tsx` (ev-l2-p1)
- `src/components/problems/EvL2P2MatchOutcomes.tsx` (ev-l2-p2)
- `src/components/problems/EvL2P3DiagnoseSetups.tsx` (ev-l2-p3)
- `src/components/problems/l2-workspace.css` — **NOT created**. Not needed; the shell's
  `.ws-*` classes plus existing `agent3.css` / global classes covered all presentation.

No other files touched. `agent3.css` is imported (used) by p2/p3 but **not edited** (owned
by agent-3-l3).

---

## Steps per problem + gates

### ev-l2-p1 — `Problem2WeightedAverage.tsx` (2 steps)
1. `drop` — "Drop the prize tokens". `PrizeBoardDrop` wrapped in `<div className="ws-visual">`;
   sr-only live region kept. **Gate:** `canAdvance: bothDropped` (= `state.twenty && state.zero`),
   mirroring the existing unlock gate. `advanceHint: "Drop both prize tokens to continue."`
2. `formula` — "Build the formula". `FormulaBuilder` + EV `<input>` + Submit button (last step).
   `prompt` is dynamic, mirroring the old `currentTask` phrasing for the formula phase.
   - Note: the old `!bothDropped` "section-disabled / unlock" placeholder branch was a
     presentation-only fallback; in workspace mode step 2 is only reachable after the step-1
     gate (`bothDropped`) is satisfied, so the formula content renders directly. The
     `checkProblem2PrizeBoard({ bothDropped, slots, evAnswer })` call is byte-for-byte unchanged.

### ev-l2-p2 — `EvL2P2MatchOutcomes.tsx` (1 step)
1. `match` — "Match each payout to its probability". Single panel (match grid + tap-hint note +
   probability bank + Check button). One step ⇒ shell renders no Prev/Next and no indicator.
   `prompt` mirrors the old dynamic `currentTask`. No gate needed (single step;
   completion driven by `checkEvL2P2`). `placeInOutcome`, all `setState`, and the
   `session.handleCheck(checkEvL2P2(...), 'final', ...)` call are byte-for-byte unchanged.

### ev-l2-p3 — `EvL2P3DiagnoseSetups.tsx` (3 steps — split for no-scroll)
Originally 2 stacked sections; the second section had **two** 4-option defect blocks + check,
which is too tall for a single mobile screen, so it was split into two steps (one solvable per
screen, Brilliant-like).
1. `valid` — "Pick the valid EV formula" (3 formula cards). **Gate:** `canAdvance: state.valid !== null`.
   `advanceHint: "Select the valid formula to continue."`
2. `diagnose-a` — "Diagnose Formula A" (4 defect options, now `ws-options` + `choice-btn … ws-option`).
   **Gate:** `canAdvance: state.defectA !== null`. `advanceHint: "Pick a diagnosis for Formula A to continue."`
3. `diagnose-b` — "Diagnose Formula B" (4 defect options) + Check button (last step).
   The `session.handleCheck(checkEvL2P3({ valid, defectA, defectB }), 'final', ...)` call (which
   needs all three state fields) is unchanged; values persist across steps via
   `usePersistedProblemState`.

---

## Presentation-only conversions applied
- Dropped each old `<section className="card">` wrapper and `<h2>Step/Phase …</h2>` heading
  (shell renders `title` + `prompt` + "Step X of Y").
- Removed `taskGuide` prop + `TaskGuide` import from all 3 (optional / ignored in workspace
  mode; per-step `prompt` replaces the current-task line). Removed `children`; added `steps`.
- Wrapped the `PrizeBoardDrop` visual in `.ws-visual` (p1).
- Converted p3 defect choice columns to `.ws-options` with `choice-btn … ws-option` full-width rows.
- p2 match bank left as the existing horizontal `.match-bank` (a pick-bank, not a single-column
  choice list) — kept its game layout intact.

## Confirmation: no logic changed
- No edits to checkers, `*.checker.ts`, `src/data/**`, `src/validation/**`, accepted answers,
  mistake types, completion logic, persistence keys (`problem-2`, `ev-l2-p2`, `ev-l2-p3`),
  or routing / `nextProblemId`s. Every `session.handleCheck(...)`, `checkProblem2PrizeBoard`,
  `checkEvL2P2`, `checkEvL2P3`, `setState(...)`, `reset()`, hint, and sr-only/aria call is
  byte-for-byte preserved.

## Commands run + results
- `npm run test` → **572 passed (30 files)**. ✅
- `npx tsc --noEmit -p tsconfig.app.json`, filtered to my 3 files → **no errors in my files**. ✅
- `npm run lint` (oxlint), filtered to my 3 files → **no issues in my files**. ✅
- `npm run build` → currently **fails**, but ONLY due to errors in
  `src/components/problems/Problem1LongRunAverage.tsx` (agent-1-l1 / T-101's file, mid-conversion:
  unused `WorkspaceStepDef` import + leftover `TaskGuide` reference). **Not my file**; my Lesson 2
  files compile cleanly. The build will pass once T-101 finishes its conversion.

## Blockers
- None for T-102. Cross-task note for the orchestrator: the global `npm run build` is red because
  of `Problem1LongRunAverage.tsx` (T-101). No action needed from me (outside my allowed paths).
- No missing shell/CSS capability encountered; no follow-up T-001 change requested.
