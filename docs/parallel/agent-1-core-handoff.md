# Agent 1 — Core Architecture Handoff (run 2026-06-24-ev-lab-15)

Owner: Agent 1 (Core Architecture, Progression, Persistence, Final Integration).
This supersedes the prior 20-problem handoff. The chapter is now the PRD's
**five-lesson / fifteen-problem** model (5×3). Legacy `problem-1..8` storage IDs
are preserved; removed legacy slugs resolve to their successors.

**Phase 1 status:** core migration complete. `tsc -b` ✅, `vitest` ✅ 332 passed,
`oxlint` ✅ (pre-existing warnings only). **No UI / problem-component / registry
wiring changed yet** — the 7 not-yet-built problems still render the placeholder
until their components land and Agent 1 wires them in integration.

---

## 1. Canonical 15-problem model — `src/core/progression/canonical.ts`

`TOTAL_PROBLEMS = 15`, `TOTAL_LESSONS = 5`, `PROBLEMS_PER_LESSON = 3`.
`globalProblemIndex` 0..14.

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

New `CanonicalProblem.legacyProblemId` field added. `resolveCanonicalProblem(id)`
now resolves storageId, canonicalSlug, legacyProblemId, AND removed slugs.

### Removed-slug successors — `REMOVED_SLUG_SUCCESSORS`
l1-short-run-vs-long-run→ev-l1-p2 · l2-fill-missing-formula→ev-l2-p3 ·
l3-repair-probability-table→ev-l3-p3 · l4-find-fair-price→ev-l4-p3 ·
l5-low-risk-vs-high-risk→ev-l5-p3. Completion of a removed slug counts as the
successor (same globalProblemIndex), so old progress is never lost or
double-counted.

## 2. Progression / persistence / mastery (signatures unchanged, now 15)
- Selectors (`src/core/progression/selectors.ts`) operate on 15; chapter % ÷15,
  lesson % ÷3, sequential index 0..14. `src/data/chapter.ts` facade unchanged API.
- Mastery (`src/core/mastery/mastery.ts`): `STRONG_ATTEMPT_THRESHOLD = 11`;
  `MASTERY_REQUIRED_SLUGS = { capstone: 'ev-l5-p3', payoutVsProfit: 'ev-l4-p1',
  sameEvDifferentRisk: 'ev-l5-p2' }` (the old `fullModel` requirement was removed).
- Migration (`src/core/persistence/migration.ts`) unchanged logic — count-agnostic,
  reads canonical. Legacy 8-problem docs and removed slugs upgrade safely.
- Milestones (`src/lib/milestonesService.ts`): half-chapter = `ceil(15/2)=8`;
  `SIMULATION_SLUGS = ['ev-l1-p1','ev-l1-p2','ev-l1-p3']` (L1); chapter-complete at 15.
- `src/data/chapter.ts` subtitle/description/milestone copy updated to 15.

## 3. What Phase 2 agents must rely on (no re-deriving)
- Problem components key off **storage IDs** in the table above.
- The learning shell, persistence services, demo/review/restart, and progression
  selectors are stable — consume them, do not fork.
- `ProblemDefinition.problemId` MUST equal the storage ID. Add optional
  `canonicalSlug`, `legacyProblemId`, `desktopWorkspaceLayout`,
  `mobileWorkspaceLayout` to defs where useful.

## 4. Owned by Agent 1 — DO NOT EDIT in Phase 2 (integration wires these)
- `src/core/**` (all), `src/data/chapter.ts`, `src/data/implementedProblems.ts`,
  `src/data/problems/index.ts`, `src/pages/ProblemPage.tsx`, the
  `ProblemCheckInput` union in `src/types/problem.ts`, `src/lib/masteryService.ts`,
  `src/lib/milestonesService.ts`, `firestore.rules`.
- Problem agents create component + definition files and **list their exports +
  any new CheckInput interface in their handoff**; Agent 1 registers them.

## 5. Dead code noted (not wired, not in live render path)
- `src/features/expected-value/problem-pack-a/**` and `problem-pack-b/**` are the
  prior-build pack modules. They are NOT imported by the live app and still encode
  the old 20-problem design (incl. removed slugs). Leave them untouched this run;
  flagged for later removal in the PRD-difference report.

## 6. Integration checklist (Agent 1, Phase 3)
1. Register all 15 defs in `src/data/problems/index.ts`; set `IMPLEMENTED_PROBLEM_IDS`
   to the 15 storage IDs; map 15 components in `ProblemPage`.
2. Reconcile `ProblemCheckInput` union with new per-problem inputs.
3. Full `tsc`/`vitest`/`build`/`lint`; PRD manual scenario; integration report.
