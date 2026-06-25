# Plan: No Spoilers Before Answer Entry

Run: 2026-06-24-no-spoilers

Goal: For every question, do not reveal the answer before the learner enters it. The user specifically called out answer-bearing placeholders like `e.g. <answer>` and the claw machine flow showing/speaking `EV = $5` before asking for the EV.

Stack: React 19 + TypeScript + Vite + Vitest. Verification commands: `npm run build` and `npm test`.

Epics: 1 | Stories: 5 | Tasks: 5 | Phases: 2

## Epic 1: Remove Answer Spoilers

### Story 1: Claw Machine EV Reveal

#### T-001
- title: Claw machine EV visibility
- agent: agent-1-claw
- phase: 1
- depends_on: none
- allowed_paths:
  - `src/components/problems/Problem2WeightedAverage.tsx`
  - `src/components/visuals/ClawContributionBlocks.tsx`
  - `src/components/visuals/ClawContributionBlocks.css`
- forbidden_paths:
  - `src/data/problems/**`
  - `src/**/*.checker.ts`
  - `package.json`
  - `docs/orchestrate/2026-06-24-no-spoilers/plan.md`
  - `docs/orchestrate/2026-06-24-no-spoilers/interfaces.md`
- acceptance:
  - Before a correct EV submit, the claw compression step does not show `$5`, `five dollars`, or `EV = $5` in contribution products, total blocks, or screen-reader text.
  - Before a correct EV submit, the learner still sees the method structure: payout times probability and an unknown product/total.
  - After a correct submit, products and `EV = $5` may be revealed.
- handoff_file: `docs/orchestrate/2026-06-24-no-spoilers/handoffs/agent-1-claw.md`

### Story 2: Lesson 1 Placeholder Answers

#### T-002
- title: Lesson 1 neutral placeholders
- agent: agent-2-l1
- phase: 1
- depends_on: none
- allowed_paths:
  - `src/components/problems/Problem1LongRunAverage.tsx`
  - `src/components/problems/EvL1P2UnequalSpinner.tsx`
- forbidden_paths:
  - `src/data/problems/**`
  - `src/**/*.checker.ts`
  - `package.json`
  - `docs/orchestrate/2026-06-24-no-spoilers/plan.md`
  - `docs/orchestrate/2026-06-24-no-spoilers/interfaces.md`
- acceptance:
  - Inputs no longer use answer-bearing placeholders such as `e.g. 7` or `e.g. $5`.
  - Inputs remain functional and graph target/demo/completion behavior is unchanged.
- handoff_file: `docs/orchestrate/2026-06-24-no-spoilers/handoffs/agent-2-l1.md`

### Story 3: Lesson 5 Prompt And Placeholder Answers

#### T-003
- title: Lesson 5 prompt and placeholder spoilers
- agent: agent-3-l5
- phase: 1
- depends_on: none
- allowed_paths:
  - `src/components/problems/Problem8SameEVDifferentRisk.tsx`
  - `src/components/problems/Problem7WholeEVModel.tsx`
- forbidden_paths:
  - `src/data/problems/**`
  - `src/**/*.checker.ts`
  - `package.json`
  - `docs/orchestrate/2026-06-24-no-spoilers/plan.md`
  - `docs/orchestrate/2026-06-24-no-spoilers/interfaces.md`
- acceptance:
  - The Game A/Game B EV step asks for EVs without stating `$6 each` or putting `$6` / `12 x 0.5 + 0 x 0.5` in placeholders.
  - Pre-EV screen-reader text describes outcome patterns without saying both games average six dollars.
  - The two-machine play step does not state both machines average `$10` before the learner answers the same-EV question.
- handoff_file: `docs/orchestrate/2026-06-24-no-spoilers/handoffs/agent-3-l5.md`

### Story 4: Card And Profit Hints

#### T-004
- title: Card EV hints and profit sr-only spoilers
- agent: agent-4-cards-profit
- phase: 1
- depends_on: none
- allowed_paths:
  - `src/components/problems/Problem3AverageCardValue.tsx`
  - `src/components/problems/Problem5PayoutVsProfit.tsx`
- forbidden_paths:
  - `src/data/problems/**`
  - `src/**/*.checker.ts`
  - `package.json`
  - `docs/orchestrate/2026-06-24-no-spoilers/plan.md`
  - `docs/orchestrate/2026-06-24-no-spoilers/interfaces.md`
- acceptance:
  - Pre-answer hints/notes no longer hand out the value-10 count, deck total, or intermediate totals before the matching input.
  - The pay-to-play screen-reader text does not state expected profit before the learner reaches and answers the profit step.
  - Givens like cost and expected payout remain visible.
- handoff_file: `docs/orchestrate/2026-06-24-no-spoilers/handoffs/agent-4-cards-profit.md`

### Story 5: Contribution Sum Reveals

#### T-005
- title: Contribution sum reveal removal
- agent: agent-5-contrib
- phase: 1
- depends_on: none
- allowed_paths:
  - `src/components/problems/EvL3P3MiniDeckTable.tsx`
  - `src/components/problems/Problem4DealtHandContributions.tsx`
- forbidden_paths:
  - `src/data/problems/**`
  - `src/**/*.checker.ts`
  - `package.json`
  - `docs/orchestrate/2026-06-24-no-spoilers/plan.md`
  - `docs/orchestrate/2026-06-24-no-spoilers/interfaces.md`
- acceptance:
  - The EV-entry step does not display or speak the computed sum of contributions before the EV input is answered.
  - The learner still gets method copy telling them to add contributions.
  - Post-completion EV badges remain gated on completion.
- handoff_file: `docs/orchestrate/2026-06-24-no-spoilers/handoffs/agent-5-contrib.md`

## Phase Grouping

Phase 1 (parallel): T-001, T-002, T-003, T-004, T-005

Phase 2 (integration): read handoffs, reconcile any conflicts, run `npm run build` and `npm test`, then write `docs/orchestrate/2026-06-24-no-spoilers/handoffs/integration.md`.
