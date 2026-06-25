import { ClassicBalanceScale, CostTapButton, WeightBlock } from './ClassicBalanceScale'

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

export function BalanceScale({ payout, cost, costPlaced, onPlaceCost, revealProfit = false }: BalanceScaleProps) {
  const profit = payout - cost

  const rightPanContent = costPlaced ? (
    <WeightBlock value={cost} label={`−$${cost}`} variant="cost" />
  ) : (
    <CostTapButton cost={cost} onClick={onPlaceCost} />
  )

  return (
    <div className="balance-scale">
      <div className="balance-equation">
        <span className="balance-block balance-payout" id="payout-block">Expected payout +${payout}</span>
        <span className="balance-op">−</span>
        {costPlaced ? (
          <span className="balance-block balance-cost" id="cost-block">Cost ${cost}</span>
        ) : (
          <button type="button" className="balance-block balance-cost-btn" id="cost-block" onClick={onPlaceCost}>
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
      <div className="balance-visual" id="balance">
        <ClassicBalanceScale
          leftValue={payout}
          rightValue={costPlaced ? cost : 0}
          rightTiltValue={costPlaced ? cost : 0}
          leftLabel={`+$${payout}`}
          rightContent={rightPanContent}
        />
      </div>
    </div>
  )
}
