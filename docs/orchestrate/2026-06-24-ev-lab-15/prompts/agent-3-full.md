You are Agent 3 (Problems — Lesson 1 & Lesson 2) for parallel-build-prd run 2026-06-24-ev-lab-15.

READ FIRST (binding, in order):
1. `prd.md` — SOURCE OF TRUTH (do not edit). Your problems are specified on PRD Page 3 (Lesson 1: ev-l1-p1/p2/p3) and Page 4 (Lesson 2: ev-l2-p1/p2/p3). Implement EXACTLY those specs.
2. `docs/orchestrate/2026-06-24-ev-lab-15/plan.md` and `interfaces.md`
3. `docs/parallel/agent-1-core-handoff.md`
4. Existing patterns: read `src/components/problems/Problem1LongRunAverage.tsx`, `Problem2WeightedAverage.tsx`, `src/data/problems/problem-1.ts`, `problem-2.ts`, and `src/hooks/useProblemSession.ts` BEFORE writing — match the established component+definition+checker pattern.

IMPORTANT: There is uncommitted in-progress fun-P1 work (`Problem1SpinnerPlayground.tsx`, modified `problem-1.ts`/`problem-2.ts`, `RunningAverageGraph`, `ConfigurableSpinner`). BUILD ON IT — do not erase working code.

## YOUR 6 PROBLEMS (storage IDs preserved for legacy)
- ev-l1-p1 (storageId `problem-1`) — REVISE → **Dice Toss Average**: drag-throw die, faces 1-3→$0 / 4-6→$10, EV $5. Gates: prediction submitted; ≥5 MANUAL throws; ≥100 total throws (batch buttons locked until 5 manual). Full animation spec + reduced-motion + tap-to-throw == drag. (Component `Problem1LongRunAverage.tsx` + helpers; data `problem-1.ts`.)
- ev-l1-p2 (storageId `ev-l1-p2`) — NEW → **Unequal Section Game**: spinner 25% $20 / 75% $0, EV $5; ≥100 spins; prediction. (NEW component `EvL1P2UnequalSpinner.tsx`; NEW data `ev-l1-p2.ts`.)
- ev-l1-p3 (storageId `ev-l1-p3`) — NEW → **Compare Two Carnival Games**: Spinner A 50% $10, Spinner B 25% $20; MC answer = "same EV" ($5). (NEW `EvL1P3CompareGames.tsx`; data `ev-l1-p3.ts`.)
- ev-l2-p1 (storageId `problem-2`) — REVISE → **Prize Board Weight Drop**: 25%/$20 + 75%/$0 board, drop both tokens (gate), THEN formula EV=__×__+__×__ unlocks, EV $5. (Component `Problem2WeightedAverage.tsx`; data `problem-2.ts`.)
- ev-l2-p2 (storageId `ev-l2-p2`) — NEW → **Match Outcomes to Probabilities**: $12↔1/3, $3↔1/2, $0↔1/6; tap-to-select/place; all 3 correct. (NEW `EvL2P2MatchOutcomes.tsx`; data `ev-l2-p2.ts`.)
- ev-l2-p3 (storageId `ev-l2-p3`) — NEW → **Diagnose Bad EV Setups**: pick formula C valid; identify A (raw sum) & B (omits $0) defects. (NEW `EvL2P3DiagnoseSetups.tsx`; data `ev-l2-p3.ts`.)

For EACH problem implement the full PRD spec: scenario, pre-problem mini-demo config, deterministic checker + accepted formats (money tolerance ±0.01, fraction/decimal/percent forms per PRD), mistake classifications + feedback strings, hint sequence, completion guards/gates, fun animation (CSS/SVG only) + reduced-motion deterministic path, tap-to-place for every drag, accessibility live-region text, review-mode + restart support, validation cases. No-scroll-chasing two-region layout via the shared `ProblemLayout`/learning shell.

## ALLOWED PATHS (edit/create only these)
- Components: `src/components/problems/Problem1LongRunAverage.tsx`, `Problem1SpinnerPlayground.tsx`, `Problem2WeightedAverage.tsx`, and NEW `src/components/problems/EvL1P2UnequalSpinner.tsx`, `EvL1P3CompareGames.tsx`, `EvL2P2MatchOutcomes.tsx`, `EvL2P3DiagnoseSetups.tsx`.
- Definitions: `src/data/problems/problem-1.ts`, `problem-2.ts`, and NEW `ev-l1-p2.ts`, `ev-l1-p3.ts`, `ev-l2-p2.ts`, `ev-l2-p3.ts`.
- Visuals YOU own (may edit): `src/components/visuals/RunningAverageGraph.tsx`, `ConfigurableSpinner.tsx`, `SpinnerWheel.tsx`, `FormulaBuilder.tsx`. NEW visuals you create must be uniquely named (e.g. `DiceThrowZone.tsx`, `EvL1P3CompareCards.tsx`, `MatchColumns.tsx`).
- Co-located CSS files you create and import from your components.
- Co-located tests: `*.test.ts(x)` next to your files.

## FORBIDDEN
- `src/data/problems/index.ts`, `src/pages/ProblemPage.tsx`, `src/data/implementedProblems.ts` (Agent 1 wires — DO NOT edit).
- `src/types/problem.ts` (Agent 1 owns the union — define any new CheckInput interface LOCALLY in your own file and list it for Agent 1 in your handoff).
- `src/core/**`, `src/lib/**`, `firestore.rules`, `package.json`, `src/index.css`.
- Visuals owned by other agents: `MysteryBoxes`, `ProbabilityTable`, `BalanceScale`, `ClassicBalanceScale`, `FairnessNumberLine`, `CarnivalWheel`, `RiskComparisonGraph`. The learning-experience shell + `src/components/lesson/**` (Agent 2) — consume read-only.
- Lesson 3/4/5 problem files (Agents 4/5).

## RULES
- `ProblemDefinition.problemId` MUST equal the storage ID. Add `canonicalSlug`, `legacyProblemId` to defs.
- Deterministic checking only — no AI/semantic matching. Seeded/deterministic simulation; reduced-motion produces identical outcomes.
- Do NOT run full `tsc -b`. Run scoped: `npx vitest run src/components/problems` (your tests) and `npx oxlint src/components/problems src/data/problems src/components/visuals`.
- Do NOT commit.

## CHECKPOINTS (auto-proceed)
- CP0: audit each of the 6 vs PRD (Done/Partial/Missing), confirm no file overlap with Agent 4/5; list files to create/edit.
- CP1: Lesson 1 (ev-l1-p1/p2/p3) complete with checkers, demos, animations, tests.
- CP2: Lesson 2 (ev-l2-p1/p2/p3) complete; finalize.
- Handoff: `docs/parallel/agent-3-lesson-1-2-handoff.md` — export manifest (per problem: storageId, component export name, definition export name, new CheckInput type name, checker entry), PRD reqs satisfied/missing/partial, files touched, what Agent 1 must wire, tests run, risks.

After each pass, compare your work to the PRD and record the diff in the handoff.
