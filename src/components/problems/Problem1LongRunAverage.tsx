import { useCallback, useMemo } from 'react'
import { DiceTray3D } from '../visuals/DiceTray3D'
import { RunningAverageGraph } from '../visuals/RunningAverageGraph'
import { SumHistogram } from '../visuals/SumHistogram'
import { PokerChipLoader } from '../PokerChipLoader'
import { ProblemLayout } from '../lesson/ProblemLayout'
import { useProblemSession } from '../../hooks/useProblemSession'
import { usePersistedProblemState } from '../../hooks/usePersistedProblemState'
import { QuestionPrompt, usePrefersReducedMotion } from '../../features/learning-experience'
import type { DemoStepConfig, WorkspaceStepDef } from '../../features/learning-experience'
import './l1-workspace.css'
import {
  PROBLEM_1,
  checkProblem1Dice,
  diceRollForThrow,
} from '../../data/problems/problem-1'

const DICE_DEMO: DemoStepConfig[] = [
  {
    id: 'p1d-pickup',
    title: 'Pick up the dice',
    body: 'Grab the two dice with your cursor (or finger) and drag them into the felt tray, then release. You can also tap the dice, then tap the tray, or press Enter.',
  },
  {
    id: 'p1d-throw',
    title: 'Throw and read the sum',
    body: 'The dice lift, tumble, bounce, and settle on two faces. Their sum — somewhere from 2 to 12 — is the result of that roll.',
  },
  {
    id: 'p1d-watch',
    title: 'Watch both graphs',
    body: 'Every roll adds a point to the running-average graph and a tally to the distribution histogram. Early throws jump around; after many throws the average settles toward the dashed reference line while the histogram shape stabilizes.',
  },
  {
    id: 'p1d-go',
    title: 'Roll and watch the average',
    body: 'Throw the dice yourself, or use Roll 10 / Roll 100 to reach 100+ total rolls and watch the running average settle.',
  },
]
const DICE_DEMO_CTA = 'Throw the dice, speed up with batches, then identify the long-run average sum.'
const REACHED_100_ROLLS_MESSAGE = 'Nice — you reached 100+ rolls. Watch how the average settles near 7.'

interface P1State {
  seed: number
  totalThrows: number
  sumTotal: number
  runningAverages: number[]
  counts: number[]
  lastDice: { d1: number; d2: number } | null
  lastSum: number | null
  throwSeq: number
  finalAnswer: string
  liveMessage: string
}

const emptyCounts = (): number[] => Array.from({ length: 11 }, () => 0)

const DEFAULT: P1State = {
  seed: 0,
  totalThrows: 0,
  sumTotal: 0,
  runningAverages: [],
  counts: emptyCounts(),
  lastDice: null,
  lastSum: null,
  throwSeq: 0,
  finalAnswer: '',
  liveMessage: '',
}

function ensureSeed(seed: number): number {
  if (seed !== 0) return seed
  const candidate = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0
  return candidate === 0 ? 0x1a2b3c4d : candidate
}

/** Length-11 sum-count array (sums 2..12), defensive against stale persisted shapes. */
function normalizeCounts(counts: unknown): number[] {
  const base = emptyCounts()
  if (Array.isArray(counts)) {
    for (let i = 0; i < 11; i += 1) {
      const v = counts[i]
      if (typeof v === 'number' && Number.isFinite(v) && v > 0) base[i] = v
    }
  }
  return base
}

export function Problem1LongRunAverage() {
  const { state, setState, loaded, reset } = usePersistedProblemState<P1State>('problem-1', DEFAULT)
  const session = useProblemSession(PROBLEM_1, state)
  const reducedMotion = usePrefersReducedMotion()

  const runThrows = useCallback(
    (count: number) => {
      setState((prev) => {
        const seed = ensureSeed(prev.seed)
        let throws = prev.totalThrows
        let sumTotal = prev.sumTotal ?? 0
        const avgs = Array.isArray(prev.runningAverages) ? [...prev.runningAverages] : []
        const counts = normalizeCounts(prev.counts)
        let lastDice = prev.lastDice
        let lastSum = prev.lastSum
        for (let i = 0; i < count; i += 1) {
          const roll = diceRollForThrow(seed, throws)
          throws += 1
          sumTotal += roll.sum
          avgs.push(sumTotal / throws)
          counts[roll.sum - 2] += 1
          lastDice = { d1: roll.d1, d2: roll.d2 }
          lastSum = roll.sum
        }
        const avg = sumTotal / throws
        return {
          ...prev,
          seed,
          totalThrows: throws,
          sumTotal,
          runningAverages: avgs,
          counts,
          lastDice,
          lastSum,
          throwSeq: prev.throwSeq + 1,
          liveMessage: lastDice
            ? `Rolled ${lastDice.d1} and ${lastDice.d2}, sum ${lastSum}. Average sum after ${throws} rolls: ${avg.toFixed(2)}.`
            : prev.liveMessage,
        }
      })
    },
    [setState],
  )

  const counts = useMemo(() => normalizeCounts(state.counts), [state.counts])
  const average = state.totalThrows ? (state.sumTotal ?? 0) / state.totalThrows : 0
  const rollProgress = Math.min(state.totalThrows, 100)
  const currentAverageDisplay = state.totalThrows ? `${average.toFixed(2)} → 7` : '— → 7'
  const stats = useMemo(
    () => [
      { label: 'Rolls', value: String(state.totalThrows) },
      { label: 'Last Roll', value: state.lastSum === null ? '—' : String(state.lastSum) },
      { label: 'Current Average', value: currentAverageDisplay, emphasized: true },
    ],
    [state.totalThrows, state.lastSum, currentAverageDisplay],
  )

  if (!loaded || !session.sessionLoaded) {
    return <PokerChipLoader label="Loading problem…" />
  }

  const steps: WorkspaceStepDef[] = [
    {
      id: 'throw',
      title: 'Throw the dice',
      prompt: (
        <QuestionPrompt>
          {state.totalThrows >= 100
            ? REACHED_100_ROLLS_MESSAGE
            : `Hold the dice with your cursor, throw them into the tray, or use a batch to reach 100 total rolls (${rollProgress}/100).`}
        </QuestionPrompt>
      ),
      canAdvance: state.totalThrows >= 100,
      advanceHint: 'Reach 100 total rolls to continue.',
      content: (
        <>
          <div className="l1-play l1-dice-play">
            <div className="ws-visual">
              <DiceTray3D
                dice={state.lastDice}
                throwSeq={state.throwSeq}
                lastSum={state.lastSum}
                totalThrows={state.totalThrows}
                onThrow={() => runThrows(1)}
                disabled={false}
                reducedMotion={reducedMotion}
              />
              <div className="spin-buttons l1-roll-pills" aria-label="Roll batches">
                <button
                  type="button"
                  className="btn-secondary touch-target"
                  onClick={() => runThrows(1)}
                >
                  Roll 1
                </button>
                <button
                  type="button"
                  className="btn-secondary touch-target"
                  onClick={() => runThrows(10)}
                >
                  Roll 10
                </button>
                <button
                  type="button"
                  className="btn-secondary touch-target"
                  onClick={() => runThrows(100)}
                >
                  Roll 100
                </button>
              </div>
            </div>
            <div className="l1-side">
              <ul className="stat-list l1-stat-cards" aria-label="Roll statistics">
                {stats.map((s) => (
                  <li key={s.label} className={s.emphasized ? 'l1-stat-card-emphasis' : undefined}>
                    <span>{s.label}</span>
                    <strong>{s.value}</strong>
                  </li>
                ))}
              </ul>
              {state.totalThrows < 100 && (
                <p className="l1-mobile-gate-hint">Reach 100 total rolls to unlock Next.</p>
              )}
              {state.totalThrows >= 100 && (
                <p className="l1-reached-message">{REACHED_100_ROLLS_MESSAGE}</p>
              )}
            </div>
            <div className="l1-graphs">
              <RunningAverageGraph averages={state.runningAverages} target={7} maxY={12} label="Does the average settle near 7?" />
              <SumHistogram counts={counts} label="Which sums show up most often?" />
              <p className="l1-chart-note">
                The running average may wobble early, but many rolls pull it toward 7 while sums near 7 appear most often.
              </p>
            </div>
          </div>
          <p className="sr-only" aria-live="polite">
            {state.liveMessage}
            {state.totalThrows > 0 && ` Running average sum: ${average.toFixed(2)} after ${state.totalThrows} rolls.`}
          </p>
        </>
      ),
    },
    {
      id: 'identify',
      title: 'Identify the long-run average sum',
      prompt: <QuestionPrompt>What is the long-run average sum per roll?</QuestionPrompt>,
      action: (
        <button
          type="button"
          className="btn-secondary touch-target"
          disabled={state.totalThrows < 100 || session.submitting}
          onClick={() =>
            void session.handleCheck(
              checkProblem1Dice({
                totalThrows: state.totalThrows,
                finalAnswer: state.finalAnswer,
              }),
              'final',
              state.finalAnswer,
              state.finalAnswer,
            )
          }
        >
          {session.submitting ? 'Saving…' : 'Submit answer'}
        </button>
      ),
      content: (
        <>
          <label className="ws-field field-label">
            Long-run average sum per roll
            <input
              type="text"
              className="touch-input"
              inputMode="decimal"
              value={state.finalAnswer}
              onChange={(e) => setState((p) => ({ ...p, finalAnswer: e.target.value }))}
              placeholder="Type the average sum"
              disabled={state.totalThrows < 100}
            />
          </label>
        </>
      ),
    },
  ]

  return (
    <ProblemLayout
      problem={PROBLEM_1}
      problemNumber={1}
      feedback={session.feedback}
      completed={session.completed}
      revealedHintIds={session.revealedHintIds}
      onRevealHint={session.revealHint}
      nextProblemId="ev-l1-p2"
      restarted={session.restarted}
      onRestart={() => {
        reset()
        session.restart()
      }}
      onReview={session.backToReview}
      attemptCount={session.finalAttemptCount}
      lastSubmittedAnswer={session.lastSubmittedAnswer}
      reviewHintUsed={session.reviewHintUsed}
      demoSteps={DICE_DEMO}
      demoFinalCta={DICE_DEMO_CTA}
      completionMessage="You rolled two dice past 100 total rolls and identified 7 as the long-run average sum."
      steps={steps}
    />
  )
}
