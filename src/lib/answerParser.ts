// Deterministic answer normalization. No AI / no semantic matching.
// Every function returns predictable numeric/string results so answer checking
// stays correct and runs well under 100ms.

const MONEY_WORDS = /\b(dollars?|bucks?|usd)\b/g
const RATE_WORDS = /\b(per\s*spin|per\s*play|per\s*trial|each|a\s*spin|on\s*average)\b/g

function preClean(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\u2212/g, '-')
    .replace(/[$,]/g, '')
    .replace(MONEY_WORDS, '')
    .replace(RATE_WORDS, '')
    .trim()
}

const NUMBER_PART = String.raw`[+-]?\s*(?:\d+(?:\.\d*)?|\.\d+)`
const FRACTION_RE = new RegExp(String.raw`^(${NUMBER_PART})\s*\/\s*(${NUMBER_PART})$`)

function parseFiniteNumber(cleaned: string, options: { allowPercent: boolean }): number | null {
  if (cleaned === '') {
    return null
  }
  if (cleaned.includes('/')) {
    const match = cleaned.match(FRACTION_RE)
    if (!match) {
      return null
    }
    const numerator = Number(match[1].replace(/\s+/g, ''))
    const denominator = Number(match[2].replace(/\s+/g, ''))
    if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator !== 0) {
      return numerator / denominator
    }
    return null
  }

  const isPercent = cleaned.endsWith('%')
  if (isPercent && !options.allowPercent) {
    return null
  }
  const core = isPercent ? cleaned.slice(0, -1).trim() : cleaned
  const num = Number(core)
  if (!Number.isFinite(num)) {
    return null
  }
  return isPercent ? num / 100 : num
}

/** Accepts 5, 5.0, 5.00, $5, $5.00, "5 dollars", fractions, negative values, "5 per spin", whitespace variants. */
export function normalizeMoneyAnswer(value: unknown): number | null {
  const cleaned = preClean(value)
  return parseFiniteNumber(cleaned, { allowPercent: false })
}

/** Accepts money/decimal/percent/fraction forms and returns the literal numeric value. */
export function normalizeNumericAnswer(value: unknown): number | null {
  const cleaned = preClean(value)
  return parseFiniteNumber(cleaned, { allowPercent: true })
}

/**
 * Parses a probability into the 0..1 range.
 * Accepts 25%, 0.25, .25, 1/4, "25 / 100", equivalent fractions, whitespace variants.
 * A bare number > 1 (e.g. "25") is treated as a percent (25% -> 0.25).
 */
export function parseProbabilityAnswer(value: unknown): number | null {
  const cleaned = preClean(value)
  if (cleaned === '') {
    return null
  }
  if (cleaned.endsWith('%')) {
    const n = parseFiniteNumber(cleaned.slice(0, -1).trim(), { allowPercent: false })
    return n === null ? null : n / 100
  }
  if (cleaned.includes('/')) {
    return parseFiniteNumber(cleaned, { allowPercent: false })
  }
  const n = parseFiniteNumber(cleaned, { allowPercent: false })
  if (n === null) {
    return null
  }
  return n > 1 ? n / 100 : n
}

export function areNumbersClose(a: number, b: number, tolerance = 0.01): boolean {
  return Math.abs(a - b) <= tolerance
}

/** True when value is equivalent to target probability within tolerance (default 0.01). */
export function areProbabilitiesEquivalent(
  value: unknown,
  target: number,
  tolerance = 0.01,
): boolean {
  const parsed = parseProbabilityAnswer(value)
  if (parsed === null) {
    return false
  }
  return Math.abs(parsed - target) <= tolerance
}

export type Classification = 'fair' | 'favorable' | 'unfavorable'

const FAIR_TERMS = new Set([
  'fair',
  'even',
  'break even',
  'breakeven',
  'break-even',
  'neutral',
  'zero',
])
const FAVORABLE_TERMS = new Set([
  'favorable',
  'favourable',
  'fav',
  'positive',
  'good',
  'good for player',
  'good for the player',
  'advantageous',
])
const UNFAVORABLE_TERMS = new Set([
  'unfavorable',
  'unfavourable',
  'unfav',
  'negative',
  'bad',
  'bad for player',
  'bad for the player',
  'disadvantageous',
])

/** Case-insensitive classification normalization with unambiguous synonyms only. */
export function normalizeClassificationAnswer(value: unknown): Classification | null {
  const s = String(value ?? '').trim().toLowerCase()
  if (s === '') {
    return null
  }
  if (FAIR_TERMS.has(s)) {
    return 'fair'
  }
  if (FAVORABLE_TERMS.has(s)) {
    return 'favorable'
  }
  if (UNFAVORABLE_TERMS.has(s)) {
    return 'unfavorable'
  }
  return null
}

export interface MistakeCandidate {
  value: number
  mistakeType: string
}

/**
 * Deterministic mistake detection: returns the mistakeType whose value matches the
 * parsed answer within tolerance, or null. Used for money-style problems.
 */
export function detectMistakeType(
  parsed: number | null,
  candidates: MistakeCandidate[],
  tolerance = 0.01,
): string | null {
  if (parsed === null) {
    return null
  }
  for (const candidate of candidates) {
    if (areNumbersClose(parsed, candidate.value, tolerance)) {
      return candidate.mistakeType
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// Backwards-compatible wrappers (kept so existing imports keep working).
// ---------------------------------------------------------------------------

export function parseMoney(value: string): number | null {
  return normalizeMoneyAnswer(value)
}

export function parseNumber(value: string): number | null {
  return normalizeNumericAnswer(value)
}

export function parseProbability(value: string): number | null {
  return parseProbabilityAnswer(value)
}

export function parsePercent(value: string): number | null {
  const prob = parseProbabilityAnswer(value)
  return prob === null ? null : prob * 100
}

export function matchesAccepted(value: string, accepted: string[]): boolean {
  const normalized = value.trim().toLowerCase()
  return accepted.some((a) => a.trim().toLowerCase() === normalized)
}

export function matchesNumeric(value: string, targets: number[], tolerance = 0.01): boolean {
  const parsed = normalizeMoneyAnswer(value)
  if (parsed === null) {
    return false
  }
  return targets.some((t) => Math.abs(parsed - t) <= tolerance)
}

export function matchesProbability(value: string, targets: number[], tolerance = 0.01): boolean {
  return targets.some((t) => areProbabilitiesEquivalent(value, t, tolerance))
}

export function approxEqual(a: number, b: number, tolerance = 0.02) {
  return Math.abs(a - b) <= tolerance
}
