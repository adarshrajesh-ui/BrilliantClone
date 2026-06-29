Midpoint - MVP PRD Page 1
PRD
Midpoint: A learn-by-doing MVP for one introductory probability chapter

> **Historical scope:** This PRD describes a **15-problem** chapter (5 lessons × 3). The shipped app has **14 problems** (3+3+2+3+3). See the [README](./README.md) for the current build.

This PRD edit is planning/spec only. No application code was changed.

PRD change summary (2026-06-24 — no-scroll Brilliant-like problem workspace)
Updated only the problem-page UI/layout sections to require a single, no-scroll, Brilliant-like problem workspace. During a problem, scrolling is no longer part of the learner experience: the full active problem state — visual, prompt/current task, input/interaction, feedback, hint, Next/Previous controls, and completion state — must fit one focused workspace at desktop and mobile sizes. "Scroll down to answer, scroll back up to see the visual" is now impossible by design. Added explicit Next/Previous step navigation so oversized content is split into compact step panels instead of a long scrolling page, a Brilliant interaction-pattern study (public sources, UX inspiration only — colors/assets differ), and explicit no-scroll acceptance criteria and validation checks. Presentation-only layout hints (stepPanels, stepNavigation) were noted in the schema appendix. Curriculum, problem math, validation rules, Firebase, routing, and data schema are unchanged except wording needed to support the no-scroll rule.

PRD change summary (2026-06-24 — fun tactile P1 pass; L5P2 dedup)
Every lesson’s Problem 1 is now specified as a fun, animated, tactile concept-introduction mini-game rather than a worksheet-style exercise. Each P1 includes a dedicated “Fun animation and interaction” section with exact motion specs, reduced-motion alternatives, and explicit teaching purpose. Lesson 1 Problem 1 is revised from chip-bag draws to **Dice Toss Average** (drag-and-throw dice). Lesson 5 Problem 1 is revised from a dense full-model table to a playful **Carnival Booth Preview** side-by-side comparison so it does not duplicate the L5P3 capstone. **Lesson 5 Problem 2** is revised from a duplicate of L5P1 ($5 vs $10/$0) to **Wider Spread, Same Average** ($6 guaranteed vs 50/50 $12/$0) requiring EV calculation as guided transfer. Legacy storage IDs (problem-1 … problem-8) are unchanged; only interaction and animation specs evolve.

MVP
The MVP is a login-based web app that teaches one chapter:
Expected Value — The Average Outcome of Uncertainty
The chapter contains 5 lessons and 15 visual, interactive problems. The learner progresses from observing repeated simulations to independently building an expected value model, accounting for costs, judging fairness, and comparing games with the same expected value but different risk.
The app teaches without AI. All problems, onboarding demonstrations, hints, answer checks, mistake classifications, and feedback are hand-built and deterministic.

Chapter structure
Lesson 1 — Expected Value as a Long-Run Average
Lesson 2 — Expected Value as a Weighted Average
Lesson 3 — Counts, Tables, and Discrete Outcomes
Lesson 4 — Expected Payout, Expected Profit, and Fairness
Lesson 5 — Same EV, Different Risk, and Full EV Models
Each lesson contains 3 problems, for a total of 15 problems.

Lesson timing targets


| Lesson | P1      | P2      | P3      | Total    | Justification                                                                 |
| ------ | ------- | ------- | ------- | -------- | ----------------------------------------------------------------------------- |
| 1      | 2.5 min | 2.5 min | 2.5 min | ~7.5 min | Dice throw + one weighted sim + comparison choice; minimal reading            |
| 2      | 2.5 min | 2.5 min | 3 min   | ~8 min   | Formula placement + matching + diagnose; tight tables                         |
| 3      | 3 min   | 2.5 min | 3 min   | ~8.5 min | Reveal/table fill is slightly heavier; still within cap with collapsible help |
| 4      | 2.5 min | 2.5 min | 2.5 min | ~7.5 min | Balance-scale + bucket sort + two-card profit compare                         |
| 5      | 3 min   | 2.5 min | 3.5 min | ~9 min   | Booth preview intro + risk sim + capstone; P1 is playful not full table       |


Lesson 3 tension: building a full count→probability→contribution table in one problem approaches the eight-minute ceiling. Mitigation: pre-grouped tokens, inline row validation, and collapsible formula reference keep the assessment responsible without trivializing the skill.

Lesson 5 tension: the capstone combines probabilities, payout, cost, profit, fairness, and risk interpretation. Mitigation: sequential checklist with one active row at a time; risk is a single multiple-choice line, not an essay.

What is in scope for MVP vs what is NOT
In scope for MVP
Google sign-in, user profile creation, and saved progress per user.
One expected value chapter divided into 5 lessons.
15 interactive, visual problems.
Visual-first learning using:
chip bags and token draws
draggable dice with throw physics
spinners and wheels
mystery boxes
prize tokens
probability tables
formula builders
contribution chunks
balance scales
profit meters
fairness number lines
running-average graphs
risk comparison graphs
A single, no-scroll, Brilliant-like problem workspace: the full active problem state (visual, prompt/current task, input/interaction, feedback, hint, Next/Previous controls, completion state) fits in one focused panel at desktop and mobile sizes.
Compact two-region problem workspaces (visual + controls/feedback) on desktop and tablet, with no page scrolling during a problem.
Mobile layouts that avoid scroll-chasing between visual, input, and feedback.
Explicit Next and Previous controls that move the learner through compact problem-step panels instead of relying on long vertical scrolling.
A short, visual mini-demo before each problem or before a newly introduced interaction type.
A reusable "Show demo again" option.
A clear current-task panel and step checklist on each problem.
Instant deterministic answer checking with visible feedback under 100ms.
Flexible acceptance of mathematically equivalent correct formats.
Direct correction after a wrong answer without resetting unrelated work.
Learning-oriented feedback that explains what happened, why the reasoning was incorrect, and what to do next.
Feedback displayed beside the active control, never buried at the bottom of a long page.
Hand-written visual hints.
Teaching-focused animations.
Completed-problem review mode.
Explicit "Restart This Problem" practice mode.
Completion percentage, graded attempts, hints used, mistake type, mastery state, streak, and milestones.
Lesson-level and chapter-level progress.
A home-page current-chapter panel using an original golf-course progression metaphor.
A glowing marker for the current problem and increasingly motivating future holes.
Mobile-responsive design.
Every drag/drop-style interaction must also support tap-to-select and tap-to-place.
On mobile, tapping is the default interaction; drag/drop is optional polish.
A deployed public web app using React and Firebase.

Explicitly NOT in scope for MVP
No AI tutor, hints, feedback, or generated problems.
No model calls or semantic model matching.
No additional complete chapters or full probability course.
No videos or long readings.
No payments, leaderboards, teacher dashboards, classroom tools, or social features.
No mobile app-store release.
No advanced probability theory.
No dependency on drag/drop for correctness.
No copied Topgolf logos, branding, artwork, or proprietary assets.
No requirement for Figma at runtime.

User persona
Primary learner: introductory probability student who has seen EV formulas but lacks intuition for outcomes, probabilities, counts, contributions, payout, cost, profit, fairness, and risk.
Secondary learner: visual math learner who needs manipulation before notation.

Domain
Introductory probability — expected value as long-run average, weighted average, decision tool, and incomplete risk descriptor.

Focus stories include sign-in/resume, chapter progress, mini-demos, visual interaction, immediate local feedback, direct correction, hints, completion, review, restart without losing forward progress, and completing 5 lessons and 15 problems.

MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 15 problems. No AI in MVP.

Midpoint - MVP PRD Page 2
Problem-Page UX Requirements

Binding rule (no-scroll workspace): during a problem, scrolling is not part of the learner experience. The full active problem state must fit inside one focused workspace — like Brilliant — so the learner never scrolls down to interact and scrolls back up to inspect the visual. "Scroll down to answer, scroll back up to see the visual" must be impossible by design. All information and controls for the current step remain spatially connected inside a single, non-scrolling workspace.

No-scroll workspace contract (every problem)
Every problem page is one focused, self-contained workspace. The following seven elements of the active problem step must always be present and visible together, without page scrolling, at desktop and mobile sizes:
1. Visual — the teaching visual, simulation, concrete objects, graph, or scenario state.
2. Prompt / current task — what the learner is being asked to do right now.
3. Input / interaction — the controls, answer fields, drag/tap targets for this step.
4. Feedback — appears in the same panel as the attempted action (beside or directly beneath the input that was checked).
5. Hint — reachable from within the workspace (e.g., inline disclosure), never on a separate scrolled-away region.
6. Next / Previous controls — explicit step navigation within the workspace.
7. Completion state — result/celebration and the path forward, rendered in the same workspace.
Problem pages must not rely on long vertical pages. If the active step's content cannot fit one workspace, it is split into smaller Next/Previous step panels — never resolved by adding page scroll.

Step segmentation and Next/Previous navigation (every problem)
When a problem's content exceeds one no-scroll workspace, divide it into a short ordered sequence of compact step panels and let the learner move between them with explicit Next and Previous controls — like turning Brilliant panels rather than scrolling a page.
- Each step panel is itself a complete no-scroll workspace satisfying the seven-element contract above (a step that has no new visual reuses a persistent compact visual summary).
- Next advances to the following step; Previous returns to the prior step. Controls live in a consistent location inside the workspace (bottom action bar on mobile; right region / bottom of workspace on desktop) so their position does not shift problem to problem.
- Next is gated by the step's completion rule where one exists (e.g., a required action or correct check); Previous is always available and never discards already-entered work for completed steps. Step navigation is presentation only — it does not change validation, curriculum, or problem math.
- A lightweight step indicator (e.g., "Step 2 of 3") shows position and what comes next without implying page length.
- The final step's completion state surfaces the existing Continue control to leave the problem; in-problem Next/Previous move between steps, Continue moves to the next problem.

Problem 1 design rule (all lessons)
Problem 1 of each lesson is the **fun concept-introduction problem**: a tactile, animated mini-game or playful discovery activity — never a worksheet-first or formula-first exercise. Playful motion must teach the concept (see each problem’s “Fun animation and interaction” section). Animations obey the same no-scroll-chasing layout rules below.

Interaction-coherence checklist (every problem)
What am I looking at?
What can I manipulate?
What should I do now?
What changed because of my action?
Was my reasoning correct?
What should I do next?

Desktop and tablet layout (≥768px width, landscape tablet included)
When a problem has both a significant visual and significant interaction, use a compact two-region workspace:
Left region (~~55%): teaching visual, simulation, concrete objects, graph, or scenario state.
Right region (~~45%): current task, checklist, interactive controls, answer fields, check action, hints, feedback, Next/Previous step controls, Continue.
Regions may be reversed when interaction order benefits (e.g., left-to-right reading of a formula built on the right).
Requirements:
Whole active workspace fits the viewport with no page scrolling; the visual is never scrolled out of view to reach the input.
Visual and control regions visible together in the initial viewport.
Primary controls beside the visual they affect.
Feedback beside or directly beneath the active control, in the same panel as the attempted action — not at the bottom of a long page.
Submit/check visible without return scroll.
Current-task instruction visible while acting.
Corrected answers editable in place.
Results and Continue within the same workspace.
Hint reachable inside the workspace (inline disclosure beside the controls), not on a scrolled-away region.
Next/Previous step controls in a consistent location (bottom of the right region) when the problem is segmented into steps.
Secondary information collapsible; must not push the active task out of the working area. If it cannot fit, move it to a separate Next/Previous step panel rather than adding scroll.

Viewport standard
Target desktop working viewport: 1280×720 CSS pixels (minimum supported active workspace: 1024×640).
Essential visible state: problem title, current instruction, required visual, active interaction, check/submit, feedback location, completion state.
Do not shrink below accessible sizes to avoid scrolling.

Mobile layout (<768px)
Side-by-side not required. Same no-scroll, single-workspace principle — the active step fits the screen without page scrolling:
Compact visual immediately above active controls, OR shortened persistent visual summary while interacting.
Sticky current-task/action area during input.
Feedback inserted beside or immediately beneath affected input, in the same panel as the attempted action.
Hint available via inline disclosure within the workspace, not a separate scrolled section.
Bottom action bar holds the primary action plus Next/Previous step controls (and Continue on completion) so the learner advances with minimal thumb movement and never scrolls to reach navigation.
Collapsible nonessential explanation.
Segmented steps: each step is a complete no-scroll panel containing visual (or persistent summary) + prompt + input + feedback; learner uses Next/Previous to move between steps instead of scrolling one tall page.
When a step's content would overflow the screen, split it into additional Next/Previous step panels rather than allowing vertical page scroll.
No horizontal scrolling. Touch targets ≥44px. Tap alternatives for all drag placements.
Feedback auto-enters viewport; learner never returns to page top to read result.

Educational-app UX benchmark
Products reviewed (public descriptions and design case studies only — no proprietary assets copied):
Brilliant.org — unified solvable flow, feedback banner near attempt, multi-try correction, bite-sized steps, progress path.
Khan Academy exercises — question + workspace proximity, immediate check, hint escalation.
Numworks fair-games activities — concrete carnival scenarios before notation.
OpenStax / Berkeley SticiGui — manipulation and long-run language before formulas.

Brilliant problem/lesson interaction study (public sources — UX inspiration only, colors and assets differ)
Reviewed from public design case studies, product breakdowns, and the live product flow (not by copying screens or assets). Observed patterns adopted as inspiration for the no-scroll workspace:
- Solvable = one self-contained, interactive question presented as a single focused unit; the learner solves it in place rather than reading a long page.
- One primary cognitive task per screen; consistent visual hierarchy of heading → prompt → interaction → primary action, so the eye does not hunt.
- Feedback consolidated into a banner near the attempt (bottom/adjacent), appearing after a submission — it encourages retry and reveals an explanation/answer in place rather than punishing or jumping elsewhere.
- A consistent bottom action area for "answer" and "continue", with CTA position stable problem-to-problem to minimize thumb movement on mobile.
- Single-column, full-width answer options on small screens; layout structure adapts across breakpoints (not just scaled), sidebars collapse, content stacks — no horizontal scrolling.
- Clear lesson pathway/progress that shows where the learner is and what comes next.
References: Paige Ormiston — "Brilliant" Solvables flow case study (paigeormiston.com/brilliant); ustwo — "Brilliant.org x ustwo" (ustwo.com/work/brilliant); ScreensDesign — Brilliant UI breakdown (screensdesign.com/showcase/brilliant-learn-by-doing); NN/g — "Beware Horizontal Scrolling" (nngroup.com/articles/horizontal-scrolling).

Reusable principles incorporated:
One focused task at a time, in one no-scroll workspace.
Manipulation before notation.
Immediate local feedback and in-place correction, in the same panel as the attempted action.
Visual cause-and-effect beside controls.
Progressive disclosure via checklist steps and Next/Previous step panels instead of page scroll.
Compact problem layouts fitting one working viewport at desktop and mobile sizes.
Stable, consistently placed action and Next/Previous controls problem-to-problem.
Fast correction loops without page reset.
Clear next action after every check.

Explicit: proprietary Brilliant screens, artwork, lesson text, branded layouts, and colors are not copied. Brilliant is used only as UX inspiration for general interaction patterns; this product's visual design and colors may differ.

Problem-page no-scroll acceptance criteria
These criteria apply to every problem page and every problem step. They constrain UI/layout only; curriculum, problem math, validation rules, Firebase, routing, and data schema are unchanged.
1. At both desktop and mobile sizes, each active problem step fits in one workspace without page scrolling. The teaching visual, prompt/current task, input/interaction, feedback, hint access, Next/Previous controls, and completion state are all reachable without scrolling the page.
2. Feedback appears in the same panel as the attempted action (beside or directly beneath the checked input), never on a separate scrolled region or at the bottom of a long page.
3. No layout requires the learner to scroll down to answer and scroll back up to see the visual. This must be impossible by design, not merely discouraged.
4. If a step's content is too large to fit one workspace, it is split into additional Next/Previous step panels; page scroll is never an acceptable resolution.
5. Explicit Next and Previous controls are present (in a consistent location) for moving between problem-step panels; Previous never discards already-entered work for completed steps and step navigation does not alter validation, curriculum, or math.
6. No horizontal scrolling at any supported size; touch targets ≥44px; tap alternatives exist for all drag interactions.
Reference verification viewports: desktop 1280×720 (min 1024×640) and a representative mobile size (≤390px wide); the active step must show feedback and Next/Previous without scrolling after a check at these sizes.

Curriculum research summary
Sources reviewed:
Math in Society (PCC) — carnival EV, weighted average, fair price (spot.pcc.edu/math/mathinsociety/chap_four_expected_value.html)
OpenStax Introductory Statistics 2e §4.2 — long-run average, EV table (openstax.org)
Berkeley SticiGui — box draws, long-run limiting average (stat.berkeley.edu/~stark/SticiGui/Text/expectation.htm)
SLCC / Open Oregon pressbooks — discrete distributions, EV formula
LibreTexts Finite Math §9.8 — weighted-average quiz-score analogy
Numworks Fair Games activity — net gain, fair cost (numworks.com/educators/activities/statistics/fair-games)

Alternative patterns considered:
Coin-flip streak games (rejected L1 — confuses streak with average).
Spinner-only intro for every lesson (rejected — overused; L1 uses dice throw).
Repair-table remediation as lesson assessment (rejected L3 — diagnostic not fluency).
Separate low-risk vs high-risk duplicate as standalone fourth problem (rejected — folded into L5P2 guided transfer).
Duplicate L5P1/L5P2 with same $5 vs 50/50 $10/$0 (rejected — L5P2 uses $6 vs $12/$0 with EV calculation).
Find-fair-price slider problem (rejected L4 — redundant with classify + compare).

Patterns selected:
Berkeley box/chip draws → L1P1 long-run average.
Unequal wheel sections → L1P2 weighted frequency.
Dual-game comparison → L1P3 fluency.
LibreTexts weighted average → L2P1 formula build.
OpenStax outcome–probability pairing → L2P2 matching.
Model completeness diagnosis → L2P3 fluency.
PCC count-based carnival → L3P1 mystery boxes.
Contribution summation table → L3P2 guided.
Full table from counts → L3P3 fluency.
Open Oregon payout−cost → L4P1 profit.
Numworks fair/unfair buckets → L4P2 classify.
Two-game profit compare → L4P3 fluency.
Carnival booth preview (qualitative same-EV feel) → L5P1 intro.
Guaranteed $6 vs 50/50 $12/$0 (compute EV + spread) → L5P2 guided transfer.
12-section capstone → L5P3 chapter capstone.

Cohesion decisions:
Each lesson follows Intro (visual/concrete) → Guided (scaffolded structure) → Fluency (transfer, less scaffolding).
Removed one problem per lesson that duplicated the fluency skill or was remedial rather than assessable.
Removed duplicate L5P1/L5P2 scenario (both used $5 vs 50/50 $10/$0); L5P2 now uses $6 vs $12/$0 with required EV calculation as guided transfer.

Remaining evidence gaps:
Risk is introduced qualitatively (spread/variability) without standard deviation calculation — appropriate for MVP scope.

Legacy ID and progress compatibility
The chapter shrinks from 20 to 15 problems. Storage IDs for the original eight implemented problems (problem-1 … problem-8) are preserved. Canonical slugs renamed to ev-l{N}-p{M} pattern; legacy slugs remain in legacyProblemId field.

Implemented behavior audit (pre-sync codebase):


| Legacy chapter # | Storage ID | Component / pack                  | Behavior summary                                                            |
| ---------------- | ---------- | --------------------------------- | --------------------------------------------------------------------------- |
| 1                | problem-1  | Problem1LongRunAverage            | Target: Dice Toss Average — drag-throw die, 1–3→$0 / 4–6→$10, predict EV $5 |
| 5                | problem-2  | pack-a l2-build-weighted-average  | Tap-to-place EV formula for 25%/75% spinner                                 |
| 9                | problem-3  | pack-a l3-mystery-box-outcomes    | Six mystery boxes, count/probability table                                  |
| 10               | problem-4  | pack-a l3-calculate-ev-from-table | Contribution rows → EV $4                                                   |
| 13               | problem-5  | Problem5PayoutVsProfit            | Playground balance scale then payout−cost profit $1                         |
| 14               | problem-6  | Problem6FairnessSort              | Sort games into fair/favorable/unfavorable buckets                          |
| 17               | problem-7  | Problem7WholeEVModel              | Target: Carnival Booth Preview (playful intro; not full capstone table)     |
| 18 | problem-8 | Problem8SameEVDifferentRisk | Target: Wider Spread Same Average — $6 guaranteed vs 50/50 $12/$0, compute EV + risk |


Removed problems — progress resolution (completion of legacy slug counts as completion of mapped successor):


| Removed slug                | Was lesson slot | Maps to  | Rationale                               |
| --------------------------- | --------------- | -------- | --------------------------------------- |
| l1-short-run-vs-long-run    | L1 P3           | ev-l1-p2 | Sampling noise taught via L1P2 sim copy |
| l2-fill-missing-formula     | L2 P3           | ev-l2-p3 | Formula fluency covered by diagnose     |
| l3-repair-probability-table | L3 P3           | ev-l3-p3 | Table repair subsumed by full build     |
| l4-find-fair-price          | L4 P3           | ev-l4-p3 | Fair price logic in compare + capstone  |
| l5-low-risk-vs-high-risk    | L5 P3           | ev-l5-p3 | Risk compare merged into capstone MC    |


Migration rules:
completedProblemIds retains historical storage IDs; resolver maps legacy slugs to new canonical slugs.
If a removed slug is present in completedProblemIds, treat mapped successor as complete for progression and percentage.
Content reuse ≠ ID reuse: problem-1 storage ID now maps to ev-l1-p1 (chip bag target spec); learner progress on problem-1 preserved.
highestSequentialCompletedGlobalIndex recomputed on 0..14 scale.
Chapter completion: completed unique canonical problems ÷ 15 × 100.
Lesson completion: completed in lesson ÷ 3 × 100.
Mastery threshold: 11 of 15 problems (≈75%) completed in ≤2 graded attempts, plus capstone and tag requirements unchanged in spirit.

Curriculum cohesion matrix


| ID       | Concept            | Prior knowledge   | New representation            | Math demand         | Scaffold | Misconceptions     | Predecessor link | Successor prep | Source            | Time | Distinct evidence |
| -------- | ------------------ | ----------------- | ----------------------------- | ------------------- | -------- | ------------------ | ---------------- | -------------- | ----------------- | ---- | ----------------- |
| ev-l1-p1 | Long-run average   | Basic probability | Drag-throw dice + running avg | Mean of die faces   | High     | Single throw = EV  | —                | Weighted wheel | OpenStax die EV   | 2.5m | Tactile sim       |
| ev-l1-p2 | Weighted long-run  | L1P1              | Unequal spinner               | Weighted mean       | Med      | Ignore probability | L1P1             | Compare games  | OpenStax          | 2.5m | 25/75 sim         |
| ev-l1-p3 | Compare EV         | L1P1-2            | Dual spinner cards            | Equality of EV      | Low      | Max payout / freq  | L1P2             | L2 formula     | PCC carnival      | 2.5m | Fluency           |
| ev-l2-p1 | Weighted average   | L1                | Formula builder               | Σ x p               | High     | Swap outcome/prob  | L1P3             | Matching       | LibreTexts        | 2.5m | Build model       |
| ev-l2-p2 | Outcome-prob pairs | L2P1              | Match columns                 | Three pairs         | Med      | Rank by size       | L2P1             | Diagnose       | OpenStax table    | 2.5m | Pairing           |
| ev-l2-p3 | Complete model     | L2P1-2            | Formula checklist             | Diagnose errors     | Low      | Omit zero term     | L2P2             | L3 counts      | SticiGui          | 3m   | Fluency           |
| ev-l3-p1 | Counts→prob        | L2                | 52-card deck                  | 16/52, EV 6.54      | High     | Count as prob      | L2P3             | Contributions  | PCC               | 3m   | Table rows        |
| ev-l3-p2 | Contributions      | L3P1              | Dealt-hand table              | Row products, 6.5   | Med      | Unweighted sum     | L3P1             | Full table     | OpenStax          | 2.5m | Sum EV            |
| ev-l3-p3 | Full table         | L3P1-2            | 10-card mini deck             | All columns, 6.4    | Low      | Wrong denom        | L3P2             | L4 cost        | Numworks          | 3m   | Fluency           |
| ev-l4-p1 | Payout vs profit   | L3                | Balance scale                 | Subtract cost       | High     | Answer payout      | L3P3             | Classify       | Open Oregon       | 2.5m | Profit $1         |
| ev-l4-p2 | Fairness class     | L4P1              | Three buckets                 | Sign of profit      | Med      | Payout size        | L4P1             | Compare        | Numworks          | 2.5m | Classify          |
| ev-l4-p3 | Compare profit     | L4P1-2            | Two game cards                | Max profit          | Low      | Max payout         | L4P2             | L5 model       | Math in Society   | 2.5m | Fluency           |
| ev-l5-p1 | EV vs experience   | L4                | Carnival booth preview        | Qualitative compare | High     | EV = feel          | L4P3             | Risk sim       | OpenStax spread   | 3m   | Playful intro     |
| ev-l5-p2 | Same EV, wider spread | L5P1 feel | $6 flat vs $12/$0 split | Compute EV + risk | Med | EV≠spread | L5P1 qualitative | Capstone | OpenStax spread | 2.5m | Transfer calc |
| ev-l5-p3 | Capstone           | All               | 12-section wheel              | Full decision       | Low      | Fair=no risk       | L5P2             | —              | Numworks+carnival | 3.5m | Chapter mastery   |


References

- Math in Society (Expected Value): [https://spot.pcc.edu/math/mathinsociety/chap_four_expected_value.html](https://spot.pcc.edu/math/mathinsociety/chap_four_expected_value.html)
- OpenStax Introductory Statistics 2e §4.2: [https://openstax.org/books/introductory-statistics-2e/pages/4-2-mean-or-expected-value-and-standard-deviation](https://openstax.org/books/introductory-statistics-2e/pages/4-2-mean-or-expected-value-and-standard-deviation)
- Berkeley SticiGui (Expectation): [https://www.stat.berkeley.edu/~stark/SticiGui/Text/expectation.htm](https://www.stat.berkeley.edu/~stark/SticiGui/Text/expectation.htm)
- SLCC Discrete EV: [https://slcc.pressbooks.pub/engr2550textbook/chapter/4-3-expected-value-and-standard-deviation-for-a-discrete-probability-distribution/](https://slcc.pressbooks.pub/engr2550textbook/chapter/4-3-expected-value-and-standard-deviation-for-a-discrete-probability-distribution/)
- LibreTexts Expected Value §9.8: [https://math.libretexts.org/Courses/SUNY_Geneseo/Math_113%3A_Finite_Math_for_Society/09%3A_Probability/9.08%3A_Expected_Value](https://math.libretexts.org/Courses/SUNY_Geneseo/Math_113%3A_Finite_Math_for_Society/09%3A_Probability/9.08%3A_Expected_Value)
- Open Oregon Expected Value: [https://openoregon.pressbooks.pub/math/chapter/expected-value/](https://openoregon.pressbooks.pub/math/chapter/expected-value/)
- Numworks Fair Games: [https://www.numworks.com/educators/activities/statistics/fair-games/](https://www.numworks.com/educators/activities/statistics/fair-games/)

MVP Problem Specs — 15 problems follow on subsequent pages.

Midpoint - MVP PRD Page 3
MVP Problem Specs
Lesson 1 of 5: Expected Value as a Long-Run Average
Lesson goal: understand expected value as the average result over many repetitions rather than the result of one trial.
Estimated lesson time: ~7.5 minutes (P1 2.5 + P2 2.5 + P3 2.5).

Lesson 1, Problem 1 — Dice Toss Average
Stable problem ID: ev-l1-p1
Legacy ID mapping: problem-1 (storage ID preserved; interaction evolves from spinner/chip-bag to dice throw)
Instructional role: Interactive Concept Introduction — fun mini-game
Estimated completion time: 2.5 min

Concept
Expected value is the average outcome over many repetitions of a random process.

Scenario
A street-game table offers a single-die toss. Roll the die; if the face shows 1, 2, or 3 you win $0; if it shows 4, 5, or 6 you win $10. The learner drags a die into the throw zone, releases it, watches it tumble and settle, collects the payout, and repeats until the running average per throw approaches the theoretical EV.

Source-grounded problem pattern
OpenStax / standard intro-statistics die exercises (discrete outcomes with unequal payoffs on faces); OpenStax Law of Large Numbers framing.
Selected over: two-dice “sum is 7” pattern (adds combination-count complexity that distracts from long-run average in Lesson 1).
Selected over: chip-bag draws (less tactile than throw physics).
Adapted as: one draggable die with face-based payout bands and a felt throw zone.

Exact payout rules
One fair six-sided die per throw.
Faces 1, 2, 3 → payout $0 each (three equally likely zero outcomes).
Faces 4, 5, 6 → payout $10 each (three equally likely $10 outcomes).
P($0) = 3/6 = 0.5; P($10) = 3/6 = 0.5.
Theoretical EV = 0×0.5 + 10×0.5 = **$5 per throw**.

Pre-problem mini-demo (4 steps)

1. Highlight die faces 1–3 (gray band, $0) and 4–6 (gold band, $10).
2. Demonstrate drag die → release in throw zone → tumble → settle → payout token drops.
3. Point to throw count, total winnings, average per throw, and running-average graph with $5 reference line.
4. CTA: "Predict where the average settles, throw at least 5 times yourself, then use Throw 10 / Throw 100 if you want speed."

Buttons: Back, Next, Skip demo, Start Problem.

Visual state
Felt table surface; throw zone outline; one large draggable die (default rest position at table edge); winnings tray; counters (throws, total $, average); running-average graph with dashed EV reference at $5; optional Throw 10 / Throw 100 batch buttons (locked until learner completes ≥5 manual throws).

Interactive controls
Primary: drag die into throw zone and release (pointer/touch).
Secondary (after 5 manual throws): Throw 10, Throw 100 batch buttons.
Prediction selector: $0, $5, $10 before or during early throws.
Final average input + Check.
Tap-to-throw fallback: tap die → tap throw zone (no drag required on mobile).

Current-task checklist
Submit a prediction → Throw die manually at least 5 times → Reach ≥100 total throws → Identify long-run average $5 → Complete.

Required learner actions

1. Submit a prediction for the long-run average per throw.
2. Manually drag-and-throw (or tap-to-throw) the die at least 5 times.
3. Accumulate ≥100 total throws (manual + batch).
4. Submit $5 as the long-run average.

Answer and completion rules
Completion requires: prediction submitted; ≥5 manual throws; ≥100 total throws; correct average $5.
Normalized correct value = 5.
Batch buttons disabled until manualThrowCount ≥ 5.

Accepted answer formats
5, 5.0, 5.00, $5, $5.00, 5 dollars, 5 per throw

Correct model
EV = (0+0+0+10+10+10)/6 = 30/6 = 5, equivalently 0×0.5 + 10×0.5 = 5.

Deterministic normalization
Money tolerance ±0.01; prediction ∈ {0, 5, 10}; manual throw count and total throw count tracked server-side in session state.

Mistake classifications
chose-extreme-outcome | confused-single-throw-with-average | assumed-sample-equals-ev | selected-largest-payout

Wrong-answer feedback examples
"You chose one possible payout ($0 or $10), but expected value is the average over many throws — not the result of a single roll."
Next: "Keep throwing and watch the average-per-throw line. Half the faces pay $0 and half pay $10."

Correct-answer feedback
"Correct — $5 is the long-run average. Three faces pay $0 and three pay $10, so the average per throw is halfway between."

Hint sequence
H1: Watch the running-average graph after each throw (visual: graph point added).
H2: Count the $0 faces and $10 faces on the die — same number of each.
H3: (0+0+0+10+10+10)/6 = 5.

Fun animation and interaction
Core feeling: "I am physically repeating a random process and watching the average settle."
Tactile interaction: learner drags die from rest pad into throw zone and releases.
Concrete visual object: single 3D-styled die with legible pips; felt table; coin/token tray.

Animation sequence (full motion):

1. **Drag lift:** On pointer down, die scales to 1.08× and gains drop shadow (150ms) — signals grab.
2. **Arc into zone:** On release inside throw zone, die follows a short parabolic arc (400ms ease-out) — represents toss, not teleport.
3. **Tumble frames:** Die cycles 8–12 pip-orientation frames with slight table shadow slide (600ms) — random process in progress.
4. **Settle bounce:** Die lands on final face with one 8px vertical bounce (200ms spring) — result is physically decided.
5. **Result highlight:** Winning face band pulses (gold for $10, gray for $0, 300ms) — learner sees which rule applied.
6. **Payout token:** If $10, gold token flies from die to winnings tray (350ms); if $0, tray receives a faint "+$0" fade — cause → money effect.
7. **Graph draw:** New running-average point draws; counters tick up without blocking input — accumulation over repetitions.
8. **EV glow:** After ≥50 throws, dashed $5 reference line gains subtle glow (opacity 0.4→0.9, 500ms) — theoretical target visible.
9. **Completion burst:** On correct submit, tray and graph briefly sparkle (400ms) then Continue appears in workspace.

Reduced-motion mode
Drag still works; on release, die fades to center of throw zone (150ms), face instant-reveals with numeric label ("4 — $10"), payout token fades into tray, graph point appears without arc/tumble. EV line highlight uses opacity step only. No bounce or sparkle.

Why animation teaches (not decorative)
Tumble + settle separates **one random outcome** from the **running average** updating in the graph beside the table. Repeated throws visibly compress variation around $5, embodying long-run average without formula.

Desktop workspace arrangement
Target viewport: 1280×720 — active state fits without page scroll.
Left region (~~55%): felt table, throw zone, draggable die, winnings tray, running-average graph with $5 reference.
Right region (~~45%): current task, prediction, throw count summary, average input, Check, hints, feedback, Continue.
Feedback appears directly beneath Check in right region.

Mobile workspace arrangement
Compact table+graph strip (max 180px) → die drag area → counters → input → Check → feedback; sticky task strip.
Tap-to-throw: tap die, then tap throw zone (no drag required).
Feedback auto-scrolls into viewport beneath Check.

Accessibility behavior
Keyboard: Tab to die → Enter to pick up → Arrow keys move aim → Enter to throw; Space activates batch throw when enabled.
Live region announces each result: "Rolled 4, won ten dollars. Average after 12 throws: four dollars fifty."
Graph text summary updates: "Running average: $4.50 after 12 throws (target $5)."
Touch targets ≥ 48px on die and throw zone.

Review-mode state
Saved: final average answer, total throws, graph summary series (may be compact), last 5 face results.

Restart behavior
Resets die position, throw counts, graph, tray, prediction, and feedback; preserves completion record.

Validation cases

- prediction required before final check
- manualThrowCount < 5 blocks batch buttons and final check with guard message (not graded wrong)
- totalThrows < 100 blocks final check with guard message
- answers 0, 10, 4.17 fail with chose-extreme-outcome or assumed-sample-equals-ev
- 5, $5.00, 5 per throw pass
- reduced-motion flag skips tumble frames but preserves deterministic face sequence from seeded RNG per session
- tap-to-throw produces identical outcomes as drag-release for same throw index
- workspace at 1280×720: feedback visible without scroll after wrong check

Lesson 1, Problem 2 — Unequal Section Game
Stable problem ID: ev-l1-p2
Legacy ID mapping: l1-unequal-spinner
Instructional role: Guided Application
Estimated completion time: 2.5 min

Concept
Expected value remains a long-run average when outcomes are not equally likely.
Scenario
A spinner has:
25% chance of winning $20
75% chance of winning $0
Pre-problem mini-demo
Highlight the one-quarter $20 section.
Highlight the three-quarter $0 section.
Explain that section size represents probability.
Point to the running-average graph and ask where the average will settle.
Visual + interaction
Spinner divided into four equal quarters.
One quarter labeled $20.
Three quarters labeled $0.
Spin Once, Spin 10, and Spin 100 buttons.
Counters for spins, winnings, and average.
Running-average graph with $5 reference line.
Prediction input before simulation.
Current-task checklist
Predict the average.
Run at least 100 spins.
Compare observed average with the prediction.
Submit the long-run average.
Answer and completion rules
Submit prediction.
Run at least 100 total spins.
Identify $5 as the long-run average.
The observed simulation average does not need to equal exactly $5.
Accepted answer formats
5
5.0
5.00
$5
$5.00
5 dollars
Correct model
20 × 0.25 + 0 × 0.75 = 5
Mistake types
Chose $20 because it is the largest payout.
Ignored probability.
Assumed a 25% chance means the average is $20 ÷ 25.
Confused short-run simulation variation with the theoretical long-run average.
Feedback
“The $20 outcome is larger, but it happens only one quarter of the time. Expected value accounts for both payout and probability. Multiply $20 by 0.25, then include the $0 outcome.”
Teaching animation
Spinner rotation reflects batch spins.
The $20 quarter pulses when explaining the 25% probability.
The graph visibly becomes more stable as trials increase.
Correct completion connects the one-quarter spinner section to the contribution $5.

Desktop workspace arrangement
Target viewport: 1280×720
Left region: Unequal spinner + running-average graph
Right region: Prediction, spin controls, average field, check, feedback
Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
Feedback appears in the right region directly beneath the active input or check action.
Continue appears in the right region after completion.

Mobile workspace arrangement
Spinner summary sticky mini + controls stack
Sticky current-task strip at top of the interaction stack.
Feedback auto-scrolls into view beneath the active input.
No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.

Exact control placement (both layouts)
Current task: top of right region (desktop) / sticky strip (mobile).
Primary input: right region center, adjacent to visual.
Check/submit: directly beneath primary input.
Hint button: beside check action.
Feedback: immediately beneath check action, never at page bottom.
Completion state: inline badge beside current task.

Accessibility behavior
Keyboard focus order: task → visual controls → input → check → feedback → continue.
Live region announces feedback within 100ms of check.
Touch targets ≥ 44px. Graphs include text summary of latest average/state.

Review-mode state
Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.

Restart behavior
Resets interaction state only; preserves completion record and chapter position.

Validation cases
See Appendix — Problem validation matrix for ev-l1-p2.

Lesson 1, Problem 3 — Compare Two Carnival Games
Stable problem ID: ev-l1-p3
Legacy ID mapping: l1-compare-spinners
Instructional role: Independent Fluency Check
Estimated completion time: 2.5 min

Concept
Games should be compared by their weighted long-run averages, not only by largest payout or winning frequency.
Scenario
Spinner A:
50% chance of $10
50% chance of $0
Spinner B:
25% chance of $20
75% chance of $0
Pre-problem mini-demo
Highlight Spinner A’s more frequent $10 win.
Highlight Spinner B’s less frequent $20 win.
Explain that payout size and probability must be considered together.
Point to the comparison selector.
Visual + interaction
Two spinner cards.
Outcome and probability labels.
Optional short simulation for each.
Mini running-average graphs.
Choice:
Spinner A has higher EV.
Spinner B has higher EV.
They have the same EV.
Explanation choice.
Answer and completion rules
Select that the spinners have the same expected value.
Select that both games average $5 over many plays.
Correct models
Spinner A:
10 × 0.5 + 0 × 0.5 = 5
Spinner B:
20 × 0.25 + 0 × 0.75 = 5
Mistake types
Chose Spinner B because it can pay $20.
Chose Spinner A because it wins more often.
Compared only the maximum payout.
Compared only the chance of a positive payout.
Ignored the weighted average.
Feedback
“Spinner B has the larger prize, but it pays that prize less often. Spinner A wins more often, but its prize is smaller. When payout and probability are combined, both games average $5.”

Desktop workspace arrangement
Target viewport: 1280×720
Left region: Two spinner cards + optional mini graphs
Right region: Comparison choices, check, feedback
Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
Feedback appears in the right region directly beneath the active input or check action.
Continue appears in the right region after completion.

Mobile workspace arrangement
Cards stack; MC immediately below; feedback inline
Sticky current-task strip at top of the interaction stack.
Feedback auto-scrolls into view beneath the active input.
No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.

Exact control placement (both layouts)
Current task: top of right region (desktop) / sticky strip (mobile).
Primary input: right region center, adjacent to visual.
Check/submit: directly beneath primary input.
Hint button: beside check action.
Feedback: immediately beneath check action, never at page bottom.
Completion state: inline badge beside current task.

Accessibility behavior
Keyboard focus order: task → visual controls → input → check → feedback → continue.
Live region announces feedback within 100ms of check.
Touch targets ≥ 44px. Graphs include text summary of latest average/state.

Review-mode state
Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.

Restart behavior
Resets interaction state only; preserves completion record and chapter position.

Validation cases
See Appendix — Problem validation matrix for ev-l1-p3.

MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 15 problems. No AI in MVP.

Midpoint - MVP PRD Page 4
Lesson 2 of 5: Expected Value as a Weighted Average
Lesson goal: construct expected value by pairing each outcome with its probability and adding contributions.
Estimated lesson time: ~8 minutes.

Lesson 2, Problem 1 — Claw Machine Expected Value
Stable problem ID: ev-l2-p1
Legacy ID mapping: problem-2 / l2-build-weighted-average
Instructional role: Interactive Concept Introduction — fun mini-game
Estimated completion time: 2.5 min

Concept
Expected value is a weighted average of outcomes: each outcome contributes payout × probability, according to how much chance-space it occupies.
Scenario
A 3D carnival claw machine hovers over a pit split into 4 equal floor zones: one small $20 prize zone (25%) and three empty $0 zones (75%). The learner runs claw grabs from a "Drop Claw" control; each grab is weighted (≈25% $20, ≈75% $0) and a payout token drops into a tray. Short runs are noisy — the tray total wanders — which is the point: a handful of grabs is not the expected value. After at least 8 grabs the learner views the contribution compression (the pit collapses into blocks: $20 × 25% = $5, $0 × 75% = $0), then the formula EV = ___ × ___ + ___ × ___ unlocks and the learner submits EV = $5.

Source-grounded problem pattern
LibreTexts weighted-average analogy; OpenStax μ = Σ x·P(x).
Adapted as: noisy claw grabs → contribution compression → notation.

Pre-problem mini-demo
Show the 4-zone pit (1 prize : 3 empty). Demo one $20 grab → contribution chip +$5. Demo a $0 grab → empty tray slot. Then preview the contribution blocks and formula slots.

Visual + interaction
Phase A — Claw machine (required first):
3D pit/cabinet with 4 equal zones (one $20, three $0); claw on a rail that slides L/R, drops, grabs, and rises; payout tray accumulates tokens; grab counter. "Drop Claw" button runs one weighted grab at a time. The $20 token flashes gold and is rare; $0 tokens are gray and common.
Phase B — Contribution compression (unlocks after ≥8 grabs):
The pit compresses into contribution blocks whose width reflects probability: $20 × 25% = $5 and $0 × 75% = $0, summing to EV = $5.
Phase C — Formula (after viewing compression):
EV = ___ × ___ + ___ × ___ with cards $20, $0, 25%, 75%; tap-to-place; EV field; Check.

Current-task checklist
Run ≥8 claw drops → Watch the tray → View contribution compression → Fill formula → Submit EV $5.

Answer and completion rules
Run at least 8 claw drops and view the contribution compression; both formula pairs correct ($20 with 25%, $0 with 75%); EV = 5. Grab luck never changes the required answer (short-run ≠ true EV).

Accepted answer formats: 5, 5.0, 5.00, $5, $5.00

Mistake types
Chose $20 because it is the best prize (used-largest-payout) | matched $20 with 75% / reversed outcome and probability (reversed-outcome-probability) | omitted the $0 outcome or a probability (omitted-probability) | treated a short run of grabs as the exact EV (taught in copy) | arithmetic-error

Feedback
"Correct! 20 × 0.25 + 0 × 0.75 = $5. The rare $20 grab (25% of the pit) contributes the whole $5; the common $0 zones add nothing."

Fun animation and interaction
Core feeling: "Each outcome contributes according to how much chance-space it occupies — and a few lucky grabs aren't the average."
Tactile: drop the claw repeatedly, watch a noisy tray, then compress the pit.
Objects: 3D claw machine + pit (4 zones), claw on a rail, payout tray, contribution blocks.

Animations:

1. Claw slides along the rail to the target zone (travel), cable drops, claw closes (grab), rises with the token.
2. $20 grab: token flashes gold, "+$20" / "+$5 contribution" chip pops; $0 grab: gray token, empty-handed dip.
3. Token drops into the payout tray, which accumulates across grabs (tray total visibly wanders early on).
4. Grab counter increments; after the threshold, a "View contributions" affordance appears.
5. Contribution compression: pit zones slide/collapse into proportional blocks ($20 quarter-width, $0 three-quarters-width) labeled with products, summing to a $5 badge.
6. Formula strip slides in; card snap on correct placement.
7. Completion: blocks merge to $5 badge + brief confetti.

Reduced-motion: no claw travel/cable; the selected zone reveals with a fade and the tray updates instantly; contribution blocks render in final state; formula fades in; no confetti. Result is identical and deterministic.

Why animation teaches: zone area = probability; tray noise = short-run variance ≠ EV; block width = contribution weight; $0 zones, though common, still add $0.

Teaching animation (formula phase)
Cards lift/glow; reversed pairings highlight correct slots. Reduced-motion: immediate highlights.

Desktop workspace (no-scroll split layout): left = 3D claw machine + tray (.ws-visual); right = task, "Drop Claw" + grab counter, then contribution blocks, formula, EV, check, feedback (1280×720, fits without scrolling).
Mobile: claw machine strip → tray → contribution blocks → formula; tap-to-place; sticky task.

Accessibility
Live region on grab: "Grab N: twenty dollars" or "Grab N: zero dollars." On compression: "Twenty dollars times twenty-five percent is five dollars; zero dollars times seventy-five percent is zero; expected value five dollars."

Review-mode / Restart / UX placement
Same compact two-region rules as other problems; feedback beneath Check.

Validation cases

- Formula locked until ≥8 grabs run and contribution compression viewed (grabsComplete gate)
- A noisy/lucky short run never changes the required EV ($5)
- Grabs-only (without viewing compression / formula) does not complete problem
- Same EV checker rules as l2-build-weighted-average (checker export names unchanged)
- tap-to-place equivalent to drag for cards
- Reduced-motion path produces identical deterministic outcomes

Lesson 2, Problem 2 — Match Outcomes to Probabilities
Stable problem ID: ev-l2-p2
Legacy ID mapping: l2-match-outcomes-probabilities
Instructional role: Guided Application
Estimated completion time: 2.5 min

Concept
Every outcome must be paired with the probability of that exact outcome.
Scenario
A game pays:
$12 with probability 1/3
$3 with probability 1/2
$0 with probability 1/6
Pre-problem mini-demo
Show the outcome-card column.
Show the probability-card column.
Demonstrate one sample tap-to-match action.
Explain that the largest payout does not automatically receive the largest probability.
Visual + interaction
Outcome cards:
$12
$3
$0
Probability cards:
1/3
1/2
1/6
Three outcome × probability rows.
Tap-to-select/tap-to-place interaction.
Tap again to replace.
Clear-row control.
Answer and completion rules
Correct pairs:
$12 ↔ 1/3
$3 ↔ 1/2
$0 ↔ 1/6
Completion requires all three correct pairs.
Mistake types
Paired largest payout with largest probability without using the given data.
Omitted the $0 outcome.
Treated probability as a payout.
Reused a probability card.
Left an outcome unmatched.
Feedback
“Each payout needs the probability of receiving that exact payout. Do not rank the cards by size. Read the game data and connect each outcome to its own chance.”

Desktop workspace arrangement
Target viewport: 1280×720
Left region: Outcome column + match lines
Right region: Probability cards, row slots, check
Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
Feedback appears in the right region directly beneath the active input or check action.
Continue appears in the right region after completion.

Mobile workspace arrangement
Two-column match UI
Sticky current-task strip at top of the interaction stack.
Feedback auto-scrolls into view beneath the active input.
No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.

Exact control placement (both layouts)
Current task: top of right region (desktop) / sticky strip (mobile).
Primary input: right region center, adjacent to visual.
Check/submit: directly beneath primary input.
Hint button: beside check action.
Feedback: immediately beneath check action, never at page bottom.
Completion state: inline badge beside current task.

Accessibility behavior
Keyboard focus order: task → visual controls → input → check → feedback → continue.
Live region announces feedback within 100ms of check.
Touch targets ≥ 44px. Graphs include text summary of latest average/state.

Review-mode state
Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.

Restart behavior
Resets interaction state only; preserves completion record and chapter position.

Validation cases
See Appendix — Problem validation matrix for ev-l2-p2.

Lesson 2, Problem 3 — Diagnose Bad EV Setups
Stable problem ID: ev-l2-p3
Legacy ID mapping: l2-diagnose-bad-ev-setups
Instructional role: Independent Fluency Check
Estimated completion time: 3 min

Concept
A complete EV model multiplies every outcome by its probability and represents all possible outcomes.
Scenario
Game data:
$20 with probability 0.25
$4 with probability 0.25
$0 with probability 0.5
Proposed formulas:
A. 20 + 4 + 0
B. 20 × 0.25 + 4 × 0.25
C. 20 × 0.25 + 4 × 0.25 + 0 × 0.5
Pre-problem mini-demo
Introduce the formula checklist.
Ask whether each payout has a probability.
Ask whether all outcomes are represented.
Explain that a zero contribution can still represent important probability.
Visual + interaction
Three formula cards.
Checklist for each:
Uses outcome × probability
Includes all outcomes
Accounts for total probability
Learner selects the valid setup.
Learner identifies the defect in the other two.
Answer and completion rules
Select formula C.
Identify A as summing payouts without probability weighting.
Identify B as omitting the $0 outcome and its probability.
Mistake types
Summed raw payouts.
Omitted the $0 outcome.
Chose an incomplete setup because the omitted contribution equals zero.
Believed probabilities are optional.
Focused only on the final numerical result instead of the model.
Feedback
“Formula B produces the same numeric contribution from the positive payouts, but it leaves half the probability unrepresented. A complete model includes the $0 outcome because it explains where the remaining probability goes.”

Desktop workspace arrangement
Target viewport: 1280×720
Left region: Three formula cards with checklist icons
Right region: Select valid + defect picks, check
Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
Feedback appears in the right region directly beneath the active input or check action.
Continue appears in the right region after completion.

Mobile workspace arrangement
Formula cards stack; checklist toggles inline
Sticky current-task strip at top of the interaction stack.
Feedback auto-scrolls into view beneath the active input.
No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.

Exact control placement (both layouts)
Current task: top of right region (desktop) / sticky strip (mobile).
Primary input: right region center, adjacent to visual.
Check/submit: directly beneath primary input.
Hint button: beside check action.
Feedback: immediately beneath check action, never at page bottom.
Completion state: inline badge beside current task.

Accessibility behavior
Keyboard focus order: task → visual controls → input → check → feedback → continue.
Live region announces feedback within 100ms of check.
Touch targets ≥ 44px. Graphs include text summary of latest average/state.

Review-mode state
Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.

Restart behavior
Resets interaction state only; preserves completion record and chapter position.

Validation cases
See Appendix — Problem validation matrix for ev-l2-p3.

MVP only: five lessons, 15 problems. No AI in MVP.

Midpoint - MVP PRD Page 5
Lesson 3 of 5: Counts, Tables, and Discrete Outcomes
Lesson goal: convert counts to probabilities, organize tables, calculate EV.
Estimated lesson time: ~8.5 minutes (within target via collapsible reference).

Lesson 3, Problem 1 — Average Card Value
Stable problem ID: ev-l3-p1
Legacy ID mapping: problem-3 / l3-mystery-box-outcomes
Instructional role: Interactive Concept Introduction — fun mini-game
Estimated completion time: 3 min

Concept
Expected value can be calculated from counts rather than prewritten percentages.
Scenario
Draw one card from a full 52-card deck. Each card is worth its face value:
Ace = 1
2 through 10 = the number on the card
Jack, Queen, King = 10
Pre-problem mini-demo
Demonstrate dealing one card onto the table to reveal its value.
Show how cards worth the same value receive the same color group.
Explain that count means the number of cards with that value.
Explain that probability means matching count divided by 52 total cards.
Visual + interaction
A 3D card table with a full deck.
Cards deal out, flip face up, and group by value (1 through 10).
The value-10 group folds together the 10, Jack, Queen, and King.
Table:
Value | Number of Cards | Probability
The active row highlights the matching value group.
Count and probability fields have inline validation.
Current-task checklist
Watch the deck deal and group by value.
Confirm that Jack, Queen, and King each count as 10.
Enter the count for the value-10 group.
Enter the deck total (numerator of the EV expression).
Confirm the expected value of one draw.
Answer and completion rules
Watch the deal, then complete the count, deck total, and EV.
Correct values:
Value-10 group → 16 cards (four 10s, four Jacks, four Queens, four Kings)
Deck total → 340 (sum of all 52 card values)
Expected value → 340 / 52 = 85/13 ≈ 6.54
Accepted answer formats
Value-10 count:
16
Deck total:
340
Expected value:
85/13
6.54
6.538
6.5385
6.539
6.53
Mistake types
Counted only the face cards (Jack, Queen, King = 12) and forgot the four 10s.
Treated a face card as worth 11, 12, or 13 instead of 10.
Treated the Ace as 11 instead of 1.
Reported the deck total (340) instead of dividing by 52.
Used the wrong denominator.
Feedback
“You entered 12 for the value-10 group. That counts only the Jacks, Queens, and Kings — the four actual 10s also belong to this group, so the count is 16.”
Fun animation and interaction
Core feeling: "Counts become probabilities."
Tactile: deal cards onto a felt table; each card flips face up and slides into its value column.
Objects: a 3D card table, a deck, dealt playing cards, value-group columns, a table that fills from the deal.

Animations:

1. **Deck land:** the deck drops onto the felt with a soft settle (250ms ease) — a real table appears.
2. **Deal arc:** each card flies out in an isometric arc (180ms) toward its column.
3. **Flip up:** the card rotates in 3D to reveal its rank and EV value (220ms) — value revealed.
4. **Group by value:** matching cards stack into the same column and pulse one color; a "×N" count label types in — count grouping.
5. **Row fill:** when a column completes, the table row **types in** count then probability with count/52 animating (400ms) — count→probability bridge.
6. **Completion:** the EV badge pops in showing ≈ 6.54 (bar flash 300ms).

Reduced-motion: cards appear face up in their columns instantly; row values appear instantly; no arc or flip.

Why animation teaches: dealing produces **counts**; grouping shows how 16 cards share value 10 before the learner converts to probability.

Teaching animation
Cards deal and flip face up.
Matching values receive consistent colors.
Active table rows highlight the corresponding value group.
Probability hints animate the structure count / 52.

Desktop workspace arrangement
Target viewport: 1280×720
Left region: 3D card table + dealt cards grouped by value
Right region: Table fields, confirm button
Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
Feedback appears in the right region directly beneath the active input or check action.
Continue appears in the right region after completion.

Mobile workspace arrangement
Dealt cards then table
Sticky current-task strip at top of the interaction stack.
Feedback auto-scrolls into view beneath the active input.
No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.

Exact control placement (both layouts)
Current task: top of right region (desktop) / sticky strip (mobile).
Primary input: right region center, adjacent to visual.
Check/submit: directly beneath primary input.
Hint button: beside check action.
Feedback: immediately beneath check action, never at page bottom.
Completion state: inline badge beside current task.

Accessibility behavior
Keyboard focus order: task → visual controls → input → check → feedback → continue.
Live region announces feedback within 100ms of check.
Touch targets ≥ 44px. Graphs include text summary of latest average/state.

Review-mode state
Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.

Restart behavior
Resets interaction state only; preserves completion record and chapter position.

Validation cases

- the deck must finish dealing before the table validates
- row highlight syncs with the value-group columns
- reduced-motion uses instant deal with same counts
- the value-10 group includes 10, J, Q, K (16 cards)
See Appendix matrix for ev-l3-p1.

Lesson 3, Problem 2 — Dealt-Hand Contributions
Stable problem ID: ev-l3-p2
Legacy ID mapping: problem-4 / l3-calculate-ev-from-table
Instructional role: Guided Application
Estimated completion time: 2.5 min

Concept
Calculate EV by summing each value × probability contribution.
Scenario
An 8-card hand is dealt to the table:
10♠, J♥, Q♣, K♦ — four cards worth 10
4♠, 4♥ — two cards worth 4
2♣, 2♦ — two cards worth 2
Pre-problem mini-demo
Highlight one table row.
Animate value × probability.
Show the result entering a contribution cell.
Explain that final EV is the sum of all row contributions.
Visual + interaction
The dealt hand groups into colored value columns.
A provided table gives value, count, and probability for each group (read-only).
Expression:
2 × 2/8 + 4 × 2/8 + 10 × 4/8
Three contribution fields (one per value group).
Final EV field.
Color links between cards, rows, and contribution chunks.
Answer and completion rules
Correct contributions:
2 × 2/8 = 0.5
4 × 2/8 = 1.0
10 × 4/8 = 5.0
Final EV:
6.5
Completion requires all three contributions and final EV.
Accepted answer formats
Contributions:
0.5
1.0
5.0
$0.50 / $1 / $5 where money formatting is allowed
Final EV:
6.5
6.50
$6.50
13/2
Mistake types
Arithmetic error.
Summed the card values without probability weighting (2 + 4 + 10 = 16).
Entered the raw value as the contribution instead of value × probability.
Feedback
“The setup is close, but a contribution is value × probability. For the value-10 row, calculate 10 × 4/8 = 5.0. Do not add the card values directly because each value does not occur every time.”
Teaching animation
Each row transforms into a colored contribution chunk.
Contributions move toward the final EV total.
Correct completion combines the chunks into 6.5.

Desktop workspace arrangement
Target viewport: 1280×720
Left region: Dealt hand grouped into colored value chunks + expression
Right region: Contribution inputs, EV, check
Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
Feedback appears in the right region directly beneath the active input or check action.
Continue appears in the right region after completion.

Mobile workspace arrangement
Expression + inputs stack
Sticky current-task strip at top of the interaction stack.
Feedback auto-scrolls into view beneath the active input.
No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.

Exact control placement (both layouts)
Current task: top of right region (desktop) / sticky strip (mobile).
Primary input: right region center, adjacent to visual.
Check/submit: directly beneath primary input.
Hint button: beside check action.
Feedback: immediately beneath check action, never at page bottom.
Completion state: inline badge beside current task.

Accessibility behavior
Keyboard focus order: task → visual controls → input → check → feedback → continue.
Live region announces feedback within 100ms of check.
Touch targets ≥ 44px. Graphs include text summary of latest average/state.

Review-mode state
Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.

Restart behavior
Resets interaction state only; preserves completion record and chapter position.

Validation cases
See Appendix — Problem validation matrix for ev-l3-p2.

Lesson 3, Problem 3 — Mini-Deck EV Table
Stable problem ID: ev-l3-p3
Legacy ID mapping: l3-prize-bag-ev-table
Instructional role: Independent Fluency Check
Estimated completion time: 3 min

Concept
Build a complete expected value table from card counts.
Scenario
A 10-card mini deck is dealt:
3 cards worth 1 (A♠, A♥, A♣)
3 cards worth 7 (7♠, 7♥, 7♦)
4 cards worth 10 (10♠, J♥, Q♣, K♦)
Pre-problem mini-demo
Group matching card values.
Convert count to probability using 10 total cards.
Demonstrate the meaning of a contribution cell.
Explain that the final EV is the sum of contributions.
Visual + interaction
A 3D card table and 10 dealt cards.
Value grouping into columns.
Blank table:
Value | Count | Probability | Contribution
Final EV field.
Matching visual colors.
Answer and completion rules
Correct rows:
Value 1 → count 3 → probability 3/10 or 0.3 → contribution 0.3
Value 7 → count 3 → probability 3/10 or 0.3 → contribution 2.1
Value 10 → count 4 → probability 4/10 or 0.4 → contribution 4.0
Final EV:
6.4
Accepted answer formats
Equivalent fractions
Equivalent decimals
6.4
6.40
$6.40
32/5
Mistake types
Count/probability confusion.
Wrong denominator.
Arithmetic error.
Omitted a value row.
Used the total card value (64) instead of EV per draw.
Feedback
“Contribution is value × probability. For the value-7 cards, there are 3 out of 10, so the contribution is 7 × 3/10 = 2.1. Repeat that process for each value before adding.”

Desktop workspace arrangement
Target viewport: 1280×720
Left region: 3D card table + 10 dealt cards grouped by value
Right region: Full editable table + EV field
Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
Feedback appears in the right region directly beneath the active input or check action.
Continue appears in the right region after completion.

Mobile workspace arrangement
Card summary strip + table
Sticky current-task strip at top of the interaction stack.
Feedback auto-scrolls into view beneath the active input.
No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.

Exact control placement (both layouts)
Current task: top of right region (desktop) / sticky strip (mobile).
Primary input: right region center, adjacent to visual.
Check/submit: directly beneath primary input.
Hint button: beside check action.
Feedback: immediately beneath check action, never at page bottom.
Completion state: inline badge beside current task.

Accessibility behavior
Keyboard focus order: task → visual controls → input → check → feedback → continue.
Live region announces feedback within 100ms of check.
Touch targets ≥ 44px. Graphs include text summary of latest average/state.

Review-mode state
Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.

Restart behavior
Resets interaction state only; preserves completion record and chapter position.

Validation cases
See Appendix — Problem validation matrix for ev-l3-p3.

MVP only: five lessons, 15 problems. No AI in MVP.

Midpoint - MVP PRD Page 6
Lesson 4 of 5: Expected Payout, Expected Profit, and Fairness
Estimated lesson time: ~7.5 minutes.

Lesson 4, Problem 1 — Pay to Play
Stable problem ID: ev-l4-p1
Legacy ID mapping: problem-5 / l4-payout-vs-profit
Instructional role: Interactive Concept Introduction — fun mini-game
Estimated completion time: 2.5 min

Concept
Expected payout and expected profit differ when there is a cost to play.
Scenario
The mystery-box game returns $4 on average, but costs $3 to enter. Gold coins fill a **payout tray** upward; the learner drags a **cost token** into the cost slot; a **profit meter** shows what remains.

Pre-problem mini-demo
Coins stream into payout tray to $4. Cost slot empty. Drag $3 cost coin → profit meter drops to $1.

Visual + interaction
Payout tray (fills to $4 with animated coins).
Cost slot (accepts draggable $3 token).
Profit meter (starts at $4, moves to $1 when cost inserted).
Expected profit input + Check.

Answer and completion rules
Cost token placed; submit expected profit = 1.

Accepted answer formats: 1, 1.0, 1.00, $1, $1.00
Correct model: 4 − 3 = 1

Mistake types
answered-payout | added-cost | cost-as-probability | reversed-subtraction

Feedback
"You repeated expected payout ($4). Subtract the $3 cost to get expected profit."

Fun animation and interaction
Core feeling: "The game may pay me, but I first paid a cost."
Tactile: drag $3 cost coin into slot after watching payout fill.
Objects: coin stream, payout tray, cost slot, vertical profit meter.

Animations:

1. **Coin stream:** on load, 4 gold coins slide into payout tray one-by-one (150ms stagger) — expected payout builds visually.
2. **Tray label:** "$4 expected payout" fades in above tray (200ms).
3. **Cost drag:** cost coin lifts with red tint (120ms).
4. **Slot swallow:** cost coin slides into slot (250ms); tray **does not** lose coins but profit meter **drops** from $4 to $1 with downward slide (400ms ease-in) — teaches subtraction not addition.
5. **Wrong add path:** if learner taps + instead, meter briefly rises then shakes red (300ms) — incorrect model.
6. **Correct lock:** at $1, meter turns green pulse (300ms); profit input unlocks.

Reduced-motion: tray shows $4 instantly; cost fade into slot; meter jumps to $1.

Why animation teaches: payout and profit are separate quantities; cost pulls profit down without erasing payout history.

Desktop workspace: left = tray + meter; right = cost token, profit input, check, feedback.
Mobile: tray mini + meter + cost drag; sticky task.

Accessibility
Live region: "Expected payout four dollars. Cost three dollars. Expected profit one dollar."

Review-mode / Restart
Standard compact workspace rules.

Validation cases

- profit input locked until cost placed
- answered 4 triggers answered-payout
- tap-to-place cost equivalent to drag

Lesson 4, Problem 2 — Fair, Favorable, or Unfavorable?
Stable problem ID: ev-l4-p2
Legacy ID mapping: problem-6 / l4-fair-favorable-unfavorable
Instructional role: Guided Application
Estimated completion time: 2.5 min

Concept
Positive expected profit is favorable.
Zero expected profit is fair.
Negative expected profit is unfavorable.
Scenario
Three games:
Game A: payout $5, cost $5
Game B: payout $7, cost $5
Game C: payout $3, cost $5
Pre-problem mini-demo
Explain payout − cost.
Show the negative/zero/positive number line.
Map negative, zero, and positive to the three categories.
Demonstrate tap a card, then tap a bucket.
Visual + interaction
Three game cards.
Payout bar.
Cost bar.
Hidden profit meter.
Buckets:
Favorable
Fair
Unfavorable
Tap-to-select/tap-to-place.
Tap again to move a card.
Clear-placement control.
Answer and completion rules
A = Fair
B = Favorable
C = Unfavorable
Correct profits:
A = 0
B = +2
C = −2
Completion requires all three cards correctly placed.
Accepted classification formats
When text normalization is needed:
fair
favorable
fav
positive, where unambiguous
unfavorable
unfav
negative, where unambiguous
The primary interaction remains deterministic bucket placement.
Mistake types
Treated any positive payout as favorable.
Confused fair with favorable.
Forgot to subtract cost.
Classified based on payout size alone.
Reversed favorable and unfavorable.
Feedback
“A positive payout does not automatically make a game favorable. Compare expected payout with cost. Game A pays $5 but also costs $5, so expected profit is exactly zero and the game is fair.”
Teaching animation
Cards move into buckets.
Profit meter appears after placement.
Fair aligns with zero.
Favorable aligns with the positive side.
Unfavorable aligns with the negative side.

Desktop workspace arrangement
Target viewport: 1280×720
Left region: Three game cards with payout/cost bars
Right region: Buckets + placement area, check
Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
Feedback appears in the right region directly beneath the active input or check action.
Continue appears in the right region after completion.

Mobile workspace arrangement
Cards then buckets
Sticky current-task strip at top of the interaction stack.
Feedback auto-scrolls into view beneath the active input.
No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.

Exact control placement (both layouts)
Current task: top of right region (desktop) / sticky strip (mobile).
Primary input: right region center, adjacent to visual.
Check/submit: directly beneath primary input.
Hint button: beside check action.
Feedback: immediately beneath check action, never at page bottom.
Completion state: inline badge beside current task.

Accessibility behavior
Keyboard focus order: task → visual controls → input → check → feedback → continue.
Live region announces feedback within 100ms of check.
Touch targets ≥ 44px. Graphs include text summary of latest average/state.

Review-mode state
Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.

Restart behavior
Resets interaction state only; preserves completion record and chapter position.

Validation cases
See Appendix — Problem validation matrix for ev-l4-p2.

Lesson 4, Problem 3 — Choose the Better Game After Cost
Stable problem ID: ev-l4-p3
Legacy ID mapping: l4-choose-better-game-after-cost
Instructional role: Independent Fluency Check
Estimated completion time: 2.5 min

Concept
The better game for the player is determined by expected profit rather than expected payout alone.
Scenario
Game A:
expected payout $9
cost $7
Game B:
expected payout $6
cost $3
Pre-problem mini-demo
Highlight payout and cost on each card.
Demonstrate payout − cost.
Reveal a sample profit meter.
Explain that the game with the larger payout is not always the better game.
Visual + interaction
Two game cards.
Payout bars.
Cost bars.
Profit fields.
Profit meters.
Final better-game selector.
Answer and completion rules
Game A expected profit = 2.
Game B expected profit = 3.
Better game = Game B.
Accepted answer formats
For profits:
2, 2.0, $2
3, 3.0, $3
For choice:
Game B
B
Correct deterministic selection
Mistake types
Chose the largest expected payout.
Forgot to subtract cost.
Added cost.
Reversed payout and cost.
Calculated both profits correctly but selected the wrong game.
Feedback
“Game A has the larger expected payout, but it also costs much more. After subtracting cost, Game A gives $2 expected profit and Game B gives $3. Compare the remaining profit, not only the payout.”

Desktop workspace arrangement
Target viewport: 1280×720
Left region: Two game cards + profit meters
Right region: Profit fields optional, game selector, check
Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
Feedback appears in the right region directly beneath the active input or check action.
Continue appears in the right region after completion.

Mobile workspace arrangement
Card stack + selector
Sticky current-task strip at top of the interaction stack.
Feedback auto-scrolls into view beneath the active input.
No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.

Exact control placement (both layouts)
Current task: top of right region (desktop) / sticky strip (mobile).
Primary input: right region center, adjacent to visual.
Check/submit: directly beneath primary input.
Hint button: beside check action.
Feedback: immediately beneath check action, never at page bottom.
Completion state: inline badge beside current task.

Accessibility behavior
Keyboard focus order: task → visual controls → input → check → feedback → continue.
Live region announces feedback within 100ms of check.
Touch targets ≥ 44px. Graphs include text summary of latest average/state.

Review-mode state
Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.

Restart behavior
Resets interaction state only; preserves completion record and chapter position.

Validation cases
See Appendix — Problem validation matrix for ev-l4-p3.

MVP only: five lessons, 15 problems. No AI in MVP.

Midpoint - MVP PRD Page 7
Lesson 5 of 5: Same EV, Different Risk, and Full EV Models
Estimated lesson time: ~9 min target with step compression (~8 min achievable).

Lesson 5 progression (three distinct roles — no duplicate scenarios)
| Problem | Role | Skill |
|---------|------|-------|
| P1 Carnival Booth Preview | Fun intro | Qualitative: same $5 average, different feel (steady vs jumpy) — no EV calculation |
| P2 Wider Spread, Same Average | Guided transfer | New payouts ($6 vs $12/$0): compute both EVs, confirm equality, identify wider spread = more risk |
| P3 Final Carnival Decision | Capstone | Full probability table, payout, cost, profit, fairness, risk interpretation |

Cohesion note: L5P1 and L5P2 must not reuse the same game numbers. P1 uses $5 / $10-$0 for intuitive discovery; P2 uses $6 / $12-$0 so the learner transfers the risk idea and calculates EV before the capstone.

Lesson 5, Problem 1 — Carnival Booth Preview
Stable problem ID: ev-l5-p1
Legacy ID mapping: problem-7 / l5-build-whole-ev-model (content revised; storage ID preserved)
Instructional role: Interactive Concept Introduction — fun mini-game (NOT the capstone)
Estimated completion time: 3 min

Concept
Expected value summarizes long-run average payoff, but two games with similar averages can feel very different to play.
Scenario
Two neighboring carnival booths:
**Booth A — Steady Coins:** always pays exactly $5 (animated coin drops every round).
**Booth B — Mystery Spin:** 50% pays $10, 50% pays $0 (animated wheel bounce).
Learner runs a 5-round preview on each booth, watches average meters, answers two quick questions. No full probability table required.

Source pattern
OpenStax spread / qualitative risk before formal SD; introductory "same mean different experience" discussions.
Selected over: full 10-section wheel table (duplicates capstone; worksheet feel).
Adapted as: playful side-by-side booth preview.

Exact data
Booth A: always $5 → average $5.
Booth B: 50% $10, 50% $0 → average $5.
Questions: (1) Do they feel the same? → No. (2) Same average payout? → Yes ($5).

Pre-problem mini-demo
Watch one coin drop at Booth A. Watch one wheel spin at Booth B. Compare jumpiness.

Visual + interaction
Two booth cards side-by-side with "Run 5 rounds" buttons.
Each shows outcome animation strip + running-average mini-meter.
MC Q1: same feel? (No)
MC Q2: same average? (Yes / $5)

Completion rules
Run both previews (5 rounds each); answer both MC correctly.

Mistake types
claimed-different-average | claimed-same-feel | confused-single-round-with-ev

Feedback
"Both booths average $5 per round, but Booth B jumps between $0 and $10 while Booth A is steady — same average, different experience."

Fun animation and interaction
Core feeling: "Two choices can look different even when their averages match."
Tactile: tap Run 5 rounds on each booth; no table building.
Objects: coin chute vs spinning wheel; dual average meters.

Animations:

1. **Booth A coin drop:** five coins drop vertically at fixed $5 height (120ms stagger) — flat line draws on meter.
2. **Booth B wheel:** wheel spins with bounce (600ms); outcome jumps meter up/down — jagged line.
3. **Meter compare:** after both runs, meters align at $5 with dashed tie line while outcome strips stay different (400ms).
4. **Feel question highlight:** Booth B strip flashes variable range band (green $10 to gray $0).
5. **Completion:** both meters pulse green on correct Q2; Continue in workspace.

Reduced-motion: outcomes list instantly; meters update without spin/bounce.

Why animation teaches: EV matches but **outcome paths** differ — qualitative hook only; L5P2 transfers with new numbers and requires EV calculation.

Desktop workspace: left = both booths + meters; right = MC questions, check, feedback (1280×720).
Mobile: booths stack; meters side-by-side; sticky task.

Accessibility
Live region after previews: "Both booths average five dollars. Booth A always five. Booth B alternates zero and ten."

Validation cases

- both previews required before MC enabled
- Q1=No, Q2=Yes required
- does NOT require probability table, cost, or fairness fields (reserved for L5P3 capstone)
- legacy problem-7 completion maps here; capstone skills assessed in ev-l5-p3

Lesson 5, Problem 2 — Wider Spread, Same Average
Stable problem ID: ev-l5-p2
Legacy ID mapping: problem-8 / l5-same-ev-different-risk
Instructional role: Guided Application — transfer (new numbers, EV calculation required)
Estimated completion time: 2.5 min

Concept
Expected value does not describe the full experience of uncertainty. Two games can share the same EV while having different risk (outcome spread).

Scenario
**Game A — Sure Six:** 100% chance of $6 (guaranteed payout every round).
**Game B — Double or Nothing:** 50% chance of $12, 50% chance of $0.
Learner runs simulations, **computes or confirms both EVs**, enters them, and selects which game is riskier. This is a transfer from L5P1’s qualitative preview — new payouts, explicit EV work, wider spread ($0–$12 vs fixed $6).

Source pattern
OpenStax / standard “same mean, different spread” exercises; prior PRD l5-low-risk-vs-high-risk pattern ($6 guaranteed vs $12/$0) — selected over repeating L5P1’s $5/$10/$0 numbers.
Selected over: 80%/$6 + 20%/$1 vs 50%/$10/$0 (same EV $5 but less clean spread comparison).

Exact data
Game A: P($6) = 1 → EV(A) = **$6**.
Game B: P($12) = 0.5, P($0) = 0.5 → EV(B) = 12×0.5 + 0×0.5 = **$6**.
Riskier game: **Game B** (outcomes range $0–$12; Game A has zero spread).

Pre-problem mini-demo
Show Game A’s flat bar at $6. Show Game B’s split bar ($12 / $0). Explain that equal averages can hide different spreads. Demonstrate one simulation batch on each.

Visual + interaction
Game A card: solid bar at $6.
Game B card: split bar $12 | $0 with 50/50 labels.
Run 20 trials buttons per game.
Outcome dot plots or strip charts.
Running-average graphs (both approach $6).
EV input fields for Game A and Game B.
Risk selector: Game A / Game B.
Explanation MC: variable outcomes / wider spread / can be 0 or 12.

Current-task checklist
Run Game A simulation → Run Game B simulation → Enter both EVs → Select riskier game → Select explanation.

Answer and completion rules
Run both simulations (20 trials each).
Submit EV(A) = 6 and EV(B) = 6.
Select Game B as riskier.
Select approved explanation (variable outcomes or wider spread).

Accepted answer formats
EV fields: 6, 6.0, $6, $6.00
Risk: Game B, B
Explanation MC: variable outcomes | wider spread | can be 0 or 12 | same EV different risk

Correct model
EV(A) = 6
EV(B) = 12 × 0.5 + 0 × 0.5 = 6

Mistake types
claimed-game-b-has-higher-ev | claimed-games-identical | confused-average-with-guaranteed | selected-game-a-as-riskier | ev-arithmetic-error

Wrong-answer feedback examples
"You picked Game B because it can pay $12 — but $12 happens only half the time. Compute 12 × 0.5 + 0 × 0.5 = $6, the same as Game A."
"You said the games are identical — they share the same EV, but Game B’s outcomes spread from $0 to $12 while Game A always pays $6."

Correct-answer feedback
"Correct — both average $6, but Game B is riskier because its outcomes vary from $0 to $12 while Game A guarantees $6 every time."

Hint sequence
H1: Game A never moves off $6; watch Game B’s outcome strip jump (visual: plots).
H2: Compute Game B: 12 × 0.5 + 0 × 0.5.
H3: Same average, wider spread → more risk → Game B.

Teaching animation
Game A flat line; Game B jagged outcomes; both running averages converge to $6; spread band highlights $0–$12 on Game B only.
Reduced-motion: instant outcome lists; averages update without motion.

Desktop workspace arrangement
Target viewport: 1280×720
Left region: Game A flat bar + Game B split bar, outcome plots, running-average graphs
Right region: Sim buttons, EV inputs, risk selector, explanation MC, check, feedback

Mobile workspace arrangement
Compact dual-game strip → plots → inputs → check; sticky task strip.

Accessibility
Live region: "Game A always six dollars. Game B averages six dollars with outcomes from zero to twelve."

Validation cases
- both simulations required before EV check
- EV(A)=6 and EV(B)=6 required; 5 or 12 alone fail ev-arithmetic-error
- risk must be Game B
- distinct from L5P1: checker rejects if scenario data matches L5P1 booth payouts
- legacy problem-8 completion maps here

Review-mode state
Saved EV entries, risk choice, graph summaries.

Restart behavior
Resets sims, inputs, feedback; preserves completion record.

Lesson 5, Problem 3 — Final Carnival Decision
Stable problem ID: ev-l5-p3
Legacy ID mapping: l5-final-capstone-ev-decision
Instructional role: Independent Fluency Check — Chapter Capstone
Estimated completion time: 3.5 min

Concept
Build a complete EV model and use payout, cost, fairness, and risk together.
Scenario
A carnival wheel has 12 equal sections:
1 section pays $36
3 sections pay $12
8 sections pay $0
cost to play = $6
Pre-problem mini-demo
Group equal wheel sections by payout.
Convert each count into probability using 12 total sections.
Calculate each row’s contribution.
Add contributions for expected payout.
Subtract cost, classify the game, and interpret risk.
Visual + interaction
Twelve-section wheel.
Tap sections to group by payout.
Full table:
Outcome | Probability | Contribution
Expected payout field.
Cost block.
Expected profit field.
Fairness number line.
Decision selector.
Risk explanation selector.
Answer and completion rules
Probabilities:
$36 → 1/12
$12 → 3/12 or 1/4
$0 → 8/12 or 2/3
Contributions:
36 × 1/12 = 3
12 × 3/12 = 3
0 × 8/12 = 0
Expected payout:
6
Cost:
6
Expected profit:
0
Decision:
Fair
Risk explanation:
The game is fair in expected-profit terms but individual outcomes remain variable; a player may receive $0, $12, or $36 on one play.
Accepted probability formats
For 1/12:
1/12
0.0833
0.083
For 3/12:
3/12
1/4
0.25
25%
For 8/12:
8/12
2/3
0.6667
0.667
Mistake types
Wrong denominator.
Used counts without converting to probabilities.
Omitted the $0 outcome.
Arithmetic error.
Calculated payout but not profit.
Marked the game favorable because payout is positive.
Confused expected value with a guaranteed result.
Believed a fair game has no risk.
Feedback
“The expected payout is $6 and the cost is also $6, so expected profit is zero and the game is fair. Fairness describes the long-run average for the player; it does not mean every play returns the entry cost.”

Desktop workspace arrangement
Target viewport: 1280×720 — capstone uses stepped checklist to avoid scroll
Left region: 12-section wheel + full table
Right region: Sequential checklist fields + decision/risk MC
Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
Feedback appears in the right region directly beneath the active input or check action.
Continue appears in the right region after completion.

Mobile workspace arrangement
One checklist step per screen segment on narrow mobile
Sticky current-task strip at top of the interaction stack.
Feedback auto-scrolls into view beneath the active input.
No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.

Exact control placement (both layouts)
Current task: top of right region (desktop) / sticky strip (mobile).
Primary input: right region center, adjacent to visual.
Check/submit: directly beneath primary input.
Hint button: beside check action.
Feedback: immediately beneath check action, never at page bottom.
Completion state: inline badge beside current task.

Accessibility behavior
Keyboard focus order: task → visual controls → input → check → feedback → continue.
Live region announces feedback within 100ms of check.
Touch targets ≥ 44px. Graphs include text summary of latest average/state.

Review-mode state
Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.

Restart behavior
Resets interaction state only; preserves completion record and chapter position.

Validation cases
See Appendix — Problem validation matrix for ev-l5-p3.

MVP only: five lessons, 15 problems. No AI in MVP.

Midpoint - MVP PRD Page 8
Cross-Problem Learning, Demonstration, Feedback, and Answer Rules

Pre-problem mini-demo system
Unchanged in spirit: first visit shows demo; Show demo again available; demo does not count as attempt.

Current-task panel and step checklist
Rendered in the right region (desktop) or sticky strip (mobile) — never separated from active inputs by the visual, and always visible in the no-scroll workspace for the current step.

Step navigation (Next/Previous)
Multi-step problems present compact step panels with explicit Next and Previous controls in a consistent location (bottom of the right region on desktop; bottom action bar on mobile). Next advances (gated by the step's completion rule where one exists); Previous returns without discarding completed-step work. Step navigation is presentation only and does not change validation, curriculum, or problem math; Continue (below) still moves to the next problem.

Learning Coach feedback panel — revised placement
Desktop/tablet: right region directly beneath the active input/check, in the same panel as the attempted action — not upper-right distant from controls.
Mobile: immediately beneath the input that was checked, in the same panel; auto-scroll into viewport (no return to page top).
Wrong feedback: what happened / why wrong / next action (3–5 sentences).
Correct feedback: 1–2 sentences + Continue in same workspace.

Flexible deterministic answer normalization
Unchanged: money, probability, classification rules as prior PRD.

Direct correction, attempt rules, hints, animations, accessibility
Unchanged except all interactions must satisfy tap-to-place and the single no-scroll workspace rules above (visual, prompt, input, feedback, hint, Next/Previous, completion together; oversized content split into Next/Previous step panels rather than page scroll).

MVP only: five lessons, 15 problems. No AI in MVP.

Midpoint - MVP PRD Page 9
Completed-Problem Review, Restart, Progress, and Home Pathway

Completed-problem behavior, Review Mode, Restart — unchanged except totals below.

Overall progression rule — unchanged logic, 15-problem scale.

Completion percentage
Chapter: completed unique canonical problems ÷ 15 × 100
Lesson: completed in lesson ÷ 3 × 100

Continue behavior
Routes to first incomplete among 15 ordered problems (globalProblemIndex 0..14).

Home-page layout — unchanged structure.

Golf-course progression metaphor — revised counts
5 lesson zones
3 problem holes per zone
15 total holes
Final hole (ev-l5-p3) receives capstone visual emphasis

MVP only: five lessons, 15 problems. No AI in MVP.

Midpoint - MVP PRD Page 10
Tech Stack, Data Schema, and Mastery

Tech stack — unchanged.

Data schema — unchanged document shapes; globalProblemIndex now 0..14; PROBLEMS_PER_LESSON = 3. The fields below are presentation-only layout hints; they do not affect validation, progress, curriculum, problem math, or stored learner progress.

Problem JSON object — add fields where needed:
desktopWorkspaceLayout
mobileWorkspaceLayout
stepPanels (presentation-only: ordered compact no-scroll step panels for a problem; each panel lists which of visual/prompt/input/feedback/hint it shows)
stepNavigation (presentation-only: enables Next/Previous between stepPanels; does not alter validation or completion logic)
legacyProblemId
canonicalSlug (ev-l1-p1 … ev-l5-p3)

Problem ID compatibility
Preserve problem-1 … problem-8 storage IDs.
New canonical slugs ev-l{N}-p{M} with legacyProblemId mapping table in Page 2.
Removed slug completion maps to successor per migration table.

Mastery rule — revised
Learner masters the chapter if:
all 15 problems complete
final capstone (ev-l5-p3) correct
learner distinguishes payout vs profit (ev-l4-p1) and equal EV vs risk (ev-l5-p2)
at least 11 of 15 problems completed in ≤2 graded attempts
required mastery tags demonstrated
Post-completion practice restarts do not reduce mastery.

Mastery states and milestones — update counts to 15-problem chapter; keep Lesson 1–4 completed milestones; "All simulations" applies to L1 problems.

Security rules — unchanged.

MVP only: five lessons, 15 problems. No AI in MVP.

Midpoint - MVP PRD Page 11
Appendix — Build Order, Validation, and Release Testing

Revised build order

1. Preserve stable app (auth, progress, original eight problems).
2. Completed-problem review and restart.
3. Learning Coach + single no-scroll ProblemLayout: compact two-region workspace with visual, prompt, input, feedback, hint, Next/Previous step controls, and completion state together (UX binding — no scrolling during a problem; oversized content split into Next/Previous step panels).
4. Migrate chapter model to 5×3 = 15 problems with legacy mapping.
5. Implement/revise 15 problems per specs (batch by lesson).
6. Persistence migration: 20→15 resolver, mastery 11/15, golf map 15 holes.
7. Home/pathway visual pass (15 holes).
8. Accessibility/mobile pass (tap-to-place, sticky task, feedback viewport).
9. Deploy and test.

Automated validation — update to 15 problems.
Progress tests: 15-problem percentage, 3 per lesson, mastery 11/15.

Manual MVP testing scenario — verify compact workspace on Lesson 1 Dice Toss Average (drag-throw, graph, feedback inline). Validate all five P1 fun interactions at 1280×720 and mobile sticky layout.

No-scroll workspace acceptance checks (every problem, every step) — at desktop 1280×720 (min 1024×640) and a representative mobile size (≤390px wide):
- Active step shows visual, prompt, input, feedback, hint access, Next/Previous controls, and completion state without page scrolling.
- Feedback after a check appears in the same panel as the attempted action (no scroll up to see the visual, no scroll down to read the result).
- Where a problem is segmented, Next/Previous move between step panels; Previous preserves completed-step work; navigation does not change validation, curriculum, or math.
- No horizontal scrolling; touch targets ≥44px; tap alternatives work for all drag interactions.

Appendix — Problem validation matrix (summary)
For each ev-l{N}-p{M}: checker tests for accepted formats, mistake types, completion guards, single no-scroll workspace contains visual + prompt + input + feedback + hint + Next/Previous + completion state without page scroll at 1280×720 and at a representative mobile size, with feedback in the same panel as the attempted action and any oversized content split into Next/Previous step panels.
P1 additional validation: manual-throw gate (L1P1), board-before-formula gate (L2P1), all-boxes-open gate (L3P1), cost-before-profit gate (L4P1), both-preview gate (L5P1); reduced-motion paths produce identical deterministic outcomes.

MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 15 problems. No AI in MVP.