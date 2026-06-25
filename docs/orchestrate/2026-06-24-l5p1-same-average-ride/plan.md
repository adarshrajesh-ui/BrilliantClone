# Plan: Same Average, Different Ride (L5P1 rebuild)

Run: `2026-06-24-l5p1-same-average-ride`
Scope: **Lesson 5, Problem 1 only** (`ev-l5-p1` / storage `problem-7` / component `Problem7WholeEVModel`).

## Goal

Replace the current "Carnival Booth Preview" content of L5P1 with **"Same Average, Different Ride"**: two fully 3D-animated game machines that share EV = $10 but differ in risk.

- **Game A — 3D Money Printer**: press button/lever → conveyor moves → $10 bill slides into tray. Always $10. Flat running-average line at $10.
- **Game B — 3D Jackpot Slot**: pull lever → reels spin + shake → 60% $0 (gray puff / empty tray), 40% $25 (gold flash / coin burst). Jagged running-average line approaching $10.
- Controls per machine: **Run 1 / Run 10 / Run 100**. Gate: run **each** machine ≥10 times **and** run **at least one** 100-run batch.
- Below each machine: **outcome strip + running-average graph** with a **$10 reference line**.
- 3 questions: same EV? (Yes) · which riskier? (Slot) · why? (same average, slot varies $0–$25 vs printer always $10).
- No-scroll Brilliant-style layout; feedback visible without scrolling.
- Reduced motion: instant outcome reveal, graphs still update.

## Hard constraints

- Do NOT change other problems (esp. L5P2 `problem-8` / L5P3 `ev-l5-p3`).
- Do NOT change auth/Firebase/progress wiring, except L5P1 metadata (title etc.).
- No AI features. No new heavy deps — 3D via **CSS 3D transforms + SVG** (matches existing `DiceTray3D`, `ClawMachine` convention; repo has no three.js).
- `problemId` stays `problem-7`, slug stays `ev-l5-p1`, component export name stays `Problem7WholeEVModel`, routing in `ProblemPage.tsx` unchanged.

## Constants

- Money Printer: `constantGame(10)` → EV $10.
- Jackpot Slot: `[{ value: 25, probability: 0.4 }, { value: 0, probability: 0.6 }]` → EV = 0.6·0 + 0.4·25 = $10.
- Graphs: `target={10}`, `maxY={25}`.

## Tasks

| id | title | agent | phase | depends_on | allowed_paths |
|----|-------|-------|-------|------------|---------------|
| T-001 | Data + checker rewrite | agent-1-data | 1 | none | `src/data/problems/problem-7.ts`, `src/core/progression/canonical.ts` (ev-l5-p1 title line only) |
| T-002 | MoneyPrinter3D visual | agent-2-printer | 1 | none | `src/components/visuals/MoneyPrinter3D.tsx`, `src/components/visuals/MoneyPrinter3D.css` |
| T-003 | JackpotSlot3D visual | agent-3-slot | 1 | none | `src/components/visuals/JackpotSlot3D.tsx`, `src/components/visuals/JackpotSlot3D.css` |
| T-004 | Workspace component + CSS | agent-4-workspace | 2 | T-001,T-002,T-003 | `src/components/problems/Problem7WholeEVModel.tsx`, `src/components/problems/l5p1-workspace.css` |
| T-005 | Tests + validation reconcile | agent-5-validation | 3 | T-001,T-004 | `src/components/problems/lesson5-checkers.test.ts` (L5P1 block only), `src/validation/liveCheckers.ts` (problem-7 wiring only), `src/validation/answerValidationMatrix.ts` (ev-l5-p1 rows + spec summary only), `src/lib/simulation.test.ts` (only if it asserts L5P1-specific content) |

### Forbidden for ALL workers
- `src/data/problems/problem-8.ts`, `src/data/problems/ev-l5-p3.ts` and their components/tests (other problems).
- `src/pages/ProblemPage.tsx`, `src/data/problems/index.ts`, `src/data/implementedProblems.ts` (registry already correct — do not touch).
- `src/components/problems/lesson5.css` (shared with L5P2/L5P3 — use new `l5p1-workspace.css` instead).
- Anything under `src/lib/firebase`, auth, persistence core.

## Phases (dependency waves)

- **Phase 1 (parallel):** T-001, T-002, T-003 — independent files. Build to `interfaces.md` contracts.
- **Phase 2:** T-004 — wires checker (T-001) + machines (T-002/T-003) into the no-scroll workspace.
- **Phase 3:** T-005 — reconcile L5P1 tests + validation matrix + live-checker dispatch; run full `npm test` / `npm run build` / `npm run lint`.
- **Integration (orchestrator):** read handoffs, fix cross-file glue, ensure green, report.

## Acceptance

- `npm run build` (tsc + vite) passes.
- `npm test` passes (incl. updated L5P1 checker/matrix tests; L5P2/L5P3 untouched & still green).
- `npm run lint` clean.
- Manual: L5P1 shows two 3D machines, Run 1/10/100 work, gate enforces ≥10 each + one 100-batch, both averages converge near $10, slot strip/graph visibly more volatile, 3 questions grade correctly, feedback visible without scroll, reduced-motion path reveals instantly.
