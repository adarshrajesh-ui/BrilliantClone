# Handoff — agent-1-data (T-001: Data + checker + spec)

Run: `2026-06-24-claw-machine-l2p1`
Status: **DONE**. My four files typecheck and the checker unit test passes (7/7).

## What I changed

### `src/data/problems/problem-2.ts` (edited)
- Kept all stable identifiers: `problemId: 'problem-2'`, `canonicalSlug: 'ev-l2-p1'`,
  `legacyProblemId: 'l2-build-weighted-average'`, `masteryTags: ['weighted-average']`.
- Kept exports unchanged: `PROBLEM_2`, `checkProblem2PrizeBoard`, and the type
  `Problem2PrizeBoardCheckInput` (so `src/validation/liveCheckers.ts` needs no edit).
- **Gate field renamed `bothDropped` → `grabsComplete`** in `Problem2PrizeBoardCheckInput`.
- **Added `export const REQUIRED_GRABS = 8`.**
- Metadata rewritten for the claw machine:
  - `title: 'Claw Machine Expected Value'`
  - `visualType: 'claw-machine'`, `interactionType: 'claw-grab-then-formula'`
  - `givenData`: `{ outcomes: [20,0], probabilities: [0.25,0.75], cards: ['$20','$0','25%','75%'], zones: 4, prizeZones: 1, requiredGrabs: 8 }`
  - `requiredActions: ['run-8-grabs', 'view-contribution-compression', 'place-formula-pairs', 'submit-ev']`
  - `answerInputs: ['grabs', 'formulaSlots', 'evAnswer']`
  - `correctAnswers` and `acceptedFormats` UNCHANGED (`slots: ['$20','25%','$0','75%']`, `ev: 5`).
  - Kept the same 3 `mistakeRules` (`reversed-outcome-probability`, `omitted-probability`,
    `used-largest-payout`) reworded to claw-machine framing.
  - New `feedback.correct`, `teachingExplanation` (3 paragraphs incl. short-run≠EV), hints
    `p2-h1..p2-h3`, and `completionRule`.

### `src/data/problems/problem-2.checker.test.ts` (created)
Vitest, mirrors `EvL4P3BetterGame.checker.test.ts` style. Covers: REQUIRED_GRABS=8,
gate when `grabsComplete:false` (mistakeType `''`), accepts correct + `$5.00` +
reversed-order variants (canComplete true), and classifies
`reversed-outcome-probability`, `omitted-probability`, `used-largest-payout` (evAnswer `'20'`),
plus the empty-formula guard.

### `src/core/progression/canonical.ts` (edited)
ev-l2-p1 row title only: `'Prize Board Weight Drop'` → `'Claw Machine Expected Value'`.
Concept summary (`'EV is a weighted average of outcomes.'`) left as-is — it did not name
the prize board.

### `prd.md` (edited)
Only the **Lesson 2, Problem 1** section (now "Claw Machine Expected Value"): rewrote
title, scenario, phases (claw machine → contribution compression → formula), no-scroll
split layout, animations, reduced-motion, mistakes, accepted answers, validation cases,
and the `grabsComplete` gate. All other PRD sections untouched. (Note: the L2 summary
table row at line ~310 and the gate mention at line ~1883 still say "board-before-formula"
/ generic wording — left untouched as out of my single-section scope; flag for orchestrator
if a global PRD sweep is desired.)

## Final checker contract (for downstream agents)

```ts
export const REQUIRED_GRABS = 8

export interface Problem2PrizeBoardCheckInput {
  grabsComplete: boolean              // was: bothDropped
  slots: [string, string, string, string]
  evAnswer: string
}

export function checkProblem2PrizeBoard(input: Problem2PrizeBoardCheckInput): CheckResult
```

Grading order (unchanged except first guard):
1. `!grabsComplete` → guard, mistakeType `''`, canComplete false:
   "Run all your claw drops and view the contribution breakdown before pairing the formula."
2. 0 slots filled → guard "Select a card, then tap an empty formula slot to place it."
3. `<4` slots filled → `omitted-probability`.
4. wrong pairing → `reversed-outcome-probability`.
5. evAnswer == 20 → `used-largest-payout`.
6. evAnswer != 5 → `arithmetic-error` (inline feedback).
7. correct → `{ isCorrect:true, mistakeType:null, canComplete:true }`.

Correct pairing (either order): `['$20','25%','$0','75%']` or `['$0','75%','$20','25%']`.
EV accepted via `matchesNumeric(evAnswer, [5])` → `5, 5.0, 5.00, $5, $5.00`.

## Notes for agent-4 (component) and agent-5 (validation)

- **BREAKING for callers: the gate field is now `grabsComplete` (boolean), not `bothDropped`.**
  Update every `checkProblem2PrizeBoard({ ... })` call site.
  - agent-4 `Problem2WeightedAverage.tsx`: compute
    `grabsComplete = grabs.length >= REQUIRED_GRABS && viewedCompression` and call
    `checkProblem2PrizeBoard({ grabsComplete, slots, evAnswer })`.
  - agent-5 must update `src/validation/answerValidationMatrix.ts` (5 call sites currently
    pass `bothDropped`) and `src/components/problems/agent3-checkers.test.ts` (6 call sites).
- New exact title string everywhere: **`Claw Machine Expected Value`**. agent-5 must match it
  in `problemBehaviorValidation.ts` and `answerValidationMatrix.ts` descriptor rows.
- `REQUIRED_GRABS` is exported from `problem-2.ts` for reuse (default 8).

## Verification

- `npx vitest run src/data/problems/problem-2.checker.test.ts` → **7 passed**.
- `npx tsc -b` → my 4 files clean. Remaining errors are ONLY in sibling-owned, in-progress
  files (expected mid-build, all from the `bothDropped` → `grabsComplete` rename and an
  unrelated `JSX` namespace issue in agent-3's `ClawContributionBlocks.tsx`):
  - `src/components/problems/Problem2WeightedAverage.tsx` (agent-4)
  - `src/components/problems/agent3-checkers.test.ts` (agent-5)
  - `src/validation/answerValidationMatrix.ts` (agent-5)
  - `src/components/visuals/ClawContributionBlocks.tsx` (agent-3, `Cannot find namespace 'JSX'`)

## Blockers
None for T-001.
