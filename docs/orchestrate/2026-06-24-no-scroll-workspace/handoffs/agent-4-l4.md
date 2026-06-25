# Handoff — agent-4-l4 (T-104) — Lesson 4 no-scroll workspace

**Status:** DONE. Build, lint, and the full test suite (572) are green. All three Lesson 4
problems now drive `ProblemLayout` via the `steps` prop (no `children`). Presentation only —
no checker / math / validation / persistence / routing changes.

---

## Files changed (only my allowed paths)

- `src/components/problems/Problem5PayoutVsProfit.tsx` (ev-l4-p1) — converted to `steps`.
- `src/components/problems/Problem6FairnessSort.tsx` (ev-l4-p2) — converted to `steps`.
- `src/components/problems/EvL4P3BetterGame.tsx` (ev-l4-p3) — converted to `steps`.
- `src/components/problems/l4-workspace.css` (NEW) — small layout/compaction helpers only.

Not touched (out of scope / forbidden): `Problem5PayoutVsProfit.checker.ts`,
`EvL4P3BetterGame.checker.ts`, `Problem5PayoutPlayground.tsx`, all visuals, data, core, lib,
validation, tests, `prd.md`, routing. `Problem5PayoutVsProfit.css` and `EvL4P3BetterGame.css`
were left unchanged (the new compaction lives in `l4-workspace.css`).

Per-problem: removed the `TaskGuide` import + `taskGuide` prop (the per-step `prompt` replaces
the current-task line; the shell ignores `taskGuide` in workspace mode) and added
`import type { WorkspaceStepDef }` + `import './l4-workspace.css'`. Every
`session.handleCheck(...)`, `checkEvL4P1/checkProblem6/checkEvL4P3(...)`, `setState(...)`,
`reset()`/`restart()`, hint, `aria-*`, `sr-only` live region, and `placeCost()` call is
byte-for-byte unchanged — only the surrounding `<section className="card">`/`<h2>` wrappers
were removed and the JSX regrouped into step `content`.

---

## Steps per problem + gates

### ev-l4-p1 — Problem5PayoutVsProfit (payout-before-profit gate + balance playground)
The two existing phases are preserved by building the `steps` array conditionally on the
existing `inOfficialPhase` flag (`playPhaseComplete || hasOfficialProgress`):

- **Playground phase** (`!inOfficialPhase`) → **1 step** `playground`: renders the existing
  `<Problem5PayoutPlayground>` (balance scale + ±1 clickers + profit preview). Single-step ⇒
  no Prev/Next; its own **Continue** button (`beginOfficialProblem`) advances to the official
  phase exactly as before.
- **Official phase** (`inOfficialPhase`) → **2 steps**:
  1. `pay-to-play` — PayoutTray + cost slot (drag **and** tap/keyboard) + ProfitMeter, wrapped
     in `.ws-visual`. `canAdvance = state.costPlaced`, `advanceHint` "Place the $3 cost token…".
     **This is the payout-before-profit gate** — Next is blocked until the cost is placed.
  2. `profit` — the expected-profit input (still `disabled={!state.costPlaced}`) + Submit
     (`disabled={!state.costPlaced || session.submitting}`, calls `checkEvL4P1`). Last step ⇒
     Next disabled; completion drives Continue via the coach as usual.

  The activeIndex starts at 0, so when the playground's Continue flips the array from 1→2
  steps the learner lands on `pay-to-play`. The cost gate is enforced in BOTH places it was
  before: the `canAdvance` gate AND the input/submit `disabled` flags (unchanged).

### ev-l4-p2 — Problem6FairnessSort (tap-to-place sort)
- **1 step** `sort`. A sort needs the game cards, the (post-placement) fairness number line,
  and the three buckets co-visible, so it stays a single panel. `prompt` reuses the existing
  dynamic `currentTask` string. The FairnessNumberLine is wrapped in `.ws-visual .l4-numberline`
  (pinned to `flex:0 0 auto` so it doesn't grow and push the buckets off-screen).
  Submit (`checkProblem6`) + Clear placements are unchanged.

### ev-l4-p3 — EvL4P3BetterGame (compare two games, then choose)
- **2 steps**:
  1. `profits` — the two game cards (payout/cost bars + expected-profit inputs + ProfitMeter).
     `canAdvance = profitsFilled`, `advanceHint` "Enter both expected profits to continue."
  2. `choose` — the "Which is the better game?" fieldset (A/B buttons, `aria-pressed`) + Submit
     (`checkEvL4P3`). Last step ⇒ Next disabled; completion drives Continue.
  Split into two panels so each fits one screen without page scroll at 1280×720 and ≤390px
  (the two cards + selector + submit were the tallest stack in this lesson). State persists in
  `usePersistedProblemState`, so Previous returns to the profits with values intact.

---

## Drag/tap fallbacks + checkers — confirmed unchanged

- **ev-l4-p1 cost token:** still supports HTML5 drag (`draggable`/`onDragStart`/`onDrop`) **and**
  the tap-to-pick-then-tap-slot fallback (`onClick` + `onKeyDown` Enter/Space), with the same
  `role="button"`/`tabIndex`/`aria-label` on the slot — moved verbatim into the step content.
- **ev-l4-p2 sort:** the tap-to-place flow (tap a game to select, tap a bucket to place, tap a
  placed game to move) is byte-for-byte unchanged; the tap-hint and `aria-live` status remain.
- **Checkers untouched:** `Problem5PayoutVsProfit.checker.ts` and `EvL4P3BetterGame.checker.ts`
  were not opened/edited; imports (`checkEvL4P1`, `checkEvL4P3`, `checkProblem6`) and every
  `handleCheck` argument list are identical to before.

## CSS notes (`l4-workspace.css`)
Layout-only: makes `.l4-sort-step`/`.l4-better-step` flex columns (so the foundation's
`.ws-compact` gap applies), pins the fairness number-line wrapper to `flex:0 0 auto`, centers
the card/bucket rows, and tightens the better-game cards at ≤390px. No colors/tokens redefined;
no `.ws-*` redefinitions; `index.css`/`workspace.css` untouched.

## Commands run + results
- `npm run build` (`tsc -b && vite build`) → **success**, no type errors.
- `npm run lint` (`oxlint`) → **0 errors**; only the repo's pre-existing
  `only-export-components` fast-refresh warnings (none in my three converted files;
  the `Problem5PayoutPlayground.tsx` warnings are pre-existing and that file is out of scope).
- `npm run test` (`vitest run`) → **572 passed (30 files)**.

## Blockers / notes for the orchestrator
- None blocking.
- `Problem5PayoutPlayground.tsx` is a shared component outside my allowed paths, so its
  internal `<section className="card"> + <h2>` chrome remains inside the `playground` step
  (I could not drop that wrapper without editing a forbidden file). It renders fine inside
  `.ws-step`; if Phase 3 wants it stripped to match the bare-step convention, that's a small
  follow-up edit to that component (or a future T-001 affordance).
- Live no-scroll acceptance spot-check at 1280×720 and ≤390px is deferred to Phase 3 per the
  plan; build/lint/test were my in-scope verification and are green. ev-l4-p3 was split
  specifically to keep the tallest stack within one mobile screen.
