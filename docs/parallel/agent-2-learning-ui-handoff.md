# Agent 2 — Learning UX Shell + Home/Golf Pathway Handoff (run 2026-06-24-ev-lab-15)

Owner: Agent 2 (presentation / interaction layer only).
Scope: reusable learning shell (`src/features/learning-experience/**`),
problem layout + lesson UI (`src/components/lesson/**`), and the golf-course map
+ home current-chapter card (`src/features/course-map/**`,
`src/pages/HomePage.tsx`, `CoursePathway`/`ChapterProgressCard`/`SuggestedReview`).

This layer contains **no** progression, persistence, attempt-counting, mastery,
answer-checking, or problem-ordering logic. All progression values arrive via
typed props / Agent-1 selectors and are emitted back through callbacks. **No AI.**

This run was a verify+repair pass against the PRD's **15-problem (5×3)** model.
The core 20→15 migration was already complete and green; the shell/course-map
were already data-driven, so most repairs were targeted fixes to lingering
20/4-hole assumptions plus two missing PRD UX primitives.

---

## 1. PRD requirements — satisfied / partial / out-of-scope

### Satisfied (already present, verified) ✅
- **No-scroll-chasing two-region workspace (≥768px).** `ResponsiveProblemShell`
  renders a wide work column + sticky right rail (`grid-template-areas: task/work/hints`
  left, `coach` right) so task, controls, feedback, and Continue are all visible
  without return scroll. (`ResponsiveProblemShell.tsx`, `.problem-shell-*` in `index.css`.)
- **Coach feedback placement.** `LearningCoachPanel` lives in the right rail
  directly beside/beneath the active controls on desktop (not distant upper-right),
  and ordered `task → coach → work` on mobile (collapses at `max-width: 920px`).
  Wrong = structured *what happened / why / what next*; correct = short
  confirmation + Continue in the same workspace.
- **Current-task panel + step checklist.** `CurrentTaskPanel` / `ProblemStepChecklist`
  (rendered via `ProblemLayout` `taskPanel`), with `needs-correction` step status.
- **Pre-problem mini-demo system.** `ProblemIntroDemo` (Back / Next / Skip / Start +
  keyboard ←/→, Enter, Esc) and `ShowDemoAgainAction`. Demo emits only
  `onSkip`/`onStart`/`onStepChange`; never grades, records an attempt, sets
  `hintUsed`, or mutates completion. Demo never auto-replays on a completed problem.
- **Review Mode + explicit Restart.** `ReviewModeBanner` (review is the default for
  completed problems) with an explicit **"Restart This Problem"** action; restart is
  opt-in practice and does not touch saved progress.
- **Golf-course pathway 5 zones × 3 holes = 15.** Count-agnostic, fully data-driven
  off `CHAPTER_PROBLEMS` / `getLessonProgressViews`. Glowing current marker
  (`coursemap-marker`, `ccm-glow`), completed/current/future states, and final-hole
  capstone emphasis.
- **Home current-chapter card.** `CurrentChapterCard` (used by `HomePage`) — %, streak,
  mastery, milestones (from `MILESTONE_DEFINITIONS.length`), compact map, Continue/Review.
- **Count strings.** Home/chapter copy uses `CHAPTER_LESSONS.length` /
  `CHAPTER_PROBLEMS.length` / `TOTAL_LESSONS` / `TOTAL_PROBLEMS` — no hard-coded 20/4.

### Repaired this run 🔧 (were wrong / missing for the 15-model)
- **`slugContract.ts` was still the 20-slug legacy-named model.** Rewritten to the
  15 canonical `ev-l{N}-p{M}` slugs with `SLUG_TO_LEGACY_ID` mapping the 8 preserved
  `problem-N` storage IDs; new problems pass through (storageId === canonical slug).
  `configKeyFor`/`canonicalSlugIndex`/`isCanonicalSlug` updated; test rewritten (15 slugs).
- **Feedback auto-scroll into viewport (PRD mobile requirement) was missing.** Added
  `scrollIntoViewOnFeedback` (default true) to `LearningCoachPanel`: on fresh non-idle
  feedback it calls `scrollIntoView({ block: 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' })`.
  `block: 'nearest'` is a no-op on the already-visible sticky desktop rail and brings the
  off-screen mobile panel into view — "learner never returns to page top to read a result."
- **Reduced-motion primitive name.** Added `prefersReducedMotion()` (interface-spec
  name; alias of `getPrefersReducedMotion`) + documented deterministic usage pattern
  in `animations.ts`, exported from the barrel for problem agents to import.
- **`CompactCourseMap` forced 4 columns** (`Math.max(4, …)`) — left an empty column
  with 3 holes/zone and skewed the serpentine. Now `Math.max(…zoneHoleCounts, 1)`.
- **Final-hole capstone emphasis missing in the expanded pathway.** `CourseHole` now
  renders a 🏆 + "Capstone" tag on `isFinal`, with gold disc styling
  (`.coursemap-node-final`, `.coursemap-node-capstone-tag`). (Compact map + legacy
  cards already had `ccm-hole-final` / `cpc-hole-final`.)
- **Stale comments** "5 zones × 4 holes / 20 holes" updated to 15/3 in
  `CompactCourseMap.tsx` and `index.css`.

### Partial / depends on others ⚠️
- **3–5 sentence structured wrong-answer copy.** The shell renders 3 sections
  (what happened / why / what next) whenever the `CheckResult`/structured copy
  supplies them; with only a single `feedback` string it falls back to that string.
  Rich 3-part copy is the **problem agents' (3/4/5)** content responsibility —
  pass it via `checkResultToCoachFeedback`'s `structured` option / future
  `ProblemLayout` prop.
- **Per-problem real demo copy.** Shell accepts `demoSteps` + `demoFinalCta` on
  `ProblemLayout`; until a problem passes them no demo shows (by design — a demo
  appears only when a problem supplies steps for a new interaction).
- **Mobile sticky current-task + ≥44px touch targets.** Shell provides the
  structure (`.touch-target`, sticky-friendly ordering); each problem's own visual
  controls must keep tap targets ≥44px and tap-to-place equivalents (Agents 3/4/5).

### Out of Agent-2 scope (owned elsewhere)
- Tap-to-place for drag interactions, seeded-RNG sims, instant deterministic
  checking, and the actual P1 fun animations live in the problem components
  (Agents 3/4/5) and `src/lib/simulation.ts` (Agent 5). Agent 2 only provides the
  reduced-motion primitive + layout primitives they render inside.

---

## 2. Files touched this run

| File | Change |
| --- | --- |
| `src/features/learning-experience/slugContract.ts` | Rewrote 20→15 canonical `ev-l{N}-p{M}` model; `SLUG_TO_LEGACY_ID` → 8 preserved storage IDs; updated comments/`configKeyFor`. |
| `src/features/learning-experience/__tests__/slugContract.test.ts` | Rewrote for 15 slugs / new mappings. |
| `src/features/learning-experience/LearningCoachPanel.tsx` | Added `scrollIntoViewOnFeedback` auto-scroll (reduced-motion aware). |
| `src/features/learning-experience/animations.ts` | Added `prefersReducedMotion()` helper + usage doc. |
| `src/features/learning-experience/index.ts` | Export `prefersReducedMotion`. |
| `src/features/course-map/CompactCourseMap.tsx` | Removed 4-column floor; updated stale comments. |
| `src/features/course-map/CourseHole.tsx` | Final-hole 🏆 + "Capstone" tag. |
| `src/index.css` | `.coursemap-node-final` / `.coursemap-node-capstone-tag` capstone styles; comment 5×4→5×3. |

No forbidden files touched (no `src/core`, `src/data`, `src/types`, `src/lib`,
`ProblemPage.tsx`, `src/components/problems/**`, `src/components/visuals/**`,
`package.json`, `firestore.rules`). No dependencies added. No commits.

---

## 3. Exported components/props the problem components (Agents 3/4/5) consume

From `src/features/learning-experience` (barrel `index.ts`):

| Export | Purpose / key props |
| --- | --- |
| `ResponsiveProblemShell` | Two-region layout. `{ banner?, taskPanel?, coachPanel?, hintPanel?, children }`. |
| `LearningCoachPanel` | Feedback panel. `{ feedback: CoachFeedback \| null, onContinue?, continueLabel?, onRequestHint?, hintsRemaining?, idleMessage?, scrollIntoViewOnFeedback? = true }`. |
| `CurrentTaskPanel` | Current task + checklist near top of right region/sticky strip. |
| `ProblemStepChecklist` + `resolveStepStatuses`/`countDoneSteps` | Step checklist incl. `needs-correction`. |
| `ProblemIntroDemo` | `{ steps: DemoStepConfig[], finalCallToAction?, title?, stepIndex?, onStepChange?, onSkip, onStart }`. Demo never mutates progress. |
| `ReviewModeBanner` | `{ onRestart?, onShowDemo?, children? }`. |
| `RestartProblemAction` / `ShowDemoAgainAction` | Explicit restart / replay-demo buttons. |
| `InlineFieldStatus` + `toInlineStatus` | Per-field correct/needs-correction indicator. |
| `TeachingExplanationSection` | Teaching block (review + correct coach body). |
| `useDemoVisibility` | Local (non-authoritative) demo-seen/show-again state. |
| `checkResultToCoachFeedback`, `coachToneForResult`, `humanizeMistakeType` | `CheckResult` → coach display model (incl. `CoachFeedbackOptions.structured` for 3-part copy). |
| `prefersReducedMotion`, `usePrefersReducedMotion`, `getPrefersReducedMotion`, `animationClass`, `ANIM` | **Reduced-motion primitives** — build deterministic outcome first, branch only on presentation. |
| `configKeyFor`, `isCanonicalSlug`, `canonicalSlugIndex`, `legacyIdForSlug`, `slugForLegacyId`, `CANONICAL_PROBLEM_SLUGS`, `SLUG_TO_LEGACY_ID` | Stable UI config keying (slug↔storageId). |

Recommended consumption: render problem bodies through **`ProblemLayout`**
(`src/components/lesson/ProblemLayout.tsx`), passing `taskGuide`, `feedback`
(`CheckResult`), `completed`, hints, `demoSteps`/`demoFinalCta`, `conceptSummary`,
and restart/review callbacks. `ProblemLayout` wires the shell, coach (with
auto-scroll), demo gating, hints, and review/restart automatically. **Do not fork
the shell.**

From `src/features/course-map` (barrel `index.ts`):
`buildCourseMapView`, `flattenHoles`, `CompactCourseMap`, `CurrentChapterCard`,
`ExpandedCoursePathway`, `LessonZone`, `CourseHole` + view-model types.

---

## 4. What Agent 1 must integrate

1. **Nothing required for the map/shell to scale** — they read `CHAPTER_PROBLEMS`,
   `CHAPTER_LESSONS`, `getLessonProgressViews`, `MILESTONE_DEFINITIONS`,
   `TOTAL_LESSONS`/`TOTAL_PROBLEMS`. Keep those at 15/5×3 (already done) and the
   final hole (`order === lastOrder` = `ev-l5-p3`) gets capstone emphasis automatically.
2. **`configKeyFor` keying changed** (`problem-1` now keys to `ev-l1-p1` instead of
   the old `l1-long-run-average`). This only affects the **localStorage demo-seen
   key namespace** (non-authoritative); first-visit demos may show once more after
   deploy. No persistence/migration impact.
3. **Optional**: if you promote demo-seen to `problemProgress.demoSeen`, keep the
   `useDemoVisibility` public shape; UI needs no change.
4. The legacy `CoursePathway.tsx` / `ChapterProgressCard.tsx` remain on Agent-2's
   allowed list and are 15-safe (data-driven off `CHAPTER_PROBLEMS`), but are not
   currently mounted (Home uses `CurrentChapterCard`; Chapter uses
   `ExpandedCoursePathway`). Safe to leave or remove later.

---

## 5. Tests / checks run

- `npx vitest run src/features/learning-experience src/features/course-map` →
  **6 files, 31 tests passing**.
- `npx oxlint src/features/learning-experience src/features/course-map src/components/lesson`
  → clean except 4 pre-existing `react(only-export-components)` fast-refresh
  warnings (not from this run).
- IDE/TS diagnostics on all edited files: **no errors**.
- Per instructions, full `tsc -b` was **not** run (shared tree has other agents'
  in-progress files).

---

## 6. Remaining risks

- **Auto-scroll behavior is untested in DOM** (`jsdom`/RTL not installed; logic is
  guarded for `scrollIntoView` absence). Verify on a real device that mobile
  feedback enters the viewport and desktop sticky rail does not jump.
- **3-part wrong-answer copy** depth depends on Agents 3/4/5 supplying structured
  feedback; otherwise the single string is shown (still placed correctly).
- **Touch-target ≥44px and tap-to-place** are enforced per-problem; the shell only
  guarantees layout/`.touch-target` utility — audit each problem (Agent 6).
- **Mobile coach ordering** is task → coach → work; the auto-scroll covers the
  "feedback below the checked input" intent, but if a future problem wants feedback
  literally inline beneath a specific field it can additionally render an
  `InlineFieldStatus` at that field.
