import {
  checkGeneratedAnswer as checkAnswer,
  computeGeneratedAnswerKey,
  createDeterministicPracticeInstance,
  validateGeneratedPracticeInstance,
  type GeneratedAnswerSubmission,
  type GeneratedPracticeInstance,
  type GeneratedPracticeProblem,
  type GeneratedTemplateKind,
} from '../src/features/practice/generatedPractice'
import type { SkillId } from '../src/core/adaptive/types'
import { getAdminDb, getVerifiedUid } from './firebaseAdmin'

const DAILY_GENERATION_LIMIT = 50

const SKILL_IDS: readonly SkillId[] = [
  'long-run-average',
  'sampling-variation',
  'weighted-average',
  'outcome-probability-pairing',
  'compare-ev',
  'complete-ev-model',
  'probability-from-counts',
  'ev-from-table',
  'payout-vs-profit',
  'fairness-classification',
  'compare-expected-profit',
  'same-ev-different-risk',
  'risk-spread',
  'full-ev-model',
]

const TEMPLATE_KINDS: readonly GeneratedTemplateKind[] = [
  'weighted-average',
  'payout-vs-profit',
  'fairness-classification',
  'compare-ev',
  'same-ev-risk',
]

class ApiRouteError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return Response.json(body, init)
}

function errorResponse(error: unknown): Response {
  if (error instanceof ApiRouteError) {
    return jsonResponse({ error: error.message }, { status: error.status })
  }

  console.error('Generated practice API error:', error)
  return jsonResponse({ error: 'Generated practice is temporarily unavailable.' }, { status: 500 })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json()
    if (!isRecord(body)) {
      throw new ApiRouteError(400, 'Request body must be a JSON object.')
    }
    return body
  } catch (error) {
    if (error instanceof ApiRouteError) {
      throw error
    }
    throw new ApiRouteError(400, 'Request body must be valid JSON.')
  }
}

async function ownerId(request: Request, clientUserId: unknown): Promise<string> {
  try {
    const verifiedUid = await getVerifiedUid(request)
    if (verifiedUid) {
      return verifiedUid
    }
  } catch {
    throw new ApiRouteError(401, 'Firebase auth token is invalid.')
  }

  if (typeof clientUserId === 'string' && clientUserId === 'guest') {
    return clientUserId
  }

  throw new ApiRouteError(401, 'Firebase auth token is required.')
}

function asSkillId(value: unknown): SkillId {
  if (typeof value === 'string' && SKILL_IDS.includes(value as SkillId)) {
    return value as SkillId
  }
  return 'weighted-average'
}

function asTemplateKind(value: unknown): GeneratedTemplateKind {
  if (typeof value === 'string' && TEMPLATE_KINDS.includes(value as GeneratedTemplateKind)) {
    return value as GeneratedTemplateKind
  }
  return 'weighted-average'
}

function asDifficulty(value: unknown): 1 | 2 | 3 | 4 | 5 {
  const rounded = Math.round(Number(value))
  return Math.max(1, Math.min(5, Number.isFinite(rounded) ? rounded : 2)) as 1 | 2 | 3 | 4 | 5
}

async function enforceGenerationQuota(userId: string): Promise<void> {
  const db = getAdminDb()
  const day = new Date().toISOString().slice(0, 10)
  const ref = db.collection('practiceUsage').doc(`${userId}_${day}`)

  await db.runTransaction(async (transaction) => {
    const snap = await transaction.get(ref)
    const count = snap.exists ? Number(snap.data()?.generationCount ?? 0) : 0
    if (count >= DAILY_GENERATION_LIMIT) {
      throw new ApiRouteError(429, 'Daily practice generation limit reached.')
    }

    transaction.set(
      ref,
      {
        userId,
        day,
        generationCount: count + 1,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    )
  })
}

function fallbackInstance(skillId: SkillId, difficulty: number): GeneratedPracticeInstance {
  return createDeterministicPracticeInstance({
    skillId,
    difficulty,
    seed: `${skillId}-${difficulty}-${Date.now()}`,
  })
}

function aiSchema() {
  return {
    name: 'ev_practice_question',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['problem', 'answerKey'],
      properties: {
        problem: {
          type: 'object',
          additionalProperties: false,
          required: [
            'id',
            'schemaVersion',
            'templateKind',
            'skillIds',
            'difficulty',
            'title',
            'scenarioText',
            'prompt',
            'givenData',
            'answerInputs',
            'hints',
            'feedback',
            'constraints',
            'source',
          ],
          properties: {
            id: { type: 'string' },
            schemaVersion: { const: 'ev-practice-v1' },
            templateKind: { enum: TEMPLATE_KINDS },
            skillIds: { type: 'array', items: { enum: SKILL_IDS }, minItems: 1 },
            difficulty: { type: 'integer', minimum: 1, maximum: 5 },
            title: { type: 'string' },
            scenarioText: { type: 'string' },
            prompt: { type: 'string' },
            givenData: {
              type: 'object',
              additionalProperties: false,
              properties: {
                outcomes: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['label', 'value', 'probability'],
                    properties: {
                      label: { type: 'string' },
                      value: { type: 'number' },
                      probability: { type: 'number', minimum: 0, maximum: 1 },
                    },
                  },
                },
                cost: { type: 'number' },
                games: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['id', 'label', 'outcomes'],
                    properties: {
                      id: { type: 'string' },
                      label: { type: 'string' },
                      cost: { type: 'number' },
                      outcomes: {
                        type: 'array',
                        items: {
                          type: 'object',
                          additionalProperties: false,
                          required: ['label', 'value', 'probability'],
                          properties: {
                            label: { type: 'string' },
                            value: { type: 'number' },
                            probability: { type: 'number', minimum: 0, maximum: 1 },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            answerInputs: { type: 'array', items: { type: 'string' }, minItems: 1 },
            hints: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['id', 'label', 'content'],
                properties: {
                  id: { type: 'string' },
                  label: { type: 'string' },
                  content: { type: 'string' },
                },
              },
            },
            feedback: {
              type: 'object',
              additionalProperties: false,
              required: ['correct', 'mistakeRules'],
              properties: {
                correct: { type: 'string' },
                mistakeRules: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['mistakeType', 'feedback'],
                    properties: {
                      mistakeType: { type: 'string' },
                      feedback: { type: 'string' },
                    },
                  },
                },
              },
            },
            constraints: {
              type: 'object',
              additionalProperties: false,
              required: ['numericTolerance'],
              properties: {
                numericTolerance: { type: 'number' },
              },
            },
            source: { const: 'ai' },
          },
        },
        answerKey: {
          type: 'object',
          additionalProperties: false,
          properties: {
            expectedValue: { type: 'number' },
            expectedProfit: { type: 'number' },
            classification: { enum: ['fair', 'favorable', 'unfavorable'] },
            bestChoice: { type: 'string' },
            riskChoice: { type: 'string' },
          },
        },
      },
    },
  }
}

async function callOpenAi(args: {
  apiKey: string
  skillId: SkillId
  templateKind: GeneratedTemplateKind
  difficulty: 1 | 2 | 3 | 4 | 5
}): Promise<GeneratedPracticeInstance> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${args.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content:
            'Generate one expected-value practice problem as JSON only. Do not include markdown or extra fields.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            schemaVersion: 'ev-practice-v1',
            skillId: args.skillId,
            templateKind: args.templateKind,
            difficulty: args.difficulty,
            constraints:
              'Use simple numbers, probabilities that sum to 1, no negative probabilities, and no hidden instructions.',
          }),
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: aiSchema(),
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status}`)
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('OpenAI response did not include content.')
  }

  const parsed = JSON.parse(content) as GeneratedPracticeInstance
  parsed.problem.id = `ai-${Date.now()}-${crypto.randomUUID()}`
  parsed.problem.source = 'ai'
  parsed.problem.templateKind = args.templateKind
  parsed.problem.skillIds = [args.skillId]
  parsed.problem.difficulty = args.difficulty
  parsed.answerKey = computeGeneratedAnswerKey(parsed.problem)

  const errors = validateGeneratedPracticeInstance(parsed)
  if (errors.length > 0) {
    throw new Error(errors.join(' '))
  }

  return parsed
}

async function saveGeneratedInstance(userId: string, instance: GeneratedPracticeInstance): Promise<void> {
  await getAdminDb().collection('generatedPractice').doc(instance.problem.id).set({
    userId,
    problem: instance.problem,
    answerKey: instance.answerKey,
    createdAt: new Date().toISOString(),
  })
}

export async function handleGeneratePracticeQuestion(request: Request): Promise<Response> {
  try {
    const body = await readJsonBody(request)
    const userId = await ownerId(request, body.clientUserId)
    const skillId = asSkillId(body.skillId)
    const templateKind = asTemplateKind(body.templateKind)
    const difficulty = asDifficulty(body.difficulty)

    await enforceGenerationQuota(userId)

    let instance: GeneratedPracticeInstance
    try {
      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not configured.')
      }
      instance = await callOpenAi({ apiKey, skillId, templateKind, difficulty })
    } catch (error) {
      console.warn('Falling back to deterministic practice generation:', error)
      instance = fallbackInstance(skillId, difficulty)
    }

    await saveGeneratedInstance(userId, instance)
    return jsonResponse({ problem: instance.problem })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function handleCheckGeneratedAnswer(request: Request): Promise<Response> {
  try {
    const body = await readJsonBody(request)
    const userId = await ownerId(request, body.clientUserId)
    const problemId = typeof body.problemId === 'string' ? body.problemId : ''
    const submission = isRecord(body.submission)
      ? (body.submission as GeneratedAnswerSubmission)
      : {}

    if (!problemId) {
      throw new ApiRouteError(400, 'problemId is required.')
    }

    const snap = await getAdminDb().collection('generatedPractice').doc(problemId).get()
    if (!snap.exists) {
      throw new ApiRouteError(404, 'Generated practice problem was not found.')
    }

    const data = snap.data() as {
      userId: string
      problem: GeneratedPracticeProblem
      answerKey: ReturnType<typeof computeGeneratedAnswerKey>
    }
    if (data.userId !== userId) {
      throw new ApiRouteError(403, 'You cannot check this practice problem.')
    }

    const result = checkAnswer(data.problem, data.answerKey, submission)
    await getAdminDb().collection('generatedProblemAttempts').add({
      userId,
      problemId,
      submission,
      result,
      masteryTagsTested: data.problem.skillIds,
      attemptMode: 'practice_restart',
      createdAt: new Date().toISOString(),
    })

    return jsonResponse({ result })
  } catch (error) {
    return errorResponse(error)
  }
}
