# Agent 4 — Lesson 3 & 4 Problems Handoff (run 2026-06-24-ev-lab-15)

Owner: Agent 4 (Problems — Lesson 3 & Lesson 4). Phase 2.
Source of truth: `prd.md` Page 5 (Lesson 3) and Page 6 (Lesson 4). Built against
Agent 1's `agent-1-core-handoff.md` + `interfaces.md`.

**Status:** all 6 problems implemented (4 revised, 2 new). Scoped tests green.
**Not wired** (by design — Agent 1 owns): `src/data/problems/index.ts`,
`src/data/implementedProblems.ts`, `src/pages/ProblemPage.tsx`, the
`ProblemCheckInput` union in `src/types/problem.ts`.

---

## 1. Export manifest (for Agent 1 integration)

| Canonical | storageId | Component export | File | Definition export | File |
|---|---|---|---|---|---|
| ev-l3-p1 | `problem-3` | `Problem3MysteryBoxes` | `src/components/problems/Problem3MysteryBoxes.tsx` | `PROBLEM_3` | `src/data/problems/problem-3.ts` |
| ev-l3-p2 | `problem-4` | `Problem4CalculateEV` | `src/components/problems/Problem4CalculateEV.tsx` | `PROBLEM_4` | `src/data/problems/problem-4.ts` |
| ev-l3-p3 | `ev-l3-p3` | `EvL3P3PrizeBagTable` | `src/components/problems/EvL3P3PrizeBagTable.tsx` | `EV_L3_P3` | `src/data/problems/ev-l3-p3.ts` |
| ev-l4-p1 | `problem-5` | `Problem5PayoutVsProfit` | `src/components/problems/Problem5PayoutVsProfit.tsx` | `PROBLEM_5` | `src/data/problems/problem-5.ts` |
| ev-l4-p2 | `problem-6` | `Problem6FairnessSort` | `src/components/problems/Problem6FairnessSort.tsx` | `PROBLEM_6` | `src/data/problems/problem-6.ts` |
| ev-l4-p3 | `ev-l4-p3` | `EvL4P3BetterGame` | `src/components/problems/EvL4P3BetterGame.tsx` | `EV_L4_P3` | `src/data/problems/ev-l4-p3.ts` |

All `ProblemDefinition.problemId` values equal their storage IDs. Legacy IDs
`problem-3..6` preserved. New problems use storageId == canonicalSlug.

### Checkers (per problem)
- ev-l3-p1: `checkProblem3` (existing, `src/lib/answerChecker.ts`) — unchanged, already PRD-correct.
- ev-l3-p2: `checkProblem4` (existing, `src/lib/answerChecker.ts`) — unchanged.
- ev-l3-p3: `checkEvL3P3` — `src/components/problems/EvL3P3PrizeBagTable.checker.ts` (NEW).
- ev-l4-p1: `checkEvL4P1` — `src/components/problems/Problem5PayoutVsProfit.checker.ts` (NEW, replaces in-component use of `checkProblem5`).
- ev-l4-p2: `checkProblem6` (existing, `src/lib/answerChecker.ts`) — unchanged.
- ev-l4-p3: `checkEvL4P3` — `src/components/problems/EvL4P3BetterGame.checker.ts` (NEW).

### New CheckInput types — add to `ProblemCheckInput` union (Agent 1)
Defined locally (not in `src/types/problem.ts`, which is forbidden for Agent 4):
- `EvL3P3CheckInput` — `EvL3P3PrizeBagTable.checker.ts`
  `{ rows: [EvL3P3Row, EvL3P3Row, EvL3P3Row]; evAnswer: string }`,
  `EvL3P3Row = { count: string; probability: string; contribution: string }`.
- `EvL4P1CheckInput` — `Problem5PayoutVsProfit.checker.ts`
  `{ costPlaced: boolean; profitAnswer: string }`. NOTE: the existing shared
  `Problem5CheckInput` uses `{ formulaSelected, profitAnswer }`. Reconcile: either
  keep both, or rename the field. `checkProblem5` in `answerChecker.ts` is still
  exported and used by the `checkProblem()` switch (untouched); the live `problem-5`
  component now uses `checkEvL4P1`.
- `EvL4P3CheckInput` — `EvL4P3BetterGame.checker.ts`
  `{ profitA: string; profitB: string; choice: string }`.

If Agent 1 also wants a registry `checkProblem(storageId, input)` mapping for the
two new problems, route `ev-l3-p3 → checkEvL3P3`, `ev-l4-p3 → checkEvL4P3`,
`problem-5 → checkEvL4P1` (or keep `checkProblem5`).

---

## 2. Agent 1 wiring needs (explicit)
1. `src/data/problems/index.ts`: register `EV_L3_P3` and `EV_L4_P3` in `ALL_PROBLEMS`
   (and keep `PROBLEM_3..6`). `getProblemDefinition('ev-l3-p3' | 'ev-l4-p3')` must resolve.
2. `src/data/implementedProblems.ts`: add `'ev-l3-p3'` and `'ev-l4-p3'` to
   `IMPLEMENTED_PROBLEM_IDS`.
3. `src/pages/ProblemPage.tsx` `PROBLEM_COMPONENTS`: map
   `'ev-l3-p3' → EvL3P3PrizeBagTable`, `'ev-l4-p3' → EvL4P3BetterGame`. The four
   revised storage IDs already map to existing components.
4. `src/types/problem.ts`: extend `ProblemCheckInput` union with the three new
   input interfaces above.
5. **`canonicalSlug` / `legacyProblemId` on `ProblemDefinition`:** NOT added to the
   problem definition objects. Reason: `src/types/problem.ts` (forbidden for Agent 4)
   does not declare those optional fields, and the sibling files (`problem-1.ts`,
   `problem-2.ts`) also omit them; adding them would trigger TS excess-property
   errors at `tsc`. Slug↔storageId↔legacy mapping already lives functionally in
   `src/core/progression/canonical.ts`, so progression/persistence are unaffected.
   If desired, Agent 1 should (a) add optional `canonicalSlug?`/`legacyProblemId?`
   to `ProblemDefinition`, then (b) populate them across all 15 defs uniformly.

---

## 3. PRD conformance (per problem)

### ev-l3-p1 — Mystery Box Reveal — SATISFIED
- All-six-boxes-open gate (checker guards table until `allRevealed`).
- Counts given (read-only), learner fills probability; counts→prob (1/6, 2/6, 3/6).
- Accepted formats per PRD (fraction/decimal/percent) via `areProbabilitiesEquivalent`.
- Mistakes: counts-as-probabilities, probabilities-not-one, wrong-denominator.
- Fun animation: hinged lid lift (rotateX), token pop, color grouping shelf,
  probability-sum meter filling to 100%. Reduced-motion: lid opens without swing,
  tokens appear instantly (`@media (prefers-reduced-motion: reduce)` in
  `MysteryBoxes.css` / `Problem3MysteryBoxes.css`); reveal counts identical.
- Tap-to-open (buttons). Live region announces reveals + probability sum.
- Full PRD checklist (reveal, $12/$6/$0 rows, confirm sum).
- **Partial:** "token arcs to colored shelf" is a grouped-shelf cluster, not a
  literal flight arc (kept deterministic/CSS-only).

### ev-l3-p2 — Calculate EV from the Table — SATISFIED
- Contributions 12×1/6=2, 6×2/6=2, 0×3/6=0; EV $4 (`checkProblem4`).
- Colored EV chunks; contribution-sum readout + live region added.
- Mistakes: unweighted-sum, omitted-zero-row, arithmetic-error.
- **Partial:** "chunks fly into the total" is a static colored-chunk row, not an
  in-flight animation.

### ev-l3-p3 — Prize Bag EV Table — SATISFIED (NEW)
- 10 tokens (2×$15, 3×$5, 5×$0); full editable table count/prob/contribution + EV.
- Correct rows: $15→2→2/10→3, $5→3→3/10→1.5, $0→5→5/10→0; EV $4.5.
- Accepted formats: equivalent fractions/decimals; EV 4.5/4.50/$4.50/$4.5.
- Mistakes: count-probability-confusion, wrong-denominator, arithmetic-error,
  omitted-zero-row, used-total-token-payout (rejects 45).
- `PrizeBagTokens` visual (bag + grouped colored tokens, staggered drop-in,
  reduced-motion instant). Inline cell status, live region, contribution-sum readout.
- No drag interaction (table-fill only), so tap-to-place N/A; no demo (reuses
  table-fill + grouping interactions already taught).

### ev-l4-p1 — Pay to Play — SATISFIED
- Payout tray fills to $4 (one coin/dollar, staggered); cost slot accepts the $3
  token; vertical profit meter starts $4, drops to $1 when cost placed.
- **Cost-before-profit gate:** profit input disabled + checker guards until
  `costPlaced`.
- Expected profit = 1; accepted 1/1.0/1.00/$1/$1.00.
- Mistakes (all four PRD types): answered-payout (4), added-cost (7),
  reversed-subtraction (−1), cost-as-probability (0<v<1).
- Subtraction-not-addition: tray keeps coins; meter slides down. Reduced-motion:
  instant coin fill + cost swallow + meter jump (`PayoutTray.css`, `ProfitMeter.css`,
  `Problem5PayoutVsProfit.css`).
- Tap-to-place AND drag for the cost token (tap token → tap slot; or drag→drop;
  keyboard Enter/Space on slot). Live region with PRD wording.
- Built ON in-progress work: kept the balance-scale **playground warm-up**
  (`Problem5PayoutPlayground` + `ClassicBalanceScale`, unchanged) as the explore
  phase; official phase is the PRD tray/slot/meter.
- **Partial:** the optional "tap + → meter rises then shakes red" wrong-add
  micro-interaction is not built as a separate button; the added-cost mistake is
  caught via the answer instead. `BalanceScale.tsx` is no longer imported by the
  official phase (file left intact, not erased).

### ev-l4-p2 — Fair, Favorable, or Unfavorable? — SATISFIED
- Game A $5/$5 (fair/0), B $7/$5 (favorable/+2), C $3/$5 (unfavorable/−2).
- Tap-to-select / tap-to-place into 3 buckets; tap a placed card to move it;
  **Clear placements** control added; all-three-correct completion (`checkProblem6`).
- Profit meter **hidden until placement** (PRD), number line shows the placed
  card's profit; live region. Accepted classification synonyms via
  `normalizeClassificationAnswer`.
- Mistakes: positive-payout-favorable, confused-fair-favorable, forgot-subtract-cost.

### ev-l4-p3 — Choose the Better Game After Cost — SATISFIED (NEW)
- Game A payout $9 cost $7 → profit 2; Game B payout $6 cost $3 → profit 3; better = B.
- Profit input per card + profit meters (reflect entered profit) + A/B selector.
- Accepted: profits 2/2.0/$2 & 3/3.0/$3; choice "Game B"/"B"/"b".
- Mistakes: forgot-subtract-cost (payout), added-cost (payout+cost),
  reversed-payout-cost (cost−payout), chose-larger-payout (correct profits but picks A).
- Inline cell status, live region. Tap-only selector (no drag).

---

## 4. Files touched

### Created
- `src/components/problems/EvL3P3PrizeBagTable.tsx` (+ `.checker.ts`, `.checker.test.ts`)
- `src/components/problems/EvL4P3BetterGame.tsx` (+ `.css`, `.checker.ts`, `.checker.test.ts`)
- `src/components/problems/Problem5PayoutVsProfit.checker.ts` (+ `.checker.test.ts`)
- `src/components/problems/Problem5PayoutVsProfit.css`
- `src/components/problems/Problem3MysteryBoxes.css`
- `src/components/visuals/PrizeBagTokens.tsx` (+ `.css`)
- `src/components/visuals/PayoutTray.tsx` (+ `.css`)
- `src/components/visuals/ProfitMeter.tsx` (+ `.css`)
- `src/components/visuals/MysteryBoxes.css`
- `src/data/problems/ev-l3-p3.ts`, `src/data/problems/ev-l4-p3.ts`

### Edited
- `src/components/problems/Problem3MysteryBoxes.tsx` (sum meter, full checklist, a11y)
- `src/components/problems/Problem4CalculateEV.tsx` (contribution-sum readout + a11y)
- `src/components/problems/Problem5PayoutVsProfit.tsx` (PRD official phase; new checker)
- `src/components/problems/Problem6FairnessSort.tsx` (hide profit until placed, clear control, number-line + a11y)
- `src/components/visuals/MysteryBoxes.tsx` (lid animation, grouping shelf, a11y)
- `src/data/problems/problem-5.ts` (reversed-subtraction rule; tray/slot metadata)

### Intentionally NOT erased (in-progress work built upon)
- `Problem5PayoutPlayground.tsx`, `ClassicBalanceScale.tsx` (playground warm-up kept).
- `BalanceScale.tsx` left intact (no longer imported by the official phase).

---

## 5. Tests run
- `npx vitest run src/components/problems/EvL3P3PrizeBagTable.checker.test.ts`
  `…/Problem5PayoutVsProfit.checker.test.ts …/EvL4P3BetterGame.checker.test.ts`
  → **3 files / 17 tests passed.**
- `npx oxlint src/components/problems src/data/problems src/components/visuals`
  → 0 errors (only pre-existing `only-export-components` fast-refresh warnings,
  incl. `MysteryBoxes` exporting `MYSTERY_BOXES_P3`).
- `ReadLints` on all created/edited TS/TSX files → no errors.
- Existing `checkProblem3/4/6` already covered by `src/lib/answerChecker.test.ts`.
- Did NOT run full `tsc -b` (per instructions; Agent 1 runs at integration).

### Pre-existing failure NOT caused by Agent 4
- `src/components/problems/agent3-checkers.test.ts` (ev-l1-p1 dice "accepts $5 in
  many formats") fails — Agent 3 (Lesson 1/2) territory; unrelated to L3/L4 files.

---

## 6. Risks / notes
- **CSS via co-located imports.** New visuals/components import co-located `.css`
  (allowed). `src/index.css` was NOT edited; existing classes reused where possible.
  Reduced-motion handled both by component-local `@media (prefers-reduced-motion)`
  blocks and by deterministic state (outcome never depends on motion).
- **`Problem5CheckInput` vs `EvL4P1CheckInput` naming.** Agent 1 should reconcile
  the `formulaSelected` (old) vs `costPlaced` (new) field in the union.
- **`checkProblem5` still present** in `answerChecker.ts` and the `checkProblem()`
  switch (untouched); only the live component switched to `checkEvL4P1`.
- **New problems render only after Agent 1 wiring** (index/implemented/ProblemPage);
  until then they fall back to the placeholder.
- All checking is deterministic; no AI / semantic matching anywhere.
