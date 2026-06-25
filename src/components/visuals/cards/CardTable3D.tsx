import type { JSX, ReactNode } from 'react'
import './cards.css'

export interface CardTable3DProps {
  children: ReactNode
  caption?: string
  className?: string
}

/**
 * Isometric 3D felt table surface. Provides the perspective context (a tilted
 * felt plane) and renders its children on the playing surface, with an optional
 * caption beneath. Presentation-only.
 */
export function CardTable3D({ children, caption, className }: CardTable3DProps): JSX.Element {
  const rootClass = className ? `ct3 ${className}` : 'ct3'
  return (
    <div className={rootClass}>
      <div className="ct3-stage">
        <div className="ct3-felt" aria-hidden="true">
          <span className="ct3-felt-rail" />
          <span className="ct3-felt-arc" />
        </div>
        <div className="ct3-surface">{children}</div>
      </div>
      {caption ? <p className="ct3-caption">{caption}</p> : null}
    </div>
  )
}
