# Handoff: agent-4-model (bold-question)

## Files touched (only the 3 allowed)
- `src/components/problems/Problem6FairnessSort.tsx`
- `src/components/problems/Problem7WholeEVModel.tsx`
- `src/components/problems/Problem8SameEVDifferentRisk.tsx`

All used `import { QuestionPrompt } from '../../features/learning-experience'`.
No `.css`, no `src/data/**`, no logic/checker/state/gating changes — pure
presentation wrapping of the step `prompt` (which is `ReactNode`).

## What question I emphasized in each

### Problem 6 — Fairness Sort (1 step)
- Step `sort` prompt was the dynamic `currentTask` (procedural next-action
  guidance). I added a fixed `<QuestionPrompt>Sort each game as Fair, Favorable,
  or Unfavorable.</QuestionPrompt>` as the bold task, and kept `currentTask`
  below it as normal supporting prose so the live step-by-step guidance is
  preserved.
- Rephrasing: added a crisp question line ("Sort each game as Fair, Favorable,
  or Unfavorable.") that names the three actual bucket labels. Meaning unchanged;
  the dynamic guidance text is untouched.

### Problem 7 — Whole EV Model (2 steps)
- Step `play`: original prompt was
  "Both machines average $10. Run each at least 10 times — and one 100-run batch
  — then watch how differently they get there." Split into context prose
  ("Both machines average $10 — watch how differently they get there.") plus the
  emphasized task `<QuestionPrompt>Run each machine at least 10 times, including
  one 100-run batch.</QuestionPrompt>`. Light rephrase only; meaning unchanged.
- Step `questions`: wrapped the task `<QuestionPrompt>Answer all three questions,
  then submit.</QuestionPrompt>` ("three" → "three questions"). The three
  `<legend>` questions inside the fieldsets were left as-is.

### Problem 8 — Same EV, Different Risk (3 steps)
- Step `simulate`: `<QuestionPrompt>Run 20 simulated trials for each game.</QuestionPrompt>` (verbatim).
- Step `ev`: `<QuestionPrompt>Enter the expected value for each game ($6 each).</QuestionPrompt>` (verbatim).
- Step `risk`: `<QuestionPrompt>Select the riskier game and the reason why, then submit.</QuestionPrompt>` (verbatim).

## Verification
- `npm run lint` (oxlint): exit 0. No new warnings in my 3 files (only
  pre-existing `only-export-components` warnings elsewhere).
- `npx tsc -b`: no type errors in any of my 3 files.

## Blockers
None.
