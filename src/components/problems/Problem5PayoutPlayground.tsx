import { useMemo } from 'react'
import { ClassicBalanceScale } from '../visuals/ClassicBalanceScale'

export interface PayoutPlaygroundConfig {
  payout: number
  cost: number
}

export const DEFAULT_PAYOUT_PLAYGROUND: PayoutPlaygroundConfig = {
  payout: 4,
  cost: 2,
}

const MAX_WEIGHT = 12

function clampWeight(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(MAX_WEIGHT, Math.max(0, Math.round(value)))
}

export function computePlaygroundProfit(config: PayoutPlaygroundConfig): number {
  return config.payout - config.cost
}

interface PlaygroundBalanceScaleProps {
  payout: number
  cost: number
}

function PlaygroundBalanceScale({ payout, cost }: PlaygroundBalanceScaleProps) {
  return (
    <ClassicBalanceScale
      className="payout-playground-scale"
      leftValue={payout}
      rightValue={cost}
      leftLabel={`$${payout}`}
    />
  )
}

interface Problem5PayoutPlaygroundProps {
  config: PayoutPlaygroundConfig
  onConfigChange: (next: PayoutPlaygroundConfig) => void
  onContinue: () => void
}

export function Problem5PayoutPlayground({
  config,
  onConfigChange,
  onContinue,
}: Problem5PayoutPlaygroundProps) {
  const payout = clampWeight(config.payout)
  const cost = clampWeight(config.cost)
  const profit = useMemo(() => payout - cost, [payout, cost])

  const adjust = (side: 'payout' | 'cost', delta: number) => {
    if (side === 'payout') {
      onConfigChange({ payout: clampWeight(payout + delta), cost })
      return
    }
    onConfigChange({ payout, cost: clampWeight(cost + delta) })
  }

  return (
    <section className="card problem-section payout-playground">
      <h2>Play with the balance scale</h2>
      <p className="section-note">
        Each side holds a weight: expected payout on the left, cost on the right. Tap +1 to
        add weight to a side and watch the beam tip. It stops at the ground when one side
        gets heavy enough — expected profit is payout minus cost.
      </p>

      <PlaygroundBalanceScale payout={payout} cost={cost} />

      <div className="payout-playground-side-controls">
        <div className="payout-playground-side payout-playground-side-left">
          <span className="payout-playground-side-label">Expected payout</span>
          <div className="payout-playground-clicker-row">
            <button
              type="button"
              className="payout-playground-clicker touch-target"
              disabled={payout <= 0}
              onClick={() => adjust('payout', -1)}
              aria-label="Remove one from expected payout"
            >
              −1
            </button>
            <button
              type="button"
              className="payout-playground-clicker payout-playground-clicker-add touch-target"
              disabled={payout >= MAX_WEIGHT}
              onClick={() => adjust('payout', 1)}
              aria-label="Add one to expected payout"
            >
              +1
            </button>
          </div>
        </div>
        <div className="payout-playground-side payout-playground-side-right">
          <span className="payout-playground-side-label">Cost to play</span>
          <div className="payout-playground-clicker-row">
            <button
              type="button"
              className="payout-playground-clicker touch-target"
              disabled={cost <= 0}
              onClick={() => adjust('cost', -1)}
              aria-label="Remove one from cost"
            >
              −1
            </button>
            <button
              type="button"
              className="payout-playground-clicker payout-playground-clicker-add touch-target"
              disabled={cost >= MAX_WEIGHT}
              onClick={() => adjust('cost', 1)}
              aria-label="Add one to cost"
            >
              +1
            </button>
          </div>
        </div>
      </div>

      <div className="payout-playground-profit card-subtle">
        <p className="payout-playground-profit-label">Expected profit (preview)</p>
        <p className="payout-playground-profit-value">${profit}</p>
        <p className="payout-playground-profit-formula">
          ${payout} − ${cost} = ${profit}
        </p>
        <p className="payout-playground-profit-hint">
          {profit > 0
            ? 'Payout outweighs cost — the left side tips down and profit is positive.'
            : profit < 0
              ? 'Cost outweighs payout — the right side tips down and profit is negative.'
              : 'Payout and cost match — the beam sits level and profit is zero.'}
        </p>
      </div>

      <button type="button" className="btn-secondary touch-target payout-playground-continue" onClick={onContinue}>
        Continue to the official mystery box game
      </button>
    </section>
  )
}
