// Live-checker dispatch — Expected Value Lab (15-problem chapter)
// ---------------------------------------------------------------
// Independent QA (Agent 6). This module imports the REAL, co-located answer
// checkers used by the live problem components and exposes a single
// `runLiveChecker(storageId, input)` entry point. Because the chapter is now
// fully built and the integration gate is green, validation can execute the
// genuine checkers rather than mirroring the spec.
//
// SAFE-BY-DESIGN: imports only (no app file is modified); no AI / model calls;
// no Firebase. Every checker is pure and synchronous.
//
// NOTE on the legacy `checkProblem` dispatcher in `src/lib/answerChecker.ts`:
// it still routes problem-1/2/5/7/8 to the PRE-15 semantics (spinner $10/$0,
// whole-EV wheel, $5 vs $10/$0) and is NOT what the live components call. This
// module deliberately wires each storage ID to the checker the live component
// actually uses (see the CHECKER → STORAGE ID map in the agent brief).

import type { CheckResult } from '../types/problem'

import { checkProblem1Dice, type Problem1DiceCheckInput } from '../data/problems/problem-1'
import { checkEvL1P2, type EvL1P2CheckInput } from '../data/problems/ev-l1-p2'
import { checkEvL1P3, type EvL1P3CheckInput } from '../data/problems/ev-l1-p3'
import { checkProblem2PrizeBoard, type Problem2PrizeBoardCheckInput } from '../data/problems/problem-2'
import { checkEvL2P2, type EvL2P2CheckInput } from '../data/problems/ev-l2-p2'
import { checkEvL2P3, type EvL2P3CheckInput } from '../data/problems/ev-l2-p3'
import { checkProblem6 } from '../lib/answerChecker'
import type { Problem6CheckInput } from '../types/problem'
import {
  checkDealtHand,
  type DealtHandCheckInput,
} from '../components/problems/Problem4DealtHandContributions.checker'
import {
  checkMiniDeck,
  type MiniDeckCheckInput,
} from '../components/problems/EvL3P3MiniDeckTable.checker'
import { checkEvL4P1, type EvL4P1CheckInput } from '../components/problems/Problem5PayoutVsProfit.checker'
import { checkEvL4P3, type EvL4P3CheckInput } from '../components/problems/EvL4P3BetterGame.checker'
import { checkSameAverageDifferentRide, type SameAverageRideCheckInput } from '../data/problems/problem-7'
import { checkWiderSpread, type WiderSpreadCheckInput } from '../data/problems/problem-8'
import { checkFinalDecision, type FinalDecisionCheckInput } from '../data/problems/ev-l5-p3'

export type {
  Problem1DiceCheckInput,
  EvL1P2CheckInput,
  EvL1P3CheckInput,
  Problem2PrizeBoardCheckInput,
  EvL2P2CheckInput,
  EvL2P3CheckInput,
  DealtHandCheckInput,
  MiniDeckCheckInput,
  EvL4P1CheckInput,
  Problem6CheckInput,
  EvL4P3CheckInput,
  SameAverageRideCheckInput,
  WiderSpreadCheckInput,
  FinalDecisionCheckInput,
}

/** Storage IDs in canonical chapter order, each paired with its canonical slug. */
export const LIVE_CHECKER_IDS = [
  { storageId: 'problem-1', canonicalSlug: 'ev-l1-p1' },
  { storageId: 'ev-l1-p2', canonicalSlug: 'ev-l1-p2' },
  { storageId: 'ev-l1-p3', canonicalSlug: 'ev-l1-p3' },
  { storageId: 'problem-2', canonicalSlug: 'ev-l2-p1' },
  { storageId: 'ev-l2-p2', canonicalSlug: 'ev-l2-p2' },
  { storageId: 'ev-l2-p3', canonicalSlug: 'ev-l2-p3' },
  { storageId: 'problem-4', canonicalSlug: 'ev-l3-p2' },
  { storageId: 'ev-l3-p3', canonicalSlug: 'ev-l3-p3' },
  { storageId: 'problem-5', canonicalSlug: 'ev-l4-p1' },
  { storageId: 'problem-6', canonicalSlug: 'ev-l4-p2' },
  { storageId: 'ev-l4-p3', canonicalSlug: 'ev-l4-p3' },
  { storageId: 'problem-7', canonicalSlug: 'ev-l5-p1' },
  { storageId: 'problem-8', canonicalSlug: 'ev-l5-p2' },
  { storageId: 'ev-l5-p3', canonicalSlug: 'ev-l5-p3' },
] as const

export type LiveCheckerStorageId = (typeof LIVE_CHECKER_IDS)[number]['storageId']

/**
 * Dispatch to the live checker for a storage ID. Inputs are validated `unknown`
 * because each problem has its own bespoke CheckInput shape; the matrix supplies
 * correctly-shaped objects and this function casts at the boundary.
 */
export function runLiveChecker(storageId: string, input: unknown): CheckResult {
  switch (storageId) {
    case 'problem-1':
      return checkProblem1Dice(input as Problem1DiceCheckInput)
    case 'ev-l1-p2':
      return checkEvL1P2(input as EvL1P2CheckInput)
    case 'ev-l1-p3':
      return checkEvL1P3(input as EvL1P3CheckInput)
    case 'problem-2':
      return checkProblem2PrizeBoard(input as Problem2PrizeBoardCheckInput)
    case 'ev-l2-p2':
      return checkEvL2P2(input as EvL2P2CheckInput)
    case 'ev-l2-p3':
      return checkEvL2P3(input as EvL2P3CheckInput)
    case 'problem-4':
      return checkDealtHand(input as DealtHandCheckInput)
    case 'ev-l3-p3':
      return checkMiniDeck(input as MiniDeckCheckInput)
    case 'problem-5':
      return checkEvL4P1(input as EvL4P1CheckInput)
    case 'problem-6':
      return checkProblem6(input as Problem6CheckInput)
    case 'ev-l4-p3':
      return checkEvL4P3(input as EvL4P3CheckInput)
    case 'problem-7':
      return checkSameAverageDifferentRide(input as SameAverageRideCheckInput)
    case 'problem-8':
      return checkWiderSpread(input as WiderSpreadCheckInput)
    case 'ev-l5-p3':
      return checkFinalDecision(input as FinalDecisionCheckInput)
    default:
      throw new Error(`runLiveChecker: no live checker registered for "${storageId}"`)
  }
}
