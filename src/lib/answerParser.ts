const FRACTION_MAP: Record<string, number> = {
  '1/6': 1 / 6,
  '2/6': 2 / 6,
  '3/6': 3 / 6,
  '1/3': 1 / 3,
  '1/2': 1 / 2,
  '1/10': 0.1,
  '2/10': 0.2,
  '7/10': 0.7,
}

export function parseMoney(value: string): number | null {
  const cleaned = value.trim().replace(/^\$/, '')
  const num = Number(cleaned)
  return Number.isFinite(num) ? num : null
}

export function parseNumber(value: string): number | null {
  const cleaned = value.trim().replace(/^\$/, '')
  if (cleaned.includes('/')) {
    const [a, b] = cleaned.split('/').map(Number)
    if (Number.isFinite(a) && Number.isFinite(b) && b !== 0) {
      return a / b
    }
    return null
  }
  const num = Number(cleaned.replace('%', ''))
  return Number.isFinite(num) ? num : null
}

export function parseProbability(value: string): number | null {
  const trimmed = value.trim()
  if (FRACTION_MAP[trimmed] !== undefined) {
    return FRACTION_MAP[trimmed]
  }
  if (trimmed.endsWith('%')) {
    const num = Number(trimmed.replace('%', ''))
    return Number.isFinite(num) ? num / 100 : null
  }
  return parseNumber(trimmed)
}

export function parsePercent(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed.endsWith('%')) {
    return parseNumber(trimmed)
  }
  const asNum = parseNumber(trimmed)
  if (asNum === null) {
    return null
  }
  if (asNum <= 1) {
    return asNum * 100
  }
  return asNum
}

export function matchesAccepted(value: string, accepted: string[]): boolean {
  const normalized = value.trim().toLowerCase()
  return accepted.some((a) => a.trim().toLowerCase() === normalized)
}

export function matchesNumeric(value: string, targets: number[], tolerance = 0.01): boolean {
  const parsed = parseNumber(value)
  if (parsed === null) {
    return false
  }
  return targets.some((t) => Math.abs(parsed - t) <= tolerance)
}

export function matchesProbability(value: string, targets: number[], tolerance = 0.02): boolean {
  const parsed = parseProbability(value)
  if (parsed === null) {
    return false
  }
  return targets.some((t) => Math.abs(parsed - t) <= tolerance)
}

export function approxEqual(a: number, b: number, tolerance = 0.02) {
  return Math.abs(a - b) <= tolerance
}
