# Handoff: agent-2-l1 (bold-question)

## Files touched
- `src/components/problems/Problem1LongRunAverage.tsx`
- `src/components/problems/Problem1SpinnerPlayground.tsx`
- `src/components/problems/Problem2WeightedAverage.tsx`

All edits are pure presentation: imported `QuestionPrompt` from
`../../features/learning-experience` and wrapped the single actual task/question
in each step/section. No logic, state, checker, data, or `canAdvance`/
`advanceHint` gating changed.

## What question was emphasized

### Problem1LongRunAverage.tsx
- Step `throw`: wrapped the per-step task — "Throw the dice or use batch rolls to
  reach 100 total rolls (X/100)." The live `(X/100)` counter stays inside the
  prompt (it's the task's progress). Default label "Your task".
- Step `identify`: this is the problem's core question. Rephrased the instruction
  "Enter the long-run average sum per roll, then submit your answer." into the
  crisp question **"What is the long-run average sum per roll?"** (meaning
  unchanged — they still enter that value via the visible field/Submit button).
  This matches the exact example in `interfaces.md`.

### Problem1SpinnerPlayground.tsx
- This is an exploratory playground (it has a separate "Go to question" button),
  so there is no graded question here. Emphasized the exploration task —
  "Change the chances and payouts, then spin to see how the long-run average
  responds." — using `<QuestionPrompt label="Explore">`.
- Split the original two-sentence `.section-note` so the supporting line "When
  you are ready, continue to the official problem." stays as normal prose
  (avoids an invalid `<div>` inside `<p>`, since QuestionPrompt renders a div).

### Problem2WeightedAverage.tsx
- Step `run`: wrapped the per-step task — "Drop the claw N times and watch the
  payout tray fill up."
- Step `compress`: wrapped both prompt branches. Pre-compression: "Compress the
  pit to see how each outcome contributes payout × probability." Post-
  compression: the dynamic `formulaPrompt` (which culminates in the actual
  question "Now compute the expected value of one grab and enter it."). Kept
  `formulaPrompt`'s exact wording and conditional logic intact — just wrapped.

## Rephrasing done
- Only one: Problem1 step `identify` prompt was rephrased from an "Enter…/submit"
  instruction into the direct question form. Meaning preserved. All other text is
  byte-identical to before, just wrapped.

## Notes / pre-existing issue resolved
- The noted tsc error in `Problem1LongRunAverage.tsx` around the `DiceTray3D`
  usage: in the current tree `DiceTray3DProps.disabled` is now a **required**
  prop, but the call site omitted it (so it failed type-check). This is a trivial
  in-file fix, so I added `disabled={false}` at the call site — preserves
  existing behavior (the tray was always enabled). Did NOT edit `DiceTray3D`.

## Verification
- `npm run lint` (oxlint): exit 0. No new warnings introduced. (Pre-existing
  `only-export-components` warnings in `Problem1SpinnerPlayground.tsx` are about
  its exported constants/functions, unrelated to this change.)
- `npx tsc -b`: zero errors in my three files (overall build still exits non-zero
  due to unrelated in-flight files from other agents).

## Blockers
- None.
