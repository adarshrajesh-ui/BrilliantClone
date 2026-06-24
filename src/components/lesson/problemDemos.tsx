// Topic-agnostic, action-focused mini-demos.
//
// These exist ONLY to teach a brand-new UI interaction the learner has not used
// before — never to restate the problem. Each step shows the *gesture* with
// generic shapes/letters (no spinners, dollars, or expected-value wording) so
// the demo is purely about "how this control works".
//
// A demo is wired into a problem only the first time its interaction appears:
//   - Problem 1: run a batch of trials and read a live line graph
//   - Problem 2: tap-to-place (pick a tile, then drop it in a slot)
//   - Problem 3: tap-to-reveal hidden tiles
//   - Problem 5: the balance widget (tap a block on, watch it tip)
// Problems that reuse one of these interactions (4, 6, 7, 8) get no demo.

import type { DemoStepConfig } from '../../features/learning-experience'

/** Three batch-size buttons; the middle one pulses to model a tap. */
const batchButtonsVisual = (
  <div className="demo-viz demo-viz-batch" aria-hidden="true">
    <span className="demo-viz-btn">×1</span>
    <span className="demo-viz-btn demo-viz-btn-active">×10</span>
    <span className="demo-viz-btn">×100</span>
  </div>
)

/** A line that climbs from noisy values and settles toward a dashed target. */
const settlingLineVisual = (
  <div className="demo-viz" aria-hidden="true">
    <svg viewBox="0 0 160 70" className="demo-viz-graph" role="presentation">
      <line className="demo-viz-target" x1="0" y1="32" x2="160" y2="32" />
      <polyline
        className="demo-viz-line"
        points="2,60 14,20 26,52 38,28 50,44 62,30 78,38 96,33 116,34 140,32 158,32"
      />
    </svg>
  </div>
)

/** A selected tile that slides into an empty dashed slot, then repeats. */
const tapToPlaceVisual = (
  <div className="demo-viz demo-viz-place" aria-hidden="true">
    <span className="demo-viz-tile demo-viz-tile-moving">A</span>
    <span className="demo-viz-arrow">→</span>
    <span className="demo-viz-slot" />
  </div>
)

/** A face-down tile that flips open to reveal a star, looping. */
const tapToRevealVisual = (
  <div className="demo-viz demo-viz-reveal" aria-hidden="true">
    <span className="demo-viz-card demo-viz-card-static">★</span>
    <span className="demo-viz-card demo-viz-card-flip">
      <span className="demo-viz-card-back">?</span>
      <span className="demo-viz-card-front">★</span>
    </span>
    <span className="demo-viz-card demo-viz-card-down">?</span>
  </div>
)

/** A beam on a fulcrum that tips when a block drops onto one side. */
const balanceTapVisual = (
  <div className="demo-viz demo-viz-balance" aria-hidden="true">
    <div className="demo-viz-beam">
      <span className="demo-viz-pan demo-viz-pan-left" />
      <span className="demo-viz-pan demo-viz-pan-right" />
      <span className="demo-viz-block" />
    </div>
    <span className="demo-viz-fulcrum" />
  </div>
)

/** Problem 1 — running batches of trials and reading a live line graph. */
export const PROBLEM_1_DEMO: DemoStepConfig[] = [
  {
    id: 'p1-run',
    title: 'Run a batch',
    body: 'Tap a run button to generate results — one at a time, or a hundred at once. Bigger batches just gather more results faster.',
    media: batchButtonsVisual,
  },
  {
    id: 'p1-settle',
    title: 'Watch the line settle',
    body: 'The graph redraws after every batch. Early on the line jumps around; run enough rounds and it flattens out near one value.',
    media: settlingLineVisual,
  },
]
export const PROBLEM_1_DEMO_CTA = 'Pick an option, run a few batches, then read where the line settles.'

/** Problem 2 — tap a tile to select it, then tap a slot to drop it in. */
export const PROBLEM_2_DEMO: DemoStepConfig[] = [
  {
    id: 'p2-place',
    title: 'Tap to place',
    body: 'Tap a tile to pick it up, then tap an empty slot to drop it in. The tile snaps into place.',
    media: tapToPlaceVisual,
  },
  {
    id: 'p2-swap',
    title: 'Swap any time',
    body: 'Tap a filled slot to clear it, or pick a different tile to replace what is there. Nothing is locked until you submit.',
  },
]
export const PROBLEM_2_DEMO_CTA = 'Tap a tile, then tap a slot to drop it in.'

/** Problem 3 — tap hidden tiles to reveal them, then type into a table. */
export const PROBLEM_3_DEMO: DemoStepConfig[] = [
  {
    id: 'p3-reveal',
    title: 'Tap to reveal',
    body: 'Tap a face-down tile to flip it open. Keep tapping until every tile is revealed.',
    media: tapToRevealVisual,
  },
  {
    id: 'p3-table',
    title: 'Type into the table',
    body: 'Tap a cell and type your value. After you submit, any cell that still needs a fix is highlighted so you can correct it in place.',
  },
]
export const PROBLEM_3_DEMO_CTA = 'Reveal every tile, then fill in the table.'

/** Problem 5 — tap a block onto the balance and read which way it tips. */
export const PROBLEM_5_DEMO: DemoStepConfig[] = [
  {
    id: 'p5-drop',
    title: 'Drop a block on the scale',
    body: 'Tap the block to place it on the beam. The beam tips toward the heavier side so you can compare two amounts at a glance.',
    media: balanceTapVisual,
  },
]
export const PROBLEM_5_DEMO_CTA = 'Tap the block onto the scale, then read which way it tips.'
