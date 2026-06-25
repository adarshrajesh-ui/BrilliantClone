import type { CSSProperties, JSX } from 'react'
import type { CardRank, CardSuit } from '../../../data/cards'
import './cards.css'

export interface PlayingCardProps {
  rank: CardRank
  suit: CardSuit
  /** Face up shows rank/pips/value badge; face down shows the original back. Default true. */
  faceUp?: boolean
  /** Emphasized state (e.g. the active value group). */
  highlighted?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /** Allow deal-arc transforms / animation-delay from the scene. */
  style?: CSSProperties
}

/** EV value of a rank: A = 1, 2..10 numeric, J/Q/K = 10. Presentation-only. */
function rankValue(rank: CardRank): number {
  if (rank === 'A') return 1
  if (rank === 'J' || rank === 'Q' || rank === 'K') return 10
  return Number(rank)
}

const RED_SUITS: ReadonlySet<CardSuit> = new Set<CardSuit>(['hearts', 'diamonds'])

const SUIT_LABEL: Record<CardSuit, string> = {
  spades: 'spades',
  hearts: 'hearts',
  diamonds: 'diamonds',
  clubs: 'clubs',
}

/** Pip coordinates (x%, y%) for spot cards. Bottom-half pips render inverted.
 * The outer corners are reserved for rank/suit labels and the EV value badge. */
const PIP_LAYOUT: Record<number, Array<[number, number]>> = {
  2: [[50, 24], [50, 76]],
  3: [[50, 24], [50, 50], [50, 76]],
  4: [[38, 30], [62, 30], [38, 70], [62, 70]],
  5: [[38, 30], [62, 30], [50, 50], [38, 70], [62, 70]],
  6: [[38, 28], [62, 28], [38, 50], [62, 50], [38, 72], [62, 72]],
  7: [[38, 26], [62, 26], [50, 39], [38, 52], [62, 52], [38, 74], [62, 74]],
  8: [[38, 26], [62, 26], [50, 39], [38, 52], [62, 52], [50, 61], [38, 74], [62, 74]],
  9: [
    [38, 24], [62, 24], [38, 42], [62, 42], [50, 50],
    [38, 58], [62, 58], [38, 76], [62, 76],
  ],
  10: [
    [38, 22], [62, 22], [50, 33], [38, 44], [62, 44],
    [38, 56], [62, 56], [50, 67], [38, 78], [62, 78],
  ],
}

/** Inline SVG suit shapes — original art, no external assets. Inherits currentColor. */
function SuitIcon({ suit, className }: { suit: CardSuit; className?: string }): JSX.Element {
  const cls = className ? `pc-suit ${className}` : 'pc-suit'
  switch (suit) {
    case 'hearts':
      return (
        <svg viewBox="0 0 100 100" className={cls} aria-hidden="true">
          <path d="M50 86C22 62 9 44 9 28 9 14 23 7 35 12c7 3 12 9 15 16 3-7 8-13 15-16 12-5 26 2 26 16 0 16-13 34-41 58Z" />
        </svg>
      )
    case 'diamonds':
      return (
        <svg viewBox="0 0 100 100" className={cls} aria-hidden="true">
          <path d="M50 6 88 50 50 94 12 50Z" />
        </svg>
      )
    case 'spades':
      return (
        <svg viewBox="0 0 100 100" className={cls} aria-hidden="true">
          <path d="M50 10C70 34 91 47 91 63c0 13-13 19-25 13-3-1-6-4-8-7 2 11 5 17 13 23H29c8-6 11-12 13-23-2 3-5 6-8 7-12 6-25 0-25-13 0-16 21-29 41-53Z" />
        </svg>
      )
    case 'clubs':
      return (
        <svg viewBox="0 0 100 100" className={cls} aria-hidden="true">
          <path d="M50 8c10 0 18 8 18 18 0 4-1 7-3 10 3-2 7-4 11-4 10 0 18 8 18 18s-8 18-18 18c-6 0-11-3-15-7 2 11 5 17 13 23H26c8-6 11-12 13-23-4 4-9 7-15 7-10 0-18-8-18-18s8-18 18-18c4 0 8 2 11 4-2-3-3-6-3-10 0-10 8-18 18-18Z" />
        </svg>
      )
  }
}

function FaceContent({ rank, suit }: { rank: CardRank; suit: CardSuit }): JSX.Element {
  const isCourt = rank === 'J' || rank === 'Q' || rank === 'K'
  if (rank === 'A') {
    return (
      <div className="pc-center pc-center-ace">
        <SuitIcon suit={suit} className="pc-suit-big" />
      </div>
    )
  }
  if (isCourt) {
    return (
      <div className="pc-center pc-center-court">
        <span className="pc-court-letter">{rank}</span>
        <SuitIcon suit={suit} className="pc-suit-court" />
      </div>
    )
  }
  const pips = PIP_LAYOUT[Number(rank)] ?? []
  return (
    <div className="pc-pips" aria-hidden="true">
      {pips.map(([x, y], i) => (
        <span
          key={i}
          className={`pc-pip${y > 50 ? ' pc-pip-flip' : ''}`}
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          <SuitIcon suit={suit} />
        </span>
      ))}
    </div>
  )
}

export function PlayingCard({
  rank,
  suit,
  faceUp = true,
  highlighted = false,
  size = 'md',
  className,
  style,
}: PlayingCardProps): JSX.Element {
  const red = RED_SUITS.has(suit)
  const value = rankValue(rank)
  const showValueBadge = rank === 'A' || rank === 'J' || rank === 'Q' || rank === 'K'
  const rootClass = [
    'pc',
    `pc-${size}`,
    `pc-rank-${rank.toLowerCase()}`,
    red ? 'pc-red' : 'pc-dark',
    faceUp ? 'pc-up' : 'pc-down',
    highlighted ? 'pc-highlighted' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={rootClass}
      style={style}
      role="img"
      aria-label={`${rank} of ${SUIT_LABEL[suit]}, worth ${value}`}
    >
      <div className="pc-flip">
        <div className="pc-face pc-front">
          <span className="pc-corner pc-corner-tl">
            <span className="pc-corner-rank">{rank}</span>
            <SuitIcon suit={suit} className="pc-corner-suit" />
          </span>

          <FaceContent rank={rank} suit={suit} />

          <span className="pc-corner pc-corner-br">
            <span className="pc-corner-rank">{rank}</span>
            <SuitIcon suit={suit} className="pc-corner-suit" />
          </span>

          {showValueBadge && (
            <span className="pc-value-badge" aria-hidden="true">
              {value}
            </span>
          )}
        </div>

        <div className="pc-face pc-back" aria-hidden="true">
          <span className="pc-back-pattern" />
          <span className="pc-back-emblem">
            <SuitIcon suit="spades" />
          </span>
        </div>
      </div>
    </div>
  )
}
