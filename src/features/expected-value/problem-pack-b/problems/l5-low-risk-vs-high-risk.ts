import type { PackProblemDefinition } from '../types'
import { problemPackBDemoConfigs } from '../demoConfigs'

// Problem 19 — Lesson 5, Problem 3.
export const L5_LOW_RISK_VS_HIGH_RISK: PackProblemDefinition = {
  problemId: 'l5-low-risk-vs-high-risk',
  canonicalSlug: 'l5-low-risk-vs-high-risk',
  storageId: 'l5-low-risk-vs-high-risk',
  lessonId: 'lesson-5',
  lessonIndex: 4,
  problemIndexWithinLesson: 2,
  globalProblemIndex: 18,
  title: 'Low-Risk vs High-Risk, Same EV',
  concept: 'Two games can share an EV while having different variability.',
  difficulty: 8,
  scenarioText:
    'Game A gives a guaranteed $6. Game B gives 50% chance of $12 and 50% chance of $0. Compare their EV and their risk.',
  visualType: 'risk-comparison',
  interactionType: 'simulate-and-compare',
  givenData: {
    trials: 20,
    gameA: [{ value: 6, probability: 1 }],
    gameB: [{ value: 12, probability: 0.5 }, { value: 0, probability: 0.5 }],
  },
  requiredActions: ['simulate-both', 'ev-both', 'identify-risk', 'select-reason'],
  answerInputs: ['evA', 'evB', 'higherRisk', 'reason'],
  correctAnswers: { evA: 6, evB: 6, higherRisk: 'B', reason: 'wider-spread' },
  acceptedFormats: {
    ev: ['6', '6.0', '$6', '12/2'],
    higherRisk: ['B', 'Game B', 'game-b'],
    reason: ['wider-spread', 'variable-outcomes', 'same-ev-different-risk'],
  },
  mistakeRules: [
    { mistakeType: 'b-higher-ev', feedback: 'Game B can pay $12, but its expected value is still $6 — same as Game A.' },
    { mistakeType: 'identical-games', feedback: 'Same EV does not mean identical risk. Game B has a wider spread of outcomes.' },
    { mistakeType: 'average-vs-guaranteed', feedback: 'Game A is a guaranteed $6 every time; its EV is $6.' },
  ],
  feedback: {
    correct: 'Correct! Both average $6, but Game B has a wider spread ($0 to $12), so it is riskier.',
  },
  hints: [
    { id: 'p19-h1', label: 'Guaranteed vs split', content: 'Game A is always $6; Game B is $12 or $0.' },
    { id: 'p19-h2', label: 'Run trials', content: 'Simulate all 20 trials for each and compare the graphs.' },
    { id: 'p19-h3', label: 'Wider range', content: 'Same average, but Game B ranges from $0 to $12 — that is more risk.' },
  ],
  completionRule: 'Run both simulations, submit EV for each, choose the riskier game, and explain the wider spread.',
  masteryTags: ['same-ev-different-risk', 'risk-spread'],
  demoConfig: problemPackBDemoConfigs['l5-low-risk-vs-high-risk'],
  currentTaskConfig: {
    intro: 'A guaranteed-$6 bar, a split $12/$0 bar, a trial simulator, and outcome/running-average graphs.',
    firstStep: 'Run the 20-trial simulation for Game A.',
    checklist: [
      { id: 'sim-a', label: 'Simulate Game A (20 trials)' },
      { id: 'sim-b', label: 'Simulate Game B (20 trials)' },
      { id: 'ev', label: 'Submit EV for each game' },
      { id: 'risk', label: 'Choose the riskier game and explain' },
    ],
  },
  animations: [
    { id: 'guaranteed-bar', describe: 'Game A\u2019s bar holds steady at $6.', reducedMotion: 'Steady bar drawn instantly.' },
    { id: 'split-bar', describe: 'Game B\u2019s outcomes alternate between $12 and $0.', reducedMotion: 'Split outcomes drawn instantly.' },
    { id: 'spread-band', describe: 'A band visualizes Game B\u2019s wider outcome spread around the same $6 average.', reducedMotion: 'Spread band shown immediately.' },
  ],
  checkerKey: 'l5-low-risk-vs-high-risk',
}
