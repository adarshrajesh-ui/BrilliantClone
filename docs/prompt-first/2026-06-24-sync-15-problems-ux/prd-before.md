Expected Value Lab - MVP PRD Page 1
PRD
Expected Value Lab: A learn-by-doing MVP for one introductory probability chapter
MVP
The MVP is a login-based web app that teaches one chapter:
Expected Value — The Average Outcome of Uncertainty
The chapter contains 5 lessons and 20 visual, interactive problems. The learner progresses from observing repeated simulations to independently building an expected value model, accounting for costs, judging fairness, and comparing games with the same expected value but different risk.
The app teaches without AI. All problems, onboarding demonstrations, hints, answer checks, mistake classifications, and feedback are hand-built and deterministic.
Chapter structure
Lesson 1 — Expected Value as a Long-Run Average
Lesson 2 — Expected Value as a Weighted Average
Lesson 3 — Counts, Tables, and Discrete Outcomes
Lesson 4 — Expected Payout, Expected Profit, and Fairness
Lesson 5 — Same EV, Different Risk, and Full EV Models
Each lesson contains 4 problems, for a total of 20 problems.
What is in scope for MVP vs what is NOT
In scope for MVP
Google sign-in, user profile creation, and saved progress per user.
One expected value chapter divided into 5 lessons.
20 interactive, visual problems.
Visual-first learning using:
spinners
wheels
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
A short, visual mini-demo before each problem or before a newly introduced interaction type.
A reusable “Show demo again” option.
A clear current-task panel and step checklist on each problem.
Instant deterministic answer checking with visible feedback under 100ms.
Flexible acceptance of mathematically equivalent correct formats.
Direct correction after a wrong answer without resetting unrelated work.
Learning-oriented feedback that explains:
what happened
why the reasoning was incorrect
what the learner should do next
Feedback displayed near the active work area rather than buried at the bottom.
Hand-written visual hints.
Teaching-focused animations.
Completed-problem review mode.
Explicit “Restart This Problem” practice mode.
Completion percentage, graded attempts, hints used, mistake type, mastery state, streak, and milestones.
Lesson-level and chapter-level progress.
A home-page current-chapter panel using an original golf-course progression metaphor.
A glowing marker for the current problem and increasingly motivating future holes.
Mobile-responsive design.
Every drag/drop-style interaction must also support tap-to-select and tap-to-place.
On mobile, tapping is the default interaction; drag/drop is optional polish.
A deployed public web app using React and Firebase.
Explicitly NOT in scope for MVP
No AI tutor.
No AI hints.
No AI-generated feedback.
No AI-generated problems.
No model calls or semantic model matching.
No additional complete chapters.
No full probability course.
No videos or long readings.
No payments.
No leaderboards.
No teacher dashboards.
No classroom-management tools.
No social features.
No mobile app-store release.
No advanced probability theory.
No dependency on drag/drop for correctness.
No copied Topgolf logos, branding, artwork, or proprietary assets.
No requirement for Figma at runtime. Figma may be used only as a design reference.
User persona
Primary learner
An introductory probability or statistics student who has seen expected value formulas but does not understand what the quantities mean.
They need visual setups that clarify:
outcomes
probabilities
counts
contributions
expected payout
cost
expected profit
fairness
risk
Secondary learner
A visual math learner who struggles when math is presented only through notation and needs to manipulate examples before formulas become intuitive.
Domain
Domain: introductory probability.
Specific subject: expected value.
Chapter goal: make expected value intuitive as:
a long-run average
a weighted average
a decision-making tool under uncertainty
a measure that does not fully describe risk
Use stories: focused and not focused
Focus stories
Sign in and resume.
View the current chapter and course progress.
Start or continue the next unfinished problem.
Open a short mini-demo before using an unfamiliar visual or interaction.
Interact with visual probability setups.
Understand what to tap or enter before beginning.
Get immediate, specific feedback near the active problem area.
Correct an answer directly without restarting the problem.
Use visual hints.
Complete a problem.
Return later and review the completed solution.
Explicitly restart one completed problem for practice.
Keep overall chapter progress even when reviewing or restarting an earlier problem.
Complete 5 lessons and 20 problems.
See completion, mastery, streak, milestones, and suggested review areas.
Won’t-focus stories
Ask an AI tutor.
Browse many courses.
Create lessons.
Compete with friends.
Watch videos.
Manage classrooms.
Purchase subscriptions.
Learn advanced probability topics.
MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 20 problems. No AI in MVP.

Expected Value Lab - MVP PRD Page 2
MVP Problem Specs
Five PRD pages are dedicated to exact lesson and problem behavior.
Lesson 1 of 5: Expected Value as a Long-Run Average
Lesson goal: understand expected value as the average result over many repetitions rather than the result of one trial.

Lesson 1, Problem 1 — The Long-Run Average
Concept
Expected value is the average outcome over many repetitions.
Scenario
Bob plays a spinner game with two equal sections:
win $10
win $0
Pre-problem mini-demo
The mini-demo contains four steps:
Highlight the two equal spinner sections and explain that both outcomes are equally likely.
Point to Spin Once, Spin 10, and Spin 100 and explain what each button does.
Highlight total winnings, number of spins, and average per spin.
Highlight the running-average graph and explain that it shows how the average changes over time.
The demo ends with:
“Predict where the average settles, then run at least 100 spins.”
Buttons:
Back
Next
Skip demo
Start Problem
The demo does not count as an attempt, hint, or completed action.
Visual + interaction
Spinner split 50/50.
One half labeled $10.
One half labeled $0.
Counters for:
spins
total winnings
average per spin
Running-average line graph.
Horizontal reference line at $5.
Buttons:
Spin Once
Spin 10
Spin 100
Learner predicts the long-run average before running many spins.
Current-task checklist
Submit a prediction.
Run at least 100 total spins.
Identify the long-run average.
Complete the problem.
Answer and completion rules
Completion requires a submitted prediction.
Completion requires at least 100 total simulated spins.
Completion requires identifying $5 as the long-run average.
Prediction choices may remain $0, $5, and $10.
Normalized correct value = 5.
Accepted answer formats
5
5.0
5.00
$5
$5.00
5 dollars
5 per spin
Mistake types
Chose an extreme outcome.
Confused a single spin result with a long-run average.
Assumed the latest observed average must equal the theoretical EV.
Selected the largest possible payout.
Feedback
Example wrong feedback:
“You chose one possible result, but expected value is not the outcome of one spin. It is the average over many spins. Since $0 and $10 are equally likely, look for the midpoint between them.”
Next action:
“Run 100 spins and watch where the average line begins to settle.”
Example correct feedback:
“Correct — $5 is the long-run average. Equal chances of $0 and $10 balance halfway between the two outcomes.”
Teaching animation
Spinner rotates during each simulation batch.
Counters animate without delaying feedback.
New graph points draw into place.
After many spins, the $5 reference line receives a subtle emphasis.
Correct completion highlights the midpoint between $0 and $10.
Reduced-motion mode replaces rotation and line drawing with immediate state changes.

Lesson 1, Problem 2 — Unequal Spinner Simulation
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

Lesson 1, Problem 3 — Short-Run vs Long-Run
Concept
Small samples can be noisy. Larger samples provide better evidence of the long-run average.
Scenario
The learner compares results from the same 50/50 $10-or-$0 game using:
10 spins
500 spins
Pre-problem mini-demo
Explain that both graphs come from the same game.
Identify the number of trials shown on each graph.
Explain that a short sample can jump around.
Explain that a larger sample typically stabilizes closer to EV.
Visual + interaction
Two simulation panels.
One panel runs 10 spins.
One panel runs 500 spins.
Two running-average graphs.
Horizontal reference line at $5.
A prediction question:
“Must 10 spins average exactly $5?”
A comparison question:
“Which graph gives stronger evidence of the long-run average?”
Current-task checklist
Run the 10-spin sample.
Answer whether it must equal $5.
Run the 500-spin sample.
Select the stronger long-run graph.
Answer and completion rules
Run both required simulations.
Correctly answer that 10 spins do not have to average exactly $5.
Select the 500-spin graph as stronger evidence of the long-run average.
Accepted answer formats
For the short-sample question:
No
Not necessarily
False
Correct deterministic multiple-choice option
For the graph question:
500 spins
Long-run graph
Larger sample
Correct deterministic multiple-choice option
Mistake types
Expected every sample to equal theoretical EV.
Confused theoretical average with guaranteed sample average.
Selected the short-run graph because it temporarily landed closer to $5.
Believed more trials change the theoretical EV.
Feedback
“A theoretical expected value does not guarantee that every small sample will match it. Ten spins can be far above or below $5. The larger sample is stronger evidence because random swings have more chances to balance out.”
Teaching animation
Short-run graph appears visibly jagged.
Long-run graph draws progressively toward the $5 reference line.
Correct completion emphasizes sample size rather than the final position of one random run.

Lesson 1, Problem 4 — Compare Two Spinners
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
MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 20 problems. No AI in MVP.

Expected Value Lab - MVP PRD Page 3
MVP Problem Specs
Lesson 2 of 5: Expected Value as a Weighted Average
Lesson goal: construct expected value by pairing each outcome with its probability and adding the resulting contributions.

Lesson 2, Problem 1 — Build the Weighted Average
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

Lesson 2, Problem 2 — Match Outcomes to Probabilities
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

Lesson 2, Problem 3 — Fill Missing Formula Terms
Concept
Expected value is the sum of outcome × probability contributions.
Scenario
The learner receives:
EV = ___ × 0.4 + 5 × ___ + 0 × 0.1
Given outcomes and probabilities:
$10 with probability 0.4
$5 with probability 0.5
$0 with probability 0.1
Pre-problem mini-demo
Point to a blank before a multiplication sign and label it an outcome slot.
Point to a blank after a payout and label it a probability slot.
Demonstrate selecting one card and placing it.
Point to the final EV field.
Visual + interaction
Formula strip.
Missing-value slots.
Card bank:
10
0.5
distractor cards where useful
Final EV field.
Contribution chips showing each row’s value after correct placement.
Answer and completion rules
Correct formula:
10 × 0.4 + 5 × 0.5 + 0 × 0.1
Correct contributions:
4
2.5
0
Final EV:
6.5
Accepted answer formats
6.5
6.50
$6.50
$6.5
Mistake types
Used an outcome where a probability belongs.
Used a probability where an outcome belongs.
Omitted the zero outcome.
Arithmetic error.
Added raw payouts instead of contributions.
Feedback
“The blank before × 0.4 must be the payout that occurs with probability 0.4. The blank after 5 × must be the probability of receiving $5. Once the slots are correct, add the three contributions.”

Lesson 2, Problem 4 — Diagnose Bad EV Setups
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
MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 20 problems. No AI in MVP.

Expected Value Lab - MVP PRD Page 4
MVP Problem Specs
Lesson 3 of 5: Counts, Tables, and Discrete Outcomes
Lesson goal: convert physical counts into probabilities, organize outcomes in tables, and calculate EV contributions.

Lesson 3, Problem 1 — Mystery Box Outcomes
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

Lesson 3, Problem 2 — Calculate EV from the Table
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

Lesson 3, Problem 3 — Repair the Probability Table
Concept
Probabilities must match counts and account for the entire sample space.
Scenario
A prize shelf has 8 tickets:
1 pays $16
3 pay $4
4 pay $0
The displayed table contains errors:
$16 → count 1 → probability 1/8
$4 → count 3 → probability 3/10
$0 → count 4 → probability blank
Pre-problem mini-demo
Count all 8 ticket icons.
Explain that every probability uses the same total denominator.
Point to the probability-sum meter.
Demonstrate correcting one sample cell without revealing the real answer.
Visual + interaction
Eight ticket icons.
Outcome groups.
Editable probability table.
Probability-sum meter.
Incorrect rows highlight the matching ticket group.
Answer and completion rules
Correct rows:
$16 → 1/8
$4 → 3/8
$0 → 4/8 or 1/2
Completion requires:
Correct probability cells.
Sum of probabilities = 1.
Accepted answer formats
1/8 or 0.125
3/8 or 0.375
4/8, 1/2, 0.5, or .5
Mistake types
Wrong denominator.
Probabilities do not sum to 1.
Ignored the zero outcome.
Copied count as probability.
Used different totals for different rows.
Feedback
“There are 8 tickets in total, so every probability must compare its group with 8. The $4 row has 3 matching tickets, so use 3/8 rather than 3/10.”

Lesson 3, Problem 4 — Prize Bag EV Table
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
MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 20 problems. No AI in MVP.

Expected Value Lab - MVP PRD Page 5
MVP Problem Specs
Lesson 4 of 5: Expected Payout, Expected Profit, and Fairness
Lesson goal: distinguish payout from profit, account for entry cost, and classify games using expected profit.

Lesson 4, Problem 1 — Expected Payout vs Expected Profit
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

Lesson 4, Problem 2 — Fair, Favorable, or Unfavorable?
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

Lesson 4, Problem 3 — Find the Fair Price
Concept
A fair game has expected profit equal to zero, so fair cost equals expected payout.
Scenario
A spinner has:
50% chance of $8
50% chance of $0
Question:
What entry cost makes the game fair?
Pre-problem mini-demo
Calculate expected payout from the spinner.
Show the cost control.
Explain that fairness occurs when payout and cost balance.
Point to zero on the expected-profit number line.
Visual + interaction
50/50 spinner.
Expected payout meter.
Cost slider or selectable cost cards.
Balance scale.
Fairness number line.
Expected-profit display.
Answer and completion rules
Expected payout = 4.
Fair cost = 4.
Expected profit at that cost = 0.
Classification = fair.
Accepted answer formats
4
4.0
4.00
$4
$4.00
Mistake types
Chose the maximum payout.
Set cost below payout and called it fair.
Set cost above payout and called it fair.
Confused expected payout with expected profit.
Did not target zero profit.
Feedback
“A fair price makes expected profit equal zero. The expected payout is $4, so the cost must also be $4. A lower cost would favor the player, and a higher cost would be unfavorable.”

Lesson 4, Problem 4 — Choose the Better Game After Cost
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
MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 20 problems. No AI in MVP.

Expected Value Lab - MVP PRD Page 6
MVP Problem Specs
Lesson 5 of 5: Same EV, Different Risk, and Full EV Models
Lesson goal: independently build expected value models and understand that equal expected values do not imply equal risk.

Lesson 5, Problem 1 — Build the Whole EV Model
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

Lesson 5, Problem 2 — Same Expected Value, Different Risk
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

Lesson 5, Problem 3 — Low-Risk vs High-Risk Same EV
Concept
Two games can share an EV while having different variability.
Scenario
Game A:
100% chance of $6
Game B:
50% chance of $12
50% chance of $0
Pre-problem mini-demo
Identify the guaranteed outcome.
Identify the split outcome.
Compare the weighted averages.
Compare the outcome spread.
Visual + interaction
Guaranteed-outcome bar at $6.
Split bar between $0 and $12.
Trial simulator.
Outcome graph.
Running-average graph.
EV fields.
Risk selector.
Explanation field or deterministic choice.
Answer and completion rules
EV(A) = 6.
EV(B) = 6.
Riskier game = Game B.
Correct reason = wider spread or variable outcomes despite equal EV.
Required simulations must be run if simulation controls are included.
Accepted answer formats
6
6.0
$6
Game B
B
Approved deterministic risk explanations
Mistake types
Claimed Game B has higher EV because it can pay $12.
Claimed the games are identical.
Confused guaranteed outcome with average.
Ignored variability.
Feedback
“Both games average $6, but only Game A guarantees $6. Game B can produce either $0 or $12. The wider range of possible outcomes makes Game B riskier.”

Lesson 5, Problem 4 — Final Capstone EV Decision
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
MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 20 problems. No AI in MVP.

Expected Value Lab - MVP PRD Page 7
Cross-Problem Learning, Demonstration, Feedback, and Answer Rules
Pre-problem mini-demo system
Each problem includes an introductory demonstration.
Required behavior
The first visit to a problem presents the demo before the graded problem.
A full demo is required when a new interaction type is introduced.
Repeated interaction types may use a shorter recap.
Learner may select:
Back
Next
Skip demo
Start Problem
Every problem includes “Show demo again.”
Completed problems do not automatically replay the demo.
Review mode may include an optional “Show demo” button.
Restarted practice may offer the demo but must allow skipping.
Demo state rules
The demo does not:
count as an attempt
set hintUsed
complete a required action
alter submitted answers
alter problem completion
move chapter progress
Demo-seen state may be stored:
per problem
per interaction type
locally if Firestore persistence is not yet safe
The implementation must not require destructive migration.
Current-task panel and step checklist
Each problem displays a current-task panel near the top.
It must answer:
What am I looking at?
What should I tap or enter first?
What is the current goal?
What remains before completion?
Checklist states:
Not started
Current
Complete
Needs correction
The current task updates as the learner progresses.
Flexible deterministic answer normalization
Money and numeric input
Where mathematically valid, accept:
whole numbers
trailing zeros
dollar sign
surrounding whitespace
approved money words
approved contextual suffixes
Examples:
5
5.0
5.00
$5
$5.00
5 dollars
5 per spin
Probability input
Where mathematically valid, accept:
fractions
unreduced fractions
reduced fractions
decimals
leading-decimal format
percentages
whitespace around fraction operators
Examples:
1/4
25/100
0.25
.25
25%
Equivalent values are compared with a small deterministic tolerance appropriate to the problem. The tolerance must accept specified rounded values without accepting meaningfully incorrect probabilities.
Classification input
Classification checks are case-insensitive.
Approved unambiguous synonyms may be accepted:
fair
favorable
fav
positive, only when context clearly means positive expected profit
unfavorable
unfav
negative, only when context clearly means negative expected profit
Explanation input
Multiple choice is preferred for conceptual explanations.
If short text is permitted:
use deterministic keyword and phrase rules
require sufficient approved concepts
reject contradictory explanations
do not use AI or semantic similarity
Direct correction behavior
A graded wrong answer produces deterministic feedback.
Learner can edit the answer in place.
Editing clears stale error state for that field.
Resubmission immediately accepts a corrected answer.
No refresh or full reset is required.
Correct fields remain filled when another field is wrong.
Partially correct multi-field progress remains visible.
Correct card placements remain unless the learner changes them.
A wrong card can be moved or replaced without restarting.
Attempt rules
Empty submissions do not count as graded attempts.
Incomplete guard messages do not count as graded attempts.
Failure to perform a required action, such as running 100 spins, does not count as a wrong mathematical attempt.
A substantive incorrect submitted answer counts as a graded attempt.
A corrected resubmission records its own result according to the existing attempt model.
Post-completion practice attempts are identified separately and do not reduce mastery already earned.
Learning Coach feedback panel
Placement
Desktop:
Upper-right or right side of the active problem area.
Visible without scrolling after submission.
Close to the relevant visual and answer fields.
Mobile:
Beneath the current-task panel.
Above or immediately beside the relevant answer inputs.
Automatically brought into view after feedback appears.
Feedback must not be buried at the bottom of a long page.
Wrong-feedback structure
Every wrong-answer response contains:
What happened.
Why the reasoning is not correct.
What the learner should inspect or do next.
Optional supporting elements:
user-friendly mistake-type label
highlighted visual region
miniature formula
next-action button
hint button
Target length:
3–5 short sentences
concise enough to scan
detailed enough to guide correction
Correct-feedback structure
Correct feedback contains:
confirmation
a brief conceptual explanation
completion status
visible Continue action
Target length:
1–2 concise teaching sentences
Hint rules
Hints remain deterministic and visual-first.
Hint progression:
Hint 1 points to the relevant visual.
Hint 2 shows the required structure or relationship.
Hint 3 shows a near-complete setup without unnecessarily giving away the final response.
Hint usage is saved.
Animation rules
Animations must clarify mathematical meaning.
They must:
remain fast
avoid delaying answer feedback
avoid blocking input
respect reduced-motion preferences
use immediate-state alternatives when motion is reduced
Decorative motion must not compete with the learning task.
Accessibility rules
Keyboard navigation for demos and controls.
Large tap targets.
Clear focus states.
Feedback announced through an appropriate live region where practical.
Correctness must not rely on color alone.
Labels accompany icons.
Graphs include text summaries.
Tap interaction remains available for every drag/drop-style task.
MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 20 problems. No AI in MVP.

Expected Value Lab - MVP PRD Page 8
Completed-Problem Review, Restart, Progress, and Home Pathway
Completed-problem behavior
A completed problem must not automatically restart when reopened.
Selecting a completed problem presents two explicit options:
Review Problem
Restart This Problem
If a completed-problem URL is opened directly, Review Mode is the default.
Review Problem
Review Mode displays:
“Completed — Review Mode” label
completion checkmark
saved submitted answer
normalized correct result
final deterministic explanation
completed visual state where feasible
graded-attempt summary
hints-used summary
completion date where available
“Show demo” option
“Restart This Problem” option
Review Mode must not:
increment attempts
erase completion
change the next problem
move progress backward
overwrite the saved completed snapshot
require the learner to redo the problem
For simulations, save enough summary state to reconstruct the completed learning view. Saving every raw random event is optional. A saved graph series or compact summary may be used where practical.
Restart This Problem
Restart creates a fresh practice session for that problem.
It resets only:
temporary answers
card placements
current simulation state
local step state
current feedback
current hint progression, where appropriate for practice
It does not erase:
completed status
original completed review snapshot
chapter completion already earned
lesson completion already earned
farthest progression
milestones already unlocked
mastery already earned
Restarted attempts are stored as practice attempts or otherwise distinguished from original graded progression.
Completing a restarted problem may update practice history but does not move overall progression backward.
Overall progression rule
The app saves the learner’s forward position based on the farthest completed point in the ordered progression, not the most recently opened problem.
Required concepts:
completedProblemIds
completedLessonIds
highestSequentialCompletedGlobalIndex
nextIncompleteProblemId
currentLessonId
nextLessonId
Example:
Learner completes Problems 1–8.
Learner returns to Problem 3.
Learner reviews or restarts Problem 3.
Overall progress remains through Problem 8.
Continue routes to Problem 9.
Progress percentage does not fall.
Problem 3 remains completed.
Opening, reviewing, or restarting an older problem must never change the main Continue destination.
Completion percentage
Chapter completion percentage:
completed unique problems ÷ 20 × 100
Lesson completion percentage:
completed unique problems in lesson ÷ 4 × 100
Practice repeats do not increase completion percentage beyond one completion per problem.
Continue behavior
“Continue Chapter” routes to the first incomplete problem in the ordered progression.
If all problems are complete:
Continue becomes Review Chapter or View Mastery.
The app does not restart Problem 1 automatically.
Home-page layout
The main home-page content remains centered.
On desktop and wider tablet layouts:
Use the currently empty right-side area for a rectangular current-chapter panel.
Do not add a matching left-side panel merely for symmetry.
The right panel should appear elevated through border, glow, or shadow.
The panel must not crowd the central home content.
On mobile:
Stack the current-chapter panel above or below the main content.
Preserve readable touch targets.
Avoid horizontal scrolling.
Current-chapter panel content
Chapter title: Expected Value Course
Subtitle: Master long-run average, weighted models, payout, profit, fairness, and risk.
Current lesson
Current or next problem
Completion percentage
Streak
Mastery state
Milestones
Continue button
Optional Review Previous button
Compact 5-zone course map
Golf-course progression metaphor
The current chapter is represented as an original golf-course or mini-golf-inspired path.
Required structure:
5 lesson zones
4 problem holes per zone
20 total holes
a winding progression path
numbered flags or problem markers
completed, current, and future states
Completed hole
Checkmark or sunk-ball treatment
Reduced glow
Remains clickable for Review or Restart
Current or next hole
Strong glow or ring
Subtle pulse when motion is enabled
Current-ball marker
Clear problem label
Highest visual emphasis
Future hole
Visible but subdued
Shows that more content is ahead
May use a faint flag, path marker, or lock state
Later lesson zones become more visually ambitious and motivating
Final hole
Visually deeper or more dramatic
Larger final flag or trophy marker
Clearly communicates final capstone
Must not use copied branded assets
Expanded chapter pathway
The chapter page may display a larger version of the same map.
It must show:
lesson zones
lesson names
individual problems
current and completed states
lesson completion
chapter completion
review/restart access for completed problems
The golf metaphor is navigational only. Actual math scenarios remain the PRD-defined spinners, boxes, tables, wheels, and games.
MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 20 problems. No AI in MVP.

Expected Value Lab - MVP PRD Page 9
Tech Stack, Data Schema, and Mastery
The schema must support deterministic checking, lesson progress, completed-problem review, practice restarts, and mastery tracking.
Tech stack
Frontend:
React
TypeScript
Vite
React Router
Firebase SDK
CSS, Tailwind, or the project’s established styling system
SVG or Canvas for teaching visuals
Optional Motion or Framer Motion for teaching animations
Optional shadcn/ui primitives where consistent with the existing app
Design workflow:
Figma may be used as a visual-design reference.
The deployed app must not depend on a Figma file.
Original SVG/CSS assets are preferred.
No copied Topgolf or third-party branded artwork.
Backend:
Firebase Authentication for Google sign-in
Firestore for profiles, progress, attempts, problem state, and milestones
Firebase Hosting or Vercel for deployment
Cloud Functions are not required for MVP
Answer checking:
Client-side deterministic logic
Normalized answer parser
Per-problem acceptedFormats
Per-problem mistakeRules
Numeric-equivalence checks
Fraction/decimal/percentage equivalence
No AI
Data schema
users/{userId}
userId
displayName
email
createdAt
lastLoginAt
chapterProgress/{userId}_expected_value_intro
userId
chapterId = “expected-value-intro”
currentLessonId
nextLessonId
nextProblemId
highestSequentialCompletedGlobalIndex
completedProblemIds
completedLessonIds
completionPercentage
masteryStatus
streakCount
lastActiveDate
updatedAt
nextProblemId is derived from ordered progression and must not be replaced by the most recently opened problem.
lessonProgress/{userId}_{lessonId}
userId
chapterId
lessonId
completedProblemIds
completionPercentage
lessonCompleted
firstStartedAt
completedAt
updatedAt
problemProgress/{userId}_{problemId}
userId
chapterId
lessonId
problemId
status
firstStartedAt
completedAt
bestGradedAttemptNumber
finalSubmittedAnswer
finalNormalizedAnswer
finalMistakeType
finalFeedbackKey
reviewSnapshot
demoSeen
demoLastSeenAt
restartCount
lastReviewedAt
updatedAt
Possible status values:
not_started
in_progress
completed
Review and practice state must not replace completed status.
problemAttempts/{attemptId}
userId
chapterId
lessonId
problemId
stepId
submittedAnswer
normalizedAnswer
isCorrect
attemptNumber
attemptMode
hintUsed
mistakeType
masteryTagsTested
createdAt
Possible attemptMode values:
graded
corrected_resubmission
practice_restart
Incomplete guard submissions are not stored as graded incorrect attempts.
milestones/{userId}_expected_value_intro
userId
chapterId
unlockedMilestones
completedLessonIds
chapterCompleted
chapterMastered
updatedAt
Problem JSON object
Each problem object supports:
problemId
legacyProblemId, where migration compatibility is required
chapterId
lessonId
lessonIndex
problemIndexWithinLesson
globalProblemIndex
title
concept
difficulty
scenarioText
visualType
interactionType
givenData
demoConfig
currentTaskConfig
requiredActions
answerInputs
correctAnswers
acceptedFormats
mistakeRules
feedback
hints
animations
completionRule
masteryTags
Problem ID compatibility
Existing original problem IDs should remain valid.
Do not silently rename original problem IDs if that would erase progress.
If lesson-aware IDs are introduced, use a compatibility mapping.
New problems receive stable IDs.
Saved completedProblemIds must continue resolving after the 5-lesson migration.
Mastery rule
Learner masters the chapter if:
all 20 problems are complete
the final capstone is correct
the learner correctly completes the full-model problem
the learner correctly distinguishes expected payout from expected profit
the learner correctly distinguishes equal EV from equal risk
at least 15 of 20 problems are completed in no more than 2 graded attempts
required mastery tags are demonstrated
The 15-of-20 threshold preserves the original 75% strong-attempt standard.
Post-completion practice restarts do not reduce previously earned mastery.
Mastery states
Not Started
Learning
Developing
Mastered
Suggested milestones
First problem completed
First direct correction
Lesson 1 completed
Lesson 2 completed
Lesson 3 completed
Lesson 4 completed
All simulations completed
Profit and fairness distinction demonstrated
Risk distinction demonstrated
Final capstone completed
Chapter completed
Chapter mastered
Streak milestones
Security rules
Each authenticated user may read and write only their own progress documents.
Public problem definitions may be bundled client-side.
No answer-checking request requires unrestricted Firestore access.
Environment files remain excluded from source control.
MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 20 problems. No AI in MVP.

Expected Value Lab - MVP PRD Page 10
Appendix — Build Order, Validation, and Release Testing
This page is not part of the product requirements; it is the recommended implementation sequence.
Revised build order
1. Preserve and validate the current stable app
Confirm Firebase auth.
Confirm user profile creation.
Confirm existing progress documents.
Confirm original problems still function.
Add or preserve answer-normalization tests.
2. Fix completed-problem review and restart
Add completed-problem action choice.
Add Review Mode.
Add Restart This Problem.
Preserve completed state.
Preserve farthest progression.
Fix Continue destination.
Save review snapshots.
3. Add problem onboarding and Learning Coach UI
Reusable pre-problem demo.
Demo configuration.
Current-task panel.
Step checklist.
Higher feedback placement.
Longer learning-oriented explanations.
Show demo again.
Mobile and accessibility pass.
4. Introduce the 5-lesson architecture
Add chapter → lesson → problem hierarchy.
Map the original 8 problems into lessons.
Preserve original IDs.
Add lesson progress.
Update navigation.
Adapt the course map to lesson zones.
Do not add new problems until this structure is stable.
5. Add the 12 new problems in controlled batches
Batch 1:
Lesson 1 new problems
Lesson 2 new problems
Batch 2:
Lesson 3 new problems
Lesson 4 new problems
Batch 3:
Lesson 5 new problems
Final capstone
Each batch includes:
problem data
visuals
demos
checkers
accepted formats
mistake rules
feedback
hints
animations
validation cases
6. Persistence and mastery migration
Add lesson progress.
Add problem review snapshots.
Add demo-seen state.
Add restart/practice tracking.
Update mastery from 8 to 20 problems.
Confirm existing users do not lose progress.
7. Home and pathway visual pass
Add the right-side current-chapter panel.
Add compact golf-course progression map.
Add 5 lesson zones.
Add 20 holes.
Add current-problem glow.
Add completed and future states.
Add final capstone treatment.
Test mobile stacking.
8. Accessibility and mobile pass
Tap-to-place for every relevant interaction.
Keyboard navigation.
Focus states.
Feedback live regions.
Reduced-motion support.
Phone-width testing.
No horizontal overflow.
Large touch targets.
9. Deploy and test
Deploy publicly.
Test multiple users.
Test sign-in and sign-out.
Test saved progress.
Test review and restart.
Test every lesson boundary.
Test completion and mastery.
Test Firestore security rules.
Automated validation
Answer-parser tests
Test:
money normalization
numeric normalization
fractions
percentages
decimal tolerance
classification normalization
approved deterministic explanation matching
Problem-checker tests
For all 20 problems:
accepted correct formats pass
specified equivalent formats pass
obvious incorrect answers fail
known mistake types are detected
completion rules are enforced
incomplete guards do not count as wrong attempts
Session tests
Test:
editing clears stale feedback
corrected resubmission passes
correct multi-field values remain
wrong graded submissions increment attempts
review does not increment attempts
restart does not erase completion
restart does not reduce overall progression
Continue targets the next incomplete problem
Progress tests
Test:
lesson completion
chapter completion
20-problem percentage
highest sequential progress
completedProblemIds uniqueness
completedLessonIds
mastery calculation
practice attempts excluded from mastery penalties
Manual MVP testing scenario
A new learner:
Signs in with Google.
Sees the home page.
Sees a right-side Expected Value Course panel.
Sees the current hole glowing.
Starts Lesson 1.
Receives a short visual demo before the spinner problem.
Completes the demo without creating an attempt.
Predicts the spinner average.
Runs the required simulation.
Submits a wrong answer.
Sees learning-oriented feedback high on the page.
Corrects the answer directly.
Completes the problem.
Leaves the chapter.
Returns to the same completed problem.
Selects Review Problem.
Sees the saved result without restarting.
Selects Restart This Problem.
Practices it again without losing forward progress.
Continues to the next incomplete problem.
Gets a counts-to-probability question wrong.
Receives a visual hint.
Leaves mid-lesson.
Returns to the same active problem.
Completes all 5 lessons and 20 problems.
Sees completion, mastery, streak, milestones, and suggested review areas.
Reviews an earlier problem while Continue still points to the correct forward problem.
Completes the final capstone.
Sees the final golf-course hole completed.
Repeats the main flow at mobile width.
Parallel implementation rules
To minimize merge conflicts:
Only one agent edits progress, routing, and shared chapter architecture at a time.
Complete and commit review/restart behavior before lesson restructuring.
Complete and commit lesson restructuring before adding new problems.
Problem agents should own separate problem batches.
Shared registries should be integrated serially.
Validation-only agents should create new test or report files rather than modifying active UI files.
Each stage must build and pass tests before the next stage branches from it.
No agent should change unrelated Firebase auth files.
Do not push remote changes unless explicitly approved.
MVP only: one login-based, hand-built visual chapter on expected value. Five lessons, 20 problems. No AI in MVP.

