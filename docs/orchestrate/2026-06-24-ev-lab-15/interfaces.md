# Shared interfaces — 2026-06-24-ev-lab-15

These contracts are produced by Agent 1 in Phase 1. Phase 2 agents build against
them WITHOUT reading each other's code. Updated if contracts change.

## 1. Canonical 15-problem model (`src/core/progression/canonical.ts`)

`TOTAL_PROBLEMS = 15`, `TOTAL_LESSONS = 5`, `PROBLEMS_PER_LESSON = 3`.
`globalProblemIndex` 0..14. Ordering:

| gIdx | canonicalSlug | storageId | lesson | legacyProblemId |
|---|---|---|---|---|
| 0 | ev-l1-p1 | problem-1 | lesson-1 | l1-long-run-average |
| 1 | ev-l1-p2 | ev-l1-p2 | lesson-1 | l1-unequal-spinner |
| 2 | ev-l1-p3 | ev-l1-p3 | lesson-1 | l1-compare-spinners |
| 3 | ev-l2-p1 | problem-2 | lesson-2 | l2-build-weighted-average |
| 4 | ev-l2-p2 | ev-l2-p2 | lesson-2 | l2-match-outcomes-probabilities |
| 5 | ev-l2-p3 | ev-l2-p3 | lesson-2 | l2-diagnose-bad-ev-setups |
| 6 | ev-l3-p1 | problem-3 | lesson-3 | l3-mystery-box-outcomes |
| 7 | ev-l3-p2 | problem-4 | lesson-3 | l3-calculate-ev-from-table |
| 8 | ev-l3-p3 | ev-l3-p3 | lesson-3 | l3-prize-bag-ev-table |
| 9 | ev-l4-p1 | problem-5 | lesson-4 | l4-payout-vs-profit |
| 10 | ev-l4-p2 | problem-6 | lesson-4 | l4-fair-favorable-unfavorable |
| 11 | ev-l4-p3 | ev-l4-p3 | lesson-4 | l4-choose-better-game-after-cost |
| 12 | ev-l5-p1 | problem-7 | lesson-5 | l5-build-whole-ev-model |
| 13 | ev-l5-p2 | problem-8 | lesson-5 | l5-same-ev-different-risk |
| 14 | ev-l5-p3 | ev-l5-p3 | lesson-5 | l5-final-capstone-ev-decision |

Rules: original eight keep `problem-N` storageId. New problems: storageId == canonicalSlug.
`completedProblemIds` persisted as STORAGE IDs. Selectors normalize slug↔storageId.
`legacyProblemId` resolves old slugs (incl. removed) for read compatibility.

### Removed-slug successors (resolve as complete-successor on read)
l1-short-run-vs-long-run→ev-l1-p2 · l2-fill-missing-formula→ev-l2-p3 ·
l3-repair-probability-table→ev-l3-p3 · l4-find-fair-price→ev-l4-p3 ·
l5-low-risk-vs-high-risk→ev-l5-p3

## 2. Progression selectors (`src/core/progression`, re-exported by `src/data/chapter.ts`)
Unchanged signatures; now operate on 15. `getChapterCompletionPercentage(ids)` ÷15.
`getLessonCompletionPercentage` ÷3. `getContinueProblemId(progress)` → first incomplete of 15.
`getLessonProgressViews(ids, continueId, allComplete)` → pathway view (3 holes/zone).

## 3. Problem definition contract (`src/types/problem.ts`)
Each problem module exports `ProblemDefinition` keyed by its **storage ID**.
Add optional `canonicalSlug?: string`, `legacyProblemId?: string`,
`desktopWorkspaceLayout?: string`, `mobileWorkspaceLayout?: string` to `ProblemDefinition`.
Deterministic checkers return `CheckResult { isCorrect, mistakeType, feedback, canComplete }`.
Graded final step uses `stepId === 'final'` (mastery depends on it).
Per-problem `CheckInput` types live here; **Agent 1 owns the `ProblemCheckInput` union** —
problem agents add their new input interface and tell Agent 1 in the handoff.

## 4. Registry & routing (Agent 1 owns)
- `src/data/problems/index.ts` `ALL_PROBLEMS` registers all 15 defs; `getProblemDefinition(storageId)`.
- `src/data/implementedProblems.ts` `IMPLEMENTED_PROBLEM_IDS` = the 15 storage IDs.
- `src/pages/ProblemPage.tsx` `PROBLEM_COMPONENTS` maps 15 storage IDs → components.
- Problem agents create component + definition files; **do NOT edit index/ProblemPage/implemented** — list exports in handoff; Agent 1 wires them at integration.

## 5. Learning shell (Agent 2 owns) — consumed by problem components
Problem components render inside the shell and receive callbacks/props. Reuse:
`ProblemLayout` (two-region, no-scroll), `LearningCoachPanel` (feedback beneath check),
`CurrentTaskPanel`, `ProblemStepChecklist`, `ProblemIntroDemo`, `ReviewModeBanner`,
`RestartProblemAction`, `ShowDemoAgainAction`, `InlineFieldStatus`, animations helpers,
`useProblemSession`. Problem agents must NOT fork shell logic; consume it.

## 6. Reduced motion + tap-to-place + seeded RNG
- Reduced motion via `prefers-reduced-motion` (helper in `src/features/learning-experience/animations.ts`, Agent 2). Reduced path must yield identical deterministic outcomes.
- Every drag has tap-to-select + tap-to-place equivalent producing identical results.
- Seeded RNG simulation helper: `src/lib/simulation.ts` (Agent 5) — pure, deterministic per session seed; shared by L1/L5 sims.

## 7. Determinism / no-AI guardrail
All checking hand-built and deterministic. No model calls, semantic matching, or AI hints anywhere.
