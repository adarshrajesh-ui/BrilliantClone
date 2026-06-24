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

/** Map dollar amount to beam tilt: positive net tips left (payout side down). */
const beamTiltDeg = (payout: number, cost: number, costPlaced: boolean) => {
  const net = payout - (costPlaced ? cost : 0)
  if (!costPlaced) return -11
  return Math.max(-9, Math.min(9, -net * 2.8))
}

/** Marker position along the 0 → payout track (0 = bottom, 100 = top). */
const markerPercent = (payout: number, cost: number, costPlaced: boolean) => {
  const value = costPlaced ? payout - cost : payout
  return Math.max(0, Math.min(100, (value / payout) * 100))
}

export function BalanceScale({ payout, cost, costPlaced, onPlaceCost, revealProfit = false }: BalanceScaleProps) {
  const profit = payout - cost
  const tilt = beamTiltDeg(payout, cost, costPlaced)
  const markerPos = markerPercent(payout, cost, costPlaced)

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
        <div className="balance-scale-assembly">
          <div className="balance-marker-track" aria-hidden="true">
            <span className="balance-track-label">+${payout}</span>
            <div className="balance-track-bar">
              <div
                className={`balance-marker${costPlaced ? ' balance-marker-dropped' : ''}${revealProfit ? ' balance-marker-revealed' : ''}`}
                style={{ bottom: `${markerPos}%` }}
              >
                {revealProfit && <span className="balance-marker-label">+${profit}</span>}
              </div>
            </div>
            <span className="balance-track-label">$0</span>
          </div>
          <div className="balance-beam-wrap">
            <div
              className={`balance-beam${costPlaced ? ' balance-beam-settled' : ''}`}
              style={{ transform: `rotate(${tilt}deg)` }}
            >
              <div className="balance-pan balance-pan-left">
                <span className="balance-weight balance-weight-payout">+${payout}</span>
              </div>
              <div className="balance-pan balance-pan-right">
                {costPlaced ? (
                  <span className="balance-weight balance-weight-cost">−${cost}</span>
                ) : (
                  <button type="button" className="balance-weight balance-weight-cost-btn" onClick={onPlaceCost}>
                    −${cost}
                  </button>
                )}
              </div>
            </div>
            <div className="balance-fulcrum" />
          </div>
        </div>
      </div>
    </div>
  )
}
