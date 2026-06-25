# Interfaces / Shared Contracts — Claw Machine Expected Value (ev-l2-p1)

These are the contracts workers MUST honor. Do not invent alternatives.

## 1. Checker (owned by T-001, in `src/data/problems/problem-2.ts`)

Keep export names. Only the gate field changes (`bothDropped` → `grabsComplete`):

```ts
export interface Problem2PrizeBoardCheckInput {
  /** True once the learner has run >= REQUIRED_GRABS claw drops AND viewed the
   *  contribution compression. Replaces the old `bothDropped` gate. */
  grabsComplete: boolean
  /** Formula pairing slots, in order [payoutA, probA, payoutB, probB]. */
  slots: [string, string, string, string]
  /** Raw EV text the learner typed. */
  evAnswer: string
}

export function checkProblem2PrizeBoard(input: Problem2PrizeBoardCheckInput): CheckResult
```

Gate / grading order (unchanged except the first guard):
1. `!grabsComplete` → guard (mistakeType `''`, canComplete false):
   "Run all your claw drops and view the contribution breakdown before pairing the formula."
2. 0 slots filled → guard "Select a card, then tap an empty formula slot to place it."
3. `< 4` slots filled → mistake `omitted-probability`.
4. wrong pairing → mistake `reversed-outcome-probability`.
5. evAnswer matches 20 → mistake `used-largest-payout`.
6. evAnswer not 5 → mistake `arithmetic-error`.
7. correct → `{ isCorrect: true, mistakeType: null, canComplete: true }`.

Correct pairing (either order): `['$20','25%','$0','75%']` or `['$0','75%','$20','25%']`.
Accepted EV formats: `5, 5.0, 5.00, $5, $5.00` (via `matchesNumeric(input.evAnswer, [5])`).

Constant: `export const REQUIRED_GRABS = 8`.

## 2. Claw machine visual (owned by T-002, `src/components/visuals/ClawMachine.tsx`)

The PARENT owns grab RNG + the "Drop Claw" button (right control panel). The
visual renders the pit/claw/tray and animates ONE grab at a time when given an
`activeGrab`, then reports the animation finished.

```ts
export interface ClawZone {
  id: string
  label: '$20' | '$0'
  value: 20 | 0
  isPrize: boolean        // true only for the single $20 zone
}

export interface ClawGrab {
  id: string              // unique per grab
  zoneIndex: number       // 0..3, which floor zone the claw grabbed
  value: 20 | 0
  isPrize: boolean
}

export interface ClawMachineProps {
  /** The 4 floor zones, left→right. Exactly one isPrize ($20); three are $0. */
  zones: ClawZone[]
  /** Completed grabs (drives the tray tokens + counts). */
  grabs: ClawGrab[]
  /** The grab currently animating; null when idle. When set, the visual slides
   *  the claw over zones[activeGrab.zoneIndex], drops, grabs, rises, and drops
   *  the token into the tray, then calls onGrabAnimationEnd. */
  activeGrab: ClawGrab | null
  /** Called exactly once when the active grab's full cycle finishes (or, under
   *  reduced motion, on the next frame). Parent then appends to `grabs`. */
  onGrabAnimationEnd: () => void
  /** OS reduced-motion preference. When true: no claw travel/cable; reveal the
   *  selected zone with a fade and update the tray instantly. Result identical. */
  reducedMotion: boolean
}

export function ClawMachine(props: ClawMachineProps): JSX.Element
```

Visual requirements: 3D-looking pit/cabinet, claw on a rail that slides L/R,
cable drop, claw close, token rises with claw, $20 token flashes gold + is rare,
$0 token gray + common, token drops into a payout tray that accumulates tokens.
Use existing motion conventions: `prefers-reduced-motion` CSS guard + the
parent-passed `reducedMotion` to skip travel. Keyframes live in `ClawMachine.css`.

## 3. Contribution compression visual (owned by T-003, `src/components/visuals/ClawContributionBlocks.tsx`)

```ts
export interface ClawContributionRow {
  payout: string          // '$20' | '$0'
  probability: string     // '25%' | '75%'
  product: string         // '$5' | '$0'
  weight: number          // 0.25 | 0.75  (for block width)
}

export interface ClawContributionBlocksProps {
  rows: ClawContributionRow[]   // [{payout:'$20',probability:'25%',product:'$5',weight:0.25},
                                //  {payout:'$0', probability:'75%',product:'$0',weight:0.75}]
  evTotal: string               // '$5'
  /** Trigger the compress-into-blocks animation. */
  revealed: boolean
  reducedMotion: boolean
}

export function ClawContributionBlocks(props: ClawContributionBlocksProps): JSX.Element
```

Shows the pit collapsing into contribution blocks: `$20 × 25% = $5`,
`$0 × 75% = $0`, summing to `EV = $5`. Block widths reflect `weight`. Under
reduced motion, render the final state without the transfer animation.

## 4. Parent composition (T-004, `Problem2WeightedAverage.tsx`)

- KEEP `export function Problem2WeightedAverage()` and persistence key `'problem-2'`.
- KEEP `useProblemSession(PROBLEM_2, state)` and the submit call:
  `session.handleCheck(checkProblem2PrizeBoard({ grabsComplete, slots, evAnswer }), 'final', evAnswer, evAnswer)`.
- KEEP `nextProblemId="ev-l2-p2"`, `problemNumber={4}`.
- Reuse `FormulaBuilder` (read-only import) for the $20↔25% / $0↔75% pairing with
  cards `['$20','$0','25%','75%']` and the same 4 slots the checker expects.
- Generate grab outcomes in the parent: weighted 25% prize / 75% zero (e.g.
  `Math.random() < 0.25`). The EV answer is fixed regardless of grab luck — this
  is the "short-run ≠ true EV" teaching point.
- `grabsComplete = grabs.length >= REQUIRED_GRABS && viewedCompression`.
- No-scroll split layout: left = `ClawMachine` (in `.ws-visual`), right = task,
  "Drop Claw" button, grab counter, then (after gate) `ClawContributionBlocks`,
  formula pairing, EV input, Submit. Use `l2-claw-workspace.css` (component-scoped
  classes only; reuse `.ws-*` from `workspace.css`, do not override them).

## 5. Title / copy (T-001 + T-005 must agree)

New title string (exact): **`Claw Machine Expected Value`** in `problem-2.ts`,
`canonical.ts`, and prd.md. T-005 updates the title in
`problemBehaviorValidation.ts` and `answerValidationMatrix.ts` descriptor rows to
match. completionRule / requiredActions reflect: run ≥8 grabs, view compression,
pair formula, submit EV $5.
