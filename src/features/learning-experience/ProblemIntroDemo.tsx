import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { DemoProgress } from './DemoProgress'
import { DemoStep } from './DemoStep'
import {
  canGoBack,
  canGoNext,
  demoNavReducer,
  isLastStep,
  type DemoNavState,
} from './demoReducer'
import type { DemoStepConfig } from './types'

export interface ProblemIntroDemoProps {
  steps: DemoStepConfig[]
  /** Closing call-to-action shown on the last step. */
  finalCallToAction?: string
  /** Panel heading (defaults to "Quick demo"). */
  title?: string
  /** Optional controlled step index. When provided, `onStepChange` must update it. */
  stepIndex?: number
  onStepChange?: (index: number) => void
  /** Called when the learner skips the demo. MUST NOT grade/complete anything. */
  onSkip: () => void
  /** Called when the learner starts the problem. MUST NOT grade/complete anything. */
  onStart: () => void
}

/**
 * Reusable pre-problem mini-demo.
 *
 * Guarantees (enforced by construction):
 * - Emits only `onSkip` / `onStart` / `onStepChange` callbacks; it never writes
 *   to Firestore, records attempts, sets hintUsed, or mutates completion.
 * - Keyboard navigable (←/→, Enter advances or starts, Escape skips).
 * - Visually distinct from the graded problem (its own card styling).
 */
export function ProblemIntroDemo({
  steps,
  finalCallToAction,
  title = 'Quick demo',
  stepIndex,
  onStepChange,
  onSkip,
  onStart,
}: ProblemIntroDemoProps) {
  const total = steps.length
  const isControlled = stepIndex != null
  const [internalIndex, setInternalIndex] = useState(0)
  const index = isControlled ? Math.max(0, Math.min(stepIndex!, total - 1)) : internalIndex
  const navState: DemoNavState = { index, total }

  const containerRef = useRef<HTMLDivElement>(null)

  // Focus the demo container on mount / step change so keyboard nav works
  // immediately and screen readers announce the active step.
  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  const setIndex = useCallback(
    (next: number) => {
      if (isControlled) {
        onStepChange?.(next)
      } else {
        setInternalIndex(next)
        onStepChange?.(next)
      }
    },
    [isControlled, onStepChange],
  )

  const goNext = useCallback(() => {
    const ns: DemoNavState = { index, total }
    if (canGoNext(ns)) {
      setIndex(demoNavReducer(ns, { type: 'next' }).index)
    }
  }, [index, total, setIndex])

  const goBack = useCallback(() => {
    const ns: DemoNavState = { index, total }
    if (canGoBack(ns)) {
      setIndex(demoNavReducer(ns, { type: 'back' }).index)
    }
  }, [index, total, setIndex])

  const onLast = isLastStep(navState)

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault()
          goNext()
          break
        case 'ArrowLeft':
          event.preventDefault()
          goBack()
          break
        case 'Enter':
          event.preventDefault()
          if (onLast) {
            onStart()
          } else {
            goNext()
          }
          break
        case 'Escape':
          event.preventDefault()
          onSkip()
          break
        default:
          break
      }
    },
    [goNext, goBack, onLast, onStart, onSkip],
  )

  if (total === 0) {
    // Nothing to demo — start immediately rather than showing an empty shell.
    return null
  }

  const currentStep = steps[index]

  return (
    <section
      className="card demo-card"
      aria-label={`${title}: step ${index + 1} of ${total}`}
      ref={containerRef}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <div className="demo-card-head">
        <span className="demo-card-eyebrow">{title}</span>
        <button type="button" className="demo-skip btn-text touch-target" onClick={onSkip}>
          Skip demo
        </button>
      </div>

      <DemoProgress index={index} total={total} onGoto={setIndex} />

      <DemoStep step={currentStep} stepNumber={index + 1} />

      {onLast && finalCallToAction && (
        <p className="demo-final-cta" role="note">
          {finalCallToAction}
        </p>
      )}

      <div className="demo-controls">
        <button
          type="button"
          className="btn-outline touch-target"
          onClick={goBack}
          disabled={!canGoBack(navState)}
        >
          Back
        </button>
        {!onLast && (
          <button type="button" className="btn-secondary touch-target" onClick={goNext}>
            Next
          </button>
        )}
        <button
          type="button"
          className={`touch-target ${onLast ? 'btn-secondary demo-start-emphasis' : 'btn-outline'}`}
          onClick={onStart}
        >
          Start Problem
        </button>
      </div>
    </section>
  )
}
