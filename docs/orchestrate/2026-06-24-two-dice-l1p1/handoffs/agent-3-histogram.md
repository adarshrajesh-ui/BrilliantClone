# Handoff: agent-3-histogram (T-003)

## Status: COMPLETE

## Files created (within scope only)
- `src/components/visuals/SumHistogram.tsx`
- `src/components/visuals/SumHistogram.css`

No other files were edited.

## Contract conformance (interfaces.md section 3)
Implemented exactly as specified:
```ts
export interface SumHistogramProps {
  counts: number[]   // length 11; counts[i] = frequency of sum (i + 2), sums 2..12
  label?: string     // default 'Distribution of sums'
}
export function SumHistogram(props: SumHistogramProps): JSX.Element
```
- Named export `SumHistogram` and named export `SumHistogramProps` — matches contract, no renames.
- `label` defaults to `'Distribution of sums'`.
- CSS imported via `import './SumHistogram.css'`.

## Behavior
- **11 vertical bars** for sums 2..12, x-axis tick labels 2,3,…,12.
- **Normalization**: bar height ∝ `count / maxCount` of the current data. `maxCount === 0` is the empty state (handled safely; no divide-by-zero).
- **Defensive input**: non-finite or negative entries are coerced to 0, and the array is mapped over a fixed `SUMS` length of 11, so a short/oversized `counts` array won't crash.
- **7-highlight**: the bar for sum 7 uses the accent class `sh-bar-peak` (solid blue `#2563eb`) vs. light blue `#93c5fd` for the others; its tick label uses `sh-tick-peak` (bold amber). A subtle dashed amber vertical marker line (`sh-peak-marker`) is drawn at the 7 position to make the bell center obvious. Marker is only shown when data exists.
- **Empty state** (all counts 0): renders y-axis + baseline and the centered message "Roll the dice to build the distribution." (no bars, no marker).

## SVG / responsiveness / a11y
- `viewBox="0 0 320 160"` (same scale as RunningAverageGraph), `width: 100%; height: auto`.
- `max-height: 22vh` via CSS so it fits the no-scroll workspace.
- `role="img"` with a dynamic `aria-label`:
  - populated: `"Histogram of two-dice sums from 2 to 12 over N rolls, peaking at 7."`
  - empty: `"Empty histogram of two-dice sums from 2 to 12; no rolls yet."`

## Class names (all `sh-`-prefixed, no global/shell overrides)
- `sh-wrap` — outer container
- `sh-caption` — label/caption text
- `sh-svg` — the SVG element (background, border, max-height)
- `sh-axis` — y-axis + baseline lines
- `sh-bar` / `sh-bar-peak` — non-peak / peak (sum 7) bars
- `sh-peak-marker` — dashed amber marker line at 7
- `sh-tick` / `sh-tick-peak` — x-axis number labels (peak = bold amber)
- `sh-empty-text` — empty-state message

## Palette
Consistent with RunningAverageGraph / app tokens: `#93c5fd` and `#2563eb` (blues), `#f59e0b`/`#b45309` (amber accent), `#d1d5db` axis, `#fafafa` background, `var(--border)` for the border.

## Verification
- TSX is valid React 19 JSX (function component, named exports).
- Isolated `tsc` run only reported the tsconfig-vs-CLI-flag conflict (TS5112), not a code error. CSS imports are resolved by Vite, consistent with other repo components that `import './X.css'`.

## Blockers
None. Component is purely presentational, no AI, no external deps. Ready for the integration agent to feed `counts` (length 11) from the two-dice simulation state.
