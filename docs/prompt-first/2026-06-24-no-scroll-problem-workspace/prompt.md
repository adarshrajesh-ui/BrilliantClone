# Prompt snapshot — 2026-06-24-no-scroll-problem-workspace

Frozen authoritative prompt for `/prompt-first-build sync-only`.

## MODE
PRD sync only. Update only the PRD sections related to problem-page UI/layout. No application code changed.

## GOAL
All problem pages must use a no-scroll, Brilliant-like problem workspace.

## RESEARCH REQUIREMENT
Study Brilliant's public problem/lesson interaction patterns and use them only as UX
inspiration (some way or another, such as scraping/reading the website). Colors may differ.

## BINDING UI RULE
During a problem, scrolling must not be part of the learner experience. The full active
problem state must fit in one focused workspace like Brilliant:
- visual
- prompt / current task
- input / interaction
- feedback
- hint
- Next / Previous controls
- completion state

Problem pages must not rely on long vertical pages. "Scroll down to answer, scroll back up
to see the visual" must be impossible by design.

## NAVIGATION
Add explicit Next and Previous controls for moving through problem steps or screens. The
learner progresses through compact panels instead of scrolling.

## SCOPE
Do not change curriculum, problem math, validation rules, Firebase, routing, or data schema
except for small wording needed to support the no-scroll UI rule.

## ADD ACCEPTANCE CRITERIA
- At desktop and mobile sizes, each active problem step must fit without scrolling.
- Feedback appears in the same panel as the attempted action.
- If content is too large, split it into Next/Previous steps rather than adding page scroll.

## OUTPUT
Edit prd.md (UI/layout sections only); produce prompt.md, prd-before.md, prd-diff.md,
prd-sync-report.md, and a sync summary.
