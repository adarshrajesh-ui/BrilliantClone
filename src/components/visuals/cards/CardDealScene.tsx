import type { CSSProperties, JSX } from 'react'
import type { Card, CardSuit, ValueGroup } from '../../../data/cards'
import { usePrefersReducedMotion } from '../../../features/learning-experience'
import { CardTable3D } from './CardTable3D'
import { PlayingCard } from './PlayingCard'
import './cards.css'

export interface CardDealSceneProps {
  /** Cards to deal/visualize (may be a representative subset for the 52-deck). */
  cards: Card[]
  /** Precomputed value groups to land into (source of the count labels). */
  groups: ValueGroup[]
  /** Total cards represented; defaults to cards.length. Use for the 52-deck. */
  totalCards?: number
  /** Emphasize one value group (e.g. the active table row / the 10-group). */
  highlightValue?: number | null
  /** Show per-group "×N" count labels. Default true. */
  showCounts?: boolean
  /** Show per-group contribution chips. Default false. */
  showContributions?: boolean
  /** Max real cards shown per value column; the count label remains authoritative. */
  visualCap?: number
  caption?: string
  /** Auto-play the deal on mount. Default true. */
  autoPlay?: boolean
  /** Optional reduced-motion override (else uses the hook). */
  reducedMotion?: boolean
}

/** Cap how many real cards are dealt per column by default; the "×N" label keeps the TRUE count. */
const DEFAULT_VISUAL_CAP = 3
/** Per-card stagger and the lead-in while the deck "lands". */
const DEAL_STEP_MS = 95
const DECK_LAND_MS = 280

const FALLBACK_SUITS: CardSuit[] = ['spades', 'hearts', 'diamonds', 'clubs']

/** Trim to at most 2 decimals without trailing zeros (e.g. 5 -> "5", 0.5 -> "0.5"). */
function formatNum(n: number): string {
  return Number(n.toFixed(2)).toString()
}

/** Real cards for a group, capped; falls back to the group's distinct ranks. */
function visualCardsFor(group: ValueGroup, byValue: Map<number, Card[]>, visualCap: number): Card[] {
  const real = byValue.get(group.value) ?? []
  if (real.length > 0) return real.slice(0, visualCap)
  return group.ranks.slice(0, visualCap).map((rank, i) => ({
    rank,
    suit: FALLBACK_SUITS[i % FALLBACK_SUITS.length],
    value: group.value,
  }))
}

/**
 * Centerpiece scene. The deck lands on the felt, cards deal out in isometric
 * arcs and flip up, then settle into one column per value group. Each column
 * shows a "×N" count label (the TRUE count from `groups`, even when only a
 * capped visual subset is dealt) and an optional contribution chip.
 *
 * Reduced motion never branches the DATA — only the presentation. The grouped
 * columns, counts, and labels are identical on both paths; the reduced path
 * simply renders the final state without arcs/flips.
 */
export function CardDealScene({
  cards,
  groups,
  totalCards,
  highlightValue = null,
  showCounts = true,
  showContributions = false,
  visualCap = DEFAULT_VISUAL_CAP,
  caption,
  autoPlay = true,
  reducedMotion,
}: CardDealSceneProps): JSX.Element {
  const hookReduced = usePrefersReducedMotion()
  const reduced = reducedMotion ?? hookReduced
  const animated = autoPlay && !reduced

  const total = totalCards ?? cards.length

  const byValue = new Map<number, Card[]>()
  for (const card of cards) {
    const list = byValue.get(card.value)
    if (list) list.push(card)
    else byValue.set(card.value, [card])
  }

  const summary =
    groups
      .map((g) => `${g.count} card${g.count === 1 ? '' : 's'} worth ${g.value}`)
      .join('; ') + `. ${total} cards total.`

  let dealIndex = 0

  return (
    <div className={`cds${animated ? ' cds-animated' : ' cds-static'}`}>
      <CardTable3D caption={caption}>
        <div className="cds-deck" aria-hidden="true">
          <span className="cds-deck-card cds-deck-card-3" />
          <span className="cds-deck-card cds-deck-card-2" />
          <span className="cds-deck-card cds-deck-card-1" />
        </div>

        <div className="cds-columns">
          {groups.map((group) => {
            const active = highlightValue === group.value
            const visual = visualCardsFor(group, byValue, visualCap)
            const hiddenExtra = group.count - visual.length
            return (
              <div
                key={group.value}
                className={`cds-column${active ? ' cds-column-active' : ''}`}
              >
                <span className="cds-column-value">{group.value}</span>

                <div className="cds-fan">
                  {visual.map((card, i) => {
                    const cardStyle = {
                      '--cds-fan': `${i - (visual.length - 1) / 2}`,
                      zIndex: i + 1,
                      ...(animated
                        ? { animationDelay: `${DECK_LAND_MS + dealIndex * DEAL_STEP_MS}ms` }
                        : {}),
                    } as CSSProperties & Record<string, string | number>
                    dealIndex += 1
                    return (
                      <PlayingCard
                        key={`${group.value}-${card.rank}-${card.suit}-${i}`}
                        rank={card.rank}
                        suit={card.suit}
                        size="sm"
                        highlighted={active}
                        className="cds-card"
                        style={cardStyle}
                      />
                    )
                  })}
                  {hiddenExtra > 0 ? (
                    <span className="cds-more" aria-hidden="true">
                      +{hiddenExtra}
                    </span>
                  ) : null}
                </div>

                {showCounts ? (
                  <span className="cds-count">×{group.count}</span>
                ) : null}

                {showContributions ? (
                  <span
                    className="cds-contrib"
                    aria-label={`Contribution ${formatNum(group.contribution)}`}
                  >
                    <span className="cds-contrib-label" aria-hidden="true">Contribution</span>
                    <span className="cds-contrib-value">{formatNum(group.contribution)}</span>
                  </span>
                ) : null}
              </div>
            )
          })}
        </div>
      </CardTable3D>

      <p className="sr-only">{summary}</p>
    </div>
  )
}
