import type { PackCanonicalSlug, PackProblemDefinition } from '../types'
import { L3_REPAIR_PROBABILITY_TABLE } from './l3-repair-probability-table'
import { L3_PRIZE_BAG_EV_TABLE } from './l3-prize-bag-ev-table'
import { L4_PAYOUT_VS_PROFIT } from './l4-payout-vs-profit'
import { L4_FAIR_FAVORABLE_UNFAVORABLE } from './l4-fair-favorable-unfavorable'
import { L4_FIND_FAIR_PRICE } from './l4-find-fair-price'
import { L4_CHOOSE_BETTER_GAME_AFTER_COST } from './l4-choose-better-game-after-cost'
import { L5_BUILD_WHOLE_EV_MODEL } from './l5-build-whole-ev-model'
import { L5_SAME_EV_DIFFERENT_RISK } from './l5-same-ev-different-risk'
import { L5_LOW_RISK_VS_HIGH_RISK } from './l5-low-risk-vs-high-risk'
import { L5_FINAL_CAPSTONE_EV_DECISION } from './l5-final-capstone-ev-decision'

/** The 10 Problem Pack B definitions, in PRD order (Problems 11–20). */
export const problemPackB: PackProblemDefinition[] = [
  L3_REPAIR_PROBABILITY_TABLE,
  L3_PRIZE_BAG_EV_TABLE,
  L4_PAYOUT_VS_PROFIT,
  L4_FAIR_FAVORABLE_UNFAVORABLE,
  L4_FIND_FAIR_PRICE,
  L4_CHOOSE_BETTER_GAME_AFTER_COST,
  L5_BUILD_WHOLE_EV_MODEL,
  L5_SAME_EV_DIFFERENT_RISK,
  L5_LOW_RISK_VS_HIGH_RISK,
  L5_FINAL_CAPSTONE_EV_DECISION,
]

export function getPackProblemBySlug(
  slug: PackCanonicalSlug,
): PackProblemDefinition | undefined {
  return problemPackB.find((p) => p.canonicalSlug === slug)
}

export function getPackProblemByStorageId(
  storageId: string,
): PackProblemDefinition | undefined {
  return problemPackB.find((p) => p.storageId === storageId)
}

export {
  L3_REPAIR_PROBABILITY_TABLE,
  L3_PRIZE_BAG_EV_TABLE,
  L4_PAYOUT_VS_PROFIT,
  L4_FAIR_FAVORABLE_UNFAVORABLE,
  L4_FIND_FAIR_PRICE,
  L4_CHOOSE_BETTER_GAME_AFTER_COST,
  L5_BUILD_WHOLE_EV_MODEL,
  L5_SAME_EV_DIFFERENT_RISK,
  L5_LOW_RISK_VS_HIGH_RISK,
  L5_FINAL_CAPSTONE_EV_DECISION,
}
