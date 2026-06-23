import type { ProblemDefinition } from '../../types/problem'
import type { DemoStepConfig } from './types'

/**
 * Generic fallback demo content.
 *
 * Authoritative, problem-specific demo copy is owned by Agents 3/4 and supplied
 * via `demoConfig`. Until a problem pack ships that copy, the shell still needs
 * *something* to show on first visit. This builder derives a short, honest
 * orientation demo from fields the problem definition already exposes (title,
 * concept, scenario). It is intentionally generic and never invents math.
 */
export function buildFallbackDemoSteps(problem: {
  title: string
  concept: string
  scenarioText: string
}): DemoStepConfig[] {
  const steps: DemoStepConfig[] = [
    {
      id: 'fallback-what',
      title: 'What you are looking at',
      body: problem.scenarioText,
    },
    {
      id: 'fallback-idea',
      title: 'The idea to focus on',
      body: problem.concept,
    },
    {
      id: 'fallback-how',
      title: 'How to work through it',
      body: 'Follow the numbered checklist. Enter or tap your answer, then submit — you can correct a wrong answer in place without losing your other work.',
    },
  ]
  return steps
}

/** Convenience overload accepting a full problem definition. */
export function fallbackDemoFromProblem(problem: ProblemDefinition): DemoStepConfig[] {
  return buildFallbackDemoSteps(problem)
}
