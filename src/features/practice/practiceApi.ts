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

/**
 * Which generator backs a practice question. `'ai'` (default) uses the
 * OpenAI-backed `generatePracticeQuestion` callable; `'deterministic'` bypasses
 * the callable entirely and builds the question locally for offline testing.
 */
export type PracticeGenerationMode = 'ai' | 'deterministic'

interface GeneratePracticeResponse {
  problem: GeneratedPracticeProblem
  answerKey?: GeneratedAnswerKey
  source?: GeneratedPracticeProblem['source']
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

function uniqueFallbackSeed(skillId: SkillId, difficulty: number): string {
  const randomId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  return `${skillId}-${difficulty}-${Date.now()}-${randomId}`
}

function localInstance(
  skillId: SkillId,
  difficulty: number,
  generationNote?: string,
  templateKind?: GeneratedTemplateKind,
): GeneratedPracticeInstance {
  const instance = createDeterministicPracticeInstance({
    skillId,
    difficulty,
    seed: uniqueFallbackSeed(skillId, difficulty),
    templateKind,
  })
  return generationNote ? { ...instance, generationNote } : instance
}

// The deterministic test mode must be reproducible, so it uses a fixed seed
// derived only from the request (no Date.now()/random), unlike the AI-failure
// fallback path which intentionally varies via uniqueFallbackSeed.
function deterministicTestInstance(
  skillId: SkillId,
  difficulty: number,
  templateKind: GeneratedTemplateKind,
): GeneratedPracticeInstance {
  const instance = createDeterministicPracticeInstance({
    skillId,
    difficulty,
    seed: `${skillId}-${difficulty}-${templateKind}-test`,
    templateKind,
  })
  return {
    ...instance,
    generationNote: 'AI generation disabled for testing - deterministic generator.',
  }
}

function errorCode(error: unknown): string | null {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: unknown }).code
    return typeof code === 'string' ? code : null
  }
  return null
}

function errorMessage(error: unknown): string | null {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    return typeof message === 'string' ? message : null
  }
  return null
}

function fallbackNote(reason: string): string {
  return `${reason} Using local deterministic fallback.`
}

// In-memory cache of in-flight generations so a user only ever waits once.
// Keyed by skill + difficulty + template kind + generation mode; entries are
// consumed (deleted) when served and dropped if their generation rejects. The
// mode is part of the key so a question prefetched under AI is never served
// after switching to deterministic mode (and vice-versa).
const prefetchCache = new Map<string, Promise<GeneratedPracticeInstance>>()

function prefetchKey(
  skillId: SkillId,
  difficulty: number,
  templateKind: GeneratedTemplateKind,
  generationMode: PracticeGenerationMode,
): string {
  return `${skillId}:${difficulty}:${templateKind}:${generationMode}`
}

/** Drop every queued prefetch, e.g. when the generation mode toggle changes. */
export function clearPracticePrefetch(): void {
  prefetchCache.clear()
}

async function runGeneration(args: {
  skillId: SkillId
  difficulty: number
  userId: string
  templateKind: GeneratedTemplateKind
  generationMode: PracticeGenerationMode
}): Promise<GeneratedPracticeInstance> {
  const { templateKind } = args

  // Deterministic test mode skips the OpenAI-backed callable entirely (even when
  // Firebase Functions are configured) and grades fully client-side.
  if (args.generationMode === 'deterministic') {
    return deterministicTestInstance(args.skillId, args.difficulty, templateKind)
  }

  if (!functions) {
    return localInstance(
      args.skillId,
      args.difficulty,
      fallbackNote('Firebase Functions is not configured.'),
      templateKind,
    )
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
      return localInstance(
        args.skillId,
        args.difficulty,
        fallbackNote('Practice generation returned an invalid problem.'),
        templateKind,
      )
    }
    const source = response.data.source ?? response.data.problem.source
    const instance = {
      problem: { ...response.data.problem, source },
      answerKey: response.data.answerKey ?? {},
    }
    const validationErrors = response.data.answerKey
      ? validateGeneratedPracticeInstance(instance)
      : []
    if (validationErrors.length > 0) {
      return localInstance(
        args.skillId,
        args.difficulty,
        fallbackNote(`Practice generation validation failed: ${validationErrors.join(' ')}`),
        templateKind,
      )
    }
    return instance
  } catch (error) {
    const code = errorCode(error)
    const message = errorMessage(error)
    const reason = code
      ? `Practice callable failed (${code}${message ? `: ${message}` : ''}).`
      : `Practice callable failed${message ? `: ${message}` : '.'}`
    console.warn(reason, error)
    return localInstance(args.skillId, args.difficulty, fallbackNote(reason), templateKind)
  }
}

export async function generatePracticeQuestion(args: {
  skillId: SkillId
  difficulty: number
  userId: string
  templateKind?: GeneratedTemplateKind
  generationMode?: PracticeGenerationMode
}): Promise<GeneratedPracticeInstance> {
  const templateKind = args.templateKind ?? templateForSkill(args.skillId)
  const generationMode = args.generationMode ?? 'ai'
  const key = prefetchKey(args.skillId, args.difficulty, templateKind, generationMode)

  const cached = prefetchCache.get(key)
  if (cached) {
    prefetchCache.delete(key)
    return await cached
  }

  return runGeneration({ ...args, templateKind, generationMode })
}

export function prefetchPracticeQuestion(args: {
  skillId: SkillId
  difficulty: number
  userId: string
  templateKind?: GeneratedTemplateKind
  generationMode?: PracticeGenerationMode
}): void {
  const templateKind = args.templateKind ?? templateForSkill(args.skillId)
  const generationMode = args.generationMode ?? 'ai'
  const key = prefetchKey(args.skillId, args.difficulty, templateKind, generationMode)
  if (prefetchCache.has(key)) {
    return
  }

  const pending = runGeneration({ ...args, templateKind, generationMode })
  prefetchCache.set(key, pending)
  // A rejected prefetch must not poison the cache: drop its key so a later real
  // generate retries, and swallow the rejection so prefetch never throws.
  pending.catch(() => {
    if (prefetchCache.get(key) === pending) {
      prefetchCache.delete(key)
    }
  })
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
