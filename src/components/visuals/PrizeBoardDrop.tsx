import { useRef, useState } from 'react'
import './PrizeBoardDrop.css'

export interface PrizeBoardPlacement {
  twenty: boolean
  zero: boolean
}

interface PrizeBoardDropProps {
  placed: PrizeBoardPlacement
  onPlace: (token: 'twenty' | 'zero') => void
  reducedMotion: boolean
}

const TOKENS: Array<{ id: 'twenty' | 'zero'; label: string; zone: string }> = [
  { id: 'twenty', label: '$20', zone: 'gold' },
  { id: 'zero', label: '$0', zone: 'gray' },
]

export function PrizeBoardDrop({ placed, onPlace, reducedMotion }: PrizeBoardDropProps) {
  const boardRef = useRef<HTMLDivElement>(null)
  const [dragToken, setDragToken] = useState<'twenty' | 'zero' | null>(null)
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null)

  const place = (token: 'twenty' | 'zero') => {
    if (placed[token]) return
    onPlace(token)
  }

  const meterClass = reducedMotion ? ' pbd-reduced' : ''

  return (
    <div className="pbd-wrap">
      <div className="pbd-board" ref={boardRef} aria-label="Prize board: small $20 zone over a large $0 zone">
        <div className={`pbd-zone pbd-zone-gold${placed.twenty ? ' pbd-zone-filled' : ''}`}>
          <span className="pbd-zone-label">$20 · 25% of board</span>
          {placed.twenty && <span className={`pbd-chip pbd-chip-gold${meterClass}`}>$20</span>}
        </div>
        <div className={`pbd-zone pbd-zone-gray${placed.zero ? ' pbd-zone-filled' : ''}`}>
          <span className="pbd-zone-label">$0 · 75% of board</span>
          {placed.zero && <span className={`pbd-chip pbd-chip-gray${meterClass}`}>$0</span>}
        </div>
      </div>

      <div className="pbd-tray">
        {TOKENS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`pbd-token pbd-token-${t.zone}${placed[t.id] ? ' pbd-token-used' : ''}${dragToken === t.id ? ' pbd-token-dragging' : ''}`}
            style={dragToken === t.id && offset ? { transform: `translate(${offset.x}px, ${offset.y}px) scale(1.1)` } : undefined}
            disabled={placed[t.id]}
            aria-label={`Place the ${t.label} token. Tap to drop it, or drag onto the board.`}
            onClick={() => place(t.id)}
            onPointerDown={(e) => {
              if (placed[t.id]) return
              e.currentTarget.setPointerCapture(e.pointerId)
              setDragToken(t.id)
              setOffset({ x: 0, y: 0 })
            }}
            onPointerMove={(e) => {
              if (dragToken !== t.id || !offset) return
              setOffset({ x: offset.x + e.movementX, y: offset.y + e.movementY })
            }}
            onPointerUp={(e) => {
              if (dragToken !== t.id) return
              setDragToken(null)
              setOffset(null)
              const rect = boardRef.current?.getBoundingClientRect()
              if (rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
                place(t.id)
              }
            }}
          >
            {placed[t.id] ? 'Placed ✓' : t.label}
          </button>
        ))}
      </div>

      <div className="pbd-meters">
        <div className="pbd-meter-row">
          <span className="pbd-meter-label">$20 × 25%</span>
          <div className="pbd-meter-track">
            <div className={`pbd-meter-fill pbd-meter-gold${placed.twenty ? ' pbd-meter-grown' : ''}${meterClass}`} style={{ width: placed.twenty ? '50%' : '0%' }} />
          </div>
          <span className="pbd-meter-value">{placed.twenty ? '+$5' : '—'}</span>
        </div>
        <div className="pbd-meter-row">
          <span className="pbd-meter-label">$0 × 75%</span>
          <div className="pbd-meter-track">
            <div className={`pbd-meter-fill pbd-meter-gray${placed.zero ? ' pbd-meter-grown' : ''}${meterClass}`} style={{ width: placed.zero ? '90%' : '0%' }} />
          </div>
          <span className="pbd-meter-value">{placed.zero ? '+$0' : '—'}</span>
        </div>
      </div>
    </div>
  )
}
