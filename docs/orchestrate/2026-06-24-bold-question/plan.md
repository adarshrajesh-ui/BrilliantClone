# Plan: 2026-06-24-bold-question

## Goal

A tester said it was hard to know what the actual question/task was on the
problems page. Make **the question being asked stand out (bold + themed
emphasis) for every problem**, while keeping the look on-theme and polished.

## Approach

- The "question being asked" is the per-step `prompt` (rendered in `.ws-prompt`)
  for workspace problems, the `taskGuide` for legacy-shell problems, and inline
  prompts (`.ws-prompt-inline`) inside step content.
- **Foundation** introduces a single shared, themed `QuestionPrompt`
  presentational component + CSS class so emphasis is consistent everywhere and
  easy to maintain. It also makes the base `.ws-prompt` question region read as
  the prominent element of the header.
- **Feature agents** wrap the actual question text in each problem with
  `QuestionPrompt` (or the shared class) so the precise question reads as bold
  and clearly distinguished from surrounding instructions. Each feature agent
  owns a disjoint set of problem `.tsx` files.
- **Integration** verifies build/lint/test and reconciles any import/export
  issues.

## Hierarchy

### Epic A — Shared question emphasis primitive
- Story: One themed, reusable way to render "the question" prominently.
  - T-001 Foundation: `QuestionPrompt` component + themed CSS + export

### Epic B — Apply emphasis to every problem
- Story: Each problem clearly bolds its question.
  - T-002 Lesson 1 + weighted-average problems
  - T-003 Lesson 3–5 core EV problems (mystery boxes, calc EV, payout)
  - T-004 Fairness / whole-model / risk problems
  - T-005 EV L1–L2 extra problems
  - T-006 EV L2–L5 extra problems

### Epic C — Integration
  - T-007 Build/lint/test + reconcile

## Tasks

| id | title | agent | depends_on | allowed_paths | forbidden_paths | acceptance | handoff |
|----|-------|-------|------------|---------------|-----------------|------------|---------|
| T-001 | Shared QuestionPrompt + theme | agent-1-foundation | none | `src/features/learning-experience/QuestionPrompt.tsx`, `src/features/learning-experience/index.ts`, `src/features/learning-experience/workspace.css` | all problem `.tsx`, all `src/data/**`, all other css | Component renders themed bold question; exported from index; `tsc -b` clean for the feature; `.ws-prompt` reads prominent | handoffs/agent-1-foundation.md |
| T-002 | L1 + weighted-average | agent-2-l1 | T-001 | `src/components/problems/Problem1LongRunAverage.tsx`, `src/components/problems/Problem1SpinnerPlayground.tsx`, `src/components/problems/Problem2WeightedAverage.tsx` | every other file; all `.css`; all `src/data/**` | Each problem's question wrapped in QuestionPrompt; build clean | handoffs/agent-2-l1.md |
| T-003 | Core EV problems | agent-3-core | T-001 | `src/components/problems/Problem3MysteryBoxes.tsx`, `src/components/problems/Problem4CalculateEV.tsx`, `src/components/problems/Problem5PayoutVsProfit.tsx`, `src/components/problems/Problem5PayoutPlayground.tsx` | every other file; all `.css`; all `src/data/**` | Each problem's question wrapped; build clean | handoffs/agent-3-core.md |
| T-004 | Fairness / model / risk | agent-4-model | T-001 | `src/components/problems/Problem6FairnessSort.tsx`, `src/components/problems/Problem7WholeEVModel.tsx`, `src/components/problems/Problem8SameEVDifferentRisk.tsx` | every other file; all `.css`; all `src/data/**` | Each problem's question wrapped; build clean | handoffs/agent-4-model.md |
| T-005 | EV L1–L2 extras | agent-5-evab | T-001 | `src/components/problems/EvL1P2UnequalSpinner.tsx`, `src/components/problems/EvL1P3CompareGames.tsx`, `src/components/problems/EvL2P2MatchOutcomes.tsx` | every other file; all `.css`; all `src/data/**` | Each problem's question wrapped; build clean | handoffs/agent-5-evab.md |
| T-006 | EV L2–L5 extras | agent-6-evcd | T-001 | `src/components/problems/EvL2P3DiagnoseSetups.tsx`, `src/components/problems/EvL3P3PrizeBagTable.tsx`, `src/components/problems/EvL4P3BetterGame.tsx`, `src/components/problems/EvL5P3FinalDecision.tsx` | every other file; all `.css`; all `src/data/**` | Each problem's question wrapped; build clean | handoffs/agent-6-evcd.md |
| T-007 | Integration | agent-7-integration | T-001..T-006 | repo-wide (reconcile only) | — | `npm run build`, `npm run lint`, `npm run test` pass | handoffs/integration.md |

## Phases

- **Phase 1 (foundation):** T-001
- **Phase 2 (parallel features):** T-002, T-003, T-004, T-005, T-006
- **Phase 3 (integration):** T-007
