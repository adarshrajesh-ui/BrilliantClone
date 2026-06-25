import { useEffect, useRef, useState } from 'react'
import './ClawMachine.css'

export interface ClawZone {
  id: string
  label: '$20' | '$0'
  value: 20 | 0
  isPrize: boolean
}

export interface ClawGrab {
  id: string
  zoneIndex: number
  value: 20 | 0
  isPrize: boolean
}

export interface ClawMachineProps {
  /** The 4 floor zones, left→right. Exactly one isPrize ($20); three are $0. */
  zones: ClawZone[]
  /** Completed grabs (drives the tray tokens + counts). */
  grabs: ClawGrab[]
  /** The grab currently animating; null when idle. */
  activeGrab: ClawGrab | null
  /** Called exactly once when the active grab's full cycle finishes. */
  onGrabAnimationEnd: () => void
  /** OS reduced-motion preference. When true the claw skips travel/cable motion. */
  reducedMotion: boolean
}

/**
 * Ordered animation stages for one grab. The claw rests over the chute, slides to
 * the target zone, drops in, closes, rises with the token, returns over the chute,
 * then releases the token into the tray.
 */
type Stage = 'idle' | 'travel' | 'drop' | 'grab' | 'rise' | 'toTray' | 'release' | 'reveal'

const SEQUENCE: Array<{ name: Stage; ms: number }> = [
  { name: 'travel', ms: 350 },
  { name: 'drop', ms: 325 },
  { name: 'grab', ms: 225 },
  { name: 'rise', ms: 325 },
  { name: 'toTray', ms: 350 },
  { name: 'release', ms: 275 },
]

/** Horizontal home/chute position (percent of cabinet width). */
const HOME_X = 88

function zoneCenter(zoneIndex: number, zoneCount: number): number {
  const count = zoneCount > 0 ? zoneCount : 1
  return ((zoneIndex + 0.5) / count) * 100
}

/** During these stages the claw sits over the target zone; otherwise over the chute. */
function isOverZone(stage: Stage): boolean {
  return stage === 'travel' || stage === 'drop' || stage === 'grab' || stage === 'rise'
}

/** The cable is extended only while the claw is dipping into the pit. */
function isCableExtended(stage: Stage): boolean {
  return stage === 'drop' || stage === 'grab'
}

/** A token is held by the claw from the grab through the trip back to the chute. */
function isHoldingToken(stage: Stage): boolean {
  return stage === 'grab' || stage === 'rise' || stage === 'toTray'
}

export function ClawMachine({
  zones,
  grabs,
  activeGrab,
  onGrabAnimationEnd,
  reducedMotion,
}: ClawMachineProps) {
  const [stage, setStage] = useState<Stage>('idle')

  // Keep the latest end callback in a ref so the animation effect does not
  // restart when the parent passes a fresh inline function each render.
  const endCbRef = useRef(onGrabAnimationEnd)
  useEffect(() => {
    endCbRef.current = onGrabAnimationEnd
  })

  // Guard against firing onGrabAnimationEnd more than once for a given grab.
  const endedForId = useRef<string | null>(null)

  const activeId = activeGrab ? activeGrab.id : null
  const activeZone = activeGrab ? activeGrab.zoneIndex : -1

  useEffect(() => {
    if (!activeGrab) {
      setStage('idle')
      return
    }
    if (endedForId.current === activeGrab.id) {
      return
    }

    let cancelled = false
    const timers: Array<ReturnType<typeof setTimeout>> = []
    let rafId: number | null = null

    const callEnd = () => {
      if (cancelled || endedForId.current === activeGrab.id) return
      endedForId.current = activeGrab.id
      endCbRef.current()
    }

    if (reducedMotion) {
      // No travel/cable motion: reveal the chosen zone, then resolve next frame.
      setStage('reveal')
      if (typeof requestAnimationFrame === 'function') {
        rafId = requestAnimationFrame(() => callEnd())
      } else {
        timers.push(setTimeout(callEnd, 0))
      }
    } else {
      setStage(SEQUENCE[0].name)
      let acc = 0
      for (let i = 1; i < SEQUENCE.length; i += 1) {
        acc += SEQUENCE[i - 1].ms
        const next = SEQUENCE[i].name
        timers.push(setTimeout(() => !cancelled && setStage(next), acc))
      }
      acc += SEQUENCE[SEQUENCE.length - 1].ms
      timers.push(setTimeout(callEnd, acc))
    }

    return () => {
      cancelled = true
      timers.forEach((t) => clearTimeout(t))
      if (rafId !== null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(rafId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, reducedMotion])

  const animating = activeGrab !== null && stage !== 'idle'
  const clawX = isOverZone(stage) && activeZone >= 0 ? zoneCenter(activeZone, zones.length) : HOME_X

  const tokenIsPrize = activeGrab ? activeGrab.isPrize : false
  const tokenValue = activeGrab ? activeGrab.value : 0
  const showHeldToken = animating && isHoldingToken(stage)
  const showReleaseToken = animating && stage === 'release'

  const prizeCount = grabs.reduce((n, g) => (g.isPrize ? n + 1 : n), 0)
  const zeroCount = grabs.length - prizeCount
  const last = grabs[grabs.length - 1]
  const summary = last
    ? `Grabbed ${last.isPrize ? '$20 from the prize zone' : '$0 from a zero zone'}. Tray: ${prizeCount} of $20, ${zeroCount} of $0.`
    : 'No grabs yet. Drop the claw to start.'

  const rootClass = [
    'claw-machine',
    `cm-stage-${stage}`,
    reducedMotion ? 'cm-reduced' : '',
    animating ? 'cm-animating' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClass}>
      <div className="cm-cabinet" aria-hidden="true">
        <div className="cm-rail" />

        <div
          className={`cm-carriage${isCableExtended(stage) ? ' cm-carriage-extended' : ''}`}
          style={{ left: `${clawX}%` }}
        >
          <div className="cm-cable" />
          <div className={`cm-claw${isHoldingToken(stage) ? ' cm-claw-closed' : ''}`}>
            <span className="cm-claw-arm cm-claw-arm-left" />
            <span className="cm-claw-arm cm-claw-arm-right" />
            <span className="cm-claw-mount" />
          </div>
          {showHeldToken && (
            <span
              className={`cm-token ${tokenIsPrize ? 'cm-token-gold cm-token-flash' : 'cm-token-gray'}`}
            >
              ${tokenValue}
            </span>
          )}
          {showReleaseToken && (
            <span
              className={`cm-token cm-token-release ${tokenIsPrize ? 'cm-token-gold' : 'cm-token-gray'}`}
            >
              ${tokenValue}
            </span>
          )}
        </div>

        <div className="cm-pit">
          <div className="cm-pit-floor">
            {zones.map((zone, i) => {
              const active = animating && i === activeZone
              return (
                <div
                  key={zone.id}
                  className={`cm-zone ${zone.isPrize ? 'cm-zone-prize' : 'cm-zone-zero'}${
                    active ? ' cm-zone-active' : ''
                  }`}
                >
                  <span className="cm-zone-label">{zone.label}</span>
                </div>
              )
            })}
          </div>
          <div className="cm-chute" />
        </div>

        <div className="cm-glass" />
      </div>

      <div className="cm-tray" aria-hidden="true">
        <span className="cm-tray-label">Payout tray</span>
        <div className="cm-tray-chips">
          {grabs.map((g) => (
            <span
              key={g.id}
              className={`cm-chip ${g.isPrize ? 'cm-chip-gold' : 'cm-chip-gray'}`}
            >
              ${g.value}
            </span>
          ))}
          {grabs.length === 0 && <span className="cm-tray-empty">empty</span>}
        </div>
        <div className="cm-tray-counts">
          <span className="cm-count cm-count-gold">{prizeCount} × $20</span>
          <span className="cm-count cm-count-gray">{zeroCount} × $0</span>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {summary}
      </p>
    </div>
  )
}
