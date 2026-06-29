// Pure helper for rendering probabilities in the Practice UI. No React, no I/O.

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

/**
 * Render a probability as a reduced fraction n/d when it matches a small-
 * denominator fraction (d in 2..12) within ~1e-6 (e.g. 1/6, 1/3, 2/3, 1/2);
 * otherwise fall back to a rounded percent. Ascending d yields lowest terms;
 * gcd is a safety net.
 */
export function formatProbability(probability: number): string {
  if (Number.isFinite(probability) && probability > 0 && probability < 1) {
    for (let d = 2; d <= 12; d += 1) {
      const numerator = probability * d
      const rounded = Math.round(numerator)
      if (rounded >= 1 && rounded < d && Math.abs(numerator - rounded) < 1e-6) {
        const divisor = gcd(rounded, d)
        return `${rounded / divisor}/${d / divisor}`
      }
    }
  }
  const percent = Math.round(probability * 1000) / 10
  return `${percent}%`
}
