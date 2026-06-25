# Agent 5 Handoff: Contribution Sum Reveals

## Summary
- Implemented T-005 for the contribution EV-entry steps.
- Removed pre-answer computed contribution sums from visible section notes and `sr-only` live text.
- Replaced those reveals with method-only copy that tells learners to add their entered contributions and type the expected value.
- Left completion-gated EV badges unchanged.

## Files Changed
- `src/components/problems/EvL3P3MiniDeckTable.tsx`
- `src/components/problems/Problem4DealtHandContributions.tsx`
- `docs/orchestrate/2026-06-24-no-spoilers/handoffs/agent-5-contrib.md`

## Verification
- `npm run build` passed.
- `npm test` passed: 35 files, 645 tests.
- Searched the two scoped component files for removed leak markers (`add to`, `Contributions entered`, `roundedSum`, `contribSum`, `normalizeMoneyAnswer`); no matches remained.

## Blockers
- None.
