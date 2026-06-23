import type { ProblemHint } from '../../types/problem'

interface HintPanelProps {
  hints: ProblemHint[]
  revealedHintIds: string[]
  onRevealHint: (hintId: string) => void
}

export function HintPanel({ hints, revealedHintIds, onRevealHint }: HintPanelProps) {
  const nextHint = hints.find((h) => !revealedHintIds.includes(h.id))

  return (
    <section className="card hint-panel">
      <h2>Hints</h2>
      {revealedHintIds.length === 0 && !nextHint && (
        <p className="section-note">No hints for this problem.</p>
      )}
      {nextHint && (
        <button type="button" className="btn-hint" onClick={() => onRevealHint(nextHint.id)}>
          Show hint: {nextHint.label}
        </button>
      )}
      <ul className="hint-list">
        {hints
          .filter((h) => revealedHintIds.includes(h.id))
          .map((hint) => (
            <li key={hint.id} className="hint-item">
              <strong>{hint.label}</strong>
              <p>{hint.content}</p>
            </li>
          ))}
      </ul>
    </section>
  )
}
