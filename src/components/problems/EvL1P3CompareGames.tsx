import './agent3.css'
import './l1-workspace.css'
import { useState } from 'react'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { useProblemSession } from '../../hooks/useProblemSession'
import { usePersistedProblemState } from '../../hooks/usePersistedProblemState'
import type { WorkspaceStepDef } from '../../features/learning-experience'
import { QuestionPrompt } from '../../features/learning-experience'
import type { CheckResult } from '../../types/problem'
import {
  PROBLEM_EV_L1_P3,
  checkEvL1P3,
  type EvL1P3Game,
  type EvL1P3Reason,
} from '../../data/problems/ev-l1-p3'

const GAMES: Array<{
  id: EvL1P3Game
  name: string
  prize: string
  odds: string
  winPercent: number
  contribution: string
  className: string
}> = [
  { id: 'a', name: 'Game A', prize: '$10 prize', odds: '50% chance of $10 · 50% chance of $0', winPercent: 50, contribution: '$5', className: 'l1-game-card-a' },
  { id: 'b', name: 'Game B', prize: '$25 prize', odds: '20% chance of $25 · 80% chance of $0', winPercent: 20, contribution: '$5', className: 'l1-game-card-b' },
  { id: 'c', name: 'Game C', prize: '$6 prize', odds: '80% chance of $6 · 20% chance of $0', winPercent: 80, contribution: '$4.80', className: 'l1-game-card-c' },
]

const REASONS: Array<{ id: EvL1P3Reason; label: string }> = [
  { id: 'same-average', label: 'Game A and Game B are tied because both average $5 over many plays.' },
  { id: 'biggest-prize', label: 'Game B is best because it has the biggest prize.' },
  { id: 'highest-win-rate', label: 'Game C is best because it wins most often.' },
  { id: 'payouts-only', label: 'Compare the payouts first; the probabilities do not change the ranking.' },
  { id: 'guaranteed-result', label: 'Expected value means you are guaranteed about $5 each play.' },
]

interface State {
  selectedGames: EvL1P3Game[]
  reason: EvL1P3Reason | null
  reveal: boolean
}

const DEFAULT: State = {
  selectedGames: [],
  reason: null,
  reveal: false,
}

/** Per-step badge state. `undefined` = not yet checked (or cleared on edit). */
type StepStatus = 'correct' | 'incorrect' | undefined

// Map a CheckResult to a badge status: 'correct' when right, 'incorrect' on a
// real mistake, undefined for guard results (not yet answerable).
function statusFromResult(result: CheckResult): StepStatus {
  if (result.isCorrect) return 'correct'
  if (result.mistakeType === '') return undefined
  return 'incorrect'
}

export function EvL1P3CompareGames() {
  const { state, setState, loaded, reset } = usePersistedProblemState<State>('ev-l1-p3', DEFAULT)
  const session = useProblemSession(PROBLEM_EV_L1_P3, state)
  const [answerStatus, setAnswerStatus] = useState<StepStatus>(undefined)

  if (!loaded || !session.sessionLoaded) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading problem…</p>
      </div>
    )
  }

  const selectedGames = Array.isArray(state.selectedGames) ? state.selectedGames : []
  const selectedSet = new Set(selectedGames)
  const reveal = state.reveal || session.completed

  const toggleGame = (game: EvL1P3Game) => {
    setState((prev) => {
      const prevGames = Array.isArray(prev.selectedGames) ? prev.selectedGames : []
      const nextGames = prevGames.includes(game) ? prevGames.filter((id) => id !== game) : [...prevGames, game]
      return { ...prev, selectedGames: nextGames }
    })
    setAnswerStatus(undefined)
  }

  const steps: WorkspaceStepDef[] = [
    {
      id: 'fluency-check',
      title: 'Pick the best long-run average',
      prompt: (
        <>
          <QuestionPrompt>Which game has the highest long-run average?</QuestionPrompt>
          <p>Select every game that ties for the highest expected value, then choose the reason.</p>
        </>
      ),
      status: answerStatus,
      content: (
        <div className="l1-fluency-check">
          <div className="l1-compare-callout">
            <span>Key idea</span>
            <strong>Compare games by long-run average, not by biggest prize or win rate.</strong>
          </div>

          <div className="compare-cards l1-compare l1-fluency-cards" aria-label="Game options">
            {GAMES.map((game) => {
              const selected = selectedSet.has(game.id)
              return (
                <button
                  key={game.id}
                  type="button"
                  className={`compare-card l1-game-card ${game.className} l1-fluency-card touch-target${selected ? ' l1-fluency-card-selected' : ''}`}
                  aria-pressed={selected}
                  onClick={() => toggleGame(game.id)}
                >
                  <span className="l1-game-header">
                    <h3>{game.name}</h3>
                    <strong>{game.prize}</strong>
                  </span>
                  <span className="compare-odds">{game.odds}</span>
                  <span className="l1-chance-bar" aria-label={`${game.winPercent}% chance to win`}>
                    <span className="l1-chance-win" style={{ width: `${game.winPercent}%` }}>
                      <span className="l1-chance-label-full">{game.winPercent}% win</span>
                      <span className="l1-chance-label-short">{game.winPercent}%</span>
                    </span>
                    <span className="l1-chance-lose">
                      <span className="l1-chance-label-full">{100 - game.winPercent}% $0</span>
                      <span className="l1-chance-label-short">{100 - game.winPercent}%</span>
                    </span>
                  </span>
                  {reveal && (
                    <span className="l1-reveal-row">
                      <span className="l1-contribution-chip">{game.name.at(-1)}: {game.contribution}</span>
                    </span>
                  )}
                  <span className="l1-card-select-state">{selected ? 'Selected' : 'Tap to select'}</span>
                </button>
              )
            })}
          </div>
          {reveal && <div className="l1-shared-highest-badge">Game A + Game B: Highest EV</div>}

          <div className="l1-reason-panel">
            <h3>Choose the best reason</h3>
            <div className="choice-column ws-options l1-reason-options">
              {REASONS.map((reason) => (
                <button
                  key={reason.id}
                  type="button"
                  className={`choice-btn ws-option touch-target${state.reason === reason.id ? ' choice-btn-selected' : ''}`}
                  aria-pressed={state.reason === reason.id}
                  onClick={() => {
                    setState((p) => ({ ...p, reason: reason.id }))
                    setAnswerStatus(undefined)
                  }}
                >
                  {reason.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="btn-secondary touch-target ws-step-check"
            disabled={session.submitting}
            onClick={() => {
              const result = checkEvL1P3({ selectedGames, reason: state.reason })
              setAnswerStatus(statusFromResult(result))
              setState((p) => ({ ...p, reveal: true }))
              void session.handleCheck(
                result,
                'final',
                `selectedGames=${selectedGames.join(',')};reason=${state.reason ?? ''}`,
                selectedGames.join(','),
              )
            }}
          >
            {session.submitting ? 'Saving…' : 'Check answer'}
          </button>
        </div>
      ),
    },
  ]

  return (
    <ProblemLayout
      problem={PROBLEM_EV_L1_P3}
      problemNumber={3}
      feedback={session.feedback}
      completed={session.completed}
      revealedHintIds={session.revealedHintIds}
      onRevealHint={session.revealHint}
      nextProblemId="problem-2"
      restarted={session.restarted}
      onRestart={() => {
        reset()
        setAnswerStatus(undefined)
        session.restart()
      }}
      onReview={session.backToReview}
      attemptCount={session.finalAttemptCount}
      lastSubmittedAnswer={session.lastSubmittedAnswer}
      reviewHintUsed={session.reviewHintUsed}
      completionMessage="You found the tie: Game A and Game B both average $5 per play, while Game C averages $4.80."
      steps={steps}
      onStepChange={session.clearFeedback}
    />
  )
}
