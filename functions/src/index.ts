import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { defineSecret } from 'firebase-functions/params'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import {
  checkGeneratedAnswer as checkAnswer,
  computeGeneratedAnswerKey,
  createDeterministicPracticeInstance,
  validateGeneratedPracticeInstance,
  type GeneratedAnswerSubmission,
  type GeneratedPracticeInstance,
  type GeneratedPracticeProblem,
  type GeneratedTemplateKind,
} from './generatedPractice.js'
import type { SkillId } from './types.js'

initializeApp()

const db = getFirestore()
const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY')
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
  const day = new Date().toISOString().slice(0, 10)
  const ref = db.collection('practiceUsage').doc(`${userId}_${day}`)

  await db.runTransaction(async (transaction) => {
    const snap = await transaction.get(ref)
    const count = snap.exists ? Number(snap.data()?.generationCount ?? 0) : 0
    if (count >= DAILY_GENERATION_LIMIT) {
      throw new HttpsError('resource-exhausted', 'Daily practice generation limit reached.')
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
  await db.collection('generatedPractice').doc(instance.problem.id).set({
    userId,
    problem: instance.problem,
    answerKey: instance.answerKey,
    createdAt: new Date().toISOString(),
  })
}

function requireUserId(uid: string | undefined): string {
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Sign in to use AI practice generation.')
  }
  return uid
}

export const generatePracticeQuestion = onCall(
  { secrets: [OPENAI_API_KEY], cors: true },
  async (request) => {
    const userId = requireUserId(request.auth?.uid)
    const data = (request.data ?? {}) as Record<string, unknown>
    const skillId = asSkillId(data.skillId)
    const templateKind = asTemplateKind(data.templateKind)
    const difficulty = asDifficulty(data.difficulty)

    await enforceGenerationQuota(userId)

    let instance: GeneratedPracticeInstance
    try {
      const apiKey = OPENAI_API_KEY.value()
      instance = await callOpenAi({ apiKey, skillId, templateKind, difficulty })
    } catch (error) {
      console.warn('Falling back to deterministic practice generation:', error)
      instance = fallbackInstance(skillId, difficulty)
    }

    await saveGeneratedInstance(userId, instance)
    return { problem: instance.problem }
  },
)

export const checkGeneratedAnswer = onCall({ cors: true }, async (request) => {
  const userId = requireUserId(request.auth?.uid)
  const data = (request.data ?? {}) as Record<string, unknown>
  const problemId = typeof data.problemId === 'string' ? data.problemId : ''
  const submission =
    data.submission && typeof data.submission === 'object' && !Array.isArray(data.submission)
      ? (data.submission as GeneratedAnswerSubmission)
      : {}

  if (!problemId) {
    throw new HttpsError('invalid-argument', 'problemId is required.')
  }

  const snap = await db.collection('generatedPractice').doc(problemId).get()
  if (!snap.exists) {
    throw new HttpsError('not-found', 'Generated practice problem was not found.')
  }

  const stored = snap.data() as {
    userId: string
    problem: GeneratedPracticeProblem
    answerKey: ReturnType<typeof computeGeneratedAnswerKey>
  }
  if (stored.userId !== userId) {
    throw new HttpsError('permission-denied', 'You cannot check this practice problem.')
  }

  const result = checkAnswer(stored.problem, stored.answerKey, submission)
  await db.collection('generatedProblemAttempts').add({
    userId,
    problemId,
    submission,
    result,
    masteryTagsTested: stored.problem.skillIds,
    attemptMode: 'practice_restart',
    createdAt: new Date().toISOString(),
  })

  return { result }
})
