# Plan: Claw Machine Expected Value (Lesson 2, Problem 1)

Run: `2026-06-24-claw-machine-l2p1`
Goal: Replace Lesson 2 Problem 1 ("Prize Board Weight Drop") with a 3D carnival
**claw machine** that teaches weighted average through chance-space before the
formula. New title: **Claw Machine Expected Value**.

## Hard constraints (do NOT break)

- Keep storage ID **`problem-2`** and canonical slug **`ev-l2-p1`** everywhere.
- Keep the React component **export name `Problem2WeightedAverage`** in
  `src/components/problems/Problem2WeightedAverage.tsx` so `ProblemPage.tsx`
  needs **no** edit (registry key `'problem-2'` stays).
- Keep checker export names **`checkProblem2PrizeBoard`** and type
  **`Problem2PrizeBoardCheckInput`** in `src/data/problems/problem-2.ts` so
  `src/validation/liveCheckers.ts` needs **no** edit.
- Do NOT touch auth / Firebase / progress / mastery / `usePersistedProblemState`
  key (`'problem-2'`). Do NOT change any other problem. No AI features.
- Math is unchanged: $20 with p=0.25, $0 with p=0.75, EV = 20×0.25 + 0×0.75 = $5.
  Accepted answers: `5, 5.0, 5.00, $5, $5.00`.

## What changes (behaviorally)

1. New title + scenario copy ("Claw Machine Expected Value").
2. New left-panel 3D claw machine visual (pit with 4 equal zones: one $20 = 25%,
   three $0 = 75%), claw travel/drop/grab/rise, payout token to tray, gold flash
   for $20, gray for $0, reduced-motion instant reveal.
3. New contribution-compression visual ($20×25%=$5, $0×75%=$0, EV=$5).
4. Completion gate changes from "both tokens dropped" to **"ran ≥ 8 claw drops
   AND viewed contribution compression"**, then pair the formula and submit $5.
   Gate field renamed `bothDropped` → `grabsComplete` (same checker name/type).

## Epics → Tasks

### Epic A — Data, checker, spec
- **T-001** (agent-1-data): Rewrite `PROBLEM_2` metadata + new checker gate +
  checker unit test; update canonical title + prd.md L2P1 section.

### Epic B — Visuals
- **T-002** (agent-2-claw): 3D claw machine visual (`ClawMachine.tsx/.css`).
- **T-003** (agent-3-contrib): Contribution-compression visual
  (`ClawContributionBlocks.tsx/.css`).

### Epic C — Problem wiring
- **T-004** (agent-4-component): Rewrite `Problem2WeightedAverage.tsx` to compose
  claw machine + tray + contribution blocks + formula pairing + answer + checker,
  in a no-scroll split workspace (`l2-claw-workspace.css`).

### Epic D — Validation
- **T-005** (agent-5-validation): Update validation matrix, behavior validation,
  and tests for the new gate field + title; ensure `npm test` is green.

## Phases (dependency waves)

| Phase | Tasks (parallel) | Depends on |
|------|-------------------|------------|
| 1 | T-001, T-002, T-003 | none (work to `interfaces.md` contracts) |
| 2 | T-004, T-005 | Phase 1 |
| 3 | Integration (orchestrator) | Phase 2 |

## Task table

| id | title | agent | depends_on | allowed_paths | forbidden_paths | handoff |
|----|-------|-------|------------|---------------|-----------------|---------|
| T-001 | Data + checker + spec | agent-1-data | none | `src/data/problems/problem-2.ts`, `src/data/problems/problem-2.checker.test.ts` (new), `src/core/progression/canonical.ts`, `prd.md` | everything else | handoffs/agent-1-data.md |
| T-002 | Claw machine visual | agent-2-claw | none | `src/components/visuals/ClawMachine.tsx` (new), `src/components/visuals/ClawMachine.css` (new) | everything else | handoffs/agent-2-claw.md |
| T-003 | Contribution blocks visual | agent-3-contrib | none | `src/components/visuals/ClawContributionBlocks.tsx` (new), `src/components/visuals/ClawContributionBlocks.css` (new) | everything else | handoffs/agent-3-contrib.md |
| T-004 | Problem component + layout | agent-4-component | T-001,T-002,T-003 | `src/components/problems/Problem2WeightedAverage.tsx`, `src/components/problems/l2-claw-workspace.css` (new) | everything else | handoffs/agent-4-component.md |
| T-005 | Validation + tests | agent-5-validation | T-001 | `src/validation/answerValidationMatrix.ts`, `src/validation/problemBehaviorValidation.ts`, `src/validation/liveCheckerValidation.test.ts`, `src/validation/prdCoverage.test.ts`, `src/components/problems/agent3-checkers.test.ts` | `src/data/problems/problem-2.ts`, `src/validation/liveCheckers.ts`, everything else | handoffs/agent-5-validation.md |

## File ownership check
No two tasks in the same phase share any path. Phase 1: 3 disjoint sets.
Phase 2: T-004 (component + l2 css) vs T-005 (validation/test files) — disjoint.
