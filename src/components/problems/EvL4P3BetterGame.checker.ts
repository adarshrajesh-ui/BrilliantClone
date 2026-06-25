import { normalizeMoneyAnswer, areNumbersClose } from '../../lib/answerParser'
import type { CheckResult } from '../../types/problem'

/**
 * Local CheckInput for ev-l4-p3 (Choose the Better Game After Cost). Defined
 * here (not in shared `types/problem.ts`); listed in the handoff for Agent 1 to
 * add to the `ProblemCheckInput` union.
 */
export interface EvL4P3CheckInput {
  profitA: string
  profitB: string
  choice: string
}

const GAME_A = { payout: 9, cost: 7, profit: 2 }
const GAME_B = { payout: 6, cost: 3, profit: 3 }

const ok = (feedback: string): CheckResult => ({
  isCorrect: true,
  mistakeType: null,
  feedback,
  canComplete: true,
})

const fail = (mistakeType: string, feedback: string): CheckResult => ({
  isCorrect: false,
  mistakeType,
  feedback,
  canComplete: false,
})

const guard = (feedback: string): CheckResult => ({
  isCorrect: false,
  mistakeType: '',
  feedback,
  canComplete: false,
})

/** Normalize a better-game choice to 'A' | 'B' | null (deterministic, no AI). */
function normalizeChoice(value: string): 'A' | 'B' | null {
  const s = value.trim().toLowerCase().replace(/game/g, '').trim()
  if (s === 'a') return 'A'
  if (s === 'b') return 'B'
  return null
}

/** Validate one game's profit, returning a mistake CheckResult or null if correct. */
function profitMistake(
  raw: string,
  game: { payout: number; cost: number; profit: number },
  label: string,
): CheckResult | null {
  const value = normalizeMoneyAnswer(raw)
  if (value === null) {
    return guard(`Enter the expected profit for Game ${label}.`)
  }
  if (areNumbersClose(value, game.profit)) {
    return null
  }
  if (areNumbersClose(value, game.payout)) {
    return fail('forgot-subtract-cost', `Game ${label}: subtract the cost. ${game.payout} − ${game.cost} = ${game.profit}.`)
  }
  if (areNumbersClose(value, game.payout + game.cost)) {
    return fail('added-cost', `Game ${label}: cost reduces profit. Use ${game.payout} − ${game.cost} = ${game.profit}, not payout + cost.`)
  }
  if (areNumbersClose(value, game.cost - game.payout)) {
    return fail('reversed-payout-cost', `Game ${label}: you computed cost − payout. Profit is ${game.payout} − ${game.cost} = ${game.profit}.`)
  }
  return fail('arithmetic-error', `Game ${label} profit = payout − cost = ${game.payout} − ${game.cost} = ${game.profit}.`)
}

export function checkEvL4P3(input: EvL4P3CheckInput): CheckResult {
  const aResult = profitMistake(input.profitA, GAME_A, 'A')
  if (aResult) return aResult

  const bResult = profitMistake(input.profitB, GAME_B, 'B')
  if (bResult) return bResult

  const choice = normalizeChoice(input.choice)
  if (choice === null) {
    return guard('Select the better game for the player.')
  }
  if (choice === 'A') {
    // Profits are already validated correct here, so picking A is the
    // "bigger payout, smaller profit" trap.
    return fail(
      'chose-larger-payout',
      'Game A has the larger payout, but Game B keeps more after cost ($3 vs $2). The better game is decided by profit.',
    )
  }

  return ok('Correct! Game A keeps $2, Game B keeps $3, so Game B is the better game.')
}

// ---- Per-step checkers (validate ONLY the step's own field(s)) ----
// These reuse the same mistake classification as the holistic checker but never
// set `canComplete` — completion stays with the FINAL holistic `checkEvL4P3`.

/** Step 'profits': both expected profits correct (payout − cost)? */
export function checkEvL4P3Profits(profitA: string, profitB: string): CheckResult {
  const aResult = profitMistake(profitA, GAME_A, 'A')
  if (aResult) return aResult

  const bResult = profitMistake(profitB, GAME_B, 'B')
  if (bResult) return bResult

  return {
    isCorrect: true,
    mistakeType: null,
    feedback: 'Correct — Game A keeps $2 and Game B keeps $3 after cost.',
    canComplete: false,
  }
}

/** Step 'choose': is the selected game the one with the larger profit (B)? */
export function checkEvL4P3Choice(choice: string): CheckResult {
  const c = normalizeChoice(choice)
  if (c === null) {
    return guard('Select the better game for the player.')
  }
  if (c === 'A') {
    return fail(
      'chose-larger-payout',
      'Game A has the larger payout, but Game B keeps more after cost ($3 vs $2). The better game is decided by profit.',
    )
  }
  return {
    isCorrect: true,
    mistakeType: null,
    feedback: 'Correct — Game B keeps $3 after cost, more than Game A\u2019s $2.',
    canComplete: false,
  }
}
