# Handoff: agent-4-p7l1 (T-004)

Migrated **Problem7WholeEVModel** (ev-l5-p1) and **EvL1P3CompareGames** (ev-l1-p3)
to the per-step-feedback infra (T-001 contract). Built against the FINALIZED
`interfaces.md` + `agent-1-foundation.md` reference (EvL2P3 pattern).

## Status: DONE

- Lint: `npm run lint` → exit 0. Only pre-existing `react(only-export-components)`
  warnings in unrelated files; none in the files I touched.
- Tests: `npm test` → 36 files, 657 tests, all passing.
- No commit made (per instructions).

## Files touched (all within ALLOWED scope)

- `src/components/problems/EvL1P3CompareGames.tsx`
- `src/components/problems/Problem7WholeEVModel.tsx`

**No data/checker files were edited.** See "Why no per-step checker helpers" below.
`src/data/problems/ev-l1-p3.ts` and `src/data/problems/problem-7.ts` are unchanged.

## Structural finding (key to this migration)

Both problems have exactly ONE answer-bearing step; the first step is purely
exploratory and already gated by its existing `canAdvance`:

- **Problem7**: `play` (run both machines, exploratory) → `questions` (FINAL, the
  3 answers). The single final check only grades the final step — there is no
  earlier answer-bearing step being graded confusingly.
- **EvL1P3**: `compare` (spin the wheels, exploratory) → `decide` (FINAL,
  choice + optional reason).

So the migration is: keep each first step's existing `canAdvance` gate (no Check),
keep the holistic completion check on the final step (`stepId: 'final'`,
`canComplete`), and wire up the new infra (status badge + `onStepChange`).

## Per problem

### EvL1P3CompareGames (`ev-l1-p3`)
- `compare` step: unchanged, still exploratory (`canAdvance` defaults to true).
- `decide` step (FINAL):
  - `status: checks.decide` badge driven by the holistic `checkEvL1P3(...)` result
    via `statusFromResult`.
  - Selecting a new choice OR reason clears the badge
    (`setChecks((p) => ({ ...p, decide: undefined }))`) — direct-correction.
  - The "Check answer" button now computes the `CheckResult` once, sets the badge,
    then calls `session.handleCheck(result, 'final', …)` (still the holistic
    completion check that drives `canComplete`). Added `ws-step-check` class.
  - `choice`/`reason` are NOT independent (reason only appears when `choice ===
    'same'`), so per the contract I did NOT add a separate per-step check for
    `choice`; the decide step completes via the holistic checker.
- `onStepChange={session.clearFeedback}` added to `ProblemLayout`; `checks` reset
  in `onRestart`.

### Problem7WholeEVModel (`ev-l5-p1`, problem-7)
- `play` step: unchanged, still exploratory (`canAdvance: gateMet`,
  `advanceHint: playAdvanceHint` — ran ≥10 each + one 100-run batch).
- `questions` step (FINAL, bundles sameEV / riskier / why):
  - `status: checks.questions` badge driven by the holistic
    `checkSameAverageDifferentRide(...)` result via `statusFromResult`.
  - Changing any of the three answers (`setSameEV` / `setRiskier` / `setWhy`)
    clears the badge via `clearQuestionsBadge()` — direct-correction.
  - "Submit answers" computes the `CheckResult` once, sets the badge, then calls
    `session.handleCheck(result, 'final', …)` (unchanged holistic completion check).
- `onStepChange={session.clearFeedback}` added to `ProblemLayout`; `checks` reset
  in `onRestart`.

## Component state pattern used (copied from EvL2P3 / agent-1-foundation)

```ts
type StepStatus = 'correct' | 'incorrect' | undefined
function statusFromResult(result: CheckResult): StepStatus {
  if (result.isCorrect) return 'correct'
  if (result.mistakeType === '') return undefined   // guard / not answerable
  return 'incorrect'
}
```

In Problem7 `statusFromResult` also treats `mistakeType === null` as `undefined`,
because `problem-7.ts`'s `guard()` uses `mistakeType: null` (not `''`). This only
matters defensively — the Submit button is disabled until `gateMet && allAnswered`,
so the holistic checker never returns a guard at submit time; it returns either a
correct result or a `fail(...)` with a non-null `mistakeType`.

## Why no per-step checker helpers were added

The contract (interfaces.md §5 step 4, agent-1 pattern step 7) says the LAST step
keeps the holistic checker and "set its badge from the per-step checker for that
field." For EvL2P3 a separate per-step checker (`checkEvL2P3DefectB`) was used
because the holistic checker walks fields in order and could surface an *earlier*
field's error on the final step.

For BOTH problems here, the final step is the ONLY gradable step, so the holistic
checker's result already reflects exactly that step's fields — it IS the per-step
checker for that step. Setting the badge directly from the holistic result is
therefore correct and adds no risk of a misleading badge.

Deliverable #3 also asks: if Problem7's `questions` step bundles multiple
sub-answers, add per-step helper(s) so feedback is specific. The existing holistic
`checkSameAverageDifferentRide` already returns **field-specific** feedback — it
checks `sameEV`, then `riskier`, then `why` in order and returns the message for
the first wrong one (distinct `mistakeType`s: `claimed-different-ev`,
`selected-printer-as-riskier`, `claimed-no-risk-difference`, `claimed-slot-higher-ev`,
`misjudged-printer-payout`). So feedback is already specific without splitting the
single final step into multiple Check buttons. No data-file change was needed.

## Blockers

None.

### Shared-checker note (not a blocker — no restructuring needed)
`checkSameAverageDifferentRide` lives in `src/data/problems/problem-7.ts` and is
also imported by `src/validation/liveCheckers.ts` and
`src/components/problems/lesson5-checkers.test.ts`. Because no per-step helper was
required (see above), I did NOT touch that file at all, so there is no risk to the
shared consumers. If a future change wants granular per-question checkers for
Problem7, they should be ADDED alongside the existing holistic export without
altering `checkSameAverageDifferentRide`.

## Out-of-scope observations
None encountered.
