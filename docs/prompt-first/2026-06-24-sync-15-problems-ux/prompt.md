# Prompt snapshot — 2026-06-24-sync-15-problems-ux

Frozen authoritative prompt for `/prompt-first-build sync-only`.

## MODE
PRD sync only. No application code, tests, or unrelated architecture changes.

## PRIMARY CHANGES
1. Replace 5×4 (20 problems) with 5×3 (15 problems).
2. Rewrite problem-page UX so learners never scroll-chase between visual, input, and feedback.

## KEY REQUIREMENTS (abbreviated — full text in chat session)
- Product bar: research-backed curriculum, no filler
- Web research on EV teaching sources before editing
- Source documentation per problem + references + curriculum-research summary
- Three-problem lesson progression: P1 intro / P2 guided / P3 fluency
- Lesson timing 3–8 minutes with per-problem estimates
- Granular specification for all 15 problems (IDs, layout, validation, feedback, hints, a11y)
- Curriculum cohesion matrix
- Legacy ID compatibility audit for problems 1, 5, 9, 10, 13, 14, 17, 18
- UX benchmark section (Brilliant et al. — principles only)
- Desktop two-region workspace; mobile no-scroll-chasing
- Add exact note: "This PRD edit is planning/spec only. No application code was changed."

## LESSON GOALS
1. Long-run average
2. Weighted average
3. Counts → tables → EV
4. Payout vs profit, fairness, compare games
5. Full models + same EV different risk

## FINAL PROBLEM REQUIREMENTS
- L1P3: Compare long-run averages (not misled by payout/frequency/short sim)
- L2P3: Diagnose/construct complete weighted model
- L3P3: Full table from counts + EV
- L4P3: Compare games by expected profit
- L5P3: Chapter capstone (probabilities, payout, cost, profit, fairness, risk)

## OUTPUT
Edit prd.md; produce prompt.md, prd-diff.md, prd-sync-report.md, sync summary.
