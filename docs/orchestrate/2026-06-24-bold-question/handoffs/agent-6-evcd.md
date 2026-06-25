# Handoff: agent-6-evcd (bold-question)

## Summary
Wrapped the single actual question/task of every workspace step in the shared
`QuestionPrompt` callout across my four EV problems. Pure presentation — no
logic, state, checker, gating, or data changes. Import added to each file:
`import { QuestionPrompt, type WorkspaceStepDef } from '../../features/learning-experience'`
(folded into the existing `WorkspaceStepDef` import).

## Files touched (4, all ALLOWED)
- `src/components/problems/EvL2P3DiagnoseSetups.tsx`
- `src/components/problems/EvL3P3PrizeBagTable.tsx`
- `src/components/problems/EvL4P3BetterGame.tsx`
- `src/components/problems/EvL5P3FinalDecision.tsx`

No `.css`, no `src/data/**`, no other files touched.

## What question was emphasized per step

### EvL2P3DiagnoseSetups
- `valid` → "Select the formula that is a valid, complete EV model." (default label)
- `diagnose-a` → "What is wrong with Formula A?" (`label="Question"`)
- `diagnose-b` → "What is wrong with Formula B?" (`label="Question"`); the
  "Then check your diagnosis." instruction kept as plain prose after the callout.

### EvL3P3PrizeBagTable
- `tokens` → context sentence "Each token is a prize you could draw." kept as
  prose; task "Note how many of each are in the bag of 10." wrapped.
- `table` → "For each outcome: count, then probability (count ÷ 10), then contribution (outcome × probability)." wrapped.
- `ev` → "Add the contributions to find the expected value." wrapped.

### EvL4P3BetterGame
- `profits` → "Work out each game's expected profit: payout − cost." wrapped
  (apostrophe kept as `{'\u2019'}` inside JSX).
- `choose` → wrapped as "Which is the better game for the player?"
  (`label="Question"`); "Then submit your choice." kept as prose.

### EvL5P3FinalDecision (capstone, 7 steps)
- `group` → "Tap the wheel sections to group them by payout." wrapped.
- `table` → "Enter each probability (sections ÷ 12), then each contribution (outcome × probability)." wrapped.
- `payout` → "Add the contributions for the expected payout." wrapped.
- `profit` → "Subtract the $6 cost for the expected profit." wrapped.
- `decide` → rephrased "Classify the game: fair, favorable, or unfavorable." →
  "Is the game fair, favorable, or unfavorable?" (`label="Question"`, meaning unchanged).
- `risk` → "Interpret the remaining risk." wrapped; "Then submit your full model."
  kept as prose.

## Rephrasing notes (meaning preserved)
- EvL4P3 `choose`: imperative "Choose the better game for the player" →
  interrogative "Which is the better game for the player?" (mirrors the in-content
  `<legend>`).
- EvL5P3 `decide`: imperative "Classify the game: …" → "Is the game …?"

All other wording is byte-identical to the originals; only wrapping/splitting of
supporting instructions ("then …") was done.

## Verification
- `npm run lint` (oxlint): exit 0. No warnings in any of my four files. (Pre-existing
  warnings exist elsewhere, including an unused `QuestionPrompt` import in
  `Problem4CalculateEV.tsx` owned by another agent — not mine.)
- `npx tsc -b`: no errors in my four files (`prompt?: ReactNode` accepts the JSX;
  step `prompt` renders inside a `<div className="ws-prompt">`, so text fragments
  beside the callout are valid).

## Blockers
None.
