#!/usr/bin/env python3
"""Generate synced 15-problem PRD. Run from repo root: python3 docs/prompt-first/2026-06-24-sync-15-problems-ux/generate-prd.py"""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "prd.md"

PLANNING_NOTE = (
    "This PRD edit is planning/spec only. No application code was changed.\n"
)

# Shared UX block appended to every problem
def workspace_block(pid: str, desktop_left: str, desktop_right: str, mobile: str, viewport: str) -> str:
    return f"""Desktop workspace arrangement
Target viewport: {viewport}
Left region: {desktop_left}
Right region: {desktop_right}
Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
Feedback appears in the right region directly beneath the active input or check action.
Continue appears in the right region after completion.

Mobile workspace arrangement
{mobile}
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
See Appendix — Problem validation matrix for {pid}."""


def problem_header(
    num: int,
    lesson: int,
    role: str,
    title: str,
    slug: str,
    legacy: str,
    minutes: str,
) -> str:
    return f"""
Lesson {lesson}, Problem {num} — {title}
Stable problem ID: {slug}
Legacy ID mapping: {legacy}
Instructional role: {role}
Estimated completion time: {minutes}
"""


PROBLEMS = []  # filled below in main

HEADER = """Expected Value Lab - MVP PRD Page 1
PRD
Expected Value Lab: A learn-by-doing MVP for one introductory probability chapter

This PRD edit is planning/spec only. No application code was changed.

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
"""

UX_SECTION = """
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
| 1 | problem-1 | Problem1LongRunAverage | Playground phase (configurable spinner) then official 50/50 $10/$0 sim, predict $5 |
| 5 | problem-2 | pack-a l2-build-weighted-average | Tap-to-place EV formula for 25%/75% spinner |
| 9 | problem-3 | pack-a l3-mystery-box-outcomes | Six mystery boxes, count/probability table |
| 10 | problem-4 | pack-a l3-calculate-ev-from-table | Contribution rows → EV $4 |
| 13 | problem-5 | Problem5PayoutVsProfit | Playground balance scale then payout−cost profit $1 |
| 14 | problem-6 | Problem6FairnessSort | Sort games into fair/favorable/unfavorable buckets |
| 17 | problem-7 | Problem7WholeEVModel | Ten-section wheel, full EV table + fairness |
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
| ev-l1-p1 | Long-run average | Basic probability | Chip bag + running avg graph | Mean of two outcomes | High | Single outcome = EV | — | Weighted sections | Berkeley box | 2.5m | Sim evidence |
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
| ev-l5-p1 | Full EV model | L4 | Carnival wheel 10 | All fields | High | Payout≠profit | L4P3 | Risk | PCC wheel | 3m | Build |
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
"""

# I'll build problem bodies as a string in the script
def main():
    bodies = build_problem_specs()
    footer = build_footer()
    content = HEADER + UX_SECTION + bodies + footer
    OUT.write_text(content)
    print(f"Wrote {OUT} ({len(content.splitlines())} lines)")

def build_problem_specs() -> str:
    return PROBLEM_SPECS

PROBLEM_SPECS = r"""
Expected Value Lab - MVP PRD Page 3
MVP Problem Specs
Lesson 1 of 5: Expected Value as a Long-Run Average
Lesson goal: understand expected value as the average result over many repetitions rather than the result of one trial.
Estimated lesson time: ~7.5 minutes (P1 2.5 + P2 2.5 + P3 2.5).

""" + problem_header(1, 1, "Interactive Concept Introduction", "Carnival Chip Bag", "ev-l1-p1", "problem-1 (content evolved from spinner playground; storage ID preserved)", "2.5 min") + """
Concept
Expected value is the average outcome over many repetitions.
Scenario
A carnival booth has a bag of 10 chips: 5 show $0 and 5 show $10. The learner draws one chip at a time with replacement, stacks winnings, and watches the running average per draw.

Source-grounded problem pattern
Berkeley SticiGui "draw tickets from a box" long-run average; OpenStax emphasis on repeated trials approaching μ.
Selected over: plain 50/50 spinner (too generic per product bar); coin flips (streak confusion).
Adapted as: tactile chip bag with color-coded stacks and running-average graph.
Position: strongest concrete introduction before probability-weighted sections in L1P2.

Exact data
Outcomes: $10 (5 chips), $0 (5 chips). Total draws required: ≥100. Correct long-run average: $5.

Pre-problem mini-demo (4 steps)
1. Highlight five $0 and five $10 chips in the bag.
2. Demonstrate Draw 1 / Draw 10 / Draw 100.
3. Point to total winnings, draw count, average per draw.
4. Highlight running-average graph and $5 reference line.
CTA: "Predict where the average settles, then draw at least 100 times."
Buttons: Back, Next, Skip demo, Start Problem.

Visual state
Bag graphic with 10 visible chips; draw area; chip stack by outcome color; counters; running-average graph; horizontal reference at $5.

Interactive controls
Draw 1, Draw 10, Draw 100; prediction selector ($0, $5, $10); final average input; Check.

Current-task checklist
Submit a prediction → Run ≥100 draws → Identify long-run average $5 → Complete.

Required learner actions
Submit prediction; run ≥100 total draws; submit $5 as long-run average.

Answer and completion rules
Completion requires prediction submitted, ≥100 draws, correct average $5.
Normalized correct value = 5.

Accepted answer formats
5, 5.0, 5.00, $5, $5.00, 5 dollars, 5 per draw

Correct model
10 × 0.5 + 0 × 0.5 = 5

Deterministic normalization
Money tolerance ±0.01; prediction must be one of {0,5,10} before sim requirement satisfied.

Mistake classifications
chose-extreme-outcome | confused-single-draw-with-average | assumed-sample-equals-ev | selected-largest-payout

Wrong-answer feedback examples
"You chose one possible chip value, but expected value is the average over many draws. With equal $0 and $10 chips, look for the midpoint — $5."
Next: "Draw 100 times and watch where the average line settles."

Correct-answer feedback
"Correct — $5 is the long-run average. Equal chances of $0 and $10 balance halfway."

Hint sequence
H1: Watch the running-average line as draws increase (visual: graph).
H2: Two equally likely outcomes → midpoint between $0 and $10.
H3: 10×0.5 + 0×0.5 = 5.

Teaching animation
Chip flies from bag to stack; counters update; graph point added; $5 line emphasized after many draws.
Reduced-motion: instant state updates, no flight paths.

""" + workspace_block("ev-l1-p1",
    "Chip bag, stacks, running-average graph",
    "Task, prediction, draw buttons, average input, check, feedback, continue",
    "Compact bag+graph (max 160px tall) → draw buttons → input → check → feedback; sticky task strip",
    "1280×720 — active state fits without page scroll") + """

""" + problem_header(2, 1, "Guided Application", "Unequal Section Game", "ev-l1-p2", "l1-unequal-spinner", "2.5 min") + """
Concept
Expected value remains a long-run average when outcomes are not equally likely.
Scenario
Carnival wheel: 25% → $20, 75% → $0. Short-run samples may vary; theoretical average is $5.

Source pattern
OpenStax EV table with unequal probabilities; PCC weighted carnival sections.
Selected over: additional short-run-only problem (removed l1-short-run-vs-long-run).
Adapted: quarter-sized $20 slice visually dominant but labeled 25%.
Prepares: L1P3 comparison without re-explaining simulation mechanics.

Exact data
Outcomes: $20 at p=0.25, $0 at p=0.75. Min spins: 100. EV = $5.

Pre-problem mini-demo
Highlight 1/4 $20 section; explain area = probability; point to graph settling near $5.

Interactive controls
Spin Once / 10 / 100; prediction; average input; Check.

Completion rules
Prediction submitted; ≥100 spins; identify $5.

Accepted formats: 5, 5.0, $5, $5.00, 5 dollars
Mistake types: selected-largest-payout | ignored-probability | misapplied-probability | assumed-sample-equals-ev
Wrong feedback: "The $20 slice is only one quarter of the wheel — multiply $20 by 0.25."
Correct: "Correct — 20×0.25 + 0×0.75 = $5."

Hints: slice size → weight payout → compute 5.
Animations: slice pulse on $20 quarter; graph stabilizes.

""" + workspace_block("ev-l1-p2", "Unequal spinner + running-average graph", "Prediction, spin controls, average field, check, feedback", "Spinner summary sticky mini + controls stack", "1280×720") + """

""" + problem_header(3, 1, "Independent Fluency Check", "Compare Two Carnival Games", "ev-l1-p3", "l1-compare-spinners", "2.5 min") + """
Concept
Compare games by weighted long-run average, not largest payout or win frequency alone.
Scenario
Game A: 50% $10, 50% $0. Game B: 25% $20, 75% $0.

Source pattern
PCC / standard textbook "same EV different prizes" comparison.
Fluency requirement: independent comparison without being misled by max payout, frequency, or one short sim.

Exact data
EV(A)=EV(B)=5.

Interactive controls
Two game cards; optional Run 20 Spins each; comparison MC (A higher / B higher / Same); explanation MC.

Completion
Select Same EV + explanation both average $5.

Mistake types: maximum-payout-misconception | win-frequency-misconception
Wrong: "Spinner B pays more but less often; Spinner A wins more for less — both average $5."
Correct: "Correct — both games average $5 per play."

Hints: compare products 10×0.5 and 20×0.25.

""" + workspace_block("ev-l1-p3", "Two spinner cards + optional mini graphs", "Comparison choices, check, feedback", "Cards stack; MC immediately below; feedback inline", "1280×720") + """

MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 15 problems. No AI in MVP.

Expected Value Lab - MVP PRD Page 4
Lesson 2 of 5: Expected Value as a Weighted Average
Lesson goal: construct expected value by pairing each outcome with its probability and adding contributions.
Estimated lesson time: ~8 minutes.

""" + problem_header(1, 2, "Interactive Concept Introduction", "Build the Weighted Average", "ev-l2-p1", "problem-2 / l2-build-weighted-average", "2.5 min") + """
Concept: EV is a weighted average of outcomes.
Scenario: 25% → $20, 75% → $0.
Source: LibreTexts quiz-score weighted average analogy; OpenStax μ = Σ x·P(x).
Adapted: tap-to-place formula EV = ___×___ + ___×___ with $20, $0, 25%, 75% cards.

Exact data: pairs ($20,25%), ($0,75%); EV=5.

Demo: identify dollar vs percent cards; one placement example.
Controls: card bank, four slots, Check pairs, EV field, Check EV.
Completion: both pairs correct; EV=5.
Mistake types: reversed-outcome-probability | wrong-pairing | omitted-probability | used-largest-payout | arithmetic-error
Wrong: "A dollar is an outcome; a percent is a probability."
Correct: "Correct — 20×0.25 + 0×0.75 = $5."

""" + workspace_block("ev-l2-p1", "Spinner + formula strip", "Cards, slots, EV input, check", "Spinner thumbnail + formula stack", "1280×720") + """

""" + problem_header(2, 2, "Guided Application", "Match Outcomes to Probabilities", "ev-l2-p2", "l2-match-outcomes-probabilities", "2.5 min") + """
Concept: Each outcome pairs with P(that outcome).
Scenario: $12↔1/3, $3↔1/2, $0↔1/6.
Source: OpenStax discrete distribution tables.
Controls: three outcome rows, tap-to-match probability cards.
Completion: all three pairs correct including $0.
Mistake types: ranked-by-size | reused-probability | omitted-zero | wrong-pairing

""" + workspace_block("ev-l2-p2", "Outcome column + match lines", "Probability cards, row slots, check", "Two-column match UI", "1280×720") + """

""" + problem_header(3, 2, "Independent Fluency Check", "Diagnose Bad EV Setups", "ev-l2-p3", "l2-diagnose-bad-ev-setups", "3 min") + """
Concept: Complete model multiplies every outcome by its probability.
Scenario: $20@0.25, $4@0.25, $0@0.5. Formulas A: 20+4+0; B: 20×0.25+4×0.25; C: full.
Fluency: construct/diagnose complete weighted-average model.
Completion: select C; defect A = no weighting; B = omits $0 outcome.
Mistake types: summed-raw-payouts | chose-incomplete-setup | wrong-diagnosis

""" + workspace_block("ev-l2-p3", "Three formula cards with checklist icons", "Select valid + defect picks, check", "Formula cards stack; checklist toggles inline", "1280×720") + """

MVP only: five lessons, 15 problems. No AI in MVP.

Expected Value Lab - MVP PRD Page 5
Lesson 3 of 5: Counts, Tables, and Discrete Outcomes
Lesson goal: convert counts to probabilities, organize tables, calculate EV.
Estimated lesson time: ~8.5 minutes (within target via collapsible reference).

""" + problem_header(1, 3, "Interactive Concept Introduction", "Mystery Box Outcomes", "ev-l3-p1", "problem-3 / l3-mystery-box-outcomes", "3 min") + """
Concept: EV from counts, not prewritten percents.
Scenario: 6 boxes — 1×$12, 2×$6, 3×$0.
Source: PCC count-based probability models.
Controls: tap boxes to reveal; table Outcome|Count|Probability with inline validation.
Correct rows: $12→1→1/6; $6→2→2/6; $0→3→3/6.
Mistake types: counts-as-probabilities | wrong-denominator | entered-total-as-count | omitted-zero | probabilities-not-one

""" + workspace_block("ev-l3-p1", "Six mystery boxes + grouping colors", "Table fields, confirm button", "Boxes grid then table", "1280×720") + """

""" + problem_header(2, 3, "Guided Application", "Calculate EV from the Table", "ev-l3-p2", "problem-4 / l3-calculate-ev-from-table", "2.5 min") + """
Concept: EV = sum of contributions.
Scenario: continues 6-box data.
Source: OpenStax expected value table.
Contributions: 2, 2, 0; EV=4.
Controls: three contribution fields + EV field.

""" + workspace_block("ev-l3-p2", "Collapsed box groups as colored chunks + expression", "Contribution inputs, EV, check", "Expression + inputs stack", "1280×720") + """

""" + problem_header(3, 3, "Independent Fluency Check", "Prize Bag EV Table", "ev-l3-p3", "l3-prize-bag-ev-table", "3 min") + """
Concept: Build complete probability and contribution table from physical counts.
Scenario: 10 tokens — 2×$15, 3×$5, 5×$0.
Source: Numworks / standard token-bag exercises.
Fluency: fill Count, Probability, Contribution for all rows; EV=4.5.
Rows: $15→2→0.2→3; $5→3→0.3→1.5; $0→5→0.5→0.
Mistake types: count-prob-confusion | wrong-denominator | omitted-zero | unweighted-sum

""" + workspace_block("ev-l3-p3", "Bag + 10 grouped tokens", "Full editable table + EV field", "Token summary strip + table", "1280×720") + """

MVP only: five lessons, 15 problems. No AI in MVP.

Expected Value Lab - MVP PRD Page 6
Lesson 4 of 5: Expected Payout, Expected Profit, and Fairness
Estimated lesson time: ~7.5 minutes.

""" + problem_header(1, 4, "Interactive Concept Introduction", "Expected Payout vs Expected Profit", "ev-l4-p1", "problem-5 / l4-payout-vs-profit", "2.5 min") + """
Concept: Payout and profit differ when cost to play exists.
Scenario: expected payout $4, cost $3.
Source: Open Oregon payout−cost; implemented playground phase optional before official $4/$3 task.
Controls: balance scale; tap cost block; profit input.
Correct profit = 1.
Mistake types: answered-payout | added-cost | cost-as-probability | reversed-subtraction

""" + workspace_block("ev-l4-p1", "Balance scale + payout/cost blocks", "Tap cost, profit input, check", "Scale mini + equation stack", "1280×720") + """

""" + problem_header(2, 4, "Guided Application", "Fair, Favorable, or Unfavorable?", "ev-l4-p2", "problem-6 / l4-fair-favorable-unfavorable", "2.5 min") + """
Concept: profit sign determines classification.
Scenario: A payout $5 cost $5 (fair); B payout $7 cost $5 (+2); C payout $3 cost $5 (−2).
Source: Numworks fair games net gain buckets.
Controls: tap card → tap bucket; three buckets.
Completion: all three placed correctly.

""" + workspace_block("ev-l4-p2", "Three game cards with payout/cost bars", "Buckets + placement area, check", "Cards then buckets", "1280×720") + """

""" + problem_header(3, 4, "Independent Fluency Check", "Choose the Better Game After Cost", "ev-l4-p3", "l4-choose-better-game-after-cost", "2.5 min") + """
Concept: Compare expected profit, not payout alone.
Scenario: A payout $9 cost $7 → profit $2; B payout $6 cost $3 → profit $3.
Fluency: select Game B after computing profits.
Mistake types: chose-largest-payout | forgot-cost | reversed-subtraction | wrong-game-after-right-math

""" + workspace_block("ev-l4-p3", "Two game cards + profit meters", "Profit fields optional, game selector, check", "Card stack + selector", "1280×720") + """

MVP only: five lessons, 15 problems. No AI in MVP.

Expected Value Lab - MVP PRD Page 7
Lesson 5 of 5: Same EV, Different Risk, and Full EV Models
Estimated lesson time: ~9 min target with step compression (~8 min achievable).

""" + problem_header(1, 5, "Interactive Concept Introduction", "Build the Whole EV Model", "ev-l5-p1", "problem-7 / l5-build-whole-ev-model", "3 min") + """
Concept: Full model — probabilities, contributions, payout, cost, profit, decision.
Scenario: 10-section wheel — 1×$30, 2×$10, 7×$0; cost $5.
Source: PCC / carnival wheel count problems.
Probabilities: 0.1, 0.2, 0.7. Contributions: 3, 2, 0. Payout $5. Profit $0. Decision: Fair.
Mistake types: wrong-denominator | payout-as-contribution | ignored-zero-sections | favorable-because-payout-positive

""" + workspace_block("ev-l5-p1", "10-section wheel + grouping taps", "Table fields, payout/cost/profit/decision", "Wheel summary + one active table row", "1280×720") + """

""" + problem_header(2, 5, "Guided Application", "Same Expected Value, Different Risk", "ev-l5-p2", "problem-8 / l5-same-ev-different-risk", "2.5 min") + """
Concept: Equal EV ≠ equal risk.
Scenario: A guaranteed $5; B 50% $10 / 50% $0.
Source: OpenStax spread discussion (qualitative).
Controls: run 20 trials each; EV fields; risk selector Game B; explanation MC variable outcomes.
Mistake types: claimed-higher-ev | claimed-identical | selected-A-as-riskier

""" + workspace_block("ev-l5-p2", "Flat bar vs split bar + outcome plots", "Sim buttons, EV inputs, risk MC", "Dual sim panels stacked compactly", "1280×720") + """

""" + problem_header(3, 5, "Independent Fluency Check — Chapter Capstone", "Final Carnival Decision", "ev-l5-p3", "l5-final-capstone-ev-decision", "3.5 min") + """
Concept: Complete EV model + fairness + risk interpretation.
Scenario: 12-section wheel — 1×$36, 3×$12, 8×$0; cost $6.
Capstone requires: probabilities, contributions, expected payout $6, cost $6, profit $0, Fair, risk MC (variable outcomes despite fair EV).
Source: Numworks multi-outcome fair game + PCC capstone structure.
Probabilities: 1/12, 3/12, 8/12. Contributions: 3, 3, 0.
Risk explanation MC: "Fair in long-run profit but one play can still be $0, $12, or $36."
Mistake types: wrong-denominator | omitted-zero | profit-not-calculated | fair-means-no-risk | arithmetic-error

""" + workspace_block("ev-l5-p3", "12-section wheel + full table", "Sequential checklist fields + decision/risk MC", "One checklist step per screen segment on narrow mobile", "1280×720 — capstone uses stepped checklist to avoid scroll") + """

MVP only: five lessons, 15 problems. No AI in MVP.
"""


def build_footer() -> str:
    return r"""
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
"""

if __name__ == "__main__":
    main()
