import './SumHistogram.css'

export interface SumHistogramProps {
  /** counts[i] = frequency of sum (i + 2). MUST be length 11 (sums 2..12). */
  counts: number[]
  /** Optional caption. Default: 'Distribution of sums'. */
  label?: string
  /**
   * When true (e.g. after the learner has answered), also mark the theoretical
   * peak at 7. Keep false during exploration so the answer is not revealed
   * before the learner has reasoned about it.
   */
  revealPeak?: boolean
  /** Empty-state text shown before any rolls exist. */
  emptyMessage?: string
}

const SUMS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const THEORETICAL_PEAK_SUM = 7

/** Join a small list of sums for prose, e.g. [8] → "8", [8,9] → "8 and 9". */
function formatSumList(sums: number[]): string {
  if (sums.length === 1) return String(sums[0])
  if (sums.length === 2) return `${sums[0]} and ${sums[1]}`
  return `${sums.slice(0, -1).join(', ')}, and ${sums[sums.length - 1]}`
}

export function SumHistogram({
  counts,
  label = 'Distribution of sums',
  revealPeak = false,
  emptyMessage = 'No sums yet. Each roll adds one bar.',
}: SumHistogramProps) {
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
  const isEmpty = maxCount === 0

  // Observed leader(s): the most frequent sum(s) SO FAR, derived from the actual
  // data. Never a hard-coded value, so nothing is highlighted before rolls and
  // the theoretical answer (7) is not leaked early. Ties highlight every leader.
  const leaderSums = isEmpty ? [] : SUMS.filter((_, i) => safeCounts[i] === maxCount)
  const leaderSet = new Set(leaderSums)

  const plotWidth = width - padLeft - padRight
  const plotHeight = height - padTop - padBottom
  const baselineY = height - padBottom

  const slot = plotWidth / SUMS.length
  const barWidth = slot * 0.62
  const peakX = padLeft + (SUMS.indexOf(THEORETICAL_PEAK_SUM) + 0.5) * slot

  const observation = isEmpty
    ? ''
    : leaderSums.length === 1
      ? `So far, ${leaderSums[0]} has appeared most often.`
      : leaderSums.length <= 3
        ? `So far, ${formatSumList(leaderSums)} are tied for most common.`
        : 'So far, several sums are tied for most common.'

  const leaderAria = isEmpty
    ? ''
    : leaderSums.length === 1
      ? ` ${leaderSums[0]} has appeared most often so far.`
      : leaderSums.length <= 3
        ? ` ${formatSumList(leaderSums)} are tied for most common so far.`
        : ' Several sums are tied for most common so far.'

  const ariaLabel = isEmpty
    ? 'Empty histogram of two-dice sums from 2 to 12; no rolls yet.'
    : revealPeak
      ? `Histogram of observed two-dice sums from 2 to 12 over ${total} rolls.${leaderAria} Theoretical peak at 7 marked.`
      : `Histogram of observed two-dice sums from 2 to 12 over ${total} rolls.${leaderAria}`

  return (
    <div className="sh-wrap">
      <p className="sh-caption">{label}</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="sh-svg" role="img" aria-label={ariaLabel}>
        {/* y-axis + baseline */}
        <line x1={padLeft} y1={padTop} x2={padLeft} y2={baselineY} className="sh-axis" />
        <line x1={padLeft} y1={baselineY} x2={width - padRight} y2={baselineY} className="sh-axis" />

        {isEmpty ? (
          <text x={width / 2} y={padTop + plotHeight / 2} textAnchor="middle" className="sh-empty-text">
            {emptyMessage}
          </text>
        ) : revealPeak ? (
          <line
            x1={peakX}
            y1={padTop}
            x2={peakX}
            y2={baselineY}
            className="sh-peak-marker"
            strokeDasharray="3 3"
          />
        ) : null}

        {SUMS.map((s, i) => {
          const cx = padLeft + (i + 0.5) * slot
          const barH = isEmpty ? 0 : (safeCounts[i] / maxCount) * plotHeight
          const barY = baselineY - barH
          const isLeader = leaderSet.has(s)
          return (
            <g key={s}>
              {barH > 0 && (
                <rect
                  x={cx - barWidth / 2}
                  y={barY}
                  width={barWidth}
                  height={barH}
                  rx={2}
                  className={isLeader ? 'sh-bar sh-bar-peak' : 'sh-bar'}
                />
              )}
              <text
                x={cx}
                y={baselineY + 12}
                textAnchor="middle"
                className={isLeader ? 'sh-tick sh-tick-peak' : 'sh-tick'}
              >
                {s}
              </text>
            </g>
          )
        })}
      </svg>
      {!isEmpty && <p className="sh-observation">{observation}</p>}
    </div>
  )
}
