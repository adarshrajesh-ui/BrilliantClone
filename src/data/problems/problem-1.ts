import type { ProblemDefinition } from '../../types/problem'

export const PROBLEM_1: ProblemDefinition = {
  problemId: 'problem-1',
  title: 'The Long-Run Average',
  concept: 'EV is the average outcome over many repetitions.',
  difficulty: 1,
  scenarioText:
    'Bob plays a spinner game with two equal sections: win $10 or win $0. Before running many spins, predict the long-run average.',
  visualType: 'spinner',
  interactionType: 'simulate-and-predict',
  givenData: { outcomes: [10, 0], probabilities: [0.5, 0.5], minSpins: 100 },
  requiredActions: ['submit-prediction', 'spin-100', 'identify-average'],
  answerInputs: ['prediction', 'finalAnswer'],
  correctAnswers: { finalAnswer: 5 },
  acceptedFormats: { finalAnswer: ['0', '5', '10', '$0', '$5', '$10'] },
  mistakeRules: [
    { mistakeType: 'chose-extreme-outcome', feedback: 'The long-run average is not one of the individual outcomes. It is what you expect per spin over many tries — halfway between $10 and $0.' },
    { mistakeType: 'confused-single-spin', feedback: 'One or a few spins show a single outcome, not the long-run average. Keep spinning to see the pattern.' },
  ],
  feedback: {
    correct: 'Correct! With an equal chance of $10 and $0, the long-run average is halfway between them — $5 per spin.',
  },
  hints: [
    { id: 'p1-h1', label: 'Think halfway', content: 'If two outcomes are equally likely, the long-run average sits halfway between them.' },
    { id: 'p1-h2', label: 'Many spins', content: 'Run at least 100 spins. The running average line should settle near one value.' },
  ],
  completionRule: 'Submit prediction, run at least 100 total spins, and identify $5 as the long-run average.',
  masteryTags: ['long-run-average'],
}
