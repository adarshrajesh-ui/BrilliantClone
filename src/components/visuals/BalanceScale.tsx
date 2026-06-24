interface BalanceScaleProps {
  payout: number
  cost: number
  costPlaced: boolean
  onPlaceCost: () => void
  /**
   * Reveal the final "expected profit" token. Kept hidden during an active
   * attempt so the answer is not given away; shown once the learner is correct
   * (or when a demo explicitly walks through the result).
   */
  revealProfit?: boolean
}

const barHeight = (value: number) => `${Math.max(20, Math.min(value * 12 + 8, 120))}px`

export function BalanceScale({ payout, cost, costPlaced, onPlaceCost, revealProfit = false }: BalanceScaleProps) {
  const profit = payout - cost

  return (
    <div className="balance-scale">
      <div className="balance-equation">
        <span className="balance-block balance-payout">Expected payout +${payout}</span>
        <span className="balance-op">−</span>
        {costPlaced ? (
          <span className="balance-block balance-cost">Cost ${cost}</span>
        ) : (
          <button type="button" className="balance-block balance-cost-btn" onClick={onPlaceCost}>
            Tap to subtract cost ${cost}
          </button>
        )}
        {revealProfit && (
          <>
            <span className="balance-op">=</span>
            <span className="balance-block balance-profit">Expected profit ${profit}</span>
          </>
        )}
      </div>
      <div className="balance-visual">
        {/*
          The two blocks consistently represent the expected payout (left) and the
          cost (right) — never the answer. The cost block only appears once it has
          been "dropped" onto the scale, matching the demo gesture and the math
          (payout − cost = profit).
        */}
        <div className="balance-beam">
          <div className="balance-left" style={{ height: barHeight(payout) }}>
            <span>+${payout}</span>
          </div>
          <div className="balance-fulcrum" />
          {costPlaced ? (
            <div className="balance-right" style={{ height: barHeight(cost) }}>
              <span>−${cost}</span>
            </div>
          ) : (
            <div className="balance-right balance-right-empty" aria-hidden="true">
              <span>cost</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
