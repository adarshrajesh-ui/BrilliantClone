# Handoff: agent-1-model (T-001)

Run: 2026-06-24-two-dice-l1p1
Task: Convert Lesson 1 Problem 1 from single-die $0/$10 payout (EV $5) to a
two-dice SUM model teaching expected value as the long-run average sum = 7. No AI.

## Files edited (only these — within scope)
- `src/data/problems/problem-1.ts` (full rewrite of semantics; structure/comment style preserved)
- `src/components/problems/agent3-checkers.test.ts` (ONLY the ev-l1-p1 block + its problem-1 imports)

## Final exported symbols + signatures (`problem-1.ts`)
Kept (names unchanged so dependents still resolve):
- `PROBLEM_1: CanonicalDefinition` — metadata fully updated (see below).
- `checkProblem1Dice(input: Problem1DiceCheckInput): CheckResult`
- `interface Problem1DiceCheckInput { predictionSubmitted: boolean; manualThrowCount: number; totalThrows: number; finalAnswer: string }` (shape unchanged)
- `checkProblem1DicePrediction(prediction: Problem1DicePrediction): CheckResult`

New:
- `interface DiceRoll { d1: number; d2: number; sum: number }`
- `function diceRollForThrow(seed: number, index: number): DiceRoll` — uses existing `hash01` at indices `index*2` and `index*2+1`; each die fair 1..6; EV(sum) = 7.
- `type Problem1DicePrediction = 2 | 7 | 12` (was `0 | 5 | 10`)

Removed:
- `diceFaceForThrow` (REMOVED)
- `dicePayoutForFace` (REMOVED)

Kept internals: `hash01` private helper, the local `CanonicalDefinition` widening, deterministic/no-AI comment style, `guard`/`wrong` CheckResult helpers.

## checkProblem1Dice behavior
Gates (return `mistakeType: ''`, `canComplete: false` — guards, not graded):
1. `!predictionSubmitted` → "Submit your prediction before the final check."
2. `manualThrowCount < 5` → "Throw the dice yourself at least 5 times first (n/5)."
3. `totalThrows < 100` → "Reach at least 100 total rolls (n/100)."

Grading (after gates): cleanup then `normalizeMoneyAnswer`:
```
finalAnswer
  .replace(/per\s*(roll|throw)/gi, '')
  .replace(/rolls?|throws?/gi, '')
  .replace(/sum/gi, '')
```
- ≈ 7 → correct, `canComplete: true`, feedback = `PROBLEM_1.feedback.correct`.
- ≈ 2 OR ≈ 12 → `chose-extreme-outcome`.
- ≈ 3.5 → `used-single-die-average`.
- any other finite number → `assumed-sample-equals-ev`.
- unparseable → guard "Enter the long-run average sum per roll."

## checkProblem1DicePrediction behavior
- `7` → `isCorrect:false, mistakeType:null, canComplete:false`, encouraging copy.
- `2` or `12` → `mistakeType: 'confused-single-roll-with-average'`.

## mistakeRules order (checker indexes into this — DO NOT reorder)
0. `chose-extreme-outcome`
1. `used-single-die-average`
2. `assumed-sample-equals-ev`
3. `confused-single-roll-with-average`

## Accepted formats (finalAnswer)
`['7', '7.0', '7.00', '7 sum', '7 per roll', '7 per throw']` — all verified accepted.

## Gate thresholds
- minManualThrows = 5
- minTotalThrows = 100

## PROBLEM_1 metadata (updated)
- title `'Two-Dice Roll Average'`
- concept unchanged wording (avg over many repetitions)
- scenarioText: two dice into a tray, average sum settles toward 7
- visualType `'dice-tray'`, interactionType `'simulate-and-predict'`
- givenData `{ dice: 2, faces: [1..6], sumRange: [2,12], expectedSum: 7, minManualThrows: 5, minTotalThrows: 100 }`
- requiredActions `['submit-prediction','throw-dice-manually','reach-100-rolls','identify-average-sum']`
- answerInputs `['prediction','finalAnswer']`
- correctAnswers `{ finalAnswer: 7 }`
- feedback.correct (7 = 3.5 + 3.5; sums not equally likely; 7 most likely)
- teachingExplanation (each die averages 3.5; sum averages 7; histogram peaks at 7)
- 3 hints ids `p1-h1` / `p1-h2` / `p1-h3`
- completionRule updated to dice/rolls/7 wording
- masteryTags `['long-run-average']` (unchanged)

## Test results
`npx vitest run src/components/problems/agent3-checkers.test.ts`
→ 1 file passed, **18/18 tests passed** (213ms). All other describe blocks in the
file were left untouched and remain green.

ev-l1-p1 block now covers: accepts 7 in all formats; gates are guards; classifies
2→chose-extreme-outcome, 12→chose-extreme-outcome, 3.5→used-single-die-average,
6.5→assumed-sample-equals-ev; prediction 7→null, 2/12→confused-single-roll-with-average;
`diceRollForThrow` deterministic with d1,d2 ∈ 1..6 and sum ∈ 2..12; EV of sum over
20,000 rolls within 0.3 of 7.

## Blockers / cross-module notes (NOT fixed — outside my scope, for T-004 integration)
1. `src/components/problems/Problem1LongRunAverage.tsx` (T-004 scope) still imports
   the removed `diceFaceForThrow` / `dicePayoutForFace` and uses
   `Problem1DicePrediction = [0, 5, 10]`. It will FAIL to typecheck/build until the
   integration agent rewires it to `diceRollForThrow` and predictions `[2, 7, 12]`.
   This is expected per the plan (T-004 owns that component).
2. `src/validation/problemBehaviorValidation.ts:258` mentions `diceFaceForThrow` only
   in a free-text `notes` string (no import) — not a compile break, but T-004 may want
   to update the wording to `diceRollForThrow`.
3. No other source importers of the removed symbols were found (only docs + the two
   files above).

Did NOT run full `npx tsc -b` (it would surface the expected T-004 component break in
files outside my scope). My two edited files have no type errors introduced.
