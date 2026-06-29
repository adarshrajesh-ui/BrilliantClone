# BrainLift: AI-First Build Process — Midpoint (Brilliant Clone on probability)

Date: June 2026

**Purpose:**
To document the reasoning behind my AI-first build process for Midpoint and the point of view I developed while building it.

**In Scope:**
Tools and workflow, prompting strategies, phase decisions, code split, key learnings; Big focus is reasoning behind decisions of app design

**Out of Scope:**
Firebase/auth setup, deployment config, general React patterns

## Tools & Workflow

### DOK1 — Tools Used

Tools used:

- Built almost entirely in Cursor using background task agents; some sessions in Claude Code
- Custom parallel-build skill installed at `~/.cursor/skills/parallel-build/SKILL.md`
- Up to 15 agents running simultaneously with non-overlapping file ownership
- OpenAI API integrated server-side via Firebase Cloud Functions in Phase 2; key never touches the client
- 50 AI question generations per user per UTC calendar day, enforced via Firestore quota

### DOK2 — Synthesis of Workflow

Midpoint was built using a parallel-build methodology: a PRD gets decomposed into phases, each phase assigns non-overlapping file ownership to background agents, and agents gate on checkpoints before the next phase starts. The build ran in three deliberate phases. Phase 1 proved the curriculum without any AI. Phase 2 added AI as a controlled generator only — surface-level, including scenario copy, numbers, and distractors, while the app retained full ownership of grading, selection, and mastery logic. Phase 3 layered learning science: difficulty scaffolding, spaced repetition, interleaving, and retrieval practice.

## Prompting Strategies

### DOK1 — Prompting Observations

Giving examples or citing examples was the single biggest improvement in success I saw from my prompts. Prompts to Opus 4.8 that gave it the exact direction or desired outcome worked especially well. If it was any other model, I gave much more granular instructions.

Regardless of the model, plenty of pictures and examples of code implementing certain UI features always provided the LLM with the best context. Although implementation has gotten better, user sense of LLMs is still lacking, causing unguided prompting for interactive questions to result in hard-to-understand UIs that do not teach well.

For interactive lessons, I scoped out all requirements and did not just query the end result. Planning mode is vital for big changes because the agents confirm any misalignments before building.

### DOK2 — Prompting Strategy

The best workflow was not "prompt once and build everything." The effective workflow was to quality-control one lesson or one interaction first, then extend the pattern across the rest of the app. Early iterations often applied changes to only part of the codebase, so each successful implementation had to be turned into a reusable pattern and then deliberately propagated across all relevant lesson sets.

## Prompts That Worked

### DOK1 — Parallel Build Prompt

> /parallel-build
> spawn 5 agents
> Change only Lesson 1 Problem 1.
> Make the whole problem a two-dice 3D roll simulation.
> User interaction:
> - Users can pick up two 3D dice with cursor/touch.
> - The user throws them into a dice tray/board.
> - Dice animate like real board-game dice: lift, throw arc, tumble, bounce, roll, settle.
> - Use a dedicated simulation area like a Monopoly-style dice roll section, but do not copy Monopoly assets.
> - Add fallback buttons: Roll 1, Roll 10, Roll 100.
>
> Math goal:
> Teach expected value as long-run average using the sum of two dice.
> Correct EV = 7.
> Graph every result.
> Show the running average converging toward 7.
> Also show a distribution/histogram of sums forming a bell-like shape centered at 7.
> Update: problem title, scenario, demo, instructions, required actions, answer/completion rules, accepted answer formats, mistake types, hints, feedback, animations, reduced-motion behavior, validation tests
>
> Completion:
> User can manually throw die, and run at least 100 total rolls, then answer that the long-run average sum is 7.
> Keep no-scroll Brilliant-style layout:
> left = 3D dice tray + graphs
> right = task, controls, answer, hints, feedback, next/continue.
> Do not change other problems.
> Do not change auth/Firebase/progress except any required problem-1 metadata.
> No AI features.

### DOK1 — Animation Analysis Prompt

> Based on attached screenshots, describe the target animation phases: red heart face, edge-on thin red/black chip, black spade/club face, spinning, centered on vertical axis. Deeply analyze all pictures and gifs.

### DOK1 — AI Boundary Prompt

> Build adaptive deterministic practice first, then add AI as a controlled generator. The app should own: skill tracking, question selection, difficulty, grading, mastery updates. AI should only fill: story/scenario copy, numbers within constraints, distractors, explanation text.

### DOK1 — UX Constraint Prompt

> During a problem, scrolling should not be part of the learner experience. The full active problem state must fit in one focused workspace like Brilliant: visual, prompt/current task, input, feedback.

## Code Analysis

### DOK1 — Code Split

Code split:

- ~99% AI-generated: scaffolding, CSS, routing, Firebase, tests
- ~1% hand-written: specific problem definitions, API keys

### DOK2 — Code Split Summary

The <1% of code I wrote by hand was only done when writing by hand would be more efficient, which is very rare due to the workflow of loop skills and parallel building by agent.

## Phase Decisions

### Phase 1 — Subject Choice and Visual Learning Rationale

**DOK1 — Probability is highly misunderstood by students**
Source: https://dl.icdst.org/pdfs/files/ba54c7e0521f806e7eddc2e1003154da.pdf
DOK1: Probability is among the most misunderstood topics for students.

**DOK2 — Probability needs guided visuals because students carry specific misconceptions**
Source: https://the-learning-agency.com/guides-resources/the-hidden-roots-of-mathematics-struggles-foundational-gaps-over-conceptual-peaks/
DOK2: Probability, typically introduced in middle school to early high school, grades 6–9, is often misunderstood because of equi-probability bias, assuming all events have the same likelihood, and outcome orientation, not being able to see long-term outcomes of probabilities. Developing intuition to clear these misconceptions with guided visuals tailored to dispel these biases is essential.

Each lesson should target one misconception directly. Equi-probability bias is addressed with visuals where unequal sample spaces or weighted outcomes are visible, such as decks, spinners, dice, and payout tables. Outcome orientation is addressed through repeated trials and EV contribution visuals that show why a single outcome is not the same as the long-run expected result. The visual is used only when it makes the hidden probability structure visible; it is not decoration.

### Phase 2 — AI Boundary and No Separate Game Layer

**DOK1 — Seductive details can distract from learning**
Source: Rey, G. D. 2012. "A Review of Research and a Meta-Analysis of the Seductive Detail Effect." Educational Research Review.

**DOK3 — Interaction should teach the concept, not decorate it**
An insight from Rey's seductive-detail effect is that many popular educational games add extraneous features or unrelated mini-games to motivate users, but these features can undermine learning by pulling attention away from the core concept. Therefore, this app used a Brilliant-like model: the problems themselves are interactive and engaging, but no separate game is embedded.

**DOK1 — The assistance dilemma applies to AI tutoring**
Source: Koedinger, K. R., & Aleven, V. 2007. "Exploring the Assistance Dilemma in Experiments with Cognitive Tutors." Educational Psychology Review.
The paper is specifically on human tutors giving too much information, but it is still highly relevant for understanding LLMs' roles in teaching because LLMs can create the same assistance dilemma: if they give too much explanation, hinting, or direct feedback too early, they may reduce the productive struggle and cognitive effort needed for learning.

**DOK2 — AI should generate practice, not replace thinking**
AI itself is not a feature that helps learning. Its application needs to be filtered through learning science for it to be useful. Otherwise, it can remove cognitive load that may be necessary for mastering the specific subject matter. As such, in this app: AI practice question generation via OpenAI, server-side only, and AI generates the question specifically based on what is needed by the algorithm that encodes learning-science principles. The AI used is not a chatbot of any kind.

### Phase 3 — Learning Science Added

**DOK2 — Phase 3 learning-science implementation**
The bulk of problems in the app test fluency and only use free-answer responses.
Retrieval practice: make learners recall, not just recognize. Favor problems that pull the idea out of memory over passive review.
Scaffolding and desirable difficulty: start supported, then fade the support so problems stay hard enough to grow from.

- Spaced repetition — wrong problems resurface with explicit spacing intervals by score band
- Interleaving — practice mode mixes problem types across lessons
- Immediate, explanatory feedback, refined so that wrong answers teach.

**DOK2 — Practice Mode should train strategy selection, not just arithmetic**
Summary: Expected value is not only a calculation skill. Students must decide whether a problem is asking for payout, profit, fairness, risk, or comparison. That is why Practice Mode uses free-answer problems, spaced review, and interleaved contexts instead of repeated multiple-choice drills.

**DOK1 — Cepeda et al. — Distributed Practice Meta-Analysis**
Cepeda et al. reviewed 839 assessments from 317 experiments across 184 articles, making this one of the strongest sources for spacing. This supports resurfacing missed EV skills later instead of immediately drilling them in one block.

**DOK2 — Guidance should build the EV schema, then fade**
Summary: Early problems should be guided with tables, labels, and setup support so learners can build the expected-value schema without overload. Later problems should remove that support so learners develop fluency. Feedback should explain the mistake and show the repair, not just mark the answer wrong.

**DOK1 — Van der Kleij, Feskens, & Eggen — Computer-Based Feedback Meta-Analysis**
This meta-analysis found that elaborated feedback produced stronger learning effects than correctness-only feedback or simply giving the correct answer. This supports showing EV contribution rows and misconception-specific feedback after wrong answers.

**DOK1 — Atkinson, Renkl, & Merrill — Fading Worked-Out Steps**
This paper supports transitioning learners from worked examples to independent problem solving by fading worked-out steps. This backs the app's structure: first problems are heavily guided, then tables and hints fade as students solve more independently.

As used for the app, the first problem or two are heavily guided in order to build up the user's schemas so they can build intuition and effectively solve problems unguided. The last problem of each section is still guided to a certain extent but still tests fluency. The practice is what really tests fluency, but it is adapted.

**DOK2 — Cognitive Load Theory supports guided-first design**

**DOK1 — Sweller — Cognitive Load During Problem Solving**
Sweller argues that conventional problem-solving activity can be ineffective for schema acquisition because it creates unnecessary cognitive load for learners who do not yet have the right schemas.

**DOK2 — Cognitive Load Theory application**
Cognitive Load Theory supports the app's guided-first structure. Early EV problems use tables, labels, and setup support to reduce unnecessary load while students build the value × probability schema. Later problems fade that support so the learner has to solve independently.

**DOK2 — Interleaving supports real EV transfer**

**DOK1 — Taylor & Rohrer — The Effects of Interleaved Practice**
Taylor and Rohrer found that interleaving different types of math problems improved later test performance compared with blocking one problem type at a time.

**DOK2 — Interleaving application**
Interleaving supports Practice Mode because expected value requires real strategy selection. By mixing fair price, profit, better-game, and risk problems, the app forces students to identify which EV setup applies instead of repeating the same procedure automatically.

### Gamification, Motivation, and Learning

**DOK1 — Extrinsic rewards can undermine intrinsic motivation**
Source: Deci, Koestner & Ryan (1999), "A Meta-Analytic Review of Experiments Examining the Effects of Extrinsic Rewards on Intrinsic Motivation," Psychological Bulletin 125(6), 627–668.
A meta-analysis of 128 studies found that engagement-, completion-, and performance-contingent rewards significantly undermined free-choice intrinsic motivation, d = −0.40, −0.36, −0.28, while positive informational feedback enhanced it, d = 0.33. This is the central finding behind "real achievement motivates, bolted-on reward mechanics demotivate."
https://pubmed.ncbi.nlm.nih.gov/10589297/

**DOK1 — Decorative gamification can lower learning outcomes**
Source: Hanus & Fox (2015), "Assessing the effects of gamification in the classroom," Computers & Education 80, 152–161.
A 16-week longitudinal study, 71 students, gamified vs. non-gamified sections of the same course: the gamified course, leaderboard + badges, produced lower intrinsic motivation, satisfaction, and empowerment over time, and lower final exam scores — an effect statistically mediated by the drop in intrinsic motivation. Direct evidence that decorative gamification can lower the actual learning outcome.
https://doi.org/10.1016/j.compedu.2014.08.019

**DOK2 — Gamification only helps when bound to the learning content**
Source: Sailer & Homner (2020), "The Gamification of Learning: A Meta-Analysis," Educational Psychology Review 32, 77–112.
Synthesizing the field, gamification's effect on cognitive learning is only small, g = 0.49, and highly heterogeneous, I² = 72%; the moderators that actually help are game fiction tied to content and competition combined with collaboration — not points/badges. Gamification is not itself the lever for learning; the effect exists only when the game elements are bound to the content, and is small and unreliable otherwise.
https://doi.org/10.1007/s10648-019-09498-w

**DOK3 — Intrinsic integration beats sugar-coated edutainment**
Source: Habgood & Ainsworth (2011), "Motivating Children to Learn Effectively: Exploring the Value of Intrinsic Integration in Educational Games," Journal of the Learning Sciences 20(2), 169–206.
Anchored theoretically by Ryan & Deci's Self-Determination Theory: competence — the felt sense of growing capability — is a core intrinsic motivator.
When the same math game was rebuilt so the learning was the core mechanic, intrinsic integration, vs. "sugar-coating" where content was siloed into quizzes between gameplay, extrinsic, the intrinsic version produced more learning under fixed time and 7× longer voluntary play. The authors frame this as explaining "the failure of edutainment." Motivation that comes from doing the learning task itself outlasts motivation attached as a separate game; when the game is detachable from the content, the app is competing in an engagement contest it will lose.
https://eric.ed.gov/?id=EJ922627
https://selfdeterminationtheory.org/SDT/documents/2000_RyanDeci_SDT.pdf

## DOK3 Insights

**DOK3 — Gamification should support retention, not replace learning**
The best apps and leaders, like Khan Academy, do use many features to gamify, but the learning itself is never gamified. All the gamification is done for user retention and keeping the user engaged with streaks and motivation by allowing them to see what is done. But using visual methodology to teach and for fluency has led many reports to criticize Brilliant for not really achieving its end goal: learning and consolidating long-term memory of a topic. This led to the insight that a degree of user frustration is necessary for an app to be effective.

## DOK4 SPOVs

**DOK4 — The best motivator is real progress**
The best motivator is real progress on whatever users are trying to do. As in, they see similar-looking problem types and receive feedback that repairs misconceptions. The real incentive is motivation through real achievement. Apps that gamify with extrinsic rewards lower the efficiency of the goal they are made for in order to become more tolerable; however, if the end result is not achieved, then what is the point? An example is Anki. Anki is bare-bones and just an FSRS scheduler that med school students use to pass the MCAT. However, this very same program is used by the majority of med school students despite being bare-bones. Survey evidence supports the claim that Anki is widely used despite being bare-bones: a 2024 survey of U.S. medical students reported that 86.2% used Anki and 66.5% used it every day. This widespread use is significant: outside achievement — the incentive of doing well on the MCAT or in med school — is what pushes med students to use it.

**DOK4 — Unrelated games compete with the wrong product category**
Learning apps that are games themselves, or games that are not related to the topic or have major extraneous features, fail their core learning goal. They are, in essence, competing in a different field while trying to achieve something. They are competing against games for user engagement while not achieving the end goal. A user who wants to learn may not be able to develop the intrinsic motivation that comes with seeing themselves do better, and a person who needs the game to be attracted will get bored with the game at some point and play a real game.
