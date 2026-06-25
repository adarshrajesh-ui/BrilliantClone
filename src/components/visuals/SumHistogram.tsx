import './SumHistogram.css'

export interface SumHistogramProps {
  /** counts[i] = frequency of sum (i + 2). MUST be length 11 (sums 2..12). */
  counts: number[]
  /** Optional caption. Default: 'Distribution of sums'. */
  label?: string
}

const SUMS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const PEAK_SUM = 7

export function SumHistogram({ counts, label = 'Distribution of sums' }: SumHistogramProps) {
  const width = 320
  const height = 160
  const padLeft = 24
  const padRight = 12
  const padTop = 14
  const padBottom = 24

  // Defensive: pad/clamp to length 11 so a short array never crashes.
  const safeCounts = SUMS.map((_, i) => {
    const v = counts?.[i]
    return Number.isFinite(v) && v! > 0 ? (v as number) : 0
  })
  const maxCount = safeCounts.reduce((m, c) => Math.max(m, c), 0)
  const total = safeCounts.reduce((sum, c) => sum + c, 0)

  const plotWidth = width - padLeft - padRight
  const plotHeight = height - padTop - padBottom
  const baselineY = height - padBottom

  const slot = plotWidth / SUMS.length
  const barWidth = slot * 0.62
  const peakX = padLeft + (SUMS.indexOf(PEAK_SUM) + 0.5) * slot

  const isEmpty = maxCount === 0

  const ariaLabel = isEmpty
    ? 'Empty histogram of two-dice sums from 2 to 12; no rolls yet.'
    : `Histogram of two-dice sums from 2 to 12 over ${total} rolls, peaking at 7.`

  return (
    <div className="sh-wrap">
      <p className="sh-caption">{label}</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="sh-svg" role="img" aria-label={ariaLabel}>
        {/* y-axis + baseline */}
        <line x1={padLeft} y1={padTop} x2={padLeft} y2={baselineY} className="sh-axis" />
        <line x1={padLeft} y1={baselineY} x2={width - padRight} y2={baselineY} className="sh-axis" />

        {isEmpty ? (
          <text x={width / 2} y={padTop + plotHeight / 2} textAnchor="middle" className="sh-empty-text">
            Roll the dice to build the distribution.
          </text>
        ) : (
          <line
            x1={peakX}
            y1={padTop}
            x2={peakX}
            y2={baselineY}
            className="sh-peak-marker"
            strokeDasharray="3 3"
          />
        )}

        {SUMS.map((s, i) => {
          const cx = padLeft + (i + 0.5) * slot
          const barH = isEmpty ? 0 : (safeCounts[i] / maxCount) * plotHeight
          const barY = baselineY - barH
          const isPeak = s === PEAK_SUM
          return (
            <g key={s}>
              {barH > 0 && (
                <rect
                  x={cx - barWidth / 2}
                  y={barY}
                  width={barWidth}
                  height={barH}
                  rx={2}
                  className={isPeak ? 'sh-bar sh-bar-peak' : 'sh-bar'}
                />
              )}
              <text
                x={cx}
                y={baselineY + 12}
                textAnchor="middle"
                className={isPeak ? 'sh-tick sh-tick-peak' : 'sh-tick'}
              >
                {s}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
