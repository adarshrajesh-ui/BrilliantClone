# Interfaces: Same Average, Different Ride (L5P1)

Shared contracts. Every agent MUST honor these exact names/shapes.

## 1. Checker (owned by T-001 in `src/data/problems/problem-7.ts`)

Rename the old `checkBoothPreview` / `BoothPreviewCheckInput` to:

```ts
export interface SameAverageRideCheckInput {
  /** cumulative runs on Money Printer (Game A) */
  printerTrials: number
  /** cumulative runs on Jackpot Slot (Game B) */
  slotTrials: number
  /** true once a 100-run batch has been pressed on either machine */
  ranHundredBatch: boolean
  /** Q1: 'yes' | 'no' */
  sameEV: string
  /** Q2: 'slot' | 'printer' | 'neither' */
  riskier: string
  /** Q3: 'same-avg-different-spread' | 'slot-higher-average' | 'printer-pays-less' */
  why: string
}

export function checkSameAverageDifferentRide(
  input: SameAverageRideCheckInput,
): CheckResult

export const PROBLEM_7: CanonicalProblemDefinition // problemId 'problem-7', slug 'ev-l5-p1'
```

### Gate order (guards return `mistakeType: null`, `canComplete: false`)
1. `printerTrials < 10 || slotTrials < 10` → guard "Run each machine at least 10 times."
2. `!ranHundredBatch` → guard "Run at least one 100-run batch on either machine."
3. `sameEV === ''` → guard (answer Q1)
4. `riskier === ''` → guard (answer Q2)
5. `why === ''` → guard (answer Q3)

### Graded mistakes (`mistakeType` set, `canComplete: false`)
| condition | mistakeType |
|-----------|-------------|
| `sameEV === 'no'` | `claimed-different-ev` |
| `riskier === 'printer'` | `selected-printer-as-riskier` |
| `riskier === 'neither'` | `claimed-no-risk-difference` |
| `why === 'slot-higher-average'` | `claimed-slot-higher-ev` |
| `why === 'printer-pays-less'` | `misjudged-printer-payout` |

### Correct
`sameEV === 'yes' && riskier === 'slot' && why === 'same-avg-different-spread'` → `ok(..., true)`.

`PROBLEM_7` metadata: `title: 'Same Average, Different Ride'`, concept "Same expected value, different risk.", `correctAnswers: { sameEV: 'yes', riskier: 'slot', why: 'same-avg-different-spread' }`, `mistakeRules` covering the 5 mistake types above, `hints` (3), `teachingExplanation`, `completionRule`. Keep `canonicalSlug: 'ev-l5-p1'`, `legacyProblemId`, `masteryTags`.

## 2. 3D machine components (Phase 1 → consumed by T-004)

Both are named exports, CSS 3D + SVG (no three.js). Each owns its own `.css`.

```ts
// src/components/visuals/MoneyPrinter3D.tsx
export interface MoneyPrinter3DProps {
  animate: boolean            // false => reduced motion: instant reveal, no conveyor/lever motion
  runToken: number            // increment to trigger one animation cycle
  outcome: number | null      // value to reveal (always 10 when running); null = idle
  onComplete?: () => void     // called when the reveal animation (or instant reveal) finishes
  className?: string
}
export function MoneyPrinter3D(props: MoneyPrinter3DProps): JSX.Element

// src/components/visuals/JackpotSlot3D.tsx
export interface JackpotSlot3DProps {
  animate: boolean            // false => instant reveal, no spin/shake/burst
  runToken: number
  outcome: number | null      // 0 or 25; null = idle
  onComplete?: () => void
  className?: string
}
export function JackpotSlot3D(props: JackpotSlot3DProps): JSX.Element
```

### Behavior contract
- On `runToken` change with `outcome !== null`: if `animate`, play the machine cycle then call `onComplete`; if `!animate`, set the result immediately and call `onComplete` on the next tick (e.g. microtask / `requestAnimationFrame` / 0ms timeout). Always call `onComplete` exactly once per token change.
- Idle visual when `outcome === null` or before first run.
- MoneyPrinter cycle: button/lever press → lights on → conveyor moves → $10 bill slides into tray (~700–1000ms).
- JackpotSlot cycle: lever pulls → reels spin → shake; `outcome===0` → gray smoke puff + empty tray; `outcome===25` → gold flash + coin burst (~900–1300ms).
- Components are presentational only. They do NOT compute outcomes, own the outcome strip, the running-average graph, or the Run buttons — the parent (T-004) does.
- Honor reduced motion via the `animate` prop AND keep CSS-level `@media (prefers-reduced-motion: reduce)` fallbacks.

## 3. Simulation (already exists — DO NOT modify `src/lib/simulation.ts`)

T-004 uses, from `../../lib/simulation`:
```ts
import { constantGame, runDeterministicBatch, type DiscreteOutcome } from '../../lib/simulation'
const PRINTER_GAME = constantGame(10)                       // EV 10
const SLOT_GAME: DiscreteOutcome[] = [
  { value: 25, probability: 0.4 },
  { value: 0, probability: 0.6 },
]                                                           // EV 10
// per press: runDeterministicBatch(game, batchSize, `problem-7-printer-${n}` | `problem-7-slot-${n}`)
```
Accumulate cumulative `results[]` per machine; running average = recompute over cumulative results; pass to `RunningAverageGraph` as `averages`.

## 4. Graph (already exists — `src/components/visuals/RunningAverageGraph.tsx`)

```ts
<RunningAverageGraph averages={printerAverages} target={10} maxY={25} variant="flat"  label="Money Printer running average" />
<RunningAverageGraph averages={slotAverages}    target={10} maxY={25} variant="jagged" label="Jackpot Slot running average" />
```

## 5. Layout (already exists — DO NOT modify)
- `src/components/lesson/ProblemLayout.tsx`, `src/features/learning-experience/WorkspaceSteps.tsx`, `workspace.css`.
- T-004 passes `steps: WorkspaceStepDef[]` to `<ProblemLayout problem={PROBLEM_7} problemNumber={12} ... />`.
- `WorkspaceStepDef = { id, title?, prompt?, content, canAdvance?, advanceHint? }`. `canAdvance` gates the Next button only, not correctness.
- New styles go in `src/components/problems/l5p1-workspace.css` (prefix classes `l5p1-`). Do NOT edit shared `lesson5.css`.

## 6. Session wiring (pattern for T-004)
```ts
session.handleCheck(
  checkSameAverageDifferentRide({ printerTrials, slotTrials, ranHundredBatch, sameEV, riskier, why }),
  'final',
  JSON.stringify({ sameEV, riskier, why }),
  why,
)
```
Persisted state key stays `'problem-7'` via `usePersistedProblemState<...>('problem-7', DEFAULT)`.

## 7. Validation reconciliation (T-005)
- `src/validation/liveCheckers.ts`: change the `problem-7` import + re-export + `case 'problem-7'` dispatch to `checkSameAverageDifferentRide` / `SameAverageRideCheckInput`.
- `src/validation/answerValidationMatrix.ts`: replace the 4 `ev-l5-p1` live cases (correct + mistakes + guard) with the new shape, and update the ev-l5-p1 entry in the per-problem PRD spec summary (mistake-type list = the 5 types above) so `prdCoverage.test.ts` passes.
- `src/components/problems/lesson5-checkers.test.ts`: replace the `ev-l5-p1 checkBoothPreview` describe block with `checkSameAverageDifferentRide` cases. **Do not touch** the L5P2/L5P3 blocks.
- Leave `checkWiderSpread` (L5P2) behavior unchanged even though its feedback references old booth payouts.
