# Handoff: agent-5-validation (T-005) — Tests + validation reconcile

Run: `2026-06-24-l5p1-same-average-ride`
Task: T-005 — Reconcile L5P1 tests, validation matrix, and live-checker dispatch to the new `checkSameAverageDifferentRide` checker; run full suite.
Status: ✅ Complete. test + build + lint all green.

## Files changed (all within allowed scope)
1. `src/validation/liveCheckers.ts`
   - Import: `checkBoothPreview` / `BoothPreviewCheckInput` → `checkSameAverageDifferentRide` / `SameAverageRideCheckInput` from `../data/problems/problem-7`.
   - `export type { … }` re-export: `BoothPreviewCheckInput` → `SameAverageRideCheckInput`.
   - `case 'problem-7'` dispatch: `return checkSameAverageDifferentRide(input as SameAverageRideCheckInput)`.
2. `src/validation/answerValidationMatrix.ts`
   - Type import at top: `BoothPreviewCheckInput` → `SameAverageRideCheckInput`.
   - Replaced the 4 old `ev-l5-p1` booth live cases with **8** new cases on the `SameAverageRideCheckInput` shape (see ids below).
   - Updated the `ev-l5-p1` entry in the per-problem PRD spec summary (`problemSpecs`): title `Same Average, Different Ride`, correctAnswer, acceptedFormats `['yes','slot','same-avg-different-spread']`, the 5 new mistakeTypes, and the new gate string.
   - **L5P2 row `l5p2-mistake-l5p1numbers` and all other problems left untouched.**
3. `src/components/problems/lesson5-checkers.test.ts`
   - Rewrote ONLY the `ev-l5-p1` describe block to import/exercise `checkSameAverageDifferentRide`.
   - L5P2 (`checkWiderSpread`) and L5P3 (`checkFinalDecision`) blocks untouched.
4. `src/lib/simulation.test.ts` — **NOT modified.** It only tests generic seeded-RNG determinism and simulation math with arbitrary discrete games / keys (`BOOTH_B` 50/50, `problem-7-boothB-N` keys). It does not import or assert the L5P1 checker or `PROBLEM_7` metadata, so per scope rules it was left alone. All its assertions still hold.

## New matrix case ids (`liveCheckerCases`, storageId `problem-7`)
- `l5p1-correct` — kind `correct` — `{ printerTrials:11, slotTrials:11, ranHundredBatch:true, sameEV:'yes', riskier:'slot', why:'same-avg-different-spread' }`
- `l5p1-mistake-diffev` — `claimed-different-ev` (`sameEV:'no'`)
- `l5p1-mistake-printerriskier` — `selected-printer-as-riskier` (`riskier:'printer'`)
- `l5p1-mistake-norisk` — `claimed-no-risk-difference` (`riskier:'neither'`)
- `l5p1-mistake-slothigher` — `claimed-slot-higher-ev` (`why:'slot-higher-average'`)
- `l5p1-mistake-printerless` — `misjudged-printer-payout` (`why:'printer-pays-less'`)
- `l5p1-guard-trials` — kind `guard` (`printerTrials:4`)
- `l5p1-guard-hundred` — kind `guard` (`ranHundredBatch:false`)

All 5 graded mistake types from interfaces.md §1 are covered, plus a correct case and both gate guards.

## Test cases added (`lesson5-checkers.test.ts`, `ev-l5-p1 checkSameAverageDifferentRide`)
- gates until each machine has run ≥10 times (printer<10 and slot<10) → `mistakeType` null, `canComplete` false
- gates until a 100-run batch pressed → null / false, feedback matches `/100-run batch/i`
- gates on each of the three unanswered questions (`sameEV`/`riskier`/`why` empty) → null / false
- accepts the correct triple → `canComplete` true, `isCorrect` true, `mistakeType` null
- one test per graded mistake type: `claimed-different-ev`, `selected-printer-as-riskier`, `claimed-no-risk-difference`, `claimed-slot-higher-ev`, `misjudged-printer-payout`

`checkWiderSpread` (L5P2) left fully untouched (its feedback still references old booth payouts — in scope to ignore).

## Full suite results (from repo root)

### `npm test 2>&1 | tail -40`
```
> expected-value-lab@0.0.0 test
> vitest run

 RUN  v4.1.9 /Users/adarshrajesh/alpha/BrilliantClone

 Test Files  31 passed (31)
      Tests  577 passed (577)
   Start at  16:32:18
   Duration  464ms
```
Exit code: 0 — **PASS**

### `npm run build 2>&1 | tail -25`
```
> expected-value-lab@0.0.0 build
> tsc -b && vite build

vite v8.1.0 building client environment for production...
✓ 181 modules transformed.
dist/index.html                     0.46 kB │ gzip:   0.30 kB
dist/assets/index-HjWFM23r.css     96.11 kB │ gzip:  19.41 kB
dist/assets/index-BP2PDVJ1.js   1,031.15 kB │ gzip: 302.44 kB
✓ built in 175ms
(!) Some chunks are larger than 500 kB after minification. [pre-existing chunk-size advisory only]
```
Exit code: 0 — **PASS** (tsc clean; only the pre-existing >500 kB chunk advisory)

### `npm run lint 2>&1 | tail -25`
```
> expected-value-lab@0.0.0 lint
> oxlint

…react(only-export-components) fast-refresh warnings in:
  MysteryBoxes.tsx, CarnivalWheel.tsx, InlineFieldStatus.tsx,
  ProblemStepChecklist.tsx, Problem1SpinnerPlayground.tsx,
  Problem5PayoutPlayground.tsx, AuthContext.tsx,
  ConfigurableSpinner.tsx, FeedbackPanel.tsx, ClassicBalanceScale.tsx
```
Exit code: 0 — **PASS**. All warnings are pre-existing `fast-refresh` advisories in files outside this task's scope; **zero warnings/errors in the four files I touched**.

## Blockers
None.

## Notes for integrator
- `src/validation/liveCheckerValidation.test.ts` (out of scope, not edited) still contains a hardcoded `problem-7` gate test using the OLD booth input shape (`boothARun/boothBRun/feelSame/averageAnswer`). It still passes only by coincidence: the new checker ignores the unknown fields, `ranHundredBatch` is `undefined` → falsy → returns the 100-batch guard (`canComplete:false`, not a graded attempt), satisfying the assertions. If the orchestrator wants that test to read semantically correctly for the new content, it should be updated to the new input shape — but it is currently GREEN and was outside my allowed scope.
