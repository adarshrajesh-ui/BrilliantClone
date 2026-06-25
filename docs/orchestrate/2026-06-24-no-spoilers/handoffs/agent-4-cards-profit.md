# Agent 4 Handoff: Cards And Profit

## Summary
- Implemented T-004 for the card EV and payout-vs-profit problems.
- Removed pre-answer card hints/notes that stated the value-10 count, deck total, intermediate totals, or exact EV fraction before the matching answer input.
- Removed pay-to-play screen-reader text that stated expected profit before the learner reaches and answers the profit step, while keeping expected payout and cost givens.

## Files Changed
- `src/components/problems/Problem3AverageCardValue.tsx`
- `src/components/problems/Problem5PayoutVsProfit.tsx`

## Verification
- `npm run build` passed.
- `npm test` passed: 35 test files, 645 tests.

## Blockers
- None.
