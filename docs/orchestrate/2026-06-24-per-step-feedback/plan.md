# Plan: per-step-feedback

Run: 2026-06-24-per-step-feedback

## Problem

Multi-step problems (no-scroll workspace) grade ALL steps only at the final
"Check answer". When an earlier step is wrong, the learner sees an error about a
section they already left (e.g. "WRONG DEFECT A" while on the "Diagnose Formula
B" step). Feedback never points at the step they are on, so it feels like the
answer is "locked" / not updating.

## Goal

Give immediate, per-step feedback. Each answer-bearing step is checked when the
learner finishes it (a per-step "Check" affordance + the shared coach panel),
shows feedback for THAT step, and the learner cannot advance past a step that is
not yet correct. The final step still drives completion.

## Affected problems (multiple answer-bearing steps, single end check)

- `EvL2P3DiagnoseSetups` (3 steps) — reported bug, Phase 1 reference
- `EvL4P3BetterGame` (2 steps)
- `EvL5P3FinalDecision` (6 steps)
- `Problem7WholeEVModel` (2 steps)
- `EvL1P3CompareGames` (2 steps)

## Epics → Tasks

### Epic A — Workspace per-step contract (foundation)
- T-001 Per-step feedback infra + reference migration

### Epic B — Migrate remaining multi-step problems (parallel)
- T-002 EvL4P3BetterGame
- T-003 EvL5P3FinalDecision
- T-004 Problem7WholeEVModel + EvL1P3CompareGames

### Epic C — Integration & validation
- T-005 build/lint/test + browser re-verify

## Tasks

| id | title | agent | depends_on | handoff |
|----|-------|-------|-----------|---------|
| T-001 | Per-step infra + EvL2P3 | agent-1-foundation | none | handoffs/agent-1-foundation.md |
| T-002 | EvL4P3BetterGame | agent-2-l4 | T-001 | handoffs/agent-2-l4.md |
| T-003 | EvL5P3FinalDecision | agent-3-l5 | T-001 | handoffs/agent-3-l5.md |
| T-004 | Problem7 + EvL1P3 | agent-4-p7l1 | T-001 | handoffs/agent-4-p7l1.md |
| T-005 | Integration/validation | agent-5-validation | T-002,T-003,T-004 | handoffs/integration.md |

### allowed_paths

- T-001: `src/features/learning-experience/WorkspaceSteps.tsx`, `src/components/lesson/ProblemLayout.tsx`, `src/features/learning-experience/index.ts`, `src/components/problems/EvL2P3DiagnoseSetups.tsx`, `src/data/problems/ev-l2-p3.ts`, `docs/orchestrate/2026-06-24-per-step-feedback/interfaces.md`
- T-002: `src/components/problems/EvL4P3BetterGame.tsx`, `src/components/problems/EvL4P3BetterGame.checker.ts`, `src/data/problems/ev-l4-p3.ts`
- T-003: `src/components/problems/EvL5P3FinalDecision.tsx`, `src/data/problems/ev-l5-p3.ts`
- T-004: `src/components/problems/Problem7WholeEVModel.tsx`, `src/components/problems/EvL1P3CompareGames.tsx`, `src/data/problems/ev-l1-p3.ts`, plus the Problem7 data/checker file it imports (read first; edit only the Problem7-specific checker)
- T-005: any (integration), but prefer not to rewrite feature logic — only wire/fix

### forbidden_paths (Phase 2 workers)

- Do NOT edit `WorkspaceSteps.tsx`, `ProblemLayout.tsx`, `index.ts`, or any file owned by another task. Consume the contract in `interfaces.md`.

## Phases

- Phase 1 (foundation): T-001
- Phase 2 (parallel): T-002, T-003, T-004
- Phase 3 (integration): T-005

## Verify commands

- `npm run lint`
- `npm test`
- `npm run build`
