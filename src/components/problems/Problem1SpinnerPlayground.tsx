import { useCallback, useMemo } from 'react'
import {
  ConfigurableSpinner,
  spinFromSegments,
  type SpinnerSegment,
} from '../visuals/ConfigurableSpinner'
import { RunningAverageGraph } from '../visuals/RunningAverageGraph'
import { QuestionPrompt } from '../../features/learning-experience'

export interface SpinnerPlaygroundConfig {
  winProb: number
  failProb: number
  winPayout: number
  failPayout: number
}

export interface SpinnerPlaygroundSimState {
  totalSpins: number
  totalWinnings: number
  runningAverages: number[]
  rotation: number
  lastOutcome: number | null
}

export const DEFAULT_PLAYGROUND_CONFIG: SpinnerPlaygroundConfig = {
  winProb: 50,
  failProb: 50,
  winPayout: 10,
  failPayout: 0,
}

export const EMPTY_PLAYGROUND_SIM: SpinnerPlaygroundSimState = {
  totalSpins: 0,
  totalWinnings: 0,
  runningAverages: [],
  rotation: 0,
  lastOutcome: null,
}

export function buildPlaygroundSegments(config: SpinnerPlaygroundConfig): SpinnerSegment[] {
  return [
    {
      value: config.winPayout,
      weight: config.winProb,
      color: '#22c55e',
      label: `$${config.winPayout}`,
    },
    {
      value: config.failPayout,
      weight: config.failProb,
      color: '#d1d5db',
      label: `$${config.failPayout}`,
    },
  ]
}

export function computePlaygroundEv(config: SpinnerPlaygroundConfig): number {
  return (
    (config.winPayout * config.winProb + config.failPayout * config.failProb) / 100
  )
}

function clampProb(value: number): number {
  return Math.min(99, Math.max(1, Math.round(value)))
}

function clampPayout(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, Math.round(value)))
}

interface Problem1SpinnerPlaygroundProps {
  config: SpinnerPlaygroundConfig
  sim: SpinnerPlaygroundSimState
  onConfigChange: (next: SpinnerPlaygroundConfig) => void
  onSimChange: (updater: (prev: SpinnerPlaygroundSimState) => SpinnerPlaygroundSimState) => void
  onContinue: () => void
}

export function Problem1SpinnerPlayground({
  config,
  sim,
  onConfigChange,
  onSimChange,
  onContinue,
}: Problem1SpinnerPlaygroundProps) {
  const segments = useMemo(() => buildPlaygroundSegments(config), [config])
  const expectedAverage = useMemo(() => computePlaygroundEv(config), [config])
  const graphMaxY = Math.max(config.winPayout, config.failPayout, Math.ceil(expectedAverage), 10)

  const updateWinProb = (raw: number) => {
    const winProb = clampProb(raw)
    onConfigChange({ ...config, winProb, failProb: 100 - winProb })
  }

  const updateFailProb = (raw: number) => {
    const failProb = clampProb(raw)
    onConfigChange({ ...config, failProb, winProb: 100 - failProb })
  }

  const runSpins = useCallback(
    async (count: number) => {
      await new Promise((r) => setTimeout(r, 350))
      onSimChange((prev) => {
        let spins = prev.totalSpins
        let winnings = prev.totalWinnings
        const avgs = [...prev.runningAverages]
        let last = prev.lastOutcome
        for (let i = 0; i < count; i += 1) {
          const outcome = spinFromSegments(segments)
          winnings += outcome
          spins += 1
          avgs.push(winnings / spins)
          last = outcome
        }
        return {
          ...prev,
          totalSpins: spins,
          totalWinnings: winnings,
          runningAverages: avgs,
          rotation: prev.rotation + count * 47 + 360,
          lastOutcome: last,
        }
      })
    },
    [onSimChange, segments],
  )

  const winPct = config.winProb
  const failPct = config.failProb
  const winTerm = (config.winPayout * winPct) / 100
  const failTerm = (config.failPayout * failPct) / 100

  const stats = [
    { label: 'Total spins', value: String(sim.totalSpins) },
    { label: 'Total winnings', value: `$${sim.totalWinnings}` },
    {
      label: 'Average per spin',
      value: `$${sim.totalSpins ? (sim.totalWinnings / sim.totalSpins).toFixed(2) : '0.00'}`,
    },
  ]

  return (
    <section className="card problem-section spinner-playground">
      <h2>Play with the spinner</h2>
      <QuestionPrompt label="Explore">
        Change the chances and payouts, then spin to see how the long-run average responds.
      </QuestionPrompt>
      <p className="section-note">
        When you are ready, continue to the official problem.
      </p>

      <div className="spinner-playground-controls">
        <label className="spinner-playground-control">
          <span>Chance of winning section</span>
          <div className="spinner-playground-slider-row">
            <input
              type="range"
              min={1}
              max={99}
              value={config.winProb}
              onChange={(e) => updateWinProb(Number(e.target.value))}
              aria-valuetext={`${config.winProb} percent`}
            />
            <output>{config.winProb}%</output>
          </div>
        </label>
        <label className="spinner-playground-control">
          <span>Chance of losing section</span>
          <div className="spinner-playground-slider-row">
            <input
              type="range"
              min={1}
              max={99}
              value={config.failProb}
              onChange={(e) => updateFailProb(Number(e.target.value))}
              aria-valuetext={`${config.failProb} percent`}
            />
            <output>{config.failProb}%</output>
          </div>
        </label>
        <label className="spinner-playground-control">
          <span>Payout for success</span>
          <input
            type="number"
            className="touch-input"
            min={0}
            max={100}
            value={config.winPayout}
            onChange={(e) =>
              onConfigChange({ ...config, winPayout: clampPayout(Number(e.target.value)) })
            }
          />
        </label>
        <label className="spinner-playground-control">
          <span>Payout for failure</span>
          <input
            type="number"
            className="touch-input"
            min={0}
            max={100}
            value={config.failPayout}
            onChange={(e) =>
              onConfigChange({ ...config, failPayout: clampPayout(Number(e.target.value)) })
            }
          />
        </label>
      </div>

      <div className="spinner-playground-ev card-subtle">
        <p className="spinner-playground-ev-label">Expected long-run average (preview)</p>
        <p className="spinner-playground-ev-value">${expectedAverage.toFixed(2)}</p>
        <p className="spinner-playground-ev-formula">
          ${config.winPayout} × {winPct}% + ${config.failPayout} × {failPct}% = ${winTerm.toFixed(2)} + ${failTerm.toFixed(2)} = ${expectedAverage.toFixed(2)}
        </p>
        <p className="spinner-playground-ev-hint">
          Each payout is weighted by how often its section appears. Bigger slices mean more likely outcomes; the preview is where many spins would tend to settle.
        </p>
      </div>

      <div className="problem-visual-row">
        <ConfigurableSpinner
          segments={segments}
          rotation={sim.rotation}
          spinning={false}
          lastOutcome={sim.lastOutcome}
        />
        <div className="problem-side-panel">
          <ul className="stat-list">
            {stats.map((s) => (
              <li key={s.label}>
                <span>{s.label}</span>
                <strong>{s.value}</strong>
              </li>
            ))}
          </ul>
          <div className="spin-buttons">
            {[1, 10, 100].map((n) => (
              <button
                key={n}
                type="button"
                className="btn-secondary touch-target"
                onClick={() => void runSpins(n)}
              >
                Spin {n === 1 ? 'once' : `${n} times`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <RunningAverageGraph
        averages={sim.runningAverages}
        target={Number(expectedAverage.toFixed(2))}
        maxY={graphMaxY}
        label="Running average per spin (exploration)"
      />

      <button type="button" className="btn-secondary touch-target spinner-playground-continue" onClick={onContinue}>
        Go to question
      </button>
    </section>
  )
}
