# Handoff: agent-5-evab (T-006)

## Files touched (only these)
- `src/components/problems/EvL1P2UnequalSpinner.tsx`
- `src/components/problems/EvL1P3CompareGames.tsx`
- `src/components/problems/EvL2P2MatchOutcomes.tsx`

All three now import the shared primitive:
`import { QuestionPrompt } from '../../features/learning-experience'`

No CSS, data, logic, checker, state, or gating changes. Pure presentation
wrapping of the existing `prompt` field (which accepts ReactNode).

## What question I emphasized in each

### EvL1P2UnequalSpinner.tsx (3 workspace steps)
- `predict` step: **"Which average payout per spin do you expect?"**
  (supporting prose kept below: "Pick a prediction, then submit it.")
- `spin` step: **"Spin many times and watch the average settle."**
  (the `(X/100)` counter kept below as normal prose: "X/100 spins")
- `identify` step: **"What is the long-run average per spin?"**
  (supporting prose: "Enter your answer, then submit it.")

### EvL1P3CompareGames.tsx (2 workspace steps)
- `compare` step: **"Spin each wheel and watch its observed average over many plays."**
  (wording identical — whole prompt is the task)
- `decide` step: **"Which game has the higher expected value?"** — the core
  decision question (matches the step title).
  (supporting prose: "Pick the higher-EV game — and the reason, if they tie — then check.")

### EvL2P2MatchOutcomes.tsx (1 workspace step)
- `match` step: **"Match each payout to its probability."** (matches step title).
  The pre-existing dynamic `currentTask` procedural hint is preserved as normal
  prose under the callout, so the `currentTask` variable stays in use.

## Rephrasing notes (meaning unchanged)
- "Pick the average payout per spin you expect" → crisp question "Which average
  payout per spin do you expect?"; "then submit it" kept as prose.
- "Enter the long-run average per spin" → question "What is the long-run average
  per spin?"; "then submit your answer" kept as prose.
- "Pick the game with the higher expected value — and the reason… then check"
  → the question is the title line "Which game has the higher expected value?";
  the pick/reason/check instruction kept as prose (lightly shortened
  "the game with the higher expected value" → "the higher-EV game" to avoid
  double-stating the bolded question).
- L2P2: emphasized the stable task ("Match each payout to its probability")
  rather than the changing `currentTask` procedural hint, since the tester
  needed to know the actual task.

Supporting prose renders de-bolded/normal because foundation's
`.ws-prompt:has(.question-prompt)` rule sets the wrapper to font-weight 400 and
`.ws-prompt p { margin: 0 }`. No new classes introduced.

## Verification
- `npm run lint` (oxlint): exit 0. Only pre-existing `only-export-components`
  warnings in other files; none in my three. No new issues.
- `npx tsc -b`: no errors in any of my three files.

## Blockers
None.
