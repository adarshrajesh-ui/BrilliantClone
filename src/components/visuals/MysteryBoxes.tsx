interface MysteryBox {
  id: number
  value: number
}

interface MysteryBoxesProps {
  boxes: MysteryBox[]
  revealedIds: number[]
  onReveal: (id: number) => void
  highlightValue?: number | null
}

export function MysteryBoxes({ boxes, revealedIds, onReveal, highlightValue }: MysteryBoxesProps) {
  return (
    <div className="mystery-box-grid">
      {boxes.map((box) => {
        const revealed = revealedIds.includes(box.id)
        const highlighted = highlightValue !== null && highlightValue !== undefined && box.value === highlightValue
        return (
          <button
            key={box.id}
            type="button"
            className={`mystery-box${revealed ? ' mystery-box-revealed' : ''}${highlighted ? ' mystery-box-highlight' : ''}`}
            onClick={() => !revealed && onReveal(box.id)}
            disabled={revealed}
            aria-label={revealed ? `Box ${box.id + 1}: $${box.value}` : `Mystery box ${box.id + 1}`}
          >
            {revealed ? `$${box.value}` : '?'}
          </button>
        )
      })}
    </div>
  )
}

export const MYSTERY_BOXES_P3: MysteryBox[] = [
  { id: 0, value: 12 },
  { id: 1, value: 6 },
  { id: 2, value: 6 },
  { id: 3, value: 0 },
  { id: 4, value: 0 },
  { id: 5, value: 0 },
]
