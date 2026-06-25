# Handoff — agent-1-data (T-001: Card data model + datasets)

run-id: `2026-06-24-l3-card-table` · status: **DONE / green**

## Scope delivered

Created new folder `src/data/cards/` (only allowed path) with:

- `src/data/cards/deck.ts` — model, math, FULL_DECK, fixed datasets.
- `src/data/cards/index.ts` — `export * from './deck'`.
- `src/data/cards/deck.test.ts` — 15 vitest cases.

No files outside `src/data/cards/**` were touched.

## Exact export list + signatures

```ts
// types
export type CardRank = 'A'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'J'|'Q'|'K'
export type CardSuit = 'spades' | 'hearts' | 'diamonds' | 'clubs'
export interface Card { rank: CardRank; suit: CardSuit; value: number }
export interface ValueGroup {
  value: number; count: number; ranks: CardRank[]
  probability: number; contribution: number
}

// constant order helpers (extra, additive — not required by spec but exported)
export const RANKS: readonly CardRank[]   // A..K (A low)
export const SUITS: readonly CardSuit[]    // spades, hearts, diamonds, clubs

// functions
export function cardValue(rank: CardRank): number          // A=1, 2..10 num, J/Q/K=10
export function makeCard(rank: CardRank, suit: CardSuit): Card
export function buildValueGroups(cards: Card[]): ValueGroup[] // asc 1..10, omits empty
export function totalValue(cards: Card[]): number
export function expectedValue(cards: Card[]): number       // 0 for empty input

// deck + datasets
export const FULL_DECK: Card[]              // 52 cards, SUITS × RANKS order
export const FULL_DECK_GROUPS: ValueGroup[]
export const FULL_DECK_TOTAL: number        // 340
export const FULL_DECK_EV: number           // 340/52 = 6.538461538461538
export const DEALT_HAND_L3P2: Card[]        // 8 cards
export const DEALT_HAND_L3P2_GROUPS: ValueGroup[]
export const DEALT_HAND_L3P2_EV: number     // 6.5
export const MINI_DECK_L3P3: Card[]         // 10 cards
export const MINI_DECK_L3P3_GROUPS: ValueGroup[]
export const MINI_DECK_L3P3_EV: number      // 6.4
```

### Consumer notes (Phase 2 / agent-2)
- `buildValueGroups` returns groups **ascending by value**, omitting count-0
  values; `ranks` are in canonical rank order (e.g. value-10 → `['10','J','Q','K']`).
- `expectedValue([])` and `totalValue([])` return `0` (safe, no NaN).
- Ranks use the `'10'` string literal (never `'T'`).
- `FULL_DECK` order = suit-major: all spades A..K, then hearts, diamonds, clubs.
- Two extra additive exports (`RANKS`, `SUITS`) are available if visuals want
  canonical ordering; they are not in the binding spec but are non-breaking.

## Dataset tables (as implemented)

### FULL_DECK (52 cards) — `FULL_DECK_GROUPS`
| value | count | ranks | prob | contribution |
|---|---|---|---|---|
| 1 (A) | 4 | A | 4/52 | 4/52 |
| 2 | 4 | 2 | 4/52 | 8/52 |
| 3 | 4 | 3 | 4/52 | 12/52 |
| 4 | 4 | 4 | 4/52 | 16/52 |
| 5 | 4 | 5 | 4/52 | 20/52 |
| 6 | 4 | 6 | 4/52 | 24/52 |
| 7 | 4 | 7 | 4/52 | 28/52 |
| 8 | 4 | 8 | 4/52 | 32/52 |
| 9 | 4 | 9 | 4/52 | 36/52 |
| 10 | 16 | 10,J,Q,K | 16/52 | 160/52 |

Total = **340**, EV = 340/52 = 85/13 ≈ **6.5385**.

### DEALT_HAND_L3P2 (8 cards: 10♠,J♥,Q♣,K♦, 4♠,4♥, 2♣,2♦) — groups ascending
| value | count | prob | contribution |
|---|---|---|---|
| 2 | 2 | 1/4 | 0.5 |
| 4 | 2 | 1/4 | 1.0 |
| 10 | 4 | 1/2 | 5.0 |

EV = 0.5 + 1.0 + 5.0 = **6.5**.

### MINI_DECK_L3P3 (10 cards: A♠,A♥,A♣, 7♠,7♥,7♦, 10♠,J♥,Q♣,K♦) — groups ascending
| value | count | prob | contribution |
|---|---|---|---|
| 1 (A) | 3 | 3/10 | 0.3 |
| 7 | 3 | 3/10 | 2.1 |
| 10 | 4 | 4/10 | 4.0 |

EV = 0.3 + 2.1 + 4.0 = **6.4**.

## Verification results (repo root)

| command | result |
|---|---|
| `npx vitest run src/data/cards/deck.test.ts` | ✅ 1 file, **15 passed** |
| `npx tsc --noEmit` | ✅ exit 0, **no errors** (whole project clean) |
| `npx oxlint src/data/cards` | ✅ exit 0, **no warnings/errors** |

Tests cover: 52 unique cards; total 340; EV ≈ 6.5385 (toBeCloseTo) and = 85/13;
value-1 count 4 and value-10 count 16 (ranks 10,J,Q,K); buildValueGroups
ascending + omits empty + empty-input safe; probability/contribution math;
DEALT_HAND 8 cards / EV 6.5 / contributions [0.5,1.0,5.0]; MINI_DECK 10 cards /
EV 6.4 / counts [3,3,4] / contributions [0.3,2.1,4.0].

## Blockers / out-of-scope notes
- None. No deviations from interfaces.md Section 1.
- Did not commit (per rules).
