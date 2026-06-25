# Handoff — agent-1-l1 (T-101) — Lesson 1 no-scroll workspace

**Status:** DONE. All 3 Lesson 1 problems converted to the `steps` workspace API. My files are
type-clean and lint-clean; full test suite green (572). Presentation-only — no checker, data,
validation, math, persistence, or routing changes.

---

## Files changed (only my allowed paths)

- `src/components/problems/Problem1LongRunAverage.tsx` (ev-l1-p1) — converted to `steps`.
- `src/components/problems/EvL1P2UnequalSpinner.tsx` (ev-l1-p2) — converted to `steps`.
- `src/components/problems/EvL1P3CompareGames.tsx` (ev-l1-p3) — converted to `steps`.
- `src/components/problems/l1-workspace.css` (NEW) — compact, component-scoped presentation
  classes only (`.l1-play`, `.l1-side`, `.l1-graph`, `.l1-compare`). No global/shell overrides;
  imported by each of the three problem files.

No other files touched. No forbidden files edited.

---

## Steps per problem + gates used

### ev-l1-p1 — Problem1LongRunAverage (3 steps)
1. `predict` — choose the predicted average + Submit prediction.
   - `canAdvance: state.predictionSubmitted` · hint "Submit a prediction to continue."
2. `throw` — DiceThrowZone (`.ws-visual`) + stats + Throw 10/100 + RunningAverageGraph.
   - `canAdvance: state.totalThrows >= 100` · hint "Reach 100 total throws to continue."
3. `identify` — final answer input + Submit answer (last step; completion drives Continue).

### ev-l1-p2 — EvL1P2UnequalSpinner (3 steps)
1. `predict` — predicted average + Submit prediction.
   - `canAdvance: state.predictionSubmitted` · hint "Submit a prediction to continue."
2. `spin` — ConfigurableSpinner (`.ws-visual`) + stats + Spin 1/10/100 + RunningAverageGraph.
   - `canAdvance: state.totalSpins >= 100` · hint "Run at least 100 spins to continue."
3. `identify` — final answer input + Submit answer (last step).

### ev-l1-p3 — EvL1P3CompareGames (2 steps)
1. `compare` — both spinner cards (A & B) with spin buttons, observed averages, and graphs,
   laid out compactly via `.l1-compare`. No advance gate exists in the original problem, so
   `canAdvance` is left at its default (`true`) — matches existing behavior (spinning is
   optional).
2. `decide` — "which has higher EV" choices, the conditional "why are they equal?" reason
   choices (shown only when `choice === 'same'`, unchanged), and Check answer (last step;
   completion drives Continue).

Choice rows now use the Brilliant-like single-column affordance (`.ws-options` container +
`choice-btn ws-option` buttons). Big visuals wrapped in `.ws-visual`. The old
`.card`/`<h2>Step N —…>` wrappers and the `TaskGuide`/`currentTask` were removed (the shell
renders the step title + prompt + "Step X of Y"); `taskGuide` prop dropped (ignored in
workspace mode), `TaskGuide` import removed, `children` removed in favor of `steps={steps}`.

---

## Confirmation: no checker/data/validation changes

- Every `session.handleCheck(...)`, `checkProblem1Dice(...)`, `checkProblem1DicePrediction(...)`,
  `checkEvL1P2(...)`, `checkEvL1P3(...)`, `session.setFeedback(...)`, `setState(...)`,
  `reset()/session.restart()` call kept byte-for-byte (same args, order, and signatures).
- No imports from `*.checker.ts`, `src/data/**`, `src/validation/**`, `src/core/**` were added,
  removed, or changed. Accepted answers, mistake types, completion conditions, persistence keys
  (`'problem-1'`, `'ev-l1-p2'`, `'ev-l1-p3'`), and `nextProblemId` routing are unchanged.
- Accessibility preserved byte-for-byte: `sr-only` `aria-live="polite"` live regions kept,
  `aria-live` observed-average lines kept, `.touch-target`/`.touch-input` (≥44px) kept,
  labels kept (now `.ws-field field-label`). Tap fallback path of DiceThrowZone untouched.

---

## Commands run + results

- `npm run test` → **572 passed (30 files)**. Green.
- `npm run lint` (oxlint) → **0 errors**. Only pre-existing `only-export-components`
  fast-refresh warnings (none in my files). My three files produce no warnings.
- `npx tsc -b` → my three files have **no type errors**. (Verified: the only TS errors in the
  tree are in `EvL4P3BetterGame.tsx`, which belongs to agent-4-l4 and is mid-conversion.)
- `npm run build` (`tsc -b && vite build`) → currently fails ONLY at the `vite build` CSS step
  with `UNRESOLVED_IMPORT ./l4-workspace.css` from `Problem5PayoutVsProfit.tsx` and
  `Problem6FairnessSort.tsx` — both **agent-4-l4 (T-104) files** that import a CSS file
  agent-4 has not created yet. This is an expected mid-parallel-build state, not caused by my
  task; it will clear once the sibling Phase-2 lessons land. My slice builds clean in isolation.

---

## Blockers / notes for the orchestrator

- **No blockers in my scope.** No new shell/`.ws-*` capability was needed; the contract classes
  (`.ws-visual`, `.ws-options`, `.ws-option`, `.ws-field`) plus my own `l1-workspace.css` were
  sufficient.
- The whole-project `npm run build` will only go green after the other Phase-2 lesson agents
  (notably T-104) finish, since rolldown resolves all problem imports together. Re-run
  `npm run build` during Phase-3 integration once all lessons report DONE.
- Live no-scroll acceptance spot-check (desktop 1280×720, mobile ≤390px) should be done in
  Phase 3. ev-l1-p3's `compare` step is the densest (two spinners + two graphs); it is kept
  within one screen via `.l1-compare` height caps (spinner/graph `max-height: 18vh`), and the
  shell's `.ws-step` `overflow:auto` is the in-workspace safety net (page never scrolls). If
  Phase-3 review finds it still too tall on a specific device, the clean follow-up is to split
  `compare` into A/B sub-steps — flagging here rather than over-engineering now.
