import { useMemo } from 'react'
import type { CourseMapView } from './types'
import { flattenHoles } from './courseMapModel'

interface CompactCourseMapProps {
  view: CourseMapView
  /** Invoked when a hole is activated (click / Enter / Space). */
  onSelectHole?: (problemId: string) => void
}

const VIEW_W = 240
const MARGIN_X = 30
const ROW_GAP = 46
const TOP = 30
const BOTTOM_PAD = 30

interface PlacedHole {
  problemId: string
  order: number
  title: string
  x: number
  y: number
  state: CourseMapView['zones'][number]['holes'][number]['state']
  isFinal: boolean
  isComplete: boolean
  isCurrent: boolean
}

/**
 * Compact winding golf-course map for the 5 zones × 3 holes = 15 hole chapter.
 * Each lesson zone is a serpentine row, so all 15 holes fit in a short, readable
 * card rather than a tall vertical strip. The column count is derived from the
 * widest zone, so the layout adapts if the per-lesson hole count ever changes.
 * Pure SVG/CSS, original artwork only.
 */
export function CompactCourseMap({ view, onSelectHole }: CompactCourseMapProps) {
  const { placed, fairway, viewH } = useMemo(() => {
    const zones = view.zones
    const columns = Math.max(...zones.map((z) => z.holes.length), 1)
    const usable = VIEW_W - MARGIN_X * 2
    const colGap = columns > 1 ? usable / (columns - 1) : 0

    const placedHoles: PlacedHole[] = []
    zones.forEach((zone, zIndex) => {
      const serpentine = zIndex % 2 === 1
      const count = zone.holes.length
      zone.holes.forEach((hole, hIndex) => {
        const colIndex = serpentine ? count - 1 - hIndex : hIndex
        placedHoles.push({
          problemId: hole.problemId,
          order: hole.order,
          title: hole.title,
          x: MARGIN_X + colIndex * colGap,
          y: TOP + zIndex * ROW_GAP,
          state: hole.state,
          isFinal: hole.isFinal,
          isComplete: hole.isComplete,
          isCurrent: hole.isCurrent,
        })
      })
    })

    let d = ''
    placedHoles.forEach((h, i) => {
      if (i === 0) {
        d = `M ${h.x} ${h.y}`
      } else {
        const prev = placedHoles[i - 1]
        const midY = (prev.y + h.y) / 2
        d += ` C ${prev.x} ${midY}, ${h.x} ${midY}, ${h.x} ${h.y}`
      }
    })

    const height = TOP + Math.max(0, zones.length - 1) * ROW_GAP + BOTTOM_PAD
    return { placed: placedHoles, fairway: d, viewH: height }
  }, [view])

  const holesFlat = flattenHoles(view)
  const completed = holesFlat.filter((h) => h.isComplete).length

  return (
    <div
      className="ccm"
      role="img"
      aria-label={`Course map: ${completed} of ${view.totalHoles} problems complete`}
    >
      <svg viewBox={`0 0 ${VIEW_W} ${viewH}`} className="ccm-svg" preserveAspectRatio="xMidYMin meet">
        <defs>
          <linearGradient id="ccm-grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="100%" stopColor="#052e16" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={VIEW_W} height={viewH} rx="18" fill="url(#ccm-grass)" />

        <path d={fairway} className="ccm-fairway-base" />
        <path d={fairway} className="ccm-fairway" />

        {placed.map((h) => {
          const r = h.isFinal ? 15 : 11
          const interactive = Boolean(onSelectHole)
          const activate = () => onSelectHole?.(h.problemId)
          return (
            <g
              key={h.problemId}
              className={`ccm-hole ccm-hole-${h.state}${h.isFinal ? ' ccm-hole-final' : ''}`}
              role={interactive ? 'button' : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-label={`Problem ${h.order}: ${h.title} — ${h.state}`}
              onClick={interactive ? activate : undefined}
              onKeyDown={
                interactive
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        activate()
                      }
                    }
                  : undefined
              }
            >
              <title>{`Problem ${h.order}: ${h.title} — ${h.state}`}</title>
              {interactive && <circle cx={h.x} cy={h.y} r="22" className="ccm-hit-area" />}
              {h.isCurrent && <circle cx={h.x} cy={h.y} r={r + 7} className="ccm-glow" />}
              <circle cx={h.x} cy={h.y} r={r} className="ccm-cup" />
              {h.state === 'future' && !h.isFinal && (
                <g className="ccm-flag" aria-hidden="true">
                  <line x1={h.x} y1={h.y - r} x2={h.x} y2={h.y - r - 8} />
                  <polygon points={`${h.x},${h.y - r - 8} ${h.x + 7},${h.y - r - 5.5} ${h.x},${h.y - r - 3}`} />
                </g>
              )}
              <text
                x={h.x}
                y={h.y}
                className="ccm-cup-text"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {h.isFinal ? '🏆' : h.isComplete ? '✓' : h.order}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
