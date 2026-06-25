# Handoff — agent-2-visuals (T-002)

3D card-table visual library for the Lesson 3 revamp.

## Status: COMPLETE — type-check + lint green.

- `npx tsc --noEmit` → exit 0 (agent-1's `src/data/cards` is present, so the
  `import type` resolves cleanly; no blockers).
- `npx oxlint src/components/visuals/cards` → exit 0, no diagnostics.

## Files (ALLOWED path only: `src/components/visuals/cards/**`)

- `PlayingCard.tsx`
- `CardTable3D.tsx`
- `CardDealScene.tsx`  (centerpiece)
- `EvBadge.tsx`
- `cards.css`  (all styles + `@keyframes` + reduced-motion block)
- `index.ts`  (barrel)

No files outside the allowed folder were touched.

## Exports (consume via the barrel)

```ts
import {
  CardDealScene, EvBadge, PlayingCard, CardTable3D,
} from '../visuals/cards'
import type {
  CardDealSceneProps, EvBadgeProps, PlayingCardProps, CardTable3DProps,
} from '../visuals/cards'
```

Card data types are NOT redefined here — import them from agent-1:
`import type { Card, CardRank, CardSuit, ValueGroup } from '../../../data/cards'`.

## Prop types (implemented exactly per interfaces.md §2)

```ts
interface PlayingCardProps {
  rank: CardRank
  suit: CardSuit
  faceUp?: boolean        // default true
  highlighted?: boolean   // default false
  size?: 'sm' | 'md' | 'lg' // default 'md'
  className?: string
  style?: React.CSSProperties
}

interface CardTable3DProps {
  children: React.ReactNode
  caption?: string
  className?: string
}

interface CardDealSceneProps {
  cards: Card[]
  groups: ValueGroup[]
  totalCards?: number          // defaults to cards.length
  highlightValue?: number | null
  showCounts?: boolean         // default true
  showContributions?: boolean  // default false
  caption?: string
  autoPlay?: boolean           // default true
  reducedMotion?: boolean
}

interface EvBadgeProps {
  value: number
  label?: string               // default "Expected value"
  reducedMotion?: boolean
  className?: string
}
```

## Usage examples

L3 P1 (52-deck summary, emphasize the 10-group, EV badge on completion):

```tsx
<CardDealScene
  cards={FULL_DECK}
  groups={FULL_DECK_GROUPS}
  totalCards={52}
  highlightValue={10}
  showCounts
  caption="One draw from a full deck"
/>
{completed && <EvBadge value={6.54} />}
```

L3 P2 (8-card hand, contribution chips):

```tsx
<CardDealScene
  cards={DEALT_HAND_L3P2}
  groups={DEALT_HAND_L3P2_GROUPS}
  showCounts
  showContributions
/>
```

L3 P3 (10-card mini deck, highlight the active table row):

```tsx
<CardDealScene
  cards={MINI_DECK_L3P3}
  groups={MINI_DECK_L3P3_GROUPS}
  showCounts
  highlightValue={activeRowValue}
/>
```

Standalone card / table:

```tsx
<PlayingCard rank="K" suit="hearts" size="lg" highlighted />
<PlayingCard rank="7" suit="clubs" faceUp={false} />   {/* face-down → 3D flip */}
<CardTable3D caption="Dealer's felt"><PlayingCard rank="A" suit="spades" /></CardTable3D>
```

## How the count labels work (TRUE vs visual)

- `CardDealScene` groups the `cards` prop by `card.value` for the **visual** fan,
  but it **caps each column at 6 cards** (`VISUAL_CAP`). The `×N` count label and
  the `.sr-only` summary always use `group.count` from the `groups` prop — i.e.
  the TRUE count. So the 52-deck 10-group renders a small fan with a `+10` overflow
  chip and a `×16` count label.
- If a group's value is absent from the `cards` subset, the fan falls back to
  rendering the group's distinct `ranks` (so a column is never empty), while the
  count label still shows the true `group.count`.
- Contribution chips (when `showContributions`) show `group.contribution`
  trimmed to ≤2 decimals.

## Reduced motion

- Both `CardDealScene` and `EvBadge` read `usePrefersReducedMotion()` and accept
  an optional `reducedMotion` prop override (override wins when provided).
- `CardDealScene` treats `animated = autoPlay && !reduced`. When not animated it
  adds the `cds-static` root class (no deal/flip animation classes are applied).
- The DATA is never branched on motion: the same grouped columns, the same `×N`
  counts, the same `.sr-only` summary, and the same contribution chips render on
  both paths. Only the deal-in/flip/pop **presentation** differs.
- `cards.css` also has a global `@media (prefers-reduced-motion: reduce)` block
  that neutralizes the flip transition and all keyframe animations and pins each
  card to its final fan rotation — so OS-level reduced motion is honored even if
  a consumer forgets to thread the prop.

## Accessibility

- Every `CardDealScene` renders an `.sr-only` summary:
  `"<count> cards worth <value>; ...; <total> cards total."` (in ascending group
  order; `.sr-only` is the existing global class from `index.css`).
- Each `PlayingCard` has `role="img"` + an `aria-label` like
  `"K of hearts, worth 10"`. Decorative pips/suits are `aria-hidden`.
- `EvBadge` is `role="status" aria-live="polite"`.

## CSS class names exposed (all in `cards.css`)

- PlayingCard: `pc`, `pc-sm|md|lg`, `pc-red`, `pc-dark`, `pc-up`, `pc-down`,
  `pc-highlighted`, `pc-flip`, `pc-face`, `pc-front`, `pc-back`, `pc-corner`,
  `pc-corner-tl`, `pc-corner-br`, `pc-corner-rank`, `pc-corner-suit`, `pc-suit`,
  `pc-suit-big`, `pc-suit-court`, `pc-center`, `pc-center-ace`, `pc-center-court`,
  `pc-court-letter`, `pc-pips`, `pc-pip`, `pc-pip-flip`, `pc-value-badge`,
  `pc-back-pattern`, `pc-back-emblem`.
- CardTable3D: `ct3`, `ct3-stage`, `ct3-felt`, `ct3-felt-rail`, `ct3-felt-arc`,
  `ct3-surface`, `ct3-caption`.
- CardDealScene: `cds`, `cds-animated`, `cds-static`, `cds-deck`, `cds-deck-card`,
  `cds-deck-card-1|2|3`, `cds-columns`, `cds-column`, `cds-column-active`,
  `cds-column-value`, `cds-fan`, `cds-card`, `cds-more`, `cds-count`,
  `cds-contrib`. Custom prop: `--cds-fan` (per-card fan index).
- EvBadge: `evb`, `evb-animated`, `evb-reduced`, `evb-label`, `evb-value`.

All class names are namespaced (`pc-`, `ct3-`, `cds-`, `evb-`) to avoid
collisions; the only shared/global class used is `.sr-only`.

## Notes for Phase-2 consumers

- All components are presentation-only (no progression/persistence/answer-checking).
- `cards.css` is imported by each component, so importing any component pulls in
  the styles automatically — no separate CSS import needed.
- Card art is 100% CSS + inline SVG suit shapes (original); no external images.
- Suit colors: hearts/diamonds red (`#d6336c`), spades/clubs dark (`#1f2a44`).

## Blockers

None.
