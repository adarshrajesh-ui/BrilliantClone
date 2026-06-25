# Interfaces & Shared Contract: no-spoilers

## The Rule (apply to EVERY question)

> **Before the learner submits an answer for a given input, the app must NOT
> display that answer's value anywhere that precedes the input** — not in the
> input `placeholder`, not in the question prompt / `advanceHint` / section-note,
> not in a visual badge or contribution block, not in screen-reader `sr-only`
> live text.

### What counts as a LEAK (fix it)
- `placeholder="e.g. 7"`, `placeholder="$6"`, `placeholder="12 × 0.5 + 0 × 0.5"`
  — any placeholder containing the answer or its full computation.
- Prompt / hint text stating the number the learner must type
  (e.g. "Enter the EV for each game ($6 each)", "Enter the deck total: 340").
- A visual that shows the computed product/total/EV **before** a correct submit
  (e.g. claw contribution blocks printing "= $5" and "EV = $5").
- `sr-only` / `aria-live` text that says the answer ("Expected profit one dollar")
  before the learner has entered it.
- A "your contributions add to X" line that hands the learner the EV they are
  about to type.

### What is ALLOWED (keep it)
- **Method / structure** that does not state the final number:
  "pair $20 with 25% and $0 with 75%", "Contribution = value × probability",
  "Subtract the cost", "Add your contributions".
- **Givens** the problem provides as inputs (cost = $3, cost = $6, payout bars,
  section odds, spinner percentages).
- **Graph target lines** (`target={7}`) — these are observed-simulation guides,
  not stated answers. Leave them.
- The **demo walkthrough** steps and the **completionMessage** (shown only after
  completion) — these may state the answer. Leave them.
- Any reveal **gated on a correct submit / `session.completed`** — that is the
  intended post-answer reveal. Leave it (and prefer this pattern for new reveals).

## How to fix
- Replace answer-bearing placeholders with neutral copy: `"Type the expected value"`,
  `"Type your answer"`, or `""`.
- Reword prompts/hints/notes to describe the **method**, dropping the final number.
- For visuals/`sr-only`, gate the answer reveal behind a correct submit
  (`session.completed`, a `revealed`/`isCorrect` flag, or step-check `=== 'correct'`).
  Before that, render the structure with the value blanked (e.g. `= ?`).

## Do NOT
- Do not change answer-checker logic (`*.checker.ts`), `data/problems/*`, or test
  expectations. This is a copy/visibility change only.
- Do not change a learner's ability to actually answer (keep inputs functional).
- Do not touch files outside your ALLOWED list.

## Verify
After edits run: `npm run build` and `npm test` (vitest). Fix any breakage you
introduced. Note anything cross-cutting in your handoff blockers.
