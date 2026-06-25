You are Agent 4 (Problems — Lesson 3 & Lesson 4) for parallel-build-prd run 2026-06-24-ev-lab-15.

READ FIRST (binding, in order):
1. `prd.md` — SOURCE OF TRUTH (do not edit). Your problems: PRD Page 5 (Lesson 3: ev-l3-p1/p2/p3) and Page 6 (Lesson 4: ev-l4-p1/p2/p3). Implement EXACTLY those specs.
2. `docs/orchestrate/2026-06-24-ev-lab-15/plan.md` and `interfaces.md`
3. `docs/parallel/agent-1-core-handoff.md`
4. Existing patterns: read `src/components/problems/Problem3MysteryBoxes.tsx`, `Problem4CalculateEV.tsx`, `Problem5PayoutVsProfit.tsx`, `Problem6FairnessSort.tsx`, their `src/data/problems/problem-3..6.ts`, and `src/hooks/useProblemSession.ts` BEFORE writing — match the established pattern.

IMPORTANT: There is uncommitted in-progress work (`Problem5PayoutPlayground.tsx`, `ClassicBalanceScale.tsx`, modified `Problem5PayoutVsProfit.tsx`, `BalanceScale.tsx`, `problem-3..6.ts`). BUILD ON IT — do not erase working code.

## YOUR 6 PROBLEMS (storage IDs preserved for legacy)
- ev-l3-p1 (storageId `problem-3`) — REVISE → **Mystery Box Reveal**: 6 boxes (1×$12, 2×$6, 3×$0); reveal all (gate); fill count + probability rows; counts→prob (1/6, 2/6, 3/6). Full lid-open animation + reduced-motion + tap-to-open. (`Problem3MysteryBoxes.tsx`; `problem-3.ts`.)
- ev-l3-p2 (storageId `problem-4`) — REVISE → **Calculate EV from the Table**: contributions 12×1/6=2, 6×2/6=2, 0×3/6=0; EV $4. (`Problem4CalculateEV.tsx`; `problem-4.ts`.)
- ev-l3-p3 (storageId `ev-l3-p3`) — NEW → **Prize Bag EV Table**: 10 tokens (2×$15, 3×$5, 5×$0); full table count/prob/contribution; EV $4.5. (NEW `EvL3P3PrizeBagTable.tsx`; data `ev-l3-p3.ts`.)
- ev-l4-p1 (storageId `problem-5`) — REVISE → **Pay to Play**: payout tray fills $4, drag $3 cost token into slot (gate), profit meter → $1; expected profit = 1. Full animation (subtraction not addition) + reduced-motion + tap-to-place. (`Problem5PayoutVsProfit.tsx`; `problem-5.ts`.)
- ev-l4-p2 (storageId `problem-6`) — REVISE → **Fair, Favorable, or Unfavorable?**: Game A $5/$5 (Fair/0), B $7/$5 (Favorable/+2), C $3/$5 (Unfavorable/-2); tap-to-place into buckets; all 3 correct. (`Problem6FairnessSort.tsx`; `problem-6.ts`.)
- ev-l4-p3 (storageId `ev-l4-p3`) — NEW → **Choose the Better Game After Cost**: A payout $9 cost $7 → profit 2; B payout $6 cost $3 → profit 3; better = B. (NEW `EvL4P3BetterGame.tsx`; data `ev-l4-p3.ts`.)

For EACH problem implement the full PRD spec: scenario, mini-demo config, deterministic checker + accepted formats (money ±0.01; fraction/decimal/percent per PRD; classification text forms for ev-l4-p2), mistake classifications + feedback, hints, completion guards/gates, fun animation (CSS/SVG only) + reduced-motion deterministic path, tap-to-place for every drag, accessibility live-region text, review-mode + restart support, validation cases. No-scroll-chasing two-region layout via shared `ProblemLayout`/learning shell.

## ALLOWED PATHS (edit/create only these)
- Components: `src/components/problems/Problem3MysteryBoxes.tsx`, `Problem4CalculateEV.tsx`, `Problem5PayoutVsProfit.tsx`, `Problem5PayoutPlayground.tsx`, `Problem6FairnessSort.tsx`, and NEW `EvL3P3PrizeBagTable.tsx`, `EvL4P3BetterGame.tsx`.
- Definitions: `src/data/problems/problem-3.ts`, `problem-4.ts`, `problem-5.ts`, `problem-6.ts`, and NEW `ev-l3-p3.ts`, `ev-l4-p3.ts`.
- Visuals YOU own (may edit): `src/components/visuals/MysteryBoxes.tsx`, `ProbabilityTable.tsx`, `BalanceScale.tsx`, `ClassicBalanceScale.tsx`, `FairnessNumberLine.tsx`. NEW visuals uniquely named (e.g. `PayoutTray.tsx`, `ProfitMeter.tsx`, `BucketSort.tsx`).
- Co-located CSS you create; co-located tests.

## FORBIDDEN
- `src/data/problems/index.ts`, `src/pages/ProblemPage.tsx`, `src/data/implementedProblems.ts` (Agent 1 wires).
- `src/types/problem.ts` (define new CheckInput types LOCALLY; list for Agent 1).
- `src/core/**`, `src/lib/**`, `firestore.rules`, `package.json`, `src/index.css`.
- Visuals owned by others: `RunningAverageGraph`, `ConfigurableSpinner`, `SpinnerWheel`, `FormulaBuilder`, `CarnivalWheel`, `RiskComparisonGraph`. Learning shell + `src/components/lesson/**` (Agent 2) — read-only.
- Lesson 1/2/5 problem files (Agents 3/5).

## RULES
- `ProblemDefinition.problemId` MUST equal the storage ID. Add `canonicalSlug`, `legacyProblemId`.
- Deterministic checking only — no AI. Reduced-motion = identical deterministic outcomes.
- Do NOT run full `tsc -b`. Scoped: `npx vitest run src/components/problems`, `npx oxlint src/components/problems src/data/problems src/components/visuals`.
- Do NOT commit.

## CHECKPOINTS (auto-proceed)
- CP0: audit the 6 vs PRD; confirm no overlap with Agents 3/5; list files.
- CP1: Lesson 3 (ev-l3-p1/p2/p3) complete + tests.
- CP2: Lesson 4 (ev-l4-p1/p2/p3) complete; finalize.
- Handoff: `docs/parallel/agent-4-lesson-3-4-handoff.md` — export manifest (per problem: storageId, component + definition export names, new CheckInput type, checker), PRD satisfied/missing/partial, files touched, Agent 1 wiring needs, tests, risks.

After each pass, compare to PRD and record the diff in the handoff.
