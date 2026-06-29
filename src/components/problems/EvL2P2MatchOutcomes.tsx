import './agent3.css'
import { PokerChipLoader } from '../PokerChipLoader'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { useProblemSession } from '../../hooks/useProblemSession'
import { usePersistedProblemState } from '../../hooks/usePersistedProblemState'
import type { DemoStepConfig, WorkspaceStepDef } from '../../features/learning-experience'
import { PROBLEM_EV_L2_P2, checkEvL2P2, type EvL2P2Outcome } from '../../data/problems/ev-l2-p2'

const OUTCOMES: Array<{ id: EvL2P2Outcome; label: string }> = [
  { id: '12', label: '$12' },
  { id: '3', label: '$3' },
  { id: '0', label: '$0' },
]
const PROB_CARDS = ['1/3', '1/2', '1/6']

const DEMO: DemoStepConfig[] = [
  { id: 'evl2p2-select', title: 'Tap to select', body: 'Tap a probability card to pick it up, then tap an outcome row to drop it in.' },
  { id: 'evl2p2-replace', title: 'Tap to replace', body: 'Tap a filled row to clear it and send the card back. Nothing is locked until you check.' },
  { id: 'evl2p2-read', title: 'Read the data', body: 'The biggest payout does not automatically get the biggest probability — match each outcome to its own chance.' },
]
const DEMO_CTA = 'Tap a probability, then tap the outcome it belongs to.'

interface State {
  assignments: Record<EvL2P2Outcome, string>
  selectedProb: string | null
}

const DEFAULT: State = { assignments: { '12': '', '3': '', '0': '' }, selectedProb: null }

export function EvL2P2MatchOutcomes() {
  const { state, setState, loaded, reset } = usePersistedProblemState<State>('ev-l2-p2', DEFAULT)
  const session = useProblemSession(PROBLEM_EV_L2_P2, state)

  if (!loaded || !session.sessionLoaded) {
    return <PokerChipLoader label="Loading problem…" />
  }

  const usedProbs = new Set(Object.values(state.assignments).filter(Boolean))
  const matchedCount = Object.values(state.assignments).filter(Boolean).length

  const placeInOutcome = (outcome: EvL2P2Outcome) => {
    setState((p) => {
      if (p.selectedProb) {
        return { ...p, assignments: { ...p.assignments, [outcome]: p.selectedProb! }, selectedProb: null }
      }
      // No card selected: tapping a filled row clears it.
      if (p.assignments[outcome]) {
        return { ...p, assignments: { ...p.assignments, [outcome]: '' } }
      }
      return p
    })
  }

  const steps: WorkspaceStepDef[] = [
    {
      id: 'match',
      prompt: PROBLEM_EV_L2_P2.scenarioText,
      action: (
        <button
          type="button"
          className="btn-secondary touch-target"
          disabled={session.submitting}
          onClick={() =>
            void session.handleCheck(
              checkEvL2P2({ assignments: state.assignments }),
              'final',
              `12=${state.assignments['12']};3=${state.assignments['3']};0=${state.assignments['0']}`,
              matchedCount === 3 ? 'matched' : 'incomplete',
            )
          }
        >
          {session.submitting ? 'Saving…' : 'Check answer'}
        </button>
      ),
      content: (
        <>
          <div className="match-grid">
            {OUTCOMES.map((o) => (
              <div className="match-row" key={o.id}>
                <span className="match-outcome">{o.label}</span>
                <span className="match-link" aria-hidden="true">↔</span>
                <button
                  type="button"
                  className={`match-slot touch-target${state.assignments[o.id] ? ' match-slot-filled' : ''}${state.selectedProb ? ' match-slot-ready' : ''}`}
                  onClick={() => placeInOutcome(o.id)}
                  aria-label={
                    state.assignments[o.id]
                      ? `${o.label} matched with ${state.assignments[o.id]}. Tap to clear.`
                      : `Empty probability slot for ${o.label}.`
                  }
                >
                  {state.assignments[o.id] || '___'}
                </button>
                {state.assignments[o.id] && (
                  <button
                    type="button"
                    className="match-clear touch-target"
                    onClick={() => setState((p) => ({ ...p, assignments: { ...p.assignments, [o.id]: '' } }))}
                    aria-label={`Clear the match for ${o.label}`}
                  >
                    Clear
                  </button>
                )}
              </div>
            ))}
          </div>

          <p className="section-note tap-hint">
            {state.selectedProb ? `Now tap an outcome to place ${state.selectedProb}.` : 'Tap a probability card first, then tap an outcome.'}
          </p>
          <div className="match-bank">
            {PROB_CARDS.map((card) => (
              <button
                key={card}
                type="button"
                className={`choice-btn touch-target${state.selectedProb === card ? ' choice-btn-selected' : ''}${usedProbs.has(card) ? ' choice-btn-used' : ''}`}
                onClick={() => setState((p) => ({ ...p, selectedProb: p.selectedProb === card ? null : card }))}
                disabled={usedProbs.has(card)}
              >
                {card}
              </button>
            ))}
          </div>

        </>
      ),
    },
  ]

  return (
    <ProblemLayout
      problem={PROBLEM_EV_L2_P2}
      problemNumber={5}
      workspaceMinimalHeader
      feedback={session.feedback}
      completed={session.completed}
      justCompleted={session.justCompleted}
      streakResult={session.streakResult}
      revealedHintIds={session.revealedHintIds}
      onRevealHint={session.revealHint}
      nextProblemId="ev-l2-p3"
      restarted={session.restarted}
      onRestart={() => {
        reset()
        session.restart()
      }}
      onReview={session.backToReview}
      attemptCount={session.finalAttemptCount}
      lastSubmittedAnswer={session.lastSubmittedAnswer}
      reviewHintUsed={session.reviewHintUsed}
      demoSteps={DEMO}
      demoFinalCta={DEMO_CTA}
      completionMessage="You matched $12 ↔ 1/3, $3 ↔ 1/2, and $0 ↔ 1/6 from the game data."
      steps={steps}
      onStepChange={session.clearFeedback}
    />
  )
}
