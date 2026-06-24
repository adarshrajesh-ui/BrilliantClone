# Validation and Test Coverage — Expected Value Lab MVP

> This is **not a new PRD**. It is a new *Validation and Test Coverage* section
> that sits alongside the existing PRD (`prd.md`) and verifies the **current,
> stable 8-problem MVP**. It intentionally does **not** evaluate the in-progress
> UI / interaction / animation / pathway-homepage work being done in parallel.

## 1. Purpose

This validation plan checks whether the current 8-problem Expected Value Lab MVP
follows the PRD. The MVP is:

- one login-based **Expected Value** chapter,
- **8 visual, interactive problems**,
- **deterministic** answer checking (no AI),
- **hand-written** hints and feedback,
- **saved progress** per user,
- **mistake-type tracking**,
- and explicitly **no AI** anywhere.

The deterministic portions are encoded as runnable cases under
`src/validation/` so they can be executed by the existing Vitest runner or a
standalone script. Everything that requires the live app, Firebase, or a mobile
device is captured as a manual QA checklist instead of a false "pass".

## 2. Scope

**In scope**

- answer normalization (`normalizeMoneyAnswer`, `parseProbabilityAnswer`, `normalizeClassificationAnswer`),
- answer checking (`checkProblem1..8` / `checkProblem`),
- accepted answer formats,
- incorrect answer rejection (and the correct `mistakeType`),
- direct correction behavior (fix-and-resubmit, no reset),
- completion rules per problem,
- mistake-type expectations,
- high-level user flow.

**Out of scope**

- the future 5-lesson architecture,
- new problems,
- the UI redesign currently being made by another agent,
- animations currently being made by another agent,
- the pathway / golf-course homepage redesign currently being made by another agent,
- Firebase deployment,
- production hosting,
- visual regression screenshots.

## 3. PRD Guardrails

Validation must confirm the MVP keeps **all** of these true:

- no AI tutor,
- no AI hints,
- no generated problems,
- no model calls,
- no additional chapters,
- no leaderboards,
- no payments,
- no teacher dashboards,
- no social features,
- no drag/drop-only correctness,
- tap-to-select / tap-to-place remains required wherever relevant.

These are tracked in `src/validation/prdValidationChecklist.ts` (category
`guardrails` and others). They are left `not_run` because they are confirmed by
code review and manual QA, not by the deterministic runner.

## 4. Problem-by-problem validation matrix

The full machine-readable matrix lives in
`src/validation/answerValidationMatrix.ts`. Summary of expected correct/incorrect
cases:

| # | Title | Accepted (correct) | Rejected (mistakeType) |
|---|-------|--------------------|------------------------|
| 1 | Long-Run Average | `$5` / `5` / `5.0` / `5.00` / `5 dollars` / `5 per spin` after ≥100 spins | `$0`, `$10` → `chose-extreme-outcome`; pre-100 spins / no prediction → guard (not graded) |
| 2 | Weighted Average | `$20×25% + $0×75%`, either pair order, EV `5`/`5.0`/`$5` | reversed pair → `reversed-outcome-probability`; empty slot → `omitted-probability`; EV `20` → `used-largest-payout` |
| 3 | Mystery Boxes | `1/6,2/6,3/6` or `0.1667,1/3,1/2` etc. with all boxes revealed | count typed as probability → `counts-as-probabilities`; bad `$0` row → `unknown`; probabilities not summing to 1 → `probabilities-not-one` (defensive*); not revealed → guard |
| 4 | Calculate EV | contributions `2,2,0`, EV `4`/`4.0`/`$4` | raw payouts → `unweighted-sum`; nonzero `$0` row → `omitted-zero-row`; bad row math → `arithmetic-error`; empty cell → guard |
| 5 | Payout vs Profit | profit `1`/`1.0`/`$1` | `4` → `answered-payout`; `7` → `added-cost`; cost-as-probability → `unknown`; no formula → guard |
| 6 | Fairness Sort | `A=fair, B=favorable, C=unfavorable` (case-insensitive + synonyms) | `C=favorable` → `positive-payout-favorable`; `A=favorable` → `confused-fair-favorable`; other → `forgot-subtract-cost`; missing card → guard |
| 7 | Whole EV Model | probs `1/10,2/10,7/10` (or `.1,.2,.7`), contribs `3,2,0`, payout `5`, profit `0`, decision `fair` | section counts as probs → `count-not-probability`; wrong denom → `wrong-denominator`; profit=payout → `payout-not-profit`; fair→favorable → `fair-marked-favorable`; empty cell → guard |
| 8 | Same EV, Different Risk | `EV(A)=5`, `EV(B)=5`, higher risk = Game B, reason = variable outcomes / same average but more spread | `EV(B)=10` → `b-higher-ev`; "identical" → `identical-games`; `EV(A)≠5` → `average-vs-guaranteed`; sims not run → guard |

\* For Problem 3 the per-row probability equivalence checks run before the
sum-to-1 check, so with the correct counts the `probabilities-not-one` branch is
a defensive guard rather than a commonly reachable path. It is documented but not
asserted as a runnable case (see `problemBehaviorValidation.ts`).

## 5. Manual QA checklist (browser flows)

Run these against the **current stable build** (not the in-progress redesign):

1. **Sign in** with Google; confirm a user profile is created.
2. **Start chapter** — land on Problem 1.
3. **Complete Problem 1** — submit a prediction, run ≥100 spins, choose `$5`.
4. **Submit a wrong answer and correct it** — e.g. on Problem 2 place a reversed
   pair, see the specific feedback, fix it, resubmit, and confirm it passes with
   **no reset** and that stale feedback cleared on edit.
5. **Use a hint** — reveal a hint and confirm `hintUsed` is recorded on the
   attempt.
6. **Resume mid-chapter** — leave after a few problems, return, and confirm you
   land back on the same problem with prior state intact.
7. **Complete progress update** — finish a problem and confirm completion
   percentage and completed-problem IDs update.
8. **Verify mobile width** — repeat a representative interactive problem at phone
   width; confirm tap-to-select / tap-to-place works without drag/drop.
9. **Verify no `.env` committed** — check `git status` / `.gitignore`; no secrets
   in the repo.

## 6. How to run the deterministic validation

The deterministic layer is in `src/validation/`:

- `answerValidationMatrix.ts` — accepted/rejected cases (money, probability,
  classification, per-problem, direct correction, completion rules).
- `problemBehaviorValidation.ts` — completion rules, required actions, mistake
  types, hint/feedback behavior, and global session behaviors.
- `prdValidationChecklist.ts` — PRD checklist by category (mostly `not_run`).
- `runValidation.ts` — a safe, self-contained runner. It imports the existing
  (unmodified) `answerParser` / `answerChecker` and reports pass/fail.

**No config or `package.json` changes were made.** The main agent can wire this
up later by:

- **Vitest (preferred):** create a new file `src/validation/runValidation.test.ts`
  that imports `runAllValidations()` and asserts `report.failed` is empty. The
  existing `npm run test` and `npm run validate:answers` scripts (`vitest run`)
  will then execute it.
- **Standalone script:** add a dev dependency such as `tsx` and run
  `npx tsx src/validation/runValidation.ts`, which prints the report and exits
  nonzero on any failure.

## 7. Known gaps requiring manual QA

- Auth, persistence, resume, completion percentage, mastery state, and mobile
  layout are **not** asserted by the deterministic runner (they need the live app
  + Firebase). They are tracked in the checklist as `not_run`.
- The "stale feedback clears on edit" and "hints set hintUsed" behaviors are
  structural (verified by reading `useProblemSession.ts`) and by manual QA.
- The `probabilities-not-one` mistake type is documented but practically
  unreachable given the per-row checks; treat it as defensive.
