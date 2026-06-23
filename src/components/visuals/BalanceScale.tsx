interface BalanceScaleProps {
  payout: number
  cost: number
  costPlaced: boolean
  onPlaceCost: () => void
  profitShown?: number | null
}

export function BalanceScale({ payout, cost, costPlaced, onPlaceCost, profitShown }: BalanceScaleProps) {
  const profit = profitShown ?? (costPlaced ? payout - cost : null)

  return (
    <div className="balance-scale">
      <div className="balance-equation">
        <span className="balance-block balance-payout">Expected payout +${payout}</span>
        <span className="balance-op">{costPlaced ? '−' : '+'}</span>
        {costPlaced ? (
          <span className="balance-block balance-cost">Cost −${cost}</span>
        ) : (
          <button type="button" className="balance-block balance-cost-btn" onClick={onPlaceCost}>
            Tap to add cost −${cost}
          </button>
        )}
        {costPlaced && profit !== null && (
          <>
            <span className="balance-op">=</span>
            <span className="balance-block balance-profit">Expected profit ${profit}</span>
          </>
        )}
      </div>
      <div className="balance-visual">
        <div className="balance-beam">
          <div className="balance-left" style={{ height: `${Math.min(payout * 12, 120)}px` }}>
            <span>+${payout}</span>
          </div>
          <div className="balance-fulcrum" />
          <div
            className="balance-right"
            style={{
              height: costPlaced
                ? `${Math.max(20, Math.min(profit !== null && profit >= 0 ? profit * 12 + 20 : 20, 120))}px`
                : `${Math.min(cost * 12, 80)}px`,
            }}
          >
            <span>{costPlaced ? (profit !== null ? `$${profit}` : '') : `−$${cost}`}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
