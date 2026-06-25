--- docs/prompt-first/2026-06-24-no-scroll-problem-workspace/prd-before.md	2026-06-24 14:32:43
+++ prd.md	2026-06-24 14:35:35
@@ -4,6 +4,9 @@
 
 This PRD edit is planning/spec only. No application code was changed.
 
+PRD change summary (2026-06-24 — no-scroll Brilliant-like problem workspace)
+Updated only the problem-page UI/layout sections to require a single, no-scroll, Brilliant-like problem workspace. During a problem, scrolling is no longer part of the learner experience: the full active problem state — visual, prompt/current task, input/interaction, feedback, hint, Next/Previous controls, and completion state — must fit one focused workspace at desktop and mobile sizes. "Scroll down to answer, scroll back up to see the visual" is now impossible by design. Added explicit Next/Previous step navigation so oversized content is split into compact step panels instead of a long scrolling page, a Brilliant interaction-pattern study (public sources, UX inspiration only — colors/assets differ), and explicit no-scroll acceptance criteria and validation checks. Presentation-only layout hints (stepPanels, stepNavigation) were noted in the schema appendix. Curriculum, problem math, validation rules, Firebase, routing, and data schema are unchanged except wording needed to support the no-scroll rule.
+
 PRD change summary (2026-06-24 — fun tactile P1 pass; L5P2 dedup)
 Every lesson’s Problem 1 is now specified as a fun, animated, tactile concept-introduction mini-game rather than a worksheet-style exercise. Each P1 includes a dedicated “Fun animation and interaction” section with exact motion specs, reduced-motion alternatives, and explicit teaching purpose. Lesson 1 Problem 1 is revised from chip-bag draws to **Dice Toss Average** (drag-and-throw dice). Lesson 5 Problem 1 is revised from a dense full-model table to a playful **Carnival Booth Preview** side-by-side comparison so it does not duplicate the L5P3 capstone. **Lesson 5 Problem 2** is revised from a duplicate of L5P1 ($5 vs $10/$0) to **Wider Spread, Same Average** ($6 guaranteed vs 50/50 $12/$0) requiring EV calculation as guided transfer. Legacy storage IDs (problem-1 … problem-8) are unchanged; only interaction and animation specs evolve.
 
@@ -56,8 +59,10 @@
 fairness number lines
 running-average graphs
 risk comparison graphs
-Compact two-region problem workspaces (visual + controls/feedback) on desktop and tablet.
+A single, no-scroll, Brilliant-like problem workspace: the full active problem state (visual, prompt/current task, input/interaction, feedback, hint, Next/Previous controls, completion state) fits in one focused panel at desktop and mobile sizes.
+Compact two-region problem workspaces (visual + controls/feedback) on desktop and tablet, with no page scrolling during a problem.
 Mobile layouts that avoid scroll-chasing between visual, input, and feedback.
+Explicit Next and Previous controls that move the learner through compact problem-step panels instead of relying on long vertical scrolling.
 A short, visual mini-demo before each problem or before a newly introduced interaction type.
 A reusable "Show demo again" option.
 A clear current-task panel and step checklist on each problem.
@@ -105,8 +110,27 @@
 Expected Value Lab - MVP PRD Page 2
 Problem-Page UX Requirements
 
-Binding rule: the learner must never repeatedly scroll down to interact and scroll back up to inspect the visual, task, feedback, or result. All information and controls for the current step remain spatially connected.
+Binding rule (no-scroll workspace): during a problem, scrolling is not part of the learner experience. The full active problem state must fit inside one focused workspace — like Brilliant — so the learner never scrolls down to interact and scrolls back up to inspect the visual. "Scroll down to answer, scroll back up to see the visual" must be impossible by design. All information and controls for the current step remain spatially connected inside a single, non-scrolling workspace.
 
+No-scroll workspace contract (every problem)
+Every problem page is one focused, self-contained workspace. The following seven elements of the active problem step must always be present and visible together, without page scrolling, at desktop and mobile sizes:
+1. Visual — the teaching visual, simulation, concrete objects, graph, or scenario state.
+2. Prompt / current task — what the learner is being asked to do right now.
+3. Input / interaction — the controls, answer fields, drag/tap targets for this step.
+4. Feedback — appears in the same panel as the attempted action (beside or directly beneath the input that was checked).
+5. Hint — reachable from within the workspace (e.g., inline disclosure), never on a separate scrolled-away region.
+6. Next / Previous controls — explicit step navigation within the workspace.
+7. Completion state — result/celebration and the path forward, rendered in the same workspace.
+Problem pages must not rely on long vertical pages. If the active step's content cannot fit one workspace, it is split into smaller Next/Previous step panels — never resolved by adding page scroll.
+
+Step segmentation and Next/Previous navigation (every problem)
+When a problem's content exceeds one no-scroll workspace, divide it into a short ordered sequence of compact step panels and let the learner move between them with explicit Next and Previous controls — like turning Brilliant panels rather than scrolling a page.
+- Each step panel is itself a complete no-scroll workspace satisfying the seven-element contract above (a step that has no new visual reuses a persistent compact visual summary).
+- Next advances to the following step; Previous returns to the prior step. Controls live in a consistent location inside the workspace (bottom action bar on mobile; right region / bottom of workspace on desktop) so their position does not shift problem to problem.
+- Next is gated by the step's completion rule where one exists (e.g., a required action or correct check); Previous is always available and never discards already-entered work for completed steps. Step navigation is presentation only — it does not change validation, curriculum, or problem math.
+- A lightweight step indicator (e.g., "Step 2 of 3") shows position and what comes next without implying page length.
+- The final step's completion state surfaces the existing Continue control to leave the problem; in-problem Next/Previous move between steps, Continue moves to the next problem.
+
 Problem 1 design rule (all lessons)
 Problem 1 of each lesson is the **fun concept-introduction problem**: a tactile, animated mini-game or playful discovery activity — never a worksheet-first or formula-first exercise. Playful motion must teach the concept (see each problem’s “Fun animation and interaction” section). Animations obey the same no-scroll-chasing layout rules below.
 
@@ -121,17 +145,20 @@
 Desktop and tablet layout (≥768px width, landscape tablet included)
 When a problem has both a significant visual and significant interaction, use a compact two-region workspace:
 Left region (~~55%): teaching visual, simulation, concrete objects, graph, or scenario state.
-Right region (~~45%): current task, checklist, interactive controls, answer fields, check action, hints, feedback, Continue.
+Right region (~~45%): current task, checklist, interactive controls, answer fields, check action, hints, feedback, Next/Previous step controls, Continue.
 Regions may be reversed when interaction order benefits (e.g., left-to-right reading of a formula built on the right).
 Requirements:
+Whole active workspace fits the viewport with no page scrolling; the visual is never scrolled out of view to reach the input.
 Visual and control regions visible together in the initial viewport.
 Primary controls beside the visual they affect.
-Feedback beside or directly beneath the active control — not at the bottom of a long page.
+Feedback beside or directly beneath the active control, in the same panel as the attempted action — not at the bottom of a long page.
 Submit/check visible without return scroll.
 Current-task instruction visible while acting.
 Corrected answers editable in place.
 Results and Continue within the same workspace.
-Secondary information collapsible; must not push the active task out of the working area.
+Hint reachable inside the workspace (inline disclosure beside the controls), not on a scrolled-away region.
+Next/Previous step controls in a consistent location (bottom of the right region) when the problem is segmented into steps.
+Secondary information collapsible; must not push the active task out of the working area. If it cannot fit, move it to a separate Next/Previous step panel rather than adding scroll.
 
 Viewport standard
 Target desktop working viewport: 1280×720 CSS pixels (minimum supported active workspace: 1024×640).
@@ -139,12 +166,15 @@
 Do not shrink below accessible sizes to avoid scrolling.
 
 Mobile layout (<768px)
-Side-by-side not required. Same no-scroll-chasing principle:
+Side-by-side not required. Same no-scroll, single-workspace principle — the active step fits the screen without page scrolling:
 Compact visual immediately above active controls, OR shortened persistent visual summary while interacting.
 Sticky current-task/action area during input.
-Feedback inserted beside or immediately beneath affected input.
+Feedback inserted beside or immediately beneath affected input, in the same panel as the attempted action.
+Hint available via inline disclosure within the workspace, not a separate scrolled section.
+Bottom action bar holds the primary action plus Next/Previous step controls (and Continue on completion) so the learner advances with minimal thumb movement and never scrolls to reach navigation.
 Collapsible nonessential explanation.
-Segmented steps may each contain visual + input + feedback.
+Segmented steps: each step is a complete no-scroll panel containing visual (or persistent summary) + prompt + input + feedback; learner uses Next/Previous to move between steps instead of scrolling one tall page.
+When a step's content would overflow the screen, split it into additional Next/Previous step panels rather than allowing vertical page scroll.
 No horizontal scrolling. Touch targets ≥44px. Tap alternatives for all drag placements.
 Feedback auto-enters viewport; learner never returns to page top to read result.
 
@@ -155,17 +185,38 @@
 Numworks fair-games activities — concrete carnival scenarios before notation.
 OpenStax / Berkeley SticiGui — manipulation and long-run language before formulas.
 
-Reusable principles incorporated:
-One focused task at a time.
-Manipulation before notation.
-Immediate local feedback and in-place correction.
+Brilliant problem/lesson interaction study (public sources — UX inspiration only, colors and assets differ)
+Reviewed from public design case studies, product breakdowns, and the live product flow (not by copying screens or assets). Observed patterns adopted as inspiration for the no-scroll workspace:
+- Solvable = one self-contained, interactive question presented as a single focused unit; the learner solves it in place rather than reading a long page.
+- One primary cognitive task per screen; consistent visual hierarchy of heading → prompt → interaction → primary action, so the eye does not hunt.
+- Feedback consolidated into a banner near the attempt (bottom/adjacent), appearing after a submission — it encourages retry and reveals an explanation/answer in place rather than punishing or jumping elsewhere.
+- A consistent bottom action area for "answer" and "continue", with CTA position stable problem-to-problem to minimize thumb movement on mobile.
+- Single-column, full-width answer options on small screens; layout structure adapts across breakpoints (not just scaled), sidebars collapse, content stacks — no horizontal scrolling.
+- Clear lesson pathway/progress that shows where the learner is and what comes next.
+References: Paige Ormiston — "Brilliant" Solvables flow case study (paigeormiston.com/brilliant); ustwo — "Brilliant.org x ustwo" (ustwo.com/work/brilliant); ScreensDesign — Brilliant UI breakdown (screensdesign.com/showcase/brilliant-learn-by-doing); NN/g — "Beware Horizontal Scrolling" (nngroup.com/articles/horizontal-scrolling).
+
+Reusable principles incorporated:
+One focused task at a time, in one no-scroll workspace.
+Manipulation before notation.
+Immediate local feedback and in-place correction, in the same panel as the attempted action.
 Visual cause-and-effect beside controls.
-Progressive disclosure via checklist steps.
-Compact problem layouts fitting one working viewport.
+Progressive disclosure via checklist steps and Next/Previous step panels instead of page scroll.
+Compact problem layouts fitting one working viewport at desktop and mobile sizes.
+Stable, consistently placed action and Next/Previous controls problem-to-problem.
 Fast correction loops without page reset.
 Clear next action after every check.
 
-Explicit: proprietary Brilliant screens, artwork, lesson text, and branded layouts are not copied. Only general interaction patterns inform this PRD.
+Explicit: proprietary Brilliant screens, artwork, lesson text, branded layouts, and colors are not copied. Brilliant is used only as UX inspiration for general interaction patterns; this product's visual design and colors may differ.
+
+Problem-page no-scroll acceptance criteria
+These criteria apply to every problem page and every problem step. They constrain UI/layout only; curriculum, problem math, validation rules, Firebase, routing, and data schema are unchanged.
+1. At both desktop and mobile sizes, each active problem step fits in one workspace without page scrolling. The teaching visual, prompt/current task, input/interaction, feedback, hint access, Next/Previous controls, and completion state are all reachable without scrolling the page.
+2. Feedback appears in the same panel as the attempted action (beside or directly beneath the checked input), never on a separate scrolled region or at the bottom of a long page.
+3. No layout requires the learner to scroll down to answer and scroll back up to see the visual. This must be impossible by design, not merely discouraged.
+4. If a step's content is too large to fit one workspace, it is split into additional Next/Previous step panels; page scroll is never an acceptable resolution.
+5. Explicit Next and Previous controls are present (in a consistent location) for moving between problem-step panels; Previous never discards already-entered work for completed steps and step navigation does not alter validation, curriculum, or math.
+6. No horizontal scrolling at any supported size; touch targets ≥44px; tap alternatives exist for all drag interactions.
+Reference verification viewports: desktop 1280×720 (min 1024×640) and a representative mobile size (≤390px wide); the active step must show feedback and Next/Previous without scrolling after a check at these sizes.
 
 Curriculum research summary
 Sources reviewed:
@@ -1723,11 +1774,14 @@
 Unchanged in spirit: first visit shows demo; Show demo again available; demo does not count as attempt.
 
 Current-task panel and step checklist
-Rendered in the right region (desktop) or sticky strip (mobile) — never separated from active inputs by the visual.
+Rendered in the right region (desktop) or sticky strip (mobile) — never separated from active inputs by the visual, and always visible in the no-scroll workspace for the current step.
+
+Step navigation (Next/Previous)
+Multi-step problems present compact step panels with explicit Next and Previous controls in a consistent location (bottom of the right region on desktop; bottom action bar on mobile). Next advances (gated by the step's completion rule where one exists); Previous returns without discarding completed-step work. Step navigation is presentation only and does not change validation, curriculum, or problem math; Continue (below) still moves to the next problem.
 
 Learning Coach feedback panel — revised placement
-Desktop/tablet: right region directly beneath the active input/check — not upper-right distant from controls.
-Mobile: immediately beneath the input that was checked; auto-scroll into viewport.
+Desktop/tablet: right region directly beneath the active input/check, in the same panel as the attempted action — not upper-right distant from controls.
+Mobile: immediately beneath the input that was checked, in the same panel; auto-scroll into viewport (no return to page top).
 Wrong feedback: what happened / why wrong / next action (3–5 sentences).
 Correct feedback: 1–2 sentences + Continue in same workspace.
 
@@ -1735,7 +1789,7 @@
 Unchanged: money, probability, classification rules as prior PRD.
 
 Direct correction, attempt rules, hints, animations, accessibility
-Unchanged except all interactions must satisfy tap-to-place and compact workspace rules above.
+Unchanged except all interactions must satisfy tap-to-place and the single no-scroll workspace rules above (visual, prompt, input, feedback, hint, Next/Previous, completion together; oversized content split into Next/Previous step panels rather than page scroll).
 
 MVP only: five lessons, 15 problems. No AI in MVP.
 
@@ -1768,11 +1822,13 @@
 
 Tech stack — unchanged.
 
-Data schema — unchanged document shapes; globalProblemIndex now 0..14; PROBLEMS_PER_LESSON = 3.
+Data schema — unchanged document shapes; globalProblemIndex now 0..14; PROBLEMS_PER_LESSON = 3. The fields below are presentation-only layout hints; they do not affect validation, progress, curriculum, problem math, or stored learner progress.
 
 Problem JSON object — add fields where needed:
 desktopWorkspaceLayout
 mobileWorkspaceLayout
+stepPanels (presentation-only: ordered compact no-scroll step panels for a problem; each panel lists which of visual/prompt/input/feedback/hint it shows)
+stepNavigation (presentation-only: enables Next/Previous between stepPanels; does not alter validation or completion logic)
 legacyProblemId
 canonicalSlug (ev-l1-p1 … ev-l5-p3)
 
@@ -1803,7 +1859,7 @@
 
 1. Preserve stable app (auth, progress, original eight problems).
 2. Completed-problem review and restart.
-3. Learning Coach + compact two-region ProblemLayout (UX binding — no scroll-chasing).
+3. Learning Coach + single no-scroll ProblemLayout: compact two-region workspace with visual, prompt, input, feedback, hint, Next/Previous step controls, and completion state together (UX binding — no scrolling during a problem; oversized content split into Next/Previous step panels).
 4. Migrate chapter model to 5×3 = 15 problems with legacy mapping.
 5. Implement/revise 15 problems per specs (batch by lesson).
 6. Persistence migration: 20→15 resolver, mastery 11/15, golf map 15 holes.
@@ -1816,8 +1872,14 @@
 
 Manual MVP testing scenario — verify compact workspace on Lesson 1 Dice Toss Average (drag-throw, graph, feedback inline). Validate all five P1 fun interactions at 1280×720 and mobile sticky layout.
 
+No-scroll workspace acceptance checks (every problem, every step) — at desktop 1280×720 (min 1024×640) and a representative mobile size (≤390px wide):
+- Active step shows visual, prompt, input, feedback, hint access, Next/Previous controls, and completion state without page scrolling.
+- Feedback after a check appears in the same panel as the attempted action (no scroll up to see the visual, no scroll down to read the result).
+- Where a problem is segmented, Next/Previous move between step panels; Previous preserves completed-step work; navigation does not change validation, curriculum, or math.
+- No horizontal scrolling; touch targets ≥44px; tap alternatives work for all drag interactions.
+
 Appendix — Problem validation matrix (summary)
-For each ev-l{N}-p{M}: checker tests for accepted formats, mistake types, completion guards, workspace contains feedback without scroll at 1280×720.
+For each ev-l{N}-p{M}: checker tests for accepted formats, mistake types, completion guards, single no-scroll workspace contains visual + prompt + input + feedback + hint + Next/Previous + completion state without page scroll at 1280×720 and at a representative mobile size, with feedback in the same panel as the attempted action and any oversized content split into Next/Previous step panels.
 P1 additional validation: manual-throw gate (L1P1), board-before-formula gate (L2P1), all-boxes-open gate (L3P1), cost-before-profit gate (L4P1), both-preview gate (L5P1); reduced-motion paths produce identical deterministic outcomes.
 
 MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 15 problems. No AI in MVP.
\ No newline at end of file
