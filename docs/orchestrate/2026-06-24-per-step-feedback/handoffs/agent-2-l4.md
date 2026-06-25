# Handoff: agent-2-l4 (T-002 — EvL4P3BetterGame per-step feedback)

Migrated `EvL4P3BetterGame` ("Choose the Better Game After Cost") from a single
final holistic check to per-step feedback, following the EvL2P3 reference and the
finalized contract in `interfaces.md`.

## Status: DONE

- Lint: `npm run lint` → exit 0 (only pre-existing `react(only-export-components)`
  warnings in unrelated files; none in files I touched).
- Tests: my checker file `EvL4P3BetterGame.checker.test.ts` → 12/12 pass.
  Full suite: 633/634 pass; the 1 failure is OUTSIDE my scope (see Blockers).
- No commit made (per instructions).

## Files touched (all within allowed scope)

- `src/components/problems/EvL4P3BetterGame.checker.ts` — added two per-step checkers.
- `src/components/problems/EvL4P3BetterGame.tsx` — per-step migration.
- `src/components/problems/EvL4P3BetterGame.checker.test.ts` — added per-step tests.
- `src/data/problems/ev-l4-p3.ts` — NOT modified (definition already sufficient).

## New checker helper names (in EvL4P3BetterGame.checker.ts)

Each validates ONLY its own field(s) and returns `CheckResult` with
`canComplete: false` — completion stays on the holistic `checkEvL4P3` (`final`).
They reuse the same mistake classification / feedback as the holistic checker.
Guard results use `mistakeType: ''`.

```ts
// Step 'profits': both expected profits correct (payout − cost)?
export function checkEvL4P3Profits(profitA: string, profitB: string): CheckResult

// Step 'choose': is the selected game the larger-profit one (B)?
export function checkEvL4P3Choice(choice: string): CheckResult
```

The existing `checkEvL4P3(input)` holistic export is UNCHANGED.

## Component wiring (matches the contract pattern)

Two steps:
- `profits` (stepId `'profits'`): inline `Check` button (`ws-step-check`, disabled
  until both profit fields are filled) → `checkEvL4P3Profits(profitA, profitB)` →
  `session.handleCheck(result, 'profits', …)`. Step `status: checks.profits`,
  `canAdvance: checks.profits === 'correct'`, `advanceHint` set. Editing either
  profit input clears `checks.profits` (direct correction).
- `choose` = FINAL step (stepId `'final'`): keeps the holistic `checkEvL4P3({...})`
  for `canComplete`; badge set from `checkEvL4P3Choice(state.choice)` so the ✓/!
  reflects the choice itself. Picking a new game clears `checks.choice`. No
  `canAdvance` gate (it's the last step).
- Local non-persisted `checks` map (`{ profits, choice }`) + `statusFromResult`
  exactly mirror the EvL2P3 reference. `checks` reset to `NO_CHECKS` in `onRestart`.
- `onStepChange={session.clearFeedback}` passed to `ProblemLayout`.

Existing `profitStatus` cell-status visuals (driven by `session.feedback`) were
left intact — they now light up after a per-step `profits` check and clear on
step change.

## Blockers

- `src/validation/liveCheckerValidation.test.ts > … > L3P1 blocks the table until
  all six boxes are revealed` fails with `TypeError: Cannot read properties of
  undefined (reading 'trim')` in
  `src/components/problems/Problem3AverageCardValue.checker.ts:56`. This is in
  the L3P1 / Average Card Value area (another agent's scope) and is unrelated to
  EvL4P3 — present independent of my changes. NOT fixed (out of scope).
