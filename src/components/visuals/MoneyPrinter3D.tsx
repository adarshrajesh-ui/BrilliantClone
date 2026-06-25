import { useEffect, useRef, useState } from 'react'
import type { JSX } from 'react'
import './MoneyPrinter3D.css'

export interface MoneyPrinter3DProps {
  /** false => reduced motion: instant reveal, no conveyor/lever motion. */
  animate: boolean
  /** Increment to trigger one animation cycle. */
  runToken: number
  /** Value to reveal (always 10 when running); null = idle. */
  outcome: number | null
  /** Called once when the reveal animation (or instant reveal) finishes. */
  onComplete?: () => void
  className?: string
}

type Phase = 'idle' | 'running' | 'result'

/**
 * Full cycle duration for the animated path: button press → lights on →
 * conveyor moves → $10 bill prints and slides into the tray. Kept calm and
 * identical on every run (this is the LOW-risk machine).
 */
const CYCLE_MS = 880

/** SVG of a stylised $10 bill that clearly reads "$10". */
function TenDollarBill(): JSX.Element {
  return (
    <svg viewBox="0 0 120 56" className="mp3-bill-svg" aria-hidden="true">
      <rect x="1" y="1" width="118" height="54" rx="6" className="mp3-bill-paper" />
      <rect x="6" y="6" width="108" height="44" rx="4" className="mp3-bill-border" />
      <circle cx="60" cy="28" r="15" className="mp3-bill-seal" />
      <text x="60" y="34" className="mp3-bill-amount" textAnchor="middle">
        $10
      </text>
      <text x="14" y="18" className="mp3-bill-corner" textAnchor="middle">
        10
      </text>
      <text x="106" y="46" className="mp3-bill-corner" textAnchor="middle">
        10
      </text>
    </svg>
  )
}

export function MoneyPrinter3D({
  animate,
  runToken,
  outcome,
  onComplete,
  className,
}: MoneyPrinter3DProps): JSX.Element {
  const [phase, setPhase] = useState<Phase>('idle')

  // Keep the latest callback in a ref so the cycle effect does not restart when
  // the parent passes a fresh inline function on each render.
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  })

  // Guard so onComplete fires exactly once per token change.
  const completedToken = useRef<number | null>(null)

  useEffect(() => {
    if (outcome === null) {
      setPhase('idle')
      return
    }
    if (completedToken.current === runToken) {
      return
    }

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null
    let rafId: number | null = null

    const finish = () => {
      if (cancelled || completedToken.current === runToken) return
      completedToken.current = runToken
      setPhase('result')
      onCompleteRef.current?.()
    }

    if (!animate) {
      // Reduced motion: reveal the bill in the tray instantly, resolve next tick.
      setPhase('result')
      if (typeof requestAnimationFrame === 'function') {
        rafId = requestAnimationFrame(() => finish())
      } else {
        timer = setTimeout(finish, 0)
      }
    } else {
      setPhase('running')
      timer = setTimeout(finish, CYCLE_MS)
    }

    return () => {
      cancelled = true
      if (timer !== null) clearTimeout(timer)
      if (rafId !== null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(rafId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runToken])

  const running = phase === 'running'
  const showBill = outcome !== null && phase !== 'idle'

  const rootClass = [
    'mp3',
    `mp3-phase-${phase}`,
    animate ? '' : 'mp3-reduced',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  const statusText =
    phase === 'result'
      ? 'Printed $10'
      : phase === 'running'
        ? 'Printing…'
        : 'Money printer ready'

  return (
    <div className={rootClass}>
      <div className="mp3-status" role="status" aria-live="polite">
        {statusText}
      </div>

      <div className="mp3-stage" aria-hidden="true">
        {/* 3D cabinet with depth side panel + top */}
        <div className="mp3-cabinet">
          <div className="mp3-cabinet-side" />
          <div className="mp3-cabinet-top" />
          <div className="mp3-cabinet-face">
            {/* Status lights */}
            <div className="mp3-lights">
              <span className="mp3-light mp3-light-a" />
              <span className="mp3-light mp3-light-b" />
              <span className="mp3-light mp3-light-c" />
            </div>

            <div className="mp3-screen">
              <span className="mp3-screen-text">$10 · EV $10</span>
            </div>

            {/* Glowing press button */}
            <div className="mp3-button-well">
              <div className="mp3-button">
                <span className="mp3-button-cap">PRINT</span>
              </div>
            </div>

            {/* Print slot the bill emerges from */}
            <div className="mp3-slot" />
          </div>
        </div>

        {/* Conveyor belt with moving segments */}
        <div className="mp3-conveyor">
          <div className="mp3-belt">
            <div className="mp3-belt-track">
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} className="mp3-belt-seg" />
              ))}
            </div>
          </div>
          <span className="mp3-roller mp3-roller-l" />
          <span className="mp3-roller mp3-roller-r" />

          {/* The printed $10 bill, slides along the belt into the tray */}
          {showBill && (
            <div
              key={runToken}
              className={`mp3-bill${running ? ' mp3-bill-printing' : ' mp3-bill-rest'}`}
            >
              <TenDollarBill />
            </div>
          )}
        </div>

        {/* Output tray */}
        <div className="mp3-tray">
          <div className="mp3-tray-lip" />
        </div>
      </div>
    </div>
  )
}
