import { CurrentTaskPanel } from '../../features/learning-experience/CurrentTaskPanel'
import type {
  ChecklistStepStatus,
  ChecklistStepView,
} from '../../features/learning-experience'

/**
 * Backwards-compatible checklist step. `done` keeps the original API working;
 * `status` is optional and lets a problem flag a step as "needs-correction".
 */
export interface ChecklistStep {
  id: string
  label: string
  done: boolean
  status?: ChecklistStepStatus
}

interface TaskGuideProps {
  currentTask: string
  steps: ChecklistStep[]
}

/**
 * Thin wrapper preserved for the existing 8 problems. It now delegates to the
 * reusable `CurrentTaskPanel`, which adds the needs-correction state while
 * keeping the original current-task + checklist behavior intact.
 */
export function TaskGuide({ currentTask, steps }: TaskGuideProps) {
  const viewSteps: ChecklistStepView[] = steps.map((s) => ({
    id: s.id,
    label: s.label,
    done: s.done,
    status: s.status,
  }))
  return <CurrentTaskPanel currentTask={currentTask} steps={viewSteps} />
}
