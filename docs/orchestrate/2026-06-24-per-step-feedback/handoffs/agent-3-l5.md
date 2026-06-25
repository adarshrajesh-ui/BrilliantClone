# Handoff: agent-3-l5 (per-step feedback)

Migrated `EvL5P3FinalDecision` (the chapter capstone, 6 steps) from a single
final-only "Submit full model" grade to per-step feedback. Each answer-bearing
step is now checked when finished: immediate feedback in the shared coach panel,
a ✓/! badge, and a Next gate so the learner cannot advance past a wrong step.
The last step keeps the holistic completion check.

## Status: DONE

- Lint: `npm run lint` → exit 0. Only pre-existing `react(only-export-components)`
  warnings in unrelated files; none in the files I touched.
- Tests: `npm test` → 36 files, 657 passing (was 619; +38 from my new checker
  test file). All green.
- No commit made (per instructions).

## Files touched (all within allowed scope)

- `src/data/problems/ev-l5-p3.ts` — added 5 per-step checker helpers (+ `stepOk`
  / `stepGuard` locals). Holistic `checkFinalDecision` and `EV_L5_P3` export
  UNCHANGED.
- `src/components/problems/EvL5P3FinalDecision.tsx` — rewired to the EvL2P3
  per-step pattern (local `checks` state map, per-step Check buttons, status
  badges, per-step Next gating, `onStepChange={session.clearFeedback}`).
- `src/components/problems/EvL5P3FinalDecision.checker.test.ts` — NEW colocated
  unit tests for the per-step checkers.

## The 6 steps (exploratory vs answer-bearing)

1. `group` — EXPLORATORY (tap carnival-wheel sections). Keeps its existing
   `canAdvance: grouped` gate; no per-step Check.
2. `table` — answer-bearing (probabilities ÷12 + contributions). Per-step Check.
3. `payout` — answer-bearing (expected payout = $6). Per-step Check.
4. `profit` — answer-bearing (expected profit = $0). Per-step Check.
5. `decide` — answer-bearing (fair/favorable/unfavorable). Per-step Check.
6. `risk` — LAST step, answer-bearing (risk interpretation). Holistic completion
   check via `checkFinalDecision(...)` with `stepId: 'final'`; badge set from
   `checkEvL5P3Risk`. No `canAdvance` gate (it is the last step).

## Per-step checker helpers added (ev-l5-p3.ts) → stepId

Each validates ONLY its field(s), returns a `CheckResult` with
`canComplete: false`, reuses the same mistakeType strings/feedback as the
holistic checker, and uses guard `mistakeType: ''` (so guards leave the badge
unset, matching EvL2P3 `statusFromResult`).

- `checkEvL5P3Table(probabilities, contributions)` → stepId `'table'`
  (mistakeTypes: `counts-not-probability`, `wrong-denominator`,
  `omitted-zero-row`, `arithmetic-error`)
- `checkEvL5P3Payout(expectedPayout)` → stepId `'payout'` (`arithmetic-error`)
- `checkEvL5P3Profit(expectedProfit)` → stepId `'profit'`
  (`payout-not-profit`, `arithmetic-error`)
- `checkEvL5P3Decision(decision)` → stepId `'decide'`
  (`fair-marked-favorable`, `marked-unfavorable`)
- `checkEvL5P3Risk(riskChoice)` → used for the `'risk'` (final) step badge
  (`believed-fair-has-no-risk`, `confused-ev-with-guaranteed`)

## Pattern compliance (matches EvL2P3 reference + interfaces.md)

- Answer fields stay in persisted state; a local non-persisted `checks` map holds
  per-step badge status (`'correct' | 'incorrect' | undefined`).
- `statusFromResult` copied verbatim (guard `mistakeType === '' → undefined`).
- Each gradable step: inline `ws-step-check` Check button disabled until filled;
  `status: checks.<field>`, `canAdvance: checks.<field> === 'correct'`,
  `advanceHint: 'Check this step and fix it to continue.'`.
- Editing any field clears that step's badge in the same `onChange`
  (direct correction).
- `onStepChange={session.clearFeedback}` passed to `ProblemLayout`; `checks` reset
  to `NO_CHECKS` in `onRestart`.
- Inline table cell statuses (`probStatus`/`contribStatus`) now key off
  `checks.table === 'incorrect'` instead of the old `session.feedback`-derived
  `showStatus`, so they show right after a wrong table check and clear on edit.

## Notes / minor changes

- Removed the now-redundant `disabled` gates on the payout/profit/decision inputs
  (per-step Next gating already enforces order). The table inputs keep their
  intra-step gates (`!grouped`, `!probsFilled`) so probability comes before
  contribution within the one step.
- `filled`/`activeIndex`/`reached`/`stepClass` retained for the existing
  `l5-step*` visual wrappers; `stepClass` indices updated since the array no
  longer tracks a separate "contribs" entry.

## Blockers

None. Stayed within ALLOWED files only; did not touch WorkspaceSteps.tsx,
ProblemLayout.tsx, index.ts, useProblemSession.ts, or any other problem/data
file.
