import type { ProblemDefinition } from '../../types/problem'

export const PROBLEM_8: ProblemDefinition = {
  problemId: 'problem-8',
  title: 'Same Expected Value, Different Risk',
  concept: 'EV does not describe the full experience of uncertainty.',
  difficulty: 8,
  scenarioText:
    'Game A gives guaranteed $5. Game B gives 50% chance of $10 and 50% chance of $0. Both have the same EV — but different risk.',
  visualType: 'risk-comparison',
  interactionType: 'simulate-and-compare',
  givenData: { trials: 20, gameA: 5, gameB: [10, 0] },
  requiredActions: ['simulate-both', 'ev-both', 'identify-risk', 'select-reason'],
  answerInputs: ['evA', 'evB', 'higherRisk', 'reason'],
  correctAnswers: { evA: 5, evB: 5, higherRisk: 'B', reason: 'variable-outcomes' },
  acceptedFormats: { ev: ['5', '5.0', '$5'], higherRisk: ['B', 'Game B', 'game-b'] },
  mistakeRules: [
    { mistakeType: 'b-higher-ev', feedback: 'Game B can pay $10, but its expected value is still $5 — same as Game A.' },
    { mistakeType: 'identical-games', feedback: 'Same EV does not mean identical experience. Game B has variable outcomes.' },
    { mistakeType: 'average-vs-guaranteed', feedback: 'Game A is guaranteed $5 every time. Game B jumps between $0 and $10.' },
  ],
  feedback: {
    correct:
      'Correct! Both have EV = $5, but Game B is riskier because outcomes vary even though the long-run average matches.',
  },
  hints: [
    { id: 'p8-h1', label: 'Run trials', content: 'Simulate 20 trials for each game and watch the graphs.' },
    { id: 'p8-h2', label: 'Flat vs jagged', content: 'Game A stays flat at $5. Game B jumps but averages to $5.' },
  ],
  completionRule: 'Run both simulations, submit EV for each, choose higher-risk game, and select correct reason.',
  masteryTags: ['same-ev-different-risk'],
}
