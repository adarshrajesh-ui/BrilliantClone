import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { defineSecret } from 'firebase-functions/params'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import {
  buildDeterministicFeedback,
  checkGeneratedAnswer as checkAnswer,
  computeGeneratedAnswerKey,
  createDeterministicPracticeInstance,
  validateGeneratedPracticeInstance,
  type GeneratedAnswerKey,
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

class OpenAiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly statusText: string,
    readonly responseBody: string,
  ) {
    super(`OpenAI request failed with ${status} ${statusText}`)
    this.name = 'OpenAiRequestError'
  }
}

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
  'card-hand-ev',
  'card-deck-ev',
  'dice-ev',
  'profession-payout',
  'fair-price-to-play',
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

function fallbackInstance(
  skillId: SkillId,
  difficulty: number,
  templateKind: GeneratedTemplateKind,
): GeneratedPracticeInstance {
  return createDeterministicPracticeInstance({
    skillId,
    difficulty,
    seed: `${skillId}-${difficulty}-${Date.now()}`,
    templateKind,
  })
}

function stripUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined),
  ) as Partial<T>
}

function aiResponseInstructions(args: {
  skillId: SkillId
  templateKind: GeneratedTemplateKind
  difficulty: 1 | 2 | 3 | 4 | 5
  variationSeed: string
}): Record<string, unknown> {
  return {
    task: 'Generate exactly one expected-value practice problem. Respond with a single JSON object only.',
    variationSeed: args.variationSeed,
    requiredTopLevelShape: {
      problem: {
        id: 'temporary string; server will replace it',
        schemaVersion: 'ev-practice-v1',
        templateKind: args.templateKind,
        skillIds: [args.skillId],
        difficulty: args.difficulty,
        title: 'short learner-facing title',
        scenarioText: 'brief concrete scenario',
        prompt: 'the question the learner answers',
        givenData:
          args.templateKind === 'card-hand-ev'
            ? {
                cards: [
                  { rank: '10', suit: 'spades' },
                  { rank: '4', suit: 'hearts' },
                  { rank: 'A', suit: 'clubs' },
                ],
              }
            : args.templateKind === 'dice-ev'
              ? { dice: { count: 2, sides: 6 } }
              : args.templateKind === 'card-deck-ev'
                ? {
                    outcomes: [
                      { label: 'Value 1 (Ace)', value: 1, probability: 0.0769 },
                      { label: 'Value 10 (10/J/Q/K)', value: 10, probability: 0.3077 },
                    ],
                  }
                : args.templateKind === 'profession-payout'
                  ? {
                      outcomes: [
                        { label: 'Big month', value: 10000, probability: 0.5 },
                        { label: 'Slow month', value: 5000, probability: 0.5 },
                      ],
                    }
                  : args.templateKind === 'compare-ev' || args.templateKind === 'same-ev-risk'
                    ? {
                        games: [
                          {
                            id: 'choice-a',
                            label: 'Choice A',
                            outcomes: [
                              { label: 'Win', value: 12, probability: 0.5 },
                              { label: 'Miss', value: 0, probability: 0.5 },
                            ],
                          },
                          {
                            id: 'choice-b',
                            label: 'Choice B',
                            outcomes: [{ label: 'Every play', value: 6, probability: 1 }],
                          },
                        ],
                      }
                    : args.templateKind === 'fair-price-to-play'
                      ? {
                          outcomes: [
                            { label: 'Win', value: 20, probability: 0.25 },
                            { label: 'Lose', value: 0, probability: 0.75 },
                          ],
                        }
                      : {
                          outcomes: [{ label: 'Outcome', value: 10, probability: 1 }],
                          cost: args.templateKind === 'weighted-average' ? undefined : 5,
                        },
        answerInputs:
          args.templateKind === 'card-hand-ev'
            ? ['expectedValue']
            : args.templateKind === 'compare-ev'
              ? ['bestChoice']
              : args.templateKind === 'same-ev-risk'
                ? ['riskChoice']
                : args.templateKind === 'fairness-classification'
                  ? ['classification']
                  : args.templateKind === 'payout-vs-profit'
                    ? ['expectedProfit']
                    : ['expectedValue'],
        hints: [
          {
            id: 'hint-1',
            label: 'Hint 1',
            content: 'a directional nudge that points at the right idea WITHOUT revealing the full method',
          },
          {
            id: 'hint-2',
            label: 'Hint 2',
            content: 'almost the full solution approach (the steps), but NOT the exact final number',
          },
        ],
        feedback: {
          note: 'Leave feedback empty or omit it; the server replaces it with deterministic concept summaries, worked solutions, and misconception-aware copy.',
        },
        constraints: { numericTolerance: 0.01 },
        source: 'ai',
      },
      answerKey: 'optional; server recomputes it from problem.givenData',
    },
    constraints: [
      'Return valid JSON only, with no markdown fences or prose.',
      'Use only simple finite numbers.',
      'Every outcomes array must have probabilities that sum to 1.',
      'Do not include fields whose value would be undefined.',
      'Return EXACTLY 2 entries in problem.hints. Hint 1 is a directional nudge that points at the right idea WITHOUT revealing the full method. Hint 2 gives almost the full solution approach (the steps) but stops short of stating the exact final number.',
      'Use the variationSeed value as a randomness key to produce a fresh, distinct scenario on every call: vary the names, numbers, framing, and context so that two calls never look alike. The example givenData shown above illustrates SHAPE ONLY - its specific numbers, labels, and values must NOT be reused; invent your own for every problem.',
      ...(args.templateKind === 'card-hand-ev'
        ? [
            'Provide between 2 and 9 cards in givenData.cards, and vary the hand size, the specific ranks, and the suits widely from call to call so hands rarely repeat.',
            'Use only ranks A,2,3,4,5,6,7,8,9,10,J,Q,K and suits spades, hearts, diamonds, clubs.',
            'Card value mapping: A=1, 2-10 numeric, J/Q/K=10.',
            'Vary the game framing each time (e.g. poker, blackjack, war, gin rummy, a magician\'s reveal, a casino demo), and ask for the expected value of one random card drawn from the hand.',
            'Scale difficulty: at low difficulty (1-2) use small hands (about 2-4 cards) with simpler values; at higher difficulty (3-5) use larger hands (up to 9 cards) that mix low cards, tens, and face cards so the average is less obvious.',
            'Do not include outcomes, games, or cost for this template.',
          ]
        : []),
      ...(args.templateKind === 'dice-ev'
        ? [
            'Set givenData.dice with an integer count from 1 to 6 and sides chosen from {4, 6, 8, 10, 12, 20}; vary BOTH the count and the number of sides from call to call.',
            'Vary the framing around a dice/board/tabletop/casino game (e.g. a board-game turn, a tabletop RPG roll, a casino dice game).',
            'Ask for the expected value of the SUM of the dice.',
            'Scale difficulty: at low difficulty (1-2) use few dice (1-2) with familiar 6-sided dice; at higher difficulty (3-5) use more dice and/or non-six-sided dice (4, 8, 10, 12, or 20 sides).',
            'Do not include outcomes, games, or cost.',
          ]
        : []),
      ...(args.templateKind === 'card-deck-ev'
        ? [
            'Represent the deck as givenData.outcomes mapping each card VALUE to its probability (count / deck size), with probabilities summing to 1.',
            'Vary the deck composition across problems: e.g. a standard 52-card deck, a red-cards-only deck, a deck with the face cards removed, a custom point-value deck, or a deck that includes jokers worth a stated value.',
            'ALWAYS fully describe the EXACT deck composition in scenarioText (which cards are present, their counts, and how each maps to a value, e.g. a standard 52-card deck with A=1, 2-10 at face value, J/Q/K=10), because the client renders no value table.',
            'Ask for the expected value of one card drawn from the face-down deck.',
            'Scale difficulty: at low difficulty (1-2) use a standard or lightly trimmed deck; at higher difficulty (3-5) use modified or custom decks (red-only, no face cards, custom point values, or jokers with a stated value).',
            'Do not include dice, games, or cost.',
          ]
        : []),
      ...(args.templateKind === 'profession-payout'
        ? [
            'Invent a specific, creative profession or business and a believable monthly payout scenario; vary the profession/business widely across problems.',
            'Vary the NUMBER of outcomes from 2 up to several (e.g. 2-5) from call to call.',
            'Phrase the question naturally and do NOT use the words "expected value" (e.g. "How much should they expect to make this month?").',
            'Use givenData.outcomes with payouts (value) and probabilities summing to 1.',
            'At low difficulty (1-2), use a few INDEPENDENT outcomes with simple probabilities.',
            'At higher difficulty (3-5), describe SEQUENTIAL or DEPENDENT events narratively in scenarioText whose probabilities multiply toward each final payout.',
            'Regardless of difficulty, givenData.outcomes must list the FINAL outcome probabilities already multiplied out so they sum to 1 (the EV is still sum(value * probability)).',
            'Do not include dice, games, or cost.',
          ]
        : []),
      ...(args.templateKind === 'weighted-average'
        ? [
            'Use givenData.outcomes (2-4 outcomes) with payouts and probabilities summing to 1, and do NOT include a cost, games, dice, or cards. Ask for the expected value (the expected payout).',
            'Vary the context (a prize bag, a vending wheel, a mystery box, a scratch card) and the numbers from call to call.',
            'Scale difficulty: at low difficulty (1-2) use 2 outcomes with round numbers and simple probabilities (halves, quarters); at higher difficulty (3-5) use 3-4 outcomes with less obvious probabilities (thirds, fifths).',
          ]
        : []),
      ...(args.templateKind === 'payout-vs-profit'
        ? [
            'Use givenData.outcomes (payouts + probabilities summing to 1) and a positive givenData.cost to play. Ask for the expected PROFIT (expected payout minus the cost).',
            'Vary the scenario, payouts, probabilities, and cost widely from call to call. Do not include games, dice, or cards.',
            'Scale difficulty: at low difficulty (1-2) use 2 outcomes and a round cost; at higher difficulty (3-5) use 3-4 outcomes and a cost that makes the profit less obvious.',
          ]
        : []),
      ...(args.templateKind === 'fairness-classification'
        ? [
            'Use givenData.outcomes (payouts + probabilities summing to 1) and a positive givenData.cost to play. Ask whether the game is fair, favorable, or unfavorable for the player.',
            'Across calls, deliberately vary which answer is correct: sometimes fair (expected payout equals cost), sometimes favorable (payout above cost), sometimes unfavorable (payout below cost).',
            'Vary the scenario, payouts, probabilities, and cost from call to call. Do not include games, dice, or cards.',
          ]
        : []),
      ...(args.templateKind === 'fair-price-to-play'
        ? [
            'Use givenData.outcomes (payouts + probabilities summing to 1) and DO NOT include a cost. Ask what price to play would make the game fair - the break-even price where expected profit is zero, which equals the expected payout.',
            'Vary the scenario (a raffle, a carnival wheel, an insurance premium, a vending machine), the payouts, and the probabilities from call to call.',
            'Scale difficulty: at low difficulty (1-2) use 2 outcomes with simple probabilities; at higher difficulty (3-5) use 3-4 outcomes with less obvious probabilities.',
            'Do not include games, dice, cards, or a cost.',
          ]
        : []),
      ...(args.templateKind === 'compare-ev'
        ? [
            'Provide EXACTLY 2 games in givenData.games, each with a unique id and outcomes whose probabilities sum to 1; the two games must have DIFFERENT expected values. Ask which game has the better expected value.',
            'Make it instructive: often give the losing game the bigger single top prize so the learner cannot just pick the largest payout.',
            'Vary the games, payouts, and probabilities from call to call. Do not include a cost, dice, or cards.',
          ]
        : []),
      ...(args.templateKind === 'same-ev-risk'
        ? [
            'Provide EXACTLY 2 games in givenData.games, each with a unique id and outcomes whose probabilities sum to 1; the two games must have the SAME expected value but different spreads. Ask which game is riskier.',
            'Confirm both games share the same expected value before responding, and make the riskier game the one with the wider gap between its best and worst outcome.',
            'Vary the games, payouts, and probabilities from call to call. Do not include a cost, dice, or cards.',
          ]
        : []),
    ],
  }
}

async function callOpenAi(args: {
  apiKey: string
  skillId: SkillId
  templateKind: GeneratedTemplateKind
  difficulty: 1 | 2 | 3 | 4 | 5
}): Promise<GeneratedPracticeInstance> {
  const variationSeed = crypto.randomUUID()
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${args.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      temperature: 0.9,
      messages: [
        {
          role: 'system',
          content:
            'You generate expected-value practice problems. Always respond with valid JSON only, matching the requested object shape.',
        },
        {
          role: 'user',
          content: JSON.stringify(
            aiResponseInstructions({
              skillId: args.skillId,
              templateKind: args.templateKind,
              difficulty: args.difficulty,
              variationSeed,
            }),
          ),
        },
      ],
      response_format: {
        type: 'json_object',
      },
    }),
  })

  if (!response.ok) {
    const responseBody = await response.text()
    throw new OpenAiRequestError(response.status, response.statusText, responseBody.slice(0, 500))
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
  // Never trust the model for the explanatory math: rebuild the concept summary,
  // worked solution source, and misconception rules deterministically.
  parsed.problem.feedback = buildDeterministicFeedback(parsed.problem)

  const errors = validateGeneratedPracticeInstance(parsed)
  if (errors.length > 0) {
    throw new Error(errors.join(' '))
  }

  return parsed
}

function describeGenerationError(error: unknown): Record<string, unknown> {
  if (error instanceof OpenAiRequestError) {
    return {
      name: error.name,
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      responseBody: error.responseBody,
    }
  }
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }
  return { error }
}

async function saveGeneratedInstance(userId: string, instance: GeneratedPracticeInstance): Promise<void> {
  const answerKey = stripUndefined(instance.answerKey) as GeneratedAnswerKey
  await db.collection('generatedPractice').doc(instance.problem.id).set({
    userId,
    problem: instance.problem,
    answerKey,
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
  { secrets: [OPENAI_API_KEY], cors: true, invoker: 'public' },
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
      try {
        instance = await callOpenAi({ apiKey, skillId, templateKind, difficulty })
      } catch (firstError) {
        console.warn('Retrying AI practice generation after first failure:', describeGenerationError(firstError))
        instance = await callOpenAi({ apiKey, skillId, templateKind, difficulty })
      }
    } catch (error) {
      console.warn('Falling back to deterministic practice generation:', describeGenerationError(error))
      instance = fallbackInstance(skillId, difficulty, templateKind)
    }

    await saveGeneratedInstance(userId, instance)
    return { problem: instance.problem, source: instance.problem.source }
  },
)

export const checkGeneratedAnswer = onCall({ cors: true, invoker: 'public' }, async (request) => {
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
