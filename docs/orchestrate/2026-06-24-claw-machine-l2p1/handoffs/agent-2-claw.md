# Handoff — agent-2-claw (T-002: ClawMachine visual)

Run: `2026-06-24-claw-machine-l2p1`

## Files created (only these; no existing files edited)

- `src/components/visuals/ClawMachine.tsx`
- `src/components/visuals/ClawMachine.css`

## Exported names

```ts
export interface ClawZone   // { id, label: '$20'|'$0', value: 20|0, isPrize }
export interface ClawGrab   // { id, zoneIndex, value: 20|0, isPrize }
export interface ClawMachineProps
export function ClawMachine(props: ClawMachineProps): JSX.Element
```

Import:

```ts
import { ClawMachine, type ClawZone, type ClawGrab } from '../visuals/ClawMachine'
```

## Prop contract (as implemented — matches interfaces.md §2 exactly)

```ts
interface ClawMachineProps {
  zones: ClawZone[]               // 4 floor zones, left→right; exactly one isPrize ($20)
  grabs: ClawGrab[]               // completed grabs → tray chips + counts
  activeGrab: ClawGrab | null     // the grab currently animating; null = idle
  onGrabAnimationEnd: () => void  // fired exactly once when the active grab's cycle ends
  reducedMotion: boolean          // true → skip travel/cable, reveal + resolve next frame
}
```

- `onGrabAnimationEnd` is kept in a ref internally, so passing a **fresh inline
  arrow each render is safe** — it will NOT restart the animation.
- The effect is keyed on `activeGrab.id` + `reducedMotion`. Keep `activeGrab`
  object stable (don't churn its `id`) while a grab is animating.

## Animation stages (full motion)

Ordered, timed setTimeout sequence (total ≈ 3.7s). Claw rests over the chute on
the right (`HOME_X = 88%`).

1. `travel` (700ms) — carriage slides along the rail to `zones[zoneIndex]` center.
2. `drop` (650ms) — cable extends, claw lowers into the pit.
3. `grab` (450ms) — claw arms close; held token appears (gold flashes if `isPrize`, else gray).
4. `rise` (650ms) — cable retracts, claw + token rise.
5. `toTray` (700ms) — carriage returns over the chute.
6. `release` (550ms) — token drops into the tray (`cm-tray-drop` keyframe).

After the last stage `onGrabAnimationEnd()` is called **once** (guarded by an
`endedForId` ref so it never double-fires, even on re-render).

## Reduced motion behavior (`reducedMotion === true`)

- No carriage travel, no cable motion. Stage goes straight to `reveal`, which
  highlights `zones[zoneIndex]` (`.cm-zone-active`).
- `onGrabAnimationEnd()` fires on the next frame (`requestAnimationFrame`, with a
  `0ms setTimeout` fallback for non-DOM environments).
- The OUTCOME is identical — the parent already decided `activeGrab`. The chip
  appears in the tray once the parent appends to `grabs`.
- CSS safety net: `.cm-reduced` class + a `@media (prefers-reduced-motion: reduce)`
  block both neutralize transitions/animations.

## How the parent (agent-4 / T-004) drives a grab

```
1. Build the outcome: grab = { id, zoneIndex, value, isPrize }  (RNG: Math.random() < 0.25 → prize)
2. setActiveGrab(grab)                         // visual starts animating
3. onGrabAnimationEnd → setGrabs(g => [...g, grab]); setActiveGrab(null)
4. Repeat until grabs.length >= REQUIRED_GRABS (8)
```

- DO NOT append to `grabs` before `onGrabAnimationEnd` fires, or you'll get a
  duplicate chip (held token + tray chip) on screen.
- Disable the "Drop Claw" button while `activeGrab !== null` to prevent overlap.
- `zones` should be a stable 4-element array; `zoneIndex` in `activeGrab` must be
  `0..3`. The single prize zone can be at any index — the visual marks whichever
  zone has `isPrize` gold.

## CSS class names the parent can rely on

- Root: `.claw-machine` (+ `cm-stage-<stage>`, `cm-animating`, `cm-reduced`)
- Cabinet: `.cm-cabinet`, `.cm-rail`, `.cm-glass`, `.cm-pit`, `.cm-pit-floor`, `.cm-chute`
- Claw: `.cm-carriage` (+`.cm-carriage-extended`), `.cm-cable`, `.cm-claw` (+`.cm-claw-closed`), `.cm-claw-arm`
- Zones: `.cm-zone`, `.cm-zone-prize`, `.cm-zone-zero`, `.cm-zone-active`
- Token (in flight): `.cm-token`, `.cm-token-gold`, `.cm-token-gray`, `.cm-token-flash`, `.cm-token-release`
- Tray: `.cm-tray`, `.cm-tray-chips`, `.cm-chip`, `.cm-chip-gold`, `.cm-chip-gray`, `.cm-tray-counts`

All styles are component-scoped in `ClawMachine.css`. No global/`index.css` edits.
Reuses the global `.sr-only` utility for the `aria-live="polite"` summary.

## Accessibility

- An `aria-live="polite"` `.sr-only` paragraph announces the latest grab + tray
  totals, e.g. `"Grabbed $0 from a zero zone. Tray: 2 of $20, 6 of $0."`
  All decorative SVG/CSS pieces are `aria-hidden`.

## Verification

- `npx tsc -b` → **no errors originating from `ClawMachine.tsx`**. Remaining
  errors are the expected `bothDropped → grabsComplete` migration in sibling
  files owned by T-001/T-004/T-005 (`Problem2WeightedAverage.tsx`,
  `agent3-checkers.test.ts`, `answerValidationMatrix.ts`).
- Dependency-free; SSR/jsdom-safe (guards `requestAnimationFrame` /
  `cancelAnimationFrame`; no `window`/`matchMedia` usage — `reducedMotion` is a prop).
