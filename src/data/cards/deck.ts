// Canonical card model for the Lesson 3 card-dealing table. Pure and
// deterministic: no randomness, no shuffling. EV uses the Blackjack-style
// value mapping (A = 1, 2..10 numeric, J/Q/K = 10) and groups cards by that
// value to surface counts → probabilities → contributions → expected value.

export type CardRank =
  | 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'
export type CardSuit = 'spades' | 'hearts' | 'diamonds' | 'clubs'

export interface Card {
  rank: CardRank
  suit: CardSuit
  /** EV value: A=1, 2..10 = number, J/Q/K = 10. */
  value: number
}

export interface ValueGroup {
  /** 1..10. The 10-group folds 10, J, Q, K together. */
  value: number
  /** number of cards with this value in the source set. */
  count: number
  /** distinct ranks folded into this value group, in rank order. */
  ranks: CardRank[]
  /** count / sourceSize. */
  probability: number
  /** value * probability. */
  contribution: number
}

/** Ranks in canonical order (A low). */
export const RANKS: readonly CardRank[] = [
  'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K',
]

/** Suits in canonical deal order. */
export const SUITS: readonly CardSuit[] = [
  'spades', 'hearts', 'diamonds', 'clubs',
]

/** A=1, 2..10 numeric, J/Q/K = 10. */
export function cardValue(rank: CardRank): number {
  switch (rank) {
    case 'A':
      return 1
    case 'J':
    case 'Q':
    case 'K':
    case '10':
      return 10
    default:
      return Number(rank)
  }
}

export function makeCard(rank: CardRank, suit: CardSuit): Card {
  return { rank, suit, value: cardValue(rank) }
}

/** Standard ordered 52-card deck (4 suits × 13 ranks). */
export const FULL_DECK: Card[] = SUITS.flatMap((suit) =>
  RANKS.map((rank) => makeCard(rank, suit)),
)

/**
 * Group a card set by EV value (ascending, 1..10). Each group's probability is
 * count / cards.length and contribution is value * probability. Groups with
 * count 0 are omitted.
 */
export function buildValueGroups(cards: Card[]): ValueGroup[] {
  const size = cards.length
  const groups: ValueGroup[] = []

  for (let value = 1; value <= 10; value++) {
    const inGroup = cards.filter((card) => card.value === value)
    if (inGroup.length === 0) continue

    const ranks = RANKS.filter(
      (rank) => inGroup.some((card) => card.rank === rank),
    )
    const count = inGroup.length
    const probability = size === 0 ? 0 : count / size

    groups.push({
      value,
      count,
      ranks,
      probability,
      contribution: value * probability,
    })
  }

  return groups
}

/** Sum of card values. */
export function totalValue(cards: Card[]): number {
  return cards.reduce((sum, card) => sum + card.value, 0)
}

/** totalValue(cards) / cards.length. */
export function expectedValue(cards: Card[]): number {
  return cards.length === 0 ? 0 : totalValue(cards) / cards.length
}

// ---------------------------------------------------------------------------
// Fixed datasets (pinned by interfaces.md — do not change without updating it).
// ---------------------------------------------------------------------------

// L3 P1 — full 52-card deck.
export const FULL_DECK_GROUPS: ValueGroup[] = buildValueGroups(FULL_DECK)
export const FULL_DECK_TOTAL: number = totalValue(FULL_DECK) // 340
export const FULL_DECK_EV: number = expectedValue(FULL_DECK) // 340 / 52 ≈ 6.5385

// L3 P2 — 8-card dealt hand (deterministic order):
// 10♠, J♥, Q♣, K♦ (value 10 ×4), 4♠, 4♥ (value 4 ×2), 2♣, 2♦ (value 2 ×2).
export const DEALT_HAND_L3P2: Card[] = [
  makeCard('10', 'spades'),
  makeCard('J', 'hearts'),
  makeCard('Q', 'clubs'),
  makeCard('K', 'diamonds'),
  makeCard('4', 'spades'),
  makeCard('4', 'hearts'),
  makeCard('2', 'clubs'),
  makeCard('2', 'diamonds'),
]
export const DEALT_HAND_L3P2_GROUPS: ValueGroup[] = buildValueGroups(DEALT_HAND_L3P2)
export const DEALT_HAND_L3P2_EV: number = expectedValue(DEALT_HAND_L3P2) // 6.5

// L3 P3 — 10-card mini deck (deterministic order):
// A♠, A♥, A♣ (value 1 ×3), 7♠, 7♥, 7♦ (value 7 ×3),
// 10♠, J♥, Q♣, K♦ (value 10 ×4).
export const MINI_DECK_L3P3: Card[] = [
  makeCard('A', 'spades'),
  makeCard('A', 'hearts'),
  makeCard('A', 'clubs'),
  makeCard('7', 'spades'),
  makeCard('7', 'hearts'),
  makeCard('7', 'diamonds'),
  makeCard('10', 'spades'),
  makeCard('J', 'hearts'),
  makeCard('Q', 'clubs'),
  makeCard('K', 'diamonds'),
]
export const MINI_DECK_L3P3_GROUPS: ValueGroup[] = buildValueGroups(MINI_DECK_L3P3)
export const MINI_DECK_L3P3_EV: number = expectedValue(MINI_DECK_L3P3) // 6.4
