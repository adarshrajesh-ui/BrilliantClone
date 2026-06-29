import { useCallback, useMemo, useState } from 'react'
import type { JSX } from 'react'
import { MoneyPrinter3D } from '../visuals/MoneyPrinter3D'
import { JackpotSlot3D } from '../visuals/JackpotSlot3D'
import { RunningAverageGraph } from '../visuals/RunningAverageGraph'
import { PokerChipLoader } from '../PokerChipLoader'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { useProblemSession } from '../../hooks/useProblemSession'
import { usePersistedProblemState } from '../../hooks/usePersistedProblemState'
import { usePrefersReducedMotion } from '../../features/learning-experience'
import type { WorkspaceStepDef } from '../../features/learning-experience'
import type { CheckResult } from '../../types/problem'
import { PROBLEM_7, checkSameAverageDifferentRide } from '../../data/problems/problem-7'
import { constantGame, runDeterministicBatch, type DiscreteOutcome } from '../../lib/simulation'
import './l5p1-workspace.css'

/** Game A — always pays $10 (EV $10). */
const PRINTER_GAME = constantGame(10)
/** Game B — 40% $25, 60% $0 → EV = 0.4·25 + 0.6·0 = $10. */
const SLOT_GAME: DiscreteOutcome[] = [
  { value: 25, probability: 0.4 },
  { value: 0, probability: 0.6 },
]

const MIN_TRIALS = 10
const START_SIMULATION_RUNS = 20
const BATCH_SIZES = [1, 10, 100] as const
const STRIP_LIMIT = 24

interface MachineState {
  /** Cumulative number of trials run on this machine. */
  trials: number
  /** Every individual outcome drawn on this machine, in order. */
  results: number[]
  /** Last revealed outcome (drives the 3D component's reveal). */
  lastOutcome: number | null
  /** Monotonic press counter; doubles as the per-press seed index + 3D run token. */
  runToken: number
}

interface P7State {
  printer: MachineState
  slot: MachineState
  /** True once the guided 20-run simulation has run both machines together. */
  ranStartSimulation: boolean
  /** True once any Run 100 batch was pressed on either machine. */
  ranHundredBatch: boolean
  sameEV: string
  riskier: string
  why: string
}

const EMPTY_MACHINE: MachineState = {
  trials: 0,
  results: [],
  lastOutcome: null,
  runToken: 0,
}

const DEFAULT: P7State = {
  printer: { ...EMPTY_MACHINE },
  slot: { ...EMPTY_MACHINE },
  ranStartSimulation: false,
  ranHundredBatch: false,
  sameEV: '',
  riskier: '',
  why: '',
}

/** Per-step badge state. `undefined` = not yet checked (or cleared on edit). */
type StepStatus = 'correct' | 'incorrect' | undefined
type Checks = { questions: StepStatus }
const NO_CHECKS: Checks = { questions: undefined }

// Map a CheckResult to a badge status: 'correct' when right, 'incorrect' on a
// real mistake, undefined for guard results (not yet answerable).
function statusFromResult(result: CheckResult): StepStatus {
  if (result.isCorrect) return 'correct'
  if (result.mistakeType === null || result.mistakeType === '') return undefined
  return 'incorrect'
}

/** Running average after each trial over the cumulative result list. */
function runningAverages(results: number[]): number[] {
  const out: number[] = []
  let sum = 0
  for (let i = 0; i < results.length; i += 1) {
    sum += results[i]
    out.push(sum / (i + 1))
  }
  return out
}

/** Compact, no-scroll outcome strip: the most recent payouts as colored chips. */
function OutcomeStrip({
  results,
  machine,
}: {
  results: number[]
  machine: 'printer' | 'slot'
}): JSX.Element {
  const recent = results.slice(-STRIP_LIMIT)
  if (recent.length === 0) {
    return (
      <div className="l5p1-strip l5p1-strip-empty" aria-hidden="true">
        <span className="l5p1-strip-hint">Run the machine to see payouts</span>
      </div>
    )
  }
  return (
    <div className="l5p1-strip" aria-hidden="true">
      {recent.map((value, i) => {
        const variant =
          machine === 'printer'
            ? 'l5p1-chip-printer'
            : value === 25
              ? 'l5p1-chip-win'
              : 'l5p1-chip-lose'
        return (
          <span key={i} className={`l5p1-chip ${variant}`}>
            ${value}
          </span>
        )
      })}
    </div>
  )
}

export function Problem7WholeEVModel() {
  const { state, setState, loaded, reset } = usePersistedProblemState<P7State>('problem-7', DEFAULT)
  const session = useProblemSession(PROBLEM_7, state)
  const reducedMotion = usePrefersReducedMotion()

  // Transient per-machine animation flags (not persisted): true while the 3D
  // reveal is playing so the Run buttons disable until it settles.
  const [printerRunning, setPrinterRunning] = useState(false)
  const [slotRunning, setSlotRunning] = useState(false)
  // Final-step ('questions') check result drives the status badge. Changing any
  // answer clears it so a stale ✓/! never lingers after the learner edits.
  const [checks, setChecks] = useState<Checks>(NO_CHECKS)

  const runMachine = useCallback(
    (machine: 'printer' | 'slot', batchSize: number) => {
      // Reduced motion reveals instantly, so keep the buttons enabled.
      if (!reducedMotion) {
        if (machine === 'printer') setPrinterRunning(true)
        else setSlotRunning(true)
      }
      setState((p) => {
        const prev = p[machine]
        const nextToken = prev.runToken + 1
        const game = machine === 'printer' ? PRINTER_GAME : SLOT_GAME
        const sim = runDeterministicBatch(game, batchSize, `problem-7-${machine}-${nextToken}`)
        const lastOutcome = sim.results[sim.results.length - 1] ?? prev.lastOutcome
        return {
          ...p,
          ranHundredBatch: p.ranHundredBatch || batchSize === 100,
          [machine]: {
            trials: prev.trials + batchSize,
            results: [...prev.results, ...sim.results],
            lastOutcome,
            runToken: nextToken,
          },
        }
      })
    },
    [reducedMotion, setState],
  )

  const runStartSimulation = useCallback(() => {
    if (!reducedMotion) {
      setPrinterRunning(true)
      setSlotRunning(true)
    }
    setState((p) => {
      const printerToken = p.printer.runToken + 1
      const slotToken = p.slot.runToken + 1
      const printerSim = runDeterministicBatch(
        PRINTER_GAME,
        START_SIMULATION_RUNS,
        `problem-7-printer-${printerToken}`,
      )
      const slotSim = runDeterministicBatch(
        SLOT_GAME,
        START_SIMULATION_RUNS,
        `problem-7-slot-${slotToken}`,
      )

      return {
        ...p,
        ranStartSimulation: true,
        printer: {
          trials: p.printer.trials + START_SIMULATION_RUNS,
          results: [...p.printer.results, ...printerSim.results],
          lastOutcome: printerSim.results[printerSim.results.length - 1] ?? p.printer.lastOutcome,
          runToken: printerToken,
        },
        slot: {
          trials: p.slot.trials + START_SIMULATION_RUNS,
          results: [...p.slot.results, ...slotSim.results],
          lastOutcome: slotSim.results[slotSim.results.length - 1] ?? p.slot.lastOutcome,
          runToken: slotToken,
        },
      }
    })
  }, [reducedMotion, setState])

  const resetSimulation = useCallback(() => {
    setPrinterRunning(false)
    setSlotRunning(false)
    setState((p) => ({
      ...p,
      printer: { ...EMPTY_MACHINE },
      slot: { ...EMPTY_MACHINE },
      ranStartSimulation: false,
      ranHundredBatch: false,
    }))
    setChecks(NO_CHECKS)
  }, [setState])

  const handlePrinterDone = useCallback(() => setPrinterRunning(false), [])
  const handleSlotDone = useCallback(() => setSlotRunning(false), [])

  const printerAverages = useMemo(
    () => runningAverages(state.printer.results),
    [state.printer.results],
  )
  const slotAverages = useMemo(() => runningAverages(state.slot.results), [state.slot.results])

  if (!loaded || !session.sessionLoaded) {
    return <PokerChipLoader label="Loading…" />
  }

  const printerAvg = printerAverages.length ? printerAverages[printerAverages.length - 1] : 0
  const slotAvg = slotAverages.length ? slotAverages[slotAverages.length - 1] : 0

  const completedGuidedSimulation = Boolean(state.ranStartSimulation)
  const ranEnough = state.printer.trials >= MIN_TRIALS && state.slot.trials >= MIN_TRIALS
  const completedExplorationBatch = completedGuidedSimulation || state.ranHundredBatch
  const gateMet = ranEnough && completedExplorationBatch
  const allAnswered = state.sameEV !== '' && state.riskier !== '' && state.why !== ''
  const simulationBusy = printerRunning || slotRunning || session.submitting

  const playAdvanceHint = !ranEnough
    ? 'Start the 20-run simulation, or run each machine at least 10 times manually.'
    : !completedExplorationBatch
      ? 'Start the 20-run simulation, or run at least one 100-run batch manually.'
      : undefined

  const clearQuestionsBadge = () => setChecks((p) => ({ ...p, questions: undefined }))
  const setSameEV = (value: string) => {
    setState((p) => ({ ...p, sameEV: value }))
    clearQuestionsBadge()
  }
  const setRiskier = (value: string) => {
    setState((p) => ({ ...p, riskier: value }))
    clearQuestionsBadge()
  }
  const setWhy = (value: string) => {
    setState((p) => ({ ...p, why: value }))
    clearQuestionsBadge()
  }

  const renderControls = (machine: 'printer' | 'slot') => {
    const busy = machine === 'printer' ? printerRunning : slotRunning
    return (
      <div className="l5p1-controls" role="group" aria-label={`Run the ${machine}`}>
        {BATCH_SIZES.map((size) => (
          <button
            key={size}
            type="button"
            className="btn-secondary touch-target l5p1-run"
            disabled={busy || session.submitting}
            onClick={() => runMachine(machine, size)}
          >
            Run {size}
          </button>
        ))}
      </div>
    )
  }

  const steps: WorkspaceStepDef[] = [
    {
      id: 'play',
      title: 'Run both machines',
      prompt: 'Run both machines 20 times.',
      canAdvance: gateMet,
      advanceHint: playAdvanceHint,
      content: (
        <div className="l5p1-play">
          <p className="section-note">Start the simulation to run both machines together 20 times, then reset or keep testing manually.</p>
          <div className="l5p1-sim-controls">
            <button
              type="button"
              className="btn-secondary touch-target l5p1-start"
              disabled={simulationBusy || completedGuidedSimulation}
              onClick={runStartSimulation}
            >
              Start simulation
            </button>
            {(state.printer.trials > 0 || state.slot.trials > 0) && (
              <button
                type="button"
                className="btn-secondary touch-target l5p1-reset"
                disabled={simulationBusy}
                onClick={resetSimulation}
              >
                Reset simulation
              </button>
            )}
          </div>
          <p className="l5p1-phone-tip">Swipe between machines; each card keeps its run buttons with the visual.</p>
          <div className="l5p1-machines">
            <div className="l5p1-machine">
              <p className="l5p1-machine-head">Game A · Money Printer</p>
              <div className="l5p1-stage l5p1-stage-mp">
                <MoneyPrinter3D
                  className="l5p1-mp"
                  animate={!reducedMotion}
                  runToken={state.printer.runToken}
                  outcome={state.printer.lastOutcome}
                  onComplete={handlePrinterDone}
                />
              </div>
              {renderControls('printer')}
              <OutcomeStrip results={state.printer.results} machine="printer" />
              <div className="l5p1-graph">
                <RunningAverageGraph
                  averages={printerAverages}
                  target={10}
                  maxY={25}
                  variant="flat"
                  label={`Money Printer running average · ${state.printer.trials} runs`}
                />
              </div>
            </div>

            <div className="l5p1-machine">
              <p className="l5p1-machine-head">Game B · Jackpot Slot</p>
              <div className="l5p1-stage l5p1-stage-js">
                <JackpotSlot3D
                  className="l5p1-js"
                  animate={!reducedMotion}
                  runToken={state.slot.runToken}
                  outcome={state.slot.lastOutcome}
                  onComplete={handleSlotDone}
                />
              </div>
              {renderControls('slot')}
              <OutcomeStrip results={state.slot.results} machine="slot" />
              <div className="l5p1-graph">
                <RunningAverageGraph
                  averages={slotAverages}
                  target={10}
                  maxY={25}
                  variant="jagged"
                  label={`Jackpot Slot running average · ${state.slot.trials} runs`}
                />
              </div>
            </div>
          </div>

          {(state.printer.trials > 0 || state.slot.trials > 0) && (
            <p className="l5p1-live" role="status" aria-live="polite">
              {`Money Printer averages $${printerAvg.toFixed(2)} over ${state.printer.trials} runs. Jackpot Slot averages $${slotAvg.toFixed(2)} over ${state.slot.trials} runs.`}
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'questions',
      title: 'Same average, different ride?',
      prompt: 'Answer all three questions.',
      status: checks.questions,
      action: (
        <button
          type="button"
          className="btn-secondary touch-target"
          disabled={session.submitting || !gateMet || !allAnswered}
          onClick={() => {
            const result = checkSameAverageDifferentRide({
              printerTrials: state.printer.trials,
              slotTrials: state.slot.trials,
              ranHundredBatch: state.ranHundredBatch,
              ranStartSimulation: completedGuidedSimulation,
              sameEV: state.sameEV,
              riskier: state.riskier,
              why: state.why,
            })
            setChecks((p) => ({ ...p, questions: statusFromResult(result) }))
            void session.handleCheck(
              result,
              'final',
              JSON.stringify({ sameEV: state.sameEV, riskier: state.riskier, why: state.why }),
              state.why,
            )
          }}
        >
          Submit answers
        </button>
      ),
      content: (
        <div className="l5p1-questions">
          <fieldset className="l5p1-question" disabled={!gateMet}>
            <legend>1. Do both machines have the same expected value (average payout per run)?</legend>
            <div className="l5p1-options">
              {[
                { value: 'yes', label: 'Yes — both average $10 per run' },
                { value: 'no', label: 'No — their averages are different' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`l5p1-option touch-target${state.sameEV === opt.value ? ' l5p1-option-selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="sameEV"
                    value={opt.value}
                    checked={state.sameEV === opt.value}
                    onChange={() => setSameEV(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="l5p1-question" disabled={!gateMet}>
            <legend>2. Which machine is riskier?</legend>
            <div className="l5p1-options">
              {[
                { value: 'slot', label: 'The Jackpot Slot' },
                { value: 'printer', label: 'The Money Printer' },
                { value: 'neither', label: 'Neither — they feel the same' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`l5p1-option touch-target${state.riskier === opt.value ? ' l5p1-option-selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="riskier"
                    value={opt.value}
                    checked={state.riskier === opt.value}
                    onChange={() => setRiskier(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="l5p1-question" disabled={!gateMet}>
            <legend>3. Why is the Jackpot Slot riskier?</legend>
            <div className="l5p1-options">
              {[
                {
                  value: 'same-avg-different-spread',
                  label: 'Same $10 average, but the Slot swings between $0 and $25 while the Printer always pays $10',
                },
                { value: 'slot-higher-average', label: 'The Slot pays more on average' },
                { value: 'printer-pays-less', label: 'The Printer pays less per run' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`l5p1-option touch-target${state.why === opt.value ? ' l5p1-option-selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="why"
                    value={opt.value}
                    checked={state.why === opt.value}
                    onChange={() => setWhy(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="l5p1-submit-row">
            {!gateMet && (
              <span className="l5p1-submit-hint">{playAdvanceHint}</span>
            )}
          </div>
        </div>
      ),
    },
  ]

  return (
    <ProblemLayout
      problem={PROBLEM_7}
      problemNumber={12}
      workspaceMinimalHeader
      feedback={session.feedback}
      completed={session.completed}
      justCompleted={session.justCompleted}
      streakResult={session.streakResult}
      revealedHintIds={session.revealedHintIds}
      onRevealHint={session.revealHint}
      restarted={session.restarted}
      onRestart={() => {
        reset()
        setChecks(NO_CHECKS)
        session.restart()
      }}
      onReview={session.backToReview}
      attemptCount={session.finalAttemptCount}
      lastSubmittedAnswer={session.lastSubmittedAnswer}
      reviewHintUsed={session.reviewHintUsed}
      completionMessage="You ran two machines that share the same $10 average but feel very different — the Money Printer never moves while the Jackpot Slot swings between $0 and $25."
      steps={steps}
      onStepChange={session.clearFeedback}
    />
  )
}
