import type { ReactNode } from 'react'
import { ProblemStepChecklist, countDoneSteps, resolveStepStatuses } from './ProblemStepChecklist'
import type { ChecklistStepView } from './types'

interface CurrentTaskPanelProps {
  /** The single most important "do this now" instruction. */
  currentTask: ReactNode
  steps: ChecklistStepView[]
  /** Optional trailing action (e.g. "Show demo again"). */
  action?: ReactNode
}

/**
 * "What am I looking at / what do I do first / what's left" panel shown near the
 * top of every problem. Presentation only — completion state is supplied via
 * props (`steps[].done` / `steps[].status`).
 */
export function CurrentTaskPanel({ currentTask, steps, action }: CurrentTaskPanelProps) {
  const completedCount = countDoneSteps(steps)

  // The active step is the first one that is not yet done; surface it as
  // "Step X of Y" so the learner always knows where they are in the task.
  const statuses = resolveStepStatuses(steps)
  const activeIndex = statuses.findIndex((s) => s === 'active' || s === 'needs-correction')
  const allDone = steps.length > 0 && completedCount === steps.length
  const stepNumber = allDone ? steps.length : activeIndex >= 0 ? activeIndex + 1 : completedCount + 1

  return (
    <section className="card task-guide" aria-label="Your task and checklist">
      <div className="task-guide-now">
        <span className="task-guide-eyebrow">
          Your task{steps.length > 0 ? ` · Step ${stepNumber} of ${steps.length}` : ''}
        </span>
        <p className="task-guide-action">{currentTask}</p>
      </div>
      <ProblemStepChecklist steps={steps} />
      <div className="task-guide-foot">
        <p className="task-progress-label">
          {completedCount} of {steps.length} steps done
        </p>
        {action && <div className="task-guide-action-slot">{action}</div>}
      </div>
    </section>
  )
}
