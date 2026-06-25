# Agent 6 — Validation, Accessibility & QA Handoff

Run: `2026-06-24-ev-lab-15` · Independent QA pass (post-integration, green gate).
Source of truth: `prd.md` (not edited). All work confined to `src/validation/**`,
`docs/validation-plan.md`, and this file. No app source modified. No commit.

## TL;DR

- Built an **executable** QA layer that imports the **15 real, co-located
  checkers** and verifies each problem's PRD correct answer + a representative
  mistake type + completion gates. This replaces the old spec-mirror.
- **Tests run:** `npx vitest run src/validation` → **2 files, 150 tests, all
  pass**. Full suite `npx vitest run` → **30 files, 572 tests pass** (was 422;
  +150 from this pass). `npx oxlint src/validation` clean. `npx tsc --noEmit -p
  tsconfig.app.json` clean.
- **Independently confirmed** Agent 1's prd-difference-report claims (15 problems,
  3/lesson, legacy IDs preserved, removed-slug migration, mastery 11/15, the five
  P1 gates, L5P1≠L5P2). No functional disagreement found between any live checker
  and the PRD.
- **One precise low-severity discrepancy** (PRD accepted-format string vs live
  option keys for L5P2 reason) and Agent 1's known dead-code risks reconfirmed —
  details below.

## Files touched

Created:
- `src/validation/liveCheckers.ts` — `runLiveChecker(storageId, input)` dispatch to all 15 live checkers (the ones the components actually call).
- `src/validation/liveCheckerValidation.test.ts` — executable per-problem PRD verification + the five P1 gates + L5P1/L5P2 cohesion + direct-correction.
- `src/validation/prdCoverage.test.ts` — structure / migration / mastery assertions against the live core model.

Rewritten (15-problem scale, repointed to live checkers):
- `src/validation/answerValidationMatrix.ts` — normalizer cases + `liveCheckerCases` (correct/mistake/guard for all 15) + `problemSpecs` summary.
- `src/validation/problemBehaviorValidation.ts` — per-problem completion rules, gates, live mistake types; global behaviors; `isGradedAttempt` fixtures (now covers BOTH guard conventions: `''` and `null`).
- `src/validation/prdValidationChecklist.ts` — 15-scale items, new categories (`structure`, `migration`, `gates`, `layout`, `accessibility`); `pass` for automated items, `not_run` for manual; `checklistSummary()`.
- `src/validation/runValidation.ts` — runs the live-checker cases via `runLiveChecker`.
- `docs/validation-plan.md` — 15-problem matrix + checker→ID map + concrete a11y / tap-to-place / reduced-motion / no-scroll manual audit at 1280×720 **and** mobile 390×844.

## What is now AUTOMATED (executes the real checkers)

Per the 15 problems (`liveCheckerValidation.test.ts`, `prdCoverage.test.ts`):

- **Accepted answer formats** — money / probability / classification via the shared parser (`5`, `$5`, `5 dollars`, `5 per throw`, `1/6`, `0.1667`, `50%`, `1/4`, `2/3`, `fair`/`fav`, …).
- **Every PRD mistake type** — asserted against the live checker output (exact `mistakeType` string), e.g. `chose-extreme-outcome`, `divided-payout-by-percent`, `reversed-outcome-probability`, `ranked-by-size`, `counts-as-probabilities`, `used-total-token-payout`, `answered-payout`, `cost-as-probability`, `chose-larger-payout`, `claimed-same-feel`, `claimed-game-b-has-higher-ev`, `fair-marked-favorable`, `believed-fair-has-no-risk`, etc.
- **Completion correctness** — every PRD correct answer returns `canComplete=true`.
- **The five P1 gates + capstone gate** (all non-graded guards): ≥5 manual throws (L1P1), board-before-formula (L2P1), all-boxes-open (L3P1), cost-before-profit (L4P1), both-preview (L5P1), group-wheel (L5P3).
- **Attempt counting** — guards do NOT count (`isGradedAttempt=false`), graded wrong/correct DO. Both guard conventions (`mistakeType: ''` and `mistakeType: null`) handled.
- **Direct correction** — wrong→corrected resubmit passes with no reset (pure checkers).
- **L5P2 ≠ L5P1 cohesion** — `checkWiderSpread` rejects the L5P1 booth average (`$5` → `ev-arithmetic-error`) and accepts the distinct `$6` numbers.
- **Structure** — 15 problems, 3/lesson, `globalProblemIndex` 0..14, `ALL_PROBLEMS` length 15, every `IMPLEMENTED_PROBLEM_ID` has a definition.
- **Migration** — legacy `problem-1..8` resolve to expected slugs; all five removed slugs resolve to their successors; a removed slug counts as 1 completed.
- **Progress** — chapter % ÷15, lesson % ÷3 (e.g. 3/15→20%, 1/3→33%).
- **Mastery** — `STRONG_ATTEMPT_THRESHOLD === 11`; mastery granted only with all 15 + capstone + payout-vs-profit + same-EV-vs-risk + ≥11 strong; status boundaries (Developing at ≥8).

## What remains MANUAL (cannot be asserted deterministically)

Captured as a concrete checklist in `docs/validation-plan.md §4`, to run at
**1280×720** and **mobile 390×844** with keyboard + screen reader:

- **No-scroll-chasing** layout; feedback beside/beneath the active control after a wrong check; in-place correction; capstone one-active-row checklist.
- **Tap-to-place** parity (complete each drag problem by tap only; correctness never depends on drag).
- **Reduced-motion** parity (animated vs reduced outcomes provably identical; seeded).
- **A11y** — focus order, live-region announcements <100ms, graph text summaries, touch targets ≥44/48px, L1P1 keyboard throw path.
- **Auth / persistence / resume / restart**, completion-percentage UI, removed-slug-counts-as-complete end-to-end.

(Seeded reduced-motion determinism is unit-tested inside the feature suites; the
manual item is the visual confirmation.)

## PRD gaps / discrepancies found (independent pass)

1. **[Low — metadata] L5P2 reason accepted-format vs live option keys.** PRD Page 7
   lists the accepted explanation formats as `variable outcomes | wider spread |
   can be 0 or 12 | same EV different risk`. The live checker `checkWiderSpread`
   accepts reason keys `{wider-spread, variable-outcomes, can-be-0-or-12}` and the
   component (`Problem8SameEVDifferentRisk.tsx`) offers exactly those three correct
   options (+ two distractors). So **"same EV different risk" is not a selectable /
   accepted option** in the live build, and `PROBLEM_8.acceptedFormats.reason`
   (space-separated phrases) does not match the actual hyphenated option keys.
   No learner-facing failure (all offered correct options pass); recommend Agent 1
   either drop the unreachable "same EV different risk" phrase from the PRD's
   accepted list or align `PROBLEM_8.acceptedFormats.reason` to the real keys.

2. **[Low — dead code, reconfirms Agent 1 risk #1/#3] Stale `checkProblem`
   dispatcher.** `src/lib/answerChecker.ts` still exports
   `checkProblem1Completion/checkProblem2/checkProblem5/checkProblem7/checkProblem8`
   and the `checkProblem` switch, which encode **PRE-15 semantics** (spinner
   $10/$0, whole-EV 10-section wheel, same-EV $5 vs $10/$0). The live components do
   **not** call these — they use `checkProblem1Dice`, `checkProblem2PrizeBoard`,
   `checkEvL4P1`, `checkBoothPreview`, `checkWiderSpread`. `answerChecker.test.ts`
   still asserts the old wheel/$5 logic (passes, but validates dead code).
   `checkProblem3/4/6` ARE live and correct. Independent confirmation of Agent 1's
   risks #1 and #3. Recommend deletion of the dead checkers + their tests + the
   `Problem1/2/5/7/8CheckInput` shapes in `types/problem.ts` (Agent 1 risk #2).
   My validation layer deliberately bypasses this switch and wires each storage ID
   to the checker its component actually uses (see `liveCheckers.ts`).

3. **[Informational] Two guard conventions across checkers.** Newer checkers
   (`checkBoothPreview`, `checkWiderSpread`, `checkFinalDecision`, `checkEvL1P3`)
   return guards with `mistakeType: null`; older ones (`checkProblem1Dice`,
   `checkProblem2PrizeBoard`, `checkEvL3P3`, `checkEvL4P1`, `checkProblem3/4/6`)
   use `mistakeType: ''`. `isGradedAttempt` treats both as non-graded, so behavior
   is correct, but the inconsistency is a latent footgun for any future code that
   special-cases `mistakeType === ''`. Cosmetic; optional to normalize.

**No correctness discrepancy** was found: for all 15 problems the live checker's
correct-answer and mistake-classification behavior matches the PRD's
"Validation cases" and "Mistake types".

## Comparison with Agent 1's `prd-difference-report.md`

- **Agreements (independently verified, not just trusted):** 15 problems / 3 per
  lesson / 0..14; legacy IDs preserved; removed-slug successors resolve; mastery
  11/15 + required slugs; all five P1 gates present and non-graded; L5P2 uses
  $6/$12/$0 with a cohesion guard rejecting L5P1's $5/$10. All confirmed by passing
  deterministic tests.
- **No disagreements** with the report's "Complete" and "Missing: None" claims at
  the checker level.
- **Refinement to the report's Risks:** risk #1 (dead `checkProblem*`) and #3
  (stale `answerChecker.test.ts`) are confirmed; I add the **L5P2 reason accepted-
  format mismatch (finding #1 above)**, which the report did not call out.

## Recommended final Agent 1 actions

1. Delete dead `checkProblem1Completion/2/5/7/8` + `checkProblem` switch in
   `lib/answerChecker.ts`, the matching `answerChecker.test.ts` cases, and the
   unused `Problem1/2/5/7/8CheckInput` shapes from `types/problem.ts` (keep
   `checkProblem3/4/6`, which are live). This removes the only PRD-divergent code
   paths in the repo.
2. Reconcile L5P2's accepted-format docs: drop "same EV different risk" from the
   PRD accepted list **or** add it as an accepted option key / synonym, and fix
   `PROBLEM_8.acceptedFormats.reason` to the real hyphenated keys.
3. Optionally normalize the guard `mistakeType` convention (`''` vs `null`) across
   checkers for consistency.
4. Address the pre-existing bundle-size advisory (report risk #4) and the retained
   unused files (risk #5) at cleanup time — neither affects validation.

## How to re-run

```bash
npx vitest run src/validation     # 150 tests
npx oxlint src/validation         # clean
npx tsc --noEmit -p tsconfig.app.json
# programmatic report:
#   import { runAllValidations, formatValidationReport } from 'src/validation/runValidation'
```
