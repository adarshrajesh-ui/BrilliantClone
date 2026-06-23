# Agent 4 — Expected Value Problem Pack B Handoff (Problems 11–20)

Owner: Agent 4
Scope: Lesson 3 problems 3–4, all of Lesson 4, all of Lesson 5.
Module: `src/features/expected-value/problem-pack-b/` (fully isolated).
Integration: performed later by Agent 1 using `problemPackBManifest`.

## 1. Required exports (from `problem-pack-b/index.ts`)

| Export | Type | Purpose |
|---|---|---|
| `problemPackB` | `PackProblemDefinition[]` | The 10 problem definitions (Problems 11–20). |
| `problemPackBManifest` | `ProblemPackBManifest` | Storage IDs, indices, checker/visual/demo/state/review keys. |
| `problemPackBCheckers` | `Record<slug, PackChecker>` | Deterministic answer checkers, keyed by canonical slug. |
| `problemPackBDemoConfigs` | `Record<slug, DemoConfig>` | Pre-problem mini-demos. |
| `problemPackBValidationCases` | `PackValidationCase[]` | Deterministic accept/reject validation data. |

Additional helpers exported for integration: `problemPackBInitialStateFactories`,
`problemPackBReviewSerializers`, `serializeReview`, `summarizeSimulation`,
simulation primitives (`createSeededRandom`, `simulateGame`, `expectedValue`,
`variance`, `isSimulationComplete`, pre-built games), and `getPackProblemBySlug` /
`getPackProblemByStorageId`.

## 2. Problem ownership and storage IDs

| PRD # | Canonical slug | Lesson / idx | Storage ID | Status |
|---|---|---|---|---|
| 11 | `l3-repair-probability-table` | L3 / p3 (global 10) | `l3-repair-probability-table` (new) | Created |
| 12 | `l3-prize-bag-ev-table` | L3 / p4 (global 11) | `l3-prize-bag-ev-table` (new) | Created |
| 13 | `l4-payout-vs-profit` | L4 / p1 (global 12) | **`problem-5`** (preserved) | Audited + completed |
| 14 | `l4-fair-favorable-unfavorable` | L4 / p2 (global 13) | **`problem-6`** (preserved) | Audited + completed |
| 15 | `l4-find-fair-price` | L4 / p3 (global 14) | `l4-find-fair-price` (new) | Created |
| 16 | `l4-choose-better-game-after-cost` | L4 / p4 (global 15) | `l4-choose-better-game-after-cost` (new) | Created |
| 17 | `l5-build-whole-ev-model` | L5 / p1 (global 16) | **`problem-7`** (preserved) | Audited + completed |
| 18 | `l5-same-ev-different-risk` | L5 / p2 (global 17) | **`problem-8`** (preserved) | Audited + completed |
| 19 | `l5-low-risk-vs-high-risk` | L5 / p3 (global 18) | `l5-low-risk-vs-high-risk` (new) | Created |
| 20 | `l5-final-capstone-ev-decision` | L5 / p4 (global 19) | `l5-final-capstone-ev-decision` (new) | Created |

`globalProblemIndex` values assume the final 20-problem chapter (4 problems per
lesson). The manifest also carries `prdProblemNumber` (11–20) and bidirectional
`storageIdBySlug` / `slugByStorageId` maps.

## 3. Per-problem summary (data, formats, mistakes)

- **11 l3-repair-probability-table** — 8 tickets ($16×1, $4×3, $0×4). Repairs probs to
  1/8, 3/8, 4/8(=1/2). Detects `wrong-denominator` (e.g. 3/10), `count-as-probability`,
  `ignored-zero-outcome`, `probabilities-not-one`. Blank cell = non-graded guard.
  Probability-sum-meter metadata + initial state ships the errors ($4=3/10, $0 blank).
- **12 l3-prize-bag-ev-table** — 10 tokens. Rows $15(0.2→3), $5(0.3→1.5), $0(0.5→0); EV 4.5.
  Per-field checking; detects `count-not-probability`, `wrong-denominator`,
  `omitted-zero-outcome`, `unweighted-sum` (15+5+0=20), `arithmetic-error`. Accepts
  equivalent fractions/decimals and `$4.50`/`4.5` formatting.
- **13 l4-payout-vs-profit** (problem-5) — payout 4, cost 3, profit 1 = payout − cost.
  Rejects `answered-payout` (4), `added-cost` (7), and **`reversed-subtraction` (−1)**
  (new vs original). Balance/equation animation metadata added.
- **14 l4-fair-favorable-unfavorable** (problem-6) — A fair (0), B favorable (+2),
  C unfavorable (−2). Tap-to-place; deterministic classification synonyms.
  Detects `positive-payout-favorable`, `confused-fair-favorable`,
  `reversed-classification`, `forgot-subtract-cost`. Profit-meter animation metadata.
- **15 l4-find-fair-price** — 50% $8 / 50% $0 → expected payout 4 → fair cost 4 → profit 0 → fair.
  Detects `used-largest-payout`, `cost-below-payout`, `cost-above-payout`,
  `nonzero-fair-profit`, `wrong-expected-payout`. Cost/balance/number-line metadata.
- **16 l4-choose-better-game-after-cost** — A (9−7=2), B (6−3=3); better = B. Detects
  `largest-payout-misconception`, `forgot-subtract-cost`, `added-cost`.
- **17 l5-build-whole-ev-model** (problem-7) — 10-section wheel; probs .1/.2/.7;
  contribs 3/2/0; payout 5; cost 5; profit 0; fair. Probability/contribution/profit/
  decision hint + animation metadata. Review serializer added.
- **18 l5-same-ev-different-risk** (problem-8) — guaranteed $5 vs 50/50 $10/$0; EV 5/5;
  B riskier; variable-outcome reason. Rejects `b-higher-ev`, `identical-games`,
  `average-vs-guaranteed`, and contradictory free-text. Injectable RNG sims added.
- **19 l5-low-risk-vs-high-risk** — guaranteed $6 vs 50/50 $12/$0; EV 6/6; B riskier;
  wider-spread reason. Graph/outcome visual metadata; injectable RNG sims.
- **20 l5-final-capstone-ev-decision** — 12-section wheel; probs 1/12, 3/12(1/4), 8/12(2/3);
  contribs 3/3/0; payout 6; cost 6; profit 0; fair + risk explanation. Accepts the PRD
  rounded decimals (0.0833/0.083, 0.6667/0.667) via a tight 0.005 tolerance. Detects
  `fair-means-no-risk` and `average-not-guaranteed`; rejects contradictory wording
  (e.g. "guaranteed to", "no risk") while accepting valid negations ("not guaranteed").

All conceptual free-text checks are deterministic (`evaluateExplanation`): approved
keyword/id ⇒ correct, contradictory keyword/id ⇒ rejected, otherwise insufficient.
**No AI, no semantic similarity.**

## 4. Audit findings on the four original problems

Core math/checker logic in the existing `answerChecker.ts` (`checkProblem5..8`) was
**PRD-correct and preserved in spirit**. Pack-B re-expresses them (importing the shared
`answerParser`) to add the following PRD-required, additive behavior without editing any
shared file:

- problem-5 → added `reversed-subtraction` (−1) detection + balance/equation animation metadata.
- problem-6 → added `reversed-classification` mistake + profit-meter animation metadata.
- problem-7 → added a completed-problem review serializer.
- problem-8 → added an injectable deterministic RNG for simulation tests + review serializer.

## 5. Files created (all new, owned by Agent 4)

```
src/features/expected-value/problem-pack-b/
  index.ts
  types.ts
  simulation.ts
  checkers.ts
  state.ts
  demoConfigs.ts
  manifest.ts
  validationCases.ts
  problems/index.ts
  problems/l3-repair-probability-table.ts
  problems/l3-prize-bag-ev-table.ts
  problems/l4-payout-vs-profit.ts
  problems/l4-fair-favorable-unfavorable.ts
  problems/l4-find-fair-price.ts
  problems/l4-choose-better-game-after-cost.ts
  problems/l5-build-whole-ev-model.ts
  problems/l5-same-ev-different-risk.ts
  problems/l5-low-risk-vs-high-risk.ts
  problems/l5-final-capstone-ev-decision.ts
  checkers.test.ts
  validationCases.test.ts
  simulation.test.ts
  state.test.ts
docs/parallel/agent-4-problem-pack-b-handoff.md
```

Files edited: **none outside the pack.** No shared/forbidden file was modified by Agent 4.

## 6. Validation results

- `npx vitest run src/features/expected-value/problem-pack-b` → **127/127 pass**.
- `npx oxlint src/features/expected-value/problem-pack-b` → **clean**.
- `npx tsc -b` → pack-b has **zero** type errors (verified: no `problem-pack-b` lines in tsc output).

### Known cross-agent red state (NOT owned by Agent 4, do not fix here)

`npm run build` and the full `vitest run` currently fail, but **only** in files owned by
other agents / central integration:

- `src/features/expected-value/problem-pack-a/__tests__/state.test.ts` (Agent 3) — TS2352.
- `src/lib/problemAttemptService.ts` (forbidden, Firestore/attempt service) — `withDefaultedMode` undefined (TS2304) + unused imports.
- `src/lib/chapterProgressService.ts` (forbidden) — unused `CHAPTER_ID`.
- `src/data/chapter.test.ts` and `src/data/chapterProgression.test.ts` (central, being
  updated by integration) — 8 failures because `src/data/chapter.ts` is mid-migration to
  the 20-problem structure (it already references `l5-low-risk-vs-high-risk`).

These pre-date and are independent of Pack B. Per the parallel rules, Agent 4 did not edit
them. The working tree also shows other agents' in-progress modifications to
`ProblemLayout.tsx`, `TaskGuide.tsx`, `chapter.ts`, `index.css`, `localProgressStore.ts`,
`types/chapter.ts`, `types/problem.ts` — none touched by Agent 4.

## 7. Integration instructions for Agent 1

1. **Register problems**: spread `problemPackB` into the central problem list. Each entry
   already carries `problemId` set to the **storage ID** (`problem-5/6/7/8` for originals,
   canonical slug for new), plus `canonicalSlug`, `legacyProblemId`, and lesson/global indices.
2. **Checker dispatch**: in the central `checkProblem(problemId, input)` switch, route the
   four originals and six new storage IDs to `problemPackBCheckers[slug]` using
   `problemPackBManifest.slugByStorageId`. Pack checkers share the `CheckResult` contract
   and `isGradedAttempt` semantics (guard ⇒ `mistakeType === ''`).
3. **Chapter/lesson map** (`src/data/chapter.ts`): place these into the 20-problem lessons:
   - Lesson 3: `[..., 'l3-repair-probability-table', 'l3-prize-bag-ev-table']` (positions 3–4).
   - Lesson 4: `['problem-5', 'problem-6', 'l4-find-fair-price', 'l4-choose-better-game-after-cost']`.
   - Lesson 5: `['problem-7', 'problem-8', 'l5-low-risk-vs-high-risk', 'l5-final-capstone-ev-decision']`.
   Keep `problem-5/6/7/8` IDs so existing `completedProblemIds` keep resolving.
4. **Demos / task panel**: feed `problemPackBDemoConfigs[slug]` and each problem's
   `currentTaskConfig` into the generic demo + current-task shells.
5. **State + review**: use `problemPackBInitialStateFactories[slug]` for fresh/restart
   sessions and `problemPackBReviewSerializers[slug]` to build the completed review snapshot.
   For Problems 18 & 19, the interactive component should draw randomness from a single
   injected `RandomSource` (default `Math.random`, `createSeededRandom(seed)` in tests) so
   `gameASimulated/gameBSimulated` flip true only after `isSimulationComplete(trials, 20)`.
6. **`ProblemDefinition` type**: the shared type lacks `demoConfig`, `currentTaskConfig`,
   `animations`, `canonicalSlug`, `legacyProblemId`, and lesson indices. `PackProblemDefinition`
   extends it with these. When central, either widen the shared type or read these fields from
   the pack definitions. (Agent 4 did not edit `src/types/problem.ts`.)
7. **Mastery tags surfaced**: `payout-vs-profit`, `fairness-classification`, `fair-price`,
   `compare-after-cost`, `counts-to-probability`, `sample-space`, `ev-from-table`,
   `full-ev-model`, `same-ev-different-risk`, `risk-spread`, `fairness-vs-risk`, `capstone`.
8. **Test wiring**: pack tests run today via `npx vitest run src/features/expected-value/problem-pack-b`
   with the existing `vitest` config — no `package.json` change required.

## 8. Known gaps / notes

- Pack-B provides **visual/animation metadata** (visualType, `animations[]`, demo highlights,
  givenData configs) and reuses the existing shared visual components. No new React visual
  components were added (kept out of the generic `ProblemPage` shell, which is Agent 1's to
  wire). If a bespoke visual is desired, it can be added under a pack-local `components/`
  folder later without touching shared files.
- The `serializeReview` explanation for non-correct final inputs is a placeholder; in practice
  review is only serialized for a completed (correct) submission.
- Full-project build/test green-up depends on the cross-agent items in §6, owned elsewhere.
