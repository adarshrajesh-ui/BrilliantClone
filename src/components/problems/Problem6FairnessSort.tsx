import './l4-workspace.css'
import { FairnessNumberLine } from '../visuals/FairnessNumberLine'
import { PokerChipLoader } from '../PokerChipLoader'
import { ProblemLayout } from '../lesson/ProblemLayout'
import type { WorkspaceStepDef } from '../../features/learning-experience'
import { useProblemSession } from '../../hooks/useProblemSession'
import { usePersistedProblemState } from '../../hooks/usePersistedProblemState'
import { PROBLEM_6 } from '../../data/problems/problem-6'
import { checkProblem6 } from '../../lib/answerChecker'

const GAMES = [
  { id: 'A', payout: 5, cost: 5, profit: 0 },
  { id: 'B', payout: 7, cost: 5, profit: 2 },
  { id: 'C', payout: 3, cost: 5, profit: -2 },
]

interface P6State { selectedGame: string | null; assignments: Record<string, string> }
const DEFAULT: P6State = { selectedGame: null, assignments: {} }

export function Problem6FairnessSort() {
  const { state, setState, loaded, reset } = usePersistedProblemState<P6State>('problem-6', DEFAULT)
  const session = useProblemSession(PROBLEM_6, state)

  if (!loaded || !session.sessionLoaded) return <PokerChipLoader label="Loading…" />

  const placedCount = GAMES.filter((g) => state.assignments[g.id]).length

  // The profit meter is hidden until a card is placed (PRD: "Hidden profit
  // meter" that "appears after placement"), so sorting is not trivialized.
  const selectedGameObj = GAMES.find((g) => g.id === state.selectedGame)
  const numberLineProfit =
    selectedGameObj && state.assignments[selectedGameObj.id] ? selectedGameObj.profit : null

  const clearPlacements = () => setState({ selectedGame: null, assignments: {} })

  const steps: WorkspaceStepDef[] = [
    {
      id: 'sort',
      title: 'Sort the games',
      prompt: PROBLEM_6.scenarioText,
      action: (
        <button type="button" className="btn-secondary touch-target" disabled={session.submitting || placedCount < 3}
          onClick={() => void session.handleCheck(checkProblem6({ assignments: state.assignments }), 'final', JSON.stringify(state.assignments), JSON.stringify(state.assignments))}>
          {session.submitting ? 'Saving…' : 'Submit answer'}
        </button>
      ),
      content: (
        <div className="l4-sort-step ws-compact">
          <p className="section-note tap-hint">Tap a game to pick it up, then tap a bucket. Tap a placed game again to move it.</p>
          <div className="game-cards">
            {GAMES.map((g) => {
              const placed = Boolean(state.assignments[g.id])
              return (
                <button key={g.id} type="button" className={`game-card touch-target${state.selectedGame === g.id ? ' game-card-selected' : ''}${placed ? ' game-card-placed' : ''}`}
                  aria-pressed={state.selectedGame === g.id}
                  onClick={() => setState((p) => ({ ...p, selectedGame: p.selectedGame === g.id ? null : g.id }))}>
                  <strong>Game {g.id}</strong>
                  <div className="bar-row"><span>Payout</span><div className="bar bar-payout" style={{ width: `${g.payout * 10}px` }}>${g.payout}</div></div>
                  <div className="bar-row"><span>Cost</span><div className="bar bar-cost" style={{ width: `${g.cost * 10}px` }}>${g.cost}</div></div>
                  {placed
                    ? <p className="profit-meter">Profit: {g.profit >= 0 ? '+' : ''}${g.profit}</p>
                    : <p className="profit-meter profit-meter-hidden">Profit: hidden until placed</p>}
                  {placed && <span className="placed-tag">{state.assignments[g.id].charAt(0).toUpperCase() + state.assignments[g.id].slice(1)}</span>}
                </button>
              )
            })}
          </div>
          <div className="ws-visual l4-numberline">
            <FairnessNumberLine value={numberLineProfit} highlightZero />
          </div>
          <div className="bucket-row">
            {(['favorable', 'fair', 'unfavorable'] as const).map((b) => (
              <button key={b} type="button" className={`bucket bucket-${b} touch-target${state.selectedGame ? ' bucket-ready' : ''}`}
                disabled={!state.selectedGame}
                onClick={() => {
                  if (!state.selectedGame) return
                  setState((p) => ({ ...p, assignments: { ...p.assignments, [p.selectedGame!]: b }, selectedGame: null }))
                }}>
                {b.charAt(0).toUpperCase() + b.slice(1)}
                <div className="bucket-contents">{GAMES.filter((g) => state.assignments[g.id] === b).map((g) => g.id).join(', ')}</div>
              </button>
            ))}
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {state.selectedGame
              ? `Game ${state.selectedGame} selected. Tap a bucket to place it.`
              : `${placedCount} of 3 games placed.`}
          </p>
          <div className="placeholder-actions">
            {placedCount > 0 && (
              <button type="button" className="btn-text touch-target" onClick={clearPlacements}>Clear placements</button>
            )}
          </div>
        </div>
      ),
    },
  ]

  return (
    <ProblemLayout problem={PROBLEM_6} problemNumber={10} workspaceMinimalHeader feedback={session.feedback} completed={session.completed} justCompleted={session.justCompleted} streakResult={session.streakResult}
      revealedHintIds={session.revealedHintIds} onRevealHint={session.revealHint} nextProblemId="ev-l4-p3"
      restarted={session.restarted} onRestart={() => { reset(); session.restart() }} onReview={session.backToReview}
      attemptCount={session.finalAttemptCount} lastSubmittedAnswer={session.lastSubmittedAnswer} reviewHintUsed={session.reviewHintUsed}
      completionMessage="You sorted the games by expected profit: favorable beats fair, and fair beats unfavorable."
      steps={steps} onStepChange={session.clearFeedback} />
  )
}
