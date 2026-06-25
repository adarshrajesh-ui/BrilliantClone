# Handoff — agent-4-component (T-004: Parent composition)

Run: `2026-06-24-claw-machine-l2p1`
Status: **DONE**. `npx tsc -b` clean; `npm test` → 31 files / 570 tests passed.

## Files changed (only these — within ALLOWED scope)

- `src/components/problems/Problem2WeightedAverage.tsx` — **rewritten** into the
  "Claw Machine Expected Value" two-step no-scroll workspace.
- `src/components/problems/l2-claw-workspace.css` — **created** (component-scoped
  layout/compaction; imported at the top of the component).

No other files touched. Routing/progress/Firebase contracts preserved:
- `export function Problem2WeightedAverage()` kept.
- `usePersistedProblemState<P2State>('problem-2', DEFAULT)` kept.
- `useProblemSession(PROBLEM_2, state)` kept.
- Submit shape kept:
  `session.handleCheck(checkProblem2PrizeBoard({ grabsComplete, slots: state.slots, evAnswer: state.evAnswer }), 'final', state.evAnswer, state.evAnswer)`.
- `<ProblemLayout problem={PROBLEM_2} problemNumber={4} nextProblemId="ev-l2-p2" ... />`
  with all the same session props passed through, plus a new claw-flavored
  `demoSteps`/`demoFinalCta` intro and `completionMessage`.

## Final state shape (persisted under key `'problem-2'`)

```ts
interface P2State {
  grabs: ClawGrab[]                 // completed grabs (drives tray + counter + dots)
  activeGrab: ClawGrab | null       // grab currently animating; null when idle
  viewedCompression: boolean        // learner tapped "Compress the pit"
  slots: [string, string, string, string]  // FormulaBuilder pairing
  selectedCard: string | null       // FormulaBuilder card selection
  evAnswer: string                  // EV text input
}
const DEFAULT: P2State = {
  grabs: [], activeGrab: null, viewedCompression: false,
  slots: ['', '', '', ''], selectedCard: null, evAnswer: '',
}
```

## Zones (defined once, fixed positions)

```ts
const ZONES: ClawZone[] = [
  { id: 'zone-0', label: '$0',  value: 0,  isPrize: false },
  { id: 'zone-1', label: '$20', value: 20, isPrize: true  },  // prize at index 1
  { id: 'zone-2', label: '$0',  value: 0,  isPrize: false },
  { id: 'zone-3', label: '$0',  value: 0,  isPrize: false },
]
const PRIZE_INDEX  = ZONES.findIndex(z => z.isPrize)        // 1
const ZERO_INDICES = ZONES.map((_,i)=>i).filter(i=>!ZONES[i].isPrize) // [0,2,3]
```

## How grabs / compression / gate work

- **Drop Claw** (right control panel, `.l2-drop-btn`): disabled while
  `activeGrab !== null` OR `grabs.length >= REQUIRED_GRABS`. On press it builds the
  outcome in the parent — `Math.random() < 0.25` → prize zone (`PRIZE_INDEX`), else a
  random `$0` zone — and sets it as `activeGrab`. The button label reflects state
  (`Drop claw` / `Claw working…` / `All grabs used`).
- `<ClawMachine zones grabs activeGrab onGrabAnimationEnd reducedMotion />` animates the
  single active grab. `onGrabAnimationEnd = handleGrabEnd` appends `activeGrab` to
  `grabs` and clears it (idempotent functional update, safe against double-fire).
- Grab counter shows `Grabs: N / 8` plus 8 status dots (gold = prize, gray = $0).
- **Gate / step 2 reveal:** after `grabs.length >= REQUIRED_GRABS`, the "Compress the pit"
  action (`.l2-compress-btn`) sets `viewedCompression = true`, which flips
  `<ClawContributionBlocks revealed={viewedCompression} />` ($20×25%=$5, $0×75%=$0,
  EV=$5) and then reveals the `FormulaBuilder` + EV input + Submit.
- `grabsComplete = grabs.length >= REQUIRED_GRABS && viewedCompression` (imported
  `REQUIRED_GRABS` from `problem-2.ts`). This is the only value fed to the checker's gate.

## Step structure (`WorkspaceStepDef[]`)

1. **`run` — "Run the claw"**: LEFT = full `ClawMachine` in `.ws-visual`; RIGHT = task
   copy + Drop Claw + grab counter/dots + a "short runs are noisy" note when done.
   `canAdvance: grabsDone`, `advanceHint: "Run all 8 claw drops to continue."`
2. **`compress` — "Compress & build the formula"**: LEFT = compact `ClawMachine`
   (`.l2-claw-compact` / `.l2-claw-fit`) + `ClawContributionBlocks` (`.l2-contrib`);
   RIGHT = either the "Compress the pit" button (pre-reveal) or the formula pairing +
   EV input + Submit (post-reveal). No `canAdvance` (last step).

Real completion still flows through `checkProblem2PrizeBoard`; `canAdvance` only gates the
Next button (per WorkspaceSteps contract).

## New CSS classes (`l2-claw-workspace.css`, component-scoped)

`.l2-claw-step`, `.l2-claw-step-2`, `.l2-claw-stage`, `.l2-claw-side`,
`.l2-drop-btn`, `.l2-grab-counter`, `.l2-grab-counter-num`, `.l2-grabs`,
`.l2-dot` / `.l2-dot-gold` / `.l2-dot-gray`, `.l2-grab-done`,
`.l2-claw-compact`, `.l2-claw-fit`, `.l2-contrib`, `.l2-compress-btn`.

- LEFT/RIGHT split = `.l2-claw-step` grid (`minmax(0,1.05fr) / minmax(0,0.95fr)`,
  `align-items: stretch`, `flex:1 1 auto`), referencing the `.l1-play` grid idea.
- Step 2 stage is a wrapped flex row; the compact claw reserves its **post-scale**
  footprint via an outer `.l2-claw-compact` box (250×280, `overflow:hidden`) wrapping an
  inner `.l2-claw-fit` (`width:420px; transform: scale(0.595); transform-origin: top left`).
  This scales **only our own wrapper** — no `.claw-machine` / `.cm-*` / `.ccb-*` rules are
  overridden, and **no global `.ws-*` rule is overridden** (we only place markup inside
  `.ws-visual`).
- `@media (max-width: 768px)` collapses to a single column and stacks the step-2 stage;
  `@media (max-width: 390px)` tightens the side gaps. The page never scrolls (workspace
  shell locks it); the `.ws-step` `overflow:auto` is the only safety net.

## Reduced motion

`usePrefersReducedMotion()` is passed to both `ClawMachine` and `ClawContributionBlocks`;
both render final states without travel/transfer animation when true.

## Verification

- `npx tsc -b` → **clean** (0 errors).
- `npm test` (`vitest run`) → **31 files, 570 tests passed**. Nothing I own breaks; the
  validation/test files agent-5 owned (answerValidationMatrix, problemBehaviorValidation,
  liveCheckerValidation.test, agent3-checkers.test) are all green at handoff time.

## Blockers

None.
