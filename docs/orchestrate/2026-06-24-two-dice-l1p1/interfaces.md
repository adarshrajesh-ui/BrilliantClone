# Interfaces: 2026-06-24-two-dice-l1p1

These contracts are binding. Phase 1 agents implement to these shapes; the
integration agent consumes them. Do not rename exported symbols.

## 1. Data model + checker — `src/data/problems/problem-1.ts` (T-001)

Keep these EXISTING export names so `src/validation/liveCheckers.ts` and the
problem component compile without edits to other files:
- `PROBLEM_1`
- `checkProblem1Dice`
- `Problem1DiceCheckInput`
- `checkProblem1DicePrediction`

### Deterministic two-dice roll (new)
```ts
export interface DiceRoll { d1: number; d2: number; sum: number }

// hash01(seed, index) is the existing pure 32-bit hash → [0,1).
// Use independent indices for the two dice so they are not correlated.
export function diceRollForThrow(seed: number, index: number): DiceRoll {
  const d1 = Math.floor(hash01(seed, index * 2) * 6) + 1
  const d2 = Math.floor(hash01(seed, index * 2 + 1) * 6) + 1
  return { d1, d2, sum: d1 + d2 }
}
```
- Each die is fair 1..6. EV(sum) = 7. Over ~20k rolls the mean sum must be within 0.3 of 7.
- REMOVE the old `diceFaceForThrow` / `dicePayoutForFace` exports (only the
  problem-1 component + the ev-l1-p1 test block used them; both are being updated).

### Prediction type + checker
```ts
export type Problem1DicePrediction = 2 | 7 | 12
export function checkProblem1DicePrediction(prediction: Problem1DicePrediction): CheckResult
```
- prediction === 7 → not-correct/not-complete encouraging message (`mistakeType: null`).
- 2 or 12 → `mistakeType: 'confused-single-roll-with-average'`.

### Final checker
```ts
export interface Problem1DiceCheckInput {
  predictionSubmitted: boolean
  manualThrowCount: number
  totalThrows: number
  finalAnswer: string
}
export function checkProblem1Dice(input: Problem1DiceCheckInput): CheckResult
```
Gates (return `mistakeType: ''`, `canComplete: false` — guards, not graded mistakes):
1. `!predictionSubmitted` → "Submit your prediction before the final check."
2. `manualThrowCount < 5` → "Throw the dice yourself at least 5 times first (n/5)."
3. `totalThrows < 100` → "Reach at least 100 total rolls (n/100)."

Grading (after gates pass): strip rate/sum words then `normalizeMoneyAnswer`.
Recommended cleanup before parsing:
```ts
const cleaned = input.finalAnswer
  .replace(/per\s*(roll|throw)/gi, '')
  .replace(/rolls?|throws?/gi, '')
  .replace(/sum/gi, '')
```
- ≈ 7 → correct, `canComplete: true`, feedback = `PROBLEM_1.feedback.correct`.
- ≈ 2 or ≈ 12 → `mistakeType: 'chose-extreme-outcome'`.
- ≈ 3.5 → `mistakeType: 'used-single-die-average'`.
- any other finite number → `mistakeType: 'assumed-sample-equals-ev'`.
- not parseable → guard "Enter the long-run average sum per roll."

### PROBLEM_1 metadata (update all of these)
- `title`: `'Two-Dice Roll Average'`
- `concept`: `'Expected value is the average outcome over many repetitions of a random process.'`
- `scenarioText`: about throwing two dice into a tray many times and watching the average **sum** settle.
- `visualType`: `'dice-tray'`
- `interactionType`: `'simulate-and-predict'`
- `givenData`: `{ dice: 2, faces: [1,2,3,4,5,6], sumRange: [2,12], expectedSum: 7, minManualThrows: 5, minTotalThrows: 100 }`
- `requiredActions`: `['submit-prediction', 'throw-dice-manually', 'reach-100-rolls', 'identify-average-sum']`
- `answerInputs`: `['prediction', 'finalAnswer']`
- `correctAnswers`: `{ finalAnswer: 7 }`
- `acceptedFormats.finalAnswer`: `['7', '7.0', '7.00', '7 sum', '7 per roll', '7 per throw']`
- `mistakeRules` (KEEP THIS ORDER; checker indexes into it):
  - `[0] chose-extreme-outcome` — picked a single extreme sum (2 or 12), not the average.
  - `[1] used-single-die-average` — answered 3.5; that's the average of ONE die. With two dice the averages add: 3.5 + 3.5 = 7.
  - `[2] assumed-sample-equals-ev` — that looks like the sample average you happened to see; the long-run average is exactly 7.
  - `[3] confused-single-roll-with-average` — a single roll shows one sum (2..12), not the long-run average.
- `feedback.correct`: explains 7 = 3.5 + 3.5; sums 2..12 are not equally likely, 7 is most likely, average sum = 7.
- `teachingExplanation`: two-dice intuition (each die averages 3.5; sum averages 7; histogram peaks at 7).
- `hints` (keep 3, ids `p1-h1/h2/h3`): watch the line settle; each die averages 3.5; 3.5 + 3.5 = 7 (and 7 is the most common sum).
- `completionRule`: 'Submit a prediction, throw the dice manually at least 5 times, reach at least 100 total rolls, and identify 7 as the long-run average sum.'
- `masteryTags`: `['long-run-average']` (unchanged).

## 2. 3D dice tray — `src/components/visuals/DiceTray3D.tsx` (T-002)
```ts
export interface DiceTray3DProps {
  /** Settled faces after the most recent throw, or null before any throw. */
  dice: { d1: number; d2: number } | null
  /** Bumped by the parent on every throw to re-trigger the throw animation. */
  throwSeq: number
  /** Sum of the most recent throw, for the result badge. */
  lastSum: number | null
  /** Total rolls so far (drives the "converging toward 7" note). */
  totalThrows: number
  /** Called when the learner throws (drag dice into tray, tap, or Enter). */
  onThrow: () => void
  disabled: boolean
  reducedMotion: boolean
}
export function DiceTray3D(props: DiceTray3DProps): JSX.Element
```
Requirements:
- Dedicated tray/board area (board-game felt look, NOT Monopoly assets/branding).
- Two pick-up-able 3D-looking dice (CSS 3D cube faces or layered shading is fine).
- Throw animation sequence: lift → arc → tumble → bounce → roll → settle. Decorative
  only — the actual faces come from `dice` prop (deterministic in parent).
- `reducedMotion === true`: skip the throw animation; show settled dice immediately.
- Also honor `@media (prefers-reduced-motion: reduce)` in CSS.
- Pointer drag-into-tray, tap-to-arm-then-tap-tray, AND keyboard Enter/Space → `onThrow()`.
- `disabled` → no throwing; show a hint to submit a prediction first.
- Accessible labels on interactive die(s); the live numeric result is announced by
  the parent (parent owns the `aria-live` region), so this component does not need one.
- Render the two settled faces + a sum badge (e.g. "= 9").

## 3. Sum histogram — `src/components/visuals/SumHistogram.tsx` (T-003)
```ts
export interface SumHistogramProps {
  /** counts[i] = frequency of sum (i + 2). MUST be length 11 (sums 2..12). */
  counts: number[]
  /** Optional caption. Default: 'Distribution of sums'. */
  label?: string
}
export function SumHistogram(props: SumHistogramProps): JSX.Element
```
Requirements:
- 11 vertical bars labeled 2..12 along the x-axis; bar height ∝ count (normalize to max).
- Visually emphasize the center/peak at 7 (e.g. accent color on the 7 bar) so the
  bell shape centered on 7 is obvious.
- Empty state (all zero) renders an axis + "Roll the dice to build the distribution."
- SVG-based, responsive (viewBox), `role="img"` with an `aria-label` summarizing the shape.
- Scoped class names only (prefix `sh-`); no global/shell overrides.

## 4. Reuse (no edits)
`src/components/visuals/RunningAverageGraph.tsx` is reused AS-IS by passing
`target={7}` and `maxY={12}` and a `label`. Do not modify it.
