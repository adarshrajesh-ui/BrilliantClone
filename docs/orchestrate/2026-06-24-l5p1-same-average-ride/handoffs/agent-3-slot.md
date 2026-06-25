# Handoff: agent-3-slot (T-003 — JackpotSlot3D)

## Files created
- `src/components/visuals/JackpotSlot3D.tsx`
- `src/components/visuals/JackpotSlot3D.css`

No other files touched. No npm deps added. Pure CSS 3D + emoji glyphs (no three.js, no SVG asset needed).

## Exact prop signature shipped
Matches `interfaces.md` section 2 verbatim:

```ts
export interface JackpotSlot3DProps {
  animate: boolean
  runToken: number
  outcome: number | null   // 0 or 25; null = idle
  onComplete?: () => void
  className?: string
}
export function JackpotSlot3D(props: JackpotSlot3DProps): JSX.Element
```

## Behavior / state machine
- Internal phase state: `'idle' | 'spinning' | 'result'`.
- `useEffect` keyed strictly on `runToken`. A `prevToken` ref guards the initial
  mount so `onComplete` does NOT fire on first render — it fires **exactly once
  per real token change**.
- Latest `outcome` / `animate` / `onComplete` are read via a ref inside the
  effect, so a parent changing those without bumping the token never re-triggers
  a cycle (keeps the once-per-token guarantee).
- Timers/RAF are cleaned up on unmount and on token change (cancelled flag).
- Idle look when `outcome === null` / before first run (`$ ?`, dim bulbs,
  mismatched idle reel faces).
- Component computes nothing about probability — it only reveals the given
  `outcome`. No outcome strip, no running-average graph, no Run buttons.

## Animation duration
- Full animated cycle = **`CYCLE_MS = 1200ms`** (within the 900–1300ms target).
  Sequence: lever yanks down (~720ms, front-loaded) → reels scroll + body shakes
  → reels settle with a staggered pop (per-reel 0/90/180ms delay) → reveal
  burst (gold flash 850ms / coin shower 1s, or gray smoke 950ms). `onComplete`
  is called at the end of the 1200ms timer.

## How $0 vs $25 reveal differs (dramatically)
- **`outcome === 25` → JACKPOT (`.js3-win`):** three matching gold `7`s,
  radial **gold flash** overlay, **coin shower** (18 deterministic coin
  trajectories bursting up and raining down), marquee bulbs flip to gold and
  **chase/flash**, payout shows a brightly glowing **`$25`**.
- **`outcome === 0` → LOSE (`.js3-lose`):** mismatched reel line, machine body
  **desaturated** (`filter: grayscale + brightness`), a **gray smoke puff**
  rising from the tray, muted **`$0`** with no glow, no coins/flash.

## Reduced-motion handling
- `animate === false`: result is applied **instantly** (phase → `result`,
  settled face shown, no spin/shake/lever/burst) and `onComplete` is called on
  the next frame via `requestAnimationFrame`. Coin/flash/smoke overlays are
  gated behind `animate` so they never render in the reduced path; the settle
  pop is gated behind the `.js3-animated` class.
- CSS safety net: `.js3-reduced` disables the machine/lever/reel/bulb
  animations, and a `@media (prefers-reduced-motion: reduce)` block force-
  disables every keyframe animation regardless of the prop (handles OS-level
  preference even if a parent passes `animate=true`).

## Accessibility
- Visually-hidden `role="status" aria-live="polite"` node announces the result:
  **"Jackpot! $25"** or **"No win. $0"** on settle (empty during idle/spin).
- All decorative 3D/animation layers are `aria-hidden`.

## 3D construction notes (for visual consistency with the rest of the deck)
- Follows the repo convention from `DiceTray3D` / `ClawMachine`: `perspective`
  on a stage host, `transform-style: preserve-3d`, real box faces
  (front/right/top) via `translateZ` + `rotateX/Y`, layered inset/drop shadows
  for chrome + depth. Side pull-lever is a separate `translateZ` layer that
  pivots from the bottom.
- Root size vars: `--js3-w: 260px`, `--js3-h: 326px`, `--js3-d: 40px`; classes
  are all `js3-` prefixed. Accepts an external `className` (appended to root).

## Verification
- `npx tsc --noEmit -p tsconfig.app.json` → **no errors originating from
  `JackpotSlot3D.tsx`**. The 5 reported errors are all from other in-flight
  files (`problem-7.ts` rename not yet landed): `lesson5-checkers.test.ts`,
  `Problem7WholeEVModel.tsx`, `liveCheckers.ts` still import the old
  `checkBoothPreview` / `BoothPreviewCheckInput`. Out of my scope (T-001/T-005).

## For T-004 (workspace integration)
Render one per machine:
```tsx
<JackpotSlot3D animate={!reducedMotion} runToken={slotToken} outcome={slotOutcome} onComplete={handleSlotDone} />
```
- Bump `runToken` once per press batch; set `outcome` to the value you want
  revealed (the last drawn outcome of the batch, 0 or 25) **before/with** the
  token bump. For multi-run batches the component just plays one cycle and
  reveals the single `outcome` you pass — it does not animate every trial.
- `outcome` MUST be `0` or `25` (or `null` for idle). Any other number is
  treated as a "lose" (non-25) by the win check.

## Blockers
None.
