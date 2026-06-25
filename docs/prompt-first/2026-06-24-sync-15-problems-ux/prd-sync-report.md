# PRD Sync Report — 2026-06-24-sync-15-problems-ux

## Run metadata
- **Mode:** sync-only (no application code changed)
- **Authority:** User prompt `/prompt-first-build sync-only`
- **Baseline:** `docs/prompt-first/2026-06-24-sync-15-problems-ux/prd-before.md`
- **Output:** `prd.md` (1829 lines)

## Confirmations (required)

| Requirement | Status |
|-------------|--------|
| Five lessons remain | ✅ Confirmed |
| Each lesson has three problems | ✅ Confirmed |
| Chapter has 15 total problems | ✅ Confirmed |
| Each lesson targets 3–8 minutes | ✅ Confirmed (L3/L5 tensions documented) |
| Each Problem 1 is visual interactive introduction | ✅ Confirmed |
| Each Problem 3 is independent fluency check | ✅ Confirmed |
| Final chapter problem is complete capstone | ✅ ev-l5-p3 Final Carnival Decision |
| Desktop layouts keep visual, controls, feedback together | ✅ Page 2 + per-problem workspace blocks |
| Mobile layouts avoid scroll-chasing | ✅ Page 2 + per-problem mobile blocks |
| Source research informed every selected problem | ✅ Curriculum matrix + references on Page 2 |
| Legacy problem IDs and progress implications addressed | ✅ Legacy audit table + migration rules |
| No application code was changed | ✅ Confirmed |

## Structural changes

### Added
- Planning note at top of PRD
- Lesson timing table (3–8 min targets with justifications)
- **Page 2:** Problem-page UX requirements (desktop two-region, mobile sticky, viewport standard)
- **Page 2:** Educational-app UX benchmark (Brilliant, Khan, Numworks, OpenStax — principles only)
- **Page 2:** Curriculum research summary
- **Page 2:** Curriculum cohesion matrix (15 rows)
- **Page 2:** References section with URLs
- **Page 2:** Legacy ID mapping, implemented-behavior audit, removed-problem progress resolution
- Per-problem: stable ID (`ev-l{N}-p{M}`), legacy mapping, instructional role, time estimate, desktop/mobile workspace blocks

### Changed
- 20 → 15 problems throughout (completion %, mastery 11/15, golf map 15 holes, build order, validation)
- Lesson 1 Problem 1: **Carnival Chip Bag** (Berkeley box model) replacing generic spinner intro; legacy `problem-1` preserved
- Learning Coach placement: right region beside active input (not distant upper-right)
- Mastery threshold: 15 of 20 → **11 of 15** (75% preserved)
- Golf course: 4 holes/zone → **3 holes/zone**, 15 total

### Removed (one per lesson)
| Removed | Lesson | Successor for progress |
|---------|--------|------------------------|
| l1-short-run-vs-long-run | L1 P3 | ev-l1-p2 |
| l2-fill-missing-formula | L2 P3 | ev-l2-p3 |
| l3-repair-probability-table | L3 P3 | ev-l3-p3 |
| l4-find-fair-price | L4 P3 | ev-l4-p3 |
| l5-low-risk-vs-high-risk | L5 P3 | ev-l5-p3 |

### Kept (repositioned as 3-problem sequences)
- L1: ev-l1-p1 (new chip bag), ev-l1-p2 (unequal spinner), ev-l1-p3 (compare spinners)
- L2: ev-l2-p1, ev-l2-p2, ev-l2-p3 (diagnose)
- L3: ev-l3-p1, ev-l3-p2, ev-l3-p3 (prize bag)
- L4: ev-l4-p1, ev-l4-p2, ev-l4-p3 (choose better game)
- L5: ev-l5-p1, ev-l5-p2, ev-l5-p3 (capstone)

Detailed behavioral specs for 14 retained problems merged from prior PRD; L1P1 newly authored.

## Codebase audit (implemented problems — chapter numbers pre-migration)

| Chapter # | Storage ID | Implementation | Notes |
|-----------|------------|----------------|-------|
| 1 | problem-1 | Problem1LongRunAverage + SpinnerPlayground | Maps to ev-l1-p1; chip bag target spec |
| 5 | problem-2 | pack-a l2-build-weighted-average | Maps to ev-l2-p1 |
| 9 | problem-3 | pack-a l3-mystery-box-outcomes | Maps to ev-l3-p1 |
| 10 | problem-4 | pack-a l3-calculate-ev-from-table | Maps to ev-l3-p2 |
| 13 | problem-5 | Problem5PayoutVsProfit + PayoutPlayground | Maps to ev-l4-p1 |
| 14 | problem-6 | Problem6FairnessSort | Maps to ev-l4-p2 |
| 17 | problem-7 | Problem7WholeEVModel | Maps to ev-l5-p1 |
| 18 | problem-8 | Problem8SameEVDifferentRisk | Maps to ev-l5-p2 |

## Conflicts resolved (prompt wins)

| Conflict | Resolution |
|----------|------------|
| PRD said 20 problems / 4 per lesson | Rewritten to 15 / 3 |
| PRD L1P1 was basic spinner | Replaced with chip bag intro per product bar |
| Feedback upper-right placement | Revised to compact workspace beside input |
| Mastery 15/20 attempts | Revised to 11/15 |
| Golf map 20 holes | Revised to 15 holes |

## Unchanged (no conflict)
- Firebase auth, Firestore schema shapes, security rules
- Demo system, answer normalization, review/restart semantics
- Tech stack appendix (except problem counts in validation)

## Artifacts
- `docs/prompt-first/2026-06-24-sync-15-problems-ux/prompt.md`
- `docs/prompt-first/2026-06-24-sync-15-problems-ux/prd-diff.md`
- `docs/prompt-first/2026-06-24-sync-15-problems-ux/prd-sync-report.md` (this file)
- `docs/prompt-first/2026-06-24-sync-15-problems-ux/prd-before.md` (baseline snapshot)
- `docs/prompt-first/2026-06-24-sync-15-problems-ux/generate-prd.py` (generator)
- `docs/prompt-first/2026-06-24-sync-15-problems-ux/merge-detail.py` (detail merge)
