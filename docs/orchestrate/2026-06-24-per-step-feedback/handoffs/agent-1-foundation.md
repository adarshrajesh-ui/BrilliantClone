# Handoff: agent-1-foundation (T-001)

Per-step feedback infra + EvL2P3 reference migration. Phase 2 (T-002/003/004)
builds against the finalized contract below.

## Status: DONE

- Lint: `npm run lint` → exit 0 (only pre-existing `react(only-export-components)`
  warnings in unrelated files; none in files I touched).
- Tests: `npm test` → 35 files, 619 tests, all passing.
- No commit made (per instructions).

## Files changed (all within allowed scope)

- `src/features/learning-experience/WorkspaceSteps.tsx` — infra
- `src/components/lesson/ProblemLayout.tsx` — infra
- `src/features/learning-experience/workspace.css` — badge + step-check styles
- `src/data/problems/ev-l2-p3.ts` — per-step checkers
- `src/components/problems/EvL2P3DiagnoseSetups.tsx` — reference migration
- `docs/orchestrate/2026-06-24-per-step-feedback/interfaces.md` — finalized note

`src/features/learning-experience/index.ts` needed NO change: it already
re-exports `WorkspaceStepDef` and `WorkspaceStepsProps`, and I only added optional
fields to those existing interfaces.

`useProblemSession.ts` was NOT touched (forbidden); `clearFeedback` and
`handleCheck(result, stepId, submitted, normalized)` were already sufficient.

## Final new prop signatures

```ts
// WorkspaceStepDef (extended)
status?: 'unanswered' | 'correct' | 'incorrect'

// WorkspaceStepsProps (new)
onStepChange?: (newIndex: number) => void   // called only on an actual index change (Prev/Next)

// ProblemLayoutProps (new)
onStepChange?: () => void                    // forwarded as onStepChange={() => onStepChange?.()}
```

WorkspaceSteps now:
- Routes Prev/Next through a single `goToStep(target)` that clamps, updates the
  index, and calls `onStepChange(newIndex)` ONLY when the index actually changes.
- Renders the active step's `status` as a badge next to `.ws-step-indicator`:
  `✓` (`.ws-step-status-correct`) / `!` (`.ws-step-status-incorrect`).

ProblemLayout forwards `onStepChange` into WorkspaceSteps unchanged.

## Per-step checker helpers added (ev-l2-p3.ts)

Each validates ONLY its field and returns `CheckResult` with `canComplete: false`
(completion stays on holistic `checkEvL2P3` via the `final` step). Guard results
use `mistakeType: ''`. Existing `checkEvL2P3` export is unchanged.

```ts
export function checkEvL2P3ValidStep(valid: EvL2P3Formula | null): CheckResult
export function checkEvL2P3DefectA(defectA: EvL2P3Defect | null): CheckResult
export function checkEvL2P3DefectB(defectB: EvL2P3Defect | null): CheckResult
```

They reuse the same `mistakeRules` indices / mistakeType strings as the holistic
checker (`chose-raw-sum`, `chose-incomplete`, `wrong-defect-a`, `wrong-defect-b`)
so attempt records and coach feedback stay consistent.

## Component state pattern (COPY THIS for T-002/003/004)

1. Keep answer fields in the persisted problem state (unchanged).
2. Add a local, NON-persisted badge map:
   ```ts
   type StepStatus = 'correct' | 'incorrect' | undefined
   const [checks, setChecks] = useState<Checks>(NO_CHECKS)
   function statusFromResult(r: CheckResult): StepStatus {
     if (r.isCorrect) return 'correct'
     if (r.mistakeType === '') return undefined   // guard / not answerable
     return 'incorrect'
   }
   ```
3. Each gradable step gets an inline `Check` button (`className="... ws-step-check"`,
   `disabled` until its field is filled) whose handler:
   - computes the per-step `CheckResult`,
   - `setChecks((p) => ({ ...p, <field>: statusFromResult(result) }))`,
   - `void session.handleCheck(result, '<stepId>', submitted, normalized)`.
4. Step def wiring:
   - `status: checks.<field>`
   - `canAdvance: checks.<field> === 'correct'`
   - `advanceHint: 'Check this step and fix it to continue.'`
5. Selecting a new option for a step clears that step's badge in the same onClick:
   `setChecks((p) => ({ ...p, <field>: undefined }))` (direct correction; the
   session's own state-signature effect separately clears stale coach feedback).
6. LAST step uses the holistic checker, `stepId: 'final'`, NO `canAdvance` gate
   (it is the last step), but still set its badge from the per-step checker for
   that field so the ✓/! shows.
7. `<ProblemLayout ... onStepChange={session.clearFeedback} />`.
8. Reset the `checks` map in `onRestart` (alongside `reset()` + `session.restart()`).

### EvL2P3 reference summary
- Step `valid` (stepId `valid`): `checkEvL2P3ValidStep(state.valid)`, gates Next.
- Step `diagnose-a` (stepId `diagnose-a`): `checkEvL2P3DefectA(state.defectA)`, gates Next.
- Step `diagnose-b` = FINAL (stepId `final`): holistic `checkEvL2P3({...})`,
  drives `canComplete`; badge set from `checkEvL2P3DefectB(state.defectB)`.

## CSS added (workspace.css, shared — already available to Phase 2)
- `.ws-step-status`, `.ws-step-status-correct`, `.ws-step-status-incorrect` (badge)
- `.ws-step-check` (left-aligned inline per-step Check button)

## Deviations
None. Implementation matches the documented contract; interfaces.md got a
"FINALIZED by T-001" section confirming exact names/signatures for Phase 2.

## Blockers
None.
