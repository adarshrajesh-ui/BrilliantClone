# Parallel Build Plan — 2026-06-24-no-scroll-workspace

## Goal
Implement the PRD's no-scroll, Brilliant-like problem workspace across all 15 problems.
During a problem, the page must not scroll: the full active step (visual, prompt/current
task, input/interaction, feedback, hint, Next/Previous controls, completion state) fits one
focused workspace. Oversized content is split into Next/Previous step panels. Brilliant is
used as UX inspiration only (public patterns); colors/visual identity differ and no
proprietary Brilliant code/assets are copied.

## Source of truth
- PRD: `prd.md` (Page 2 "Problem-Page UX Requirements", no-scroll acceptance criteria)
- Contract: `docs/orchestrate/2026-06-24-no-scroll-workspace/interfaces.md`

## Constraints (hard)
- Do NOT change curriculum, problem math, EV values, checker logic, validation rules,
  accepted answer formats, Firebase, routing, or data schema. Presentation only.
- All existing tests must still pass (baseline: build OK, 572 tests pass).
- No two tasks in the same phase may edit the same file (isolated ownership below).

## Stack / commands
- React 19 + TypeScript + Vite; Firebase; react-router-dom 7.
- Build: `npm run build` · Lint: `npm run lint` · Test: `npm run test` (vitest).

## Epics
1. **E1 No-scroll workspace shell** — fixed-viewport workspace, step panels, Next/Previous,
   bottom action bar, inline feedback, Brilliant-like theme.
2. **E2 Apply workspace to all 15 problems** — convert each problem's stacked sections into
   ordered no-scroll step panels using the shell's step API.
3. **E3 Integration & validation** — wire-up, build/lint/test, no-scroll acceptance checks.

---

## Phase 1 — Foundation (1 agent)

### T-001 — No-scroll workspace shell + step API + Brilliant-like theme
- **agent:** agent-1-core
- **depends_on:** none
- **allowed_paths:**
  - `src/features/learning-experience/ResponsiveProblemShell.tsx`
  - `src/features/learning-experience/WorkspaceSteps.tsx` (new)
  - `src/features/learning-experience/workspace.css` (new)
  - `src/features/learning-experience/LearningCoachPanel.tsx`
  - `src/features/learning-experience/index.ts`
  - `src/components/lesson/ProblemLayout.tsx`
  - `src/components/lesson/TaskGuide.tsx`
  - `src/components/lesson/HintPanel.tsx`
  - `src/index.css`
  - `src/main.tsx` (only if needed to import workspace.css)
  - `docs/orchestrate/2026-06-24-no-scroll-workspace/**`
- **forbidden_paths:** `src/components/problems/**`, `src/components/visuals/**`,
  `src/data/**`, `src/core/**`, `src/lib/**`, `src/validation/**`, `**/*.test.ts`,
  `**/*.checker.ts`, `prd.md`
- **acceptance:**
  - New `WorkspaceSteps` step API exported per interfaces.md; `ProblemLayout` accepts
    optional `steps` and renders one no-scroll step at a time with Prev/Next + step indicator.
  - Legacy `children` path still works (no `steps` ⇒ current behavior) so build stays green
    before lessons migrate.
  - Brilliant-like theme: fixed-viewport `.problem-workspace`, bottom action bar with
    Prev/Next/Continue + inline coach feedback, single-column option styles, compact visual
    wrapper (`.ws-visual`), no horizontal scroll, touch targets ≥44px. Colors may differ.
  - `npm run build` + `npm run lint` + `npm run test` pass.
  - Finalize `interfaces.md` with the exact exported API + a worked conversion example.
- **handoff_file:** `handoffs/agent-1-core.md`

---

## Phase 2 — Apply workspace per lesson (5 agents, parallel)

All Phase 2 tasks: read `interfaces.md` first; convert each problem's stacked
`.card`/`section` blocks into ordered `steps` (one no-scroll panel each) using the shell API;
keep all checker/state/validation calls byte-for-byte; add compact presentation CSS only in
your own per-problem CSS file. **Forbidden for every Phase 2 task:** `src/index.css`,
`src/features/learning-experience/**`, `src/components/lesson/**`,
`src/components/visuals/**`, `src/data/**`, `src/core/**`, `src/lib/**`,
`src/validation/**`, any `*.checker.ts`, any `*.test.ts`, other lessons' files, `prd.md`.

### T-101 — Lesson 1 workspace
- **agent:** agent-1-l1 · **depends_on:** T-001
- **allowed_paths:** `src/components/problems/Problem1LongRunAverage.tsx`,
  `src/components/problems/EvL1P2UnequalSpinner.tsx`,
  `src/components/problems/EvL1P3CompareGames.tsx`,
  `src/components/problems/l1-workspace.css` (new, optional)
- **handoff_file:** `handoffs/agent-1-l1.md`

### T-102 — Lesson 2 workspace
- **agent:** agent-2-l2 · **depends_on:** T-001
- **allowed_paths:** `src/components/problems/Problem2WeightedAverage.tsx`,
  `src/components/problems/EvL2P2MatchOutcomes.tsx`,
  `src/components/problems/EvL2P3DiagnoseSetups.tsx`,
  `src/components/problems/l2-workspace.css` (new, optional)
- **handoff_file:** `handoffs/agent-2-l2.md`

### T-103 — Lesson 3 workspace
- **agent:** agent-3-l3 · **depends_on:** T-001
- **allowed_paths:** `src/components/problems/Problem3MysteryBoxes.tsx`,
  `src/components/problems/Problem3MysteryBoxes.css`,
  `src/components/problems/Problem4CalculateEV.tsx`,
  `src/components/problems/EvL3P3PrizeBagTable.tsx`,
  `src/components/problems/agent3.css`,
  `src/components/problems/l3-workspace.css` (new, optional)
- **forbidden (extra):** `src/components/problems/EvL3P3PrizeBagTable.checker.ts`
- **handoff_file:** `handoffs/agent-3-l3.md`

### T-104 — Lesson 4 workspace
- **agent:** agent-4-l4 · **depends_on:** T-001
- **allowed_paths:** `src/components/problems/Problem5PayoutVsProfit.tsx`,
  `src/components/problems/Problem5PayoutVsProfit.css`,
  `src/components/problems/Problem6FairnessSort.tsx`,
  `src/components/problems/EvL4P3BetterGame.tsx`,
  `src/components/problems/EvL4P3BetterGame.css`,
  `src/components/problems/l4-workspace.css` (new, optional)
- **forbidden (extra):** `src/components/problems/Problem5PayoutVsProfit.checker.ts`,
  `src/components/problems/EvL4P3BetterGame.checker.ts`
- **handoff_file:** `handoffs/agent-4-l4.md`

### T-105 — Lesson 5 workspace
- **agent:** agent-5-l5 · **depends_on:** T-001
- **allowed_paths:** `src/components/problems/Problem7WholeEVModel.tsx`,
  `src/components/problems/Problem8SameEVDifferentRisk.tsx`,
  `src/components/problems/EvL5P3FinalDecision.tsx`,
  `src/components/problems/lesson5.css`,
  `src/components/problems/l5-workspace.css` (new, optional)
- **handoff_file:** `handoffs/agent-5-l5.md`

---

## Phase 3 — Integration & validation (orchestrator)
- Read all handoffs; run `npm run build`, `npm run lint`, `npm run test`.
- Reconcile any cross-cutting issues (without changing math/validation).
- Manual no-scroll acceptance spot-check notes for desktop (1280×720) and mobile (≤390px).
- Write `handoffs/integration.md`; update `status.md` to complete.

## Phase grouping (waves)
- Phase 1 (parallel): T-001
- Phase 2 (parallel): T-101, T-102, T-103, T-104, T-105
- Phase 3: integration

## Note on "scraping Brilliant's code"
Brilliant's site code/assets are proprietary; we do not copy them. We replicate the public
UX *patterns* (single solvable per screen, bottom feedback/continue bar, single-column
options, no scroll, clear step progress) already documented in `prd.md`. Colors differ.
