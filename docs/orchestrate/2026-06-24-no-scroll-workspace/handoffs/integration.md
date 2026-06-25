# Integration Handoff — 2026-06-24-no-scroll-workspace

**State:** COMPLETE. Build ✅ · Lint ✅ (0 errors) · Test ✅ 572/572 · Live no-scroll
acceptance ✅ (desktop 1280×720 + mobile 390×844).

## What shipped
A single, no-scroll, Brilliant-like problem workspace across all 15 problems.

- **Foundation (T-001, agent-1-core):** new `WorkspaceSteps.tsx` + `workspace.css`;
  `ProblemLayout` gained an optional `steps` prop. The workspace fills the viewport below the
  app header and never scrolls the page (scoped via `.layout:has(.problem-workspace)`); it
  renders one step panel at a time with a compact header ("Step X of Y"), a flexible content
  region, and a sticky bottom action bar holding the Learning Coach feedback + Previous/Next +
  Hints + Continue. Inactive steps stay mounted (`hidden`) so Previous never loses input.
  Legacy `children` path preserved for safety.
- **Lessons (T-101…T-105, agent-1-l1 … agent-5-l5):** every problem converted from stacked
  `.card` sections to ordered `WorkspaceStepDef[]` panels. Step counts:
  - L1: p1 dice 3 · p2 spinner 3 · p3 compare 2
  - L2: p1 weighted 2 · p2 match 1 · p3 diagnose 3
  - L3: p1 boxes 2 · p2 calc-EV 2 · p3 prize-bag 3 (tall table isolated to its own step)
  - L4: p1 payout/profit playground+2 · p2 fairness sort 1 · p3 better-game 2
  - L5: p1 booth 3 · p2 risk 3 · p3 capstone 6 (one criterion per panel)
  - `Next` gates mirror each problem's existing completion gates (presentation only).

## Verification (Phase 3, full combined tree)
- `npm run build` → success (tsc + vite), no type errors.
- `npm run lint` → exit 0; only pre-existing fast-refresh warnings (none from this run).
- `npm run test` → 30 files, **572 passed** (identical to baseline).
- All 15 problem components reference `WorkspaceStepDef` and pass `steps` to `ProblemLayout`.
- Live browser spot-check (guest mode):
  - Problem 1 desktop 1280×720: scrollHeight == innerHeight == 720, canScroll false.
  - Problem 1 mobile 390×844: scrollHeight==844, scrollWidth==390, no V/H scroll.
  - Problem 5 desktop: no scroll. Next/Previous advance/return with input preserved.
    Feedback appears inline in the bottom Learning Coach panel.

## Scope compliance (no curriculum/math/validation/schema changes)
- `src/data/**`, `src/validation/**`, `src/core/**`, and all `*.checker.ts` were NOT modified
  during this run (mtimes 13:42–14:23, before the 14:50 run start; run edits were 14:56–15:07).
  Those files appear in `git status` only because of pre-existing uncommitted work unrelated
  to this run.
- Full test suite (covers checkers, validation matrix, progression, mastery, migration)
  unchanged at 572 passing → math/validation behavior preserved.

## Notes / follow-ups (non-blocking)
- `Problem5PayoutPlayground` (shared sub-component) keeps its own card/`<h2>` chrome — it is
  the optional balance-scale playground that precedes the official problem; out of Phase 2
  scope. Could be folded into a `ws-visual` step later if desired.
- Bundle is ~1 MB (pre-existing); consider code-splitting later (unrelated to this run).
- Demo intro for Problem 1 still renders as its own 4-step pre-problem flow (already no-scroll).

## Files created/modified by this run
- New: `src/features/learning-experience/WorkspaceSteps.tsx`,
  `src/features/learning-experience/workspace.css`,
  `src/components/problems/l1-workspace.css`, `l4-workspace.css` (per-lesson, as needed).
- Modified: `src/components/lesson/ProblemLayout.tsx`,
  `src/features/learning-experience/index.ts`, all 15 `src/components/problems/*.tsx`,
  plus per-problem CSS owned by the lesson agents.
