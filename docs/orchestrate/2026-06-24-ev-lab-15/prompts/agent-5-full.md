You are Agent 5 (Problems — Lesson 5 + shared simulation/visual helpers) for parallel-build-prd run 2026-06-24-ev-lab-15.

READ FIRST (binding, in order):
1. `prd.md` — SOURCE OF TRUTH (do not edit). Your problems: PRD Page 7 (Lesson 5: ev-l5-p1/p2/p3) incl. the "Lesson 5 progression — three distinct roles, no duplicate scenarios" table. Implement EXACTLY those specs.
2. `docs/orchestrate/2026-06-24-ev-lab-15/plan.md` and `interfaces.md`
3. `docs/parallel/agent-1-core-handoff.md`
4. Existing patterns: read `src/components/problems/Problem7WholeEVModel.tsx`, `Problem8SameEVDifferentRisk.tsx`, `src/data/problems/problem-7.ts`, `problem-8.ts`, `src/hooks/useProblemSession.ts`, and visuals `CarnivalWheel.tsx`, `RiskComparisonGraph.tsx` BEFORE writing.

## YOUR 3 PROBLEMS (storage IDs preserved; CONTENT REVISED per current PRD)
- ev-l5-p1 (storageId `problem-7`) — REVISE (big content change) → **Carnival Booth Preview** (fun intro, NOT the capstone). Booth A always $5; Booth B 50% $10 / 50% $0. Run 5-round preview each (gate both). Q1 "same feel?" = No; Q2 "same average?" = Yes ($5). NO probability table/cost/fairness. (`Problem7WholeEVModel.tsx`; `problem-7.ts`.)
- ev-l5-p2 (storageId `problem-8`) — REVISE → **Wider Spread, Same Average**: Game A 100% $6; Game B 50% $12 / 50% $0. Run both sims (20 trials, gate); enter EV(A)=6 and EV(B)=6; riskier = Game B; explanation MC. MUST use $6 vs $12/$0 (NOT L5P1's $5/$10/$0) — checker rejects L5P1 booth payouts. (`Problem8SameEVDifferentRisk.tsx`; `problem-8.ts`.)
- ev-l5-p3 (storageId `ev-l5-p3`) — NEW → **Final Carnival Decision** (capstone): 12-section wheel (1×$36, 3×$12, 8×$0), cost $6. Probabilities 1/12, 3/12, 8/12; contributions 3,3,0; expected payout 6; expected profit 0; decision Fair; risk-interpretation MC. Sequential checklist (one active row at a time) to avoid scroll. (NEW `EvL5P3FinalDecision.tsx`; data `ev-l5-p3.ts`.)

For EACH: full PRD spec — scenario, mini-demo, deterministic checker + accepted formats (money ±0.01; probability fraction/decimal/percent per PRD), mistake classifications + feedback, hints, completion gates, animations (CSS/SVG only) + reduced-motion deterministic, tap-to-place for every drag/tap interaction, accessibility live-region, review-mode + restart, validation cases. No-scroll-chasing layout via shared `ProblemLayout`; capstone uses stepped checklist.

## SHARED HELPER YOU OWN
- Create `src/lib/simulation.ts`: a pure, seeded deterministic RNG + helpers for dice/spinner/booth/trial simulations (so reduced-motion and tap paths produce identical sequences per session seed). Keep it framework-free and unit-tested. (Lesson 1 may adopt it later; for this run it is yours.)

## ALLOWED PATHS (edit/create only these)
- Components: `src/components/problems/Problem7WholeEVModel.tsx`, `Problem8SameEVDifferentRisk.tsx`, and NEW `EvL5P3FinalDecision.tsx`.
- Definitions: `src/data/problems/problem-7.ts`, `problem-8.ts`, and NEW `ev-l5-p3.ts`.
- Visuals YOU own (may edit): `src/components/visuals/CarnivalWheel.tsx`, `RiskComparisonGraph.tsx`. NEW visuals uniquely named (e.g. `BoothPreview.tsx`, `SplitBar.tsx`, `OutcomeStrip.tsx`).
- `src/lib/simulation.ts` (NEW) + its test.
- `RunningAverageGraph.tsx` is owned by Agent 3 — you may IMPORT/use it read-only but must NOT edit it.
- Co-located CSS you create; co-located tests.

## FORBIDDEN
- `src/data/problems/index.ts`, `src/pages/ProblemPage.tsx`, `src/data/implementedProblems.ts` (Agent 1 wires).
- `src/types/problem.ts` (define new CheckInput types LOCALLY; list for Agent 1).
- `src/core/**`, other `src/lib/**` files, `firestore.rules`, `package.json`, `src/index.css`.
- Visuals owned by others (`MysteryBoxes`, `ProbabilityTable`, `BalanceScale`, `ClassicBalanceScale`, `FairnessNumberLine`, `ConfigurableSpinner`, `SpinnerWheel`, `FormulaBuilder`, and editing `RunningAverageGraph`). Learning shell + `src/components/lesson/**` (Agent 2) — read-only.
- Lesson 1/2/3/4 problem files (Agents 3/4).

## RULES
- `ProblemDefinition.problemId` MUST equal storage ID. Add `canonicalSlug`, `legacyProblemId`.
- Cohesion: L5P1 and L5P2 MUST NOT reuse the same game numbers (PRD). L5P1 qualitative only; L5P2 requires EV computation.
- Deterministic checking only — no AI. Reduced-motion = identical deterministic outcomes (use your seeded RNG).
- Do NOT run full `tsc -b`. Scoped: `npx vitest run src/components/problems src/lib/simulation.test.ts`, `npx oxlint src/components/problems src/data/problems src/components/visuals src/lib/simulation.ts`.
- Do NOT commit.

## CHECKPOINTS (auto-proceed)
- CP0: audit the 3 vs PRD + plan simulation helper; confirm no overlap with Agents 3/4; list files.
- CP1: `simulation.ts` + ev-l5-p1 + ev-l5-p2 complete + tests (verify L5P2 ≠ L5P1 numbers).
- CP2: ev-l5-p3 capstone complete; finalize.
- Handoff: `docs/parallel/agent-5-lesson-5-handoff.md` — export manifest (per problem: storageId, component + definition export names, new CheckInput type, checker), simulation.ts API, PRD satisfied/missing/partial, files touched, Agent 1 wiring needs, tests, risks.

After each pass, compare to PRD and record the diff in the handoff.
