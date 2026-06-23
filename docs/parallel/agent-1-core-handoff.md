# Agent 1 — Core Architecture Handoff

Owner: Agent 1 (Core Architecture, Progression, Persistence, Final Integration).
Scope of this document: everything Agents 2/3/4 need to build against, plus the
final-integration checklist Agent 1 will execute after all branches merge.

This branch implements the **five-lesson / twenty-problem** ordered progression
model, backward-compatible persistence, `attemptMode`, demo/review-snapshot
support, the Firestore doc-ID fix, mastery/milestone updates for 20 problems,
and tests. **No UI, problem-pack, or `package.json` changes were made.**

---

## 1. Canonical problem model (source of truth)

File: `src/core/progression/canonical.ts`

20 ordered problems, 4 per lesson. Ordering is driven by `globalProblemIndex`
(0-based). Each `CanonicalProblem` has `{ canonicalSlug, storageId, lessonId,
lessonIndex, problemIndexWithinLesson, globalProblemIndex, title, concept }`.

### Storage ID ↔ canonical slug mapping

| # | canonicalSlug | storageId | lesson |
|---|---|---|---|
| 1 | l1-long-run-average | `problem-1` | lesson-1 |
| 2 | l1-unequal-spinner | `l1-unequal-spinner` | lesson-1 |
| 3 | l1-short-run-vs-long-run | `l1-short-run-vs-long-run` | lesson-1 |
| 4 | l1-compare-spinners | `l1-compare-spinners` | lesson-1 |
| 5 | l2-build-weighted-average | `problem-2` | lesson-2 |
| 6 | l2-match-outcomes-probabilities | `l2-match-outcomes-probabilities` | lesson-2 |
| 7 | l2-fill-missing-formula | `l2-fill-missing-formula` | lesson-2 |
| 8 | l2-diagnose-bad-ev-setups | `l2-diagnose-bad-ev-setups` | lesson-2 |
| 9 | l3-mystery-box-outcomes | `problem-3` | lesson-3 |
| 10 | l3-calculate-ev-from-table | `problem-4` | lesson-3 |
| 11 | l3-repair-probability-table | `l3-repair-probability-table` | lesson-3 |
| 12 | l3-prize-bag-ev-table | `l3-prize-bag-ev-table` | lesson-3 |
| 13 | l4-payout-vs-profit | `problem-5` | lesson-4 |
| 14 | l4-fair-favorable-unfavorable | `problem-6` | lesson-4 |
| 15 | l4-find-fair-price | `l4-find-fair-price` | lesson-4 |
| 16 | l4-choose-better-game-after-cost | `l4-choose-better-game-after-cost` | lesson-4 |
| 17 | l5-build-whole-ev-model | `problem-7` | lesson-5 |
| 18 | l5-same-ev-different-risk | `problem-8` | lesson-5 |
| 19 | l5-low-risk-vs-high-risk | `l5-low-risk-vs-high-risk` | lesson-5 |
| 20 | l5-final-capstone-ev-decision | `l5-final-capstone-ev-decision` | lesson-5 |

The original eight problems keep their historic `problem-N` storage IDs so
existing `completedProblemIds` keep resolving. New problems use their canonical
slug as the storage ID. **Do not rename `problem-1..problem-8`.**

### Mapping helpers (canonical.ts)
- `mapLegacyProblemIdToCanonicalSlug(id) => string | undefined`
- `mapCanonicalSlugToStorageId(slug) => string | undefined`
- `normalizeToStorageId(id)` / `normalizeToCanonicalSlug(id)` — accept either form
- `resolveCanonicalProblem(id)` — accepts slug or storage ID
- `getGlobalProblemIndex(id) => number` (-1 if unknown)
- `getProblemsForLesson(lessonId)`, `getLessonById(lessonId)`
- Constants: `CANONICAL_PROBLEMS`, `CANONICAL_LESSONS`, `TOTAL_PROBLEMS` (20),
  `TOTAL_LESSONS` (5), `PROBLEMS_PER_LESSON` (4), `CHAPTER_ID`.

---

## 2. Exported progression APIs

File: `src/core/progression/selectors.ts` (re-exported via `core/progression`).
All are **pure** and take `completedProblemIds` exactly as persisted (storage
IDs, legacy allowed, duplicates de-duped, unknown IDs ignored).

- `orderedChapterProblems()`
- `getLessonForProblem(id)` → `CanonicalLesson | undefined`
- `getGlobalProblemIndex(id)`
- `completedIndexSet(ids)`, `uniqueCompletedCount(ids)`
- `isProblemCompleted(id, ids)`, `isLessonCompleted(lessonId, ids)`
- `getCompletedLessonIds(ids)`
- `getLessonCompletionPercentage(lessonId, ids)`
- `getChapterCompletionPercentage(ids)`
- `getHighestSequentialCompletedIndex(ids)` (gap-aware; -1 if first incomplete)
- `getFarthestCompletedIndex(ids)`
- `isChapterComplete(ids)`
- `getNextIncompleteProblem(ids)` / `getNextIncompleteProblemId(ids)` (returns
  **storage ID** or `null` when all complete)
- `getContinueProblemId(ids)` (storage ID; first problem for review when done)
- `getCurrentLessonId(ids)`, `getNextLessonId(ids)`
- `getLessonProgressViews(ids, continueProblemId, allComplete)` → pathway view

### Legacy facade — `src/data/chapter.ts`
Kept stable for existing UI imports. Notable shapes preserved:
- `CHAPTER_PROBLEMS: { problemId, title, concept, order }[]` (now 20, `order` is
  1-based global index)
- `CHAPTER_LESSONS: { lessonId, title, order, problemIds }[]` (4 each)
- `CHAPTER_TITLE`, `CHAPTER_SUBTITLE`, `CHAPTER_DESCRIPTION`, `TOTAL_LESSONS`,
  `TOTAL_PROBLEMS`, `MILESTONE_DEFINITIONS`
- `getContinueProblemId(progress)` — **object-arg** signature unchanged
- `getProblemById`, `getProblemMeta`, `getLessonForProblem`, `getCompletedLessonIds`,
  `getLessonProgressViews`, `getNextIncompleteProblem`, `getNextIncompleteProblemIndex`,
  `getFarthestCompletedOrder`, `isLessonComplete`, `getCurrentLessonId(problemId)`

---

## 3. Mastery APIs

File: `src/core/mastery/mastery.ts`

- `deriveMasteryStatus({ completedCount, mastered }) => MasteryStatus`
- `evaluateChapterMastery(input) => MasteryEvaluationResult` (pure)
- `MASTERY_REQUIRED_SLUGS`, `STRONG_ATTEMPT_THRESHOLD` (15), `STRONG_ATTEMPT_MAX` (2)

Chapter is **mastered** when: all 20 complete **and** the capstone
(`l5-final-capstone-ev-decision`), full model (`l5-build-whole-ev-model`),
payout-vs-profit (`l4-payout-vs-profit`), and same-EV-vs-risk
(`l5-same-ev-different-risk`) are each correct via graded attempts **and** ≥15
problems were completed in ≤2 graded attempts. **Practice restarts are excluded**
from the attempt math (see §5), so they never reduce earned mastery.

Service entry point: `evaluateMastery(userId)` in `src/lib/masteryService.ts`
(signature unchanged) gathers attempts via
`buildCorrectByProblemGraded` / `buildGradedFinalAttemptCounts` and persists.

---

## 4. Exported persistence APIs

### Chapter progress — `src/lib/chapterProgressService.ts` (signatures unchanged)
- `ensureChapterProgress(userId)`, `getChapterProgress(userId)`
- `markProblemComplete(userId, problemId)` — idempotent; never regresses; dedupes
- `setCurrentProblem(userId, problemId)` — tracks open problem only
- `saveProgressDirect(progress)`, `computeCompletionPercentage(ids)`

`ChapterProgress` now also carries derived PRD fields (always recomputed on
write, never trusted from old docs): `currentLessonId`, `nextLessonId`,
`nextProblemId`, `highestSequentialCompletedGlobalIndex`, `completedLessonIds`.
Legacy fields (`currentProblemIndex`, `currentProblemId`) are retained.

### Lesson progress — `src/core/persistence/lessonProgressService.ts`
- `getLessonProgress(userId, lessonId, chapterCompletedProblemIds)`
- `syncLessonProgress(userId, chapterCompletedProblemIds)` — recompute + persist all 5
- Firestore: `lessonProgress/{userId}_{lessonId}`

### Problem progress — `src/core/persistence/problemProgressService.ts`
- `getProblemProgress(userId, problemId)`
- `updateProblemProgress(userId, problemId, patch)`
- `markDemoSeen(userId, problemId)` ← **demoSeen persistence for Agent 2**
- `recordProblemCompletion(userId, problemId, data)` ← stores `reviewSnapshot`
- `markProblemReviewed(userId, problemId)` ← Review Mode visit (no attempts)
- `beginPracticeRestart(userId, problemId)` ← bumps `restartCount` only
- Firestore: `problemProgress/{userId}_{problemId}`

### Migration / normalization — `src/core/persistence/migration.ts`
- `normalizeChapterProgress(raw, userId)` — legacy/partial/new → full, dedupes,
  derives PRD fields, preserves earned `Mastered`
- `mergeChapterProgress(a, b, userId)` — farthest-progress wins; tie = union of
  completions + newest `updatedAt`
- `normalizeLessonProgress`, `normalizeProblemProgress`, `createDefaultProblemProgress`
- `normalizeAttemptMode`, `isGradedAttemptMode`, `normalizeProblemAttempt`

### Local fallback — `src/lib/localProgressStore.ts`
Added `readLocalLessonProgress/writeLocalLessonProgress` and
`readLocalProblemProgress/writeLocalProblemProgress`. All services degrade to
local storage on `permission-denied`/offline, exactly like the existing ones.

---

## 5. attemptMode

Type: `AttemptMode = 'graded' | 'corrected_resubmission' | 'practice_restart'`
(in `src/types/problem.ts`). `ProblemAttempt.attemptMode` is **optional**; old
attempts and callers that omit it default to `graded` on write and on read.

- `recordProblemAttempt` defaults the mode safely.
- `getChapterAttempts` normalizes every returned attempt's mode.
- Mastery counts use `countGradedFinalAttempts` / `buildGradedFinalAttemptCounts`
  / `buildCorrectByProblemGraded`, all of which **exclude `practice_restart`**.
- Incomplete guard submissions remain ungraded (unchanged `isGradedAttempt`).

---

## 6. Firestore doc-ID fix

PRD/rules require `{userId}_expected_value_intro` (**underscores**); the old code
derived `{userId}_expected-value-intro` (hyphens) from `CHAPTER_ID`, which the
security rules reject — every chapter/milestone write silently fell back to
local storage.

- New writes use `chapterScopedDocId(userId)` (underscore) — `src/core/persistence/docIds.ts`.
- Reads tolerate the legacy hyphenated doc via `legacyChapterScopedDocId` and
  merge with local using `mergeChapterProgress` (farthest progress wins). No
  data is deleted; the winner is written forward to the underscore doc.
- `firestore.rules`: **added user-scoped rules** for the PRD-documented
  `lessonProgress` and `problemProgress` collections (same prefix-match pattern
  as `problemSessions`). Without these the PRD collections could not persist.
  `chapterProgress`/`milestones` rules already required the underscore suffix and
  were left unchanged. **Rules must be deployed** (`npm run deploy:rules`) for
  Firestore persistence of the new collections.

---

## 7. Fields expected by Agent 2 (UI)

Agent 2 can rely on these without re-deriving:
- Progress card / pathway: `ChapterProgress.{completionPercentage, masteryStatus,
  streakCount, completedLessonIds, currentLessonId, nextLessonId, nextProblemId,
  highestSequentialCompletedGlobalIndex}` + `getLessonProgressViews(...)`.
- Continue button: `getContinueProblemId(progress)`; when
  `isChapterComplete(progress.completedProblemIds)` is true, render Review/Mastery
  (the selector returns `problem-1` only as a review target — **do not start a
  fresh attempt**).
- Demo: call `markDemoSeen(userId, problemId)` after the mini-demo; read
  `getProblemProgress(...).demoSeen` to decide auto-play vs "Show demo again".
- Review Mode: read `getProblemProgress(...).reviewSnapshot` (+ `finalSubmittedAnswer`,
  `finalNormalizedAnswer`, `finalFeedbackKey`, `completedAt`) to render without
  re-running; call `markProblemReviewed(...)` (never creates attempts).
- Restart: call `beginPracticeRestart(...)`, and when recording practice attempts
  pass `attemptMode: 'practice_restart'` to `recordProblemAttempt`.

---

## 8. Interface expected from Agent 3 (Problems 1–10) and Agent 4 (Problems 11–20)

Each problem module must export a `ProblemDefinition` (`src/types/problem.ts`)
**keyed by its storage ID** from the table in §1:
- Agent 3 owns global indices 0–9: storage IDs `problem-1`, `l1-unequal-spinner`,
  `l1-short-run-vs-long-run`, `l1-compare-spinners`, `problem-2`,
  `l2-match-outcomes-probabilities`, `l2-fill-missing-formula`,
  `l2-diagnose-bad-ev-setups`, `problem-3`, `problem-4`.
- Agent 4 owns global indices 10–19: storage IDs `l3-repair-probability-table`,
  `l3-prize-bag-ev-table`, `problem-5`, `problem-6`, `l4-find-fair-price`,
  `l4-choose-better-game-after-cost`, `problem-7`, `problem-8`,
  `l5-low-risk-vs-high-risk`, `l5-final-capstone-ev-decision`.

`ProblemDefinition.problemId` **must equal the storage ID**. Deterministic
checkers must emit `CheckResult` and use `final` as the `stepId` for the graded
final answer (mastery counts `stepId === 'final'`). New per-problem check-input
types can be added to `src/types/problem.ts` (Agent 1 will reconcile the
`ProblemCheckInput` union during integration).

The registry `src/data/problems/index.ts` (owned by Agents 3/4) must include all
20 definitions so `getProblemDefinition(storageId)` resolves. Until then, only
the original 8 resolve and the new 12 fall through to the placeholder route.

---

## 9. Files intentionally NOT touched / not integrated yet

Not edited (boundary-respected): all `src/pages/**`, `src/components/**`
(incl. `lesson/**`, `visuals/**`, `problems/**`, `CoursePathway`,
`ChapterProgressCard`, `SuggestedReview`), `src/data/problems/**`,
`src/features/**`, `src/index.css`, `package.json`, and the pre-existing
untracked files `docs/validation-plan.md`, `src/validation/runValidation.ts`.

Not yet wired (deferred to final integration, see §10):
- `useProblemSession.ts` does not yet pass `attemptMode: 'practice_restart'` on
  restart, nor call `recordProblemCompletion` / `markDemoSeen` / `beginPracticeRestart`.
- `useChapterData.ts` line `if (progress.completedProblemIds.length === 8)` should
  become `>= TOTAL_PROBLEMS` (or `=== 20`) so a full-chapter load re-evaluates
  mastery (mastery still evaluates on each completion, so this is non-blocking).
- New problem modules 9–20 and their registry entries (Agents 3/4).
- UI surfaces still render whatever `CHAPTER_PROBLEMS`/selectors return (now 20).

---

## 10. Final integration checklist (Agent 1, after all branches merge)

1. Audit merged exports; reconcile `ProblemCheckInput` union with new problems.
2. Confirm `src/data/problems/index.ts` registers all 20 storage IDs.
3. Wire `useProblemSession`: practice attempts → `attemptMode: 'practice_restart'`
   + `beginPracticeRestart`; on completion → `recordProblemCompletion` with a
   `reviewSnapshot`; demo → `markDemoSeen`; review open → `markProblemReviewed`.
4. Call `syncLessonProgress(userId, completedProblemIds)` after each completion.
5. Update `useChapterData` mastery trigger to `>= TOTAL_PROBLEMS`.
6. Connect UI (Agent 2) to progression selectors + new persistence fields.
7. Deploy Firestore rules (`npm run deploy:rules`).
8. Run `npm run test`, `npm run build`, `npm run lint`.
9. Execute the PRD manual test scenario (Page 10) incl. review/restart and the
   "review old problem while Continue still points forward" invariant.
10. Produce integration report; request approval before the integration commit.

---

## 11. Validation results (this branch)

- `npm run test`: **329 passed / 22 files** (was 42/4 at baseline).
- `npm run build`: **passes** (`tsc -b && vite build`).
- `npm run lint`: **passes** (only pre-existing warnings in untouched files).
- `npm run validate:answers`: identical to `npm run test` (`vitest run`) — redundant, green.
