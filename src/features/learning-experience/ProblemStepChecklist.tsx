import type { ChecklistStepStatus, ChecklistStepView } from './types'

interface ProblemStepChecklistProps {
  steps: ChecklistStepView[]
}

/**
 * Derive each step's display status. Explicit `status` always wins (this is how
 * a problem signals a "needs-correction" step). Otherwise the first not-done
 * step becomes "active" and the rest are "todo"/"done".
 */
export function resolveStepStatuses(steps: ChecklistStepView[]): ChecklistStepStatus[] {
  const firstTodoIndex = steps.findIndex((s) => !(s.status === 'done' || s.done))
  return steps.map((step, i) => {
    if (step.status) {
      return step.status
    }
    if (step.done) {
      return 'done'
    }
    if (i === firstTodoIndex) {
      return 'active'
    }
    return 'todo'
  })
}

const MARKERS: Record<ChecklistStepStatus, string> = {
  done: '✓',
  'needs-correction': '!',
  active: '',
  todo: '',
}

export function ProblemStepChecklist({ steps }: ProblemStepChecklistProps) {
  const statuses = resolveStepStatuses(steps)

  return (
    <ol className="task-checklist">
      {steps.map((step, i) => {
        const status = statuses[i]
        const marker = MARKERS[status] || String(i + 1)
        return (
          <li key={step.id} className={`task-step task-step-${status}`}>
            <span className="task-step-marker" aria-hidden="true">
              {marker}
            </span>
            <span className="task-step-label">{step.label}</span>
            {status === 'needs-correction' && (
              <span className="task-step-flag">Needs correction</span>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/** Count of steps considered complete (status `done`). */
export function countDoneSteps(steps: ChecklistStepView[]): number {
  return resolveStepStatuses(steps).filter((s) => s === 'done').length
}
