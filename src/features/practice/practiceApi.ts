import { auth } from '../../lib/firebase'
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

async function authHeaders(): Promise<HeadersInit> {
  const token = await auth?.currentUser?.getIdToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function postJson<TResponse>(url: string, body: unknown): Promise<TResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(await authHeaders()),
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Practice API request failed: ${response.status}`)
  }

  return (await response.json()) as TResponse
}

export async function generatePracticeQuestion(args: {
  skillId: SkillId
  difficulty: number
  userId: string
}): Promise<GeneratedPracticeInstance> {
  const templateKind: GeneratedTemplateKind = templateForSkill(args.skillId)

  try {
    const requestBody = {
      skillId: args.skillId,
      difficulty: args.difficulty,
      templateKind,
      clientUserId: args.userId,
    }
    const apiResponse = await postJson<GeneratePracticeResponse>(
      '/api/generatePracticeQuestion',
      requestBody,
    )
    if (!isGeneratedPracticeProblem(apiResponse.problem)) {
      return localInstance(args.skillId, args.difficulty)
    }
    const instance = {
      problem: apiResponse.problem,
      answerKey: apiResponse.answerKey ?? {},
    }
    const validationErrors = apiResponse.answerKey
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
  if (args.problem.source === 'ai' || !hasLocalAnswerKey) {
    try {
      const response = await postJson<CheckPracticeResponse>('/api/checkGeneratedAnswer', {
        clientUserId: args.userId,
        problemId: args.problem.id,
        submission: args.submission,
      })
      return response.result
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
