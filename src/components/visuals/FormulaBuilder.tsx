interface FormulaBuilderProps {
  slots: [string, string, string, string]
  selectedCard: string | null
  cards: string[]
  onSelectCard: (card: string) => void
  onPlaceSlot: (index: 0 | 1 | 2 | 3) => void
  onClearSlot: (index: 0 | 1 | 2 | 3) => void
}

export function FormulaBuilder({
  slots,
  selectedCard,
  cards,
  onSelectCard,
  onPlaceSlot,
  onClearSlot,
}: FormulaBuilderProps) {
  const used = new Set(slots.filter(Boolean))

  return (
    <div className="formula-builder">
      <p className="formula-display">
        EV ={' '}
        {[0, 1, 2, 3].map((i) => (
          <span key={i}>
            <button
              type="button"
              className={`formula-slot${slots[i as 0 | 1 | 2 | 3] ? ' formula-slot-filled' : ''}${selectedCard ? ' formula-slot-ready' : ''}`}
              onClick={() => {
                const idx = i as 0 | 1 | 2 | 3
                if (selectedCard) {
                  onPlaceSlot(idx)
                } else if (slots[idx]) {
                  onClearSlot(idx)
                }
              }}
            >
              {slots[i as 0 | 1 | 2 | 3] || '___'}
            </button>
            {i === 1 && ' + '}
            {i === 3 && ''}
          </span>
        ))}
      </p>
      <p className="section-note">Tap a card, then tap a slot to place it. Tap a filled slot to clear.</p>
      <div className="card-bank">
        {cards.map((card) => (
          <button
            key={card}
            type="button"
            className={`choice-btn${selectedCard === card ? ' choice-btn-selected' : ''}${used.has(card) ? ' choice-btn-used' : ''}`}
            onClick={() => onSelectCard(card)}
            disabled={used.has(card)}
          >
            {card}
          </button>
        ))}
      </div>
    </div>
  )
}
