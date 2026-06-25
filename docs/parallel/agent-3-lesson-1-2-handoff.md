# Agent 3 — Lesson 1 & 2 Problems Handoff (run 2026-06-24-ev-lab-15)

Owner: Agent 3 (Lesson 1 & Lesson 2 problems). Phase 2 complete.
Source of truth: `prd.md` Page 3 (L1 p1/p2/p3) and Page 4 (L2 p1/p2/p3).

**Status:** all 6 problems implemented with deterministic checkers, demos, fun
animations + reduced-motion paths, tap-to-place, accessibility live regions,
review/restart support, and co-located tests.

- Scoped tests: `npx vitest run src/components/problems` → **64 passed** (new file `agent3-checkers.test.ts`).
- Full suite: `npx vitest run` → **422 passed / 28 files** (no regressions; baseline was 332).
- Type check: `npx tsc --noEmit -p tsconfig.app.json` → **0 errors** (whole app). Did NOT run `tsc -b`.
- Lint: `npx oxlint src/components/problems src/data/problems src/components/visuals` → only pre-existing `react(only-export-components)` warnings; **no new warnings from Agent 3 components**.

---

## 1. Export manifest (what Agent 1 must wire)

| storageId | Component export (file) | Definition export (file) | New CheckInput type | Checker entry |
|---|---|---|---|---|
| `problem-1` | `Problem1LongRunAverage` (`src/components/problems/Problem1LongRunAverage.tsx`) | `PROBLEM_1` (`src/data/problems/problem-1.ts`) | `Problem1DiceCheckInput` (in `problem-1.ts`) | `checkProblem1Dice(input)` (`problem-1.ts`); also `checkProblem1DicePrediction(prediction)` |
| `ev-l1-p2` | `EvL1P2UnequalSpinner` (`EvL1P2UnequalSpinner.tsx`) | `PROBLEM_EV_L1_P2` (`ev-l1-p2.ts`) | `EvL1P2CheckInput` (in `ev-l1-p2.ts`) | `checkEvL1P2(input)` (`ev-l1-p2.ts`) |
| `ev-l1-p3` | `EvL1P3CompareGames` (`EvL1P3CompareGames.tsx`) | `PROBLEM_EV_L1_P3` (`ev-l1-p3.ts`) | `EvL1P3CheckInput` (in `ev-l1-p3.ts`) | `checkEvL1P3(input)` (`ev-l1-p3.ts`) |
| `problem-2` | `Problem2WeightedAverage` (`Problem2WeightedAverage.tsx`) | `PROBLEM_2` (`problem-2.ts`) | `Problem2PrizeBoardCheckInput` (in `problem-2.ts`) | `checkProblem2PrizeBoard(input)` (`problem-2.ts`) |
| `ev-l2-p2` | `EvL2P2MatchOutcomes` (`EvL2P2MatchOutcomes.tsx`) | `PROBLEM_EV_L2_P2` (`ev-l2-p2.ts`) | `EvL2P2CheckInput` (in `ev-l2-p2.ts`) | `checkEvL2P2(input)` (`ev-l2-p2.ts`) |
| `ev-l2-p3` | `EvL2P3DiagnoseSetups` (`EvL2P3DiagnoseSetups.tsx`) | `PROBLEM_EV_L2_P3` (`ev-l2-p3.ts`) | `EvL2P3CheckInput` (in `ev-l2-p3.ts`) | `checkEvL2P3(input)` (`ev-l2-p3.ts`) |

All component default props/usePersistedProblemState keys use the **storage ID**
(`'problem-1'`, `'ev-l1-p2'`, …). `ProblemDefinition.problemId` === storage ID for
every def.

### Deterministic simulation helpers (also exported, pure, no AI)
- `problem-1.ts`: `diceFaceForThrow(seed, index) → 1..6`, `dicePayoutForFace(face) → 0|10`.
- `ev-l1-p2.ts`: `evL1P2SpinOutcome(seed, index) → 20|0` (25% $20).
- `ev-l1-p3.ts`: `evL1P3SpinA(seed, index) → 10|0` (50%), `evL1P3SpinB(seed, index) → 20|0` (25%).

These are self-contained (each file has its own 32-bit hash). Agent 5's
`src/lib/simulation.ts` did not exist at build time, so I did NOT depend on it.
If Agent 5/1 want a single shared seeded RNG, these can be re-pointed later —
behavior is a pure function of `(seed, index)`.

---

## 2. ⚠️ Agent 1 wiring needs (REQUIRED for integration)

1. **Register defs** in `src/data/problems/index.ts` (`ALL_PROBLEMS`) and map the 6
   storage IDs → components in `src/pages/ProblemPage.tsx`, and add to
   `IMPLEMENTED_PROBLEM_IDS` in `src/data/implementedProblems.ts`. (I did NOT edit
   these — forbidden.)

2. **`ProblemDefinition` optional fields.** The 6 defs set `canonicalSlug` and
   `legacyProblemId`. Because `src/types/problem.ts` does not yet declare those
   fields (and is Agent-1-owned), each def is typed locally as
   `type CanonicalDefinition = ProblemDefinition & { canonicalSlug?: string; legacyProblemId?: string }`.
   **Action:** add `canonicalSlug?: string` and `legacyProblemId?: string` to the
   `ProblemDefinition` interface during integration; the local `CanonicalDefinition`
   aliases can then be removed (or left — they remain assignable to
   `ProblemDefinition`). Everything compiles today either way.

3. **`ProblemCheckInput` union.** Add the 6 new input interfaces above to the union
   in `src/types/problem.ts`, and add cases to the `checkProblem(problemId, input)`
   registry in `src/lib/answerChecker.ts` (Agent-1-owned). The legacy
   `Problem1CheckInput`/`Problem2CheckInput` and the old spinner/formula checkers
   (`checkProblem1Completion`, `checkProblem2`) are now **unused by the live
   components** for `problem-1`/`problem-2` — components call the new checkers in the
   data files directly. The old functions still exist and still pass their tests;
   Agent 1 can leave or retire them.

   Suggested registry mapping:
   - `problem-1` → `checkProblem1Dice`
   - `problem-2` → `checkProblem2PrizeBoard`
   - `ev-l1-p2` → `checkEvL1P2`, `ev-l1-p3` → `checkEvL1P3`
   - `ev-l2-p2` → `checkEvL2P2`, `ev-l2-p3` → `checkEvL2P3`

4. **Next-problem links.** Components pass `nextProblemId` hints (`'ev-l1-p2'`,
   `'ev-l1-p3'`, `'problem-2'`, `'ev-l2-p2'`, `'ev-l2-p3'`, `'problem-3'`). The
   ProblemLayout already overrides with `getNextImplementedProblemId`, so these are
   only fallbacks — no action needed, but confirm the registry order matches
   interfaces.md play order.

---

## 3. Files touched / created

### Edited (owned)
- `src/data/problems/problem-1.ts` — revised to **Dice Toss Average** def + dice model + checker.
- `src/data/problems/problem-2.ts` — revised to **Prize Board Weight Drop** def + board-gated checker.
- `src/components/problems/Problem1LongRunAverage.tsx` — full dice-throw component.
- `src/components/problems/Problem2WeightedAverage.tsx` — two-phase board→formula component.

### Created (owned)
- `src/data/problems/ev-l1-p2.ts`, `ev-l1-p3.ts`, `ev-l2-p2.ts`, `ev-l2-p3.ts` (def + types + checker + sims).
- `src/components/problems/EvL1P2UnequalSpinner.tsx`, `EvL1P3CompareGames.tsx`, `EvL2P2MatchOutcomes.tsx`, `EvL2P3DiagnoseSetups.tsx`.
- `src/components/visuals/DiceThrowZone.tsx` + `DiceThrowZone.css` (new, uniquely named).
- `src/components/visuals/PrizeBoardDrop.tsx` + `PrizeBoardDrop.css` (new, uniquely named).
- `src/components/problems/agent3.css` (component-scoped styles for compare/match/diagnose; no global overrides).
- `src/components/problems/agent3-checkers.test.ts` (64 assertions across all 6 checkers + sims).

### NOT touched (respected ownership)
- `src/data/problems/index.ts`, `src/pages/ProblemPage.tsx`, `src/data/implementedProblems.ts`, `src/types/problem.ts`, `src/lib/**`, `src/core/**`, `src/index.css`, `src/components/lesson/**`, learning-experience shell.
- `Problem1SpinnerPlayground.tsx` left intact (the in-progress fun-P1 file is **not erased**; it is simply no longer imported now that P1 is the PRD dice game). Its exports (`buildPlaygroundSegments`, etc.) still compile.
- Visuals owned by others (`MysteryBoxes`, `ProbabilityTable`, `BalanceScale`, `ClassicBalanceScale`, `FairnessNumberLine`, `CarnivalWheel`, `RiskComparisonGraph`).
- Reused read-only: `ConfigurableSpinner`, `RunningAverageGraph`, `FormulaBuilder`, `ProblemLayout`, `TaskGuide`, `useProblemSession`, `usePersistedProblemState`, `usePrefersReducedMotion`.

---

## 4. PRD compliance (satisfied / partial / missing)

### ev-l1-p1 — Dice Toss Average (`problem-1`)
- **Satisfied:** faces 1–3 $0 / 4–6 $10, EV $5; prediction gate; **≥5 manual throws** gate; **≥100 total throws** gate; batch **Throw 10 / Throw 100 locked until 5 manual throws**; accepted formats (5, 5.0, 5.00, $5, $5.00, 5 dollars, 5 per throw); mistakes chose-extreme-outcome / selected-largest-payout / assumed-sample-equals-ev / confused-single-throw-with-average; 3-hint sequence; drag-throw + tap-to-throw + keyboard (Enter) all hit the same deterministic `diceFaceForThrow(seed,index)`; tumble/settle/payout/EV-glow animation in CSS with reduced-motion fallback; live-region announcements; running-average graph w/ $5 reference; review/restart via shell; 4-step pre-problem demo.
- **Partial:** the drag uses pointer-delta translation + drop-in-zone hit test (works for mouse/touch) rather than a literal parabolic arc tween; the deterministic outcome is fully PRD-correct and tap==drag==keyboard. Animation polish (8–12 explicit tumble frames) is approximated by one CSS keyframe.

### ev-l1-p2 — Unequal Section Game (`ev-l1-p2`)
- **Satisfied:** 25% $20 / 75% $0 spinner (`SPINNER_P2`), EV $5; prediction; Spin once/10/100; ≥100-spin gate; accepted money formats; mistakes used-largest-payout / divided-payout-by-percent ($0.80) / ignored-payout / short-run-variation; seeded 25% sim; running-average graph; demo; review/restart; no-scroll two-region via shell.

### ev-l1-p3 — Compare Two Carnival Games (`ev-l1-p3`)
- **Satisfied:** Spinner A 50% $10, Spinner B 25% $20; MC = "same EV" + reason "both average $5"; optional per-card 20-spin simulations w/ mini running-average graphs; mistakes chose-bigger-prize / chose-more-frequent / ignored-weighted-average; two-region layout; review/restart.

### ev-l2-p1 — Prize Board Weight Drop (`problem-2`)
- **Satisfied:** 25%/75% prize board; drag **and** tap-to-place tokens; **formula locked until both tokens dropped** (board-before-formula gate); contribution meters grow with zone size + "+$5" chip; FormulaBuilder EV=__×__+__×__ tap-to-place; EV $5; mistakes reversed-outcome-probability / omitted-probability / used-largest-payout / arithmetic-error; accepted formats 5/5.0/5.00/$5/$5.00; animation + reduced-motion; live region on drop; demo; review/restart.

### ev-l2-p2 — Match Outcomes to Probabilities (`ev-l2-p2`)
- **Satisfied:** $12↔1/3, $3↔1/2, $0↔1/6; tap-to-select/tap-to-place; tap filled row or Clear button to replace; cards single-use (reuse blocked); all-three-correct completion; mistakes ranked-by-size / reused-probability / wrong-pairing (+ unmatched guard); demo; review/restart.
- **Note:** interaction is tap-to-place (PRD's required equivalent); no separate drag path on this one (PRD says "tap-to-select/tap-to-place").

### ev-l2-p3 — Diagnose Bad EV Setups (`ev-l2-p3`)
- **Satisfied:** formulas A (raw sum) / B (omits $0) / C (valid); select valid = C; diagnose A = no-probability, B = omits-zero; per-formula checklist criteria shown; mistakes chose-raw-sum / chose-incomplete / wrong-defect-a / wrong-defect-b; guards for incomplete selection; review/restart.

### Cross-cutting
- **Satisfied:** deterministic, no-AI checking (<1ms); ±0.01 money tolerance via shared `answerParser`; reduced-motion = identical deterministic outcomes (outcome computed in state from seed, not from animation); no-scroll two-region desktop + sticky-task mobile via shared `ProblemLayout`/`ResponsiveProblemShell`; ≥44–48px touch targets; teaching explanations on completion.

---

## 5. Risks / notes for integration

- **Excess-property typing:** until Agent 1 adds `canonicalSlug?`/`legacyProblemId?`
  to `ProblemDefinition`, the defs rely on the local `CanonicalDefinition` widening.
  Safe and assignable to `ProblemDefinition`; just fold the fields into the base
  interface to clean up.
- **Old checkers now dead for live render:** `checkProblem1Completion` (spinner) and
  `checkProblem2` (formula-only) in `src/lib/answerChecker.ts` are no longer used by
  the live `problem-1`/`problem-2` components. Their tests still pass. Decide whether
  to retire them when wiring the `checkProblem` registry to the new checkers.
- **Co-located CSS imports:** components import `DiceThrowZone.css`, `PrizeBoardDrop.css`,
  and `agent3.css`. Vite handles these in build; vitest never imports them (tests only
  touch pure data/checker modules), so no jsdom/css transform needed.
- **`Problem1SpinnerPlayground.tsx`** is intentionally retained but unused. If Agent 1
  prefers, it can be deleted in cleanup, but it does not break the build.
- Reduced-motion is read via the shell's `usePrefersReducedMotion`; the seeded models
  guarantee the validation requirement "reduced-motion preserves the deterministic
  face/spin sequence" and "tap-to-throw == drag for the same throw index".
