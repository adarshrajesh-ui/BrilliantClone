# Plan: 2026-06-24-two-dice-l1p1

Convert **Lesson 1, Problem 1** from a single-die $0/$10 payout toss (EV $5) into a
**two-dice 3D roll simulation** that teaches expected value as the long-run average
of the **sum of two dice (EV = 7)**. No other problems change. No auth/Firebase/
progress changes except problem-1 navigation/metadata. No AI.

## Goal recap (from prompt)

- Whole problem becomes a two-dice 3D roll simulation.
- User picks up two 3D dice, throws them into a dice tray; dice lift, arc, tumble,
  bounce, roll, settle (board-game feel; no Monopoly assets).
- Fallback buttons: **Roll 1, Roll 10, Roll 100**.
- Math: EV as long-run average of the sum of two dice; correct EV = **7**.
- Graph every result: running average converging to 7, plus a **distribution
  histogram of sums** forming a bell shape centered at 7.
- Completion: throw manually + reach ≥100 total rolls + answer that the long-run
  average sum is **7**.
- Keep no-scroll Brilliant layout: left = 3D dice tray + graphs; right = task,
  controls, answer, hints, feedback, next/continue.
- Update: title, scenario, demo, instructions, required actions, answer/completion
  rules, accepted formats, mistake types, hints, feedback, animations, reduced-motion,
  validation tests.

## Epics → Tasks

### Epic A — Deterministic two-dice model + metadata
Single source of truth for outcomes, EV=7 checker, prediction checker, problem
metadata, and the co-located unit tests.

### Epic B — Visual building blocks
3D dice tray (interaction + animation) and the sum-distribution histogram, both
pure/presentational and keyed off props agreed in `interfaces.md`.

### Epic C — Integration + validation
Rewire the problem component to the new model + visuals, update the no-scroll CSS,
sync validation matrices/tests/nav title, remove dead code, run build/lint/test.

## Tasks

| id | title | agent | depends_on | phase |
|----|-------|-------|-----------|-------|
| T-001 | Two-dice sum model, EV=7 checker, metadata + tests | agent-1-model | none | 1 |
| T-002 | 3D two-dice tray component | agent-2-dicetray | none | 1 |
| T-003 | Sum distribution histogram component | agent-3-histogram | none | 1 |
| T-004 | Integrate component + validation + cleanup + verify | agent-4-integration | T-001, T-002, T-003 | 2 |

### T-001 — agent-1-model
- ALLOWED:
  - `src/data/problems/problem-1.ts`
  - `src/components/problems/agent3-checkers.test.ts` (ONLY the `ev-l1-p1 — Dice Toss Average` describe block + its problem-1 imports at top)
- FORBIDDEN: every other file, including other describe blocks in agent3-checkers.test.ts.
- Acceptance: `npx vitest run src/components/problems/agent3-checkers.test.ts` passes; EV-of-sum ≈ 7 over many rolls; checker accepts 7, classifies 2/12/3.5; exports match interfaces.md exactly.

### T-002 — agent-2-dicetray
- ALLOWED: `src/components/visuals/DiceTray3D.tsx`, `src/components/visuals/DiceTray3D.css`
- FORBIDDEN: everything else. Do NOT import problem-1.ts (presentational only).
- Acceptance: component compiles; matches `DiceTray3DProps` in interfaces.md; reduced-motion path renders settled dice instantly; pointer drag + tap-to-throw + keyboard Enter all call `onThrow`.

### T-003 — agent-3-histogram
- ALLOWED: `src/components/visuals/SumHistogram.tsx`, `src/components/visuals/SumHistogram.css`
- FORBIDDEN: everything else. Presentational only.
- Acceptance: component compiles; matches `SumHistogramProps` in interfaces.md; renders 11 bars (sums 2..12), highlights peak/center at 7, has an accessible label.

### T-004 — agent-4-integration
- ALLOWED:
  - `src/components/problems/Problem1LongRunAverage.tsx`
  - `src/components/problems/l1-workspace.css`
  - `src/validation/answerValidationMatrix.ts`
  - `src/validation/problemBehaviorValidation.ts`
  - `src/validation/liveCheckerValidation.test.ts`
  - `src/core/progression/canonical.ts` (ONLY the problem-1 nav title string on the `ev-l1-p1`/`problem-1` row)
  - delete `src/components/visuals/DiceThrowZone.tsx` + `.css` IF no remaining importers (verify via grep first)
- FORBIDDEN: any other problem's data/component/test; any auth/Firebase/progress logic beyond the single nav-title string.
- Acceptance: `npm run build` + `npm run lint` + `npm run test` all green.

## File ownership check
No two same-phase tasks share allowed paths. Phase 1: problem-1.ts + agent3 test block / DiceTray3D.* / SumHistogram.* are disjoint. Phase 2 is a single agent.

## Phase summary
- Phase 1 (parallel, 3 agents): T-001, T-002, T-003
- Phase 2 (integration, 1 agent): T-004 (also runs build/lint/test)
