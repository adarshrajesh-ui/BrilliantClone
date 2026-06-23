import { describe, expect, it } from 'vitest'
import { countDoneSteps, resolveStepStatuses } from '../ProblemStepChecklist'
import type { ChecklistStepView } from '../types'

const steps = (...s: ChecklistStepView[]): ChecklistStepView[] => s

describe('resolveStepStatuses', () => {
  it('marks the first not-done step active and the rest todo', () => {
    const result = resolveStepStatuses(
      steps(
        { id: 'a', label: 'A', done: true },
        { id: 'b', label: 'B', done: false },
        { id: 'c', label: 'C', done: false },
      ),
    )
    expect(result).toEqual(['done', 'active', 'todo'])
  })

  it('honors an explicit needs-correction status', () => {
    const result = resolveStepStatuses(
      steps(
        { id: 'a', label: 'A', done: true },
        { id: 'b', label: 'B', status: 'needs-correction' },
        { id: 'c', label: 'C', done: false },
      ),
    )
    expect(result[1]).toBe('needs-correction')
  })

  it('treats all-done lists as fully done (no active)', () => {
    const result = resolveStepStatuses(
      steps({ id: 'a', label: 'A', done: true }, { id: 'b', label: 'B', done: true }),
    )
    expect(result).toEqual(['done', 'done'])
  })
})

describe('countDoneSteps', () => {
  it('counts only done steps, ignoring needs-correction', () => {
    const list = steps(
      { id: 'a', label: 'A', done: true },
      { id: 'b', label: 'B', status: 'needs-correction' },
      { id: 'c', label: 'C', done: false },
    )
    expect(countDoneSteps(list)).toBe(1)
  })
})
