# Handoff: agent-7-integration (bold-question)

## Results
- **Build** (`npm run build` = `tsc -b && vite build`): PASS, exit 0. 187 modules,
  built clean. (Only the pre-existing >500 kB chunk-size advisory, unrelated to this run.)
- **Lint** (`npm run lint`, oxlint): PASS, exit 0. No errors. Only pre-existing
  `react(only-export-components)` fast-refresh warnings in files this run did not
  touch — left as-is.
- **Test** (`npm run test`, vitest run): PASS. 35 files, 619 tests, 0 failures.

## Fixes made
None required. The whole run integrates clean — no TypeScript, lint, or test
errors were introduced by the `QuestionPrompt` wrapping. No edits to source files
were needed.

## Verification details
- **Agent-6's flag on `Problem4CalculateEV.tsx` (unused `QuestionPrompt` import):
  STALE / not an issue.** The import IS used — two step prompts wrap their question
  via `<QuestionPrompt>` (lines 38 and 57). Nothing to remove.
- **Consistency pass:** All 16 problem components owned by this run render their
  primary question through `QuestionPrompt`:
  EvL1P2UnequalSpinner, EvL1P3CompareGames, EvL2P2MatchOutcomes, EvL2P3DiagnoseSetups,
  EvL3P3PrizeBagTable, EvL4P3BetterGame, EvL5P3FinalDecision, Problem1LongRunAverage,
  Problem1SpinnerPlayground, Problem2WeightedAverage, Problem3MysteryBoxes,
  Problem4CalculateEV, Problem5PayoutVsProfit, Problem6FairnessSort,
  Problem7WholeEVModel, Problem8SameEVDifferentRisk.
- **Eyebrow labels reasonable:** default `Your task` for action steps, `label="Question"`
  for actual interrogative questions (EvL2P3, EvL4P3, EvL5P3), `label="Explore"` for
  the open-ended exploration step (Problem1SpinnerPlayground). No double-labeling.
- **No invalid DOM:** inline (non-step-string) usages render the `QuestionPrompt`
  div as a sibling to supporting `<p>` prose inside the step `ws-prompt` container,
  not nested inside a `<p>`. Verified spot-checks (EvL1P2UnequalSpinner, Problem6FairnessSort).

## Remaining known issues
- **Out-of-scope (other concurrent parallel runs):** Four problem `.tsx` files
  present plain-string step prompts and do NOT use `QuestionPrompt`:
  `Problem3AverageCardValue.tsx`, `EvL3P3MiniDeckTable.tsx`,
  `Problem4DealtHandContributions.tsx`, `Problem5PayoutPlayground.tsx`.
  These are untracked files created by separate parallel runs (card-table /
  dealt-hand / payout-playground), not part of the bold-question run's scope, so
  they were intentionally left untouched. If desired, a follow-up can wrap their
  primary questions in `QuestionPrompt` for visual consistency.
- Pre-existing fast-refresh lint warnings (`only-export-components`) across several
  visual/problem files — not introduced by this run; not addressed.
