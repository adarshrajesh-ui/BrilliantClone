# Plan: Revamp Lesson 3 — 3D Card-Dealing Table

run-id: `2026-06-24-l3-card-table`

## Goal

Revamp **only Lesson 3** of the Expected Value chapter with a **3D card-dealing
table** theme (inspired by, not copied from, the Dribbble "Cards animation"
shot — original cards/colors/motion only). Lesson 3's pedagogy is unchanged:
**counts → probabilities → EV table**.

Do **not** change Lessons 1, 2, 4, 5, the core progression model, persistence,
mastery, or the learning-experience shell. Storage IDs stay identical:
`problem-3` (ev-l3-p1), `problem-4` (ev-l3-p2), `ev-l3-p3`.

## The three problems

| Slot | Storage ID | Title | Concept | EV |
|---|---|---|---|---|
| L3 P1 | `problem-3` | Average Card Value | EV of one draw from a 52-card deck | 340/52 = 85/13 ≈ **6.54** |
| L3 P2 | `problem-4` | Dealt-Hand Contributions | Fill contributions from a provided card-value table (8-card hand) | **6.5** |
| L3 P3 | `ev-l3-p3` | Mini-Deck EV Table | Independent fluency: full value/count/prob/contribution/EV table (10-card deck) | **6.4** |

Exact datasets, accepted answers, and mistake types are pinned in
[`interfaces.md`](./interfaces.md). **Workers must follow interfaces.md exactly.**

## Layout / UX requirements (all three problems)

- No-scroll Brilliant-style workspace via `ProblemLayout` + `steps`
  (`WorkspaceStepDef[]`) — same pattern as `EvL3P3PrizeBagTable.tsx`.
- Left = 3D card table + dealing animation. Right = task, inputs, hints,
  feedback, next (handled by `ProblemLayout`/`WorkspaceSteps`).
- Deterministic checking only. No AI. No randomness in grading.
- Reduced-motion fallback (instant final state) honoring
  `usePrefersReducedMotion`.

## Epics → Stories → Tasks

### Epic A — Card foundation (data + visuals)
- Story A1: Canonical card model, deck, value-grouping, EV math, and the three
  fixed datasets. → **T-001 (agent-1-data)**
- Story A2: Reusable 3D card-table visual library (table, original card, deal
  arc + flip + group-by-value + count labels + EV badge, reduced-motion). →
  **T-002 (agent-2-visuals)**

### Epic B — The three Lesson-3 problems
- Story B1: L3 P1 Average Card Value (52-deck summary → enter 16 → EV 6.54). →
  **T-003 (agent-3-l3p1)**
- Story B2: L3 P2 Dealt-Hand Contributions (8-card hand, contribution column +
  EV 6.5). → **T-004 (agent-4-l3p2)**
- Story B3: L3 P3 Mini-Deck EV Table (10-card full table, EV 6.4). →
  **T-005 (agent-5-l3p3)**

### Epic C — Integration & validation
- Story C1: Route the new components, refresh the Lesson-3 PRD section. →
  **T-006 (agent-6-integration)**
- Story C2: Rewire validation to the new card checkers, delete orphaned
  mystery-box/prize-bag files, full build/lint/test green. →
  **T-007 (agent-7-validation)**

## Phases (dependency waves)

### Phase 1 — Foundation (parallel)
- T-001 agent-1-data — card model + datasets
- T-002 agent-2-visuals — 3D card-table visual library

### Phase 2 — Problems (parallel; depend on T-001 + T-002)
- T-003 agent-3-l3p1
- T-004 agent-4-l3p2
- T-005 agent-5-l3p3

### Phase 3 — Integration (depends on T-003..T-005)
- T-006 agent-6-integration

### Phase 4 — Validation (depends on T-006)
- T-007 agent-7-validation

## Task table

| id | title | agent | depends_on | handoff |
|---|---|---|---|---|
| T-001 | Card model + datasets | agent-1-data | none | handoffs/agent-1-data.md |
| T-002 | 3D card visual library | agent-2-visuals | none | handoffs/agent-2-visuals.md |
| T-003 | L3 P1 Average Card Value | agent-3-l3p1 | T-001,T-002 | handoffs/agent-3-l3p1.md |
| T-004 | L3 P2 Dealt-Hand Contributions | agent-4-l3p2 | T-001,T-002 | handoffs/agent-4-l3p2.md |
| T-005 | L3 P3 Mini-Deck EV Table | agent-5-l3p3 | T-001,T-002 | handoffs/agent-5-l3p3.md |
| T-006 | Routing + PRD | agent-6-integration | T-003..T-005 | handoffs/agent-6-integration.md |
| T-007 | Validation + cleanup | agent-7-validation | T-006 | handoffs/agent-7-validation.md |

## File ownership (no intra-phase overlap)

**Phase 1**
- agent-1-data — ALLOWED: `src/data/cards/**` (new folder)
- agent-2-visuals — ALLOWED: `src/components/visuals/cards/**` (new folder)
  (may `import type` from `src/data/cards` per interfaces.md)

**Phase 2** (each owns one data file + its own new component/checker/test/css)
- agent-3-l3p1 — ALLOWED: `src/data/problems/problem-3.ts`,
  `src/components/problems/Problem3AverageCardValue.{tsx,checker.ts,checker.test.ts,css}`
- agent-4-l3p2 — ALLOWED: `src/data/problems/problem-4.ts`,
  `src/components/problems/Problem4DealtHandContributions.{tsx,checker.ts,checker.test.ts,css}`
- agent-5-l3p3 — ALLOWED: `src/data/problems/ev-l3-p3.ts`,
  `src/components/problems/EvL3P3MiniDeckTable.{tsx,checker.ts,checker.test.ts,css}`

**Phase 3**
- agent-6-integration — ALLOWED: `src/pages/ProblemPage.tsx`, `prd.md`
  (Lesson-3 section only)

**Phase 4**
- agent-7-validation — ALLOWED: `src/validation/**`, `src/lib/answerChecker.ts`,
  `src/lib/answerChecker.test.ts`, and **deletion** of orphaned old files:
  `src/components/problems/Problem3MysteryBoxes.tsx`,
  `src/components/visuals/MysteryBoxes.tsx`, `src/components/visuals/MysteryBoxes.css`,
  `src/components/problems/Problem4CalculateEV.tsx`,
  `src/components/problems/EvL3P3PrizeBagTable.tsx`,
  `src/components/problems/EvL3P3PrizeBagTable.checker.ts`,
  `src/components/problems/EvL3P3PrizeBagTable.checker.test.ts`,
  `src/components/visuals/PrizeBagTokens.tsx`, `src/components/visuals/PrizeBagTokens.css`

> FORBIDDEN for everyone except the listed owner. No worker touches the
> progression core, persistence, mastery, or other lessons' problems.

## Verification

- `npm run test` (vitest), `npm run lint` (oxlint), `npm run build`
  (`tsc -b && vite build`) all green at the end of Phase 4.
