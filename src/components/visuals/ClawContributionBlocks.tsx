import type { JSX } from 'react'
import './ClawContributionBlocks.css'

export interface ClawContributionRow {
  payout: string // '$20' | '$0'
  probability: string // '25%' | '75%'
  product: string // '$5' | '$0'
  weight: number // 0.25 | 0.75  (for block width)
}

export interface ClawContributionBlocksProps {
  rows: ClawContributionRow[]
  evTotal: string
  /** Trigger the compress-into-blocks animation. */
  revealed: boolean
  /**
   * Whether the per-outcome products and the EV total may be shown. Keep this
   * false until the learner submits a correct EV so the answer isn't spoiled;
   * the structure (payout × probability and block widths) still renders.
   */
  revealValues?: boolean
  reducedMotion: boolean
}

/** Placeholder shown in place of a product/total before the answer is revealed. */
const BLANK = '?'

/** A row counts as the valuable prize zone when it actually contributes value. */
function isPrizeRow(row: ClawContributionRow): boolean {
  return row.payout === '$20'
}

/** Spell out a money/percent token for the screen-reader summary. */
function speakToken(token: string): string {
  const map: Record<string, string> = {
    '$20': 'twenty dollars',
    '$5': 'five dollars',
    '$0': 'zero dollars',
    '25%': 'twenty-five percent',
    '75%': 'seventy-five percent',
  }
  return map[token] ?? token
}

/** A zero product reads as a bare "zero" in the spoken summary. */
function speakProduct(token: string): string {
  return token === '$0' ? 'zero' : speakToken(token)
}

function buildAriaSummary(rows: ClawContributionRow[], evTotal: string, revealValues: boolean): string {
  if (!revealValues) {
    // Describe only the method/structure — no products, no EV value yet.
    const parts = rows.map(
      (row) => `${capitalize(speakToken(row.payout))} times ${speakToken(row.probability)}.`,
    )
    parts.push('Pair each payout with its probability to find the expected value.')
    return parts.join(' ')
  }
  const parts = rows.map(
    (row) =>
      `${capitalize(speakToken(row.payout))} times ${speakToken(row.probability)} is ${speakProduct(row.product)}.`,
  )
  parts.push(`Expected value ${speakToken(evTotal)}.`)
  return parts.join(' ')
}

function capitalize(value: string): string {
  return value.length === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1)
}

export function ClawContributionBlocks({
  rows,
  evTotal,
  revealed,
  revealValues = true,
  reducedMotion,
}: ClawContributionBlocksProps): JSX.Element {
  // Final compressed state shows immediately under reduced motion; otherwise it
  // is gated on `revealed` so the transfer animation can play once.
  const compressed = revealed || reducedMotion
  const animate = revealed && !reducedMotion
  const displayedTotal = revealValues ? evTotal : BLANK

  const rootClass = [
    'ccb-root',
    compressed ? 'ccb-compressed' : 'ccb-precompress',
    animate ? 'ccb-animate' : '',
    reducedMotion ? 'ccb-reduced' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClass} aria-label="Expected value contribution breakdown">
      <p className="ccb-caption" aria-hidden="true">
        Convert the pit into contribution blocks — each block&apos;s width is its chance.
      </p>

      <div className="ccb-blocks">
        {rows.map((row, index) => {
          const prize = isPrizeRow(row)
          const widthPct = `${Math.max(0, Math.min(1, row.weight)) * 100}%`
          const blockClass = [
            'ccb-block',
            prize ? 'ccb-block-gold' : 'ccb-block-gray',
            compressed ? 'ccb-block-in' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <div
              key={`${row.payout}-${row.probability}-${index}`}
              className={blockClass}
              style={{
                width: compressed ? widthPct : '100%',
                animationDelay: animate ? `${index * 120}ms` : undefined,
              }}
              aria-hidden="true"
            >
              <span className="ccb-equation">
                <span className="ccb-payout">{row.payout}</span>
                <span className="ccb-op"> × </span>
                <span className="ccb-prob">{row.probability}</span>
                <span className="ccb-op"> = </span>
                <span className={`ccb-product${prize && revealValues ? ' ccb-product-prize' : ''}`}>
                  {revealValues ? row.product : BLANK}
                </span>
              </span>
            </div>
          )
        })}
      </div>

      <div className={`ccb-total${compressed ? ' ccb-total-in' : ''}`} aria-hidden="true">
        <span className="ccb-total-label">EV =</span>
        <span className="ccb-total-value">{displayedTotal}</span>
      </div>

      <p className="ccb-sr-only" aria-live="polite">
        {compressed ? buildAriaSummary(rows, evTotal, revealValues) : ''}
      </p>
    </div>
  )
}
