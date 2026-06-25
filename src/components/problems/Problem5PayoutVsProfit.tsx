import { useCallback } from 'react'
import './Problem5PayoutVsProfit.css'
import './l4-workspace.css'
import { PayoutTray } from '../visuals/PayoutTray'
import { ProfitMeter } from '../visuals/ProfitMeter'
import { ProblemLayout } from '../lesson/ProblemLayout'
import type { WorkspaceStepDef } from '../../features/learning-experience'
import { QuestionPrompt } from '../../features/learning-experience'
import { useProblemSession } from '../../hooks/useProblemSession'
import { usePersistedProblemState } from '../../hooks/usePersistedProblemState'
import { PROBLEM_5 } from '../../data/problems/problem-5'
import { PROBLEM_5_DEMO, PROBLEM_5_DEMO_CTA } from '../lesson/problemDemos'
import { checkEvL4P1 } from './Problem5PayoutVsProfit.checker'
import {
  DEFAULT_PAYOUT_PLAYGROUND,
  Problem5PayoutPlayground,
  type PayoutPlaygroundConfig,
} from './Problem5PayoutPlayground'

const EXPECTED_PAYOUT = 4
const COST = 3

interface P5State {
  playPhaseComplete: boolean
  playgroundConfig: PayoutPlaygroundConfig
  costSelected: boolean
  costPlaced: boolean
  profitAnswer: string
}

const DEFAULT: P5State = {
  playPhaseComplete: false,
  playgroundConfig: DEFAULT_PAYOUT_PLAYGROUND,
  costSelected: false,
  costPlaced: false,
  profitAnswer: '',
}

function hasOfficialProgress(state: P5State): boolean {
  return state.costPlaced || state.profitAnswer.trim() !== ''
}

export function Problem5PayoutVsProfit() {
  const { state, setState, loaded, reset } = usePersistedProblemState<P5State>('problem-5', DEFAULT)
  const session = useProblemSession(PROBLEM_5, state)

  const inOfficialPhase = state.playPhaseComplete || hasOfficialProgress(state)

  const handlePlaygroundConfigChange = useCallback(
    (next: PayoutPlaygroundConfig) => {
      setState((prev) => ({ ...prev, playgroundConfig: next }))
    },
    [setState],
  )

  const beginOfficialProblem = useCallback(() => {
    setState((prev) => ({
      ...prev,
      playPhaseComplete: true,
      playgroundConfig: DEFAULT_PAYOUT_PLAYGROUND,
    }))
  }, [setState])

  const placeCost = useCallback(() => {
    setState((p) => ({ ...p, costPlaced: true, costSelected: false }))
  }, [setState])

  if (!loaded || !session.sessionLoaded) return <div className="loading-screen"><div className="spinner" /><p>Loading…</p></div>

  const profitValue = state.costPlaced ? EXPECTED_PAYOUT - COST : EXPECTED_PAYOUT
  const profitLocked = Boolean(session.feedback?.canComplete)

  const playgroundStep: WorkspaceStepDef = {
    id: 'playground',
    prompt: <QuestionPrompt>Use +1 on each side to change the weights, watch the beam tip, then continue when ready.</QuestionPrompt>,
    content: (
      <Problem5PayoutPlayground
        config={state.playgroundConfig}
        onConfigChange={handlePlaygroundConfigChange}
        onContinue={beginOfficialProblem}
      />
    ),
  }

  const payToPlayStep: WorkspaceStepDef = {
    id: 'pay-to-play',
    title: 'Pay to play',
    prompt: <QuestionPrompt>Drag the $3 cost token into the cost slot (or tap it, then tap the slot).</QuestionPrompt>,
    canAdvance: state.costPlaced,
    advanceHint: 'Place the $3 cost token in the slot to continue.',
    content: (
      <>
        <p className="section-note">The mystery-box game returns <strong>$4</strong> on average, but it costs <strong>$3</strong> to enter. Place the cost, then read how much profit remains.</p>
        <div className="ws-visual">
          <div className="pay-to-play">
            <PayoutTray payout={EXPECTED_PAYOUT} />
            <div className="pay-to-play-cost">
              <span className="pay-to-play-cost-title">Cost slot</span>
              <div
                className={`cost-slot touch-target${state.costSelected ? ' cost-slot-ready' : ''}${state.costPlaced ? ' cost-slot-filled' : ''}`}
                onDragOver={(e) => { if (!state.costPlaced) e.preventDefault() }}
                onDrop={(e) => { e.preventDefault(); if (!state.costPlaced) placeCost() }}
                onClick={() => { if (!state.costPlaced && state.costSelected) placeCost() }}
                role="button"
                tabIndex={0}
                aria-label="Cost slot. Place the $3 cost token here."
                onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !state.costPlaced && state.costSelected) { e.preventDefault(); placeCost() } }}
              >
                {state.costPlaced ? <span className="cost-token cost-token-placed">−$3</span> : <span className="cost-slot-hint">drop $3 here</span>}
              </div>
              {!state.costPlaced && (
                <button
                  type="button"
                  className={`cost-token cost-token-draggable touch-target${state.costSelected ? ' cost-token-selected' : ''}`}
                  draggable
                  onDragStart={() => setState((p) => ({ ...p, costSelected: true }))}
                  onClick={() => setState((p) => ({ ...p, costSelected: !p.costSelected }))}
                  aria-pressed={state.costSelected}
                  aria-label="Cost token, three dollars. Tap to pick up, then tap the cost slot."
                >
                  −$3 cost
                </button>
              )}
            </div>
            <ProfitMeter value={profitValue} max={EXPECTED_PAYOUT} locked={profitLocked} />
          </div>
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {state.costPlaced
            ? 'Expected payout four dollars. Cost three dollars. Continue to enter the expected profit.'
            : 'Expected payout four dollars. Place the three dollar cost token to see the profit.'}
        </p>
      </>
    ),
  }

  const profitStep: WorkspaceStepDef = {
    id: 'profit',
    title: 'Expected profit',
    prompt: <QuestionPrompt>Now enter the expected profit: expected payout − cost.</QuestionPrompt>,
    content: (
      <>
        <label className="field-label">Expected profit — your answer here
          <input className="touch-input" value={state.profitAnswer} inputMode="decimal" onChange={(e) => setState((p) => ({ ...p, profitAnswer: e.target.value }))} disabled={!state.costPlaced} placeholder={state.costPlaced ? 'Type the expected profit' : 'Place the cost first'} />
        </label>
        <button type="button" className="btn-secondary touch-target" disabled={!state.costPlaced || session.submitting}
          onClick={() => void session.handleCheck(checkEvL4P1({ costPlaced: state.costPlaced, profitAnswer: state.profitAnswer }), 'final', state.profitAnswer, state.profitAnswer)}>Submit answer</button>
      </>
    ),
  }

  const steps: WorkspaceStepDef[] = inOfficialPhase
    ? [payToPlayStep, profitStep]
    : [playgroundStep]

  return (
    <ProblemLayout problem={PROBLEM_5} problemNumber={9} feedback={session.feedback} completed={session.completed}
      revealedHintIds={session.revealedHintIds} onRevealHint={session.revealHint} nextProblemId="problem-6"
      restarted={session.restarted} onRestart={() => { reset(); session.restart() }} onReview={session.backToReview}
      attemptCount={session.finalAttemptCount} lastSubmittedAnswer={session.lastSubmittedAnswer} reviewHintUsed={session.reviewHintUsed}
      demoSteps={PROBLEM_5_DEMO} demoFinalCta={PROBLEM_5_DEMO_CTA}
      steps={steps} />
  )
}
