# Final Integration Report — Expected Value Lab (run 2026-06-24-ev-lab-15)

Orchestrator/Integrator: Agent 1. PRD: `prd.md` (binding, not edited this run).
Phase 3 (integration) complete and green.

## 1. What was integrated

All five Phase-2 worker handoffs were merged into the live app via Agent-1-owned
shared files only. No worker-owned file was modified during integration.

### Shared files wired (Agent 1)
- **`src/types/problem.ts`** — added optional `canonicalSlug?`, `legacyProblemId?`,
  `desktopWorkspaceLayout?`, `mobileWorkspaceLayout?` to `ProblemDefinition`. This
  folds in the local `CanonicalDefinition`/`CanonicalProblemDefinition` widenings
  the workers used; all 15 defs remain assignable. The `ProblemCheckInput` union
  was left as-is (see §4 — live render uses co-located checkers, not the union).
- **`src/data/problems/index.ts`** — `ALL_PROBLEMS` now lists all 15 defs in
  canonical chapter order (globalProblemIndex 0..14): the 8 preserved legacy
  storage IDs (`problem-1..8`) interleaved with the 7 new slugs.
- **`src/data/implementedProblems.ts`** — `IMPLEMENTED_PROBLEM_IDS` → all 15
  storage IDs (was 8).
- **`src/pages/ProblemPage.tsx`** — `PROBLEM_COMPONENTS` maps all 15 storage IDs
  to their components; the route now resolves a canonical slug **or** a storage ID
  to the registry key via `normalizeToStorageId`, so any historical URL still
  loads the correct interactive component instead of the placeholder.

### Registry (storage ID → component → definition → checker)
| # | Canonical | storageId | Component | Definition | Live checker |
|---|---|---|---|---|---|
| 1 | ev-l1-p1 | problem-1 | Problem1LongRunAverage | PROBLEM_1 | checkProblem1Dice |
| 2 | ev-l1-p2 | ev-l1-p2 | EvL1P2UnequalSpinner | PROBLEM_EV_L1_P2 | checkEvL1P2 |
| 3 | ev-l1-p3 | ev-l1-p3 | EvL1P3CompareGames | PROBLEM_EV_L1_P3 | checkEvL1P3 |
| 4 | ev-l2-p1 | problem-2 | Problem2WeightedAverage | PROBLEM_2 | checkProblem2PrizeBoard |
| 5 | ev-l2-p2 | ev-l2-p2 | EvL2P2MatchOutcomes | PROBLEM_EV_L2_P2 | checkEvL2P2 |
| 6 | ev-l2-p3 | ev-l2-p3 | EvL2P3DiagnoseSetups | PROBLEM_EV_L2_P3 | checkEvL2P3 |
| 7 | ev-l3-p1 | problem-3 | Problem3MysteryBoxes | PROBLEM_3 | checkProblem3 |
| 8 | ev-l3-p2 | problem-4 | Problem4CalculateEV | PROBLEM_4 | checkProblem4 |
| 9 | ev-l3-p3 | ev-l3-p3 | EvL3P3PrizeBagTable | EV_L3_P3 | checkEvL3P3 |
| 10 | ev-l4-p1 | problem-5 | Problem5PayoutVsProfit | PROBLEM_5 | checkEvL4P1 |
| 11 | ev-l4-p2 | problem-6 | Problem6FairnessSort | PROBLEM_6 | checkProblem6 |
| 12 | ev-l4-p3 | ev-l4-p3 | EvL4P3BetterGame | EV_L4_P3 | checkEvL4P3 |
| 13 | ev-l5-p1 | problem-7 | Problem7WholeEVModel | PROBLEM_7 | checkBoothPreview |
| 14 | ev-l5-p2 | problem-8 | Problem8SameEVDifferentRisk | PROBLEM_8 | checkWiderSpread |
| 15 | ev-l5-p3 | ev-l5-p3 | EvL5P3FinalDecision | EV_L5_P3 | checkFinalDecision |

## 2. Integration gate (all green, post-merge)
| Check | Command | Result |
|---|---|---|
| Typecheck | `npx tsc -b` | ✅ exit 0 |
| Unit/integration tests | `npx vitest run` | ✅ 422 passed / 28 files |
| Answer validation | `npm run validate:answers` | ✅ 422 passed |
| Production build | `npx vite build` | ✅ built (chunk-size advisory only) |
| Lint | `npx oxlint src` | ✅ exit 0 (pre-existing `only-export-components` fast-refresh warnings only) |

Baselines: pre-build 330/22 → post-Phase-1 332/22 → post-integration **422/28**.
The growth is the workers' co-located checker test suites; no regressions.

## 3. Constraints honored
- **Legacy IDs preserved** — `problem-1..8` remain the storage IDs for the first
  two problems of each lesson; `canonical.ts` resolves legacy slugs and
  `REMOVED_SLUG_SUCCESSORS` so no user progress is orphaned.
- **No progress erasure / no silent rename** — migration layer untouched; URLs
  resolve old slugs to current storage IDs.
- **Deterministic, no-AI checking** — every live checker is a pure function;
  seeded RNG (`src/lib/simulation.ts` + per-file hashes) makes reduced-motion and
  animated renders produce identical outcomes.
- **Auth / Firebase / routing / persistence** — unchanged.
- **Review/restart + mobile tap alternatives + no-scroll-chasing** — delivered via
  the shared shell (Agent 2) and per-problem tap-to-place paths (Agents 3–5).

## 4. Cleanup completed (post-QA, user-approved)
1. **Dead checkers removed** from `src/lib/answerChecker.ts`:
   `checkProblem1Completion`, `checkProblem1Prediction`, `checkProblem2`,
   `checkProblem5`, `checkProblem7`, `checkProblem8`, the `reasonIsCorrect` helper,
   and the legacy `checkProblem(problemId, input)` dispatcher. Kept the live
   `checkProblem3/4/6` and `isGradedAttempt`. Stale `answerChecker.test.ts` cases
   for problems 1/2/5/7/8 removed (kept 3/4/6 + attempt-counting).
2. **Orphaned types removed** from `src/types/problem.ts`: `Problem1CheckInput`,
   `Problem2CheckInput`, `Problem5CheckInput`, `Problem7CheckInput`,
   `Problem8CheckInput`, `Problem1Choice`, and the now-unused `ProblemCheckInput`
   union. Kept `Problem3/4/6CheckInput` (used by the live checkers + validation).
   The twelve other problems' CheckInput types remain co-located with their files.
3. **L5P2 metadata fix**: removed the stale `'same EV different risk'` phrase from
   `PROBLEM_8.acceptedFormats.reason` so it matches the implemented 3-option MC
   (`prd.md:1541`/`:1550`). Per-`prd.md:1555` 4-option reading not adopted (product
   call: keep 3 options).
4. **Still retained per "don't erase"**: `Problem1SpinnerPlayground.tsx`,
   `BalanceScale.tsx` — compile, not imported by any live problem.

Post-cleanup gate: `tsc -b` ✅ · `vitest` **562 passed / 30 files** ✅ (−10 stale
assertions) · `vite build` ✅ · `oxlint src` ✅ (17 pre-existing fast-refresh
warnings only).

## 5. Validation re-run
Agent 6 (validation/a11y/QA) previously failed with `resource_exhausted` and
produced no partial work. With all feature agents landed and the build green, it
is being re-run against the integrated app to produce the independent QA pass
(deterministic-checker spot checks, reduced-motion = animated invariant,
tap==drag==keyboard parity, no-scroll-chasing layout, 15-of-15 progression/mastery).
