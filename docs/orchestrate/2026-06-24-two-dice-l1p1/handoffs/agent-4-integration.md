# Handoff — agent-4-integration (T-004)

## Status: COMPLETE

Wired the two-dice sum model + the two new visuals into Lesson 1 Problem 1, updated
the no-scroll layout and validation surfaces, removed dead code, and verified the
whole repo builds/lints/tests clean.

## Files changed (within scope)
- `src/components/problems/Problem1LongRunAverage.tsx` — rewired to `diceRollForThrow`,
  prediction choices 2/7/12, `DiceTray3D`, `RunningAverageGraph` (target 7, maxY 12),
  `SumHistogram`; new state (`sumTotal`, `counts[11]`, `lastDice`, `lastSum`); Roll 1 /
  Roll 10 / Roll 100 fallback buttons (Roll 1 counts as a manual roll for keyboard/touch
  users; Roll 10/100 unlock after 5 manual rolls); demo, stats, prompts, aria-live, and
  completion message all updated for sums → 7. Defensive `normalizeCounts` guards stale
  persisted state.
- `src/components/problems/l1-workspace.css` — ADDITIVE only: new `.l1-graphs` grid
  (running-average graph + sum histogram side by side, full-width below the tray) plus a
  mobile stacking rule. Did NOT touch shared `.l1-play` / `.l1-side` / `.l1-graph` /
  `.l1-compare` (still used by ev-l1-p2 / ev-l1-p3).
- `src/validation/answerValidationMatrix.ts` — rewrote the ev-l1-p1 live-checker cases
  (correct = 7; mistakes 2/12 → chose-extreme-outcome, 3.5 → used-single-die-average,
  6.5 → assumed-sample-equals-ev; guards finalAnswer 7) and the `problemSpecs` problem-1
  row (title, correctAnswer "7 (sum of two dice)", accepted formats, mistake types, gate).
  Lightly de-staled two money-normalizer `prdReason` strings that referenced L1P1.
- `src/validation/problemBehaviorValidation.ts` — problem-1 behavior (title, completion
  requires, requiredActions, mistake types, hint/feedback behavior) + the reduced-motion
  note now cites `diceRollForThrow`.
- `src/validation/liveCheckerValidation.test.ts` — L1P1 gate test answer 5 → 7 (still a guard).
- `src/core/progression/canonical.ts` — nav title `Dice Toss Average` → `Two-Dice Roll Average`
  (single problem-1 metadata string; no progression logic touched).
- `src/components/lesson/ProblemLayout.tsx` — ADDITIVE: hint-cue map entry for the new
  `dice-tray` visual type (only problem-1 uses it).

## Files deleted
- `src/components/visuals/DiceThrowZone.tsx` + `.css` — old single-die throw zone, only
  ever imported by Problem 1 (verified by grep); replaced by `DiceTray3D`.

## Not touched (per constraints)
- No other problem's data/component/test. No auth/Firebase. No progression logic beyond
  the one nav-title string. No AI.

## Verification (repo root)
- `npm run build` → ✅ tsc -b + vite build clean.
- `npm run lint` → ✅ only pre-existing fast-refresh warnings in unrelated files; none from
  the new `DiceTray3D` / `SumHistogram` / `problem-1` files.
- `npm run test` → ✅ **563 passed (30 files)**, including the rewritten ev-l1-p1 checker
  block and the live-checker validation matrix.

## Blockers
None.
