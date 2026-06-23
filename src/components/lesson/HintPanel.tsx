import type { ProblemHint } from '../../types/problem'

interface HintPanelProps {
  hints: ProblemHint[]
  revealedHintIds: string[]
  onRevealHint: (hintId: string) => void
  visualCue?: string
}

export function HintPanel({ hints, revealedHintIds, onRevealHint, visualCue }: HintPanelProps) {
  const nextHint = hints.find((h) => !revealedHintIds.includes(h.id))
  const nextLevel = revealedHintIds.length + 1

  return (
    <section className="card hint-panel">
      <div className="hint-header">
        <h2>💡 Hints</h2>
        {hints.length > 0 && (
          <span className="hint-progress">
            {revealedHintIds.length} of {hints.length} shown
          </span>
        )}
      </div>

      {revealedHintIds.length === 0 && !nextHint && (
        <p className="section-note">No hints for this problem.</p>
      )}

      {revealedHintIds.length === 0 && nextHint && visualCue && (
        <p className="hint-cue">Stuck? Look at {visualCue} as you read the hints.</p>
      )}

      <ul className="hint-list">
        {hints
          .filter((h) => revealedHintIds.includes(h.id))
          .map((hint, i) => (
            <li key={hint.id} className="hint-item">
              <span className="hint-level-chip">Hint {i + 1}</span>
              <div>
                <strong>{hint.label}</strong>
                <p>{hint.content}</p>
              </div>
            </li>
          ))}
      </ul>

      {nextHint && (
        <button type="button" className="btn-hint" onClick={() => onRevealHint(nextHint.id)}>
          {revealedHintIds.length === 0 ? 'Need a hint?' : 'Show another hint'} (Hint {nextLevel}: {nextHint.label})
        </button>
      )}
    </section>
  )
}
