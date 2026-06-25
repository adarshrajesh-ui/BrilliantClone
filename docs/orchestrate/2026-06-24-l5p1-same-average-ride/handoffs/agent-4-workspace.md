# Handoff: agent-4-workspace (T-004) — Workspace component + CSS

Run: `2026-06-24-l5p1-same-average-ride`
Task: T-004 — Rewrite Lesson 5 Problem 1 into the no-scroll **"Same Average, Different Ride"** workspace, wiring the new checker (T-001) + the two 3D machines (T-002/T-003).
Status: ✅ Complete — no blockers.

## Files changed (only these two, per scope)
- `src/components/problems/Problem7WholeEVModel.tsx` — **full rewrite**. Export name kept: `Problem7WholeEVModel`. Persisted key kept: `'problem-7'`.
- `src/components/problems/l5p1-workspace.css` — **new**. All classes prefixed `l5p1-`. `lesson5.css` untouched.

No other files edited. Did not touch `simulation.ts`, the data file, the visuals, `WorkspaceSteps`, `ProblemLayout`, `ProblemPage.tsx`, or any registry.

## Imports / wiring
- `usePersistedProblemState<P7State>('problem-7', DEFAULT)` (key unchanged).
- `useProblemSession(PROBLEM_7, state)`.
- `usePrefersReducedMotion()` → `reducedMotion`; passed as `animate={!reducedMotion}` to both machines.
- Games from `../../lib/simulation`:
  - `PRINTER_GAME = constantGame(10)`
  - `SLOT_GAME: DiscreteOutcome[] = [{ value: 25, probability: 0.4 }, { value: 0, probability: 0.6 }]`
- Checker: `checkSameAverageDifferentRide` from `../../data/problems/problem-7` (old `checkBoothPreview` import removed).

## Final P7State shape
```ts
interface MachineState {
  trials: number          // cumulative trial count
  results: number[]       // every individual outcome, in order
  lastOutcome: number | null  // last revealed outcome → drives the 3D `outcome` prop
  runToken: number        // monotonic press counter; doubles as seed index + 3D runToken
}

interface P7State {
  printer: MachineState
  slot: MachineState
  ranHundredBatch: boolean  // true once any Run 100 pressed on EITHER machine
  sameEV: string            // '' | 'yes' | 'no'
  riskier: string           // '' | 'slot' | 'printer' | 'neither'
  why: string               // '' | 'same-avg-different-spread' | 'slot-higher-average' | 'printer-pays-less'
}
```
DEFAULT: both machines `{ trials: 0, results: [], lastOutcome: null, runToken: 0 }`, `ranHundredBatch: false`, three answers `''`.

`isRunning` is **not** persisted — it lives in two local `useState` flags (`printerRunning`, `slotRunning`) used only to disable that machine's buttons mid-animation.

## Run controls → state update (per press)
`runMachine(machine, batchSize)`:
1. If `!reducedMotion`, set that machine's `isRunning = true` (reduced motion keeps buttons enabled → "re-enable immediately").
2. `setState`: `nextToken = prev.runToken + 1`; `sim = runDeterministicBatch(game, batchSize, ` + "`problem-7-${machine}-${nextToken}`" + `)`.
   - `trials += batchSize`
   - `results = [...prev.results, ...sim.results]` (cumulative)
   - `lastOutcome = sim.results.at(-1)` (final draw of the batch)
   - `runToken = nextToken`
   - `ranHundredBatch = prev.ranHundredBatch || batchSize === 100`

`runToken` is the seed index: keys are `problem-7-printer-1`, `problem-7-printer-2`, … (and `-slot-`), so every press has a unique deterministic seed.

## How runToken / onComplete drive the machines
- Each press bumps `runToken` once → the 3D component's `useEffect` (keyed on `runToken`) plays exactly one reveal cycle for the single `outcome` passed (it does NOT animate every trial in a 10/100 batch).
- `outcome` = `lastOutcome` (printer always `10`; slot `0` or `25`).
- `onComplete` (`handlePrinterDone` / `handleSlotDone`) clears that machine's `isRunning` flag → buttons re-enable. Both components fire `onComplete` exactly once per token change (printer guards via `completedToken` ref; slot guards via `prevToken` ref).
- Components are gated behind `loaded && session.sessionLoaded` (loading screen first), so a reload mounts the machine with its persisted `runToken` already in place — no spurious animation from state hydration on the slot (the printer may play one calm reveal of the last outcome on reload, which is cosmetic only).

## Running averages + outcome strips
- `runningAverages(results)` recomputes the avg-after-each-trial array over the cumulative results (`useMemo` per machine). Passed to `RunningAverageGraph` as `averages`, with `target={10} maxY={25}` and `variant="flat"` (printer) / `"jagged"` (slot). The graph draws the `$10 target` dashed reference line itself.
- `OutcomeStrip` (small **local** component in the same file — no new shared file): renders the last `STRIP_LIMIT = 24` outcomes as chips. Printer → `$10` green (`.l5p1-chip-printer`); slot → `$0` gray (`.l5p1-chip-lose`) or `$25` gold (`.l5p1-chip-win`). Compact, wrap, capped height → no scroll.
- An `aria-live="polite"` line summarizes both running averages: "Money Printer averages $X over N runs. Jackpot Slot averages $Y over M runs."

## Steps + gating
`steps: WorkspaceStepDef[]` passed to `<ProblemLayout problem={PROBLEM_7} problemNumber={12} … steps={steps} />` (full prop set mirrored: feedback, completed, revealedHintIds, onRevealHint, restarted, onRestart→`reset()`+`session.restart()`, onReview, attemptCount, lastSubmittedAnswer, reviewHintUsed, completionMessage, steps).

- **`play`** — both machines side by side (left `MoneyPrinter3D`, right `JackpotSlot3D`), each with Run 1/10/100 controls, outcome strip, and running-average graph stacked below. `canAdvance = printer.trials >= 10 && slot.trials >= 10 && ranHundredBatch`. `advanceHint` explains whichever requirement is unmet.
- **`questions`** — the 3 MCQs + Submit. Fieldsets disabled until `gateMet`.
  - Q1 `sameEV`: `yes` / `no`
  - Q2 `riskier`: `slot` / `printer` / `neither`
  - Q3 `why`: `same-avg-different-spread` / `slot-higher-average` / `printer-pays-less`

(Kept as 2 steps; feedback renders in the action-bar coach panel so it stays visible without scrolling.)

## Exact submit call
```ts
void session.handleCheck(
  checkSameAverageDifferentRide({
    printerTrials: state.printer.trials,
    slotTrials: state.slot.trials,
    ranHundredBatch: state.ranHundredBatch,
    sameEV: state.sameEV,
    riskier: state.riskier,
    why: state.why,
  }),
  'final',
  JSON.stringify({ sameEV: state.sameEV, riskier: state.riskier, why: state.why }),
  state.why,
)
```
Submit disabled until: `!session.submitting && gateMet && allAnswered` (both machines ≥10, `ranHundredBatch`, all three answers chosen).

## CSS notes (l5p1-workspace.css)
- `.l5p1-machines` — 2-col grid (1 col ≤768px). `.l5p1-machine` stacks head + stage + controls + strip + graph.
- `.l5p1-stage` clips + scales the fixed-size 3D machines (`.l5p1-mp` scale 0.66, `.l5p1-js` scale 0.58, `transform-origin: top center`) into capped `vh` heights so two dense columns fit the no-scroll panel; the visual area flexes via `clamp(... vh ...)`.
- `.l5p1-controls` button row, `.l5p1-strip` + `.l5p1-chip` (printer/win/lose), `.l5p1-graph` caps the running-graph svg at ~15vh, `.l5p1-questions`/`.l5p1-options`/`.l5p1-option`(+`-selected`).
- Reduced-motion `@media` block neutralizes any residual transitions/animations from this layer (the 3D components already honor the `animate` prop + their own media queries).

## Verification
`npx tsc --noEmit -p tsconfig.app.json` → **no errors in `Problem7WholeEVModel.tsx`, `l5p1-workspace.css`, or `problem-7.ts`.**

Remaining (expected) errors — left for **T-005**, all from the `checkBoothPreview`/`BoothPreviewCheckInput` → `checkSameAverageDifferentRide`/`SameAverageRideCheckInput` rename not yet landed in their files:
```
src/components/problems/lesson5-checkers.test.ts(2,10): TS2305 no exported member 'checkBoothPreview'
src/components/problems/lesson5-checkers.test.ts(2,34): TS2305 no exported member 'BoothPreviewCheckInput'
src/validation/liveCheckers.ts(35,10): TS2305 no exported member 'checkBoothPreview'
src/validation/liveCheckers.ts(35,34): TS2305 no exported member 'BoothPreviewCheckInput'
```

## Blockers
None.
