# Handoff — agent-6-integration (T-006: Routing + Lesson-3 PRD refresh)

run-id: `2026-06-24-l3-card-table` · status: **DONE / green**

## Scope delivered

Routed the three new Lesson-3 card components in `ProblemPage.tsx` and refreshed
the Lesson-3 section of `prd.md` to the 3D card-dealing theme. Storage-ID keys
are unchanged (`problem-3`, `problem-4`, `ev-l3-p3`). Only the two ALLOWED paths
were touched. No files deleted, no validation touched, no other lesson touched,
nothing committed.

## 1. `src/pages/ProblemPage.tsx` — exact edits

Imports swapped (3):

| old | new |
|---|---|
| `Problem3MysteryBoxes` from `../components/problems/Problem3MysteryBoxes` | `Problem3AverageCardValue` from `../components/problems/Problem3AverageCardValue` |
| `Problem4CalculateEV` from `../components/problems/Problem4CalculateEV` | `Problem4DealtHandContributions` from `../components/problems/Problem4DealtHandContributions` |
| `EvL3P3PrizeBagTable` from `../components/problems/EvL3P3PrizeBagTable` | `EvL3P3MiniDeckTable` from `../components/problems/EvL3P3MiniDeckTable` |

`PROBLEM_COMPONENTS` map entries repointed (keys identical):

```ts
'problem-3': Problem3AverageCardValue,  // ev-l3-p1
'problem-4': Problem4DealtHandContributions,  // ev-l3-p2
'ev-l3-p3': EvL3P3MiniDeckTable,
```

The other 12 map entries are untouched. `src/data/implementedProblems.ts` and
`src/data/problems/index.ts` were NOT changed (export names + storage IDs are
unchanged, as confirmed by the Phase-2 handoffs).

## 2. `prd.md` — Lesson-3 changes (Lessons 1/2/4/5 untouched)

Rewrote the three Lesson-3 problem narratives on PRD "Page 5" to the card theme.
Storage IDs and Legacy ID mapping lines were preserved verbatim.

- **L3 P1 (ev-l3-p1)** title `Mystery Box Reveal` → **`Average Card Value`**.
  Scenario = one draw from a full 52-card deck (A=1, 2–10=number, J/Q/K=10).
  Answers: value-10 count **16**, deck total **340**, EV **340/52 = 85/13 ≈ 6.54**.
  Accepted EV forms `85/13, 6.54, 6.538, 6.5385, 6.539, 6.53`. Mistake list,
  feedback, mini-demo, visual, checklist, animations, workspace left/right
  region, and validation-case bullets all re-themed to card dealing.
- **L3 P2 (ev-l3-p2)** title `Calculate EV from the Table` →
  **`Dealt-Hand Contributions`**. Scenario = an 8-card hand
  (10♠ J♥ Q♣ K♦ ×4 value-10, 4♠ 4♥ ×2 value-4, 2♣ 2♦ ×2 value-2). Provided
  value/count/probability table read-only; learner fills 3 contributions.
  Contributions `0.5 / 1.0 / 5.0` (ascending value 2,4,10), EV **6.5**; accepted
  `6.5, 6.50, $6.50, 13/2`. Expression `2×2/8 + 4×2/8 + 10×4/8`.
- **L3 P3 (ev-l3-p3)** title `Prize Bag EV Table` → **`Mini-Deck EV Table`**.
  Scenario = 10-card mini deck (A♠ A♥ A♣ value-1 ×3, 7♠ 7♥ 7♦ value-7 ×3,
  10♠ J♥ Q♣ K♦ value-10 ×4). Full value|count|probability|contribution table:
  counts `3/3/4`, probs `3/10, 3/10, 4/10`, contributions `0.3 / 2.1 / 4.0`,
  EV **6.4**; accepted `6.4, 6.40, $6.40, 32/5`. `used-total-card-value` mistake
  references the raw-sum 64.

Also updated the three Lesson-3 rows of the Appendix problem matrix
(representation/math cells only): `52-card deck` / `16/52, EV 6.54`,
`Dealt-hand table` / `Row products, 6.5`, `10-card mini deck` /
`All columns, 6.4`. Column structure, slugs, predecessor/successor links, and
timing left unchanged.

Pedagogy line preserved: lesson goal "convert counts to probabilities, organize
tables, calculate EV" (counts → probabilities → EV table) is intact, as is the
"Lesson 3 tension" note. Lessons 1, 2, 4, 5 were not edited. The removed-slug
migration note (`l3-repair-probability-table → ev-l3-p3`) was left as-is.

## Verification (repo root)

| command | result |
|---|---|
| `npx tsc --noEmit` | ✅ exit 0 — whole project compiles |
| `npx oxlint src/pages/ProblemPage.tsx` | ✅ exit 0, no diagnostics |
| `npx vitest run src/data/chapter.test.ts src/validation/prdCoverage.test.ts` | ✅ 2 files, **38 passed** |

**Orphan files compile fine — no blocker.** With the new routing in place,
`tsc --noEmit` returns exit 0 for the whole project, so the now-unused old files
(`Problem3MysteryBoxes.tsx`, `Problem4CalculateEV.tsx`, `EvL3P3PrizeBagTable.tsx`
+ its `.checker.ts`/`.checker.test.ts`, and the `MysteryBoxes`/`PrizeBagTokens`
visuals) still type-check despite the Phase-2 data-file rewrites. None of them
were edited or deleted (agent-7 owns deletion).

## For validation (agent-7)

- `ProblemPage.tsx` is fully repointed — no further routing work needed.
- Old orphan files are unused but still compile; safe to delete per plan.md
  Phase-4 list. After deleting them, re-run `tsc -b`/`vite build` to confirm.
- `src/validation/liveCheckers.ts` still imports the OLD checkers
  (`checkProblem3`, `checkProblem4`, `EvL3P3PrizeBagTable.checker`) — repoint to
  `checkAverageCardValue` / `checkDealtHand` / `checkMiniDeck` per interfaces.md
  Section 5. The PRD now matches the new answers (6.54 / 6.5 / 6.4) for the
  validation-matrix updates.

## Blockers

None. Did not commit (per rules).
