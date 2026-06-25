import type { PackProblemDefinition } from '../types'
import { problemPackBDemoConfigs } from '../demoConfigs'

// Problem 18 — Lesson 5, Problem 2. ORIGINAL — storage ID preserved as problem-8.
export const L5_SAME_EV_DIFFERENT_RISK: PackProblemDefinition = {
  problemId: 'problem-8',
  canonicalSlug: 'l5-same-ev-different-risk',
  storageId: 'problem-8',
  legacyProblemId: 'problem-8',
  lessonId: 'lesson-5',
  lessonIndex: 4,
  problemIndexWithinLesson: 1,
  globalProblemIndex: 17,
  title: 'Same Expected Value, Different Risk',
  concept: 'Expected value does not describe the full experience of uncertainty.',
  difficulty: 8,
  scenarioText:
    'Game A gives a guaranteed $5. Game B gives 50% chance of $10 and 50% chance of $0. Both have the same EV — but different risk.',
  visualType: 'risk-comparison',
  interactionType: 'simulate-and-compare',
  givenData: {
    trials: 20,
    gameA: [{ value: 5, probability: 1 }],
    gameB: [{ value: 10, probability: 0.5 }, { value: 0, probability: 0.5 }],
  },
  requiredActions: ['simulate-both', 'ev-both', 'identify-risk', 'select-reason'],
  answerInputs: ['evA', 'evB', 'higherRisk', 'reason'],
  correctAnswers: { evA: 5, evB: 5, higherRisk: 'B', reason: 'variable-outcomes' },
  acceptedFormats: {
    ev: ['5', '5.0', '$5', '10/2'],
    higherRisk: ['B', 'Game B', 'game-b'],
    reason: ['variable-outcomes', 'more-spread', 'same-ev-different-risk'],
  },
  mistakeRules: [
    { mistakeType: 'b-higher-ev', feedback: 'Game B can pay $10, but its expected value is still $5 — same as Game A.' },
    { mistakeType: 'identical-games', feedback: 'Same EV does not mean identical experience. Game B has variable outcomes.' },
    { mistakeType: 'average-vs-guaranteed', feedback: 'Game A is a guaranteed $5 every time; its EV is $5.' },
  ],
  feedback: {
    correct: 'Correct! Both average $5, but Game B is riskier because its outcomes vary between $0 and $10.',
  },
  hints: [
    { id: 'p18-h1', label: 'Run trials', content: 'Simulate all 20 trials for each game and watch the graphs.' },
    { id: 'p18-h2', label: 'Flat vs jagged', content: 'Game A stays flat at $5; Game B jumps but averages to $5.' },
    { id: 'p18-h3', label: 'Risk = spread', content: 'Same average, but Game B\u2019s outcomes spread between $0 and $10.' },
  ],
  completionRule: 'Run both simulations, submit EV for each, choose the higher-risk game, and select the correct reason.',
  masteryTags: ['same-ev-different-risk'],
  demoConfig: problemPackBDemoConfigs['l5-same-ev-different-risk'],
  currentTaskConfig: {
    intro: 'Two game cards with outcome plots and running-average graphs.',
    firstStep: 'Run the 20-trial simulation for Game A.',
    checklist: [
      { id: 'sim-a', label: 'Simulate Game A (20 trials)' },
      { id: 'sim-b', label: 'Simulate Game B (20 trials)' },
      { id: 'ev', label: 'Submit EV for each game' },
      { id: 'risk', label: 'Choose the riskier game and reason' },
    ],
  },
  animations: [
    { id: 'flat-line', describe: 'Game A\u2019s outcome line stays flat at $5.', reducedMotion: 'Flat line drawn instantly.' },
    { id: 'jagged-line', describe: 'Game B\u2019s outcome line visibly jumps between $0 and $10.', reducedMotion: 'Jagged line drawn instantly.' },
    { id: 'converge', describe: 'Both running averages drift toward $5.', reducedMotion: 'Averages shown at final value.' },
  ],
  checkerKey: 'l5-same-ev-different-risk',
}
