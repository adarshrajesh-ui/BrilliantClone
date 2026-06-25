#!/usr/bin/env python3
"""Patch P1 problem specs for fun tactile animation pass."""
from pathlib import Path

PRD = Path(__file__).resolve().parents[3] / "prd.md"
text = PRD.read_text()

# --- L2P1: replace block ---
l2_old_start = "Lesson 2, Problem 1 — Build the Weighted Average"
l2_old_end = "Validation cases\nSee Appendix — Problem validation matrix for ev-l2-p1."

l2_new = r"""Lesson 2, Problem 1 — Prize Board Weight Drop
Stable problem ID: ev-l2-p1
Legacy ID mapping: problem-2 / l2-build-weighted-average
Instructional role: Interactive Concept Introduction — fun mini-game
Estimated completion time: 2.5 min

Concept
Expected value is a weighted average of outcomes.
Scenario
A carnival prize board has two zones: a small $20 zone (25% of board area) and a large $0 zone (75%). The learner drags prize tokens onto the board; contribution meters grow with zone size. After both drops, the formula EV = ___ × ___ + ___ × ___ unlocks and the learner submits EV = $5.

Source-grounded problem pattern
LibreTexts weighted-average analogy; OpenStax μ = Σ x·P(x).
Adapted as: prize-board drops before notation.

Pre-problem mini-demo
Show zones 1:3. Demo one $20 drop → contribution +$5. Demo $0 drop → 75% slice adds $0. Then show formula slots.

Visual + interaction
Phase A — Prize board (required first):
Board with 25%/75% zones; draggable $20 and $0 tokens; contribution meters below.
Phase B — Formula (unlocks after both drops):
EV = ___ × ___ + ___ × ___ with cards $20, $0, 25%, 75%; tap-to-place; EV field; Check.

Current-task checklist
Drop both tokens → Read meters → Fill formula → Submit EV $5.

Answer and completion rules
Both board drops complete; both formula pairs correct; EV = 5.

Accepted answer formats: 5, 5.0, 5.00, $5, $5.00

Mistake types
Reversed outcome and probability | wrong-pairing | omitted probability | used-largest-payout | omitted-zero-outcome | arithmetic-error

Feedback
"A dollar value is an outcome and a percent is a probability. Pair $20 with 25%."

Fun animation and interaction
Core feeling: "Each outcome contributes according to how much chance-space it occupies."
Tactile: drag tokens onto sized zones before formula.
Objects: prize board, tokens, horizontal contribution meters.

Animations:
1. Token lift (1.1× scale, 120ms) on grab.
2. Zone border glow on hover (probability as area).
3. Drop squash (0.92×, 180ms) then meter segment grows horizontally (400ms) — larger zone gets wider slice.
4. $20 drop spark: "+$5 contribution" chip pops (350ms).
5. Formula strip slides in from right after both drops (300ms).
6. Card snap on correct placement (200ms).
7. Completion: meters merge to $5 badge + brief confetti (400ms).

Reduced-motion: instant placement; meters appear full width; formula fades in; no confetti.

Why animation teaches: zone area = probability; meter fill = contribution; $0 in large zone still adds $0 visually.

Teaching animation (formula phase)
Cards lift/glow; reversed types highlight correct slots. Reduced-motion: immediate highlights.

Desktop workspace: left = board + meters; right = formula, EV, check, feedback (1280×720).
Mobile: board strip → meters → formula; tap-to-place; sticky task.

Accessibility
Live region on drop: "Twenty dollars in twenty-five percent zone. Contribution five dollars."

Review-mode / Restart / UX placement
Same compact two-region rules as other problems; feedback beneath Check.

Validation cases
- Formula locked until both board drops done
- Board-only does not complete problem
- Same EV checker rules as l2-build-weighted-average
- tap-to-place equivalent to drag for cards and token drops"""

def replace_block(s, start, end, new):
    i = s.find(start)
    j = s.find(end, i)
    if i < 0 or j < 0:
        raise SystemExit(f"Block not found: {start!r}")
    j += len(end)
    return s[:i] + new + s[j:]

text = replace_block(text, l2_old_start, l2_old_end, l2_new)

# --- L3P1: insert Fun section after Teaching animation ---
l3_marker = """Teaching animation
Boxes flip or pop open.
Matching outcomes receive consistent colors.
Active table rows highlight the corresponding boxes.
Probability hints animate the structure count / 6.

Desktop workspace arrangement
Target viewport: 1280×720
Left region: Six mystery boxes + grouping colors"""

l3_replacement = """Fun animation and interaction
Core feeling: "Counts become probabilities."
Tactile: tap or swipe to open each mystery box like a real lid; tokens pop out and fly to color groups.
Objects: six hinged box lids, prize tokens, grouping shelf, table that fills from reveals.

Animations:
1. **Lid lift:** box lid rotates 110° on hinge (250ms ease) with slight paper creak shadow — opening real object.
2. **Token pop:** prize token bounces up 20px (180ms) revealing $12 / $6 / $0 label.
3. **Group fly:** token arcs to colored shelf cluster (350ms); matching boxes pulse same color — count grouping.
4. **Row fill:** when shelf has all tokens of one payout, table row **types in** count then probability with count/6 fraction animating (400ms) — count→probability bridge.
5. **Shelf complete:** all six opened → shelf glow → table editable cells unlock.
6. **Completion:** probability-sum meter fills to 100% with soft chime visual (bar flash 300ms).

Reduced-motion: lid fades open; token appears; row values appear instantly; no arc.

Why animation teaches: physical reveals produce **counts**; meter shows counts sum to 6 before learner enters probabilities.

Teaching animation
Boxes flip or pop open.
Matching outcomes receive consistent colors.
Active table rows highlight the corresponding boxes.
Probability hints animate the structure count / 6.

Desktop workspace arrangement
Target viewport: 1280×720
Left region: Six mystery boxes + grouping colors + token shelf"""

if l3_marker in text:
    text = text.replace(l3_marker, l3_replacement, 1)
    # Update title
    text = text.replace(
        "Lesson 3, Problem 1 — Mystery Box Outcomes\nStable problem ID: ev-l3-p1\nLegacy ID mapping: problem-3 / l3-mystery-box-outcomes\nInstructional role: Interactive Concept Introduction",
        "Lesson 3, Problem 1 — Mystery Box Reveal\nStable problem ID: ev-l3-p1\nLegacy ID mapping: problem-3 / l3-mystery-box-outcomes\nInstructional role: Interactive Concept Introduction — fun mini-game",
        1,
    )
    text = text.replace(
        "Validation cases\nSee Appendix — Problem validation matrix for ev-l3-p1.",
        "Validation cases\n- all six boxes must open before table validates\n- row highlight syncs with shelf groups\n- reduced-motion uses instant reveal with same counts\n- tap-to-open equivalent to swipe-open\nSee Appendix matrix for ev-l3-p1.",
        1,
    )
else:
    print("WARN: L3P1 marker not found")

# --- L4P1 ---
l4_start = "Lesson 4, Problem 1 — Expected Payout vs Expected Profit"
l4_end = "Validation cases\nSee Appendix — Problem validation matrix for ev-l4-p1."

l4_new = r"""Lesson 4, Problem 1 — Pay to Play
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
- tap-to-place cost equivalent to drag"""

text = replace_block(text, l4_start, l4_end, l4_new)

# --- L5P1: full replace ---
l5_start = "Lesson 5, Problem 1 — Build the Whole EV Model"
l5_end = "Validation cases\nSee Appendix — Problem validation matrix for ev-l5-p1."

l5_new = r"""Lesson 5, Problem 1 — Carnival Booth Preview
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

Why animation teaches: EV matches but **outcome paths** differ — sets up L5P2 risk without capstone table work.

Desktop workspace: left = both booths + meters; right = MC questions, check, feedback (1280×720).
Mobile: booths stack; meters side-by-side; sticky task.

Accessibility
Live region after previews: "Both booths average five dollars. Booth A always five. Booth B alternates zero and ten."

Validation cases
- both previews required before MC enabled
- Q1=No, Q2=Yes required
- does NOT require probability table, cost, or fairness fields (reserved for L5P3 capstone)
- legacy problem-7 completion maps here; capstone skills assessed in ev-l5-p3"""

text = replace_block(text, l5_start, l5_end, l5_new)

# Lesson timing L1 justification
text = text.replace(
    "Discovery draw + one weighted sim + comparison choice; minimal reading",
    "Dice throw + one weighted sim + comparison choice; minimal reading",
)

text = text.replace(
    "Manual MVP testing scenario — update references from 20 to 15; verify compact workspace on Lesson 1 chip bag problem.",
    "Manual MVP testing scenario — verify compact workspace on Lesson 1 Dice Toss Average (drag-throw, graph, feedback inline). Validate all five P1 fun interactions at 1280×720 and mobile sticky layout.",
)

text = text.replace(
    "Appendix — Problem validation matrix (summary)\nFor each ev-l{N}-p{M}: checker tests for accepted formats, mistake types, completion guards, workspace contains feedback without scroll at 1280×720.",
    "Appendix — Problem validation matrix (summary)\nFor each ev-l{N}-p{M}: checker tests for accepted formats, mistake types, completion guards, workspace contains feedback without scroll at 1280×720.\nP1 additional validation: manual-throw gate (L1P1), board-before-formula gate (L2P1), all-boxes-open gate (L3P1), cost-before-profit gate (L4P1), both-preview gate (L5P1); reduced-motion paths produce identical deterministic outcomes.",
)

PRD.write_text(text)
print(f"Updated {PRD} ({len(text.splitlines())} lines)")
