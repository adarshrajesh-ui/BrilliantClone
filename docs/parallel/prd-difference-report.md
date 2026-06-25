# PRD-Difference Report — Expected Value Lab (run 2026-06-24-ev-lab-15)

Source of truth: `prd.md` (binding, not edited). This report classifies every PRD
requirement as **Complete**, **Partial/Simplified**, **Missing**, or **Risk**,
synthesized from the five worker handoffs + Agent 1 integration, verified against
the green integration gate (tsc -b, 422 tests, build, lint, validate:answers).

## Summary
- **Structure**: ✅ Complete — chapter = 5 lessons × 3 problems = **15 problems**,
  migrated from the legacy 20-problem model with backward-compatible ID/slug
  resolution and preserved progress.
- **All 15 problems**: ✅ implemented with deterministic no-AI checkers, fun
  animations + reduced-motion fallbacks, tap-to-place/drag/keyboard, a11y live
  regions, review/restart, and two-region no-scroll-chasing layout.
- **No PRD answer/feedback requirement is omitted.** The only deltas are
  animation-timing fidelity (CSS approximations of exact ms specs) and a few
  optional micro-interactions folded into the answer-checking instead of separate
  controls.

---

## Complete (per PRD)

### Model / progression / mastery (Agent 1)
- 15 canonical problems, slugs `ev-l{N}-p{M}`, `globalProblemIndex` 0..14.
- Legacy `problem-1..8` storage IDs preserved; removed-slug successors resolve;
  no progress erased.
- Mastery threshold 11/15; required slugs `ev-l5-p3` (capstone), `ev-l4-p1`
  (payout-vs-profit), `ev-l5-p2` (same-EV-different-risk); legacy `fullModel`
  milestone retired per the 15-model. Milestones: half = 8/15, simulation set = L1.

### Lesson 1 (Agent 3)
- **ev-l1-p1 Dice Toss Average**: faces 1–3 $0 / 4–6 $10, EV $5; prediction + ≥5
  manual + ≥100 total gates; Throw 10/100 locked until 5 manual; money formats;
  4 mistake types; 3 hints; drag/tap/keyboard share one seeded sequence.
- **ev-l1-p2 Unequal Section Game**: 25% $20 / 75% $0, EV $5; ≥100-spin gate;
  4 mistake types incl. $0.80 divide-error; seeded 25% sim; running-average graph.
- **ev-l1-p3 Compare Two Games**: A 50% $10 vs B 25% $20; "same EV" + reason;
  optional mini-sims; 3 mistake types.

### Lesson 2 (Agent 3)
- **ev-l2-p1 Prize Board Weight Drop**: 25/75 board; drag + tap tokens; **formula
  locked until both tokens dropped**; contribution meters; EV $5; 4 mistake types.
- **ev-l2-p2 Match Outcomes**: $12↔1/3, $3↔1/2, $0↔1/6; tap-to-place, single-use
  cards, clear/replace; all-three completion; mistake types incl. unmatched guard.
- **ev-l2-p3 Diagnose Bad Setups**: pick valid C; diagnose A (raw sum) / B (omits
  $0); per-formula criteria; 4 mistake types.

### Lesson 3 (Agent 4)
- **ev-l3-p1 Mystery Box Reveal**: all-six-open gate; counts→prob (1/6,2/6,3/6);
  fraction/decimal/percent; 3 mistake types; lid/pop/shelf animation + sum meter.
- **ev-l3-p2 Calculate EV from Table**: 12×1/6 + 6×2/6 + 0×3/6 = $4; contribution
  readout; 3 mistake types.
- **ev-l3-p3 Prize Bag EV Table**: 2×$15/3×$5/5×$0; full table + EV $4.5; rejects
  total-payout 45; 5 mistake types; staggered token visual.

### Lesson 4 (Agent 4)
- **ev-l4-p1 Pay to Play**: payout $4, cost $3, **cost-before-profit gate**,
  profit $1; tray/slot/meter subtraction; tap + drag + keyboard; 4 mistake types.
- **ev-l4-p2 Fair/Favorable/Unfavorable**: A 0 / B +2 / C −2; tap-to-place buckets,
  clear control; profit meter hidden until placed; 3 mistake types.
- **ev-l4-p3 Choose Better Game After Cost**: A profit 2 vs B profit 3 → B;
  per-card profit + meters; 4 mistake types incl. chose-larger-payout.

### Lesson 5 (Agent 5)
- **ev-l5-p1 Carnival Booth Preview**: qualitative only; A always $5, B 50% $10/$0;
  run-5 preview gate; feel=No / average=Yes($5); 3 mistake types; seeded outcomes.
- **ev-l5-p2 Wider Spread Same Average**: **$6 vs $12/$0** (distinct from L5P1);
  20-trial gated sims; EV(A)=EV(B)=$6; riskier=B; explanation MC; 5 mistake types;
  **cohesion guard rejects L5P1 payouts**.
- **ev-l5-p3 Final Carnival Decision (capstone)**: 12-section 1×$36/3×$12/8×$0,
  cost $6; tap-to-group gate; stepped table → payout $6 → profit $0 → fairness →
  risk MC; **sequential one-active-row checklist (no scroll chasing)**; all 8 PRD
  mistake types; single graded `final` attempt drives mastery.

### Cross-cutting (Agents 2–5)
- Deterministic, sub-ms, no-AI checking; ±0.01 money tolerance via shared parser.
- Reduced-motion = animated outcomes provably identical (seeded, unit-tested).
- No-scroll-chasing two-region desktop + sticky-task mobile shell; ≥44–48px touch
  targets; teaching explanations on completion; mobile feedback auto-scroll;
  capstone emphasis ("Problem 15 of 15").

---

## Partial / Simplified (deliberate, deterministic correctness intact)
- **Animation-timing fidelity**: exact PRD millisecond specs (e.g. 120 ms stagger /
  600 ms bounce, 8–12 explicit tumble frames, parabolic dice arc) are approximated
  with CSS keyframes / `animationDelay`. Outcomes and reduced-motion behavior are
  fully PRD-correct.
- **ev-l1-p1**: drag-throw uses pointer-delta + drop hit-test rather than a literal
  parabolic tween; tap == drag == keyboard for the same deterministic throw index.
- **ev-l3-p1 / ev-l3-p2**: "token arcs to shelf" / "chunks fly into total" rendered
  as grouped-shelf cluster / static colored-chunk row (CSS-only, deterministic).
- **ev-l4-p1**: optional "wrong-add → meter rises then shakes red" is caught via the
  added-cost answer classification rather than a separate button.
- **ev-l5-p3**: step progression gates on filled-ness (not correctness) so the final
  checker can classify mistakes; no `demoSteps` (reuses established wheel/table
  interactions per shell convention).
- **ev-l2-p2**: tap-to-place only (PRD's stated equivalent), no separate drag path.

## Missing
- None. No PRD answer/feedback/gate requirement is unimplemented.

## Risks (all low, non-blocking)
1. **Dead code in `answerChecker.ts` + `ProblemCheckInput` union** — old
   `checkProblem1Completion/2/5/7/8` and old input shapes pass their tests but are
   unused by live components. Cleanup-only; no runtime impact.
2. **`Problem5CheckInput.formulaSelected` (old) vs `EvL4P1CheckInput.costPlaced`
   (live)** — live path uses `checkEvL4P1`; reconcile if routing through the
   central switch later.
3. **`answerChecker.test.ts`** still asserts old problem-7/8 wheel/$5 logic —
   harmless but misleading; flag for cleanup.
4. **Bundle size** advisory (>500 kB single chunk) — pre-existing, not introduced
   by this build; candidate for route-level code splitting.
5. **Retained unused files** (`Problem1SpinnerPlayground.tsx`, `BalanceScale.tsx`)
   — kept per "do not erase" rule; compile, not imported.

## Independent QA (Agent 6 — complete)
Agent 6 built an execution-level QA layer importing all 15 **real** co-located
checkers (`src/validation/liveCheckers.ts` + `liveCheckerValidation.test.ts` +
`prdCoverage.test.ts`). Result: `vitest run src/validation` → 150 pass; full suite
→ **572 pass**; oxlint + `tsc --noEmit` clean. It independently **confirmed every
structural and correctness claim above** and found **no checker-vs-PRD correctness
disagreement** across the 15 problems.

Two findings added by the independent pass — both RESOLVED (user-approved):
1. **L5P2 explanation-MC option mismatch (PRD-internal contradiction).**
   `prd.md:1555` lists a 4th MC option `same EV different risk`, but `:1541`/`:1550`
   list only 3 (`variable outcomes / wider spread / can be 0 or 12`). The live
   component + `checkWiderSpread` implement the 3-option version. **Resolution:**
   keep 3 options; removed the stale `'same EV different risk'` phrase from
   `PROBLEM_8.acceptedFormats.reason` so metadata matches the implemented MC. No
   learner-facing behavior change (the phrase was never an offered option).
2. **Dead `checkProblem` dispatcher.** RESOLVED — removed
   `checkProblem1Completion/1Prediction/2/5/7/8`, `reasonIsCorrect`, the dispatcher,
   their stale tests, and the orphaned `Problem1/2/5/7/8CheckInput` + `Problem1Choice`
   + `ProblemCheckInput` union. Live `checkProblem3/4/6` + `isGradedAttempt` kept.
   The only PRD-divergent code paths are now gone; gate stays green (562 tests).
