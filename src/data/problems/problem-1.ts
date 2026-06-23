import type { ProblemDefinition } from '../../types/problem'

export const PROBLEM_1: ProblemDefinition = {
  problemId: 'problem-1',
  title: 'The Long-Run Average',
  concept: 'EV is the average outcome over many repetitions.',
  difficulty: 1,
  scenarioText:
    'Bob plays a spinner game with two equal sections: win $10 or win $0. Before running many spins, predict the long-run average. Then spin to see what happens over time.',
  visualType: 'spinner',
  interactionType: 'simulate-and-predict',
  masteryTags: ['long-run-average'],
}
