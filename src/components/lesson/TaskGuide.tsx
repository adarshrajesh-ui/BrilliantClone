export interface ChecklistStep {
  id: string
  label: string
  done: boolean
}

interface TaskGuideProps {
  currentTask: string
  steps: ChecklistStep[]
}

export function TaskGuide({ currentTask, steps }: TaskGuideProps) {
  const activeIndex = steps.findIndex((s) => !s.done)
  const completedCount = steps.filter((s) => s.done).length

  return (
    <section className="card task-guide" aria-label="Current task and checklist">
      <div className="task-guide-now">
        <span className="task-guide-eyebrow">Current task</span>
        <p className="task-guide-action">{currentTask}</p>
      </div>
      <ol className="task-checklist">
        {steps.map((step, i) => {
          const state = step.done ? 'done' : i === activeIndex ? 'active' : 'todo'
          return (
            <li key={step.id} className={`task-step task-step-${state}`}>
              <span className="task-step-marker" aria-hidden="true">
                {step.done ? '✓' : i + 1}
              </span>
              <span className="task-step-label">{step.label}</span>
            </li>
          )
        })}
      </ol>
      <p className="task-progress-label">
        {completedCount} of {steps.length} steps done
      </p>
    </section>
  )
}
