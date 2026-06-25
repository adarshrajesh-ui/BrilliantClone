--- docs/prompt-first/2026-06-24-sync-15-problems-ux/prd-before.md	2026-06-24 12:49:05
+++ prd.md	2026-06-24 13:07:30
@@ -1,26 +1,44 @@
 Expected Value Lab - MVP PRD Page 1
 PRD
 Expected Value Lab: A learn-by-doing MVP for one introductory probability chapter
+
+This PRD edit is planning/spec only. No application code was changed.
+
 MVP
 The MVP is a login-based web app that teaches one chapter:
 Expected Value — The Average Outcome of Uncertainty
-The chapter contains 5 lessons and 20 visual, interactive problems. The learner progresses from observing repeated simulations to independently building an expected value model, accounting for costs, judging fairness, and comparing games with the same expected value but different risk.
+The chapter contains 5 lessons and 15 visual, interactive problems. The learner progresses from observing repeated simulations to independently building an expected value model, accounting for costs, judging fairness, and comparing games with the same expected value but different risk.
 The app teaches without AI. All problems, onboarding demonstrations, hints, answer checks, mistake classifications, and feedback are hand-built and deterministic.
+
 Chapter structure
 Lesson 1 — Expected Value as a Long-Run Average
 Lesson 2 — Expected Value as a Weighted Average
 Lesson 3 — Counts, Tables, and Discrete Outcomes
 Lesson 4 — Expected Payout, Expected Profit, and Fairness
 Lesson 5 — Same EV, Different Risk, and Full EV Models
-Each lesson contains 4 problems, for a total of 20 problems.
+Each lesson contains 3 problems, for a total of 15 problems.
+
+Lesson timing targets
+| Lesson | P1 | P2 | P3 | Total | Justification |
+|--------|----|----|-----|-------|-----------------|
+| 1 | 2.5 min | 2.5 min | 2.5 min | ~7.5 min | Discovery draw + one weighted sim + comparison choice; minimal reading |
+| 2 | 2.5 min | 2.5 min | 3 min | ~8 min | Formula placement + matching + diagnose; tight tables |
+| 3 | 3 min | 2.5 min | 3 min | ~8.5 min | Reveal/table fill is slightly heavier; still within cap with collapsible help |
+| 4 | 2.5 min | 2.5 min | 2.5 min | ~7.5 min | Balance-scale + bucket sort + two-card profit compare |
+| 5 | 3 min | 2.5 min | 3.5 min | ~9 min | Capstone is dense; tension documented below — split into stepped table rows to stay near 8 min |
+
+Lesson 3 tension: building a full count→probability→contribution table in one problem approaches the eight-minute ceiling. Mitigation: pre-grouped tokens, inline row validation, and collapsible formula reference keep the assessment responsible without trivializing the skill.
+
+Lesson 5 tension: the capstone combines probabilities, payout, cost, profit, fairness, and risk interpretation. Mitigation: sequential checklist with one active row at a time; risk is a single multiple-choice line, not an essay.
+
 What is in scope for MVP vs what is NOT
 In scope for MVP
 Google sign-in, user profile creation, and saved progress per user.
 One expected value chapter divided into 5 lessons.
-20 interactive, visual problems.
+15 interactive, visual problems.
 Visual-first learning using:
-spinners
-wheels
+chip bags and token draws
+spinners and wheels
 mystery boxes
 prize tokens
 probability tables
@@ -31,21 +49,20 @@
 fairness number lines
 running-average graphs
 risk comparison graphs
+Compact two-region problem workspaces (visual + controls/feedback) on desktop and tablet.
+Mobile layouts that avoid scroll-chasing between visual, input, and feedback.
 A short, visual mini-demo before each problem or before a newly introduced interaction type.
-A reusable “Show demo again” option.
+A reusable "Show demo again" option.
 A clear current-task panel and step checklist on each problem.
 Instant deterministic answer checking with visible feedback under 100ms.
 Flexible acceptance of mathematically equivalent correct formats.
 Direct correction after a wrong answer without resetting unrelated work.
-Learning-oriented feedback that explains:
-what happened
-why the reasoning was incorrect
-what the learner should do next
-Feedback displayed near the active work area rather than buried at the bottom.
+Learning-oriented feedback that explains what happened, why the reasoning was incorrect, and what to do next.
+Feedback displayed beside the active control, never buried at the bottom of a long page.
 Hand-written visual hints.
 Teaching-focused animations.
 Completed-problem review mode.
-Explicit “Restart This Problem” practice mode.
+Explicit "Restart This Problem" practice mode.
 Completion percentage, graded attempts, hints used, mistake type, mastery state, streak, and milestones.
 Lesson-level and chapter-level progress.
 A home-page current-chapter panel using an original golf-course progression metaphor.
@@ -54,158 +71,318 @@
 Every drag/drop-style interaction must also support tap-to-select and tap-to-place.
 On mobile, tapping is the default interaction; drag/drop is optional polish.
 A deployed public web app using React and Firebase.
+
 Explicitly NOT in scope for MVP
-No AI tutor.
-No AI hints.
-No AI-generated feedback.
-No AI-generated problems.
+No AI tutor, hints, feedback, or generated problems.
 No model calls or semantic model matching.
-No additional complete chapters.
-No full probability course.
+No additional complete chapters or full probability course.
 No videos or long readings.
-No payments.
-No leaderboards.
-No teacher dashboards.
-No classroom-management tools.
-No social features.
+No payments, leaderboards, teacher dashboards, classroom tools, or social features.
 No mobile app-store release.
 No advanced probability theory.
 No dependency on drag/drop for correctness.
 No copied Topgolf logos, branding, artwork, or proprietary assets.
-No requirement for Figma at runtime. Figma may be used only as a design reference.
+No requirement for Figma at runtime.
+
 User persona
-Primary learner
-An introductory probability or statistics student who has seen expected value formulas but does not understand what the quantities mean.
-They need visual setups that clarify:
-outcomes
-probabilities
-counts
-contributions
-expected payout
-cost
-expected profit
-fairness
-risk
-Secondary learner
-A visual math learner who struggles when math is presented only through notation and needs to manipulate examples before formulas become intuitive.
+Primary learner: introductory probability student who has seen EV formulas but lacks intuition for outcomes, probabilities, counts, contributions, payout, cost, profit, fairness, and risk.
+Secondary learner: visual math learner who needs manipulation before notation.
+
 Domain
-Domain: introductory probability.
-Specific subject: expected value.
-Chapter goal: make expected value intuitive as:
-a long-run average
-a weighted average
-a decision-making tool under uncertainty
-a measure that does not fully describe risk
-Use stories: focused and not focused
-Focus stories
-Sign in and resume.
-View the current chapter and course progress.
-Start or continue the next unfinished problem.
-Open a short mini-demo before using an unfamiliar visual or interaction.
-Interact with visual probability setups.
-Understand what to tap or enter before beginning.
-Get immediate, specific feedback near the active problem area.
-Correct an answer directly without restarting the problem.
-Use visual hints.
-Complete a problem.
-Return later and review the completed solution.
-Explicitly restart one completed problem for practice.
-Keep overall chapter progress even when reviewing or restarting an earlier problem.
-Complete 5 lessons and 20 problems.
-See completion, mastery, streak, milestones, and suggested review areas.
-Won’t-focus stories
-Ask an AI tutor.
-Browse many courses.
-Create lessons.
-Compete with friends.
-Watch videos.
-Manage classrooms.
-Purchase subscriptions.
-Learn advanced probability topics.
-MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 20 problems. No AI in MVP.
+Introductory probability — expected value as long-run average, weighted average, decision tool, and incomplete risk descriptor.
 
+Focus stories include sign-in/resume, chapter progress, mini-demos, visual interaction, immediate local feedback, direct correction, hints, completion, review, restart without losing forward progress, and completing 5 lessons and 15 problems.
+
+MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 15 problems. No AI in MVP.
+
 Expected Value Lab - MVP PRD Page 2
+Problem-Page UX Requirements
+
+Binding rule: the learner must never repeatedly scroll down to interact and scroll back up to inspect the visual, task, feedback, or result. All information and controls for the current step remain spatially connected.
+
+Interaction-coherence checklist (every problem)
+What am I looking at?
+What can I manipulate?
+What should I do now?
+What changed because of my action?
+Was my reasoning correct?
+What should I do next?
+
+Desktop and tablet layout (≥768px width, landscape tablet included)
+When a problem has both a significant visual and significant interaction, use a compact two-region workspace:
+Left region (~55%): teaching visual, simulation, concrete objects, graph, or scenario state.
+Right region (~45%): current task, checklist, interactive controls, answer fields, check action, hints, feedback, Continue.
+Regions may be reversed when interaction order benefits (e.g., left-to-right reading of a formula built on the right).
+Requirements:
+Visual and control regions visible together in the initial viewport.
+Primary controls beside the visual they affect.
+Feedback beside or directly beneath the active control — not at the bottom of a long page.
+Submit/check visible without return scroll.
+Current-task instruction visible while acting.
+Corrected answers editable in place.
+Results and Continue within the same workspace.
+Secondary information collapsible; must not push the active task out of the working area.
+
+Viewport standard
+Target desktop working viewport: 1280×720 CSS pixels (minimum supported active workspace: 1024×640).
+Essential visible state: problem title, current instruction, required visual, active interaction, check/submit, feedback location, completion state.
+Do not shrink below accessible sizes to avoid scrolling.
+
+Mobile layout (<768px)
+Side-by-side not required. Same no-scroll-chasing principle:
+Compact visual immediately above active controls, OR shortened persistent visual summary while interacting.
+Sticky current-task/action area during input.
+Feedback inserted beside or immediately beneath affected input.
+Collapsible nonessential explanation.
+Segmented steps may each contain visual + input + feedback.
+No horizontal scrolling. Touch targets ≥44px. Tap alternatives for all drag placements.
+Feedback auto-enters viewport; learner never returns to page top to read result.
+
+Educational-app UX benchmark
+Products reviewed (public descriptions and design case studies only — no proprietary assets copied):
+Brilliant.org — unified solvable flow, feedback banner near attempt, multi-try correction, bite-sized steps, progress path.
+Khan Academy exercises — question + workspace proximity, immediate check, hint escalation.
+Numworks fair-games activities — concrete carnival scenarios before notation.
+OpenStax / Berkeley SticiGui — manipulation and long-run language before formulas.
+
+Reusable principles incorporated:
+One focused task at a time.
+Manipulation before notation.
+Immediate local feedback and in-place correction.
+Visual cause-and-effect beside controls.
+Progressive disclosure via checklist steps.
+Compact problem layouts fitting one working viewport.
+Fast correction loops without page reset.
+Clear next action after every check.
+
+Explicit: proprietary Brilliant screens, artwork, lesson text, and branded layouts are not copied. Only general interaction patterns inform this PRD.
+
+Curriculum research summary
+Sources reviewed:
+Math in Society (PCC) — carnival EV, weighted average, fair price (spot.pcc.edu/math/mathinsociety/chap_four_expected_value.html)
+OpenStax Introductory Statistics 2e §4.2 — long-run average, EV table (openstax.org)
+Berkeley SticiGui — box draws, long-run limiting average (stat.berkeley.edu/~stark/SticiGui/Text/expectation.htm)
+SLCC / Open Oregon pressbooks — discrete distributions, EV formula
+LibreTexts Finite Math §9.8 — weighted-average quiz-score analogy
+Numworks Fair Games activity — net gain, fair cost (numworks.com/educators/activities/statistics/fair-games)
+
+Alternative patterns considered:
+Coin-flip streak games (rejected L1 — confuses streak with average).
+Spinner-only intro for every lesson (rejected — overused; L1 uses chip bag).
+Repair-table remediation as lesson assessment (rejected L3 — diagnostic not fluency).
+Separate low-risk vs high-risk duplicate (rejected L5 — merged into capstone risk MC).
+Find-fair-price slider problem (rejected L4 — redundant with classify + compare).
+
+Patterns selected:
+Berkeley box/chip draws → L1P1 long-run average.
+Unequal wheel sections → L1P2 weighted frequency.
+Dual-game comparison → L1P3 fluency.
+LibreTexts weighted average → L2P1 formula build.
+OpenStax outcome–probability pairing → L2P2 matching.
+Model completeness diagnosis → L2P3 fluency.
+PCC count-based carnival → L3P1 mystery boxes.
+Contribution summation table → L3P2 guided.
+Full table from counts → L3P3 fluency.
+Open Oregon payout−cost → L4P1 profit.
+Numworks fair/unfair buckets → L4P2 classify.
+Two-game profit compare → L4P3 fluency.
+Carnival wheel full model → L5P1 intro.
+Guaranteed vs variable same-EV → L5P2 risk intuition.
+12-section capstone → L5P3 chapter capstone.
+
+Cohesion decisions:
+Each lesson follows Intro (visual/concrete) → Guided (scaffolded structure) → Fluency (transfer, less scaffolding).
+Removed one problem per lesson that duplicated the fluency skill or was remedial rather than assessable.
+Short-run sampling nuance folded into L1P1 hints and L1P2 simulation copy rather than a standalone problem.
+
+Remaining evidence gaps:
+Risk is introduced qualitatively (spread/variability) without standard deviation calculation — appropriate for MVP scope.
+
+Legacy ID and progress compatibility
+The chapter shrinks from 20 to 15 problems. Storage IDs for the original eight implemented problems (problem-1 … problem-8) are preserved. Canonical slugs renamed to ev-l{N}-p{M} pattern; legacy slugs remain in legacyProblemId field.
+
+Implemented behavior audit (pre-sync codebase):
+| Legacy chapter # | Storage ID | Component / pack | Behavior summary |
+|------------------|------------|------------------|------------------|
+| 1 | problem-1 | Problem1LongRunAverage | Playground phase (configurable spinner) then official 50/50 $10/$0 sim, predict $5 |
+| 5 | problem-2 | pack-a l2-build-weighted-average | Tap-to-place EV formula for 25%/75% spinner |
+| 9 | problem-3 | pack-a l3-mystery-box-outcomes | Six mystery boxes, count/probability table |
+| 10 | problem-4 | pack-a l3-calculate-ev-from-table | Contribution rows → EV $4 |
+| 13 | problem-5 | Problem5PayoutVsProfit | Playground balance scale then payout−cost profit $1 |
+| 14 | problem-6 | Problem6FairnessSort | Sort games into fair/favorable/unfavorable buckets |
+| 17 | problem-7 | Problem7WholeEVModel | Ten-section wheel, full EV table + fairness |
+| 18 | problem-8 | Problem8SameEVDifferentRisk | Guaranteed $5 vs 50/50 $10/$0, risk compare |
+
+Removed problems — progress resolution (completion of legacy slug counts as completion of mapped successor):
+| Removed slug | Was lesson slot | Maps to | Rationale |
+|--------------|-----------------|---------|-----------|
+| l1-short-run-vs-long-run | L1 P3 | ev-l1-p2 | Sampling noise taught via L1P2 sim copy |
+| l2-fill-missing-formula | L2 P3 | ev-l2-p3 | Formula fluency covered by diagnose |
+| l3-repair-probability-table | L3 P3 | ev-l3-p3 | Table repair subsumed by full build |
+| l4-find-fair-price | L4 P3 | ev-l4-p3 | Fair price logic in compare + capstone |
+| l5-low-risk-vs-high-risk | L5 P3 | ev-l5-p3 | Risk compare merged into capstone MC |
+
+Migration rules:
+completedProblemIds retains historical storage IDs; resolver maps legacy slugs to new canonical slugs.
+If a removed slug is present in completedProblemIds, treat mapped successor as complete for progression and percentage.
+Content reuse ≠ ID reuse: problem-1 storage ID now maps to ev-l1-p1 (chip bag target spec); learner progress on problem-1 preserved.
+highestSequentialCompletedGlobalIndex recomputed on 0..14 scale.
+Chapter completion: completed unique canonical problems ÷ 15 × 100.
+Lesson completion: completed in lesson ÷ 3 × 100.
+Mastery threshold: 11 of 15 problems (≈75%) completed in ≤2 graded attempts, plus capstone and tag requirements unchanged in spirit.
+
+Curriculum cohesion matrix
+| ID | Concept | Prior knowledge | New representation | Math demand | Scaffold | Misconceptions | Predecessor link | Successor prep | Source | Time | Distinct evidence |
+|----|---------|-----------------|-------------------|-------------|----------|----------------|------------------|----------------|--------|------|-------------------|
+| ev-l1-p1 | Long-run average | Basic probability | Chip bag + running avg graph | Mean of two outcomes | High | Single outcome = EV | — | Weighted sections | Berkeley box | 2.5m | Sim evidence |
+| ev-l1-p2 | Weighted long-run | L1P1 | Unequal spinner | Weighted mean | Med | Ignore probability | L1P1 | Compare games | OpenStax | 2.5m | 25/75 sim |
+| ev-l1-p3 | Compare EV | L1P1-2 | Dual spinner cards | Equality of EV | Low | Max payout / freq | L1P2 | L2 formula | PCC carnival | 2.5m | Fluency |
+| ev-l2-p1 | Weighted average | L1 | Formula builder | Σ x p | High | Swap outcome/prob | L1P3 | Matching | LibreTexts | 2.5m | Build model |
+| ev-l2-p2 | Outcome-prob pairs | L2P1 | Match columns | Three pairs | Med | Rank by size | L2P1 | Diagnose | OpenStax table | 2.5m | Pairing |
+| ev-l2-p3 | Complete model | L2P1-2 | Formula checklist | Diagnose errors | Low | Omit zero term | L2P2 | L3 counts | SticiGui | 3m | Fluency |
+| ev-l3-p1 | Counts→prob | L2 | Mystery boxes | 1/6, 2/6, 3/6 | High | Count as prob | L2P3 | Contributions | PCC | 3m | Table rows |
+| ev-l3-p2 | Contributions | L3P1 | EV table | Row products | Med | Unweighted sum | L3P1 | Full table | OpenStax | 2.5m | Sum EV |
+| ev-l3-p3 | Full table | L3P1-2 | Token bag 10 | All columns | Low | Wrong denom | L3P2 | L4 cost | Numworks | 3m | Fluency |
+| ev-l4-p1 | Payout vs profit | L3 | Balance scale | Subtract cost | High | Answer payout | L3P3 | Classify | Open Oregon | 2.5m | Profit $1 |
+| ev-l4-p2 | Fairness class | L4P1 | Three buckets | Sign of profit | Med | Payout size | L4P1 | Compare | Numworks | 2.5m | Classify |
+| ev-l4-p3 | Compare profit | L4P1-2 | Two game cards | Max profit | Low | Max payout | L4P2 | L5 model | Math in Society | 2.5m | Fluency |
+| ev-l5-p1 | Full EV model | L4 | Carnival wheel 10 | All fields | High | Payout≠profit | L4P3 | Risk | PCC wheel | 3m | Build |
+| ev-l5-p2 | Same EV, risk | L5P1 | Flat vs jump sim | Qualitative risk | Med | EV=risk | L5P1 | Capstone | OpenStax spread | 2.5m | Variability |
+| ev-l5-p3 | Capstone | All | 12-section wheel | Full decision | Low | Fair=no risk | L5P2 | — | Numworks+carnival | 3.5m | Chapter mastery |
+
+References
+- Math in Society (Expected Value): https://spot.pcc.edu/math/mathinsociety/chap_four_expected_value.html
+- OpenStax Introductory Statistics 2e §4.2: https://openstax.org/books/introductory-statistics-2e/pages/4-2-mean-or-expected-value-and-standard-deviation
+- Berkeley SticiGui (Expectation): https://www.stat.berkeley.edu/~stark/SticiGui/Text/expectation.htm
+- SLCC Discrete EV: https://slcc.pressbooks.pub/engr2550textbook/chapter/4-3-expected-value-and-standard-deviation-for-a-discrete-probability-distribution/
+- LibreTexts Expected Value §9.8: https://math.libretexts.org/Courses/SUNY_Geneseo/Math_113%3A_Finite_Math_for_Society/09%3A_Probability/9.08%3A_Expected_Value
+- Open Oregon Expected Value: https://openoregon.pressbooks.pub/math/chapter/expected-value/
+- Numworks Fair Games: https://www.numworks.com/educators/activities/statistics/fair-games/
+
+MVP Problem Specs — 15 problems follow on subsequent pages.
+
+Expected Value Lab - MVP PRD Page 3
 MVP Problem Specs
-Five PRD pages are dedicated to exact lesson and problem behavior.
 Lesson 1 of 5: Expected Value as a Long-Run Average
 Lesson goal: understand expected value as the average result over many repetitions rather than the result of one trial.
+Estimated lesson time: ~7.5 minutes (P1 2.5 + P2 2.5 + P3 2.5).
 
-Lesson 1, Problem 1 — The Long-Run Average
+
+Lesson 1, Problem 1 — Carnival Chip Bag
+Stable problem ID: ev-l1-p1
+Legacy ID mapping: problem-1 (content evolved from spinner playground; storage ID preserved)
+Instructional role: Interactive Concept Introduction
+Estimated completion time: 2.5 min
+
 Concept
 Expected value is the average outcome over many repetitions.
 Scenario
-Bob plays a spinner game with two equal sections:
-win $10
-win $0
-Pre-problem mini-demo
-The mini-demo contains four steps:
-Highlight the two equal spinner sections and explain that both outcomes are equally likely.
-Point to Spin Once, Spin 10, and Spin 100 and explain what each button does.
-Highlight total winnings, number of spins, and average per spin.
-Highlight the running-average graph and explain that it shows how the average changes over time.
-The demo ends with:
-“Predict where the average settles, then run at least 100 spins.”
-Buttons:
-Back
-Next
-Skip demo
-Start Problem
-The demo does not count as an attempt, hint, or completed action.
-Visual + interaction
-Spinner split 50/50.
-One half labeled $10.
-One half labeled $0.
-Counters for:
-spins
-total winnings
-average per spin
-Running-average line graph.
-Horizontal reference line at $5.
-Buttons:
-Spin Once
-Spin 10
-Spin 100
-Learner predicts the long-run average before running many spins.
+A carnival booth has a bag of 10 chips: 5 show $0 and 5 show $10. The learner draws one chip at a time with replacement, stacks winnings, and watches the running average per draw.
+
+Source-grounded problem pattern
+Berkeley SticiGui "draw tickets from a box" long-run average; OpenStax emphasis on repeated trials approaching μ.
+Selected over: plain 50/50 spinner (too generic per product bar); coin flips (streak confusion).
+Adapted as: tactile chip bag with color-coded stacks and running-average graph.
+Position: strongest concrete introduction before probability-weighted sections in L1P2.
+
+Exact data
+Outcomes: $10 (5 chips), $0 (5 chips). Total draws required: ≥100. Correct long-run average: $5.
+
+Pre-problem mini-demo (4 steps)
+1. Highlight five $0 and five $10 chips in the bag.
+2. Demonstrate Draw 1 / Draw 10 / Draw 100.
+3. Point to total winnings, draw count, average per draw.
+4. Highlight running-average graph and $5 reference line.
+CTA: "Predict where the average settles, then draw at least 100 times."
+Buttons: Back, Next, Skip demo, Start Problem.
+
+Visual state
+Bag graphic with 10 visible chips; draw area; chip stack by outcome color; counters; running-average graph; horizontal reference at $5.
+
+Interactive controls
+Draw 1, Draw 10, Draw 100; prediction selector ($0, $5, $10); final average input; Check.
+
 Current-task checklist
-Submit a prediction.
-Run at least 100 total spins.
-Identify the long-run average.
-Complete the problem.
+Submit a prediction → Run ≥100 draws → Identify long-run average $5 → Complete.
+
+Required learner actions
+Submit prediction; run ≥100 total draws; submit $5 as long-run average.
+
 Answer and completion rules
-Completion requires a submitted prediction.
-Completion requires at least 100 total simulated spins.
-Completion requires identifying $5 as the long-run average.
-Prediction choices may remain $0, $5, and $10.
+Completion requires prediction submitted, ≥100 draws, correct average $5.
 Normalized correct value = 5.
+
 Accepted answer formats
-5
-5.0
-5.00
-$5
-$5.00
-5 dollars
-5 per spin
-Mistake types
-Chose an extreme outcome.
-Confused a single spin result with a long-run average.
-Assumed the latest observed average must equal the theoretical EV.
-Selected the largest possible payout.
-Feedback
-Example wrong feedback:
-“You chose one possible result, but expected value is not the outcome of one spin. It is the average over many spins. Since $0 and $10 are equally likely, look for the midpoint between them.”
-Next action:
-“Run 100 spins and watch where the average line begins to settle.”
-Example correct feedback:
-“Correct — $5 is the long-run average. Equal chances of $0 and $10 balance halfway between the two outcomes.”
+5, 5.0, 5.00, $5, $5.00, 5 dollars, 5 per draw
+
+Correct model
+10 × 0.5 + 0 × 0.5 = 5
+
+Deterministic normalization
+Money tolerance ±0.01; prediction must be one of {0,5,10} before sim requirement satisfied.
+
+Mistake classifications
+chose-extreme-outcome | confused-single-draw-with-average | assumed-sample-equals-ev | selected-largest-payout
+
+Wrong-answer feedback examples
+"You chose one possible chip value, but expected value is the average over many draws. With equal $0 and $10 chips, look for the midpoint — $5."
+Next: "Draw 100 times and watch where the average line settles."
+
+Correct-answer feedback
+"Correct — $5 is the long-run average. Equal chances of $0 and $10 balance halfway."
+
+Hint sequence
+H1: Watch the running-average line as draws increase (visual: graph).
+H2: Two equally likely outcomes → midpoint between $0 and $10.
+H3: 10×0.5 + 0×0.5 = 5.
+
 Teaching animation
-Spinner rotates during each simulation batch.
-Counters animate without delaying feedback.
-New graph points draw into place.
-After many spins, the $5 reference line receives a subtle emphasis.
-Correct completion highlights the midpoint between $0 and $10.
-Reduced-motion mode replaces rotation and line drawing with immediate state changes.
+Chip flies from bag to stack; counters update; graph point added; $5 line emphasized after many draws.
+Reduced-motion: instant state updates, no flight paths.
 
-Lesson 1, Problem 2 — Unequal Spinner Simulation
+Desktop workspace arrangement
+Target viewport: 1280×720 — active state fits without page scroll
+Left region: Chip bag, stacks, running-average graph
+Right region: Task, prediction, draw buttons, average input, check, feedback, continue
+Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
+Feedback appears in the right region directly beneath the active input or check action.
+Continue appears in the right region after completion.
+
+Mobile workspace arrangement
+Compact bag+graph (max 160px tall) → draw buttons → input → check → feedback; sticky task strip
+Sticky current-task strip at top of the interaction stack.
+Feedback auto-scrolls into view beneath the active input.
+No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.
+
+Exact control placement (both layouts)
+Current task: top of right region (desktop) / sticky strip (mobile).
+Primary input: right region center, adjacent to visual.
+Check/submit: directly beneath primary input.
+Hint button: beside check action.
+Feedback: immediately beneath check action, never at page bottom.
+Completion state: inline badge beside current task.
+
+Accessibility behavior
+Keyboard focus order: task → visual controls → input → check → feedback → continue.
+Live region announces feedback within 100ms of check.
+Touch targets ≥ 44px. Graphs include text summary of latest average/state.
+
+Review-mode state
+Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.
+
+Restart behavior
+Resets interaction state only; preserves completion record and chapter position.
+
+Validation cases
+See Appendix — Problem validation matrix for ev-l1-p1.
+
+
+Lesson 1, Problem 2 — Unequal Section Game
+Stable problem ID: ev-l1-p2
+Legacy ID mapping: l1-unequal-spinner
+Instructional role: Guided Application
+Estimated completion time: 2.5 min
+
 Concept
 Expected value remains a long-run average when outcomes are not equally likely.
 Scenario
@@ -257,61 +434,49 @@
 The graph visibly becomes more stable as trials increase.
 Correct completion connects the one-quarter spinner section to the contribution $5.
 
-Lesson 1, Problem 3 — Short-Run vs Long-Run
-Concept
-Small samples can be noisy. Larger samples provide better evidence of the long-run average.
-Scenario
-The learner compares results from the same 50/50 $10-or-$0 game using:
-10 spins
-500 spins
-Pre-problem mini-demo
-Explain that both graphs come from the same game.
-Identify the number of trials shown on each graph.
-Explain that a short sample can jump around.
-Explain that a larger sample typically stabilizes closer to EV.
-Visual + interaction
-Two simulation panels.
-One panel runs 10 spins.
-One panel runs 500 spins.
-Two running-average graphs.
-Horizontal reference line at $5.
-A prediction question:
-“Must 10 spins average exactly $5?”
-A comparison question:
-“Which graph gives stronger evidence of the long-run average?”
-Current-task checklist
-Run the 10-spin sample.
-Answer whether it must equal $5.
-Run the 500-spin sample.
-Select the stronger long-run graph.
-Answer and completion rules
-Run both required simulations.
-Correctly answer that 10 spins do not have to average exactly $5.
-Select the 500-spin graph as stronger evidence of the long-run average.
-Accepted answer formats
-For the short-sample question:
-No
-Not necessarily
-False
-Correct deterministic multiple-choice option
-For the graph question:
-500 spins
-Long-run graph
-Larger sample
-Correct deterministic multiple-choice option
-Mistake types
-Expected every sample to equal theoretical EV.
-Confused theoretical average with guaranteed sample average.
-Selected the short-run graph because it temporarily landed closer to $5.
-Believed more trials change the theoretical EV.
-Feedback
-“A theoretical expected value does not guarantee that every small sample will match it. Ten spins can be far above or below $5. The larger sample is stronger evidence because random swings have more chances to balance out.”
-Teaching animation
-Short-run graph appears visibly jagged.
-Long-run graph draws progressively toward the $5 reference line.
-Correct completion emphasizes sample size rather than the final position of one random run.
+Desktop workspace arrangement
+Target viewport: 1280×720
+Left region: Unequal spinner + running-average graph
+Right region: Prediction, spin controls, average field, check, feedback
+Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
+Feedback appears in the right region directly beneath the active input or check action.
+Continue appears in the right region after completion.
 
-Lesson 1, Problem 4 — Compare Two Spinners
+Mobile workspace arrangement
+Spinner summary sticky mini + controls stack
+Sticky current-task strip at top of the interaction stack.
+Feedback auto-scrolls into view beneath the active input.
+No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.
+
+Exact control placement (both layouts)
+Current task: top of right region (desktop) / sticky strip (mobile).
+Primary input: right region center, adjacent to visual.
+Check/submit: directly beneath primary input.
+Hint button: beside check action.
+Feedback: immediately beneath check action, never at page bottom.
+Completion state: inline badge beside current task.
+
+Accessibility behavior
+Keyboard focus order: task → visual controls → input → check → feedback → continue.
+Live region announces feedback within 100ms of check.
+Touch targets ≥ 44px. Graphs include text summary of latest average/state.
+
+Review-mode state
+Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.
+
+Restart behavior
+Resets interaction state only; preserves completion record and chapter position.
+
+Validation cases
+See Appendix — Problem validation matrix for ev-l1-p2.
+
+
+Lesson 1, Problem 3 — Compare Two Carnival Games
+Stable problem ID: ev-l1-p3
+Legacy ID mapping: l1-compare-spinners
+Instructional role: Independent Fluency Check
+Estimated completion time: 2.5 min
+
 Concept
 Games should be compared by their weighted long-run averages, not only by largest payout or winning frequency.
 Scenario
@@ -352,14 +517,58 @@
 Ignored the weighted average.
 Feedback
 “Spinner B has the larger prize, but it pays that prize less often. Spinner A wins more often, but its prize is smaller. When payout and probability are combined, both games average $5.”
-MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 20 problems. No AI in MVP.
 
-Expected Value Lab - MVP PRD Page 3
-MVP Problem Specs
+Desktop workspace arrangement
+Target viewport: 1280×720
+Left region: Two spinner cards + optional mini graphs
+Right region: Comparison choices, check, feedback
+Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
+Feedback appears in the right region directly beneath the active input or check action.
+Continue appears in the right region after completion.
+
+Mobile workspace arrangement
+Cards stack; MC immediately below; feedback inline
+Sticky current-task strip at top of the interaction stack.
+Feedback auto-scrolls into view beneath the active input.
+No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.
+
+Exact control placement (both layouts)
+Current task: top of right region (desktop) / sticky strip (mobile).
+Primary input: right region center, adjacent to visual.
+Check/submit: directly beneath primary input.
+Hint button: beside check action.
+Feedback: immediately beneath check action, never at page bottom.
+Completion state: inline badge beside current task.
+
+Accessibility behavior
+Keyboard focus order: task → visual controls → input → check → feedback → continue.
+Live region announces feedback within 100ms of check.
+Touch targets ≥ 44px. Graphs include text summary of latest average/state.
+
+Review-mode state
+Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.
+
+Restart behavior
+Resets interaction state only; preserves completion record and chapter position.
+
+Validation cases
+See Appendix — Problem validation matrix for ev-l1-p3.
+
+
+MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 15 problems. No AI in MVP.
+
+Expected Value Lab - MVP PRD Page 4
 Lesson 2 of 5: Expected Value as a Weighted Average
-Lesson goal: construct expected value by pairing each outcome with its probability and adding the resulting contributions.
+Lesson goal: construct expected value by pairing each outcome with its probability and adding contributions.
+Estimated lesson time: ~8 minutes.
 
+
 Lesson 2, Problem 1 — Build the Weighted Average
+Stable problem ID: ev-l2-p1
+Legacy ID mapping: problem-2 / l2-build-weighted-average
+Instructional role: Interactive Concept Introduction
+Estimated completion time: 2.5 min
+
 Concept
 Expected value is a weighted average of outcomes.
 Scenario
@@ -419,7 +628,49 @@
 Reversed types briefly highlight the correct slot categories.
 Reduced-motion mode uses immediate highlights.
 
+Desktop workspace arrangement
+Target viewport: 1280×720
+Left region: Spinner + formula strip
+Right region: Cards, slots, EV input, check
+Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
+Feedback appears in the right region directly beneath the active input or check action.
+Continue appears in the right region after completion.
+
+Mobile workspace arrangement
+Spinner thumbnail + formula stack
+Sticky current-task strip at top of the interaction stack.
+Feedback auto-scrolls into view beneath the active input.
+No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.
+
+Exact control placement (both layouts)
+Current task: top of right region (desktop) / sticky strip (mobile).
+Primary input: right region center, adjacent to visual.
+Check/submit: directly beneath primary input.
+Hint button: beside check action.
+Feedback: immediately beneath check action, never at page bottom.
+Completion state: inline badge beside current task.
+
+Accessibility behavior
+Keyboard focus order: task → visual controls → input → check → feedback → continue.
+Live region announces feedback within 100ms of check.
+Touch targets ≥ 44px. Graphs include text summary of latest average/state.
+
+Review-mode state
+Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.
+
+Restart behavior
+Resets interaction state only; preserves completion record and chapter position.
+
+Validation cases
+See Appendix — Problem validation matrix for ev-l2-p1.
+
+
 Lesson 2, Problem 2 — Match Outcomes to Probabilities
+Stable problem ID: ev-l2-p2
+Legacy ID mapping: l2-match-outcomes-probabilities
+Instructional role: Guided Application
+Estimated completion time: 2.5 min
+
 Concept
 Every outcome must be paired with the probability of that exact outcome.
 Scenario
@@ -460,54 +711,49 @@
 Feedback
 “Each payout needs the probability of receiving that exact payout. Do not rank the cards by size. Read the game data and connect each outcome to its own chance.”
 
-Lesson 2, Problem 3 — Fill Missing Formula Terms
-Concept
-Expected value is the sum of outcome × probability contributions.
-Scenario
-The learner receives:
-EV = ___ × 0.4 + 5 × ___ + 0 × 0.1
-Given outcomes and probabilities:
-$10 with probability 0.4
-$5 with probability 0.5
-$0 with probability 0.1
-Pre-problem mini-demo
-Point to a blank before a multiplication sign and label it an outcome slot.
-Point to a blank after a payout and label it a probability slot.
-Demonstrate selecting one card and placing it.
-Point to the final EV field.
-Visual + interaction
-Formula strip.
-Missing-value slots.
-Card bank:
-10
-0.5
-distractor cards where useful
-Final EV field.
-Contribution chips showing each row’s value after correct placement.
-Answer and completion rules
-Correct formula:
-10 × 0.4 + 5 × 0.5 + 0 × 0.1
-Correct contributions:
-4
-2.5
-0
-Final EV:
-6.5
-Accepted answer formats
-6.5
-6.50
-$6.50
-$6.5
-Mistake types
-Used an outcome where a probability belongs.
-Used a probability where an outcome belongs.
-Omitted the zero outcome.
-Arithmetic error.
-Added raw payouts instead of contributions.
-Feedback
-“The blank before × 0.4 must be the payout that occurs with probability 0.4. The blank after 5 × must be the probability of receiving $5. Once the slots are correct, add the three contributions.”
+Desktop workspace arrangement
+Target viewport: 1280×720
+Left region: Outcome column + match lines
+Right region: Probability cards, row slots, check
+Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
+Feedback appears in the right region directly beneath the active input or check action.
+Continue appears in the right region after completion.
 
-Lesson 2, Problem 4 — Diagnose Bad EV Setups
+Mobile workspace arrangement
+Two-column match UI
+Sticky current-task strip at top of the interaction stack.
+Feedback auto-scrolls into view beneath the active input.
+No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.
+
+Exact control placement (both layouts)
+Current task: top of right region (desktop) / sticky strip (mobile).
+Primary input: right region center, adjacent to visual.
+Check/submit: directly beneath primary input.
+Hint button: beside check action.
+Feedback: immediately beneath check action, never at page bottom.
+Completion state: inline badge beside current task.
+
+Accessibility behavior
+Keyboard focus order: task → visual controls → input → check → feedback → continue.
+Live region announces feedback within 100ms of check.
+Touch targets ≥ 44px. Graphs include text summary of latest average/state.
+
+Review-mode state
+Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.
+
+Restart behavior
+Resets interaction state only; preserves completion record and chapter position.
+
+Validation cases
+See Appendix — Problem validation matrix for ev-l2-p2.
+
+
+Lesson 2, Problem 3 — Diagnose Bad EV Setups
+Stable problem ID: ev-l2-p3
+Legacy ID mapping: l2-diagnose-bad-ev-setups
+Instructional role: Independent Fluency Check
+Estimated completion time: 3 min
+
 Concept
 A complete EV model multiplies every outcome by its probability and represents all possible outcomes.
 Scenario
@@ -544,14 +790,58 @@
 Focused only on the final numerical result instead of the model.
 Feedback
 “Formula B produces the same numeric contribution from the positive payouts, but it leaves half the probability unrepresented. A complete model includes the $0 outcome because it explains where the remaining probability goes.”
-MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 20 problems. No AI in MVP.
 
-Expected Value Lab - MVP PRD Page 4
-MVP Problem Specs
-Lesson 3 of 5: Counts, Tables, and Discrete Outcomes
-Lesson goal: convert physical counts into probabilities, organize outcomes in tables, and calculate EV contributions.
+Desktop workspace arrangement
+Target viewport: 1280×720
+Left region: Three formula cards with checklist icons
+Right region: Select valid + defect picks, check
+Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
+Feedback appears in the right region directly beneath the active input or check action.
+Continue appears in the right region after completion.
 
+Mobile workspace arrangement
+Formula cards stack; checklist toggles inline
+Sticky current-task strip at top of the interaction stack.
+Feedback auto-scrolls into view beneath the active input.
+No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.
+
+Exact control placement (both layouts)
+Current task: top of right region (desktop) / sticky strip (mobile).
+Primary input: right region center, adjacent to visual.
+Check/submit: directly beneath primary input.
+Hint button: beside check action.
+Feedback: immediately beneath check action, never at page bottom.
+Completion state: inline badge beside current task.
+
+Accessibility behavior
+Keyboard focus order: task → visual controls → input → check → feedback → continue.
+Live region announces feedback within 100ms of check.
+Touch targets ≥ 44px. Graphs include text summary of latest average/state.
+
+Review-mode state
+Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.
+
+Restart behavior
+Resets interaction state only; preserves completion record and chapter position.
+
+Validation cases
+See Appendix — Problem validation matrix for ev-l2-p3.
+
+
+MVP only: five lessons, 15 problems. No AI in MVP.
+
+Expected Value Lab - MVP PRD Page 5
+Lesson 3 of 5: Counts, Tables, and Discrete Outcomes
+Lesson goal: convert counts to probabilities, organize tables, calculate EV.
+Estimated lesson time: ~8.5 minutes (within target via collapsible reference).
+
+
 Lesson 3, Problem 1 — Mystery Box Outcomes
+Stable problem ID: ev-l3-p1
+Legacy ID mapping: problem-3 / l3-mystery-box-outcomes
+Instructional role: Interactive Concept Introduction
+Estimated completion time: 3 min
+
 Concept
 Expected value can be calculated from counts rather than prewritten percentages.
 Scenario
@@ -615,7 +905,49 @@
 Active table rows highlight the corresponding boxes.
 Probability hints animate the structure count / 6.
 
+Desktop workspace arrangement
+Target viewport: 1280×720
+Left region: Six mystery boxes + grouping colors
+Right region: Table fields, confirm button
+Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
+Feedback appears in the right region directly beneath the active input or check action.
+Continue appears in the right region after completion.
+
+Mobile workspace arrangement
+Boxes grid then table
+Sticky current-task strip at top of the interaction stack.
+Feedback auto-scrolls into view beneath the active input.
+No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.
+
+Exact control placement (both layouts)
+Current task: top of right region (desktop) / sticky strip (mobile).
+Primary input: right region center, adjacent to visual.
+Check/submit: directly beneath primary input.
+Hint button: beside check action.
+Feedback: immediately beneath check action, never at page bottom.
+Completion state: inline badge beside current task.
+
+Accessibility behavior
+Keyboard focus order: task → visual controls → input → check → feedback → continue.
+Live region announces feedback within 100ms of check.
+Touch targets ≥ 44px. Graphs include text summary of latest average/state.
+
+Review-mode state
+Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.
+
+Restart behavior
+Resets interaction state only; preserves completion record and chapter position.
+
+Validation cases
+See Appendix — Problem validation matrix for ev-l3-p1.
+
+
 Lesson 3, Problem 2 — Calculate EV from the Table
+Stable problem ID: ev-l3-p2
+Legacy ID mapping: problem-4 / l3-calculate-ev-from-table
+Instructional role: Guided Application
+Estimated completion time: 2.5 min
+
 Concept
 Calculate EV by summing each outcome × probability contribution.
 Scenario
@@ -666,51 +998,49 @@
 Contributions move toward the final EV total.
 Correct completion combines the chunks into $4.
 
-Lesson 3, Problem 3 — Repair the Probability Table
-Concept
-Probabilities must match counts and account for the entire sample space.
-Scenario
-A prize shelf has 8 tickets:
-1 pays $16
-3 pay $4
-4 pay $0
-The displayed table contains errors:
-$16 → count 1 → probability 1/8
-$4 → count 3 → probability 3/10
-$0 → count 4 → probability blank
-Pre-problem mini-demo
-Count all 8 ticket icons.
-Explain that every probability uses the same total denominator.
-Point to the probability-sum meter.
-Demonstrate correcting one sample cell without revealing the real answer.
-Visual + interaction
-Eight ticket icons.
-Outcome groups.
-Editable probability table.
-Probability-sum meter.
-Incorrect rows highlight the matching ticket group.
-Answer and completion rules
-Correct rows:
-$16 → 1/8
-$4 → 3/8
-$0 → 4/8 or 1/2
-Completion requires:
-Correct probability cells.
-Sum of probabilities = 1.
-Accepted answer formats
-1/8 or 0.125
-3/8 or 0.375
-4/8, 1/2, 0.5, or .5
-Mistake types
-Wrong denominator.
-Probabilities do not sum to 1.
-Ignored the zero outcome.
-Copied count as probability.
-Used different totals for different rows.
-Feedback
-“There are 8 tickets in total, so every probability must compare its group with 8. The $4 row has 3 matching tickets, so use 3/8 rather than 3/10.”
+Desktop workspace arrangement
+Target viewport: 1280×720
+Left region: Collapsed box groups as colored chunks + expression
+Right region: Contribution inputs, EV, check
+Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
+Feedback appears in the right region directly beneath the active input or check action.
+Continue appears in the right region after completion.
 
-Lesson 3, Problem 4 — Prize Bag EV Table
+Mobile workspace arrangement
+Expression + inputs stack
+Sticky current-task strip at top of the interaction stack.
+Feedback auto-scrolls into view beneath the active input.
+No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.
+
+Exact control placement (both layouts)
+Current task: top of right region (desktop) / sticky strip (mobile).
+Primary input: right region center, adjacent to visual.
+Check/submit: directly beneath primary input.
+Hint button: beside check action.
+Feedback: immediately beneath check action, never at page bottom.
+Completion state: inline badge beside current task.
+
+Accessibility behavior
+Keyboard focus order: task → visual controls → input → check → feedback → continue.
+Live region announces feedback within 100ms of check.
+Touch targets ≥ 44px. Graphs include text summary of latest average/state.
+
+Review-mode state
+Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.
+
+Restart behavior
+Resets interaction state only; preserves completion record and chapter position.
+
+Validation cases
+See Appendix — Problem validation matrix for ev-l3-p2.
+
+
+Lesson 3, Problem 3 — Prize Bag EV Table
+Stable problem ID: ev-l3-p3
+Legacy ID mapping: l3-prize-bag-ev-table
+Instructional role: Independent Fluency Check
+Estimated completion time: 3 min
+
 Concept
 Build a complete expected value table from physical counts.
 Scenario
@@ -753,14 +1083,57 @@
 Used total token payout instead of EV per selection.
 Feedback
 “Contribution is payout × probability. For the $15 tokens, there are 2 out of 10, so the contribution is 15 × 2/10 = 3. Repeat that process for each outcome before adding.”
-MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 20 problems. No AI in MVP.
 
-Expected Value Lab - MVP PRD Page 5
-MVP Problem Specs
+Desktop workspace arrangement
+Target viewport: 1280×720
+Left region: Bag + 10 grouped tokens
+Right region: Full editable table + EV field
+Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
+Feedback appears in the right region directly beneath the active input or check action.
+Continue appears in the right region after completion.
+
+Mobile workspace arrangement
+Token summary strip + table
+Sticky current-task strip at top of the interaction stack.
+Feedback auto-scrolls into view beneath the active input.
+No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.
+
+Exact control placement (both layouts)
+Current task: top of right region (desktop) / sticky strip (mobile).
+Primary input: right region center, adjacent to visual.
+Check/submit: directly beneath primary input.
+Hint button: beside check action.
+Feedback: immediately beneath check action, never at page bottom.
+Completion state: inline badge beside current task.
+
+Accessibility behavior
+Keyboard focus order: task → visual controls → input → check → feedback → continue.
+Live region announces feedback within 100ms of check.
+Touch targets ≥ 44px. Graphs include text summary of latest average/state.
+
+Review-mode state
+Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.
+
+Restart behavior
+Resets interaction state only; preserves completion record and chapter position.
+
+Validation cases
+See Appendix — Problem validation matrix for ev-l3-p3.
+
+
+MVP only: five lessons, 15 problems. No AI in MVP.
+
+Expected Value Lab - MVP PRD Page 6
 Lesson 4 of 5: Expected Payout, Expected Profit, and Fairness
-Lesson goal: distinguish payout from profit, account for entry cost, and classify games using expected profit.
+Estimated lesson time: ~7.5 minutes.
 
+
 Lesson 4, Problem 1 — Expected Payout vs Expected Profit
+Stable problem ID: ev-l4-p1
+Legacy ID mapping: problem-5 / l4-payout-vs-profit
+Instructional role: Interactive Concept Introduction
+Estimated completion time: 2.5 min
+
 Concept
 Expected payout and expected profit are different when there is a cost to play.
 Scenario
@@ -803,7 +1176,49 @@
 Adding cost incorrectly moves the indicator in the wrong direction.
 Correct completion emphasizes the remaining $1.
 
+Desktop workspace arrangement
+Target viewport: 1280×720
+Left region: Balance scale + payout/cost blocks
+Right region: Tap cost, profit input, check
+Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
+Feedback appears in the right region directly beneath the active input or check action.
+Continue appears in the right region after completion.
+
+Mobile workspace arrangement
+Scale mini + equation stack
+Sticky current-task strip at top of the interaction stack.
+Feedback auto-scrolls into view beneath the active input.
+No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.
+
+Exact control placement (both layouts)
+Current task: top of right region (desktop) / sticky strip (mobile).
+Primary input: right region center, adjacent to visual.
+Check/submit: directly beneath primary input.
+Hint button: beside check action.
+Feedback: immediately beneath check action, never at page bottom.
+Completion state: inline badge beside current task.
+
+Accessibility behavior
+Keyboard focus order: task → visual controls → input → check → feedback → continue.
+Live region announces feedback within 100ms of check.
+Touch targets ≥ 44px. Graphs include text summary of latest average/state.
+
+Review-mode state
+Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.
+
+Restart behavior
+Resets interaction state only; preserves completion record and chapter position.
+
+Validation cases
+See Appendix — Problem validation matrix for ev-l4-p1.
+
+
 Lesson 4, Problem 2 — Fair, Favorable, or Unfavorable?
+Stable problem ID: ev-l4-p2
+Legacy ID mapping: problem-6 / l4-fair-favorable-unfavorable
+Instructional role: Guided Application
+Estimated completion time: 2.5 min
+
 Concept
 Positive expected profit is favorable.
 Zero expected profit is fair.
@@ -864,48 +1279,49 @@
 Favorable aligns with the positive side.
 Unfavorable aligns with the negative side.
 
-Lesson 4, Problem 3 — Find the Fair Price
-Concept
-A fair game has expected profit equal to zero, so fair cost equals expected payout.
-Scenario
-A spinner has:
-50% chance of $8
-50% chance of $0
-Question:
-What entry cost makes the game fair?
-Pre-problem mini-demo
-Calculate expected payout from the spinner.
-Show the cost control.
-Explain that fairness occurs when payout and cost balance.
-Point to zero on the expected-profit number line.
-Visual + interaction
-50/50 spinner.
-Expected payout meter.
-Cost slider or selectable cost cards.
-Balance scale.
-Fairness number line.
-Expected-profit display.
-Answer and completion rules
-Expected payout = 4.
-Fair cost = 4.
-Expected profit at that cost = 0.
-Classification = fair.
-Accepted answer formats
-4
-4.0
-4.00
-$4
-$4.00
-Mistake types
-Chose the maximum payout.
-Set cost below payout and called it fair.
-Set cost above payout and called it fair.
-Confused expected payout with expected profit.
-Did not target zero profit.
-Feedback
-“A fair price makes expected profit equal zero. The expected payout is $4, so the cost must also be $4. A lower cost would favor the player, and a higher cost would be unfavorable.”
+Desktop workspace arrangement
+Target viewport: 1280×720
+Left region: Three game cards with payout/cost bars
+Right region: Buckets + placement area, check
+Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
+Feedback appears in the right region directly beneath the active input or check action.
+Continue appears in the right region after completion.
 
-Lesson 4, Problem 4 — Choose the Better Game After Cost
+Mobile workspace arrangement
+Cards then buckets
+Sticky current-task strip at top of the interaction stack.
+Feedback auto-scrolls into view beneath the active input.
+No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.
+
+Exact control placement (both layouts)
+Current task: top of right region (desktop) / sticky strip (mobile).
+Primary input: right region center, adjacent to visual.
+Check/submit: directly beneath primary input.
+Hint button: beside check action.
+Feedback: immediately beneath check action, never at page bottom.
+Completion state: inline badge beside current task.
+
+Accessibility behavior
+Keyboard focus order: task → visual controls → input → check → feedback → continue.
+Live region announces feedback within 100ms of check.
+Touch targets ≥ 44px. Graphs include text summary of latest average/state.
+
+Review-mode state
+Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.
+
+Restart behavior
+Resets interaction state only; preserves completion record and chapter position.
+
+Validation cases
+See Appendix — Problem validation matrix for ev-l4-p2.
+
+
+Lesson 4, Problem 3 — Choose the Better Game After Cost
+Stable problem ID: ev-l4-p3
+Legacy ID mapping: l4-choose-better-game-after-cost
+Instructional role: Independent Fluency Check
+Estimated completion time: 2.5 min
+
 Concept
 The better game for the player is determined by expected profit rather than expected payout alone.
 Scenario
@@ -947,14 +1363,57 @@
 Calculated both profits correctly but selected the wrong game.
 Feedback
 “Game A has the larger expected payout, but it also costs much more. After subtracting cost, Game A gives $2 expected profit and Game B gives $3. Compare the remaining profit, not only the payout.”
-MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 20 problems. No AI in MVP.
 
-Expected Value Lab - MVP PRD Page 6
-MVP Problem Specs
+Desktop workspace arrangement
+Target viewport: 1280×720
+Left region: Two game cards + profit meters
+Right region: Profit fields optional, game selector, check
+Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
+Feedback appears in the right region directly beneath the active input or check action.
+Continue appears in the right region after completion.
+
+Mobile workspace arrangement
+Card stack + selector
+Sticky current-task strip at top of the interaction stack.
+Feedback auto-scrolls into view beneath the active input.
+No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.
+
+Exact control placement (both layouts)
+Current task: top of right region (desktop) / sticky strip (mobile).
+Primary input: right region center, adjacent to visual.
+Check/submit: directly beneath primary input.
+Hint button: beside check action.
+Feedback: immediately beneath check action, never at page bottom.
+Completion state: inline badge beside current task.
+
+Accessibility behavior
+Keyboard focus order: task → visual controls → input → check → feedback → continue.
+Live region announces feedback within 100ms of check.
+Touch targets ≥ 44px. Graphs include text summary of latest average/state.
+
+Review-mode state
+Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.
+
+Restart behavior
+Resets interaction state only; preserves completion record and chapter position.
+
+Validation cases
+See Appendix — Problem validation matrix for ev-l4-p3.
+
+
+MVP only: five lessons, 15 problems. No AI in MVP.
+
+Expected Value Lab - MVP PRD Page 7
 Lesson 5 of 5: Same EV, Different Risk, and Full EV Models
-Lesson goal: independently build expected value models and understand that equal expected values do not imply equal risk.
+Estimated lesson time: ~9 min target with step compression (~8 min achievable).
 
+
 Lesson 5, Problem 1 — Build the Whole EV Model
+Stable problem ID: ev-l5-p1
+Legacy ID mapping: problem-7 / l5-build-whole-ev-model
+Instructional role: Interactive Concept Introduction
+Estimated completion time: 3 min
+
 Concept
 Independently convert a game into probabilities, contributions, expected payout, expected profit, and a decision.
 Scenario
@@ -1010,8 +1469,50 @@
 Decision hint places expected-profit dot at zero.
 Feedback
 “You found the expected payout, but the decision uses expected profit. The game pays $5 on average and costs $5, so the expected profit is zero. A zero expected profit means the game is fair.”
+
+Desktop workspace arrangement
+Target viewport: 1280×720
+Left region: 10-section wheel + grouping taps
+Right region: Table fields, payout/cost/profit/decision
+Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
+Feedback appears in the right region directly beneath the active input or check action.
+Continue appears in the right region after completion.
+
+Mobile workspace arrangement
+Wheel summary + one active table row
+Sticky current-task strip at top of the interaction stack.
+Feedback auto-scrolls into view beneath the active input.
+No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.
+
+Exact control placement (both layouts)
+Current task: top of right region (desktop) / sticky strip (mobile).
+Primary input: right region center, adjacent to visual.
+Check/submit: directly beneath primary input.
+Hint button: beside check action.
+Feedback: immediately beneath check action, never at page bottom.
+Completion state: inline badge beside current task.
 
+Accessibility behavior
+Keyboard focus order: task → visual controls → input → check → feedback → continue.
+Live region announces feedback within 100ms of check.
+Touch targets ≥ 44px. Graphs include text summary of latest average/state.
+
+Review-mode state
+Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.
+
+Restart behavior
+Resets interaction state only; preserves completion record and chapter position.
+
+Validation cases
+See Appendix — Problem validation matrix for ev-l5-p1.
+
+
 Lesson 5, Problem 2 — Same Expected Value, Different Risk
+Stable problem ID: ev-l5-p2
+Legacy ID mapping: problem-8 / l5-same-ev-different-risk
+Instructional role: Guided Application
+Estimated completion time: 2.5 min
+
 Concept
 Expected value does not describe the full experience of uncertainty. Two games can have the same EV but different risk.
 Scenario
@@ -1070,51 +1571,49 @@
 Both running averages move toward $5.
 Correct completion overlays the same-average line while preserving different spread.
 
-Lesson 5, Problem 3 — Low-Risk vs High-Risk Same EV
-Concept
-Two games can share an EV while having different variability.
-Scenario
-Game A:
-100% chance of $6
-Game B:
-50% chance of $12
-50% chance of $0
-Pre-problem mini-demo
-Identify the guaranteed outcome.
-Identify the split outcome.
-Compare the weighted averages.
-Compare the outcome spread.
-Visual + interaction
-Guaranteed-outcome bar at $6.
-Split bar between $0 and $12.
-Trial simulator.
-Outcome graph.
-Running-average graph.
-EV fields.
-Risk selector.
-Explanation field or deterministic choice.
-Answer and completion rules
-EV(A) = 6.
-EV(B) = 6.
-Riskier game = Game B.
-Correct reason = wider spread or variable outcomes despite equal EV.
-Required simulations must be run if simulation controls are included.
-Accepted answer formats
-6
-6.0
-$6
-Game B
-B
-Approved deterministic risk explanations
-Mistake types
-Claimed Game B has higher EV because it can pay $12.
-Claimed the games are identical.
-Confused guaranteed outcome with average.
-Ignored variability.
-Feedback
-“Both games average $6, but only Game A guarantees $6. Game B can produce either $0 or $12. The wider range of possible outcomes makes Game B riskier.”
+Desktop workspace arrangement
+Target viewport: 1280×720
+Left region: Flat bar vs split bar + outcome plots
+Right region: Sim buttons, EV inputs, risk MC
+Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
+Feedback appears in the right region directly beneath the active input or check action.
+Continue appears in the right region after completion.
 
-Lesson 5, Problem 4 — Final Capstone EV Decision
+Mobile workspace arrangement
+Dual sim panels stacked compactly
+Sticky current-task strip at top of the interaction stack.
+Feedback auto-scrolls into view beneath the active input.
+No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.
+
+Exact control placement (both layouts)
+Current task: top of right region (desktop) / sticky strip (mobile).
+Primary input: right region center, adjacent to visual.
+Check/submit: directly beneath primary input.
+Hint button: beside check action.
+Feedback: immediately beneath check action, never at page bottom.
+Completion state: inline badge beside current task.
+
+Accessibility behavior
+Keyboard focus order: task → visual controls → input → check → feedback → continue.
+Live region announces feedback within 100ms of check.
+Touch targets ≥ 44px. Graphs include text summary of latest average/state.
+
+Review-mode state
+Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.
+
+Restart behavior
+Resets interaction state only; preserves completion record and chapter position.
+
+Validation cases
+See Appendix — Problem validation matrix for ev-l5-p2.
+
+
+Lesson 5, Problem 3 — Final Carnival Decision
+Stable problem ID: ev-l5-p3
+Legacy ID mapping: l5-final-capstone-ev-decision
+Instructional role: Independent Fluency Check — Chapter Capstone
+Estimated completion time: 3.5 min
+
 Concept
 Build a complete EV model and use payout, cost, fairness, and risk together.
 Scenario
@@ -1185,678 +1684,146 @@
 Believed a fair game has no risk.
 Feedback
 “The expected payout is $6 and the cost is also $6, so expected profit is zero and the game is fair. Fairness describes the long-run average for the player; it does not mean every play returns the entry cost.”
-MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 20 problems. No AI in MVP.
 
-Expected Value Lab - MVP PRD Page 7
+Desktop workspace arrangement
+Target viewport: 1280×720 — capstone uses stepped checklist to avoid scroll
+Left region: 12-section wheel + full table
+Right region: Sequential checklist fields + decision/risk MC
+Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
+Feedback appears in the right region directly beneath the active input or check action.
+Continue appears in the right region after completion.
+
+Mobile workspace arrangement
+One checklist step per screen segment on narrow mobile
+Sticky current-task strip at top of the interaction stack.
+Feedback auto-scrolls into view beneath the active input.
+No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.
+
+Exact control placement (both layouts)
+Current task: top of right region (desktop) / sticky strip (mobile).
+Primary input: right region center, adjacent to visual.
+Check/submit: directly beneath primary input.
+Hint button: beside check action.
+Feedback: immediately beneath check action, never at page bottom.
+Completion state: inline badge beside current task.
+
+Accessibility behavior
+Keyboard focus order: task → visual controls → input → check → feedback → continue.
+Live region announces feedback within 100ms of check.
+Touch targets ≥ 44px. Graphs include text summary of latest average/state.
+
+Review-mode state
+Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.
+
+Restart behavior
+Resets interaction state only; preserves completion record and chapter position.
+
+Validation cases
+See Appendix — Problem validation matrix for ev-l5-p3.
+
+
+MVP only: five lessons, 15 problems. No AI in MVP.
+
+Expected Value Lab - MVP PRD Page 8
 Cross-Problem Learning, Demonstration, Feedback, and Answer Rules
+
 Pre-problem mini-demo system
-Each problem includes an introductory demonstration.
-Required behavior
-The first visit to a problem presents the demo before the graded problem.
-A full demo is required when a new interaction type is introduced.
-Repeated interaction types may use a shorter recap.
-Learner may select:
-Back
-Next
-Skip demo
-Start Problem
-Every problem includes “Show demo again.”
-Completed problems do not automatically replay the demo.
-Review mode may include an optional “Show demo” button.
-Restarted practice may offer the demo but must allow skipping.
-Demo state rules
-The demo does not:
-count as an attempt
-set hintUsed
-complete a required action
-alter submitted answers
-alter problem completion
-move chapter progress
-Demo-seen state may be stored:
-per problem
-per interaction type
-locally if Firestore persistence is not yet safe
-The implementation must not require destructive migration.
+Unchanged in spirit: first visit shows demo; Show demo again available; demo does not count as attempt.
+
 Current-task panel and step checklist
-Each problem displays a current-task panel near the top.
-It must answer:
-What am I looking at?
-What should I tap or enter first?
-What is the current goal?
-What remains before completion?
-Checklist states:
-Not started
-Current
-Complete
-Needs correction
-The current task updates as the learner progresses.
+Rendered in the right region (desktop) or sticky strip (mobile) — never separated from active inputs by the visual.
+
+Learning Coach feedback panel — revised placement
+Desktop/tablet: right region directly beneath the active input/check — not upper-right distant from controls.
+Mobile: immediately beneath the input that was checked; auto-scroll into viewport.
+Wrong feedback: what happened / why wrong / next action (3–5 sentences).
+Correct feedback: 1–2 sentences + Continue in same workspace.
+
 Flexible deterministic answer normalization
-Money and numeric input
-Where mathematically valid, accept:
-whole numbers
-trailing zeros
-dollar sign
-surrounding whitespace
-approved money words
-approved contextual suffixes
-Examples:
-5
-5.0
-5.00
-$5
-$5.00
-5 dollars
-5 per spin
-Probability input
-Where mathematically valid, accept:
-fractions
-unreduced fractions
-reduced fractions
-decimals
-leading-decimal format
-percentages
-whitespace around fraction operators
-Examples:
-1/4
-25/100
-0.25
-.25
-25%
-Equivalent values are compared with a small deterministic tolerance appropriate to the problem. The tolerance must accept specified rounded values without accepting meaningfully incorrect probabilities.
-Classification input
-Classification checks are case-insensitive.
-Approved unambiguous synonyms may be accepted:
-fair
-favorable
-fav
-positive, only when context clearly means positive expected profit
-unfavorable
-unfav
-negative, only when context clearly means negative expected profit
-Explanation input
-Multiple choice is preferred for conceptual explanations.
-If short text is permitted:
-use deterministic keyword and phrase rules
-require sufficient approved concepts
-reject contradictory explanations
-do not use AI or semantic similarity
-Direct correction behavior
-A graded wrong answer produces deterministic feedback.
-Learner can edit the answer in place.
-Editing clears stale error state for that field.
-Resubmission immediately accepts a corrected answer.
-No refresh or full reset is required.
-Correct fields remain filled when another field is wrong.
-Partially correct multi-field progress remains visible.
-Correct card placements remain unless the learner changes them.
-A wrong card can be moved or replaced without restarting.
-Attempt rules
-Empty submissions do not count as graded attempts.
-Incomplete guard messages do not count as graded attempts.
-Failure to perform a required action, such as running 100 spins, does not count as a wrong mathematical attempt.
-A substantive incorrect submitted answer counts as a graded attempt.
-A corrected resubmission records its own result according to the existing attempt model.
-Post-completion practice attempts are identified separately and do not reduce mastery already earned.
-Learning Coach feedback panel
-Placement
-Desktop:
-Upper-right or right side of the active problem area.
-Visible without scrolling after submission.
-Close to the relevant visual and answer fields.
-Mobile:
-Beneath the current-task panel.
-Above or immediately beside the relevant answer inputs.
-Automatically brought into view after feedback appears.
-Feedback must not be buried at the bottom of a long page.
-Wrong-feedback structure
-Every wrong-answer response contains:
-What happened.
-Why the reasoning is not correct.
-What the learner should inspect or do next.
-Optional supporting elements:
-user-friendly mistake-type label
-highlighted visual region
-miniature formula
-next-action button
-hint button
-Target length:
-3–5 short sentences
-concise enough to scan
-detailed enough to guide correction
-Correct-feedback structure
-Correct feedback contains:
-confirmation
-a brief conceptual explanation
-completion status
-visible Continue action
-Target length:
-1–2 concise teaching sentences
-Hint rules
-Hints remain deterministic and visual-first.
-Hint progression:
-Hint 1 points to the relevant visual.
-Hint 2 shows the required structure or relationship.
-Hint 3 shows a near-complete setup without unnecessarily giving away the final response.
-Hint usage is saved.
-Animation rules
-Animations must clarify mathematical meaning.
-They must:
-remain fast
-avoid delaying answer feedback
-avoid blocking input
-respect reduced-motion preferences
-use immediate-state alternatives when motion is reduced
-Decorative motion must not compete with the learning task.
-Accessibility rules
-Keyboard navigation for demos and controls.
-Large tap targets.
-Clear focus states.
-Feedback announced through an appropriate live region where practical.
-Correctness must not rely on color alone.
-Labels accompany icons.
-Graphs include text summaries.
-Tap interaction remains available for every drag/drop-style task.
-MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 20 problems. No AI in MVP.
+Unchanged: money, probability, classification rules as prior PRD.
 
-Expected Value Lab - MVP PRD Page 8
+Direct correction, attempt rules, hints, animations, accessibility
+Unchanged except all interactions must satisfy tap-to-place and compact workspace rules above.
+
+MVP only: five lessons, 15 problems. No AI in MVP.
+
+Expected Value Lab - MVP PRD Page 9
 Completed-Problem Review, Restart, Progress, and Home Pathway
-Completed-problem behavior
-A completed problem must not automatically restart when reopened.
-Selecting a completed problem presents two explicit options:
-Review Problem
-Restart This Problem
-If a completed-problem URL is opened directly, Review Mode is the default.
-Review Problem
-Review Mode displays:
-“Completed — Review Mode” label
-completion checkmark
-saved submitted answer
-normalized correct result
-final deterministic explanation
-completed visual state where feasible
-graded-attempt summary
-hints-used summary
-completion date where available
-“Show demo” option
-“Restart This Problem” option
-Review Mode must not:
-increment attempts
-erase completion
-change the next problem
-move progress backward
-overwrite the saved completed snapshot
-require the learner to redo the problem
-For simulations, save enough summary state to reconstruct the completed learning view. Saving every raw random event is optional. A saved graph series or compact summary may be used where practical.
-Restart This Problem
-Restart creates a fresh practice session for that problem.
-It resets only:
-temporary answers
-card placements
-current simulation state
-local step state
-current feedback
-current hint progression, where appropriate for practice
-It does not erase:
-completed status
-original completed review snapshot
-chapter completion already earned
-lesson completion already earned
-farthest progression
-milestones already unlocked
-mastery already earned
-Restarted attempts are stored as practice attempts or otherwise distinguished from original graded progression.
-Completing a restarted problem may update practice history but does not move overall progression backward.
-Overall progression rule
-The app saves the learner’s forward position based on the farthest completed point in the ordered progression, not the most recently opened problem.
-Required concepts:
-completedProblemIds
-completedLessonIds
-highestSequentialCompletedGlobalIndex
-nextIncompleteProblemId
-currentLessonId
-nextLessonId
-Example:
-Learner completes Problems 1–8.
-Learner returns to Problem 3.
-Learner reviews or restarts Problem 3.
-Overall progress remains through Problem 8.
-Continue routes to Problem 9.
-Progress percentage does not fall.
-Problem 3 remains completed.
-Opening, reviewing, or restarting an older problem must never change the main Continue destination.
+
+Completed-problem behavior, Review Mode, Restart — unchanged except totals below.
+
+Overall progression rule — unchanged logic, 15-problem scale.
+
 Completion percentage
-Chapter completion percentage:
-completed unique problems ÷ 20 × 100
-Lesson completion percentage:
-completed unique problems in lesson ÷ 4 × 100
-Practice repeats do not increase completion percentage beyond one completion per problem.
+Chapter: completed unique canonical problems ÷ 15 × 100
+Lesson: completed in lesson ÷ 3 × 100
+
 Continue behavior
-“Continue Chapter” routes to the first incomplete problem in the ordered progression.
-If all problems are complete:
-Continue becomes Review Chapter or View Mastery.
-The app does not restart Problem 1 automatically.
-Home-page layout
-The main home-page content remains centered.
-On desktop and wider tablet layouts:
-Use the currently empty right-side area for a rectangular current-chapter panel.
-Do not add a matching left-side panel merely for symmetry.
-The right panel should appear elevated through border, glow, or shadow.
-The panel must not crowd the central home content.
-On mobile:
-Stack the current-chapter panel above or below the main content.
-Preserve readable touch targets.
-Avoid horizontal scrolling.
-Current-chapter panel content
-Chapter title: Expected Value Course
-Subtitle: Master long-run average, weighted models, payout, profit, fairness, and risk.
-Current lesson
-Current or next problem
-Completion percentage
-Streak
-Mastery state
-Milestones
-Continue button
-Optional Review Previous button
-Compact 5-zone course map
-Golf-course progression metaphor
-The current chapter is represented as an original golf-course or mini-golf-inspired path.
-Required structure:
+Routes to first incomplete among 15 ordered problems (globalProblemIndex 0..14).
+
+Home-page layout — unchanged structure.
+
+Golf-course progression metaphor — revised counts
 5 lesson zones
-4 problem holes per zone
-20 total holes
-a winding progression path
-numbered flags or problem markers
-completed, current, and future states
-Completed hole
-Checkmark or sunk-ball treatment
-Reduced glow
-Remains clickable for Review or Restart
-Current or next hole
-Strong glow or ring
-Subtle pulse when motion is enabled
-Current-ball marker
-Clear problem label
-Highest visual emphasis
-Future hole
-Visible but subdued
-Shows that more content is ahead
-May use a faint flag, path marker, or lock state
-Later lesson zones become more visually ambitious and motivating
-Final hole
-Visually deeper or more dramatic
-Larger final flag or trophy marker
-Clearly communicates final capstone
-Must not use copied branded assets
-Expanded chapter pathway
-The chapter page may display a larger version of the same map.
-It must show:
-lesson zones
-lesson names
-individual problems
-current and completed states
-lesson completion
-chapter completion
-review/restart access for completed problems
-The golf metaphor is navigational only. Actual math scenarios remain the PRD-defined spinners, boxes, tables, wheels, and games.
-MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 20 problems. No AI in MVP.
+3 problem holes per zone
+15 total holes
+Final hole (ev-l5-p3) receives capstone visual emphasis
 
-Expected Value Lab - MVP PRD Page 9
+MVP only: five lessons, 15 problems. No AI in MVP.
+
+Expected Value Lab - MVP PRD Page 10
 Tech Stack, Data Schema, and Mastery
-The schema must support deterministic checking, lesson progress, completed-problem review, practice restarts, and mastery tracking.
-Tech stack
-Frontend:
-React
-TypeScript
-Vite
-React Router
-Firebase SDK
-CSS, Tailwind, or the project’s established styling system
-SVG or Canvas for teaching visuals
-Optional Motion or Framer Motion for teaching animations
-Optional shadcn/ui primitives where consistent with the existing app
-Design workflow:
-Figma may be used as a visual-design reference.
-The deployed app must not depend on a Figma file.
-Original SVG/CSS assets are preferred.
-No copied Topgolf or third-party branded artwork.
-Backend:
-Firebase Authentication for Google sign-in
-Firestore for profiles, progress, attempts, problem state, and milestones
-Firebase Hosting or Vercel for deployment
-Cloud Functions are not required for MVP
-Answer checking:
-Client-side deterministic logic
-Normalized answer parser
-Per-problem acceptedFormats
-Per-problem mistakeRules
-Numeric-equivalence checks
-Fraction/decimal/percentage equivalence
-No AI
-Data schema
-users/{userId}
-userId
-displayName
-email
-createdAt
-lastLoginAt
-chapterProgress/{userId}_expected_value_intro
-userId
-chapterId = “expected-value-intro”
-currentLessonId
-nextLessonId
-nextProblemId
-highestSequentialCompletedGlobalIndex
-completedProblemIds
-completedLessonIds
-completionPercentage
-masteryStatus
-streakCount
-lastActiveDate
-updatedAt
-nextProblemId is derived from ordered progression and must not be replaced by the most recently opened problem.
-lessonProgress/{userId}_{lessonId}
-userId
-chapterId
-lessonId
-completedProblemIds
-completionPercentage
-lessonCompleted
-firstStartedAt
-completedAt
-updatedAt
-problemProgress/{userId}_{problemId}
-userId
-chapterId
-lessonId
-problemId
-status
-firstStartedAt
-completedAt
-bestGradedAttemptNumber
-finalSubmittedAnswer
-finalNormalizedAnswer
-finalMistakeType
-finalFeedbackKey
-reviewSnapshot
-demoSeen
-demoLastSeenAt
-restartCount
-lastReviewedAt
-updatedAt
-Possible status values:
-not_started
-in_progress
-completed
-Review and practice state must not replace completed status.
-problemAttempts/{attemptId}
-userId
-chapterId
-lessonId
-problemId
-stepId
-submittedAnswer
-normalizedAnswer
-isCorrect
-attemptNumber
-attemptMode
-hintUsed
-mistakeType
-masteryTagsTested
-createdAt
-Possible attemptMode values:
-graded
-corrected_resubmission
-practice_restart
-Incomplete guard submissions are not stored as graded incorrect attempts.
-milestones/{userId}_expected_value_intro
-userId
-chapterId
-unlockedMilestones
-completedLessonIds
-chapterCompleted
-chapterMastered
-updatedAt
-Problem JSON object
-Each problem object supports:
-problemId
-legacyProblemId, where migration compatibility is required
-chapterId
-lessonId
-lessonIndex
-problemIndexWithinLesson
-globalProblemIndex
-title
-concept
-difficulty
-scenarioText
-visualType
-interactionType
-givenData
-demoConfig
-currentTaskConfig
-requiredActions
-answerInputs
-correctAnswers
-acceptedFormats
-mistakeRules
-feedback
-hints
-animations
-completionRule
-masteryTags
-Problem ID compatibility
-Existing original problem IDs should remain valid.
-Do not silently rename original problem IDs if that would erase progress.
-If lesson-aware IDs are introduced, use a compatibility mapping.
-New problems receive stable IDs.
-Saved completedProblemIds must continue resolving after the 5-lesson migration.
-Mastery rule
-Learner masters the chapter if:
-all 20 problems are complete
-the final capstone is correct
-the learner correctly completes the full-model problem
-the learner correctly distinguishes expected payout from expected profit
-the learner correctly distinguishes equal EV from equal risk
-at least 15 of 20 problems are completed in no more than 2 graded attempts
-required mastery tags are demonstrated
-The 15-of-20 threshold preserves the original 75% strong-attempt standard.
-Post-completion practice restarts do not reduce previously earned mastery.
-Mastery states
-Not Started
-Learning
-Developing
-Mastered
-Suggested milestones
-First problem completed
-First direct correction
-Lesson 1 completed
-Lesson 2 completed
-Lesson 3 completed
-Lesson 4 completed
-All simulations completed
-Profit and fairness distinction demonstrated
-Risk distinction demonstrated
-Final capstone completed
-Chapter completed
-Chapter mastered
-Streak milestones
-Security rules
-Each authenticated user may read and write only their own progress documents.
-Public problem definitions may be bundled client-side.
-No answer-checking request requires unrestricted Firestore access.
-Environment files remain excluded from source control.
-MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 20 problems. No AI in MVP.
+
+Tech stack — unchanged.
+
+Data schema — unchanged document shapes; globalProblemIndex now 0..14; PROBLEMS_PER_LESSON = 3.
+
+Problem JSON object — add fields where needed:
+desktopWorkspaceLayout
+mobileWorkspaceLayout
+legacyProblemId
+canonicalSlug (ev-l1-p1 … ev-l5-p3)
+
+Problem ID compatibility
+Preserve problem-1 … problem-8 storage IDs.
+New canonical slugs ev-l{N}-p{M} with legacyProblemId mapping table in Page 2.
+Removed slug completion maps to successor per migration table.
+
+Mastery rule — revised
+Learner masters the chapter if:
+all 15 problems complete
+final capstone (ev-l5-p3) correct
+learner distinguishes payout vs profit (ev-l4-p1) and equal EV vs risk (ev-l5-p2)
+at least 11 of 15 problems completed in ≤2 graded attempts
+required mastery tags demonstrated
+Post-completion practice restarts do not reduce mastery.
+
+Mastery states and milestones — update counts to 15-problem chapter; keep Lesson 1–4 completed milestones; "All simulations" applies to L1 problems.
+
+Security rules — unchanged.
+
+MVP only: five lessons, 15 problems. No AI in MVP.
+
+Expected Value Lab - MVP PRD Page 11
+Appendix — Build Order, Validation, and Release Testing
 
-Expected Value Lab - MVP PRD Page 10
-Appendix — Build Order, Validation, and Release Testing
-This page is not part of the product requirements; it is the recommended implementation sequence.
 Revised build order
-1. Preserve and validate the current stable app
-Confirm Firebase auth.
-Confirm user profile creation.
-Confirm existing progress documents.
-Confirm original problems still function.
-Add or preserve answer-normalization tests.
-2. Fix completed-problem review and restart
-Add completed-problem action choice.
-Add Review Mode.
-Add Restart This Problem.
-Preserve completed state.
-Preserve farthest progression.
-Fix Continue destination.
-Save review snapshots.
-3. Add problem onboarding and Learning Coach UI
-Reusable pre-problem demo.
-Demo configuration.
-Current-task panel.
-Step checklist.
-Higher feedback placement.
-Longer learning-oriented explanations.
-Show demo again.
-Mobile and accessibility pass.
-4. Introduce the 5-lesson architecture
-Add chapter → lesson → problem hierarchy.
-Map the original 8 problems into lessons.
-Preserve original IDs.
-Add lesson progress.
-Update navigation.
-Adapt the course map to lesson zones.
-Do not add new problems until this structure is stable.
-5. Add the 12 new problems in controlled batches
-Batch 1:
-Lesson 1 new problems
-Lesson 2 new problems
-Batch 2:
-Lesson 3 new problems
-Lesson 4 new problems
-Batch 3:
-Lesson 5 new problems
-Final capstone
-Each batch includes:
-problem data
-visuals
-demos
-checkers
-accepted formats
-mistake rules
-feedback
-hints
-animations
-validation cases
-6. Persistence and mastery migration
-Add lesson progress.
-Add problem review snapshots.
-Add demo-seen state.
-Add restart/practice tracking.
-Update mastery from 8 to 20 problems.
-Confirm existing users do not lose progress.
-7. Home and pathway visual pass
-Add the right-side current-chapter panel.
-Add compact golf-course progression map.
-Add 5 lesson zones.
-Add 20 holes.
-Add current-problem glow.
-Add completed and future states.
-Add final capstone treatment.
-Test mobile stacking.
-8. Accessibility and mobile pass
-Tap-to-place for every relevant interaction.
-Keyboard navigation.
-Focus states.
-Feedback live regions.
-Reduced-motion support.
-Phone-width testing.
-No horizontal overflow.
-Large touch targets.
-9. Deploy and test
-Deploy publicly.
-Test multiple users.
-Test sign-in and sign-out.
-Test saved progress.
-Test review and restart.
-Test every lesson boundary.
-Test completion and mastery.
-Test Firestore security rules.
-Automated validation
-Answer-parser tests
-Test:
-money normalization
-numeric normalization
-fractions
-percentages
-decimal tolerance
-classification normalization
-approved deterministic explanation matching
-Problem-checker tests
-For all 20 problems:
-accepted correct formats pass
-specified equivalent formats pass
-obvious incorrect answers fail
-known mistake types are detected
-completion rules are enforced
-incomplete guards do not count as wrong attempts
-Session tests
-Test:
-editing clears stale feedback
-corrected resubmission passes
-correct multi-field values remain
-wrong graded submissions increment attempts
-review does not increment attempts
-restart does not erase completion
-restart does not reduce overall progression
-Continue targets the next incomplete problem
-Progress tests
-Test:
-lesson completion
-chapter completion
-20-problem percentage
-highest sequential progress
-completedProblemIds uniqueness
-completedLessonIds
-mastery calculation
-practice attempts excluded from mastery penalties
-Manual MVP testing scenario
-A new learner:
-Signs in with Google.
-Sees the home page.
-Sees a right-side Expected Value Course panel.
-Sees the current hole glowing.
-Starts Lesson 1.
-Receives a short visual demo before the spinner problem.
-Completes the demo without creating an attempt.
-Predicts the spinner average.
-Runs the required simulation.
-Submits a wrong answer.
-Sees learning-oriented feedback high on the page.
-Corrects the answer directly.
-Completes the problem.
-Leaves the chapter.
-Returns to the same completed problem.
-Selects Review Problem.
-Sees the saved result without restarting.
-Selects Restart This Problem.
-Practices it again without losing forward progress.
-Continues to the next incomplete problem.
-Gets a counts-to-probability question wrong.
-Receives a visual hint.
-Leaves mid-lesson.
-Returns to the same active problem.
-Completes all 5 lessons and 20 problems.
-Sees completion, mastery, streak, milestones, and suggested review areas.
-Reviews an earlier problem while Continue still points to the correct forward problem.
-Completes the final capstone.
-Sees the final golf-course hole completed.
-Repeats the main flow at mobile width.
-Parallel implementation rules
-To minimize merge conflicts:
-Only one agent edits progress, routing, and shared chapter architecture at a time.
-Complete and commit review/restart behavior before lesson restructuring.
-Complete and commit lesson restructuring before adding new problems.
-Problem agents should own separate problem batches.
-Shared registries should be integrated serially.
-Validation-only agents should create new test or report files rather than modifying active UI files.
-Each stage must build and pass tests before the next stage branches from it.
-No agent should change unrelated Firebase auth files.
-Do not push remote changes unless explicitly approved.
-MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 20 problems. No AI in MVP.
+1. Preserve stable app (auth, progress, original eight problems).
+2. Completed-problem review and restart.
+3. Learning Coach + compact two-region ProblemLayout (UX binding — no scroll-chasing).
+4. Migrate chapter model to 5×3 = 15 problems with legacy mapping.
+5. Implement/revise 15 problems per specs (batch by lesson).
+6. Persistence migration: 20→15 resolver, mastery 11/15, golf map 15 holes.
+7. Home/pathway visual pass (15 holes).
+8. Accessibility/mobile pass (tap-to-place, sticky task, feedback viewport).
+9. Deploy and test.
 
+Automated validation — update to 15 problems.
+Progress tests: 15-problem percentage, 3 per lesson, mastery 11/15.
+
+Manual MVP testing scenario — update references from 20 to 15; verify compact workspace on Lesson 1 chip bag problem.
+
+Appendix — Problem validation matrix (summary)
+For each ev-l{N}-p{M}: checker tests for accepted formats, mistake types, completion guards, workspace contains feedback without scroll at 1280×720.
+
+MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 15 problems. No AI in MVP.
