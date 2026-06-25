Expected Value Lab - MVP PRD Page 1
PRD
Expected Value Lab: A learn-by-doing MVP for one introductory probability chapter

This PRD edit is planning/spec only. No application code was changed.

PRD change summary (2026-06-24 — fun tactile P1 pass)
Every lesson’s Problem 1 is now specified as a fun, animated, tactile concept-introduction mini-game rather than a worksheet-style exercise. Each P1 includes a dedicated “Fun animation and interaction” section with exact motion specs, reduced-motion alternatives, and explicit teaching purpose. Lesson 1 Problem 1 is revised from chip-bag draws to **Dice Toss Average** (drag-and-throw dice). Lesson 5 Problem 1 is revised from a dense full-model table to a playful **Carnival Booth Preview** side-by-side comparison so it does not duplicate the L5P3 capstone. Legacy storage IDs (problem-1 … problem-8) are unchanged; only interaction and animation specs evolve.

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
| Lesson | P1 | P2 | P3 | Total | Justification |
|--------|----|----|-----|-------|-----------------|
| 1 | 2.5 min | 2.5 min | 2.5 min | ~7.5 min | Discovery draw + one weighted sim + comparison choice; minimal reading |
| 2 | 2.5 min | 2.5 min | 3 min | ~8 min | Formula placement + matching + diagnose; tight tables |
| 3 | 3 min | 2.5 min | 3 min | ~8.5 min | Reveal/table fill is slightly heavier; still within cap with collapsible help |
| 4 | 2.5 min | 2.5 min | 2.5 min | ~7.5 min | Balance-scale + bucket sort + two-card profit compare |
| 5 | 3 min | 2.5 min | 3.5 min | ~9 min | Capstone is dense; tension documented below — split into stepped table rows to stay near 8 min |

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
Compact two-region problem workspaces (visual + controls/feedback) on desktop and tablet.
Mobile layouts that avoid scroll-chasing between visual, input, and feedback.
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

Expected Value Lab - MVP PRD Page 2
Problem-Page UX Requirements

Binding rule: the learner must never repeatedly scroll down to interact and scroll back up to inspect the visual, task, feedback, or result. All information and controls for the current step remain spatially connected.

Interaction-coherence checklist (every problem)
What am I looking at?
What can I manipulate?
What should I do now?
What changed because of my action?
Was my reasoning correct?
What should I do next?

Desktop and tablet layout (≥768px width, landscape tablet included)
When a problem has both a significant visual and significant interaction, use a compact two-region workspace:
Left region (~55%): teaching visual, simulation, concrete objects, graph, or scenario state.
Right region (~45%): current task, checklist, interactive controls, answer fields, check action, hints, feedback, Continue.
Regions may be reversed when interaction order benefits (e.g., left-to-right reading of a formula built on the right).
Requirements:
Visual and control regions visible together in the initial viewport.
Primary controls beside the visual they affect.
Feedback beside or directly beneath the active control — not at the bottom of a long page.
Submit/check visible without return scroll.
Current-task instruction visible while acting.
Corrected answers editable in place.
Results and Continue within the same workspace.
Secondary information collapsible; must not push the active task out of the working area.

Viewport standard
Target desktop working viewport: 1280×720 CSS pixels (minimum supported active workspace: 1024×640).
Essential visible state: problem title, current instruction, required visual, active interaction, check/submit, feedback location, completion state.
Do not shrink below accessible sizes to avoid scrolling.

Mobile layout (<768px)
Side-by-side not required. Same no-scroll-chasing principle:
Compact visual immediately above active controls, OR shortened persistent visual summary while interacting.
Sticky current-task/action area during input.
Feedback inserted beside or immediately beneath affected input.
Collapsible nonessential explanation.
Segmented steps may each contain visual + input + feedback.
No horizontal scrolling. Touch targets ≥44px. Tap alternatives for all drag placements.
Feedback auto-enters viewport; learner never returns to page top to read result.

Educational-app UX benchmark
Products reviewed (public descriptions and design case studies only — no proprietary assets copied):
Brilliant.org — unified solvable flow, feedback banner near attempt, multi-try correction, bite-sized steps, progress path.
Khan Academy exercises — question + workspace proximity, immediate check, hint escalation.
Numworks fair-games activities — concrete carnival scenarios before notation.
OpenStax / Berkeley SticiGui — manipulation and long-run language before formulas.

Reusable principles incorporated:
One focused task at a time.
Manipulation before notation.
Immediate local feedback and in-place correction.
Visual cause-and-effect beside controls.
Progressive disclosure via checklist steps.
Compact problem layouts fitting one working viewport.
Fast correction loops without page reset.
Clear next action after every check.

Explicit: proprietary Brilliant screens, artwork, lesson text, and branded layouts are not copied. Only general interaction patterns inform this PRD.

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
Spinner-only intro for every lesson (rejected — overused; L1 uses chip bag).
Repair-table remediation as lesson assessment (rejected L3 — diagnostic not fluency).
Separate low-risk vs high-risk duplicate (rejected L5 — merged into capstone risk MC).
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
Carnival wheel full model → L5P1 intro.
Guaranteed vs variable same-EV → L5P2 risk intuition.
12-section capstone → L5P3 chapter capstone.

Cohesion decisions:
Each lesson follows Intro (visual/concrete) → Guided (scaffolded structure) → Fluency (transfer, less scaffolding).
Removed one problem per lesson that duplicated the fluency skill or was remedial rather than assessable.
Short-run sampling nuance folded into L1P1 hints and L1P2 simulation copy rather than a standalone problem.

Remaining evidence gaps:
Risk is introduced qualitatively (spread/variability) without standard deviation calculation — appropriate for MVP scope.

Legacy ID and progress compatibility
The chapter shrinks from 20 to 15 problems. Storage IDs for the original eight implemented problems (problem-1 … problem-8) are preserved. Canonical slugs renamed to ev-l{N}-p{M} pattern; legacy slugs remain in legacyProblemId field.

Implemented behavior audit (pre-sync codebase):
| Legacy chapter # | Storage ID | Component / pack | Behavior summary |
|------------------|------------|------------------|------------------|
| 1 | problem-1 | Problem1LongRunAverage | Target: Dice Toss Average — drag-throw die, 1–3→$0 / 4–6→$10, predict EV $5 |
| 5 | problem-2 | pack-a l2-build-weighted-average | Tap-to-place EV formula for 25%/75% spinner |
| 9 | problem-3 | pack-a l3-mystery-box-outcomes | Six mystery boxes, count/probability table |
| 10 | problem-4 | pack-a l3-calculate-ev-from-table | Contribution rows → EV $4 |
| 13 | problem-5 | Problem5PayoutVsProfit | Playground balance scale then payout−cost profit $1 |
| 14 | problem-6 | Problem6FairnessSort | Sort games into fair/favorable/unfavorable buckets |
| 17 | problem-7 | Problem7WholeEVModel | Target: Carnival Booth Preview (playful intro; not full capstone table) |
| 18 | problem-8 | Problem8SameEVDifferentRisk | Guaranteed $5 vs 50/50 $10/$0, risk compare |

Removed problems — progress resolution (completion of legacy slug counts as completion of mapped successor):
| Removed slug | Was lesson slot | Maps to | Rationale |
|--------------|-----------------|---------|-----------|
| l1-short-run-vs-long-run | L1 P3 | ev-l1-p2 | Sampling noise taught via L1P2 sim copy |
| l2-fill-missing-formula | L2 P3 | ev-l2-p3 | Formula fluency covered by diagnose |
| l3-repair-probability-table | L3 P3 | ev-l3-p3 | Table repair subsumed by full build |
| l4-find-fair-price | L4 P3 | ev-l4-p3 | Fair price logic in compare + capstone |
| l5-low-risk-vs-high-risk | L5 P3 | ev-l5-p3 | Risk compare merged into capstone MC |

Migration rules:
completedProblemIds retains historical storage IDs; resolver maps legacy slugs to new canonical slugs.
If a removed slug is present in completedProblemIds, treat mapped successor as complete for progression and percentage.
Content reuse ≠ ID reuse: problem-1 storage ID now maps to ev-l1-p1 (chip bag target spec); learner progress on problem-1 preserved.
highestSequentialCompletedGlobalIndex recomputed on 0..14 scale.
Chapter completion: completed unique canonical problems ÷ 15 × 100.
Lesson completion: completed in lesson ÷ 3 × 100.
Mastery threshold: 11 of 15 problems (≈75%) completed in ≤2 graded attempts, plus capstone and tag requirements unchanged in spirit.

Curriculum cohesion matrix
| ID | Concept | Prior knowledge | New representation | Math demand | Scaffold | Misconceptions | Predecessor link | Successor prep | Source | Time | Distinct evidence |
|----|---------|-----------------|-------------------|-------------|----------|----------------|------------------|----------------|--------|------|-------------------|
| ev-l1-p1 | Long-run average | Basic probability | Drag-throw dice + running avg | Mean of die faces | High | Single throw = EV | — | Weighted wheel | OpenStax die EV | 2.5m | Tactile sim |
| ev-l1-p2 | Weighted long-run | L1P1 | Unequal spinner | Weighted mean | Med | Ignore probability | L1P1 | Compare games | OpenStax | 2.5m | 25/75 sim |
| ev-l1-p3 | Compare EV | L1P1-2 | Dual spinner cards | Equality of EV | Low | Max payout / freq | L1P2 | L2 formula | PCC carnival | 2.5m | Fluency |
| ev-l2-p1 | Weighted average | L1 | Formula builder | Σ x p | High | Swap outcome/prob | L1P3 | Matching | LibreTexts | 2.5m | Build model |
| ev-l2-p2 | Outcome-prob pairs | L2P1 | Match columns | Three pairs | Med | Rank by size | L2P1 | Diagnose | OpenStax table | 2.5m | Pairing |
| ev-l2-p3 | Complete model | L2P1-2 | Formula checklist | Diagnose errors | Low | Omit zero term | L2P2 | L3 counts | SticiGui | 3m | Fluency |
| ev-l3-p1 | Counts→prob | L2 | Mystery boxes | 1/6, 2/6, 3/6 | High | Count as prob | L2P3 | Contributions | PCC | 3m | Table rows |
| ev-l3-p2 | Contributions | L3P1 | EV table | Row products | Med | Unweighted sum | L3P1 | Full table | OpenStax | 2.5m | Sum EV |
| ev-l3-p3 | Full table | L3P1-2 | Token bag 10 | All columns | Low | Wrong denom | L3P2 | L4 cost | Numworks | 3m | Fluency |
| ev-l4-p1 | Payout vs profit | L3 | Balance scale | Subtract cost | High | Answer payout | L3P3 | Classify | Open Oregon | 2.5m | Profit $1 |
| ev-l4-p2 | Fairness class | L4P1 | Three buckets | Sign of profit | Med | Payout size | L4P1 | Compare | Numworks | 2.5m | Classify |
| ev-l4-p3 | Compare profit | L4P1-2 | Two game cards | Max profit | Low | Max payout | L4P2 | L5 model | Math in Society | 2.5m | Fluency |
| ev-l5-p1 | EV vs experience | L4 | Carnival booth preview | Qualitative compare | High | EV = feel | L4P3 | Risk sim | OpenStax spread | 3m | Playful intro |
| ev-l5-p2 | Same EV, risk | L5P1 | Flat vs jump sim | Qualitative risk | Med | EV=risk | L5P1 | Capstone | OpenStax spread | 2.5m | Variability |
| ev-l5-p3 | Capstone | All | 12-section wheel | Full decision | Low | Fair=no risk | L5P2 | — | Numworks+carnival | 3.5m | Chapter mastery |

References
- Math in Society (Expected Value): https://spot.pcc.edu/math/mathinsociety/chap_four_expected_value.html
- OpenStax Introductory Statistics 2e §4.2: https://openstax.org/books/introductory-statistics-2e/pages/4-2-mean-or-expected-value-and-standard-deviation
- Berkeley SticiGui (Expectation): https://www.stat.berkeley.edu/~stark/SticiGui/Text/expectation.htm
- SLCC Discrete EV: https://slcc.pressbooks.pub/engr2550textbook/chapter/4-3-expected-value-and-standard-deviation-for-a-discrete-probability-distribution/
- LibreTexts Expected Value §9.8: https://math.libretexts.org/Courses/SUNY_Geneseo/Math_113%3A_Finite_Math_for_Society/09%3A_Probability/9.08%3A_Expected_Value
- Open Oregon Expected Value: https://openoregon.pressbooks.pub/math/chapter/expected-value/
- Numworks Fair Games: https://www.numworks.com/educators/activities/statistics/fair-games/

MVP Problem Specs — 15 problems follow on subsequent pages.

Expected Value Lab - MVP PRD Page 3
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
Left region (~55%): felt table, throw zone, draggable die, winnings tray, running-average graph with $5 reference.
Right region (~45%): current task, prediction, throw count summary, average input, Check, hints, feedback, Continue.
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

Expected Value Lab - MVP PRD Page 4
Lesson 2 of 5: Expected Value as a Weighted Average
Lesson goal: construct expected value by pairing each outcome with its probability and adding contributions.
Estimated lesson time: ~8 minutes.


Lesson 2, Problem 1 — Build the Weighted Average
Stable problem ID: ev-l2-p1
Legacy ID mapping: problem-2 / l2-build-weighted-average
Instructional role: Interactive Concept Introduction
Estimated completion time: 2.5 min

Concept
Expected value is a weighted average of outcomes.
Scenario
A spinner has:
25% chance of $20
75% chance of $0
Pre-problem mini-demo
Identify dollar cards as outcomes.
Identify percentage cards as probabilities.
Demonstrate tap a card, then tap a formula slot.
Explain that every term uses outcome × probability.
Visual + interaction
Spinner with one quarter labeled $20.
Three quarters labeled $0.
Formula builder:
EV = ___ × ___ + ___ × ___
Cards:
$20
$0
25%
75%
Tap-to-select and tap-to-place are required.
Drag/drop may also be available.
Clear placement and replace placement controls.
Numeric EV field.
Current-task checklist
Place the two outcome cards.
Place the two probability cards.
Check both outcome-probability pairs.
Submit the numeric EV.
Answer and completion rules
Correctly place both outcome-probability pairs.
Submit final EV.
Pair order may be reversed as long as each outcome remains matched to its correct probability.
Correct models include:
20 × 0.25 + 0 × 0.75
0 × 0.75 + 20 × 0.25
Final EV = 5.
Accepted answer formats
5
5.0
5.00
$5
$5.00
Mistake types
Reversed outcome and probability.
Matched an outcome with the wrong probability.
Omitted a probability.
Used $20 as the answer because it is the largest payout.
Omitted the $0 outcome.
Feedback
“A dollar value is an outcome and a percent is a probability. Each term should read outcome × probability. Pair $20 with 25%, because that is how often the $20 outcome occurs.”
Teaching animation
Selected cards lift or glow.
Correct cards snap into slots.
Dollar cards and probability cards receive distinct visual treatments.
Reversed types briefly highlight the correct slot categories.
Reduced-motion mode uses immediate highlights.

Desktop workspace arrangement
Target viewport: 1280×720
Left region: Spinner + formula strip
Right region: Cards, slots, EV input, check
Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
Feedback appears in the right region directly beneath the active input or check action.
Continue appears in the right region after completion.

Mobile workspace arrangement
Spinner thumbnail + formula stack
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
See Appendix — Problem validation matrix for ev-l2-p1.


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

Expected Value Lab - MVP PRD Page 5
Lesson 3 of 5: Counts, Tables, and Discrete Outcomes
Lesson goal: convert counts to probabilities, organize tables, calculate EV.
Estimated lesson time: ~8.5 minutes (within target via collapsible reference).


Lesson 3, Problem 1 — Mystery Box Outcomes
Stable problem ID: ev-l3-p1
Legacy ID mapping: problem-3 / l3-mystery-box-outcomes
Instructional role: Interactive Concept Introduction
Estimated completion time: 3 min

Concept
Expected value can be calculated from counts rather than prewritten percentages.
Scenario
Bob chooses one of 6 boxes:
1 box has $12
2 boxes have $6
3 boxes have $0
Pre-problem mini-demo
Demonstrate tapping one box to reveal its prize.
Show how matching payouts receive the same color.
Explain that count means the number of matching boxes.
Explain that probability means matching count divided by 6 total boxes.
Visual + interaction
Six clickable boxes.
Learner taps each box to reveal the prize.
App groups boxes by outcome.
Table:
Outcome | Number of Boxes | Probability
The active row highlights matching boxes.
Count and probability fields have inline validation.
Current-task checklist
Reveal all six boxes.
Complete the $12 row.
Complete the $6 row.
Complete the $0 row.
Confirm probabilities account for all six boxes.
Answer and completion rules
Reveal all boxes.
Complete every count and probability cell correctly.
Correct rows:
$12 → 1 box → 1/6
$6 → 2 boxes → 2/6 or 1/3
$0 → 3 boxes → 3/6 or 1/2
Accepted probability formats
For 1/6:
1/6
0.1667
0.167
For 2/6:
2/6
1/3
0.3333
0.333
For 3/6:
3/6
1/2
0.5
.5
50%
Mistake types
Entered counts as probabilities.
Used the wrong denominator.
Probabilities do not sum to 1.
Ignored the $0 outcome.
Entered the total number of boxes in a count cell.
Feedback
“You entered 2 as the probability. That is the number of $6 boxes. Probability compares that count with all 6 boxes, so enter 2/6 or an equivalent value such as 1/3.”
Teaching animation
Boxes flip or pop open.
Matching outcomes receive consistent colors.
Active table rows highlight the corresponding boxes.
Probability hints animate the structure count / 6.

Desktop workspace arrangement
Target viewport: 1280×720
Left region: Six mystery boxes + grouping colors
Right region: Table fields, confirm button
Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
Feedback appears in the right region directly beneath the active input or check action.
Continue appears in the right region after completion.

Mobile workspace arrangement
Boxes grid then table
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
See Appendix — Problem validation matrix for ev-l3-p1.


Lesson 3, Problem 2 — Calculate EV from the Table
Stable problem ID: ev-l3-p2
Legacy ID mapping: problem-4 / l3-calculate-ev-from-table
Instructional role: Guided Application
Estimated completion time: 2.5 min

Concept
Calculate EV by summing each outcome × probability contribution.
Scenario
The problem continues from the 6 mystery boxes.
Pre-problem mini-demo
Highlight one table row.
Animate outcome × probability.
Show the result entering a contribution cell.
Explain that final EV is the sum of all row contributions.
Visual + interaction
Boxes collapse into colored EV chunks.
Expression:
12 × 1/6 + 6 × 2/6 + 0 × 3/6
Three contribution fields.
Final EV field.
Color links between boxes, rows, and contribution chunks.
Answer and completion rules
Correct contributions:
12 × 1/6 = 2
6 × 2/6 = 2
0 × 3/6 = 0
Final EV:
4
Completion requires all three contributions and final EV.
Accepted answer formats
Contributions:
2
2.0
$2 where money formatting is allowed
0
$0
Final EV:
4
4.0
4.00
$4
$4.00
Mistake types
Arithmetic error.
Omitted the $0 row.
Summed payouts without probability weighting.
Added probabilities rather than contributions.
Used box counts directly as multipliers.
Feedback
“The setup is close, but a contribution is payout × probability. For the $6 row, calculate 6 × 2/6. Do not add $12 and $6 directly because the outcomes do not occur every time.”
Teaching animation
Each row transforms into a colored contribution chunk.
Contributions move toward the final EV total.
Correct completion combines the chunks into $4.

Desktop workspace arrangement
Target viewport: 1280×720
Left region: Collapsed box groups as colored chunks + expression
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


Lesson 3, Problem 3 — Prize Bag EV Table
Stable problem ID: ev-l3-p3
Legacy ID mapping: l3-prize-bag-ev-table
Instructional role: Independent Fluency Check
Estimated completion time: 3 min

Concept
Build a complete expected value table from physical counts.
Scenario
A bag contains 10 tokens:
2 tokens pay $15
3 tokens pay $5
5 tokens pay $0
Pre-problem mini-demo
Group matching token outcomes.
Convert count to probability using 10 total tokens.
Demonstrate the meaning of a contribution cell.
Explain that the final EV is the sum of contributions.
Visual + interaction
A bag and 10 token icons.
Outcome grouping.
Blank table:
Outcome | Count | Probability | Contribution
Final EV field.
Matching visual colors.
Answer and completion rules
Correct rows:
$15 → count 2 → probability 2/10 or 0.2 → contribution 3
$5 → count 3 → probability 3/10 or 0.3 → contribution 1.5
$0 → count 5 → probability 5/10 or 0.5 → contribution 0
Final EV:
4.5
Accepted answer formats
Equivalent fractions
Equivalent decimals
4.5
4.50
$4.50
$4.5
Mistake types
Count/probability confusion.
Wrong denominator.
Arithmetic error.
Omitted the $0 outcome.
Summed payouts without weighting.
Used total token payout instead of EV per selection.
Feedback
“Contribution is payout × probability. For the $15 tokens, there are 2 out of 10, so the contribution is 15 × 2/10 = 3. Repeat that process for each outcome before adding.”

Desktop workspace arrangement
Target viewport: 1280×720
Left region: Bag + 10 grouped tokens
Right region: Full editable table + EV field
Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
Feedback appears in the right region directly beneath the active input or check action.
Continue appears in the right region after completion.

Mobile workspace arrangement
Token summary strip + table
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

Expected Value Lab - MVP PRD Page 6
Lesson 4 of 5: Expected Payout, Expected Profit, and Fairness
Estimated lesson time: ~7.5 minutes.


Lesson 4, Problem 1 — Expected Payout vs Expected Profit
Stable problem ID: ev-l4-p1
Legacy ID mapping: problem-5 / l4-payout-vs-profit
Instructional role: Interactive Concept Introduction
Estimated completion time: 2.5 min

Concept
Expected payout and expected profit are different when there is a cost to play.
Scenario
The mystery-box game has:
expected payout = $4
entry cost = $3
Pre-problem mini-demo
Identify expected payout before cost.
Identify the cost block.
Demonstrate that cost moves the result downward.
Show the formula:
Expected profit = expected payout − cost
Visual + interaction
Balance scale or equation strip.
Expected payout block: +$4.
Cost block: −$3.
Learner taps the cost block into the equation.
Expected profit input.
Visual movement from $4 to $1.
Answer and completion rules
Select payout − cost.
Submit expected profit = 1.
Accepted answer formats
1
1.0
1.00
$1
$1.00
Correct model
Expected profit = 4 − 3 = 1
Mistake types
Answered expected payout $4.
Added cost instead of subtracting.
Treated cost as probability.
Entered −1 by reversing payout and cost.
Feedback
“You calculated or repeated the expected payout, but the question asks for expected profit. Profit includes the amount paid to play. Start with $4 and subtract the $3 cost.”
Teaching animation
Cost block pulls the result from $4 toward $1.
Adding cost incorrectly moves the indicator in the wrong direction.
Correct completion emphasizes the remaining $1.

Desktop workspace arrangement
Target viewport: 1280×720
Left region: Balance scale + payout/cost blocks
Right region: Tap cost, profit input, check
Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
Feedback appears in the right region directly beneath the active input or check action.
Continue appears in the right region after completion.

Mobile workspace arrangement
Scale mini + equation stack
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
See Appendix — Problem validation matrix for ev-l4-p1.


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

Expected Value Lab - MVP PRD Page 7
Lesson 5 of 5: Same EV, Different Risk, and Full EV Models
Estimated lesson time: ~9 min target with step compression (~8 min achievable).


Lesson 5, Problem 1 — Build the Whole EV Model
Stable problem ID: ev-l5-p1
Legacy ID mapping: problem-7 / l5-build-whole-ev-model
Instructional role: Interactive Concept Introduction
Estimated completion time: 3 min

Concept
Independently convert a game into probabilities, contributions, expected payout, expected profit, and a decision.
Scenario
A carnival wheel has 10 equal sections:
1 section pays $30
2 sections pay $10
7 sections pay $0
cost to spin = $5
Pre-problem mini-demo
Group sections by payout.
Explain selected sections / 10 total.
Explain contribution = outcome × probability.
Explain expected payout − cost.
Map expected profit to the fairness decision.
Visual + interaction
Ten-section wheel.
Learner taps sections to group by payout.
Blank table:
Outcome | Probability | Contribution
Fields:
expected payout
cost
expected profit
decision
Formula is not prefilled.
Answer and completion rules
Probabilities:
$30 → 1/10 or 0.1
$10 → 2/10 or 0.2
$0 → 7/10 or 0.7
Contributions:
3
2
0
Expected payout:
5
Expected profit:
0
Decision:
Fair
Completion requires every required field and decision.
Mistake types
Wrong denominator.
Counted sections but did not convert to probability.
Used payout values as contributions.
Calculated payout but not profit.
Marked the game favorable because payout is positive.
Ignored the $0 sections.
Visual hint rules
Probability hint highlights matching wheel sections and displays selected / 10.
Contribution hint animates outcome × probability for the active row.
Profit hint balances payout $5 and cost $5.
Decision hint places expected-profit dot at zero.
Feedback
“You found the expected payout, but the decision uses expected profit. The game pays $5 on average and costs $5, so the expected profit is zero. A zero expected profit means the game is fair.”

Desktop workspace arrangement
Target viewport: 1280×720
Left region: 10-section wheel + grouping taps
Right region: Table fields, payout/cost/profit/decision
Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
Feedback appears in the right region directly beneath the active input or check action.
Continue appears in the right region after completion.

Mobile workspace arrangement
Wheel summary + one active table row
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
See Appendix — Problem validation matrix for ev-l5-p1.


Lesson 5, Problem 2 — Same Expected Value, Different Risk
Stable problem ID: ev-l5-p2
Legacy ID mapping: problem-8 / l5-same-ev-different-risk
Instructional role: Guided Application
Estimated completion time: 2.5 min

Concept
Expected value does not describe the full experience of uncertainty. Two games can have the same EV but different risk.
Scenario
Game A:
guaranteed $5
Game B:
50% chance of $10
50% chance of $0
Pre-problem mini-demo
Show Game A’s flat outcome line.
Show Game B’s jumping outcome line.
Explain that both running averages can approach $5.
Explain that risk is represented by variation or spread.
Visual + interaction
Game A card with solid bar at $5.
Game B card split between $10 and $0.
Twenty simulated trials per game.
Outcome plots.
Running-average graphs.
EV fields.
Risk selector.
Explanation selector.
Answer and completion rules
Run both simulations.
EV(A) = 5.
EV(B) = 5.
More risk = Game B.
Reason = variable outcomes despite the same long-run average.
Accepted answer formats
EV fields:
5
5.0
$5
Risk:
Game B
B
Correct deterministic choice
Explanation:
Prefer multiple choice.
If deterministic text input exists, accept approved keyword combinations such as:
variable outcomes
more spread
can be 0 or 10
same EV, different risk
No semantic model matching is allowed.
Mistake types
Claimed Game B has higher EV because it can pay $10.
Claimed the games are identical because EV is identical.
Confused an average with a guaranteed result.
Selected Game A as riskier because its outcome is fixed.
Feedback
“Both games average $5, but they do not feel the same to play. Game A always pays $5. Game B moves between $0 and $10, so its outcomes have more spread and therefore more risk.”
Teaching animation
Game A remains flat.
Game B visibly jumps.
Both running averages move toward $5.
Correct completion overlays the same-average line while preserving different spread.

Desktop workspace arrangement
Target viewport: 1280×720
Left region: Flat bar vs split bar + outcome plots
Right region: Sim buttons, EV inputs, risk MC
Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
Feedback appears in the right region directly beneath the active input or check action.
Continue appears in the right region after completion.

Mobile workspace arrangement
Dual sim panels stacked compactly
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
See Appendix — Problem validation matrix for ev-l5-p2.


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

Expected Value Lab - MVP PRD Page 8
Cross-Problem Learning, Demonstration, Feedback, and Answer Rules

Pre-problem mini-demo system
Unchanged in spirit: first visit shows demo; Show demo again available; demo does not count as attempt.

Current-task panel and step checklist
Rendered in the right region (desktop) or sticky strip (mobile) — never separated from active inputs by the visual.

Learning Coach feedback panel — revised placement
Desktop/tablet: right region directly beneath the active input/check — not upper-right distant from controls.
Mobile: immediately beneath the input that was checked; auto-scroll into viewport.
Wrong feedback: what happened / why wrong / next action (3–5 sentences).
Correct feedback: 1–2 sentences + Continue in same workspace.

Flexible deterministic answer normalization
Unchanged: money, probability, classification rules as prior PRD.

Direct correction, attempt rules, hints, animations, accessibility
Unchanged except all interactions must satisfy tap-to-place and compact workspace rules above.

MVP only: five lessons, 15 problems. No AI in MVP.

Expected Value Lab - MVP PRD Page 9
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

Expected Value Lab - MVP PRD Page 10
Tech Stack, Data Schema, and Mastery

Tech stack — unchanged.

Data schema — unchanged document shapes; globalProblemIndex now 0..14; PROBLEMS_PER_LESSON = 3.

Problem JSON object — add fields where needed:
desktopWorkspaceLayout
mobileWorkspaceLayout
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

Expected Value Lab - MVP PRD Page 11
Appendix — Build Order, Validation, and Release Testing

Revised build order
1. Preserve stable app (auth, progress, original eight problems).
2. Completed-problem review and restart.
3. Learning Coach + compact two-region ProblemLayout (UX binding — no scroll-chasing).
4. Migrate chapter model to 5×3 = 15 problems with legacy mapping.
5. Implement/revise 15 problems per specs (batch by lesson).
6. Persistence migration: 20→15 resolver, mastery 11/15, golf map 15 holes.
7. Home/pathway visual pass (15 holes).
8. Accessibility/mobile pass (tap-to-place, sticky task, feedback viewport).
9. Deploy and test.

Automated validation — update to 15 problems.
Progress tests: 15-problem percentage, 3 per lesson, mastery 11/15.

Manual MVP testing scenario — update references from 20 to 15; verify compact workspace on Lesson 1 chip bag problem.

Appendix — Problem validation matrix (summary)
For each ev-l{N}-p{M}: checker tests for accepted formats, mistake types, completion guards, workspace contains feedback without scroll at 1280×720.

MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 15 problems. No AI in MVP.
