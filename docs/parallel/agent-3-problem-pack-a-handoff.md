# Agent 3 — Expected Value Problem Pack A Handoff

Owner: Agent 3 (Problems 1–10, canonical chapter order — Lessons 1–3).
Module: `src/features/expected-value/problem-pack-a/`
Status: Implemented, unit-tested in isolation. Awaiting central wiring by Agent 1.

This pack is self-contained. Nothing in the central registry, routing, shared
services, shells, or Agent 4 files was modified. The pack reuses only the stable
normalization helpers in `src/lib/answerParser.ts` (read-only) and the shared
`CheckResult` type from `src/types/problem.ts`.

---

## 1. Exported symbols (public contract)

From `src/features/expected-value/problem-pack-a/index.ts`:

Required (exact):

- `problemPackA` — `PackProblem[]`, 10 definitions in canonical order.
- `problemPackAManifest` — `PackManifestEntry[]`, wiring metadata per problem.
- `problemPackACheckers` — `Record<CanonicalSlug, checker>`, deterministic.
- `problemPackADemoConfigs` — `Record<CanonicalSlug, DemoConfig>`.
- `problemPackAValidationCases` — `ValidationCase[]`, replayable through checkers.

Additional (pack-local, optional for wiring):

- `problemPackACheckersByStorageId` — same checkers keyed by persisted id.
- `problemPackACurrentTaskConfigs` — current-task panels per problem.
- `initialStateFactories` — restart-compatible initial-state factories.
- `reviewSerializers` — compact review-snapshot serializers.
- `legacyIdToCanonicalSlug`, `canonicalSlugToStorageId`, `getManifestEntry`.
- Simulation helpers: `createSeededRandom`, `simulateSpins`,
  `simulateFromOutcomes`, `extendSimulation`, `sampleSegment`, `compactSeries`,
  `SPINNER_5050`, `SPINNER_2575`.
- Individual checker fns + `isPackGradedAttempt`.
- All pack types (see `types.ts`).

---

## 2. Original storage ID → canonical slug mapping (IDs preserved)

Persisted problem IDs are NOT renamed. Each original carries `legacyProblemId`
and `canonicalSlug` metadata locally.

| Storage ID (persisted) | Canonical slug              | Lesson |
| ---------------------- | --------------------------- | ------ |
| `problem-1`            | `l1-long-run-average`       | 1      |
| `problem-2`            | `l2-build-weighted-average` | 2      |
| `problem-3`            | `l3-mystery-box-outcomes`   | 3      |
| `problem-4`            | `l3-calculate-ev-from-table`| 3      |

`completedProblemIds` containing `problem-1..4` continue to resolve unchanged.

## 3. New problem IDs (storage id === canonical slug)

| Storage ID / slug                  | Lesson | Within-lesson index |
| ---------------------------------- | ------ | ------------------- |
| `l1-unequal-spinner`               | 1      | 1                   |
| `l1-short-run-vs-long-run`         | 1      | 2                   |
| `l1-compare-spinners`              | 1      | 3                   |
| `l2-match-outcomes-probabilities`  | 2      | 1                   |
| `l2-fill-missing-formula`          | 2      | 2                   |
| `l2-diagnose-bad-ev-setups`        | 2      | 3                   |

---

## 4. Checker map (canonical slug → checker fn)

All checkers are pure `(input) => CheckResult`. A `CheckResult` with
`mistakeType === ''` (empty) is a non-graded guard (learner not finished); a
non-empty `mistakeType` is a graded wrong attempt; `canComplete === true`
completes. Use `isPackGradedAttempt(result)` (mirrors the shared policy).

| Canonical slug                     | Checker                      | Input type                  |
| ---------------------------------- | ---------------------------- | --------------------------- |
| `l1-long-run-average`              | `checkLongRunAverage`        | `LongRunAverageInput`       |
| `l1-unequal-spinner`               | `checkUnequalSpinner`        | `UnequalSpinnerInput`       |
| `l1-short-run-vs-long-run`         | `checkShortRunVsLongRun`     | `ShortRunVsLongRunInput`    |
| `l1-compare-spinners`              | `checkCompareSpinners`       | `CompareSpinnersInput`      |
| `l2-build-weighted-average`        | `checkBuildWeightedAverage`  | `BuildWeightedAverageInput` |
| `l2-match-outcomes-probabilities`  | `checkMatchOutcomes`         | `MatchOutcomesInput`        |
| `l2-fill-missing-formula`          | `checkFillMissingFormula`    | `FillMissingFormulaInput`   |
| `l2-diagnose-bad-ev-setups`        | `checkDiagnoseBadSetups`     | `DiagnoseBadSetupsInput`    |
| `l3-mystery-box-outcomes`          | `checkMysteryBoxOutcomes`    | `MysteryBoxInput`           |
| `l3-calculate-ev-from-table`       | `checkCalculateEvFromTable`  | `CalculateEvFromTableInput` |

Detected mistake types by problem:

- `l1-long-run-average`: chose-extreme-outcome, selected-largest-payout, assumed-sample-equals-ev.
- `l1-unequal-spinner`: selected-largest-payout, ignored-probability, misapplied-probability.
- `l1-short-run-vs-long-run`: small-sample-misconception, selected-short-run-graph.
- `l1-compare-spinners`: maximum-payout-misconception, win-frequency-misconception.
- `l2-build-weighted-average`: reversed-outcome-probability, wrong-pairing, omitted-probability, used-largest-payout, arithmetic-error.
- `l2-match-outcomes-probabilities`: ranked-by-size, reused-probability-card, omitted-zero-outcome, wrong-pairing.
- `l2-fill-missing-formula`: slot-type-error, unweighted-sum, arithmetic-error.
- `l2-diagnose-bad-ev-setups`: summed-raw-payouts, chose-incomplete-setup, wrong-diagnosis.
- `l3-mystery-box-outcomes`: counts-as-probabilities, wrong-denominator, entered-total-as-count, wrong-count, probabilities-not-one, omitted-zero.
- `l3-calculate-ev-from-table`: unweighted-sum, omitted-zero-row, added-probabilities, arithmetic-error.

---

## 5. Demo config map

`problemPackADemoConfigs[slug]` → `DemoConfig` with 4 steps + closing prompt and
`countsAsAttempt: false`. Current-task panels: `problemPackACurrentTaskConfigs[slug]`.
The demo renderer must treat demos as non-attempt/non-hint/non-completing.

## 6. Validation-case map

`problemPackAValidationCases` is a flat `ValidationCase[]`; filter by
`getValidationCasesForSlug(slug)`. Each case has `{ input, expect: { canComplete,
mistakeType, graded } }` and is replayed in
`__tests__/validationCases.test.ts`. All ten slugs are covered.

---

## 7. Initial state & review serializer notes

- `initialStateFactories[slug]()` returns a FRESH object every call → safe for
  "Restart This Problem" (no shared mutable references; arrays are new). The
  returned shape doubles as the persisted session-state shape.
- `reviewSerializers[slug](state)` returns `{ slug, summary }`, a compact
  snapshot for Review Mode. Simulation problems store a down-sampled graph
  (`compactSeries`, ≤ 50 points) plus the observed average and final answer —
  raw per-spin events are intentionally not stored.
- Completion never depends on a random sample landing on EV; simulation problems
  only require the minimum spin count (≥100, or ≥10/≥500 for short-vs-long) plus
  the correct conceptual answer.

## 8. Seeded simulation helper notes

`simulation.ts` provides a deterministic, injectable random source:

- `createSeededRandom(seed)` → mulberry32 `RandomSource` (reproducible).
- `simulateSpins(segments, count, source)` and `extendSimulation(...)` for
  production (pass a real source) and tests (pass a seed).
- `simulateFromOutcomes(outcomes)` to inject a fixed trial sequence in tests.
- Production code may pass `Math.random` as the source.

This helper is currently pack-local. See "Future consolidation" below.

---

## 9. Required future consolidation

- **Seeded RNG**: no shared injectable RNG existed. `simulation.ts` is
  pack-local; Agent 1 may promote it to a shared `src/lib/` module so other
  simulation problems (e.g. Lesson 5 risk problems) reuse it.
- **`ProblemDefinition` extension**: the shared `ProblemDefinition`
  (`src/types/problem.ts`) lacks `canonicalSlug`, `legacyProblemId`, lesson
  indices, `demoConfig`, `currentTaskConfig`, `animations`, `placement`,
  `visualGroups`, `fieldValidation`. The pack models these in `PackProblem`.
  When Agent 1 unifies the schema, fold these fields in (or adapt `PackProblem`
  → `ProblemDefinition` at the registry boundary).
- **Checker registry shape**: shared `checkProblem(problemId, input)` switches on
  `problem-1..8`. New problems use slug storage ids. Agent 1 should extend the
  dispatch using `problemPackACheckersByStorageId`.

---

## 10. Exact Agent 1 integration instructions

1. Import the pack barrel:
   ```ts
   import {
     problemPackA,
     problemPackAManifest,
     problemPackACheckers,
     problemPackACheckersByStorageId,
     problemPackADemoConfigs,
     problemPackACurrentTaskConfigs,
     initialStateFactories,
     reviewSerializers,
   } from '../features/expected-value/problem-pack-a'
   ```
2. **Registry**: merge `problemPackA` into the central problem list. Adapt
   `PackProblem` → `ProblemDefinition` (the pack superset includes everything
   `ProblemDefinition` needs plus extra metadata). Key by `storageId`.
3. **Lessons**: drive lesson structure from the manifest
   (`lessonId`, `lessonIndex`, `problemIndexWithinLesson`, `globalProblemIndex`).
   Lesson 1 = problems 1–4, Lesson 2 = 5–8, Lesson 3 (first two) = 9–10.
4. **Checkers**: dispatch with `problemPackACheckersByStorageId[storageId](input)`.
   Treat empty-string `mistakeType` as a non-graded guard (same as the existing
   `isGradedAttempt` policy; `isPackGradedAttempt` is provided).
5. **Demos / task panels**: feed `problemPackADemoConfigs[slug]` and
   `problemPackACurrentTaskConfigs[slug]` to the generic demo + task components.
   Demos must not count as attempts.
6. **Session/review/restart**: use `initialStateFactories[slug]()` for fresh and
   restarted sessions, and `reviewSerializers[slug](state)` to build the Review
   Mode snapshot (`reviewSnapshot`).
7. **IDs**: do not rename `problem-1..4`. Use `legacyIdToCanonicalSlug` /
   `canonicalSlugToStorageId` for any slug↔id translation.
8. **Build blocker (not mine)**: a parallel change to
   `src/lib/chapterProgressService.ts` imports `CHAPTER_ID` without using it,
   which fails `tsc -b` (`TS6133`). Remove that unused import so the full build
   passes. The pack itself compiles cleanly. Likewise, the pre-existing failures
   in `src/data/chapter.test.ts` and `src/data/chapterProgression.test.ts` come
   from the in-flight 8→20 chapter migration in `src/data/chapter.ts` (also not
   owned by Agent 3).

---

## 11. Verification results (Agent 3 scope)

- Pack unit tests: **90/90 pass** (`npx vitest run src/features/expected-value/problem-pack-a`).
- Lint: clean for all pack files (`npm run lint`; only pre-existing warnings elsewhere).
- Types: pack compiles with **zero** errors under `tsc -b`; the only build error
  is the foreign `chapterProgressService.ts` unused import (see §10.8).
