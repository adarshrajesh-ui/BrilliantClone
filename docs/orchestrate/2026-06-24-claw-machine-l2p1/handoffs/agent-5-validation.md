# Handoff — agent-5-validation (T-005: Validation matrices + tests)

Run: `2026-06-24-claw-machine-l2p1`
Status: **DONE**. All five owned files migrated to the `grabsComplete` gate and the
`Claw Machine Expected Value` title. `npm test` → 570/570 passing. The only remaining
`npx tsc -b` error is in agent-4's `Problem2WeightedAverage.tsx` (out of my scope).

## What I changed

### `src/validation/answerValidationMatrix.ts`
- Section comment (line ~162): `Prize Board Weight Drop` → `Claw Machine Expected Value`.
- 5 live-checker cases (`l2p1-correct`, `l2p1-mistake-reversed`, `l2p1-mistake-largest`,
  `l2p1-mistake-omitted`, `l2p1-guard-board`): input field `bothDropped:` → `grabsComplete:`
  with identical boolean values (`true` for the four non-gate cases, `false` for
  `l2p1-guard-board`). Math, `slots`, `evAnswer`, `kind`, and `expectedMistakeType` unchanged.
- `l2p1-correct` description: "both dropped..." → "grabs complete, correct pairs, EV 5".
- `l2p1-guard-board` description + `prdReason`: now "run ≥8 claw drops + view contribution
  compression before the formula" (was "board-before-formula / both tokens dropped first").
- `problemSpecs` row for `problem-2` (line ~266): `title` → `'Claw Machine Expected Value'`;
  `gate` → `'run ≥8 claw drops + view contribution compression before formula'`.
  `correctAnswer`, `acceptedFormats`, `mistakeTypes` unchanged.

### `src/validation/problemBehaviorValidation.ts`
- `problem-2` / `ev-l2-p1` entry:
  - `title` → `'Claw Machine Expected Value'`.
  - `completionRequires` → `['ran ≥8 claw drops', 'viewed contribution compression', 'both outcome↔probability pairs placed', 'EV = 5']`.
  - `requiredActions` → `['run-8-grabs', 'view-contribution-compression', 'place-formula-pairs', 'submit-ev']` (matches `problem-2.ts` `requiredActions` exactly).
  - `hintBehavior` / `feedbackBehavior` reworded to claw-machine framing (grabs-before-formula gate).
  - `expectedMistakeTypes` unchanged.

### `src/validation/liveCheckerValidation.test.ts`
- Gate test (was "L2P1 locks the formula until both board tokens are dropped"):
  `it(...)` renamed to "L2P1 locks the formula until ≥8 claw drops are run and compression is
  viewed"; `runLiveChecker('problem-2', { bothDropped: false, ... })` → `grabsComplete: false`.
- Direct-correction pair ("a corrected L2P1 resubmission passes…"): both
  `runLiveChecker('problem-2', { bothDropped: true, ... })` calls → `grabsComplete: true`.
- All assertions (`canComplete`, `mistakeType`, `isGradedAttempt`) unchanged.

### `src/components/problems/agent3-checkers.test.ts`
- `describe('ev-l2-p1 — Prize Board Weight Drop', …)` → `describe('ev-l2-p1 — Claw Machine Expected Value', …)`.
- First `it(...)` renamed: "gates board drops before formula" → "gates claw drops +
  compression before formula".
- All 6 `checkProblem2PrizeBoard({ bothDropped: … })` call sites → `grabsComplete: …`
  (same boolean values). Assertions unchanged.

### `src/validation/prdCoverage.test.ts`
- **No change needed.** It only maps storage IDs → slugs (`'problem-2': 'ev-l2-p1'` stays)
  and asserts structure/progression/mastery; it never reads or asserts the L2P1 title.
  Verified green via `npm test`.

## bothDropped → grabsComplete migration confirmation

`rg "bothDropped|Prize Board Weight Drop|drop-both-tokens|both tokens dropped" src` after my
edits shows ZERO matches in any file I own. Remaining matches are out of scope:
- `src/data/problems/problem-2.ts:62` — a doc comment referencing the *old* `bothDropped`
  gate name (agent-1 owns it; harmless).
- `src/components/problems/Problem2WeightedAverage.tsx:43,58,119` — agent-4's component,
  still using a local `bothDropped` and calling `checkProblem2PrizeBoard({ bothDropped, … })`.

## Verification

- `npx tsc -b` → ONE error, owned by agent-4, not me:
  `src/components/problems/Problem2WeightedAverage.tsx(119,43): error TS2353: 'bothDropped'
  does not exist in type 'Problem2PrizeBoardCheckInput'.`
  All five of my files typecheck clean. This resolves once agent-4 renames the component's
  call site to `grabsComplete` (compute `grabs.length >= REQUIRED_GRABS && viewedCompression`).
- `npm test` (vitest run) → **Test Files 31 passed (31), Tests 570 passed (570)**, including
  `liveCheckerValidation.test.ts`, `agent3-checkers.test.ts`, and `prdCoverage.test.ts`.
  (Vitest transpiles without typechecking, so the agent-4 tsc error does not affect the run.)

## Failures believed to belong to agent-4

- The single `tsc -b` error in `Problem2WeightedAverage.tsx` is agent-4's remaining work
  (the `bothDropped` → `grabsComplete` call-site rename). No test failures attributable to me.

## Blockers
None for T-005.
