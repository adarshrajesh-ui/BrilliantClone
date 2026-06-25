# Agent 5 — Lesson 5 + Shared Simulation Helper Handoff (run 2026-06-24-ev-lab-15)

Owner: Agent 5 (Lesson 5 problems + shared seeded-RNG simulation helper + owned
visuals `CarnivalWheel` / `RiskComparisonGraph` + new visual `BoothPreview`).

**Status:** All three Lesson 5 problems implemented per PRD Page 7. New shared
`src/lib/simulation.ts` + tests. Scoped tests green:
- `npx vitest run src/components/problems src/lib/simulation.test.ts` → **2 files, 55 tests passed**.
- Regression check `npx vitest run src/data src/lib src/core` → **8 files, 110 tests passed**.
- `npx oxlint src/components/problems src/data/problems src/components/visuals src/lib/simulation.ts` → exit 0 (only pre-existing `only-export-components` fast-refresh warnings, same pattern as other visuals).
- Did NOT run full `tsc -b` (per instructions). IDE language-server lints on all
  touched files: no errors.

Did NOT touch any forbidden file. Did NOT commit.

---

## 1. Export manifest (what Agent 1 must wire)

| Storage ID | Canonical slug | Component file → export | Definition file → export | New CheckInput type | Checker fn |
|---|---|---|---|---|---|
| `problem-7` | `ev-l5-p1` | `src/components/problems/Problem7WholeEVModel.tsx` → `Problem7WholeEVModel` | `src/data/problems/problem-7.ts` → `PROBLEM_7` | `BoothPreviewCheckInput` (in `problem-7.ts`) | `checkBoothPreview` (in `problem-7.ts`) |
| `problem-8` | `ev-l5-p2` | `src/components/problems/Problem8SameEVDifferentRisk.tsx` → `Problem8SameEVDifferentRisk` | `src/data/problems/problem-8.ts` → `PROBLEM_8` | `WiderSpreadCheckInput` (in `problem-8.ts`) | `checkWiderSpread` (in `problem-8.ts`) |
| `ev-l5-p3` | `ev-l5-p3` | `src/components/problems/EvL5P3FinalDecision.tsx` → `EvL5P3FinalDecision` | `src/data/problems/ev-l5-p3.ts` → `EV_L5_P3` | `FinalDecisionCheckInput` (in `ev-l5-p3.ts`) | `checkFinalDecision` (in `ev-l5-p3.ts`) |

Notes for integration:
- Component export names for `problem-7` / `problem-8` are **unchanged**
  (`Problem7WholeEVModel`, `Problem8SameEVDifferentRisk`) so the existing
  `PROBLEM_COMPONENTS` mapping in `ProblemPage.tsx` keeps working for those two.
- `ProblemPage.tsx` must add: `'ev-l5-p3' → EvL5P3FinalDecision`.
- `src/data/problems/index.ts` already imports `PROBLEM_7` / `PROBLEM_8`
  (names preserved). Add `import { EV_L5_P3 } from './ev-l5-p3'` and register it
  in `ALL_PROBLEMS`.
- `src/data/implementedProblems.ts` must include `'ev-l5-p3'` (the other two are
  already in the implemented set).
- **Checkers + CheckInput types are co-located in the definition files** (not in
  `src/lib/answerChecker.ts` or `src/types/problem.ts`, which Agent 1 owns).
  Each component imports its own checker directly, so the live render path does
  not depend on the `ProblemCheckInput` union. The stale
  `checkProblem7`/`checkProblem8` + `Problem7CheckInput`/`Problem8CheckInput` in
  `answerChecker.ts` / `types/problem.ts` are now **dead for these two problems**
  (old wheel/$5 content); Agent 1 should reconcile the union at integration
  (see §5).

### CheckInput type shapes (for the `ProblemCheckInput` union)

```ts
// problem-7.ts
export interface BoothPreviewCheckInput {
  boothARun: boolean
  boothBRun: boolean
  feelSame: string        // 'yes' | 'no'
  averageAnswer: string   // 'yes-5' | 'no-different' | 'no-single'
}
// problem-8.ts
export interface WiderSpreadCheckInput {
  gameASimulated: boolean
  gameBSimulated: boolean
  evA: string
  evB: string
  higherRisk: string      // 'A' | 'B'
  reason: string          // explanation option key
}
// ev-l5-p3.ts
export interface FinalDecisionCheckInput {
  grouped: boolean
  probabilities: [string, string, string]   // $36, $12, $0
  contributions: [string, string, string]   // $36, $12, $0
  expectedPayout: string
  expectedProfit: string
  decision: string
  riskChoice: string                          // 'variable-outcomes' | 'guaranteed' | 'no-risk'
}
```

Each definition is typed as a local `CanonicalProblemDefinition extends
ProblemDefinition` adding optional `canonicalSlug`, `legacyProblemId`,
`desktopWorkspaceLayout?`, `mobileWorkspaceLayout?`. This is a structural
superset of `ProblemDefinition`, so registration into a `ProblemDefinition[]`
remains assignable. When Agent 1 adds those optional fields to the central
`ProblemDefinition`, the local extensions become redundant but stay compatible.

---

## 2. `src/lib/simulation.ts` API (new, owned by Agent 5)

Pure, framework-free, deterministic. Every draw goes through an injected
`RandomSource`. Components derive a stable seed from `problemId + run counter`,
so animated and reduced-motion paths render **identical** outcome sequences.

```ts
type RandomSource = () => number
createSeededRandom(seed: number): RandomSource          // mulberry32
hashSeed(input: string): number                         // FNV-1a → 32-bit seed
interface DiscreteOutcome { value: number; probability: number }
interface SimulationResult { results; total; runningAverage; average; trials }
drawOutcome(outcomes, rng?): number
simulateDiscrete(outcomes, trials, rng?): SimulationResult
expectedValue(outcomes): number
variance(outcomes): number
isSimulationComplete(trialsRun, required): boolean
constantGame(value): DiscreteOutcome[]                  // guaranteed payout
sectionsToOutcomes(values: number[]): DiscreteOutcome[] // equally-likely wheel/spinner
simulateSections(values, trials, rng?): SimulationResult
rollDie(sides, rng?): number                            // 1..sides
simulateDice(sides, trials, rng?): SimulationResult
runDeterministicBatch(outcomes, trials, runKey: string): SimulationResult
```

Covers dice / spinner / booth / generic discrete-trial sims. Lesson 1 may adopt
`simulateDice` / `simulateSections` later; nothing in Lesson 1 imports it yet, so
adoption is non-breaking. Tests: `src/lib/simulation.test.ts` (26 cases incl.
seed reproducibility, reduced-motion-equals-animated invariant, EV/variance,
12-section wheel EV = $6).

---

## 3. PRD conformance (per problem)

### ev-l5-p1 — Carnival Booth Preview (`problem-7`)
**Satisfied:** qualitative-only (no probability table / cost / fairness); Booth A
always $5, Booth B 50% $10 / 50% $0; Run-5-rounds previews each; both-preview gate
before MC; Q1 "feel same?" = No, Q2 "same average?" = Yes ($5); mistake types
`claimed-different-average` / `claimed-same-feel` / `confused-single-round-with-ev`
all reachable; outcome strips + running-average meters (`BoothPreview` visual);
coin-drop vs spin-pop entrance animations with reduced-motion collapse; deterministic
outcomes via seeded RNG; live region announces both averages; review/restart via
shell; tap (button) interaction (no drag).
**Partial/notes:** Animations are CSS entrance easings keyed off `prefers-reduced-motion`
(via `usePrefersReducedMotion`); the exact 120 ms stagger / 600 ms bounce timings are
approximated with `animationDelay` + keyframes. The "dashed tie line aligning both
meters at $5" is rendered as the target line on each meter rather than a single shared
overlay.

### ev-l5-p2 — Wider Spread, Same Average (`problem-8`)
**Satisfied:** **uses $6 vs $12/$0 (NOT L5P1's $5/$10/$0)**; 20-trial sims each with
gate; EV(A)=6 and EV(B)=6 inputs (flexible money formats `6`/`6.0`/`$6`/`$6.00`);
riskier = Game B; explanation MC (wider-spread / variable-outcomes / can-be-0-or-12 +
distractors); flat vs jagged running-average graphs converging to $6 (`RiskComparisonGraph`
made configurable: `target`, `maxY`, `labelA`, `labelB`); all five mistake types reachable;
deterministic seeded sims; live region; review/restart.
**COHESION GUARD (explicit):** `checkWiderSpread` **rejects the L5P1 booth payouts** —
EV(A)=`5` → `ev-arithmetic-error` ("previous booth game"); EV(B)=`5` or `10` →
`ev-arithmetic-error`; EV(B)=`12` → `claimed-game-b-has-higher-ev`. Verified by tests.

### ev-l5-p3 — Final Carnival Decision (`ev-l5-p3`, NEW capstone)
**Satisfied:** 12-section wheel 1×$36 / 3×$12 / 8×$0, cost $6 (`CarnivalWheel`
extended with configurable `sections` + `buildWheelSections`); tap-to-group gate;
full table probabilities (1/12, 3/12, 8/12 — fraction/decimal/reduced/percent accepted)
→ contributions (3,3,0) → expected payout (6) → expected profit (0, with cost block)
→ fairness number line + Fair decision → risk-interpretation MC; **sequential stepped
checklist (one active row at a time, later rows locked/dimmed) to avoid scroll-chasing**;
all eight PRD mistake types reachable (wrong-denominator, counts-not-probability,
omitted-zero-row, arithmetic-error, payout-not-profit, fair-marked-favorable,
confused-ev-with-guaranteed, believed-fair-has-no-risk); inline cell status on incorrect
submit; review/restart; single graded `final` attempt drives mastery.
**Partial/notes:** Step progression gates on **filled-ness** (not correctness) so the
authoritative final `checkFinalDecision` can classify mistakes; intermediate inline
status appears after a submit. Mini-demo steps not supplied (no `demoSteps`), matching
the existing shell convention that a demo only appears when a brand-new interaction
supplies steps — the wheel/table pattern is already established in the chapter.

**Missing across all three:** none of the PRD answer/feedback requirements are omitted.
The only deliberate simplifications are animation-timing fidelity (CSS approximations)
and demo steps (see notes above).

---

## 4. Files touched / created

Created:
- `src/lib/simulation.ts`, `src/lib/simulation.test.ts`
- `src/data/problems/ev-l5-p3.ts`
- `src/components/problems/EvL5P3FinalDecision.tsx`
- `src/components/problems/lesson5.css`
- `src/components/problems/lesson5-checkers.test.ts`
- `src/components/visuals/BoothPreview.tsx`, `src/components/visuals/BoothPreview.css`
- `docs/parallel/agent-5-lesson-5-handoff.md` (this file)

Modified (allowed/owned):
- `src/data/problems/problem-7.ts` (REVISED → Booth Preview + checker + CheckInput)
- `src/data/problems/problem-8.ts` (REVISED → Wider Spread + checker + CheckInput)
- `src/components/problems/Problem7WholeEVModel.tsx` (REVISED → Booth Preview UI)
- `src/components/problems/Problem8SameEVDifferentRisk.tsx` (REVISED → $6 / $12-$0 UI)
- `src/components/visuals/CarnivalWheel.tsx` (configurable `sections` + `buildWheelSections`; backward-compatible default)
- `src/components/visuals/RiskComparisonGraph.tsx` (configurable `target`/`maxY`/`labelA`/`labelB`)

Imported read-only (NOT edited): `RunningAverageGraph` (Agent 3), `FairnessNumberLine`
(Agent 4), `src/lib/answerParser.ts`, `src/lib/fieldStatus.ts`, learning shell
(`ProblemLayout`, `TaskGuide`, `usePrefersReducedMotion`), hooks.

---

## 5. Agent 1 wiring needs (integration checklist)

1. `src/data/problems/index.ts`: `import { EV_L5_P3 } from './ev-l5-p3'`; add to `ALL_PROBLEMS`.
2. `src/pages/ProblemPage.tsx`: map `'ev-l5-p3' → EvL5P3FinalDecision`. (problem-7 / problem-8 already mapped to the same export names.)
3. `src/data/implementedProblems.ts`: add `'ev-l5-p3'`.
4. `ProblemCheckInput` union in `src/types/problem.ts`: the old `Problem7CheckInput` /
   `Problem8CheckInput` no longer match these problems. Either (a) replace them with
   `BoothPreviewCheckInput` / `WiderSpreadCheckInput` and add `FinalDecisionCheckInput`,
   or (b) leave the union as-is (the live path does not use it — each component imports
   its own co-located checker). The stale `checkProblem7` / `checkProblem8` in
   `answerChecker.ts` and their `answerChecker.test.ts` cases still reference the OLD
   wheel/$5 content; they pass today but are dead for these problems and can be removed
   or repointed at integration.
5. `getProblemMeta('ev-l5-p3')` must resolve (canonical model already lists it at
   globalProblemIndex 14) so `ProblemLayout` shows "Problem 15 of 15" and capstone
   emphasis. Mastery already requires `ev-l5-p3` / `ev-l5-p2` per Agent 1 handoff — no change.

---

## 6. Risks / watch-items
- **Type union reconciliation (low):** see §5.4 — purely an Agent-1 integration step;
  no live regression because components use co-located checkers.
- **Stale `answerChecker` tests (low):** `answerChecker.test.ts` still tests the OLD
  problem-7/8 logic; harmless but misleading. Flag for cleanup.
- **`CarnivalWheel` API change (low):** added an optional `sections` prop with a
  backward-compatible default; the only previous caller (old Problem7) no longer uses
  the wheel. `buildWheelSections` export adds a fast-refresh-only oxlint warning,
  consistent with the existing `SECTIONS` export.
- **Animation timing fidelity (cosmetic):** CSS approximations of the PRD's exact
  millisecond specs; deterministic correctness and reduced-motion behavior are met.
- **`prefers-reduced-motion` determinism:** outcomes are computed once via the seeded
  helper and stored in session state, so reduced-motion and animated renders are
  provably identical (unit-tested invariant in `simulation.test.ts`).
