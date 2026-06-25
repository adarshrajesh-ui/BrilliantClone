--- docs/prompt-first/2026-06-24-fun-p1-animations/prd-before.md	2026-06-24 13:19:02
+++ prd.md	2026-06-24 13:19:02
@@ -24,7 +24,7 @@
 Lesson timing targets
 | Lesson | P1 | P2 | P3 | Total | Justification |
 |--------|----|----|-----|-------|-----------------|
-| 1 | 2.5 min | 2.5 min | 2.5 min | ~7.5 min | Discovery draw + one weighted sim + comparison choice; minimal reading |
+| 1 | 2.5 min | 2.5 min | 2.5 min | ~7.5 min | Dice throw + one weighted sim + comparison choice; minimal reading |
 | 2 | 2.5 min | 2.5 min | 3 min | ~8 min | Formula placement + matching + diagnose; tight tables |
 | 3 | 3 min | 2.5 min | 3 min | ~8.5 min | Reveal/table fill is slightly heavier; still within cap with collapsible help |
 | 4 | 2.5 min | 2.5 min | 2.5 min | ~7.5 min | Balance-scale + bucket sort + two-card profit compare |
@@ -594,106 +594,79 @@
 Estimated lesson time: ~8 minutes.
 
 
-Lesson 2, Problem 1 — Build the Weighted Average
+Lesson 2, Problem 1 — Prize Board Weight Drop
 Stable problem ID: ev-l2-p1
 Legacy ID mapping: problem-2 / l2-build-weighted-average
-Instructional role: Interactive Concept Introduction
+Instructional role: Interactive Concept Introduction — fun mini-game
 Estimated completion time: 2.5 min
 
 Concept
 Expected value is a weighted average of outcomes.
 Scenario
-A spinner has:
-25% chance of $20
-75% chance of $0
+A carnival prize board has two zones: a small $20 zone (25% of board area) and a large $0 zone (75%). The learner drags prize tokens onto the board; contribution meters grow with zone size. After both drops, the formula EV = ___ × ___ + ___ × ___ unlocks and the learner submits EV = $5.
+
+Source-grounded problem pattern
+LibreTexts weighted-average analogy; OpenStax μ = Σ x·P(x).
+Adapted as: prize-board drops before notation.
+
 Pre-problem mini-demo
-Identify dollar cards as outcomes.
-Identify percentage cards as probabilities.
-Demonstrate tap a card, then tap a formula slot.
-Explain that every term uses outcome × probability.
-Visual + interaction
-Spinner with one quarter labeled $20.
-Three quarters labeled $0.
-Formula builder:
-EV = ___ × ___ + ___ × ___
-Cards:
-$20
-$0
-25%
-75%
-Tap-to-select and tap-to-place are required.
-Drag/drop may also be available.
-Clear placement and replace placement controls.
-Numeric EV field.
+Show zones 1:3. Demo one $20 drop → contribution +$5. Demo $0 drop → 75% slice adds $0. Then show formula slots.
+
+Visual + interaction
+Phase A — Prize board (required first):
+Board with 25%/75% zones; draggable $20 and $0 tokens; contribution meters below.
+Phase B — Formula (unlocks after both drops):
+EV = ___ × ___ + ___ × ___ with cards $20, $0, 25%, 75%; tap-to-place; EV field; Check.
+
 Current-task checklist
-Place the two outcome cards.
-Place the two probability cards.
-Check both outcome-probability pairs.
-Submit the numeric EV.
+Drop both tokens → Read meters → Fill formula → Submit EV $5.
+
 Answer and completion rules
-Correctly place both outcome-probability pairs.
-Submit final EV.
-Pair order may be reversed as long as each outcome remains matched to its correct probability.
-Correct models include:
-20 × 0.25 + 0 × 0.75
-0 × 0.75 + 20 × 0.25
-Final EV = 5.
-Accepted answer formats
-5
-5.0
-5.00
-$5
-$5.00
+Both board drops complete; both formula pairs correct; EV = 5.
+
+Accepted answer formats: 5, 5.0, 5.00, $5, $5.00
+
 Mistake types
-Reversed outcome and probability.
-Matched an outcome with the wrong probability.
-Omitted a probability.
-Used $20 as the answer because it is the largest payout.
-Omitted the $0 outcome.
+Reversed outcome and probability | wrong-pairing | omitted probability | used-largest-payout | omitted-zero-outcome | arithmetic-error
+
 Feedback
-“A dollar value is an outcome and a percent is a probability. Each term should read outcome × probability. Pair $20 with 25%, because that is how often the $20 outcome occurs.”
-Teaching animation
-Selected cards lift or glow.
-Correct cards snap into slots.
-Dollar cards and probability cards receive distinct visual treatments.
-Reversed types briefly highlight the correct slot categories.
-Reduced-motion mode uses immediate highlights.
+"A dollar value is an outcome and a percent is a probability. Pair $20 with 25%."
 
-Desktop workspace arrangement
-Target viewport: 1280×720
-Left region: Spinner + formula strip
-Right region: Cards, slots, EV input, check
-Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
-Feedback appears in the right region directly beneath the active input or check action.
-Continue appears in the right region after completion.
+Fun animation and interaction
+Core feeling: "Each outcome contributes according to how much chance-space it occupies."
+Tactile: drag tokens onto sized zones before formula.
+Objects: prize board, tokens, horizontal contribution meters.
 
-Mobile workspace arrangement
-Spinner thumbnail + formula stack
-Sticky current-task strip at top of the interaction stack.
-Feedback auto-scrolls into view beneath the active input.
-No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.
+Animations:
+1. Token lift (1.1× scale, 120ms) on grab.
+2. Zone border glow on hover (probability as area).
+3. Drop squash (0.92×, 180ms) then meter segment grows horizontally (400ms) — larger zone gets wider slice.
+4. $20 drop spark: "+$5 contribution" chip pops (350ms).
+5. Formula strip slides in from right after both drops (300ms).
+6. Card snap on correct placement (200ms).
+7. Completion: meters merge to $5 badge + brief confetti (400ms).
 
-Exact control placement (both layouts)
-Current task: top of right region (desktop) / sticky strip (mobile).
-Primary input: right region center, adjacent to visual.
-Check/submit: directly beneath primary input.
-Hint button: beside check action.
-Feedback: immediately beneath check action, never at page bottom.
-Completion state: inline badge beside current task.
+Reduced-motion: instant placement; meters appear full width; formula fades in; no confetti.
 
-Accessibility behavior
-Keyboard focus order: task → visual controls → input → check → feedback → continue.
-Live region announces feedback within 100ms of check.
-Touch targets ≥ 44px. Graphs include text summary of latest average/state.
+Why animation teaches: zone area = probability; meter fill = contribution; $0 in large zone still adds $0 visually.
 
-Review-mode state
-Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.
+Teaching animation (formula phase)
+Cards lift/glow; reversed types highlight correct slots. Reduced-motion: immediate highlights.
 
-Restart behavior
-Resets interaction state only; preserves completion record and chapter position.
+Desktop workspace: left = board + meters; right = formula, EV, check, feedback (1280×720).
+Mobile: board strip → meters → formula; tap-to-place; sticky task.
 
+Accessibility
+Live region on drop: "Twenty dollars in twenty-five percent zone. Contribution five dollars."
+
+Review-mode / Restart / UX placement
+Same compact two-region rules as other problems; feedback beneath Check.
+
 Validation cases
-See Appendix — Problem validation matrix for ev-l2-p1.
+- Formula locked until both board drops done
+- Board-only does not complete problem
+- Same EV checker rules as l2-build-weighted-average
+- tap-to-place equivalent to drag for cards and token drops
 
 
 Lesson 2, Problem 2 — Match Outcomes to Probabilities
@@ -867,10 +840,10 @@
 Estimated lesson time: ~8.5 minutes (within target via collapsible reference).
 
 
-Lesson 3, Problem 1 — Mystery Box Outcomes
+Lesson 3, Problem 1 — Mystery Box Reveal
 Stable problem ID: ev-l3-p1
 Legacy ID mapping: problem-3 / l3-mystery-box-outcomes
-Instructional role: Interactive Concept Introduction
+Instructional role: Interactive Concept Introduction — fun mini-game
 Estimated completion time: 3 min
 
 Concept
@@ -930,6 +903,23 @@
 Entered the total number of boxes in a count cell.
 Feedback
 “You entered 2 as the probability. That is the number of $6 boxes. Probability compares that count with all 6 boxes, so enter 2/6 or an equivalent value such as 1/3.”
+Fun animation and interaction
+Core feeling: "Counts become probabilities."
+Tactile: tap or swipe to open each mystery box like a real lid; tokens pop out and fly to color groups.
+Objects: six hinged box lids, prize tokens, grouping shelf, table that fills from reveals.
+
+Animations:
+1. **Lid lift:** box lid rotates 110° on hinge (250ms ease) with slight paper creak shadow — opening real object.
+2. **Token pop:** prize token bounces up 20px (180ms) revealing $12 / $6 / $0 label.
+3. **Group fly:** token arcs to colored shelf cluster (350ms); matching boxes pulse same color — count grouping.
+4. **Row fill:** when shelf has all tokens of one payout, table row **types in** count then probability with count/6 fraction animating (400ms) — count→probability bridge.
+5. **Shelf complete:** all six opened → shelf glow → table editable cells unlock.
+6. **Completion:** probability-sum meter fills to 100% with soft chime visual (bar flash 300ms).
+
+Reduced-motion: lid fades open; token appears; row values appear instantly; no arc.
+
+Why animation teaches: physical reveals produce **counts**; meter shows counts sum to 6 before learner enters probabilities.
+
 Teaching animation
 Boxes flip or pop open.
 Matching outcomes receive consistent colors.
@@ -938,7 +928,7 @@
 
 Desktop workspace arrangement
 Target viewport: 1280×720
-Left region: Six mystery boxes + grouping colors
+Left region: Six mystery boxes + grouping colors + token shelf
 Right region: Table fields, confirm button
 Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
 Feedback appears in the right region directly beneath the active input or check action.
@@ -970,7 +960,11 @@
 Resets interaction state only; preserves completion record and chapter position.
 
 Validation cases
-See Appendix — Problem validation matrix for ev-l3-p1.
+- all six boxes must open before table validates
+- row highlight syncs with shelf groups
+- reduced-motion uses instant reveal with same counts
+- tap-to-open equivalent to swipe-open
+See Appendix matrix for ev-l3-p1.
 
 
 Lesson 3, Problem 2 — Calculate EV from the Table
@@ -1159,89 +1153,68 @@
 Estimated lesson time: ~7.5 minutes.
 
 
-Lesson 4, Problem 1 — Expected Payout vs Expected Profit
+Lesson 4, Problem 1 — Pay to Play
 Stable problem ID: ev-l4-p1
 Legacy ID mapping: problem-5 / l4-payout-vs-profit
-Instructional role: Interactive Concept Introduction
+Instructional role: Interactive Concept Introduction — fun mini-game
 Estimated completion time: 2.5 min
 
 Concept
-Expected payout and expected profit are different when there is a cost to play.
+Expected payout and expected profit differ when there is a cost to play.
 Scenario
-The mystery-box game has:
-expected payout = $4
-entry cost = $3
+The mystery-box game returns $4 on average, but costs $3 to enter. Gold coins fill a **payout tray** upward; the learner drags a **cost token** into the cost slot; a **profit meter** shows what remains.
+
 Pre-problem mini-demo
-Identify expected payout before cost.
-Identify the cost block.
-Demonstrate that cost moves the result downward.
-Show the formula:
-Expected profit = expected payout − cost
+Coins stream into payout tray to $4. Cost slot empty. Drag $3 cost coin → profit meter drops to $1.
+
 Visual + interaction
-Balance scale or equation strip.
-Expected payout block: +$4.
-Cost block: −$3.
-Learner taps the cost block into the equation.
-Expected profit input.
-Visual movement from $4 to $1.
+Payout tray (fills to $4 with animated coins).
+Cost slot (accepts draggable $3 token).
+Profit meter (starts at $4, moves to $1 when cost inserted).
+Expected profit input + Check.
+
 Answer and completion rules
-Select payout − cost.
-Submit expected profit = 1.
-Accepted answer formats
-1
-1.0
-1.00
-$1
-$1.00
-Correct model
-Expected profit = 4 − 3 = 1
+Cost token placed; submit expected profit = 1.
+
+Accepted answer formats: 1, 1.0, 1.00, $1, $1.00
+Correct model: 4 − 3 = 1
+
 Mistake types
-Answered expected payout $4.
-Added cost instead of subtracting.
-Treated cost as probability.
-Entered −1 by reversing payout and cost.
+answered-payout | added-cost | cost-as-probability | reversed-subtraction
+
 Feedback
-“You calculated or repeated the expected payout, but the question asks for expected profit. Profit includes the amount paid to play. Start with $4 and subtract the $3 cost.”
-Teaching animation
-Cost block pulls the result from $4 toward $1.
-Adding cost incorrectly moves the indicator in the wrong direction.
-Correct completion emphasizes the remaining $1.
+"You repeated expected payout ($4). Subtract the $3 cost to get expected profit."
 
-Desktop workspace arrangement
-Target viewport: 1280×720
-Left region: Balance scale + payout/cost blocks
-Right region: Tap cost, profit input, check
-Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
-Feedback appears in the right region directly beneath the active input or check action.
-Continue appears in the right region after completion.
+Fun animation and interaction
+Core feeling: "The game may pay me, but I first paid a cost."
+Tactile: drag $3 cost coin into slot after watching payout fill.
+Objects: coin stream, payout tray, cost slot, vertical profit meter.
 
-Mobile workspace arrangement
-Scale mini + equation stack
-Sticky current-task strip at top of the interaction stack.
-Feedback auto-scrolls into view beneath the active input.
-No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.
+Animations:
+1. **Coin stream:** on load, 4 gold coins slide into payout tray one-by-one (150ms stagger) — expected payout builds visually.
+2. **Tray label:** "$4 expected payout" fades in above tray (200ms).
+3. **Cost drag:** cost coin lifts with red tint (120ms).
+4. **Slot swallow:** cost coin slides into slot (250ms); tray **does not** lose coins but profit meter **drops** from $4 to $1 with downward slide (400ms ease-in) — teaches subtraction not addition.
+5. **Wrong add path:** if learner taps + instead, meter briefly rises then shakes red (300ms) — incorrect model.
+6. **Correct lock:** at $1, meter turns green pulse (300ms); profit input unlocks.
 
-Exact control placement (both layouts)
-Current task: top of right region (desktop) / sticky strip (mobile).
-Primary input: right region center, adjacent to visual.
-Check/submit: directly beneath primary input.
-Hint button: beside check action.
-Feedback: immediately beneath check action, never at page bottom.
-Completion state: inline badge beside current task.
+Reduced-motion: tray shows $4 instantly; cost fade into slot; meter jumps to $1.
 
-Accessibility behavior
-Keyboard focus order: task → visual controls → input → check → feedback → continue.
-Live region announces feedback within 100ms of check.
-Touch targets ≥ 44px. Graphs include text summary of latest average/state.
+Why animation teaches: payout and profit are separate quantities; cost pulls profit down without erasing payout history.
 
-Review-mode state
-Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.
+Desktop workspace: left = tray + meter; right = cost token, profit input, check, feedback.
+Mobile: tray mini + meter + cost drag; sticky task.
 
-Restart behavior
-Resets interaction state only; preserves completion record and chapter position.
+Accessibility
+Live region: "Expected payout four dollars. Cost three dollars. Expected profit one dollar."
 
+Review-mode / Restart
+Standard compact workspace rules.
+
 Validation cases
-See Appendix — Problem validation matrix for ev-l4-p1.
+- profit input locked until cost placed
+- answered 4 triggers answered-payout
+- tap-to-place cost equivalent to drag
 
 
 Lesson 4, Problem 2 — Fair, Favorable, or Unfavorable?
@@ -1439,103 +1412,75 @@
 Estimated lesson time: ~9 min target with step compression (~8 min achievable).
 
 
-Lesson 5, Problem 1 — Build the Whole EV Model
+Lesson 5, Problem 1 — Carnival Booth Preview
 Stable problem ID: ev-l5-p1
-Legacy ID mapping: problem-7 / l5-build-whole-ev-model
-Instructional role: Interactive Concept Introduction
+Legacy ID mapping: problem-7 / l5-build-whole-ev-model (content revised; storage ID preserved)
+Instructional role: Interactive Concept Introduction — fun mini-game (NOT the capstone)
 Estimated completion time: 3 min
 
 Concept
-Independently convert a game into probabilities, contributions, expected payout, expected profit, and a decision.
+Expected value summarizes long-run average payoff, but two games with similar averages can feel very different to play.
 Scenario
-A carnival wheel has 10 equal sections:
-1 section pays $30
-2 sections pay $10
-7 sections pay $0
-cost to spin = $5
+Two neighboring carnival booths:
+**Booth A — Steady Coins:** always pays exactly $5 (animated coin drops every round).
+**Booth B — Mystery Spin:** 50% pays $10, 50% pays $0 (animated wheel bounce).
+Learner runs a 5-round preview on each booth, watches average meters, answers two quick questions. No full probability table required.
+
+Source pattern
+OpenStax spread / qualitative risk before formal SD; introductory "same mean different experience" discussions.
+Selected over: full 10-section wheel table (duplicates capstone; worksheet feel).
+Adapted as: playful side-by-side booth preview.
+
+Exact data
+Booth A: always $5 → average $5.
+Booth B: 50% $10, 50% $0 → average $5.
+Questions: (1) Do they feel the same? → No. (2) Same average payout? → Yes ($5).
+
 Pre-problem mini-demo
-Group sections by payout.
-Explain selected sections / 10 total.
-Explain contribution = outcome × probability.
-Explain expected payout − cost.
-Map expected profit to the fairness decision.
+Watch one coin drop at Booth A. Watch one wheel spin at Booth B. Compare jumpiness.
+
 Visual + interaction
-Ten-section wheel.
-Learner taps sections to group by payout.
-Blank table:
-Outcome | Probability | Contribution
-Fields:
-expected payout
-cost
-expected profit
-decision
-Formula is not prefilled.
-Answer and completion rules
-Probabilities:
-$30 → 1/10 or 0.1
-$10 → 2/10 or 0.2
-$0 → 7/10 or 0.7
-Contributions:
-3
-2
-0
-Expected payout:
-5
-Expected profit:
-0
-Decision:
-Fair
-Completion requires every required field and decision.
+Two booth cards side-by-side with "Run 5 rounds" buttons.
+Each shows outcome animation strip + running-average mini-meter.
+MC Q1: same feel? (No)
+MC Q2: same average? (Yes / $5)
+
+Completion rules
+Run both previews (5 rounds each); answer both MC correctly.
+
 Mistake types
-Wrong denominator.
-Counted sections but did not convert to probability.
-Used payout values as contributions.
-Calculated payout but not profit.
-Marked the game favorable because payout is positive.
-Ignored the $0 sections.
-Visual hint rules
-Probability hint highlights matching wheel sections and displays selected / 10.
-Contribution hint animates outcome × probability for the active row.
-Profit hint balances payout $5 and cost $5.
-Decision hint places expected-profit dot at zero.
+claimed-different-average | claimed-same-feel | confused-single-round-with-ev
+
 Feedback
-“You found the expected payout, but the decision uses expected profit. The game pays $5 on average and costs $5, so the expected profit is zero. A zero expected profit means the game is fair.”
+"Both booths average $5 per round, but Booth B jumps between $0 and $10 while Booth A is steady — same average, different experience."
 
-Desktop workspace arrangement
-Target viewport: 1280×720
-Left region: 10-section wheel + grouping taps
-Right region: Table fields, payout/cost/profit/decision
-Visual and controls remain visible together without vertical scroll-chasing on desktop/tablet landscape.
-Feedback appears in the right region directly beneath the active input or check action.
-Continue appears in the right region after completion.
-
-Mobile workspace arrangement
-Wheel summary + one active table row
-Sticky current-task strip at top of the interaction stack.
-Feedback auto-scrolls into view beneath the active input.
-No horizontal scrolling. All drag placements support tap-to-select and tap-to-place.
+Fun animation and interaction
+Core feeling: "Two choices can look different even when their averages match."
+Tactile: tap Run 5 rounds on each booth; no table building.
+Objects: coin chute vs spinning wheel; dual average meters.
 
-Exact control placement (both layouts)
-Current task: top of right region (desktop) / sticky strip (mobile).
-Primary input: right region center, adjacent to visual.
-Check/submit: directly beneath primary input.
-Hint button: beside check action.
-Feedback: immediately beneath check action, never at page bottom.
-Completion state: inline badge beside current task.
+Animations:
+1. **Booth A coin drop:** five coins drop vertically at fixed $5 height (120ms stagger) — flat line draws on meter.
+2. **Booth B wheel:** wheel spins with bounce (600ms); outcome jumps meter up/down — jagged line.
+3. **Meter compare:** after both runs, meters align at $5 with dashed tie line while outcome strips stay different (400ms).
+4. **Feel question highlight:** Booth B strip flashes variable range band (green $10 to gray $0).
+5. **Completion:** both meters pulse green on correct Q2; Continue in workspace.
 
-Accessibility behavior
-Keyboard focus order: task → visual controls → input → check → feedback → continue.
-Live region announces feedback within 100ms of check.
-Touch targets ≥ 44px. Graphs include text summary of latest average/state.
+Reduced-motion: outcomes list instantly; meters update without spin/bounce.
 
-Review-mode state
-Shows completed answers, final graph/sim summary, teaching explanation, Restart and Continue in the same compact workspace.
+Why animation teaches: EV matches but **outcome paths** differ — sets up L5P2 risk without capstone table work.
 
-Restart behavior
-Resets interaction state only; preserves completion record and chapter position.
+Desktop workspace: left = both booths + meters; right = MC questions, check, feedback (1280×720).
+Mobile: booths stack; meters side-by-side; sticky task.
+
+Accessibility
+Live region after previews: "Both booths average five dollars. Booth A always five. Booth B alternates zero and ten."
 
 Validation cases
-See Appendix — Problem validation matrix for ev-l5-p1.
+- both previews required before MC enabled
+- Q1=No, Q2=Yes required
+- does NOT require probability table, cost, or fairness fields (reserved for L5P3 capstone)
+- legacy problem-7 completion maps here; capstone skills assessed in ev-l5-p3
 
 
 Lesson 5, Problem 2 — Same Expected Value, Different Risk
@@ -1852,9 +1797,10 @@
 Automated validation — update to 15 problems.
 Progress tests: 15-problem percentage, 3 per lesson, mastery 11/15.
 
-Manual MVP testing scenario — update references from 20 to 15; verify compact workspace on Lesson 1 chip bag problem.
+Manual MVP testing scenario — verify compact workspace on Lesson 1 Dice Toss Average (drag-throw, graph, feedback inline). Validate all five P1 fun interactions at 1280×720 and mobile sticky layout.
 
 Appendix — Problem validation matrix (summary)
 For each ev-l{N}-p{M}: checker tests for accepted formats, mistake types, completion guards, workspace contains feedback without scroll at 1280×720.
+P1 additional validation: manual-throw gate (L1P1), board-before-formula gate (L2P1), all-boxes-open gate (L3P1), cost-before-profit gate (L4P1), both-preview gate (L5P1); reduced-motion paths produce identical deterministic outcomes.
 
 MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 15 problems. No AI in MVP.
