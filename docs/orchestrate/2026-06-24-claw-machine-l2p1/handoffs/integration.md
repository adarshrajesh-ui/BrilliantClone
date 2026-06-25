# Integration — Claw Machine Expected Value (ev-l2-p1)

State: complete. No cross-module fixes were required — file ownership was disjoint
and all contracts (checker name/type, component export name, visual props) held.

## Verification (final integrated state)
- `npx tsc -b` → exit 0 (clean).
- `npm test` (vitest run) → **570 passed / 570** across 31 files.
- `npm run build` (tsc -b && vite build) → success; 178 modules. (Pre-existing
  chunk-size advisory only — unrelated to this change.)

## Wiring confirmed
- `src/pages/ProblemPage.tsx` registry entry `'problem-2': Problem2WeightedAverage`
  is UNCHANGED — the component kept its export name, so routing/progress untouched.
- `Problem2WeightedAverage.tsx` imports `ClawMachine`, `ClawContributionBlocks`,
  `FormulaBuilder`, and `checkProblem2PrizeBoard` + `REQUIRED_GRABS` from problem-2.
- Gate field fully migrated `bothDropped` → `grabsComplete` (only remaining textual
  hit is a doc comment in problem-2.ts referencing the old name — intentional).
- `src/validation/liveCheckers.ts` needed no edit (casts `unknown`; checker name/type
  preserved).

## Untouched (as required)
auth / Firebase / progress / mastery / persistence key `'problem-2'` / canonical
slug `ev-l2-p1` / every other problem.

## Manual test checklist (suggested)
1. Open `/chapter/expected-value-intro/problem/ev-l2-p1`.
2. Title reads "Claw Machine Expected Value"; left = 3D claw machine + pit + tray.
3. "Drop claw" runs a grab (claw travels, drops, grabs, token rises, drops to tray);
   $20 flashes gold (rare), $0 gray (common). Counter advances toward 8.
4. After 8 grabs, advance; "Compress the pit" reveals $20×25%=$5, $0×75%=$0, EV=$5.
5. Pair $20↔25%, $0↔75%, enter 5 → completes. Try $20 → "used-largest-payout".
6. Enable OS reduced motion → no claw travel; zone reveals via fade, tray updates
   instantly; outcome identical.
