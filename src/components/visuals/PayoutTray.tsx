import './PayoutTray.css'

interface PayoutTrayProps {
  /** Expected payout in whole dollars; one coin slides in per dollar. */
  payout: number
  /** Optional label above the tray. */
  label?: string
}

/**
 * A tray that fills with gold coins up to the expected payout. Coins stream in
 * with a staggered CSS animation (reduced-motion shows them instantly). The
 * coin count equals the payout regardless of motion, so the value is stable.
 */
export function PayoutTray({ payout, label }: PayoutTrayProps) {
  const coins = Math.max(0, Math.round(payout))
  return (
    <div className="payout-tray">
      <span className="payout-tray-label">{label ?? `$${payout} expected payout`}</span>
      <div className="payout-tray-basin" role="img" aria-label={`Payout tray holding $${payout}`}>
        <div className="payout-tray-coins">
          {Array.from({ length: coins }).map((_, i) => (
            <span key={i} className="payout-coin" style={{ animationDelay: `${i * 150}ms` }}>$1</span>
          ))}
        </div>
      </div>
    </div>
  )
}
