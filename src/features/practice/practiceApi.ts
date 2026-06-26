import { httpsCallable } from 'firebase/functions'
import { functions } from '../../lib/firebase'
import type { CheckResult } from '../../types/problem'
import type { SkillId } from '../../core/adaptive/types'
import {
  checkGeneratedAnswer,
  createDeterministicPracticeInstance,
  templateForSkill,
  validateGeneratedPracticeInstance,
  type GeneratedAnswerKey,
  type GeneratedAnswerSubmission,
  type GeneratedPracticeInstance,
  type GeneratedPracticeProblem,
  type GeneratedTemplateKind,
} from './generatedPractice'

interface GeneratePracticeResponse {
  problem: GeneratedPracticeProblem
  answerKey?: GeneratedAnswerKey
}

interface CheckPracticeResponse {
  result: CheckResult
}

function isGeneratedPracticeProblem(value: unknown): value is GeneratedPracticeProblem {
  if (!value || typeof value !== 'object') {
    return false
  }
  const candidate = value as Partial<GeneratedPracticeProblem>
  return (
    candidate.schemaVersion === 'ev-practice-v1' &&
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    Array.isArray(candidate.answerInputs)
  )
}

function localInstance(skillId: SkillId, difficulty: number): GeneratedPracticeInstance {
  return createDeterministicPracticeInstance({
    skillId,
    difficulty,
    seed: `${skillId}-${difficulty}-${new Date().toISOString().slice(0, 10)}`,
  })
}

export async function generatePracticeQuestion(args: {
  skillId: SkillId
  difficulty: number
  userId: string
}): Promise<GeneratedPracticeInstance> {
  const templateKind: GeneratedTemplateKind = templateForSkill(args.skillId)

  if (!functions) {
    return localInstance(args.skillId, args.difficulty)
  }

  try {
    const callable = httpsCallable<
      {
        skillId: SkillId
        difficulty: number
        templateKind: GeneratedTemplateKind
      },
      GeneratePracticeResponse
    >(functions, 'generatePracticeQuestion')
    const response = await callable({
      skillId: args.skillId,
      difficulty: args.difficulty,
      templateKind,
    })
    if (!isGeneratedPracticeProblem(response.data.problem)) {
      return localInstance(args.skillId, args.difficulty)
    }
    const instance = {
      problem: response.data.problem,
      answerKey: response.data.answerKey ?? {},
    }
    const validationErrors = response.data.answerKey
      ? validateGeneratedPracticeInstance(instance)
      : []
    if (validationErrors.length > 0) {
      return localInstance(args.skillId, args.difficulty)
    }
    return instance
  } catch {
    return localInstance(args.skillId, args.difficulty)
  }
}

export async function checkPracticeQuestionAnswer(args: {
  userId: string
  problem: GeneratedPracticeProblem
  answerKey: GeneratedAnswerKey
  submission: GeneratedAnswerSubmission
}): Promise<CheckResult> {
  const hasLocalAnswerKey = Object.keys(args.answerKey).length > 0
  if ((args.problem.source === 'ai' || !hasLocalAnswerKey) && functions) {
    try {
      const callable = httpsCallable<
        {
          problemId: string
          submission: GeneratedAnswerSubmission
        },
        CheckPracticeResponse
      >(functions, 'checkGeneratedAnswer')
      const response = await callable({
        problemId: args.problem.id,
        submission: args.submission,
      })
      return response.data.result
    } catch {
      // Fall through only when a deterministic local fallback has an answer key.
    }
  }

  if (!hasLocalAnswerKey) {
    return {
      isCorrect: false,
      mistakeType: '',
      feedback: 'The practice checker is temporarily unavailable. Try again in a moment.',
      canComplete: false,
    }
  }

  return checkGeneratedAnswer(args.problem, args.answerKey, args.submission)
}
