# Handoff — agent-2-dicetray (T-002)

## Status: COMPLETE

Built the new presentational `DiceTray3D` component. Pure presentation + interaction
— it does not decide outcomes. The parent passes the settled faces via the `dice` prop.

## Files created (only these — nothing else touched)
- `src/components/visuals/DiceTray3D.tsx`
- `src/components/visuals/DiceTray3D.css`

## Final prop signature (matches interfaces.md §2 exactly)
```ts
export interface DiceTray3DProps {
  dice: { d1: number; d2: number } | null
  throwSeq: number
  lastSum: number | null
  totalThrows: number
  onThrow: () => void
  disabled: boolean
  reducedMotion: boolean
}
export function DiceTray3D(props: DiceTray3DProps): JSX.Element
```
Confirmed identical to the binding contract. Exported as a named export `DiceTray3D`
plus the `DiceTray3DProps` interface.

## How the parent uses it
- On each throw, bump `throwSeq` (used as a React `key` on the animated dice pair so the
  CSS animation replays).
- Pass `dice = { d1, d2 }` (the deterministic settled faces) and `lastSum = d1 + d2`.
- `disabled` should be `true` until the prediction is submitted; throws are blocked while disabled.
- Parent owns the `aria-live` result announcement — this component intentionally has NO live region.

## Class names (all `dt3-` prefixed, component-scoped, no global/shell overrides)
- Layout: `dt3-wrap`, `dt3-controls`, `dt3-rest-pair`, `dt3-rest-label`, `dt3-converge-note`
- Tray/board: `dt3-tray`, `dt3-tray-inner`, `dt3-tray-armed`, `dt3-tray-hover`, `dt3-tray-hint`, `dt3-sum-badge`
- Dice/cube: `dt3-die`, `dt3-die-a`, `dt3-die-b`, `dt3-spin`, `dt3-cube`, `dt3-face`,
  `dt3-face-front/back/right/left/top/bottom`, `dt3-pip-svg`, `dt3-pip-body`, `dt3-pip`
- Hand control: `dt3-hand`, `dt3-hand-dragging`, `dt3-hand-armed`, `dt3-hand-die`
- Animation state: `dt3-throwing` (animate) / `dt3-static` (reduced motion)

## 3D approach
- Each die is a real CSS 3D cube (`transform-style: preserve-3d`) with 6 pip faces.
  Opposite faces sum to 7 (front1/back6, right3/left4, top2/bottom5).
- `FACE_TRANSFORM` rotates the cube so the prop-provided face is brought to the front
  → the displayed face is always exactly `dice.d1` / `dice.d2`.
- Pips reuse a `PIP_LAYOUT` map mirroring `DiceThrowZone`'s. Side/back faces get slightly
  darker fills so the cube reads as 3D while tumbling.

## Throw interaction (any of these calls `onThrow()`, only when not `disabled`)
- Drag the hand dice into the tray and release (pointer capture; drop-inside hit-test on the tray rect).
- Tap the hand dice to arm, then tap the tray.
- Focus the hand dice button and press Enter or Space.

## Animation (keyed off `throwSeq`)
- Outer die element runs `dt3-arc` (lift → arc → drop → bounce → roll → settle, position/scale).
- Inner `.dt3-spin` runs `dt3-tumble-a` / `dt3-tumble-b` (rotation) that resolves to identity
  at 100%, so after the tumble the cube's settled face is shown. The two dice use slightly
  different keyframes + a 70ms delay on die B so they don't move in lockstep. ~900ms total.
- Decorative only — faces come from the `dice` prop, never randomized here.

## Reduced motion
- `reducedMotion === true` → animated dice get `dt3-static` (no arc/tumble); settled dice
  appear immediately.
- Also a CSS `@media (prefers-reduced-motion: reduce)` block disables all `dt3-throwing`
  animations and tray transitions as a system-level fallback.

## States
- `dice === null`: resting pair shown in the tray + contextual hint
  ("Drop the dice here to roll" / armed / disabled message).
- `disabled`: hand control disabled; rest label + aria-label say
  "Submit a prediction to start rolling".
- `lastSum != null`: sum badge `= N` in the tray corner.
- `totalThrows >= 50`: small note "The average sum is converging toward 7."

## Sizing / no-scroll fit
- `.dt3-tray` is `max-width: 360px`, `max-height: 24vh`; whole component is flexible and
  sits comfortably within the ~38vh workspace budget. Sizing driven by the parent container.

## Verification
- `npx tsc -b --noEmit` reports NO errors in `DiceTray3D.tsx`. The only errors in the build
  are in `Problem1LongRunAverage.tsx` / `problem-1.ts` (T-001 / integration scope — they
  still reference the old `diceFaceForThrow` / `dicePayoutForFace`), not this component.

## Blockers
None.
