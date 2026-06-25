const DEFAULT_SECTIONS = [
  { index: 0, value: 30 },
  { index: 1, value: 10 },
  { index: 2, value: 10 },
  ...Array.from({ length: 7 }, (_, i) => ({ index: i + 3, value: 0 })),
]

export interface WheelSection {
  index: number
  value: number
}

interface CarnivalWheelProps {
  selectedValue: number | null
  onSelectValue: (value: number) => void
  /** Section payout values in wheel order. Defaults to the legacy 10-section wheel. */
  sections?: WheelSection[]
}

/**
 * Tap-to-group carnival wheel. Tapping any section highlights every section that
 * shares its payout, so the learner can group equal sections by value. The
 * section set is configurable: the capstone (ev-l5-p3) passes a 12-section wheel.
 */
export function CarnivalWheel({ selectedValue, onSelectValue, sections = DEFAULT_SECTIONS }: CarnivalWheelProps) {
  return (
    <div className="wheel-sections" role="group" aria-label="Tap sections to group by payout">
      {sections.map((s) => (
        <button
          key={s.index}
          type="button"
          className={`wheel-section wheel-v${s.value} touch-target${selectedValue === s.value ? ' wheel-section-selected' : ''}`}
          data-payout={s.value}
          onClick={() => onSelectValue(s.value)}
          aria-label={`Section ${s.index + 1}: $${s.value}`}
        >
          ${s.value}
        </button>
      ))}
      <p className="section-note">Tap any section to highlight all sections with the same payout.</p>
    </div>
  )
}

/** Build an ordered section list from {value, count} groups. */
export function buildWheelSections(groups: Array<{ value: number; count: number }>): WheelSection[] {
  const sections: WheelSection[] = []
  let index = 0
  for (const group of groups) {
    for (let i = 0; i < group.count; i += 1) {
      sections.push({ index, value: group.value })
      index += 1
    }
  }
  return sections
}

export { DEFAULT_SECTIONS as SECTIONS }
