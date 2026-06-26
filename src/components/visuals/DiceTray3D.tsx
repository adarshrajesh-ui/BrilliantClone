import { useRef, useState } from 'react'
import type { JSX } from 'react'
import './DiceTray3D.css'

const PIP_LAYOUT: Record<number, Array<[number, number]>> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 26], [72, 26], [28, 50], [72, 50], [28, 74], [72, 74]],
}

/** Face → cube orientation that brings that face to the front. */
const FACE_TRANSFORM: Record<number, string> = {
  1: 'rotateX(0deg) rotateY(0deg)',
  2: 'rotateX(-90deg)',
  3: 'rotateY(-90deg)',
  4: 'rotateY(90deg)',
  5: 'rotateX(90deg)',
  6: 'rotateY(180deg)',
}

/** Which die-face value sits on each cube side. Opposite sides sum to 7. */
const CUBE_FACES: Array<{ side: string; face: number }> = [
  { side: 'dt3-face-front', face: 1 },
  { side: 'dt3-face-back', face: 6 },
  { side: 'dt3-face-right', face: 3 },
  { side: 'dt3-face-left', face: 4 },
  { side: 'dt3-face-top', face: 2 },
  { side: 'dt3-face-bottom', face: 5 },
]

function PipFace({ face }: { face: number }) {
  const pips = PIP_LAYOUT[face] ?? PIP_LAYOUT[1]
  return (
    <svg viewBox="0 0 100 100" className="dt3-pip-svg" aria-hidden="true">
      <rect x="4" y="4" width="92" height="92" rx="18" className="dt3-pip-body" />
      {pips.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="8.5" className="dt3-pip" />
      ))}
    </svg>
  )
}

function Cube({ face }: { face: number }) {
  return (
    <div className="dt3-cube" style={{ transform: FACE_TRANSFORM[face] ?? FACE_TRANSFORM[1] }}>
      {CUBE_FACES.map(({ side, face: f }) => (
        <div key={side} className={`dt3-face ${side}`}>
          <PipFace face={f} />
        </div>
      ))}
    </div>
  )
}

export interface DiceTray3DProps {
  /** Settled faces after the most recent throw, or null before any throw. */
  dice: { d1: number; d2: number } | null
  /** Bumped by the parent on every throw to re-trigger the throw animation. */
  throwSeq: number
  /** Sum of the most recent throw, for the result badge. */
  lastSum: number | null
  /** Total rolls so far (drives the "converging toward 7" note). */
  totalThrows: number
  /** Called when the learner throws (drag dice into tray, tap, or Enter). */
  onThrow: () => void
  disabled: boolean
  reducedMotion: boolean
}

export function DiceTray3D({
  dice,
  throwSeq,
  lastSum,
  totalThrows,
  onThrow,
  disabled,
  reducedMotion,
}: DiceTray3DProps): JSX.Element {
  const trayRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [armed, setArmed] = useState(false)
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null)

  const fire = () => {
    if (disabled) return
    setArmed(false)
    onThrow()
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    setOffset({ x: 0, y: 0 })
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging || !offset) return
    setOffset({ x: e.movementX + offset.x, y: e.movementY + offset.y })
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return
    setDragging(false)
    setOffset(null)
    const tray = trayRef.current?.getBoundingClientRect()
    if (
      tray &&
      e.clientX >= tray.left &&
      e.clientX <= tray.right &&
      e.clientY >= tray.top &&
      e.clientY <= tray.bottom
    ) {
      fire()
    }
  }

  const d1 = dice?.d1 ?? 1
  const d2 = dice?.d2 ?? 4
  const animClass = reducedMotion ? 'dt3-static' : 'dt3-throwing'
  const restLabel = disabled
    ? 'Dice are locked'
    : armed
      ? 'Dice ready — tap the tray to roll'
      : 'Hold the dice, drag them over the tray, then release to throw'

  return (
    <div className="dt3-wrap">
      <div
        ref={trayRef}
        className={`dt3-tray${armed ? ' dt3-tray-armed' : ''}${dragging ? ' dt3-tray-hover' : ''}`}
        onClick={() => {
          if (armed) fire()
        }}
        role="button"
        tabIndex={-1}
        aria-label="Dice tray"
      >
        <div className="dt3-tray-inner">
          {dice === null ? (
            <div className="dt3-rest-pair" aria-hidden="true">
              <div className="dt3-die"><Cube face={1} /></div>
              <div className="dt3-die"><Cube face={4} /></div>
            </div>
          ) : (
            <div key={throwSeq} className="dt3-rest-pair" aria-hidden="true">
              <div className={`dt3-die dt3-die-a ${animClass}`}>
                <div className="dt3-spin">
                  <Cube face={d1} />
                </div>
              </div>
              <div className={`dt3-die dt3-die-b ${animClass}`}>
                <div className="dt3-spin">
                  <Cube face={d2} />
                </div>
              </div>
            </div>
          )}

          {dice === null && (
            <p className="dt3-tray-hint">
              {disabled
                ? 'Dice are locked'
                : armed
                  ? 'Tap here to roll the dice'
                  : 'Release here to throw'}
            </p>
          )}

          {lastSum !== null && (
            <span className="dt3-sum-badge">= {lastSum}</span>
          )}
        </div>
      </div>

      <div className="dt3-controls">
        <button
          type="button"
          className={`dt3-hand${dragging ? ' dt3-hand-dragging' : ''}${armed ? ' dt3-hand-armed' : ''}`}
          style={offset ? { transform: `translate(${offset.x}px, ${offset.y}px) scale(1.06)` } : undefined}
          disabled={disabled}
          aria-label={
            disabled
              ? 'Dice are locked.'
              : dice === null
                ? 'Two dice. Press Enter or Space to roll, or drag them into the tray.'
                : `Two dice showing ${d1} and ${d2}, sum ${d1 + d2}. Press Enter or Space to roll again.`
          }
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={() => {
            if (!disabled) setArmed((a) => !a)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              fire()
            }
          }}
        >
          <span className="dt3-hand-die"><Cube face={d1} /></span>
          <span className="dt3-hand-die"><Cube face={d2} /></span>
        </button>
        <p className="dt3-rest-label">{restLabel}</p>
      </div>

      {totalThrows >= 50 && (
        <p className="dt3-converge-note" aria-hidden="true">
          The average sum is converging toward 7.
        </p>
      )}
    </div>
  )
}
