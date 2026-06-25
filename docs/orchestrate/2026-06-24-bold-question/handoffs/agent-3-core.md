# Handoff: agent-3-core (bold-question)

## Summary
Emphasized the single actual question/task per workspace step using the shared
`QuestionPrompt` primitive. Pure presentation wrapping — no logic, state,
checker, data, or step-gating changes. No `.css` edits.

Import added to each touched file:
```tsx
import { QuestionPrompt } from '../../features/learning-experience'
```

## Files touched

### `src/components/problems/Problem3MysteryBoxes.tsx`
- Step `reveal` prompt → `<QuestionPrompt>Tap each box to reveal its prize (X/6).</QuestionPrompt>`
  (kept the `${state.revealed.length}/6` template literal; wrapped via `{`…`}`).
- Step `table` prompt → `<QuestionPrompt>For each prize, convert its given count to a probability (count ÷ 6).</QuestionPrompt>`
- Supporting prose (`.section-note tap-hint`, prob-sum meter) left as normal text.

### `src/components/problems/Problem4CalculateEV.tsx`
- Step `contribs` prompt → `<QuestionPrompt>For each outcome, fill the contribution: outcome × probability.</QuestionPrompt>`
- Step `sum` prompt → `<QuestionPrompt>Now add the three contributions for the final EV.</QuestionPrompt>`

### `src/components/problems/Problem5PayoutVsProfit.tsx`
- `playgroundStep` prompt → `<QuestionPrompt>Use +1 on each side to change the weights, watch the beam tip, then continue when ready.</QuestionPrompt>`
- `payToPlayStep` prompt → `<QuestionPrompt>Drag the $3 cost token into the cost slot (or tap it, then tap the slot).</QuestionPrompt>`
- `profitStep` prompt → `<QuestionPrompt>Now enter the expected profit: expected payout − cost.</QuestionPrompt>`
- Supporting `.section-note` (cost/payout explanation) left as normal prose.

### `src/components/problems/Problem5PayoutPlayground.tsx`
- **Not modified.** This is the playground sub-component rendered as the
  content of `playgroundStep`. The playground phase's actual task is already
  emphasized via that parent step `prompt` (rendered in the `.ws-prompt`
  header). This file only holds a section heading (`<h2>Play with the balance
  scale</h2>`) and supporting exploration instructions — there is no distinct
  question to wrap, and wrapping here would double-emphasize the same task.

## Rephrasing
None. All wording kept identical; only wrapped existing prompt text.

## Verification
- `npm run lint` → exit 0. No new warnings from my edits (the
  `Problem5PayoutPlayground.tsx` fast-refresh warnings are pre-existing, from
  its non-component exports).
- `npx tsc -b` → no errors in any of my four files.

## Blockers
None.
