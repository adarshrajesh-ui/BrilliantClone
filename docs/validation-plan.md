# Validation and Test Coverage — Midpoint (15-problem chapter)

> Source of truth: `prd.md` (binding, not edited). This plan verifies the
> **fully-built** 5-lesson × 3-problem chapter (15 problems). The deterministic
> layer executes the **real, co-located answer checkers** (not a spec mirror);
> everything requiring the live app, Firebase, animation, or a screen reader is
> captured as a manual audit below.

## 1. Purpose

Confirm the chapter follows the PRD:

- one login-based **Expected Value** chapter,
- **5 lessons × 3 problems = 15** visual, interactive problems,
- **deterministic** answer checking (no AI / no model calls),
- **hand-written** hints and feedback shown beside the active control,
- backward-compatible **progress migration** (20 → 15, legacy IDs preserved),
- **mastery** = all 15 + capstone + payout-vs-profit + same-EV-vs-risk + ≥11/15
  within ≤2 graded attempts,
- **no scroll-chasing**, **tap-to-place** everywhere, **reduced-motion** parity.

## 2. Deterministic layer (`src/validation/`)

| File | Role |
|------|------|
| `liveCheckers.ts` | Dispatch (`runLiveChecker`) to all 15 **real** checkers. |
| `answerValidationMatrix.ts` | Normalizer cases + per-problem live-checker cases (correct / mistake / guard) + `problemSpecs` summary. |
| `problemBehaviorValidation.ts` | Per-problem completion rules, gates, mistake types; global session behaviors; `isGradedAttempt` fixtures. |
| `prdValidationChecklist.ts` | PRD checklist by category with `pass` / `not_run` status + `checklistSummary()`. |
| `runValidation.ts` | Self-contained runner over all cases (`runAllValidations`). |
| `liveCheckerValidation.test.ts` | **Executable** per-problem PRD verification (correct passes, mistake classified, gates non-graded). |
| `prdCoverage.test.ts` | Structure / migration / mastery assertions against the live core model. |

Run scoped:

```bash
npx vitest run src/validation
npx oxlint src/validation
npx tsc --noEmit -p tsconfig.app.json
```

### CHECKER → STORAGE ID map (what the live components actually call)

| Storage ID | Slug | Live checker (file) |
|------------|------|---------------------|
| problem-1 | ev-l1-p1 | `checkProblem1Dice` (data/problems/problem-1.ts) |
| ev-l1-p2 | ev-l1-p2 | `checkEvL1P2` (ev-l1-p2.ts) |
| ev-l1-p3 | ev-l1-p3 | `checkEvL1P3` (ev-l1-p3.ts) |
| problem-2 | ev-l2-p1 | `checkProblem2PrizeBoard` (problem-2.ts) |
| ev-l2-p2 | ev-l2-p2 | `checkEvL2P2` (ev-l2-p2.ts) |
| ev-l2-p3 | ev-l2-p3 | `checkEvL2P3` (ev-l2-p3.ts) |
| problem-3 | ev-l3-p1 | `checkProblem3` (lib/answerChecker.ts) |
| problem-4 | ev-l3-p2 | `checkProblem4` (lib/answerChecker.ts) |
| ev-l3-p3 | ev-l3-p3 | `checkEvL3P3` (EvL3P3PrizeBagTable.checker.ts) |
| problem-5 | ev-l4-p1 | `checkEvL4P1` (Problem5PayoutVsProfit.checker.ts) |
| problem-6 | ev-l4-p2 | `checkProblem6` (lib/answerChecker.ts) |
| ev-l4-p3 | ev-l4-p3 | `checkEvL4P3` (EvL4P3BetterGame.checker.ts) |
| problem-7 | ev-l5-p1 | `checkBoothPreview` (problem-7.ts) |
| problem-8 | ev-l5-p2 | `checkWiderSpread` (problem-8.ts) |
| ev-l5-p3 | ev-l5-p3 | `checkFinalDecision` (ev-l5-p3.ts) |

> The legacy `checkProblem` switch in `lib/answerChecker.ts` still routes
> problem-1/2/5/7/8 to PRE-15 semantics and is **dead code** — validation
> deliberately wires each ID to the checker the live component uses.

## 3. Problem-by-problem matrix (15 problems)

| Slug | Title | Correct | Representative mistake → type | Gate (non-graded) |
|------|-------|---------|------------------------------|-------------------|
| ev-l1-p1 | Dice Toss Average | `$5` (`5`,`$5`,`5 dollars`,`5 per throw`) | `$0` → `chose-extreme-outcome`; `$10` → `selected-largest-payout` | prediction + ≥5 manual + ≥100 total |
| ev-l1-p2 | Unequal Section Game | `$5` | `$20` → `used-largest-payout`; `$0.80` → `divided-payout-by-percent` | prediction + ≥100 spins |
| ev-l1-p3 | Compare Two Games | same EV | B → `chose-bigger-prize`; A → `chose-more-frequent` | choice required |
| ev-l2-p1 | Prize Board Weight Drop | `$5` | reversed pair → `reversed-outcome-probability`; EV `20` → `used-largest-payout` | **board-before-formula** |
| ev-l2-p2 | Match Outcomes | $12↔1/3, $3↔1/2, $0↔1/6 | $12↔1/2 → `ranked-by-size`; dup → `reused-probability` | all matched |
| ev-l2-p3 | Diagnose Bad Setups | C valid | A → `chose-raw-sum`; B → `chose-incomplete` | valid selected |
| ev-l3-p1 | Mystery Box Reveal | 1/6,2/6,3/6 | count in prob cell → `counts-as-probabilities` | **all six boxes open** |
| ev-l3-p2 | Calculate EV from Table | 2,2,0 → `$4` | raw payouts → `unweighted-sum`; nonzero $0 → `omitted-zero-row` | all cells filled |
| ev-l3-p3 | Prize Bag EV Table | `$4.50` | total payout 45 → `used-total-token-payout` | all cells filled |
| ev-l4-p1 | Pay to Play | `$1` | `4` → `answered-payout`; `7` → `added-cost`; `0.75` → `cost-as-probability` | **cost-before-profit** |
| ev-l4-p2 | Fair/Favorable/Unfavorable | A=fair,B=fav,C=unfav | C=fav → `positive-payout-favorable`; A=fav → `confused-fair-favorable` | all placed |
| ev-l4-p3 | Choose Better Game | A=2,B=3 → B | chose A → `chose-larger-payout`; `9` → `forgot-subtract-cost` | both profits + choice |
| ev-l5-p1 | Carnival Booth Preview | feel=No, avg=Yes($5) | feel=Yes → `claimed-same-feel`; diff avg → `claimed-different-average` | **both previews** |
| ev-l5-p2 | Wider Spread, Same Average | EV(A)=EV(B)=$6; B riskier | EV(B)=12 → `claimed-game-b-has-higher-ev`; **$5 → `ev-arithmetic-error`** | both 20-trial sims |
| ev-l5-p3 | Final Carnival Decision | payout $6, profit $0, fair | count→`counts-not-probability`; profit=6→`payout-not-profit`; fav→`fair-marked-favorable` | **group wheel** + cells |

**L5P1 ≠ L5P2:** L5P1 uses $5 / $10-$0 (qualitative); L5P2 uses $6 / $12-$0
(EV calculation). The L5P2 checker actively rejects the L5P1 numbers
(`$5` → `ev-arithmetic-error`), asserted in `liveCheckerValidation.test.ts`.

## 4. Manual audit checklist — a11y / tap-to-place / reduced-motion / no-scroll

Run at **two viewports**: desktop **1280×720** (min supported 1024×640) and a
**mobile** viewport (**390×844**, iPhone-class). Use keyboard + a screen reader
(VoiceOver / NVDA). The deterministic layer cannot see layout/animation, so this
is the binding sign-off for those PRD rules.

### 4a. No-scroll-chasing (per problem, 1280×720)
- [ ] Title, current instruction, required visual, active interaction, check/submit, and feedback location are all visible **without page scroll** in the initial viewport.
- [ ] After a **wrong** check, the feedback is visible **without return scroll** (beneath/beside the active control, never at page bottom).
- [ ] Corrected answers are editable in place; Continue appears in the same workspace.
- [ ] Secondary/collapsible help does not push the active task out of view when expanded.
- [ ] Capstone (ev-l5-p3) uses a sequential one-active-row checklist that stays within the viewport.

### 4b. Mobile (390×844)
- [ ] No horizontal scrolling on any problem.
- [ ] Sticky current-task/action strip remains visible while typing.
- [ ] Feedback auto-scrolls into view beneath the checked input (learner never returns to page top).
- [ ] Compact visual summary stays present while interacting.
- [ ] Repeat the horizontal-overflow smoke check at **320×568** for the densest
  table/workspace routes: `/login`, `/home`, `/chapter/expected-value-intro`,
  `/chapter/expected-value-intro/problem/problem-1`,
  `/chapter/expected-value-intro/problem/problem-2`,
  `/chapter/expected-value-intro/problem/ev-l3-p3`,
  `/chapter/expected-value-intro/problem/problem-5`, and
  `/chapter/expected-value-intro/problem/ev-l5-p3`.

### 4c. Tap-to-place (every drag interaction)
- [ ] ev-l2-p1 token drops + formula cards: tap-to-select then tap-to-place works with no drag.
- [ ] ev-l2-p2 match: tap outcome → tap probability; tap again to replace; clear-row works.
- [ ] ev-l4-p1 cost token: tap-to-place equals drag.
- [ ] ev-l4-p2 bucket sort: tap card → tap bucket; tap again to move.
- [ ] ev-l1-p1 dice: tap die → tap throw zone produces the **same** seeded outcome as drag-release for the same throw index.
- [ ] **Correctness never depends on drag** (disable pointer drag, complete each problem by tap only).

### 4d. Reduced-motion (OS "Reduce Motion" on)
- [ ] ev-l1-p1: no tumble/bounce/sparkle; die instant-reveals the **same** seeded face; graph point appears without arc.
- [ ] ev-l3-p1: lids fade open, instant token + row values, same counts.
- [ ] ev-l5-p1 / ev-l5-p2: outcomes list instantly; meters/averages update without spin/bounce; outcomes identical to animated path.
- [ ] No confetti / no sparkle; EV reference-line highlight uses opacity step only.

### 4e. Keyboard + screen reader
- [ ] Focus order per problem: task → visual controls → input → check → feedback → continue.
- [ ] Live region announces each result/feedback within ~100ms (e.g. dice roll + running average; profit; classification).
- [ ] Graphs/meters expose a text summary of the latest average/state.
- [ ] Touch targets ≥44px (≥48px on the dice + throw zone).
- [ ] ev-l1-p1 keyboard throw path (Tab → Enter → arrows → Enter; Space for batch when unlocked).

### 4f. Flow / persistence (live app + Firebase)
- [ ] Google sign-in creates a profile; chapter/problem routes require auth.
- [ ] Continue routes to the first incomplete problem (globalProblemIndex 0..14).
- [ ] Resume mid-chapter returns to the same problem with prior state.
- [ ] Completing a problem updates chapter % (÷15) and lesson % (÷3); completed IDs persist.
- [ ] Restart This Problem resets interaction only; completion record preserved.
- [ ] A saved **removed** legacy slug (e.g. `l5-low-risk-vs-high-risk`) counts as its successor complete.
- [ ] No `.env` / secrets committed (`git status`, `.gitignore`).

## 5. What is automated vs manual

- **Automated (deterministic, executes live checkers):** accepted formats, every
  mistake type, completion gates, attempt-counting (guard vs graded), direct
  correction, L5P1/L5P2 cohesion, structure (15 / 3-per-lesson / 0..14), legacy
  ID preservation, removed-slug migration, chapter/lesson %, mastery 11/15 + key
  problems + status boundaries. See `npx vitest run src/validation`.
- **Manual (this §4 audit):** layout / no-scroll, tap-to-place parity,
  reduced-motion parity, live regions / keyboard / touch targets, animation
  fidelity, auth / persistence / resume.
