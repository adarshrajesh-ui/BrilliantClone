# Parallel Build Plan: 2026-06-24-ev-lab-15

**Goal:** Implement the current Expected Value Lab PRD — migrate the app from the legacy 20-problem (5×4) model to the PRD's 15-problem (5×3) model, with all 15 problems fully implemented per spec (fun tactile P1s, deterministic checking, no-scroll-chasing UX, tap-to-place, reduced-motion), preserving auth/Firebase/routing/progress and legacy storage IDs.
**Source of truth:** `prd.md` (binding, not edited by this run)
**Created:** 2026-06-24
**Orchestrator / integration lead:** Agent 1 (this chat)

---

## PRD vs codebase comparison (Agent 1 audit)

### Stack & baseline
- React 19 + Vite + TypeScript + Firebase + react-router-dom. Tests: vitest (`npm test`). Lint: oxlint. Build: `tsc -b && vite build`.
- Baseline (pre-build): `tsc -b` ✅, `vitest run` ✅ **330 passed / 22 files**.

### What the PRD requires (high level)
1. **15 problems, 5 lessons × 3 each** (was 20 / 5×4). Canonical slugs `ev-l{N}-p{M}`; legacy storage IDs `problem-1..problem-8` preserved; `legacyProblemId` field added.
2. **Removed-slug → successor progress migration** (5 removed slugs map to successors); chapter % ÷15, lesson % ÷3; `highestSequentialCompletedGlobalIndex` on 0..14; mastery **11/15** in ≤2 graded attempts.
3. **Every Problem 1 of each lesson = fun, animated, tactile concept-intro mini-game** with exact motion specs + reduced-motion alternatives.
4. **Specific problem revisions**: L1P1 Dice Toss Average (drag-throw die); L2P1 Prize Board Weight Drop; L3P1 Mystery Box Reveal; L4P1 Pay to Play; L5P1 Carnival Booth Preview (NOT capstone); L5P2 Wider Spread Same Average ($6 vs $12/$0, EV calc); L5P3 12-section capstone.
5. **No-scroll-chasing two-region workspace** (≥768px) and mobile sticky-task layout; feedback beside/beneath active control.
6. **Tap-to-place for every drag interaction**; touch ≥44px; reduced-motion deterministic; instant (<100ms) deterministic checking; flexible accepted formats.
7. **Golf-course pathway: 5 zones × 3 holes = 15**; final hole capstone emphasis.
8. **No AI** anywhere (guardrail).

### What already exists (preserve / extend)
- Core progression/persistence/mastery/migration architecture (`src/core/**`, `src/lib/**`) — solid, but hard-wired to **20**.
- 8 implemented problem components (`src/components/problems/Problem1..8*.tsx`) + definitions (`src/data/problems/problem-1..8.ts`), wired in `ProblemPage` by storage ID.
- Learning-experience shell (`src/features/learning-experience/**`): demo system, coach panel, checklist, review/restart, inline status, animations, slug contract.
- Course-map/home (`src/features/course-map/**`): data-driven, count-agnostic view model.
- Reusable visuals (`src/components/visuals/**`): RunningAverageGraph, ConfigurableSpinner, SpinnerWheel, MysteryBoxes, ProbabilityTable, FormulaBuilder, BalanceScale, ClassicBalanceScale, CarnivalWheel, FairnessNumberLine, RiskComparisonGraph.
- In-progress (uncommitted) fun-P1 work: `Problem1SpinnerPlayground.tsx`, `Problem5PayoutPlayground.tsx`, `ClassicBalanceScale.tsx`, `TeachingExplanationSection.tsx`, modified `problem-1..8.ts`, `BalanceScale`, `RunningAverageGraph`, `ProblemLayout`, learning-experience files.

### What is missing (must build)
- Canonical model at **15** (5×3); removed-slug successor resolver; `legacyProblemId`/`canonicalSlug` on problem JSON; recompute scales (÷15, 0..14); mastery 11/15.
- **7 problems with no live component**: ev-l1-p2 (Unequal Section Game), ev-l1-p3 (Compare Two Carnival Games), ev-l2-p2 (Match Outcomes↔Probabilities), ev-l2-p3 (Diagnose Bad EV Setups), ev-l3-p3 (Prize Bag EV Table), ev-l4-p3 (Choose Better Game After Cost), ev-l5-p3 (Final Carnival Decision capstone).
- PRD-accurate fun-P1 animations + reduced-motion for the 5 lesson P1s.
- UI string/milestone count updates (20→15), golf 15-hole pass.
- Validation matrix + PRD checklist updated to 15 problems and the new gates.

### What must change (legacy components revised, IDs preserved)
| Storage ID | Component | Canonical | PRD revision |
|---|---|---|---|
| problem-1 | Problem1LongRunAverage | ev-l1-p1 | Dice Toss Average (drag-throw die, manual≥5 + ≥100 throws gate, EV $5) |
| problem-2 | Problem2WeightedAverage | ev-l2-p1 | Prize Board Weight Drop (board-before-formula gate, EV $5) |
| problem-3 | Problem3MysteryBoxes | ev-l3-p1 | Mystery Box Reveal (all-boxes-open gate, counts→prob) |
| problem-4 | Problem4CalculateEV | ev-l3-p2 | Calculate EV from Table (EV $4) — minor |
| problem-5 | Problem5PayoutVsProfit | ev-l4-p1 | Pay to Play (cost-before-profit gate, profit $1) |
| problem-6 | Problem6FairnessSort | ev-l4-p2 | Fair/Favorable/Unfavorable — minor |
| problem-7 | Problem7WholeEVModel | ev-l5-p1 | **Carnival Booth Preview** (qualitative, both-preview gate; NOT capstone) |
| problem-8 | Problem8SameEVDifferentRisk | ev-l5-p2 | **Wider Spread Same Average** ($6 vs $12/$0, EV calc, risk=B) |

### Risk areas
- **Migration correctness**: removed-slug → successor mapping must not erase or mis-count existing user progress (problem-1..8 must keep resolving). HIGH risk → Agent 1 owns + tests.
- **Shared files** (serialize): `src/core/progression/canonical.ts`, `src/data/problems/index.ts`, `src/pages/ProblemPage.tsx`, `src/data/implementedProblems.ts`, `src/types/problem.ts`, `src/index.css`. Owned/sequenced by Agent 1.
- **Shared visuals** (`src/components/visuals/**`): reused across problems → single-owner rule below to avoid parallel collisions.
- **L5P1/L5P2 must not reuse the same numbers** (PRD cohesion); checker for L5P2 rejects L5P1 booth payouts.
- Removed `src/data/problems` files? NO — keep problem-1..8; do not delete legacy. Removed slugs only leave the *ordering*, not history.

### Parallelizable vs serial
- **Serial first (Phase 1)**: core model migration + type union + registry/route scaffolding (Agent 1). Everything depends on the 15-model + interfaces.
- **Parallel (Phase 2)**: Agent 2 (UI/home), Agent 3 (L1+L2 problems), Agent 4 (L3+L4 problems), Agent 5 (L5 problems + shared visuals/animation/sim helpers), Agent 6 (validation/QA harness). Non-overlapping file ownership.
- **Serial last (Phase 3)**: Agent 1 integration (wire registry/components/types), full build/lint/test, manual scenario.

---

## Epics

### E-1: Core 15-problem architecture & migration (Agent 1)
- S-1.1: Canonical model 5×3, `ev-l{N}-p{M}` slugs, `legacyProblemId`, preserve `problem-1..8` → T-101
- S-1.2: Removed-slug→successor resolver; chapter÷15/lesson÷3; index 0..14; mastery 11/15; milestones/subtitle counts → T-102
- S-1.3: `ProblemCheckInput` union + per-problem check-input types reconciliation; registry + ProblemPage + implementedProblems scaffolding for 15 → T-103 (CP scaffold) / T-301 (final wire)

### E-2: Learning UX shell & home pathway (Agent 2)
- S-2.1: Verify/repair no-scroll-chasing two-region `ProblemLayout`, coach panel placement, demo, review/restart, reduced-motion primitives → T-201
- S-2.2: Golf course 15 holes (5×3), final-hole capstone emphasis, home current-chapter card, count strings → T-202

### E-3: Lesson 1 & 2 problems (Agent 3)
- ev-l1-p1 (revise), ev-l1-p2 (new), ev-l1-p3 (new), ev-l2-p1 (revise), ev-l2-p2 (new), ev-l2-p3 (new) → T-301..306

### E-4: Lesson 3 & 4 problems (Agent 4)
- ev-l3-p1 (revise), ev-l3-p2 (revise), ev-l3-p3 (new), ev-l4-p1 (revise), ev-l4-p2 (revise), ev-l4-p3 (new) → T-401..406

### E-5: Lesson 5 problems + shared sim/visual helpers (Agent 5)
- ev-l5-p1 (revise→preview), ev-l5-p2 (revise→$6/$12-0), ev-l5-p3 (new capstone) + seeded-RNG simulation helpers + any net-new shared visuals → T-501..503

### E-6: Validation, accessibility & QA harness (Agent 6)
- Validation matrix + PRD checklist updated to 15 + P1 gates; tap-to-place/reduced-motion/no-scroll audit checklist; progress/migration test review → T-601..603

---

## Tasks & ownership

| ID | Title | Agent | Phase | Depends | Allowed paths | Forbidden |
|----|-------|-------|-------|---------|---------------|-----------|
| T-101 | Canonical 5×3 model + slugs + legacyProblemId | agent-1 | 1 | none | `src/core/progression/**`, `src/types/chapter.ts` | UI, problem bodies, packs |
| T-102 | Migration successor map + scales + mastery 11/15 + milestone/subtitle counts | agent-1 | 1 | T-101 | `src/core/persistence/**`, `src/core/mastery/**`, `src/data/chapter.ts`, `src/lib/masteryService.ts`, `src/lib/milestonesService.ts` | UI, problem bodies |
| T-103 | CheckInput union + registry/route/implemented scaffolding (15) | agent-1 | 1 | T-101 | `src/types/problem.ts`, `src/data/implementedProblems.ts`, `src/data/problems/index.ts`, `src/pages/ProblemPage.tsx` | problem component bodies |
| T-201 | Problem shell / coach / demo / review-restart / reduced-motion shell verify+repair | agent-2 | 2 | T-101 | `src/features/learning-experience/**`, `src/components/lesson/**` | core, problem packs, visuals owned by 3/4/5 |
| T-202 | Golf course 15 holes + home card + count strings | agent-2 | 2 | T-101 | `src/features/course-map/**`, `src/pages/HomePage.tsx`, `src/components/CoursePathway.tsx`, `src/components/ChapterProgressCard.tsx`, `src/components/SuggestedReview.tsx` | core, problems |
| T-301..306 | Lesson 1 & 2 problems (3 revise, 3 new) | agent-3 | 2 | T-101,T-103 | `src/components/problems/{Problem1LongRunAverage,Problem2WeightedAverage,EvL1P2*,EvL1P3*,EvL2P2*,EvL2P3*}.tsx`, `src/data/problems/{problem-1,problem-2,ev-l1-p2,ev-l1-p3,ev-l2-p2,ev-l2-p3}.ts`, `src/components/visuals/{owned}` | other lessons, core, registry index, ProblemPage |
| T-401..406 | Lesson 3 & 4 problems (4 revise, 2 new) | agent-4 | 2 | T-101,T-103 | `src/components/problems/{Problem3MysteryBoxes,Problem4CalculateEV,Problem5PayoutVsProfit,Problem6FairnessSort,EvL3P3*,EvL4P3*}.tsx`, `src/data/problems/{problem-3,problem-4,problem-5,problem-6,ev-l3-p3,ev-l4-p3}.ts`, owned visuals | other lessons, core, registry |
| T-501..503 | Lesson 5 problems (2 revise, 1 new capstone) + sim/visual helpers | agent-5 | 2 | T-101,T-103 | `src/components/problems/{Problem7WholeEVModel,Problem8SameEVDifferentRisk,EvL5P3*}.tsx`, `src/data/problems/{problem-7,problem-8,ev-l5-p3}.ts`, `src/lib/simulation*` (new), owned visuals (`CarnivalWheel`, `RiskComparisonGraph`) | other lessons, core, registry |
| T-601..603 | Validation matrix + PRD checklist (15) + a11y/tap/reduced-motion audit | agent-6 | 2 | T-101 | `src/validation/**`, `docs/validation-plan.md`, new `*.test.ts` under `src/validation/**` | app source under other agents |
| T-301-INT | Final integration: wire 15 components/defs/types, build/lint/test, manual scenario | agent-1 | 3 | all Phase 2 handoffs | all (integration) | — |

### Shared-visual single-owner rule (Phase 2)
- **Agent 3** may edit: `RunningAverageGraph` (also used by A5 read-only — A3 owns edits; A5 uses as-is), `ConfigurableSpinner`, `SpinnerWheel`, `FormulaBuilder`, new dice visual `DiceThrowZone` (new file).
- **Agent 4** may edit: `MysteryBoxes`, `ProbabilityTable`, `BalanceScale`, `ClassicBalanceScale`, `FairnessNumberLine`.
- **Agent 5** may edit: `CarnivalWheel`, `RiskComparisonGraph`, new `src/lib/simulation.ts` seeded RNG helper.
- Any agent needing a NEW visual creates a uniquely-named file in `src/components/visuals/` prefixed by problem (e.g. `EvL1P3CompareCards.tsx`). No two agents edit the same visual file in Phase 2.
- `src/index.css`: Phase 2 agents append problem-scoped classes only if unavoidable; prefer component-scoped styles. Agent 1 reconciles in integration.

---

## Phase schedule

### Phase 1 — Foundation (Agent 1 solo, this chat)
T-101 → T-102 → T-103. Produces 15-model + interfaces + scaffolding. Handoff: `docs/parallel/agent-1-core-handoff.md` (updated for 15).

### Phase 2 — Parallel features (Agents 2–6, background)
All depend on Phase 1 handoff. Non-overlapping paths. Each: CP0 audit → implement → tests on owned scope → handoff doc.

### Phase 3 — Integration (Agent 1)
Wire registry/components/types/routes; reconcile CheckInput union; full `tsc`/`vitest`/`build`/`lint`; PRD manual scenario.

### Phase 4 — Reports
Integration report + PRD-difference report (complete / partial / missing / risky).

---

## Shared contracts (detail in interfaces.md)
- `CanonicalProblem.storageId` = `ProblemDefinition.problemId`. Legacy `problem-1..8` preserved.
- Canonical slugs: `ev-l1-p1 … ev-l5-p3`. `legacyProblemId` carries old slug for removed/renamed.
- Registry `getProblemDefinition(storageId)` resolves all 15. `ProblemPage` maps 15 storage IDs → components.
- Per-problem `CheckInput` types added to `src/types/problem.ts`; Agent 1 owns the union.
- Storage IDs per lesson (play order): L1 `problem-1, ev-l1-p2, ev-l1-p3`; L2 `problem-2, ev-l2-p2, ev-l2-p3`; L3 `problem-3, problem-4, ev-l3-p3`; L4 `problem-5, problem-6, ev-l4-p3`; L5 `problem-7, problem-8, ev-l5-p3`.

## Removed-slug → successor migration map (PRD Page 2)
| Removed slug | Maps to successor slug | Successor storageId |
|---|---|---|
| l1-short-run-vs-long-run | ev-l1-p2 | ev-l1-p2 |
| l2-fill-missing-formula | ev-l2-p3 | ev-l2-p3 |
| l3-repair-probability-table | ev-l3-p3 | ev-l3-p3 |
| l4-find-fair-price | ev-l4-p3 | ev-l4-p3 |
| l5-low-risk-vs-high-risk | ev-l5-p3 | ev-l5-p3 |

## Manual test checklist (post-build)
- [ ] Home golf map shows 5 zones × 3 holes = 15; final hole emphasized.
- [ ] All 15 problems load an interactive component (no placeholder).
- [ ] L1P1 dice: manual≥5 + ≥100 throws gate; $5 correct; tap-to-throw == drag.
- [ ] L2P1 board-before-formula gate; L3P1 all-boxes-open gate; L4P1 cost-before-profit gate; L5P1 both-preview gate.
- [ ] L5P2 uses $6 vs $12/$0 (not L5P1 numbers); EV(A)=EV(B)=6; risk=Game B.
- [ ] Legacy progress with `problem-1..8` + a removed slug resolves to 15-model successors; no progress lost.
- [ ] Chapter % ÷15; lesson % ÷3; mastery at 11/15 in ≤2 graded attempts; practice restart doesn't reduce mastery.
- [ ] No-scroll-chasing at 1280×720; feedback beneath check; mobile sticky task + tap fallbacks.
- [ ] Reduced-motion: deterministic identical outcomes; no bounce/sparkle.
- [ ] `tsc`/`vitest`/`build`/`lint` all green.
