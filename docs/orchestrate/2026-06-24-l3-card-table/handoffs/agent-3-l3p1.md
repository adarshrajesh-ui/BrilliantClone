# Handoff — agent-3-l3p1 (T-003: L3 P1 Average Card Value)

run-id: `2026-06-24-l3-card-table` · status: **DONE / green**

## Scope delivered

Storage id `problem-3`, canonical slug `ev-l3-p1`, problemNumber **7**,
nextProblemId `problem-4`. EV of one draw from a full 52-card deck:
A=1, 2–10 = number, J/Q/K = 10 → value-10 group has **16** cards, deck total
**340**, EV = 340/52 = **85/13 ≈ 6.54**.

## Files

| file | status |
|---|---|
| `src/data/problems/problem-3.ts` | rewritten to card theme (kept `problemId:'problem-3'`, export `PROBLEM_3`) |
| `src/components/problems/Problem3AverageCardValue.tsx` | new (export `Problem3AverageCardValue`) |
| `src/components/problems/Problem3AverageCardValue.checker.ts` | new |
| `src/components/problems/Problem3AverageCardValue.checker.test.ts` | new (14 cases) |

No optional `.css` file was needed — reused global classes only
(`.ws-visual`, `.ws-options`, `.choice-btn`, `.choice-btn-selected`,
`.touch-target`, `.field-label`, `.touch-input`, `.section-note`,
`.ev-chunks`/`.ev-chunk(-green/-blue)`, `.cell-status*`). No files outside the
ALLOWED set were touched.

## Component

- Export: **`Problem3AverageCardValue`**.
- Mirrors `EvL3P3PrizeBagTable.tsx`: `usePersistedProblemState<State>('problem-3', DEFAULT)`
  + `useProblemSession(PROBLEM_3, state)`, loading guard, `<ProblemLayout … steps={steps} />`.
- Consumes the card model + visuals (no edits to them):
  - `import { FULL_DECK, FULL_DECK_GROUPS, RANKS, type CardRank } from '../../data/cards'`
  - `import { CardDealScene, EvBadge } from '../visuals/cards'`
- Left visual: `<CardDealScene cards={FULL_DECK} groups={FULL_DECK_GROUPS} totalCards={52}
  highlightValue={…} showCounts caption="One draw from a full deck" />` inside `<div className="ws-visual">`.
  `<EvBadge value={6.54} />` renders in the final step once the EV field is correct.
- 5 `WorkspaceStepDef` steps: (1) watch the deal, (2) tap the ranks worth 10
  — rank chips, `canAdvance` gated on selecting exactly {10,J,Q,K}, (3) enter
  the 10-group count → 16 (gated), (4) enter the deck total numerator → 340
  (gated, `EV = [total] ÷ 52`), (5) submit EV ≈ 6.54.
- Inline `cell-status` via `numericFieldStatus` shown after a failed submit;
  aria-labels on every input/chip + an `.sr-only` `role="status"` live region.

## Checker

```ts
export interface AverageCardValueCheckInput {
  tenCount: string    // count for the value-10 group
  totalValue: string  // EV numerator (deck total)
  evAnswer: string
}
export function checkAverageCardValue(input: AverageCardValueCheckInput): CheckResult
```

Accepted EV forms: `85/13`, `6.54`, `6.538`, `6.5385`, `6.539`, `6.53`
(decimals via `matchesNumeric(ev,[340/52],0.02)`; fraction via
`normalizeNumericAnswer` close to 85/13). `tenCount` must equal **16**,
`totalValue` must equal **340**.

Mistake types (deterministic, in order):
- `forgot-four-tens` — tenCount = 12 (only J/Q/K).
- `face-cards-overvalued` — tenCount = 4, or total = 364, or EV ≈ 7.0.
- `ace-as-eleven` — total = 380, or EV ≈ 380/52 ≈ 7.31.
- `used-total-not-ev` — evAnswer = 340.
- `wrong-denominator` — evAnswer ≈ 340/13, 340/4 (85), or 340/26.
- `arithmetic-error` — fallback (also any other wrong tenCount/total).
- Empty `tenCount`/`totalValue`/`evAnswer` → guard `{isCorrect:false, mistakeType:'', canComplete:false}`.

## Data file (`PROBLEM_3`)

visualType `card-table`, concept "EV from counts → probabilities (52-card
deck)", `canonicalSlug:'ev-l3-p1'`, `masteryTags:['probability-from-counts']`,
hints + `mistakeRules` matching the checker, `teachingExplanation`,
`feedback.correct`. All required `ProblemDefinition` fields kept.

## Verification (repo root)

| command | result |
|---|---|
| `npx vitest run …Problem3AverageCardValue.checker.test.ts` | ✅ 1 file, **14 passed** |
| `npx tsc --noEmit` | ✅ exit 0, no errors |
| `npx oxlint` (4 owned files) | ✅ exit 0, no diagnostics |

## Blockers / notes

- None blocking. **Expected**: `ProblemPage.tsx` still routes `problem-3` to the
  old `Problem3MysteryBoxes` — integration (agent-6) must repoint it to
  `Problem3AverageCardValue`, and validation (agent-7) repoints `liveCheckers`
  to `checkAverageCardValue` + deletes the old mystery-box files. Per scope I did
  not touch those.
- Did not commit (per rules).
