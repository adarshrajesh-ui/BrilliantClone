You are Agent 2 (Learning UX shell + home/golf pathway) for parallel-build-prd run 2026-06-24-ev-lab-15.

READ FIRST (binding, in order):
1. `prd.md` — SOURCE OF TRUTH (do not edit it).
2. `docs/orchestrate/2026-06-24-ev-lab-15/plan.md`
3. `docs/orchestrate/2026-06-24-ev-lab-15/interfaces.md`
4. `docs/parallel/agent-1-core-handoff.md` (the 15-problem model is live)

## YOUR JOB
Make the learning shell and home/course-map fully satisfy the PRD for the 15-problem (5×3) chapter. The core 20→15 migration is DONE; the data-driven course map already adapts, but verify/repair PRD UX requirements and fix any hard-coded 20/4-hole assumptions or count strings in YOUR files.

PRD focus areas:
- No-scroll-chasing two-region workspace (≥768px: ~55% visual / ~45% task+controls+feedback+Continue), all visible at 1280×720. (`src/components/lesson/ProblemLayout.tsx`)
- Learning Coach feedback panel placement: desktop right region directly beneath the active input/check (NOT distant upper-right); mobile immediately beneath the checked input, auto-scroll into viewport. Wrong feedback = what happened / why wrong / what next (3–5 sentences). Correct = 1–2 sentences + Continue in same workspace.
- Current-task panel + step checklist (right region desktop / sticky strip mobile).
- Pre-problem mini-demo system (Back/Next/Skip/Start) + "Show demo again"; demo never submits an attempt or mutates completion.
- Review Mode banner + explicit "Restart This Problem" action (review is default for completed; restart is opt-in practice).
- Reduced-motion support primitive in `src/features/learning-experience/animations.ts` (a `prefersReducedMotion()` helper + usage pattern problem agents can import). Reduced path must be deterministic.
- Mobile: sticky current-task/action area; feedback auto-enters viewport; no horizontal scroll; touch targets ≥44px.
- Golf-course pathway: 5 lesson zones × 3 problem holes = 15 total; glowing current marker; completed/current/future states; final hole (ev-l5-p3) gets capstone visual emphasis. Home current-chapter card. (`src/features/course-map/**`)
- Update any "20"/"4 holes"/"twenty" copy in YOUR files to 15/3.

## ALLOWED PATHS (edit only these)
- `src/features/learning-experience/**` (all)
- `src/components/lesson/**` (ProblemLayout, FeedbackPanel, HintPanel, TaskGuide, problemDemos)
- `src/features/course-map/**` (all)
- `src/pages/HomePage.tsx`
- `src/components/CoursePathway.tsx`, `src/components/ChapterProgressCard.tsx`, `src/components/SuggestedReview.tsx`
- New CSS co-located with your components, or scoped sections you create. You MAY edit `src/index.css` ONLY for shell/course-map classes — but prefer co-located styles; if you must touch `src/index.css`, keep edits minimal and clearly grouped.

## FORBIDDEN (do NOT touch — other agents/Agent 1 own these)
- `src/core/**`, `src/data/**` (chapter.ts, problems/**, implementedProblems.ts), `src/types/**`
- `src/pages/ProblemPage.tsx`, `src/components/problems/**`, `src/components/visuals/**`
- `src/lib/**`, `firestore.rules`, `package.json`
- Any problem-specific content/checkers (Agents 3/4/5).

## RULES
- Consume Agent 1 selectors/persistence via props/typed selectors; never duplicate progression logic in UI.
- Preserve working auth/routing/progress/review/restart behavior. No AI anything.
- Preserve mobile tap alternatives & no-scroll-chasing.
- Do NOT run full `tsc -b` (other agents may have half-written files in the shared tree). Run scoped checks: `npx vitest run src/features/learning-experience src/features/course-map` and `npx oxlint src/features/learning-experience src/features/course-map src/components/lesson`.
- Do NOT commit.

## CHECKPOINTS (auto-proceed; no pausing)
- CP0: audit your files vs PRD (no edits) — list what exists/missing/wrong.
- CP1: shell (layout/coach/demo/checklist/review/restart/reduced-motion) repairs + tests.
- CP2: course-map 15 holes + home card + count strings + tests.
- Handoff: write `docs/parallel/agent-2-learning-ui-handoff.md` answering: which PRD reqs satisfied / still missing / partial; what changed; files touched; what needs Agent 1 integration; tests/checks run; risks. Also list exported component names/props problem agents consume.

After each pass, compare against PRD and record the diff in the handoff.
