import type { DemoStepConfig } from './types'

interface DemoStepProps {
  step: DemoStepConfig
  /** Step number for the visible heading (1-based). */
  stepNumber: number
}

/** A single demo step's content (heading + optional media + body). */
export function DemoStep({ step, stepNumber }: DemoStepProps) {
  return (
    <div className="demo-step" role="group" aria-label={`Demo step ${stepNumber}`}>
      {step.media && <div className="demo-step-media">{step.media}</div>}
      {step.title && <h3 className="demo-step-title">{step.title}</h3>}
      <div className="demo-step-body">
        {typeof step.body === 'string' ? <p>{step.body}</p> : step.body}
      </div>
    </div>
  )
}
