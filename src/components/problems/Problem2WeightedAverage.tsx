import { useEffect, useState } from 'react'
import './l2-claw-workspace.css'
import { FormulaBuilder } from '../visuals/FormulaBuilder'
import { ClawMachine, type ClawGrab, type ClawZone } from '../visuals/ClawMachine'
import { ClawContributionBlocks, type ClawContributionRow } from '../visuals/ClawContributionBlocks'
import { PokerChipLoader } from '../PokerChipLoader'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { useProblemSession } from '../../hooks/useProblemSession'
import { usePersistedProblemState } from '../../hooks/usePersistedProblemState'
import { usePrefersReducedMotion } from '../../features/learning-experience'
import type { DemoStepConfig, WorkspaceStepDef } from '../../features/learning-experience'
import { PROBLEM_2, checkProblem2PrizeBoard, REQUIRED_GRABS } from '../../data/problems/problem-2'

const CARDS = ['$20', '$0', '25%', '75%']
const BULK_GRAB_UNLOCK_COUNT = 2
const BULK_GRAB_COUNT = 6

/** The 4 floor zones, fixed left→right. One $20 prize zone (index 1) + three $0 zones. */
const ZONES: ClawZone[] = [
  { id: 'zone-0', label: '$0', value: 0, isPrize: false },
  { id: 'zone-1', label: '$20', value: 20, isPrize: true },
  { id: 'zone-2', label: '$0', value: 0, isPrize: false },
  { id: 'zone-3', label: '$0', value: 0, isPrize: false },
]
const PRIZE_INDEX = ZONES.findIndex((z) => z.isPrize)
const ZERO_INDICES = ZONES.map((_, i) => i).filter((i) => !ZONES[i].isPrize)

const CONTRIB_ROWS: ClawContributionRow[] = [
  { payout: '$20', probability: '25%', product: '$5', weight: 0.25 },
  { payout: '$0', probability: '75%', product: '$0', weight: 0.75 },
]
const PRIZE_VALUE = 20

const DEMO: DemoStepConfig[] = [
  { id: 'p2-run', title: 'Run the claw', body: 'Tap “Drop claw” to plunge the claw into the pit. The small $20 zone is one quarter of the floor, so roughly 1 grab in 4 snags it — the rest land on an empty $0 zone.' },
  { id: 'p2-tray', title: 'Watch the tray fill', body: 'Each grab drops a token into the payout tray. A short run is noisy — you might snag $20 twice in a row or miss it eight times. The tray total is not the expected value.' },
  { id: 'p2-compress', title: 'Compress, then build the formula', body: 'After 8 grabs, compress the pit into contribution blocks: each outcome contributes payout × probability. Then pair the formula and submit the expected value of one grab.' },
]
const DEMO_CTA = 'Run 8 grabs, compress the pit, then pair $20 with 25% and $0 with 75% to find the expected value.'

interface P2State {
  grabs: ClawGrab[]
  activeGrab: ClawGrab | null
  viewedCompression: boolean
  slots: [string, string, string, string]
  selectedCard: string | null
  evAnswer: string
}

const DEFAULT: P2State = {
  grabs: [],
  activeGrab: null,
  viewedCompression: false,
  slots: ['', '', '', ''],
  selectedCard: null,
  evAnswer: '',
}

function createClawGrab(grabIndex: number): ClawGrab {
  const isPrize = Math.random() < 0.25
  const zoneIndex = isPrize ? PRIZE_INDEX : ZERO_INDICES[Math.floor(Math.random() * ZERO_INDICES.length)]
  return {
    id: `grab-${grabIndex}-${Date.now()}`,
    zoneIndex,
    value: isPrize ? PRIZE_VALUE : 0,
    isPrize,
  }
}

function formatMoney(value: number): string {
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`
}

function getGrabDoneMessage(grabs: ClawGrab[]): string {
  const prizeWins = grabs.filter((grab) => grab.isPrize).length
  const trayTotal = grabs.reduce((sum, grab) => sum + grab.value, 0)
  const winLabel = prizeWins === 1 ? '$20 win' : '$20 wins'

  return `${REQUIRED_GRABS} grabs done: ${prizeWins} ${winLabel}, tray total ${formatMoney(
    trayTotal,
  )}. Tap Next to compare this run with the pit.`
}

export function Problem2WeightedAverage() {
  const { state, setState, loaded, reset } = usePersistedProblemState<P2State>('problem-2', DEFAULT)
  const session = useProblemSession(PROBLEM_2, state)
  const reducedMotion = usePrefersReducedMotion()
  const [queuedBulkGrabs, setQueuedBulkGrabs] = useState(0)

  useEffect(() => {
    if (queuedBulkGrabs <= 0 || !loaded || !session.sessionLoaded || state.activeGrab !== null) return
    if (state.grabs.length >= REQUIRED_GRABS) {
      setQueuedBulkGrabs(0)
      return
    }

    setQueuedBulkGrabs((count) => Math.max(0, count - 1))
    setState((p) => {
      if (p.activeGrab !== null || p.grabs.length >= REQUIRED_GRABS) return p
      return { ...p, activeGrab: createClawGrab(p.grabs.length) }
    })
  }, [loaded, queuedBulkGrabs, session.sessionLoaded, setState, state.activeGrab, state.grabs.length])

  if (!loaded || !session.sessionLoaded) {
    return <PokerChipLoader label="Loading problem…" />
  }

  const grabsDone = state.grabs.length >= REQUIRED_GRABS
  const bulkRunQueued = queuedBulkGrabs > 0
  const dropDisabled = state.activeGrab !== null || grabsDone || bulkRunQueued
  const grabsComplete = grabsDone && state.viewedCompression
  const revealContributionValues = session.completed && !session.restarted
  const remainingGrabs = Math.max(0, REQUIRED_GRABS - state.grabs.length)
  const grabDoneMessage = grabsDone ? getGrabDoneMessage(state.grabs) : ''
  const showBulkRun =
    state.grabs.length === BULK_GRAB_UNLOCK_COUNT &&
    remainingGrabs >= BULK_GRAB_COUNT &&
    state.activeGrab === null &&
    !bulkRunQueued

  const dropClaw = () => {
    if (dropDisabled) return
    setState((p) => {
      if (p.activeGrab !== null || p.grabs.length >= REQUIRED_GRABS) return p
      return { ...p, activeGrab: createClawGrab(p.grabs.length) }
    })
  }

  const runNextSixGrabs = () => {
    if (!showBulkRun) return
    setQueuedBulkGrabs(BULK_GRAB_COUNT - 1)
    setState((p) => {
      if (p.activeGrab !== null || p.grabs.length >= REQUIRED_GRABS) return p
      return { ...p, activeGrab: createClawGrab(p.grabs.length) }
    })
  }

  const handleGrabEnd = () => {
    setState((p) => (p.activeGrab ? { ...p, grabs: [...p.grabs, p.activeGrab], activeGrab: null } : p))
  }

  const formulaPrompt =
    'Pair each payout with its probability — $20 with 25% and $0 with 75% — then compute the expected value of one grab.'

  const runStep: WorkspaceStepDef = {
    id: 'run',
    title: 'Run the claw',
    prompt: `Drop the claw ${REQUIRED_GRABS} times. How much money do you think the claw will pick up if the claw is random?`,
    canAdvance: grabsDone,
    advanceHint: `Run all ${REQUIRED_GRABS} claw drops to continue.`,
    content: (
      <div className="l2-claw-step">
        <div className="l2-claw-stage">
          <div className="ws-visual">
            <ClawMachine
              zones={ZONES}
              grabs={state.grabs}
              activeGrab={state.activeGrab}
              onGrabAnimationEnd={handleGrabEnd}
              reducedMotion={reducedMotion}
            />
          </div>
        </div>
        <div className="l2-claw-side">
          <div className="l2-claw-actions">
            <button
              type="button"
              className="btn-secondary touch-target l2-drop-btn"
              disabled={dropDisabled}
              onClick={dropClaw}
            >
              {state.activeGrab
                ? 'Claw working…'
                : bulkRunQueued
                  ? 'Running grabs…'
                  : grabsDone
                    ? 'All grabs used'
                    : 'Drop claw'}
            </button>
            {showBulkRun && (
              <button
                type="button"
                className="btn-secondary touch-target l2-run-six-btn"
                onClick={runNextSixGrabs}
              >
                Run next 6 grabs
              </button>
            )}
          </div>
          <div className="l2-grab-counter">
            <span className="l2-grab-counter-num">
              Grabs: {state.grabs.length} / {REQUIRED_GRABS}
            </span>
            <div className="l2-grabs" aria-hidden="true">
              {Array.from({ length: REQUIRED_GRABS }).map((_, i) => {
                const g = state.grabs[i]
                const cls = g ? (g.isPrize ? 'l2-dot l2-dot-gold' : 'l2-dot l2-dot-gray') : 'l2-dot'
                return <span key={i} className={cls} />
              })}
            </div>
          </div>
          {grabsDone && (
            <p className="section-note l2-grab-done">
              {grabDoneMessage}
            </p>
          )}
          <p className="sr-only" aria-live="polite">
            {`You have run ${state.grabs.length} of ${REQUIRED_GRABS} grabs.${
              bulkRunQueued
                ? ` Running the next ${queuedBulkGrabs + 1} grabs automatically.`
                : grabsDone
                  ? ' All grabs complete. Continue to the next step.'
                  : ''
            }`}
          </p>
        </div>
      </div>
    ),
  }

  const compressStep: WorkspaceStepDef = {
    id: 'compress',
    title: 'Compress & build the formula',
    prompt: state.viewedCompression ? formulaPrompt : 'Compress the pit.',
    action: state.viewedCompression ? (
      <button
        type="button"
        className="btn-secondary touch-target l2-submit-btn"
        disabled={session.submitting}
        onClick={() =>
          void session.handleCheck(
            checkProblem2PrizeBoard({ grabsComplete, slots: state.slots, evAnswer: state.evAnswer }),
            'final',
            state.evAnswer,
            state.evAnswer,
          )
        }
      >
        {session.submitting ? 'Saving…' : 'Submit answer'}
      </button>
    ) : undefined,
    content: (
      <div className="l2-claw-step l2-claw-step-2">
        <div className="l2-claw-stage">
          <div className="l2-claw-compact">
            <div className="l2-claw-fit">
              <ClawMachine
                zones={ZONES}
                grabs={state.grabs}
                activeGrab={null}
                onGrabAnimationEnd={() => {}}
                reducedMotion={reducedMotion}
              />
            </div>
          </div>
          <div className="l2-contrib">
            <ClawContributionBlocks
              rows={CONTRIB_ROWS}
              evTotal="$5"
              revealed={state.viewedCompression}
              revealValues={revealContributionValues}
              reducedMotion={reducedMotion}
            />
          </div>
        </div>
        <div className="l2-claw-side">
          {!state.viewedCompression ? (
            <>
              <p className="section-note">
                Your grabs were noisy, but the expected value of one grab is fixed. Compress the pit:
                each outcome contributes its payout × probability.
              </p>
              <button
                type="button"
                className="btn-secondary touch-target l2-compress-btn"
                onClick={() => setState((p) => ({ ...p, viewedCompression: true }))}
              >
                Compress the pit
              </button>
            </>
          ) : (
            <>
              <FormulaBuilder
                slots={state.slots}
                selectedCard={state.selectedCard}
                cards={CARDS}
                onSelectCard={(c) => setState((p) => ({ ...p, selectedCard: p.selectedCard === c ? null : c }))}
                onPlaceSlot={(index) => {
                  if (!state.selectedCard) return
                  setState((p) => {
                    const n = [...p.slots] as typeof p.slots
                    n[index] = p.selectedCard!
                    return { ...p, slots: n, selectedCard: null }
                  })
                }}
                onClearSlot={(i) =>
                  setState((p) => {
                    const n = [...p.slots] as typeof p.slots
                    n[i] = ''
                    return { ...p, slots: n }
                  })
                }
              />
              <div className="l2-answer-actions">
                <label className="field-label">
                  Expected value — your answer here
                  <input
                    type="text"
                    className="touch-input"
                    value={state.evAnswer}
                    inputMode="decimal"
                    onChange={(e) => setState((p) => ({ ...p, evAnswer: e.target.value }))}
                    placeholder="Type the expected value"
                  />
                </label>
              </div>
            </>
          )}
          <p className="sr-only" aria-live="polite">
            {state.viewedCompression
              ? revealContributionValues
                ? 'Contribution breakdown revealed. Twenty dollars times twenty-five percent is five dollars. Zero dollars times seventy-five percent is zero. Expected value five dollars.'
                : 'Contribution breakdown revealed. Twenty dollars times twenty-five percent equals an unknown contribution. Zero dollars times seventy-five percent equals an unknown contribution. Pair the payouts with their probabilities to find the expected value.'
              : `${REQUIRED_GRABS} grabs complete. Compress the pit to see each outcome's contribution.`}
          </p>
        </div>
      </div>
    ),
  }

  const steps: WorkspaceStepDef[] = [runStep, compressStep]

  return (
    <ProblemLayout
      problem={PROBLEM_2}
      problemNumber={4}
      workspaceMinimalHeader
      enclosedWorkspaceLayout
      feedback={session.feedback}
      completed={session.completed}
      justCompleted={session.justCompleted}
      streakResult={session.streakResult}
      revealedHintIds={session.revealedHintIds}
      onRevealHint={session.revealHint}
      nextProblemId="ev-l2-p2"
      restarted={session.restarted}
      onRestart={() => {
        setQueuedBulkGrabs(0)
        reset()
        session.restart()
      }}
      onReview={session.backToReview}
      attemptCount={session.finalAttemptCount}
      lastSubmittedAnswer={session.lastSubmittedAnswer}
      reviewHintUsed={session.reviewHintUsed}
      demoSteps={DEMO}
      demoFinalCta={DEMO_CTA}
      completionMessage="You ran the claw, watched the noisy tray, compressed the pit into contribution blocks, paired each payout with its probability, and computed the expected value."
      steps={steps}
      onStepChange={session.clearFeedback}
    />
  )
}
