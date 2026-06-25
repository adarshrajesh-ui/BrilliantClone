# Handoff — agent-5-l3p3 (T-005: L3 P3 Mini-Deck EV Table)

run-id: `2026-06-24-l3-card-table` · status: **DONE / green**

## Scope delivered

L3 P3 independent fluency check — learner builds a full
value | count | probability | contribution table from a dealt 10-card mini deck,
then submits the EV. Closely mirrors the old `EvL3P3PrizeBagTable.tsx` pattern,
re-themed to card data. No file outside the ALLOWED set was touched.

### Files

| file | status |
|---|---|
| `src/data/problems/ev-l3-p3.ts` | **rewritten** — `EV_L3_P3` now "Mini-Deck EV Table" (export name + `problemId: 'ev-l3-p3'` unchanged) |
| `src/components/problems/EvL3P3MiniDeckTable.tsx` | **new** — component (export `EvL3P3MiniDeckTable`) |
| `src/components/problems/EvL3P3MiniDeckTable.checker.ts` | **new** — co-located deterministic checker |
| `src/components/problems/EvL3P3MiniDeckTable.checker.test.ts` | **new** — 9 vitest cases |
| `EvL3P3MiniDeckTable.css` | not needed — reused existing global classes (`.ws-visual`, `.prob-table`, `.table-wrap`, `.cell-status*`, `.field-label`, `.touch-input`, `.btn-secondary`, `.touch-target`, `.section-note`). |

The old `EvL3P3PrizeBagTable.*` files were **not** imported, edited, or deleted
(left for integration/validation per plan).

## Component

- Export name: **`EvL3P3MiniDeckTable`** (named export, no default).
- `usePersistedProblemState<State>('ev-l3-p3', DEFAULT)` + `useProblemSession(EV_L3_P3, state)`, loading guard → `loading-screen` spinner.
- `<ProblemLayout problem={EV_L3_P3} problemNumber={9} nextProblemId="problem-5" ... steps={steps} />`.
- Left visual (inside `<div className="ws-visual">`):
  `<CardDealScene cards={MINI_DECK_L3P3} groups={MINI_DECK_L3P3_GROUPS} showCounts highlightValue={activeRowValue} />`
  with `{session.completed && <EvBadge value={6.4} />}`.
- 3 steps: (1) inspect the dealt mini-deck, (2) build the full table — count,
  probability, contribution per row, advance gated on `allRowsDone`,
  (3) find EV → submit. Active-row highlight synced to `highlightValue`
  via `activeRowValue = VALUES[state.activeRow]`.
- Cell status via `numericFieldStatus` / `probabilityFieldStatus`
  (`cell-status cell-status-{ok|bad|empty}`), only shown after a graded mistake.
- Accessible `aria-label`s on every input + `.sr-only` `role="status" aria-live="polite"` region.
- Submit: `session.handleCheck(checkMiniDeck({ rows, evAnswer }), 'final', submitted, normalized)`.

## Checker — `EvL3P3MiniDeckTable.checker.ts`

```ts
export interface MiniDeckRow { count: string; probability: string; contribution: string }
export interface MiniDeckCheckInput { rows: [MiniDeckRow, MiniDeckRow, MiniDeckRow]; evAnswer: string } // ascending value [1,7,10]
export function checkMiniDeck(input: MiniDeckCheckInput): CheckResult
```

Rows are **ascending value `[1, 7, 10]`**. Expected:

| value | count | probability | contribution |
|---|---|---|---|
| 1 | 3 | 3/10 | 0.3 |
| 7 | 3 | 3/10 | 2.1 |
| 10 | 4 | 4/10 | 4.0 |

EV = **6.4**.

### Accepted answers
- EV: `6.4`, `6.40`, `$6.40`, `32/5` (fraction handled via `normalizeNumericAnswer`; decimals/money via `matchesNumeric`).
- Probability cells: any form equivalent to `3/10`/`4/10` (`3/10`, `0.3`, `2/5`, `0.4`, `30%`, …) via `areProbabilitiesEquivalent`.
- Count / contribution cells: numeric/money forms via `normalizeNumericAnswer` / `normalizeMoneyAnswer` + `areNumbersClose`.

### Mistake types (deterministic, in check order)
- guard `''` — any empty cell (count/prob/contribution in any row).
- `arithmetic-error` — wrong count for a row (recount feedback).
- `count-probability-confusion` — raw count typed into the probability cell (e.g. `3` instead of `3/10`).
- `wrong-denominator` — probability with the wrong total (e.g. `3/8`).
- `omitted-row` — a paying row's contribution left at `0`.
- `arithmetic-error` — any other wrong contribution.
- `used-total-card-value` — `evAnswer = 64` (summed raw card values 3×1+3×7+4×10 instead of EV per draw).
- `arithmetic-error` — any other wrong EV sum.
- correct → `{ isCorrect: true, mistakeType: null, canComplete: true }`.

Uses only the shared helpers (`areProbabilitiesEquivalent`, `normalizeNumericAnswer`,
`normalizeMoneyAnswer`, `matchesNumeric`, `areNumbersClose`). No hand-rolled parsing.

## Data file — `EV_L3_P3`

`problemId: 'ev-l3-p3'`, `canonicalSlug: 'ev-l3-p3'`, title "Mini-Deck EV Table",
concept "Build a complete expected value table from card counts.",
`visualType: 'card-table'`, `masteryTags: ['ev-from-table','probability-from-counts']`
(unchanged). `mistakeRules` cover the 5 graded types above; `teachingExplanation`,
`hints` (count → divide → add), `feedback.correct`, `completionRule`, and all other
required `ProblemDefinition` fields present.

## Verification (repo root)

| command | result |
|---|---|
| `npx vitest run src/components/problems/EvL3P3MiniDeckTable.checker.test.ts` | ✅ 1 file, **9 passed** |
| `npx tsc --noEmit` | ✅ exit 0, **no errors** (whole project) |
| `npx oxlint <3 new/changed files>` | ✅ exit 0, **no diagnostics** |

## Blockers / notes
- **Expected, handled downstream:** `ProblemPage.tsx` does not yet route
  `'ev-l3-p3'` → `EvL3P3MiniDeckTable` (Phase 3 / agent-6 integration), and the
  old `EvL3P3PrizeBagTable.*` + other orphan files are deleted by Phase 4 /
  agent-7 validation. Both are out of my scope and left untouched per plan.
- `src/data/problems/index.ts` needs no change — `EV_L3_P3` export name preserved.
- Did not commit (per rules).
