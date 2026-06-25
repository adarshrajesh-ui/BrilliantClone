You are Agent 6 (Validation, Accessibility & QA harness) for parallel-build-prd run 2026-06-24-ev-lab-15.

READ FIRST (binding, in order):
1. `prd.md` — SOURCE OF TRUTH (do not edit). Focus: Page 8 (feedback/answer rules), Page 9 (review/restart/progress), Page 10 (data schema/mastery), Page 11 (build order, validation, release testing) + each problem's "Validation cases".
2. `docs/orchestrate/2026-06-24-ev-lab-15/plan.md` and `interfaces.md`
3. `docs/parallel/agent-1-core-handoff.md`
4. Existing: read `src/validation/answerValidationMatrix.ts`, `prdValidationChecklist.ts`, `problemBehaviorValidation.ts`, `runValidation.ts`, and `docs/validation-plan.md`.

## YOUR JOB
Update the validation/QA artifacts to the 15-problem (5×3) PRD and the new P1 fun-game gates, WITHOUT importing not-yet-built problem modules (Agents 3/4/5 build those in parallel — their files may be incomplete during your run). Stay at the data/spec/checklist level + core-model assertions.

Deliverables:
- Update `src/validation/answerValidationMatrix.ts` to the 15 problems (ev-l1-p1 … ev-l5-p3): accepted formats + mistake types + correct answers per PRD specs.
- Update `src/validation/prdValidationChecklist.ts` to 15-problem coverage: chapter %÷15, lesson %÷3, mastery 11/15, golf 5×3=15, removed-slug→successor migration, no-scroll-chasing, tap-to-place, reduced-motion-deterministic, the five P1 gates (manual-throw L1P1, board-before-formula L2P1, all-boxes-open L3P1, cost-before-profit L4P1, both-preview L5P1), L5P2≠L5P1 numbers.
- Update `src/validation/problemBehaviorValidation.ts` + `runValidation.ts` accordingly (keep them self-contained / not dependent on the in-flight problem components).
- Add a tests file `src/validation/prdCoverage.test.ts` asserting the canonical 15-model invariants (15 problems, 3/lesson, storage IDs preserved, removed-slug resolution, mastery threshold 11) using `src/core/**` exports only.
- Update `docs/validation-plan.md` to 15 problems + a concrete a11y/tap/reduced-motion/no-scroll manual audit checklist at 1280×720 and mobile.

## ALLOWED PATHS (edit/create only these)
- `src/validation/**` (all, incl. new `prdCoverage.test.ts`)
- `docs/validation-plan.md`

## FORBIDDEN
- All app source outside `src/validation/**` (no edits to `src/core/**`, `src/lib/**`, `src/components/**`, `src/data/**`, `src/features/**`, `src/types/**`, `src/pages/**`).
- Do NOT import problem-component modules under construction (e.g. `EvL1P2*`, `ev-l1-p2.ts`) — they may not compile yet. You MAY import `src/core/**` and `src/data/chapter.ts` (stable).
- `package.json`, `firestore.rules`. Do NOT commit.

## RULES
- No AI checking anywhere. Everything deterministic.
- Do NOT run full `tsc -b`. Scoped: `npx vitest run src/validation`, `npx oxlint src/validation`.

## CHECKPOINTS (auto-proceed)
- CP0: audit current validation artifacts vs PRD; list gaps.
- CP1: matrix + checklist + behavior validation updated to 15 + P1 gates.
- CP2: `prdCoverage.test.ts` + validation-plan.md a11y/audit checklist.
- Handoff: `docs/parallel/agent-6-validation-handoff.md` — what PRD validation is now covered / still manual / not yet automatable (pending problem components), files touched, tests run, risks, recommended Agent 1 integration checks.

After each pass, compare to PRD and record the diff in the handoff.
