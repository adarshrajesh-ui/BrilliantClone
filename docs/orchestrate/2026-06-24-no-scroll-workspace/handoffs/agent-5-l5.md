# Handoff — agent-5-l5 (T-105) — Lesson 5 no-scroll workspace

**Status:** DONE. All three Lesson 5 problems converted to the `WorkspaceStepDef[]`/`steps`
step API per `interfaces.md` §4 and `handoffs/agent-1-core.md`. Presentation only — no
checker/data/validation/state/persistence/routing changes.

---

## Files changed (only my allowed files)

- `src/components/problems/Problem7WholeEVModel.tsx`  (ev-l5-p1, carnival booth preview)
- `src/components/problems/Problem8SameEVDifferentRisk.tsx`  (ev-l5-p2)
- `src/components/problems/EvL5P3FinalDecision.tsx`  (ev-l5-p3, chapter capstone)

Not changed:
- `src/components/problems/lesson5.css` — existing `.l5-*` classes were already compact and
  reusable inside step panels; no edits needed.
- `src/components/problems/l5-workspace.css` — NOT created. The shell's `.ws-visual`,
  `.ws-options` (we reuse the existing `.l5-options`/`.l5-option` rows) plus the existing
  `lesson5.css` classes covered every layout need without new CSS, so the optional file was
  unnecessary.

Each file:
- Added `import type { WorkspaceStepDef } from '../../features/learning-experience'`.
- Removed the `TaskGuide` import + the `taskGuide`/`currentTask` construction and the
  `taskGuide={...}` prop (the per-step `prompt` replaces the current-task line; the shell
  ignores `taskGuide` in workspace mode).
- Dropped the `<section className="card problem-section">` wrappers and `<h2>` headings; moved
  the JSX into the matching step `content`. Pass `steps={steps}`, removed `children`.

---

## Steps per problem + gates

### Problem 7 — `Problem7WholeEVModel` (ev-l5-p1) — 3 steps
1. **preview** — "Preview both booths". Content: the two `<BoothPreview>` cards (kept the
   playful `.l5-booths` grid, NOT a table) + the `.l5-live` SR status.
   `canAdvance = bothPreviewed` (`boothARuns>0 && boothBRuns>0`). Hint: "Run both 5-round
   previews to continue."
2. **feel** — "Do they feel the same?". Content: question 1 fieldset (`disabled={!bothPreviewed}`
   kept). `canAdvance = state.feelSame !== ''`. Hint: "Choose an answer to continue."
3. **average** — "Same average payout?". Content: question 2 fieldset + **Submit answers**
   button. Last step (no `canAdvance`). Submit gate unchanged:
   `session.submitting || !bothPreviewed || !answersFilled`.

### Problem 8 — `Problem8SameEVDifferentRisk` (ev-l5-p2) — 3 steps
1. **simulate** — "Simulate both games". Content: `.risk-cards` (Run 20 trials A/B) +
   `RiskComparisonGraph` wrapped in `<div className="ws-visual">` + `.l5-live` status.
   `canAdvance = bothSimulated`. Hint: "Run both simulations to continue."
2. **ev** — "Expected value of each game". Content: EV A + EV B inputs (`.field-grid`).
   `canAdvance = evsFilled` (`evA.trim() && evB.trim()`). Hint: "Enter both expected values
   to continue."
3. **risk** — "Which game is riskier?". Content: riskier-game `<select>` + reason fieldset
   (5 options) + **Submit answer** button. Last step. Submit gate unchanged
   (`session.submitting`). The `checkWiderSpread({...})` args + the JSON.stringify payload +
   `state.reason` answer are byte-for-byte unchanged.

### EvL5P3FinalDecision (ev-l5-p3) — capstone — 6 steps
Split the heavy 7-criterion model into one section per panel so nothing requires page scroll:
1. **group** — "Carnival wheel (12 sections)". `<CarnivalWheel>` in `.ws-visual` + cost note.
   `canAdvance = grouped`. Hint: "Tap all three payout groups to continue."
2. **table** — "Build the probability table". The `.l5-section-table` (probability +
   contribution inputs, with the same `disabled={!grouped}` / `disabled={!probsFilled}` gates
   and the same incorrect-submit `cell-status` classes). `canAdvance = contribsFilled`.
3. **payout** — "Expected payout". The expected-payout input block (kept
   `disabled={!contribsFilled}` + `stepClass(3, payoutFilled)`). `canAdvance = payoutFilled`.
4. **profit** — "Expected profit". Profit input + `$6` cost block
   (`disabled={!payoutFilled}` + `stepClass(4, profitFilled)`). `canAdvance = profitFilled`.
5. **decide** — "Decision". Fair/favorable/unfavorable `<select>` (`disabled={!profitFilled}`)
   + `<FairnessNumberLine>`. `canAdvance = decisionFilled`.
6. **risk** — "Interpret the risk". Risk-interpretation fieldset (`disabled={!decisionFilled}`)
   + **Submit full model** button. Last step. Submit gate unchanged
   (`session.submitting || !allFilled`); `checkFinalDecision({...})` + `JSON.stringify(state)`
   + `state.decision` unchanged.

### How the capstone was made no-scroll
- Previously two tall stacked `.card` sections (wheel+table, then payout→profit→decision→risk
  all at once) that overflowed the viewport. Now each logical criterion is its OWN step panel,
  so only one input group is visible per screen and the shell's Prev/Next walks the sequence.
- The wheel (largest visual) is isolated in step 1 inside `.ws-visual`, which the shell scales
  to the panel height — no scroll on desktop 1280×720 or mobile ≤390px.
- Probability + contribution share the single physical `.l5-section-table`, so they stay in one
  "table" panel (splitting them would duplicate the same inputs/state); it is only 3 data rows
  + header, which fits comfortably.
- The existing per-criterion `stepClass(...)` (active/done/locked) wrappers and all
  `disabled={...}` gates were preserved verbatim, so the real per-field gating is unchanged;
  `canAdvance` only mirrors those gates for the Next button.
- Order, filled-flags (`grouped/probsFilled/contribsFilled/payoutFilled/profitFilled/
  decisionFilled/riskFilled`), `activeIndex`, `allFilled`, `reached`, and the
  `checkFinalDecision` payload are identical to before.

---

## Confirmation: nothing functional changed
- No `*.checker.ts`, `src/data/**`, `src/validation/**`, `src/core/**`, `src/lib/**`, or
  `*.test.ts` touched.
- Every `session.handleCheck(...)`, `checkBoothPreview/checkWiderSpread/checkFinalDecision(...)`
  argument object, `JSON.stringify(...)` payload, submitted-answer string, `setState(...)`,
  `reset()`, `disabled` gate, `aria-label`, `role="status"`/`aria-live`, and the SR `.l5-live`
  region are byte-for-byte unchanged. Accepted answers, mistake types, completion logic, and
  persistence keys (`problem-7`, `problem-8`, `ev-l5-p3`) are untouched.
- No CSS redefined; only existing `.l5-*` and shell-provided `.ws-visual`/`.ws-options`
  classes applied. `index.css`/`workspace.css` not edited.

---

## Commands run + results
- `npx tsc -b` → **exit 0** (no type errors in my files).
- `npm run lint` (oxlint) → **exit 0**; ZERO warnings in my three files (only pre-existing
  repo `only-export-components` warnings + agent-4's `EvL4P3BetterGame.tsx` warnings, not mine).
- `npm run test` (vitest) → **572 passed (30 files)** — suite still green.
- `npm run build` (`tsc -b && vite build`) → **fails at the vite step**, but ONLY on other
  agents' in-progress files (see blockers). `tsc` passes; my files are not in the error set.

---

## Blockers / notes for the orchestrator (Phase 3)
- **Not mine, transient (parallel build state):** `npm run build` currently fails because
  Lesson 4's files (`Problem6FairnessSort.tsx`, `Problem5PayoutVsProfit.tsx`,
  `EvL4P3BetterGame.tsx`) `import './l4-workspace.css'` which agent-4 has not created yet
  (`[UNRESOLVED_IMPORT]`). Earlier in my run `EvL1P3CompareGames.tsx` (Lesson 1) also had a
  `TaskGuide`/unused-import error that cleared mid-run. These are agent-1-l1 / agent-4-l4
  in-flight states, outside my allowed paths — I did not touch them. The full build should go
  green once those agents finish; my Lesson 5 files are isolated and compile/lint/test clean.
- No shell/CSS capability gaps: the foundation's `.ws-visual` + step API covered the booth
  preview, the risk-comparison graph, and the 12-section capstone wheel/table without needing
  any new `.ws-*` class.
- Recommend the Phase 3 no-scroll spot-check (1280×720 + ≤390px) pay special attention to
  Problem 8 step 3 and the capstone — they have the most rows; both are designed to fit, with
  the shell's `.ws-body` internal-scroll as the only (page-safe) fallback.
