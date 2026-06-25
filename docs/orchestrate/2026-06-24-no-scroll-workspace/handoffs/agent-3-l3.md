# Handoff — agent-3-l3 (T-103) — Lesson 3 no-scroll workspace

**Status:** DONE. All 3 Lesson 3 problems converted to the `WorkspaceStepDef[]` step API
and passed to `ProblemLayout` via the new `steps` prop. Presentation-only: no checker,
data, validation, math, accepted-answer, mistake-type, completion, persistence, or routing
changes. Lint clean, full test suite green (572). See "Commands" for the one build caveat
(broken files owned by other parallel agents, not mine).

---

## Files changed (only my allowed files)

- `src/components/problems/Problem3MysteryBoxes.tsx` (ev-l3-p1) — converted to `steps`.
- `src/components/problems/Problem4CalculateEV.tsx` (ev-l3-p2) — converted to `steps`.
- `src/components/problems/EvL3P3PrizeBagTable.tsx` (ev-l3-p3) — converted to `steps`.

Not modified (no need): `Problem3MysteryBoxes.css`, `agent3.css`. **No `l3-workspace.css`
created** — the L3 tables are short (≤3 data rows), so each step fits one screen without any
extra CSS. The forbidden `EvL3P3PrizeBagTable.checker.ts` was NOT touched.

---

## Steps per problem + gates

### ev-l3-p1 — Problem3MysteryBoxes (2 steps)
1. `reveal` — "Reveal the mystery boxes". `MysteryBoxes` wrapped in `.ws-visual`.
   - **Gate:** `canAdvance = allRevealed` (`state.revealed.length === 6`).
   - `advanceHint`: "Reveal all six boxes to continue." (mirrors the existing reveal-all gate).
2. `table` — "Build the probability table" (last step). Tap-hint note + `ProbabilityTable`
   (count read-only, learner fills probability) + the running `prob-sum-meter` + `sr-only`
   live region + the unchanged **Submit answer** button calling
   `session.handleCheck(checkProblem3({...}), 'final', formatRows(tableRows), …)`.

### ev-l3-p2 — Problem4CalculateEV (2 steps)
1. `contribs` — "Fill each contribution". `ev-chunks` formula reference + `ProbabilityTable`
   (read-only rows, `extraColumns` = Contribution inputs).
   - **Gate:** `canAdvance = allContribsFilled` (every contribution non-empty).
   - `advanceHint`: "Fill all three contributions to continue."
2. `sum` — "Add the contributions" (last step). The existing `allContribsFilled` "contributions
   add to $X" note + `Final EV` field + `sr-only` region + unchanged **Submit answer**
   (`checkProblem4({ contributions, evAnswer })`).

### ev-l3-p3 — EvL3P3PrizeBagTable (3 steps)
1. `tokens` — "Inspect the prize bag". `PrizeBagTokens` wrapped in `.ws-visual`. No gate
   (reference-only view; `canAdvance` defaults true). `activeRow` highlight preserved.
2. `table` — "Build the expected value table". Tap-hint note + the full `.table-wrap`
   `.prob-table` (count / probability / contribution inputs for all 3 rows, with the exact
   `cell-status` classes and `aria-label`s preserved).
   - **Gate:** `canAdvance = allRowsDone` (`rowComplete` for every row, unchanged logic).
   - `advanceHint`: "Complete every row to continue."
3. `ev` — "Find the expected value" (last step). Existing `allRowsDone` "contributions add to
   $X" note + `Expected value` field + `sr-only` region + unchanged **Submit answer**
   (`checkEvL3P3({ rows, evAnswer })`).

For every problem `taskGuide` and the `TaskGuide` import were dropped (the per-step `prompt`
replaces the current-task line, per the contract). `children` removed; `steps={steps}` added.
All other `ProblemLayout` props (`feedback`, `completed`, `revealedHintIds`, `onRevealHint`,
`nextProblemId`, `restarted`, `onRestart`, `onReview`, `attemptCount`, `lastSubmittedAnswer`,
`reviewHintUsed`, demo props) are passed exactly as before.

---

## How the L3 tables stay no-scroll

- The tall content is split so each panel holds at most ONE short table.
  - p1: reveal-visual vs. 3-row probability table on separate steps.
  - p2: contribution-table step vs. a sparse final-EV step.
  - p3: tokens visual → table-fill (3 rows) → final-EV — the deliberately-split "table fill
    in its own step" the brief calls for. The token reference (counts 2/3/5) lives on the
    Prev step and persists, so learners can flip back without losing input.
- Each table is ≤3 data rows + header, so it fits inside `.ws-body`/`.ws-step` at both
  1280×720 and ≤390px. Display visuals (`MysteryBoxes`, `PrizeBagTokens`) are wrapped in
  `.ws-visual` so they scale down to the panel height. Interactive tables are intentionally
  NOT wrapped in `.ws-visual` (it would clamp/clip the inputs); they rely on the shell's
  `.ws-step { overflow:auto }` safety net, which never engaged in my sizing.
- No new CSS required; only foundation `.ws-*` classes + existing global table/field styles.

---

## No checker / data / validation changes — confirmation

- Imports unchanged: `checkProblem3`, `checkProblem4`, `checkEvL3P3` (from the forbidden
  `EvL3P3PrizeBagTable.checker.ts`), `numericFieldStatus`, `probabilityFieldStatus`,
  `normalizeMoneyAnswer`, `parseProbabilityAnswer`, problem definitions, demo configs.
- Every `session.handleCheck(...)`, `checkXxx(...)`, `setState(...)`, `reset()`, `update(...)`,
  `formatRows(...)`, `rowComplete(...)`, `sr-only` live region, `aria-label`, and
  `cell-status` call/markup is byte-for-byte identical — only relocated into step `content`.
- No edits to `*.checker.ts`, `src/data/**`, `src/validation/**`, `src/index.css`,
  `src/features/**`, `src/components/lesson/**`, `src/components/visuals/**`, or any test.
- Persistence keys unchanged: `problem-3`, `problem-4`, `ev-l3-p3`. `nextProblemId` values
  unchanged (`problem-4`, `problem-5`, `problem-5`).

---

## Commands run + results

- `npm run lint` → **exit 0**. Only pre-existing `only-export-components` fast-refresh
  warnings; **zero warnings in my 3 files**. (Other agents' in-progress files
  `EvL1P2UnequalSpinner.tsx`, `Problem5PayoutVsProfit.tsx` show unused-import / `TaskGuide`
  warnings — not mine.)
- `npm run test` → **572 passed (30 files)** — green.
- `npm run build` (`tsc -b && vite build`) → **exit 2**, BUT every error is in files owned by
  OTHER parallel Phase-2 agents, never mine:
  - `EvL1P2UnequalSpinner.tsx` (agent-1-l1): unused `WorkspaceStepDef`, `TaskGuide` undefined.
  - `Problem5PayoutVsProfit.tsx` (agent-4-l4): unused `WorkspaceStepDef`, `TaskGuide` undefined.
  - `Problem8SameEVDifferentRisk.tsx` (agent-5-l5): unused `riskFilled`.
  My three files produced **no type errors** in the shared `tsc -b` pass. The build will go
  green once those sibling tasks finish.

---

## Blockers / notes for the orchestrator

- **Not a blocker for me:** the failing `npm run build` is entirely due to other agents'
  unfinished files (above). Re-run `npm run build` after T-101/T-104/T-105 land; my code is
  ready.
- No missing shell/CSS capability encountered — the foundation `.ws-*` classes + `steps` API
  covered all 3 L3 conversions. No follow-up T-001 change requested.
- Recommend the Phase-3 live no-scroll spot-check (1280×720 + ≤390px) include p3 step 3 (the
  tokens→table→EV flow) to confirm the cross-step token reference UX feels right.
