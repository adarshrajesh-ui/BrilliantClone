# Agent 2 — Learning Experience, Problem UI Shell & Course-Map Handoff

Owner: Agent 2 (presentation / interaction layer only).
Scope: reusable learning shell, Learning Coach feedback, pre-problem demos,
current-task panel, inline field status, review/restart presentation, and the
golf-course progress map (compact home card + expanded chapter pathway).

This layer contains **no** progression, persistence, attempt-counting, mastery,
answer-checking, or central problem-ordering logic. Everything arrives via typed
props / existing selectors and is emitted back through callbacks.

---

## 1. Exported components & modules

### `src/features/learning-experience` (barrel: `index.ts`)

| Export | Kind | Purpose |
| --- | --- | --- |
| `ProblemIntroDemo` | component | Pre-problem mini-demo (Back/Next/Skip/Start, keyboard nav). |
| `DemoStep` / `DemoProgress` | component | Demo step body + progress dots. |
| `InteractionCallout` | component | "Tap a card, then a slot" style hint. |
| `CurrentTaskPanel` | component | Current task + checklist (near top of problem). |
| `ProblemStepChecklist` | component | Checklist with `needs-correction` support. |
| `LearningCoachPanel` | component | High/right feedback panel (correct + structured wrong). |
| `InlineFieldStatus` | component | Per-field correct/needs-correction indicator. |
| `ReviewModeBanner` | component | Completed-problem banner (review default + explicit restart). |
| `RestartProblemAction` | component | Explicit "Restart This Problem" button. |
| `ShowDemoAgainAction` | component | "Show demo again" button. |
| `ResponsiveProblemShell` | component | Two-column work/coach layout; responsive ordering. |
| `useDemoVisibility` | hook | Local (non-authoritative) demo-seen + show-again state. |
| `buildFallbackDemoSteps` / `fallbackDemoFromProblem` | fn | Generic demo when no pack config. |
| `demoNavReducer`, `canGoBack/Next`, `isFirst/LastStep` | fn | Pure demo navigation. |
| `checkResultToCoachFeedback`, `coachToneForResult`, `humanizeMistakeType` | fn | CheckResult → coach display model. |
| `ANIM`, `animationClass`, `usePrefersReducedMotion`, `getPrefersReducedMotion` | fn/const | Animation primitives + reduced-motion. |
| slug contract (`CANONICAL_PROBLEM_SLUGS`, `configKeyFor`, …) | fn/const | Canonical 20-slug keying. |

### `src/features/course-map` (barrel: `index.ts`)

| Export | Kind | Purpose |
| --- | --- | --- |
| `buildCourseMapView`, `flattenHoles` | fn | Pure derivation of map view model. |
| `CompactCourseMap` | component | Scalable serpentine SVG map (home card). |
| `CurrentChapterCard` | component | Elevated right-side home card. |
| `ExpandedCoursePathway` / `LessonZone` / `CourseHole` | component | Chapter-page pathway. |

---

## 2. Key prop / callback contracts

### `ProblemIntroDemo`
```ts
{
  steps: DemoStepConfig[]          // 2–5 concise steps
  finalCallToAction?: string
  title?: string
  stepIndex?: number               // optional controlled mode
  onStepChange?: (i: number) => void
  onSkip: () => void               // MUST NOT grade/complete/move progress
  onStart: () => void              // MUST NOT grade/complete/move progress
}
```
Guarantees: emits only the three callbacks; never writes Firestore, never sets
`hintUsed`, never records an attempt, never mutates completion. Keyboard:
`←/→` navigate, `Enter` advances/starts, `Esc` skips.

### `LearningCoachPanel`
```ts
{
  feedback: CoachFeedback | null   // null = idle
  onContinue?: () => void          // shown only on correct
  continueLabel?: string
  onRequestHint?: () => void       // reveals next hint (parent owns hint state)
  hintsRemaining?: number
  idleMessage?: string
  scrollIntoViewOnFeedback?: boolean
}
```

### `CurrentChapterCard` / course map
All progression values are inputs. `view: CourseMapView` comes from
`buildCourseMapView(...)`. Navigation is delegated via `problemHref(problemId)`
and `onSelectHole(problemId)`.

---

## 3. Demo config contract (for Agents 3/4)

The shell already renders a demo on first visit using a **generic fallback**
derived from `problem.{scenarioText, concept}`. To supply the real PRD demo copy,
pass `demoSteps` (and optionally `demoFinalCta`) into `ProblemLayout`:

```ts
import type { DemoStepConfig } from '../../features/learning-experience'

const demoSteps: DemoStepConfig[] = [
  { id: 's1', title: 'Two equal sections', body: 'Both $10 and $0 are equally likely.' },
  { id: 's2', title: 'The spin buttons', body: 'Spin Once / 10 / 100 run batches.' },
  // 2–5 steps total
]

<ProblemLayout ... demoSteps={demoSteps} demoFinalCta="Predict the average, then run 100 spins." />
```

Recommended future schema field on the central problem definition (Agent 1/3/4):
`demoConfig: { steps: DemoStepConfig[]; finalCallToAction?: string }`. Until then,
`ProblemLayout` accepts `demoSteps`/`demoFinalCta` props directly — no shared
schema edit is required to ship demo copy.

`DemoStepConfig`:
```ts
{ id: string; title?: string; body: ReactNode; highlightTargetId?: string; media?: ReactNode }
```

---

## 4. Feedback display contract

`CheckResult` (single `feedback` string + `mistakeType`) is mapped by
`checkResultToCoachFeedback`:

- **Correct / completing** → confirmation + optional `conceptSummary` + Continue.
- **Mistake** → structured: *What happened → Why it isn't right yet → What to do
  next*. With only a single string today, `whyWrong` = the string and `whatNext`
  is a generic correction prompt. Agents 3/4 can supply richer 3-part copy via the
  `structured` option (see `CoachFeedbackOptions`) — wire it through a future
  `ProblemLayout` prop if/when packs provide it.
- **Guard** (no mistake, not correct, e.g. "run 100 spins") → info, not an error.

`humanizeMistakeType` maps known mistake slugs to friendly labels and humanizes
unknown ones, so new mistake types from Agents 3/4 still render reasonably.

---

## 5. Course-map data contract

```ts
buildCourseMapView({
  lessons: LessonProgressView[]      // from getLessonProgressViews(...)  (Agent 1)
  problems: ChapterProblem[]         // CHAPTER_PROBLEMS                  (Agent 1)
  completedProblemIds: string[]
  continueProblemId: string          // from getContinueProblemId(...)    (Agent 1)
  allComplete: boolean
}) => CourseMapView
```

The map renders whatever zones/holes the selectors return. It already scales to
5 zones × 4 holes = 20: the compact map lays each lesson zone out as a serpentine
row, and the expanded pathway renders one zone block per lesson. **No change is
needed here when Agents 3/4 + Agent 1 grow the chapter to 20 problems** — just
keep `CHAPTER_PROBLEMS` / `CHAPTER_LESSONS` / `getLessonProgressViews` in sync.

---

## 6. Files created / edited

### Created
- `src/features/learning-experience/`: `types.ts`, `slugContract.ts`,
  `demoReducer.ts`, `feedbackModel.ts`, `animations.ts`, `useDemoVisibility.ts`,
  `fallbackDemo.ts`, `DemoProgress.tsx`, `DemoStep.tsx`, `InteractionCallout.tsx`,
  `ProblemIntroDemo.tsx`, `ProblemStepChecklist.tsx`, `CurrentTaskPanel.tsx`,
  `LearningCoachPanel.tsx`, `InlineFieldStatus.tsx`, `RestartProblemAction.tsx`,
  `ShowDemoAgainAction.tsx`, `ReviewModeBanner.tsx`, `ResponsiveProblemShell.tsx`,
  `index.ts`, plus `__tests__/` (5 specs).
- `src/features/course-map/`: `types.ts`, `courseMapModel.ts`,
  `CompactCourseMap.tsx`, `CurrentChapterCard.tsx`, `CourseHole.tsx`,
  `LessonZone.tsx`, `ExpandedCoursePathway.tsx`, `index.ts`, plus `__tests__/` (1 spec).
- `docs/parallel/agent-2-learning-ui-handoff.md` (this file).

### Edited (allowed list only)
- `src/components/lesson/ProblemLayout.tsx` — wraps work area in the shell,
  moves feedback into the Learning Coach rail, gates the demo, keeps review/restart.
- `src/components/lesson/TaskGuide.tsx` — delegates to `CurrentTaskPanel`
  (adds `needs-correction`); original `{id,label,done}` API preserved.
- `src/pages/HomePage.tsx` — swaps the inline progress card for `CurrentChapterCard`.
- `src/pages/ChapterPage.tsx` — swaps `CoursePathway` for `ExpandedCoursePathway`.
- `src/index.css` — **append-only** scoped section (shell, coach, demo, inline
  status, compact map, animation keyframes, `sr-only`).

### Intentionally NOT edited
The legacy `src/components/CoursePathway.tsx` and
`src/components/ChapterProgressCard.tsx` are now unused but left untouched (not on
the allowed-edit list). They can be deleted later by whoever owns those files.

### Forbidden files — confirmed untouched
`src/data/chapter.ts`, `src/hooks/useProblemSession.ts`,
`src/hooks/useChapterData.ts`, all `src/lib/*Service.ts`, `src/lib/answerParser.ts`,
`src/lib/answerChecker.ts`, Firestore rules, `package.json`, Agent 3/4 problem
packs. No dependencies added.

---

## 7. Tests added (pure-logic, no DOM deps)

- `demoReducer.test.ts` — step navigation + clamping + predicates.
- `slugContract.test.ts` — 20 unique slugs, ordering, legacy round-trip, `configKeyFor`.
- `feedbackModel.test.ts` — tone mapping, mistake humanization, structured vs fallback.
- `checklist.test.ts` — status resolution incl. `needs-correction`, done counting.
- `inlineStatus.test.ts` — field-status mapping.
- `courseMapModel.test.ts` — hole states, final hole, current order, zone flags.

Result: **315 tests pass (21 files)**.

---

## 8. Manual QA notes (run `npm run dev`)

1. Open Problem 1 → demo appears first (fallback copy until pack supplies steps).
2. Back/Next/Skip/Start + arrow keys / Enter / Esc all work; demo never records
   an attempt or hint.
3. Start → interactive view; submit a wrong answer.
4. Feedback shows in the **right rail (desktop)** / **directly below the task
   (mobile)** — high and visible, not buried. Wrong feedback shows mistake label
   + "Why it isn't right yet" + "What to do next".
5. Correct the answer in place; other fields stay filled.
6. Complete → review banner shows "Continue to next problem".
7. Reopen completed problem → **Review Mode is default**, demo does NOT auto-replay.
8. "Restart This Problem" is explicit; "Show demo" in review is opt-in.
9. Home right card shows %/streak/mastery/milestones + compact map with current
   hole glow; final hole shows a trophy/capstone treatment.
10. Narrow the window: card and shell stack cleanly with no horizontal overflow.

---

## 9. Known limitations

- **No component-render tests.** `@testing-library/react` / `jsdom` are not
  installed and adding deps is out of scope, so rendering is validated manually
  (section 8) and only pure logic is unit-tested.
- **Structured 3-part wrong-answer copy** falls back to the single `CheckResult`
  string until Agents 3/4 supply explicit `whatHappened/whyWrong/whatNext`.
- **Demo-seen state is localStorage-only** (per PRD allowance). It is intentionally
  non-authoritative and never affects progress/attempts/mastery.

---

## 10. Integration instructions for Agent 1

1. **No action required for the map to scale** — feed `CHAPTER_PROBLEMS`,
   `CHAPTER_LESSONS`, and `getLessonProgressViews` for all 20 problems and the
   compact + expanded maps update automatically.
2. **Optional**: promote demo-seen from localStorage to
   `problemProgress.demoSeen` / `demoLastSeenAt`. Keep the `useDemoVisibility`
   public shape (`{ showDemo, seen, markSeen, showAgain, dismiss }`) and the UI
   needs no change.
3. **Optional**: add `demoConfig` to the central problem schema; the UI already
   accepts `demoSteps`/`demoFinalCta` props, so this is purely a plumbing change.
4. ⚠️ **Build blocker observed in the shared tree (not caused by Agent 2):**
   `src/lib/chapterProgressService.ts` currently has an unused `CHAPTER_ID`
   import (TS6133), which fails `npm run build`. This file is owned by Agent 1
   and was being modified concurrently. Agent 2 did **not** touch it. A
   project-wide `tsc --noEmit` confirms this is the *only* type error and that
   all Agent 2 files are clean. Please remove the unused import (or use it) to
   restore the green build.

## 11. Integration expectations for Agents 3/4

- Pass `demoSteps` (2–5 `DemoStepConfig`) + `demoFinalCta` to `ProblemLayout` for
  real PRD demo copy.
- Optionally pass structured wrong-answer copy through (future `ProblemLayout`
  prop) for the 3-part coach layout; otherwise the single feedback string is used.
- Use `TaskGuide` step `status: 'needs-correction'` to flag a checklist step that
  the learner must fix.
- New mistake-type slugs render via `humanizeMistakeType`; add friendly labels to
  the `MISTAKE_LABELS` map in `feedbackModel.ts` for polish.
