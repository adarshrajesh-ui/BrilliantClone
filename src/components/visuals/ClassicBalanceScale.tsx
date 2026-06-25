import type { ReactNode } from 'react'

export const CLASSIC_SCALE_MAX_TILT = 18
export const CLASSIC_SCALE_TILT_PER_DOLLAR = 2.2

const PIVOT_X = 140
const PIVOT_Y = 68
const BEAM_LEFT = 32
const BEAM_RIGHT = 248
const STRING_DROP = 36
const PAN_W = 58

export function computeClassicScaleTilt(left: number, right: number) {
  const net = left - right
  const raw = -net * CLASSIC_SCALE_TILT_PER_DOLLAR
  const tilt = Math.max(-CLASSIC_SCALE_MAX_TILT, Math.min(CLASSIC_SCALE_MAX_TILT, raw))
  return {
    tilt,
    leftGrounded: tilt <= -CLASSIC_SCALE_MAX_TILT + 0.01,
    rightGrounded: tilt >= CLASSIC_SCALE_MAX_TILT - 0.01,
  }
}

function weightHeight(value: number): number {
  if (value <= 0) return 0
  return Math.max(16, Math.min(44, 10 + value * 3))
}

interface PanAssemblyProps {
  hookX: number
  tilt: number
  grounded: boolean
  children: ReactNode
}

function PanAssembly({ hookX, tilt, grounded, children }: PanAssemblyProps) {
  const panY = STRING_DROP
  return (
    <g transform={`translate(${hookX} ${PIVOT_Y + 5})`}>
      <line x1={0} y1={0} x2={-PAN_W / 2 + 6} y2={STRING_DROP} stroke="#94a3b8" strokeWidth={2} strokeLinecap="round" />
      <line x1={0} y1={0} x2={PAN_W / 2 - 6} y2={STRING_DROP} stroke="#94a3b8" strokeWidth={2} strokeLinecap="round" />
      <g transform={`translate(0 ${panY}) rotate(${-tilt})`}>
        <path
          d={`M ${-PAN_W / 2} 0 L ${-PAN_W / 2 + 4} 8 Q 0 14 ${PAN_W / 2 - 4} 8 L ${PAN_W / 2} 0 Z`}
          fill="#fbbf24"
          stroke="#d97706"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {grounded && (
          <ellipse cx={0} cy={9} rx={PAN_W / 2 - 4} ry={2.5} fill="rgba(92,61,46,0.2)" />
        )}
        {children}
      </g>
    </g>
  )
}

export function WeightBlock({ value, label, variant }: { value: number; label: string; variant: 'payout' | 'cost' }) {
  const h = weightHeight(value)
  if (h <= 0) return null
  const fill = variant === 'payout' ? '#22c55e' : '#ef4444'
  const stroke = variant === 'payout' ? '#16a34a' : '#dc2626'
  return (
    <g transform={`translate(0 ${-h})`}>
      <rect x={-20} y={0} width={40} height={h} rx={4} fill={fill} stroke={stroke} strokeWidth={1.5} />
      <text
        x={0}
        y={h / 2 + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#fff"
        fontSize={11}
        fontWeight={700}
        fontFamily="system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

export function CostTapButton({ cost, onClick }: { cost: number; onClick: () => void }) {
  return (
    <foreignObject x={-32} y={-24} width={64} height={24}>
      <button type="button" className="classic-scale-weight-btn" onClick={onClick} aria-label={`Tap to subtract cost $${cost}`}>
        <span className="classic-scale-btn-full">Tap −${cost}</span>
        <span className="classic-scale-btn-short" aria-hidden="true">−${cost}</span>
      </button>
    </foreignObject>
  )
}

export interface ClassicBalanceScaleProps {
  leftValue: number
  rightValue: number
  rightTiltValue?: number
  leftLabel?: string
  rightContent?: ReactNode
  className?: string
  id?: string
}

export function ClassicBalanceScale({
  leftValue,
  rightValue,
  rightTiltValue,
  leftLabel,
  rightContent,
  className = '',
  id,
}: ClassicBalanceScaleProps) {
  const tiltRight = rightTiltValue ?? rightValue
  const { tilt, leftGrounded, rightGrounded } = computeClassicScaleTilt(leftValue, tiltRight)
  const leftDisplay = leftLabel ?? (leftValue > 0 ? `$${leftValue}` : '')

  const defaultRight =
    rightValue > 0 ? (
      <WeightBlock value={rightValue} label={`$${rightValue}`} variant="cost" />
    ) : null

  return (
    <div className={`classic-scale${className ? ` ${className}` : ''}`} id={id}>
      <svg
        className="classic-scale-svg"
        viewBox="0 0 280 210"
        role="img"
        aria-label={`Balance scale: ${leftValue} on the left, ${rightValue} on the right`}
      >
        {/* Stand — base + pole */}
        <rect x={96} y={198} width={88} height={10} rx={2} fill="#5c3d2e" />
        <rect x={86} y={190} width={108} height={8} rx={2} fill="#5c3d2e" />
        <rect x={76} y={182} width={128} height={8} rx={2} fill="#5c3d2e" />
        <rect x={133} y={74} width={14} height={110} rx={2} fill="#5c3d2e" />
        <path d="M 129 74 L 151 74 L 147 66 L 133 66 Z" fill="#5c3d2e" />

        {/* Pivot knob */}
        <circle cx={PIVOT_X} cy={PIVOT_Y} r={9} fill="#5c3d2e" stroke="#7a523f" strokeWidth={2} />

        {/* Rotating beam + pans */}
        <g className="classic-scale-rotator" transform={`rotate(${tilt} ${PIVOT_X} ${PIVOT_Y})`}>
          <rect x={BEAM_LEFT} y={PIVOT_Y - 4} width={BEAM_RIGHT - BEAM_LEFT} height={8} rx={4} fill="#5c3d2e" />
          <circle cx={BEAM_LEFT} cy={PIVOT_Y} r={6} fill="#5c3d2e" stroke="#7a523f" strokeWidth={1.5} />
          <circle cx={BEAM_RIGHT} cy={PIVOT_Y} r={6} fill="#5c3d2e" stroke="#7a523f" strokeWidth={1.5} />

          <PanAssembly hookX={BEAM_LEFT} tilt={tilt} grounded={leftGrounded}>
            {leftValue > 0 && (
              <WeightBlock value={leftValue} label={leftDisplay} variant="payout" />
            )}
          </PanAssembly>

          <PanAssembly hookX={BEAM_RIGHT} tilt={tilt} grounded={rightGrounded}>
            {rightContent ?? defaultRight}
          </PanAssembly>
        </g>
      </svg>
    </div>
  )
}
