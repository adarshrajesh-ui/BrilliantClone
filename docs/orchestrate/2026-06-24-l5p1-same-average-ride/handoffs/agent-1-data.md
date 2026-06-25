# Handoff: agent-1-data (T-001) — Data + checker rewrite

Run: `2026-06-24-l5p1-same-average-ride`
Task: T-001 — Rewrite Lesson 5 Problem 1 (`ev-l5-p1` / storage `problem-7`) for **"Same Average, Different Ride"**.
Status: ✅ Complete.

## Files changed
- `src/data/problems/problem-7.ts` — full rewrite of CheckInput type, checker fn, and `PROBLEM_7` metadata.
- `src/core/progression/canonical.ts` — **only** the `ev-l5-p1` row: title `'Carnival Booth Preview'` → `'Same Average, Different Ride'`; description → `'Two games can share an expected value yet differ sharply in risk.'`. Nothing else touched.

## Final exported names (problem-7.ts)
- `export interface CanonicalProblemDefinition extends ProblemDefinition` (unchanged, kept local).
- `export interface SameAverageRideCheckInput` (renamed from `BoothPreviewCheckInput`, **no alias kept**).
- `export function checkSameAverageDifferentRide(input: SameAverageRideCheckInput): CheckResult` (renamed from `checkBoothPreview`, **no alias kept**).
- `export const PROBLEM_7: CanonicalProblemDefinition` — `problemId: 'problem-7'`, `canonicalSlug: 'ev-l5-p1'`, `legacyProblemId: 'l5-build-whole-ev-model'`.

## Input shape (exact)
```ts
export interface SameAverageRideCheckInput {
  printerTrials: number      // cumulative runs on Money Printer (Game A)
  slotTrials: number         // cumulative runs on Jackpot Slot (Game B)
  ranHundredBatch: boolean   // true once a 100-run batch pressed on either machine
  sameEV: string             // 'yes' | 'no'
  riskier: string            // 'slot' | 'printer' | 'neither'
  why: string                // 'same-avg-different-spread' | 'slot-higher-average' | 'printer-pays-less'
}
```

## Gate order (all return `mistakeType: null`, `canComplete: false`)
1. `printerTrials < 10 || slotTrials < 10` → "Run each machine at least 10 times."
2. `!ranHundredBatch` → "Run at least one 100-run batch on either machine."
3. `sameEV.trim() === ''` → guard (answer Q1)
4. `riskier.trim() === ''` → guard (answer Q2)
5. `why.trim() === ''` → guard (answer Q3)

## Graded mistake types (in evaluation order; `mistakeType` set, `canComplete: false`)
| order | condition | mistakeType |
|-------|-----------|-------------|
| 1 | `sameEV === 'no'` | `claimed-different-ev` |
| 2 | `riskier === 'printer'` | `selected-printer-as-riskier` |
| 3 | `riskier === 'neither'` | `claimed-no-risk-difference` |
| 4 | `why === 'slot-higher-average'` | `claimed-slot-higher-ev` |
| 5 | `why === 'printer-pays-less'` | `misjudged-printer-payout` |

All 5 also present as `mistakeRules` entries in `PROBLEM_7` metadata (matches PRD spec list for T-005's `prdCoverage` reconcile).

## Correct-answer triple
`sameEV === 'yes' && riskier === 'slot' && why === 'same-avg-different-spread'` → `ok(..., true)`.
- `correctAnswers: { sameEV: 'yes', riskier: 'slot', why: 'same-avg-different-spread' }`
- `acceptedFormats: { sameEV: ['yes'], riskier: ['slot'], why: ['same-avg-different-spread'] }`

## Math (exact)
- Money Printer: always $10 → EV $10.
- Jackpot Slot: `0 × 0.6 + 25 × 0.4 = 10` → EV $10. (givenData uses `outcomes: [25, 0]`, `probabilities: [0.4, 0.6]`.)

## Metadata key fields
- `visualType: 'same-average-ride'`, `interactionType: 'qualitative-compare'`
- `requiredActions: ['run-printer-10','run-slot-10','run-hundred-batch','answer-same-ev','answer-riskier','answer-why']`
- `answerInputs: ['sameEV','riskier','why']`
- `masteryTags: ['same-ev-different-risk']`
- `hints` ids: `p7-h1`, `p7-h2`, `p7-h3`.
- `teachingExplanation` = title + 2 body paragraphs + takeaway.
- `difficulty: 7` (kept).

## Verification
`npx tsc --noEmit -p tsconfig.app.json` → `problem-7.ts` has **no errors of its own**. Expected/remaining errors in OTHER files (handled by later agents), all due to the old import names being removed:
- `src/components/problems/lesson5-checkers.test.ts` (imports `checkBoothPreview`, `BoothPreviewCheckInput`) → T-005.
- `src/components/problems/Problem7WholeEVModel.tsx` (imports `checkBoothPreview`) → T-004.
- `src/validation/liveCheckers.ts` (imports `checkBoothPreview`, `BoothPreviewCheckInput`) → T-005.

## Blockers
None. Downstream agents must migrate references to `checkSameAverageDifferentRide` / `SameAverageRideCheckInput` (no back-compat aliases were left, per task spec).
