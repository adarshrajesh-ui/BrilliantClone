# PRD Sync Report — 2026-06-24-no-scroll-problem-workspace

## Run metadata
- **Mode:** sync-only (PRD/spec edit only; no application code changed)
- **Authority:** User prompt `/prompt-first-build sync-only`
- **Scope:** Only problem-page UI/layout sections of `prd.md`
- **Baseline:** `docs/prompt-first/2026-06-24-no-scroll-problem-workspace/prd-before.md`
- **Output:** `prd.md` (1882 lines)

## Goal
All problem pages must use a no-scroll, Brilliant-like problem workspace. During a problem,
scrolling is not part of the learner experience; the full active problem state fits one
focused workspace, with explicit Next/Previous controls for moving through compact panels.

## Confirmations (required)

| Requirement | Status |
|-------------|--------|
| Binding no-scroll rule: full active problem state in one workspace | ✅ Page 2 binding rule + No-scroll workspace contract |
| Seven required elements together (visual, prompt, input, feedback, hint, Next/Previous, completion) | ✅ No-scroll workspace contract |
| "Scroll down to answer, scroll back up to see visual" impossible by design | ✅ Binding rule + acceptance criterion 3 |
| Explicit Next and Previous controls; progress via panels not scroll | ✅ Step segmentation subsection + desktop/mobile blocks |
| Oversized content split into Next/Previous steps, not page scroll | ✅ Contract + acceptance criterion 4 + mobile block |
| Brilliant studied as UX inspiration only (public sources; colors differ) | ✅ Brilliant interaction study subsection w/ references |
| Acceptance criteria added (desktop + mobile fit; feedback in same panel; split steps) | ✅ Problem-page no-scroll acceptance criteria + Page 11 checks |
| Curriculum / problem math / validation rules unchanged | ✅ Confirmed (no spec/number edits) |
| Firebase / routing / data schema unchanged (except presentation-only hints) | ✅ Confirmed |
| No application code changed | ✅ Confirmed (only `prd.md` + run docs edited) |

## Research (UX inspiration only — no assets/screens/colors copied)
Reviewed public design case studies, product breakdowns, and the live product flow:
- Paige Ormiston — "Brilliant" Solvables flow case study (paigeormiston.com/brilliant)
- ustwo — "Brilliant.org x ustwo" (ustwo.com/work/brilliant)
- ScreensDesign — Brilliant UI breakdown (screensdesign.com/showcase/brilliant-learn-by-doing)
- American Digital Education — interface/interaction analysis
- NN/g — "Beware Horizontal Scrolling" (nngroup.com/articles/horizontal-scrolling)

Patterns adopted as inspiration: self-contained "Solvable" units; one cognitive task per
screen; heading → prompt → interaction → primary action hierarchy; feedback banner near the
attempt that encourages retry; consistent bottom action area for answer/continue;
single-column, full-width options; structural responsive adaptation; clear progress path.

## Sections changed (UI/layout only)
- **Page 1 — change summary:** added "no-scroll Brilliant-like problem workspace" entry.
- **Page 1 — in scope:** added single no-scroll workspace bullet; added explicit Next/Previous panels bullet; clarified "no page scrolling during a problem".
- **Page 2 — Binding rule:** rewritten to no-scroll workspace rule ("impossible by design").
- **Page 2 — New: No-scroll workspace contract** (seven required elements together).
- **Page 2 — New: Step segmentation and Next/Previous navigation** (panels instead of scroll).
- **Page 2 — Desktop/tablet layout:** added no-page-scroll requirement, hint-in-workspace, Next/Previous placement, same-panel feedback, split-to-steps fallback.
- **Page 2 — Mobile layout:** added single-workspace fit, hint disclosure, bottom action bar with Next/Previous, step panels, split-to-steps fallback.
- **Page 2 — New: Brilliant problem/lesson interaction study** (public-source UX inspiration + references; colors/assets differ).
- **Page 2 — Reusable principles + Explicit note:** strengthened for no-scroll/Next-Previous; colors may differ.
- **Page 2 — New: Problem-page no-scroll acceptance criteria** (6 criteria + verification viewports).
- **Page 8 — Current-task panel; New Step navigation note; Learning Coach feedback placement; interaction rules:** same-panel feedback, Next/Previous, no-scroll.
- **Page 10 — Schema appendix:** added presentation-only `stepPanels` and `stepNavigation` hints, explicitly non-affecting validation/progress/curriculum/math.
- **Page 11 — Build order, manual testing, validation matrix:** added no-scroll workspace acceptance checks at desktop + mobile sizes.

## Acceptance criteria added (verbatim intent)
1. Each active problem step fits one workspace without page scrolling at desktop and mobile.
2. Feedback appears in the same panel as the attempted action.
3. Scroll-down-to-answer/scroll-up-to-see-visual is impossible by design.
4. Oversized content is split into Next/Previous step panels, never page scroll.
5. Explicit Next/Previous present; Previous preserves completed work; nav is presentation-only.
6. No horizontal scrolling; touch targets ≥44px; tap alternatives for drag.

## Unchanged (no conflict)
- Curriculum, lesson/problem sequence, problem math, EV values, answer formats.
- Validation/normalization rules, mistake classifications, completion guards.
- Firebase auth, Firestore schema document shapes, security rules, routing.
- Mastery (11/15), progress percentages, golf-course 15-hole pathway.

## Scope guard
Only `prd.md` and this run's `docs/prompt-first/2026-06-24-no-scroll-problem-workspace/`
files were created/edited. Data-schema appendix additions are presentation-only layout hints
and explicitly do not affect validation, progress, curriculum, or problem math. Other
modified `src/` files in the working tree pre-date this run and were not touched here.

## Artifacts
- `prompt.md` — frozen prompt snapshot
- `prd-before.md` — baseline snapshot
- `prd-diff.md` — unified diff of this run's edits (vs `prd-before.md`)
- `prd-sync-report.md` — this file
