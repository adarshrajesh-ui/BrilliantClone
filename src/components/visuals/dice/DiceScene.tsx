import type { JSX } from 'react'
import { usePrefersReducedMotion } from '../../../features/learning-experience'
import './dice-scene.css'

// Replicated from DiceTray3D's pip face on purpose: this static scene must not
// import or refactor the interactive long-run-average tray.
const PIP_LAYOUT: Record<number, Array<[number, number]>> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 26], [72, 26], [28, 50], [72, 50], [28, 74], [72, 74]],
}

/** A calm, varied default arrangement when explicit faces are not supplied. */
const DEFAULT_FACES = [3, 5, 2, 6, 4, 1]

function clampFace(face: number): number {
  if (!Number.isFinite(face)) {
    return 1
  }
  return Math.max(1, Math.min(6, Math.round(face)))
}

function DieFace({ face }: { face: number }): JSX.Element {
  const pips = PIP_LAYOUT[face] ?? PIP_LAYOUT[1]
  return (
    <svg viewBox="0 0 100 100" className="ds-pip-svg" aria-hidden="true">
      <rect x="4" y="4" width="92" height="92" rx="18" className="ds-pip-body" />
      {pips.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="8.5" className="ds-pip" />
      ))}
    </svg>
  )
}

export interface DiceSceneProps {
  /** How many dice to render. */
  count: number
  /** Optional explicit faces (1..6 each). Falls back to a fixed pleasant set. */
  faces?: number[]
  caption?: string
}

/**
 * Static, reduced-motion-friendly render of N dice as flat pip faces. Purely
 * decorative — the prompt text carries the actual numbers to reason about.
 */
export function DiceScene({ count, faces, caption }: DiceSceneProps): JSX.Element {
  const reduced = usePrefersReducedMotion()
  const safeCount = Math.max(1, Math.min(12, Math.round(count) || 1))
  const resolvedFaces = Array.from({ length: safeCount }, (_, i) =>
    clampFace(faces?.[i] ?? DEFAULT_FACES[i % DEFAULT_FACES.length]),
  )
  const summary = `${safeCount} ${safeCount === 1 ? 'die' : 'dice'} showing ${resolvedFaces.join(', ')}.`

  return (
    <div className={`ds-wrap${reduced ? ' ds-reduced' : ''}`}>
      <div className="ds-row" aria-hidden="true">
        {resolvedFaces.map((face, i) => (
          <span key={i} className="ds-die" style={{ animationDelay: `${i * 70}ms` }}>
            <DieFace face={face} />
          </span>
        ))}
      </div>
      {caption ? <p className="ds-caption">{caption}</p> : null}
      <p className="sr-only">{summary}</p>
    </div>
  )
}
