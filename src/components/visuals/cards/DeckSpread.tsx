import type { CSSProperties, JSX } from 'react'
import { CardTable3D } from './CardTable3D'
import { PlayingCard } from './PlayingCard'
import './cards.css'

export interface DeckSpreadProps {
  /** How many face-down cards to fan out. Default ~12. */
  count?: number
  caption?: string
}

const DEFAULT_COUNT = 12

/**
 * Decorative face-down deck fanned across the felt. The composition is described
 * in the prompt text and a value table — these cards only set the scene, so they
 * reuse PlayingCard's existing back and are hidden from assistive tech.
 */
export function DeckSpread({ count = DEFAULT_COUNT, caption }: DeckSpreadProps): JSX.Element {
  const safeCount = Math.max(1, Math.min(24, Math.round(count) || DEFAULT_COUNT))
  const spreadDeg = Math.min(64, safeCount * 6)

  return (
    <div className="deck-spread-scene">
      <CardTable3D caption={caption}>
        <div className="deck-spread" aria-hidden="true">
          {Array.from({ length: safeCount }).map((_, i) => {
            const t = safeCount === 1 ? 0.5 : i / (safeCount - 1)
            const angle = (t - 0.5) * spreadDeg
            // Final fan angle + a per-card delay drive the "lay out flat" stagger
            // (see .deck-spread-card / @keyframes deck-lay-flat in cards.css).
            const style = {
              '--deck-angle': `${angle}deg`,
              '--deck-delay': `${i * 42}ms`,
              zIndex: i,
            } as CSSProperties
            return (
              <span key={i} className="deck-spread-card" style={style}>
                <PlayingCard rank="A" suit="spades" faceUp={false} size="sm" />
              </span>
            )
          })}
        </div>
      </CardTable3D>
    </div>
  )
}
