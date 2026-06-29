import { beforeEach, describe, expect, it, vi } from 'vitest'

// Spies for the Firebase callable surface. `vi.hoisted` runs before the mock
// factories below (and before the module under test is imported), so the mocks
// can safely reference these.
const { httpsCallableFactory, callableInvocation } = vi.hoisted(() => {
  const callableInvocation = vi.fn(async () => {
    throw new Error('The Firebase callable must not run in deterministic mode.')
  })
  return {
    httpsCallableFactory: vi.fn(() => callableInvocation),
    callableInvocation,
  }
})

vi.mock('firebase/functions', () => ({
  httpsCallable: httpsCallableFactory,
}))

// A truthy `functions` proves deterministic mode bypasses the callable even when
// Firebase Functions ARE configured (i.e. the bypass is not just the unconfigured
// fallback path).
vi.mock('../../lib/firebase', () => ({
  functions: { __configured: true },
}))

import {
  clearPracticePrefetch,
  generatePracticeQuestion,
} from './practiceApi'

describe('practiceApi deterministic generation mode', () => {
  beforeEach(() => {
    httpsCallableFactory.mockClear()
    callableInvocation.mockClear()
    clearPracticePrefetch()
  })

  it('returns a locally-graded instance without invoking the Firebase callable', async () => {
    const instance = await generatePracticeQuestion({
      userId: 'tester',
      skillId: 'weighted-average',
      difficulty: 2,
      generationMode: 'deterministic',
    })

    // (1) The deterministic generator populates a local answer key and marks the
    // problem as non-AI, so checkPracticeQuestionAnswer grades fully client-side.
    expect(Object.keys(instance.answerKey).length).toBeGreaterThan(0)
    expect(instance.problem.source).not.toBe('ai')

    // (2) The OpenAI-backed callable is never constructed or invoked.
    expect(httpsCallableFactory).not.toHaveBeenCalled()
    expect(callableInvocation).not.toHaveBeenCalled()
  })

  it('uses a fixed, reproducible seed so the same request yields the same problem', async () => {
    const first = await generatePracticeQuestion({
      userId: 'tester',
      skillId: 'weighted-average',
      difficulty: 2,
      generationMode: 'deterministic',
    })
    const second = await generatePracticeQuestion({
      userId: 'someone-else',
      skillId: 'weighted-average',
      difficulty: 2,
      generationMode: 'deterministic',
    })

    expect(second.problem.id).toBe(first.problem.id)
    expect(httpsCallableFactory).not.toHaveBeenCalled()
  })
})
