# PRD Sync Report — 2026-06-24-fun-p1-animations

## Mode
PRD/spec edit only. No application code changed.

## Confirmations

| Requirement | Status |
|-------------|--------|
| 5 lessons × 3 problems = 15 total preserved | ✅ |
| No AI deterministic checking preserved | ✅ |
| Legacy ID compatibility preserved | ✅ |
| Planning note present | ✅ |
| L1P1 = Dice Toss Average with drag-throw | ✅ |
| All five P1s have Fun animation sections | ✅ |
| L5P1 does not duplicate L5P3 capstone | ✅ |
| No-scroll-chasing UX preserved in P1 specs | ✅ |
| Validation notes updated for P1 gates | ✅ |

## Problem 1 revisions

| ID | New title | Core interaction |
|----|-----------|------------------|
| ev-l1-p1 | Dice Toss Average | Drag/throw die, tumble, payout tray, running avg |
| ev-l2-p1 | Prize Board Weight Drop | Drop tokens on sized zones → formula |
| ev-l3-p1 | Mystery Box Reveal | Lid flip, token pop, group fly, row fill |
| ev-l4-p1 | Pay to Play | Coin stream, cost drag, profit meter drop |
| ev-l5-p1 | Carnival Booth Preview | Side-by-side 5-round previews, feel vs average MC |

## Sections changed
- Page 1: PRD change summary (fun P1 pass)
- Page 1: In-scope visuals (draggable dice)
- Page 2: Problem 1 design rule under UX requirements
- Page 2: Legacy audit rows for problem-1, problem-7
- Page 2: Cohesion matrix rows ev-l1-p1, ev-l5-p1
- Pages 3–7: Full L1P1 rewrite; L2P1–L5P1 rewrites with Fun animation blocks
- Page 11: Manual test + validation matrix P1 gates

## Unchanged
- Problems 2–3 in all lessons
- Progress, mastery (11/15), golf map 15 holes
- Firebase/schema/security appendix

## Artifacts
- `prompt.md`, `prd-before.md`, `prd-diff.md`, `patch-p1-specs.py`
