# Handoff: agent-2-printer (T-002 — MoneyPrinter3D)

Run: `2026-06-24-l5p1-same-average-ride`
Status: **DONE** — no blockers.

## Files created
- `src/components/visuals/MoneyPrinter3D.tsx`
- `src/components/visuals/MoneyPrinter3D.css`

(No other files touched. No dependencies added.)

## Exact prop signature shipped
Matches `interfaces.md` section 2 verbatim:

```ts
export interface MoneyPrinter3DProps {
  animate: boolean
  runToken: number
  outcome: number | null   // always 10 when running; null = idle
  onComplete?: () => void
  className?: string
}
export function MoneyPrinter3D(props: MoneyPrinter3DProps): JSX.Element
```

Named export. Imports its own CSS. Presentational only — computes nothing; renders no
outcome strip, running-average graph, or Run buttons (parent T-004 owns those).

## Behavior
- React state machine `phase: 'idle' | 'running' | 'result'`.
- A `useEffect` keyed on `runToken` starts a cycle when `outcome !== null`.
  - `animate === true`: `phase='running'` → full CSS cycle → after the duration set
    `phase='result'` and call `onComplete` once.
  - `animate === false` (reduced motion): set `phase='result'` immediately (bill shown in
    tray instantly, no conveyor/button motion) and call `onComplete` on the next frame
    (`requestAnimationFrame`, falls back to `setTimeout(0)`).
- `onComplete` is held in a ref (so fresh inline callbacks don't restart the cycle) and
  guarded by a `completedToken` ref so it fires **exactly once per token change**.
- All timers / RAF are cleaned up on unmount and on token change.
- Idle look when `outcome === null` or before the first run.

## Animation duration
- **Full cycle: `CYCLE_MS = 880ms`** (within the required 700–1000ms window).
  Cycle: glowing PRINT button depresses → status lights turn on → 3D conveyor belt moves →
  a styled `$10` bill prints from the slot and slides along the belt into the output tray.
- The bill slide CSS keyframe (`mp3-print`) is 860ms so the bill is settled in the tray
  just before `onComplete` fires at 880ms.
- Calm, smooth, identical on every run (this is the LOW-risk machine).

## Reduced-motion handling (two layers)
1. **Prop-driven**: when `animate === false` the component skips `running` entirely, the
   bill renders directly in the tray (`mp3-bill-rest`), and `.mp3-reduced` disables
   transitions/animations.
2. **CSS safety net**: `@media (prefers-reduced-motion: reduce)` disables belt/button/light/
   bill animations and snaps the bill to its tray resting position.

## Accessibility
- `role="status" aria-live="polite"` node announces payout: "Money printer ready" (idle) →
  "Printing…" (running) → **"Printed $10"** (result). The 3D stage is `aria-hidden`.

## Verification
`npx tsc --noEmit -p tsconfig.app.json` → **no errors in MoneyPrinter3D.tsx**. The only
remaining errors are in other agents' in-flight files (the `checkBoothPreview` →
`checkSameAverageDifferentRide` rename in `problem-7.ts`, consumed by
`Problem7WholeEVModel.tsx`, `liveCheckers.ts`, `lesson5-checkers.test.ts`) — out of my scope.

## Integration note for T-004
- Increment `runToken` per press; pass `outcome={10}` (printer is `constantGame(10)`).
- Pass `animate={!reducedMotion}`.
- `onComplete` is invoked once per `runToken` change — safe to enqueue the next press in a
  Run-10 / Run-100 batch from there, or drive the batch on a fixed cadence.
