import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, JSX } from 'react'
import './JackpotSlot3D.css'

type Phase = 'idle' | 'spinning' | 'result'

/** CSS custom properties are allowed on the inline style object. */
type CssVars = CSSProperties & Record<string, string | number>

/** Full animated cycle: lever pull -> reels spin + shake -> settle -> reveal. */
const CYCLE_MS = 1200

const JACKPOT_VALUE = 25
const REEL_COUNT = 3
const COIN_COUNT = 18

/** Symbols that scroll past while a reel spins. */
const SPIN_SYMBOLS = ['7', '🍒', '🍋', '🔔', '💎', '🪙', '⭐']
/** Settled faces per result. Win = three matching 7s; lose = a mismatched line. */
const WIN_FACE = ['7', '7', '7']
const LOSE_FACE = ['🍒', '🔔', '🍋']
const IDLE_FACE = ['7', '🍒', '🔔']

interface Coin {
  tx: number
  ty: number
  delay: number
  rot: number
}

/** Deterministic coin-shower trajectories so renders are stable. */
const COINS: Coin[] = Array.from({ length: COIN_COUNT }, (_, i) => {
  const angle = (i / COIN_COUNT) * Math.PI * 2
  const dist = 55 + (i % 5) * 18
  return {
    tx: Math.round(Math.cos(angle) * dist),
    ty: -Math.round(120 + Math.abs(Math.sin(angle)) * 90 + (i % 4) * 18),
    delay: (i % 6) * 45,
    rot: (i % 2 === 0 ? 1 : -1) * (180 + (i % 3) * 120),
  }
})

const SMOKE = [0, 1, 2, 3, 4]
const BULBS = Array.from({ length: 9 }, (_, i) => i)

export interface JackpotSlot3DProps {
  animate: boolean
  runToken: number
  outcome: number | null
  onComplete?: () => void
  className?: string
}

export function JackpotSlot3D({
  animate,
  runToken,
  outcome,
  onComplete,
  className,
}: JackpotSlot3DProps): JSX.Element {
  const [phase, setPhase] = useState<Phase>('idle')
  const [shown, setShown] = useState<number | null>(null)

  // Read the freshest props inside the run effect without re-firing it when the
  // parent changes outcome/animate without bumping the token.
  const latest = useRef({ outcome, animate, onComplete })
  latest.current = { outcome, animate, onComplete }
  const prevToken = useRef(runToken)

  useEffect(() => {
    if (runToken === prevToken.current) {
      // Initial mount: no real token change, stay idle and do not call onComplete.
      return
    }
    prevToken.current = runToken

    const { outcome: out, animate: anim, onComplete: done } = latest.current
    if (out === null) return

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let raf: number | undefined

    if (!anim) {
      // Reduced motion: settle instantly, fire onComplete on the next frame.
      setShown(out)
      setPhase('result')
      raf = requestAnimationFrame(() => {
        if (cancelled) return
        done?.()
      })
    } else {
      setPhase('spinning')
      timer = setTimeout(() => {
        if (cancelled) return
        setShown(out)
        setPhase('result')
        done?.()
      }, CYCLE_MS)
    }

    return () => {
      cancelled = true
      if (timer !== undefined) clearTimeout(timer)
      if (raf !== undefined) cancelAnimationFrame(raf)
    }
    // Keyed strictly on runToken so onComplete fires exactly once per token bump.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runToken])

  const win = shown === JACKPOT_VALUE
  const faces =
    phase === 'result'
      ? win
        ? WIN_FACE
        : LOSE_FACE
      : shown === null
        ? IDLE_FACE
        : win
          ? WIN_FACE
          : LOSE_FACE

  const stateClass =
    phase === 'spinning'
      ? 'js3-spinning'
      : phase === 'result'
        ? win
          ? 'js3-win'
          : 'js3-lose'
        : 'js3-idle'

  const payoutText =
    phase === 'spinning' ? '· · ·' : shown === null ? '$ ?' : `$${shown}`

  const statusText =
    phase === 'result' ? (win ? 'Jackpot! $25' : 'No win. $0') : ''

  const rootClass = [
    'js3-root',
    stateClass,
    animate ? 'js3-animated' : 'js3-reduced',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClass}>
      <div className="js3-stage">
        <div className="js3-machine">
          <div className="js3-face js3-face-top" aria-hidden="true" />
          <div className="js3-face js3-face-right" aria-hidden="true" />

          <div className="js3-face js3-face-front">
            <div className="js3-marquee">
              <div className="js3-bulbs" aria-hidden="true">
                {BULBS.map((b) => (
                  <span
                    key={b}
                    className="js3-bulb"
                    style={{ animationDelay: `${b * 80}ms` }}
                  />
                ))}
              </div>
              <span className="js3-marquee-text">JACKPOT</span>
            </div>

            <div className="js3-reels">
              {Array.from({ length: REEL_COUNT }).map((_, i) => (
                <div className="js3-reel" key={i}>
                  <div className="js3-reel-window">
                    {phase === 'spinning' ? (
                      <div
                        className="js3-reel-strip"
                        style={{ animationDuration: `${0.26 + i * 0.06}s` }}
                      >
                        {SPIN_SYMBOLS.concat(SPIN_SYMBOLS).map((s, j) => (
                          <span className="js3-symbol" key={j}>
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span
                        key={`${runToken}-${i}`}
                        className="js3-symbol js3-symbol-settled"
                        style={{ animationDelay: `${i * 90}ms` }}
                      >
                        {faces[i]}
                      </span>
                    )}
                  </div>
                  <div className="js3-reel-shade" aria-hidden="true" />
                </div>
              ))}
            </div>

            <div className="js3-payout">
              <span className="js3-payout-label">PAYOUT</span>
              <span className="js3-payout-amount">{payoutText}</span>
            </div>

            <div className="js3-tray" aria-hidden="true">
              <div className="js3-tray-slot" />
            </div>

            {animate && phase === 'result' && win && (
              <div className="js3-flash" key={`flash-${runToken}`} aria-hidden="true" />
            )}

            {animate && phase === 'result' && win && (
              <div className="js3-coins" key={`coins-${runToken}`} aria-hidden="true">
                {COINS.map((c, i) => (
                  <span
                    key={i}
                    className="js3-coin"
                    style={
                      {
                        '--tx': `${c.tx}px`,
                        '--ty': `${c.ty}px`,
                        '--delay': `${c.delay}ms`,
                        '--rot': `${c.rot}deg`,
                      } as CssVars
                    }
                  >
                    🪙
                  </span>
                ))}
              </div>
            )}

            {animate && phase === 'result' && !win && (
              <div className="js3-smoke" key={`smoke-${runToken}`} aria-hidden="true">
                {SMOKE.map((s) => (
                  <span
                    key={s}
                    className="js3-puff"
                    style={{ '--i': s } as CssVars}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="js3-lever" aria-hidden="true">
            <div className="js3-lever-track" />
            <div className="js3-lever-arm">
              <div className="js3-lever-ball" />
            </div>
          </div>
        </div>
      </div>

      <span className="js3-status" role="status" aria-live="polite">
        {statusText}
      </span>
    </div>
  )
}
