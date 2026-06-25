# Handoff: agent-1-foundation (T-001)

## What shipped
A shared, themed, presentation-only `QuestionPrompt` primitive + CSS. Use it to
make the single actual question/task stand out (bold + themed callout) on every
problem.

## Import path
```tsx
import { QuestionPrompt } from '../../features/learning-experience'
```
(`QuestionPromptProps` type is exported from the same barrel.)

## Final prop signature
```tsx
interface QuestionPromptProps {
  children: ReactNode      // the question/task text to emphasize (required)
  label?: string           // eyebrow label, default "Your task"
  hideLabel?: boolean       // true => no eyebrow, text-only emphasis
  className?: string        // passthrough, appended to root
}

function QuestionPrompt(props: QuestionPromptProps): JSX.Element
```

## Markup it renders
```html
<div class="question-prompt {className}">
  <span class="question-prompt-label">Your task</span>   <!-- omitted if hideLabel -->
  <div class="question-prompt-text">{children}</div>
</div>
```

## CSS classes created (in `workspace.css`)
- `.question-prompt` — root callout (subtle `--primary` tint via `color-mix`,
  1px `--border`, 3px left `--primary` accent, rounded, compact padding).
- `.question-prompt-label` — small uppercase themed eyebrow.
- `.question-prompt-text` — the **bold** question (font-weight 700, color
  `--text-heading`). `p` children are margin-reset.
- Context tweaks already included: `.ws-prompt .question-prompt`,
  `.ws-step .question-prompt`, `.task-area .question-prompt`, and
  `.ws-prompt:has(.question-prompt)` (de-bolds the wrapper so no double-bold).

## Usage notes / gotchas for feature agents
- Wrap ONLY the single actual question, not every instruction. Keep supporting
  text as normal prose outside the component.
- For workspace problems: pass it as the step `prompt`:
  ```tsx
  prompt: <QuestionPrompt>What is the long-run average sum per roll?</QuestionPrompt>
  ```
- For inline prompts in content: replace ad-hoc `.ws-prompt-inline` text with
  `<QuestionPrompt>…</QuestionPrompt>`.
- For legacy `taskGuide` problems: wrap the primary question line in it.
- You can pass plain text OR a single `<p>` as children — both render bold.
  Avoid nesting block elements with their own large margins; keep it compact so
  the no-scroll workspace layout isn't pushed.
- Do NOT edit any `.css` — all styling is centralized here. Pass `className` if
  you need a per-problem hook.
- `label` defaults to "Your task"; pass `label="Question"` or `hideLabel` as
  fits the problem.

## Verification
- `npm run lint` (oxlint): clean — no new warnings for these files.
- `npx tsc -b`: my files (`QuestionPrompt.tsx`, `index.ts`, `workspace.css`)
  type-check cleanly.

## Blockers / notes
- `npx tsc -b` currently surfaces ONE pre-existing error unrelated to this
  slice: `Problem1LongRunAverage.tsx(162,16)` — `DiceTray3DProps.disabled`
  missing. That's owned by a feature agent / earlier state, not T-001. No action
  needed from foundation.
- `color-mix()` is used for the tint with a `var(--surface)` fallback declared
  first, so older browsers degrade gracefully (no hardcoded brand colors).
