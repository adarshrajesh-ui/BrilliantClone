# Handoff — agent-4-l3p2 (T-004: L3 P2 Dealt-Hand Contributions)

run-id: `2026-06-24-l3-card-table` · status: **DONE / green**

## Scope delivered

Storage id `problem-4`, canonical slug `ev-l3-p2`, problemNumber **8**,
nextProblemId `ev-l3-p3`. Only ALLOWED paths touched:

- `src/data/problems/problem-4.ts` — rewrote `PROBLEM_4` (kept `problemId: 'problem-4'` + export name `PROBLEM_4`).
- `src/components/problems/Problem4DealtHandContributions.tsx` — new component (export `Problem4DealtHandContributions`).
- `src/components/problems/Problem4DealtHandContributions.checker.ts` — new co-located checker.
- `src/components/problems/Problem4DealtHandContributions.checker.test.ts` — new vitest.
- `src/components/problems/Problem4DealtHandContributions.css` — new (minor styling for given cells).

No files outside ALLOWED were touched. ProblemPage routing + validation rewiring are
left to integration/validation phases (expected, not done here).

## Component export name

`Problem4DealtHandContributions` (named export). Wiring:
`usePersistedProblemState<State>('problem-4', DEFAULT)` →
`useProblemSession(PROBLEM_4, state)` → loading guard →
`<ProblemLayout problem={PROBLEM_4} problemNumber={8} nextProblemId="ev-l3-p3" steps={steps} />`.

Visual: `<CardDealScene cards={DEALT_HAND_L3P2} groups={DEALT_HAND_L3P2_GROUPS}
showCounts showContributions highlightValue={activeRowValue} />` inside
`<div className="ws-visual">`; `<EvBadge value={DEALT_HAND_L3P2_EV} />` (= 6.5) shown on completion.

Two steps: (1) fill the 3 contributions — advance gated until all 3 filled
(`canAdvance: allContribsFilled`); (2) enter final EV and submit. Given value /
count / probability columns are read-only; only the contribution column is editable.
Inline cell status via `numericFieldStatus`; `.sr-only` live region present.

## Checker — `Problem4DealtHandContributions.checker.ts`

```ts
export interface DealtHandCheckInput {
  contributions: [string, string, string] // ascending value order [2, 4, 10]
  evAnswer: string
}
export function checkDealtHand(input: DealtHandCheckInput): CheckResult
```

- **Expected contributions** (ascending [2,4,10]): `[0.5, 1.0, 5.0]`.
- **Accepted EV**: `6.5`, `6.50`, `$6.50`, `13/2` (parsed via `normalizeNumericAnswer`, tol 0.01).
- **Guard** (`{isCorrect:false, mistakeType:'', canComplete:false}`): any empty
  contribution **or** empty EV.
- **Mistakes**:
  - `forgot-to-weight` — a contribution equals the raw value (2, 4, or 10) instead of value×prob.
  - `unweighted-sum` — `evAnswer` = 16 (raw 2 + 4 + 10, contributions otherwise correct).
  - `arithmetic-error` — fallback (wrong contribution that isn't the raw value; wrong EV sum).
- correct → `{ isCorrect: true, mistakeType: null, canComplete: true }`.

Uses only `answerParser` helpers (`normalizeMoneyAnswer`, `normalizeNumericAnswer`,
`areNumbersClose`) — no hand-rolled parsing, no AI.

## Data file (`PROBLEM_4`) key fields

- title `Dealt-Hand Contributions`, concept `Sum each value × probability contribution.`
- `visualType: 'card-table'`, `interactionType: 'fill-contributions'`,
  `masteryTags: ['ev-from-table']`, `canonicalSlug: 'ev-l3-p2'`.
- `correctAnswers: { contributions: [0.5, 1.0, 5.0], ev: 6.5 }`,
  `acceptedFormats.ev: ['6.5','6.50','$6.50','13/2']`.
- `mistakeRules` match checker types (`forgot-to-weight`, `unweighted-sum`, `arithmetic-error`).
- teachingExplanation + 2 hints + feedback.correct retained.

## Verification (repo root)

| command | result |
|---|---|
| `npx vitest run src/components/problems/Problem4DealtHandContributions.checker.test.ts` | ✅ 1 file, **7 passed** |
| `npx tsc --noEmit` | ✅ exit 0, no errors |
| `npx oxlint <component, checker, test, problem-4.ts>` | ✅ exit 0, no diagnostics |

Test cases: correct (+ 6.50/$6.50/13/2 variants), guard on empty contribution,
guard on empty EV, forgot-to-weight (first & last row), unweighted-sum (16),
arithmetic-error (bad contribution), arithmetic-error (bad EV sum).

## Consumed APIs

- `src/data/cards` → `DEALT_HAND_L3P2`, `DEALT_HAND_L3P2_GROUPS`, `DEALT_HAND_L3P2_EV` (agent-1).
- `src/components/visuals/cards` → `CardDealScene`, `EvBadge` (agent-2).
- `src/lib/answerParser`, `src/lib/fieldStatus`, `ProblemLayout`, hooks, `WorkspaceStepDef`.

## For integration (agent-6)

- `ProblemPage.tsx`: map `'problem-4'` → `Problem4DealtHandContributions` (named import from
  `../components/problems/Problem4DealtHandContributions`).
- `data/problems/index.ts` + `implementedProblems.ts`: no change (export name `PROBLEM_4`,
  storage id `problem-4` unchanged).

## For validation (agent-7)

- `src/validation/liveCheckers.ts`: repoint `problem-4` → `checkDealtHand` with
  `DealtHandCheckInput` from `Problem4DealtHandContributions.checker`; drop old `checkProblem4`.
- Validation matrices for `problem-4`: contributions `[0.5,1.0,5.0]`, EV `6.5`,
  mistake types `forgot-to-weight` / `unweighted-sum` / `arithmetic-error`.

## Blockers

None. ProblemPage routing handled by integration phase — expected, not in scope here.
Did not commit (per rules).
