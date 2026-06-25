# Interfaces: 2026-06-24-bold-question

These contracts are authored by the orchestrator. **Foundation (T-001) MUST
implement them exactly**; feature agents (T-002..T-006) rely on them WITHOUT
reading foundation's source.

## `QuestionPrompt` component

File: `src/features/learning-experience/QuestionPrompt.tsx`
Exported from: `src/features/learning-experience/index.ts`

```tsx
import type { ReactNode } from 'react'

export interface QuestionPromptProps {
  /** The actual question/task text to emphasize. */
  children: ReactNode
  /**
   * Optional small eyebrow label rendered above the question
   * (e.g. "Your task", "Question"). Defaults to "Your task".
   */
  label?: string
  /** When true, render without the eyebrow label (text-only emphasis). */
  hideLabel?: boolean
  /** Extra className passthrough. */
  className?: string
}

export function QuestionPrompt(props: QuestionPromptProps): JSX.Element
```

### Rendering / styling contract

- Renders the `children` as the **bold, prominent** question, using a themed
  callout (uses existing CSS custom props like `--primary`, `--surface`,
  `--border`, `--text-heading`; no hardcoded brand colors).
- Adds a small uppercase eyebrow label (default `"Your task"`) unless
  `hideLabel`.
- Root element carries class `question-prompt` (so feature agents may also
  target it / pass `className`).
- Must look correct both inside `.ws-prompt` (workspace header) and inside
  `.ws-step` content (inline), and inside the legacy `taskGuide` panel.
- Reduced-motion safe; no layout shift; accessible (the question is real text,
  label is decorative).

### Usage by feature agents

For **workspace problems** (most problems): pass the question as the step
`prompt`, wrapped in `QuestionPrompt`:

```tsx
{
  id: 'identify',
  title: 'Identify the long-run average',
  prompt: <QuestionPrompt>What is the long-run average sum per roll?</QuestionPrompt>,
  content: (/* ... */),
}
```

For inline prompts inside content, replace ad-hoc `.ws-prompt-inline` text with
`<QuestionPrompt>`.

For **legacy-shell problems** that pass `taskGuide`, wrap the primary question
line in `<QuestionPrompt>`.

### Rules for feature agents

- Import: `import { QuestionPrompt } from '../../features/learning-experience'`
- Emphasize the **single actual question/task** — not every instruction. Pick
  the sentence that tells the learner what to DO/answer. Keep supporting
  instructions as normal text.
- Do NOT edit any `.css` file. All styling comes from the shared component.
- Do NOT change problem logic, checkers, state, or data.
- Keep wording identical — only wrap/emphasize existing text (you may lightly
  rephrase a prompt into a clear question only if it does not change meaning).
