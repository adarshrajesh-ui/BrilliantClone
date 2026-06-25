# Handoff — agent-3-contrib (T-003)

Contribution-compression visual for Lesson 2 Problem 1 ("Claw Machine Expected Value").

## Files created (only these; no existing files touched)

- `src/components/visuals/ClawContributionBlocks.tsx`
- `src/components/visuals/ClawContributionBlocks.css`

All keyframes/styles live in `ClawContributionBlocks.css`. `index.css` was NOT edited.

## Exported names

```ts
export interface ClawContributionRow {
  payout: string      // '$20' | '$0'
  probability: string // '25%' | '75%'
  product: string     // '$5' | '$0'
  weight: number      // 0.25 | 0.75  (drives block width)
}

export interface ClawContributionBlocksProps {
  rows: ClawContributionRow[]
  evTotal: string     // '$5'
  revealed: boolean   // flip to true to trigger compress-in animation
  reducedMotion: boolean
}

export function ClawContributionBlocks(props: ClawContributionBlocksProps): JSX.Element
```

Implemented exactly per `interfaces.md` section 3. No extra required props.

## Behavior as implemented

- **Block widths = weight.** Each row renders as a horizontal block whose inline
  `width` is `weight * 100%` once compressed (e.g. $0 block → 75% wide, $20 block →
  25% wide), making "chance-space as area" visible. Width is clamped to `[0, 1]`.
- **Equation per block:** `payout × probability = product` (e.g. `$20 × 25% = $5`).
- **Color:** $20 row uses a **gold** striped block (`.ccb-block-gold`, matches the
  gold claw token); $0 row uses a **gray** striped block (`.ccb-block-gray`). The
  prize product gets `.ccb-product-prize` (amber) emphasis.
- **EV total:** below the rows, `EV = {evTotal}` (`.ccb-total`), with the value in
  large amber — visually emphasizing the small $20 zone carries the whole $5.
- **Pre-compression state** (`revealed === false`, motion enabled): faint idle
  blocks at full width, no EV value emphasis (`.ccb-precompress`).

## Animation

- When `revealed` flips `false → true` (and motion not reduced): blocks fade/scale
  and compress from full width into their weighted widths with a staggered delay
  (`animationDelay = index * 120ms`), then the EV total "arrives" (transfer feel).
  Keyframes: `ccb-block-compress`, `ccb-total-arrive`.
- The contribution-transfer convention from `ANIM.contributionTransfer` is honored
  in spirit; local keyframes are used so nothing in `index.css` is required.

## Reduced motion

- `reducedMotion === true`: renders the **final compressed state immediately** —
  weighted-width blocks + EV total, no transfer animation (`.ccb-reduced` kills
  animation/transition and snaps opacity/transform).
- CSS safety net: `@media (prefers-reduced-motion: reduce)` also disables
  animation/transition and forces the final state, independent of the prop.

## Accessibility

- `aria-live="polite"` sr-only line (`.ccb-sr-only`) summarizes once compressed:
  > "Twenty dollars times twenty-five percent is five dollars. Zero dollars times
  > seventy-five percent is zero. Expected value five dollars."
- Decorative blocks/equations/total are `aria-hidden="true"`; root has
  `aria-label="Expected value contribution breakdown"`.

## CSS class names (component-scoped, `ccb-` prefix)

`ccb-root`, `ccb-precompress`, `ccb-compressed`, `ccb-animate`, `ccb-reduced`,
`ccb-caption`, `ccb-blocks`, `ccb-block`, `ccb-block-gold`, `ccb-block-gray`,
`ccb-block-in`, `ccb-equation`, `ccb-payout`, `ccb-prob`, `ccb-op`, `ccb-product`,
`ccb-product-prize`, `ccb-total`, `ccb-total-in`, `ccb-total-label`,
`ccb-total-value`, `ccb-sr-only`.
Keyframes: `ccb-block-compress`, `ccb-total-arrive`.

## Note to agent-4 (T-004, parent composition)

Pass exactly:

```tsx
<ClawContributionBlocks
  rows={[
    { payout: '$20', probability: '25%', product: '$5', weight: 0.25 },
    { payout: '$0',  probability: '75%', product: '$0', weight: 0.75 },
  ]}
  evTotal="$5"
  revealed={viewedCompression}
  reducedMotion={reducedMotion}
/>
```

- Flip `revealed` to `true` when the learner taps "view compression" (this also
  sets `viewedCompression`, which feeds `grabsComplete = grabs.length >= REQUIRED_GRABS && viewedCompression`).
- The component is self-contained (only imports its own CSS + the `JSX` type),
  dependency-free, and jsdom/SSR-safe (no `window`/DOM access at module or render
  time).
- Root is `max-width: 360px`; drop it into the right task panel after the grab gate.

## Verification

`npx tsc -b` → **no type errors originate from `ClawContributionBlocks.tsx`**.
Remaining errors in `agent3-checkers.test.ts`, `Problem2WeightedAverage.tsx`, and
`answerValidationMatrix.ts` are the `bothDropped → grabsComplete` rename owned by
T-001/T-004/T-005 (not this task).
