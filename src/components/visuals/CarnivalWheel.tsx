const SECTIONS = [
  { index: 0, value: 30 },
  { index: 1, value: 10 },
  { index: 2, value: 10 },
  ...Array.from({ length: 7 }, (_, i) => ({ index: i + 3, value: 0 })),
]

interface CarnivalWheelProps {
  selectedValue: number | null
  onSelectValue: (value: number) => void
}

export function CarnivalWheel({ selectedValue, onSelectValue }: CarnivalWheelProps) {
  return (
    <div className="wheel-sections" role="group" aria-label="Tap sections to group by payout">
      {SECTIONS.map((s) => (
        <button
          key={s.index}
          type="button"
          className={`wheel-section wheel-v${s.value} touch-target${selectedValue === s.value ? ' wheel-section-selected' : ''}`}
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

export { SECTIONS }
