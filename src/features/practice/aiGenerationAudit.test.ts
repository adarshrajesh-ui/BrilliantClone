// ============================================================================
// PRACTICE MODE GENERATION AUDIT
// ----------------------------------------------------------------------------
// These tests EMPIRICALLY characterize the Practice Mode question generator that
// is actually reachable from the client/test environment. The question under
// investigation is blunt: is Practice Mode generation AI-powered, or is it a
// deterministic / templated machine?
//
// What we can invoke without a network or a real backend:
//   - createDeterministicPracticeInstance(...)  (the local generator)
//   - generatePracticeQuestion(...)             (the client API; calls a Firebase
//                                                callable in 'ai' mode, or the
//                                                local generator in 'deterministic'
//                                                mode / when Functions are absent)
//
// The only "AI" anywhere in this codebase is a server-side OpenAI HTTP call
// inside functions/src/index.ts (gpt-4o-mini, temperature 0.9). It is NOT
// reachable from the client; the client merely invokes a Firebase callable, and
// even the server discards the model's math (answer key + feedback + difficulty
// + templateKind are all recomputed deterministically). The tests below prove,
// with evidence, that everything we can run is a pure template engine.
// ============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// --- Mock the Firebase callable surface so we can detect any model/backend call.
// httpsCallable returning a callable that throws simulates the AI path failing,
// which forces the client to reveal its true local behavior.
const { httpsCallableFactory, callableInvocation } = vi.hoisted(() => {
  const callableInvocation = vi.fn(async () => {
    throw new Error('callable backend is unavailable in the audit environment')
  })
  return {
    httpsCallableFactory: vi.fn(() => callableInvocation),
    callableInvocation,
  }
})

vi.mock('firebase/functions', () => ({
  httpsCallable: httpsCallableFactory,
}))

// Functions is truthy so we prove behavior even when a backend IS "configured".
vi.mock('../../lib/firebase', () => ({
  functions: { __configured: true },
}))

import {
  createDeterministicPracticeInstance,
  validateGeneratedPracticeInstance,
  type GeneratedPracticeProblem,
  type GeneratedTemplateKind,
} from './generatedPractice'
import {
  clearPracticePrefetch,
  generatePracticeQuestion,
} from './practiceApi'
import { buildPracticeBody, practiceComplexityScore } from './difficultyMatrix'
import { PRACTICE_THEMES } from './practiceThemes'
import { formatProbability } from './formatProbability'
import { RANKS, SUITS } from '../../data/cards'
import type { SkillId } from '../../core/adaptive/types'

const ALL_TEMPLATES: GeneratedTemplateKind[] = [
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

const DIFFICULTIES = [1, 2, 3, 4, 5] as const
const SKILL: SkillId = 'weighted-average'

function gen(templateKind: GeneratedTemplateKind, difficulty: number, seed: string) {
  return createDeterministicPracticeInstance({ skillId: SKILL, difficulty, seed, templateKind })
}

/** A full-problem fingerprint that ignores the per-seed id (`local-<seed>`). */
function fingerprint(problem: GeneratedPracticeProblem): string {
  const { id: _id, ...rest } = problem
  return JSON.stringify(rest)
}

/** N reproducible seed strings. */
function seeds(n: number): string[] {
  return Array.from({ length: n }, (_unused, i) => `audit-seed-${i}`)
}

// A spy on global fetch: if the generator were calling an LLM HTTP endpoint
// (OpenAI etc.) from the client, this would be hit.
let fetchSpy: ReturnType<typeof vi.fn>

beforeEach(() => {
  fetchSpy = vi.fn(async () => {
    throw new Error('network is forbidden during the generation audit')
  })
  vi.stubGlobal('fetch', fetchSpy)
  httpsCallableFactory.mockClear()
  callableInvocation.mockClear()
  clearPracticePrefetch()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ============================================================================
// A. DETERMINISM — the single loudest signal. A real LLM (temperature 0.9) is
//    non-deterministic; a template engine returns byte-identical output for the
//    same input. The generator here is fully deterministic.
// ============================================================================
describe('A. DETERMINISM: the generator is a pure function of its input (NOT an LLM)', () => {
  it('is DETERMINISTIC: same seed + template + difficulty yields byte-identical output', () => {
    for (const templateKind of ALL_TEMPLATES) {
      for (const difficulty of DIFFICULTIES) {
        const a = gen(templateKind, difficulty, 'repeat-seed')
        const b = gen(templateKind, difficulty, 'repeat-seed')
        // Deep equality including the id, the answer key, and all generated text.
        expect(b).toEqual(a)
        expect(JSON.stringify(b)).toBe(JSON.stringify(a))
      }
    }
  })

  it('is DETERMINISTIC across 25 repeated calls (zero variance, unlike a sampled model)', () => {
    const reference = fingerprint(gen('weighted-average', 3, 'stability').problem)
    for (let i = 0; i < 25; i += 1) {
      expect(fingerprint(gen('weighted-average', 3, 'stability').problem)).toBe(reference)
    }
  })

  it('is DETERMINISTIC: the generated answer key is reproducible to the bit', () => {
    for (const templateKind of ALL_TEMPLATES) {
      const a = gen(templateKind, 4, 'answerkey-seed').answerKey
      const b = gen(templateKind, 4, 'answerkey-seed').answerKey
      expect(b).toEqual(a)
    }
  })

  it('is SEED-PURE: output depends ONLY on the seed string, not on time/randomness', () => {
    // Two calls separated by real time + Math.random churn must be identical.
    const first = fingerprint(gen('dice-ev', 5, 'time-invariance').problem)
    for (let i = 0; i < 1000; i += 1) Math.random()
    const later = fingerprint(gen('dice-ev', 5, 'time-invariance').problem)
    expect(later).toBe(first)
  })

  it('changing only the seed CAN change output, but stays a deterministic mapping', () => {
    // Different seeds may map to different (still finite) template instances, and
    // each seed remains a stable key — the hallmark of seeded templating.
    const x1 = fingerprint(gen('weighted-average', 1, 'seed-X').problem)
    const x2 = fingerprint(gen('weighted-average', 1, 'seed-X').problem)
    const y1 = fingerprint(gen('weighted-average', 1, 'seed-Y').problem)
    expect(x1).toBe(x2)
    // Re-deriving Y after X proves no hidden global state leaks between calls.
    expect(fingerprint(gen('weighted-average', 1, 'seed-Y').problem)).toBe(y1)
  })
})

// ============================================================================
// B. NO MODEL / NO NETWORK — a template engine talks to nobody. We assert that
//    neither global fetch nor the Firebase callable is touched when generating.
// ============================================================================
describe('B. NO MODEL CALL: generation contacts no LLM and no backend', () => {
  it('makes ZERO network calls while generating hundreds of problems locally', () => {
    for (const templateKind of ALL_TEMPLATES) {
      for (const difficulty of DIFFICULTIES) {
        for (const seed of seeds(4)) {
          gen(templateKind, difficulty, seed)
        }
      }
    }
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('NEVER constructs or invokes the Firebase callable in deterministic mode', async () => {
    const instance = await generatePracticeQuestion({
      userId: 'auditor',
      skillId: 'weighted-average',
      difficulty: 3,
      generationMode: 'deterministic',
    })
    expect(instance.problem.source).not.toBe('ai')
    expect(httpsCallableFactory).not.toHaveBeenCalled()
    expect(callableInvocation).not.toHaveBeenCalled()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('the CLIENT itself makes no model call: even AI mode only delegates to a callable, then falls back deterministically', async () => {
    // In 'ai' mode the client invokes the Firebase callable (our mock throws,
    // simulating no backend). The client then falls back to the LOCAL template
    // engine. Crucially, the client never calls an LLM HTTP endpoint itself.
    const instance = await generatePracticeQuestion({
      userId: 'auditor',
      skillId: 'weighted-average',
      difficulty: 3,
      generationMode: 'ai',
    })
    // The callable was attempted (that is the only "AI" hook on the client)...
    expect(httpsCallableFactory).toHaveBeenCalled()
    expect(callableInvocation).toHaveBeenCalled()
    // ...but the client made no direct model/network call of its own...
    expect(fetchSpy).not.toHaveBeenCalled()
    // ...and what the user actually receives is a deterministic template instance.
    expect(instance.problem.source).toBe('deterministic-fallback')
    expect(instance.problem.id.startsWith('local-')).toBe(true)
  })
})

// ============================================================================
// C. FINITE, ENUMERABLE PARAMETER SPACE — a template engine can only emit a
//    small, countable set of distinct problems per (template, difficulty). An
//    LLM at temperature 0.9 would produce effectively unbounded variety.
// ============================================================================
describe('C. FINITE OUTPUT SPACE: the generator enumerates a tiny, countable set (signature of templating)', () => {
  it('collapses 5,000 random seeds into a SMALL finite set of distinct problems per template/difficulty', () => {
    for (const templateKind of ALL_TEMPLATES) {
      for (const difficulty of DIFFICULTIES) {
        const distinct = new Set<string>()
        for (let i = 0; i < 5000; i += 1) {
          distinct.add(fingerprint(gen(templateKind, difficulty, `space-${i}`).problem))
        }
        // 5000 inputs but only a handful of outputs: this is a lookup table,
        // not a generative model. (Comparison templates are fully fixed → 1.)
        expect(distinct.size).toBeGreaterThanOrEqual(1)
        expect(
          distinct.size,
          `${templateKind} d${difficulty} produced ${distinct.size} distinct problems from 5000 seeds`,
        ).toBeLessThanOrEqual(64)
      }
    }
  })

  it('compare-ev and same-ev-risk are 100% FIXED: difficulty alone decides them, seed is ignored', () => {
    for (const templateKind of ['compare-ev', 'same-ev-risk'] as const) {
      for (const difficulty of DIFFICULTIES) {
        const distinct = new Set<string>()
        for (let i = 0; i < 500; i += 1) {
          distinct.add(fingerprint(gen(templateKind, difficulty, `fixed-${i}`).problem))
        }
        expect(distinct.size).toBe(1)
      }
    }
  })

  it('dice parameters come ONLY from a hard-coded matrix (count 1-6, sides in {4,6,8,10,12,20})', () => {
    const allowedSides = new Set([4, 6, 8, 10, 12, 20])
    const combos = new Set<string>()
    for (const difficulty of DIFFICULTIES) {
      for (let i = 0; i < 1000; i += 1) {
        const dice = gen('dice-ev', difficulty, `dice-${i}`).problem.givenData.dice
        expect(dice).toBeDefined()
        expect(Number.isInteger(dice!.count)).toBe(true)
        expect(dice!.count).toBeGreaterThanOrEqual(1)
        expect(dice!.count).toBeLessThanOrEqual(6)
        expect(allowedSides.has(dice!.sides)).toBe(true)
        combos.add(`${dice!.count}x${dice!.sides}`)
      }
    }
    // Across ALL difficulties and 5000 seeds, only a tiny enumerable set exists.
    expect(combos.size).toBeLessThanOrEqual(12)
  })

  it('card hands draw ONLY from a fixed per-difficulty rank pool with a fixed hand size', () => {
    const sizeByDifficulty: Record<number, number> = { 1: 3, 2: 4, 3: 5, 4: 6, 5: 8 }
    for (const difficulty of DIFFICULTIES) {
      const handSizes = new Set<number>()
      for (let i = 0; i < 1000; i += 1) {
        const cards = gen('card-hand-ev', difficulty, `hand-${i}`).problem.givenData.cards ?? []
        handSizes.add(cards.length)
        for (const card of cards) {
          expect(RANKS.includes(card.rank)).toBe(true)
          expect(SUITS.includes(card.suit)).toBe(true)
        }
      }
      // Hand size is hard-coded per difficulty — it never varies with the seed.
      expect([...handSizes]).toEqual([sizeByDifficulty[difficulty]])
    }
  })

  it('prize values come from a closed-form ladder (prizeLow in 1..4, step in 3..5): at most 12 ladders', () => {
    const ladders = new Set<string>()
    for (let i = 0; i < 5000; i += 1) {
      const outcomes = gen('weighted-average', 5, `ladder-${i}`).problem.givenData.outcomes ?? []
      ladders.add(outcomes.map((o) => o.value).join(','))
    }
    // 4 possible lows x 3 possible steps = at most 12 distinct value ladders.
    expect(ladders.size).toBeLessThanOrEqual(12)
  })
})

// ============================================================================
// D. FIXED STRING TEMPLATES WITH SUBSTITUTED NUMBERS — the text is assembled
//    from hard-coded sentences with numbers slotted in, not written by a model.
// ============================================================================
describe('D. FIXED TEMPLATES: problem text is hard-coded sentences with numbers slotted in (NOT AI prose)', () => {
  it('every PROMPT is invariant to the seed (one fixed string per template/difficulty)', () => {
    for (const templateKind of ALL_TEMPLATES) {
      for (const difficulty of DIFFICULTIES) {
        const prompts = new Set<string>()
        for (let i = 0; i < 300; i += 1) {
          prompts.add(gen(templateKind, difficulty, `prompt-${i}`).problem.prompt)
        }
        expect(prompts.size).toBe(1)
      }
    }
  })

  it('every TITLE is invariant to the seed and is a hard-coded "Practice ..." label', () => {
    const allTitles = new Set<string>()
    for (const templateKind of ALL_TEMPLATES) {
      for (const difficulty of DIFFICULTIES) {
        const titles = new Set<string>()
        for (let i = 0; i < 200; i += 1) {
          const title = gen(templateKind, difficulty, `title-${i}`).problem.title
          titles.add(title)
          allTitles.add(title)
        }
        expect(titles.size).toBe(1)
      }
    }
    // The entire universe of titles is a short hand-authored list.
    expect(allTitles.size).toBeLessThanOrEqual(20)
    for (const title of allTitles) {
      expect(title.startsWith('Practice ')).toBe(true)
    }
  })

  it('the card-hand prompt is literally one constant string for thousands of seeds', () => {
    const constant = 'What is the expected value of one random card drawn from this hand?'
    for (let i = 0; i < 2000; i += 1) {
      expect(gen('card-hand-ev', 3, `cardprompt-${i}`).problem.prompt).toBe(constant)
    }
  })

  it('the dice scenario is a fill-in-the-blank template: "You roll N fair S-sided die/dice."', () => {
    const diceSentence = /^You roll \d+ fair \d+-sided (die|dice)\.$/
    for (const difficulty of DIFFICULTIES) {
      for (let i = 0; i < 300; i += 1) {
        const text = gen('dice-ev', difficulty, `dicetext-${i}`).problem.scenarioText
        expect(text).toMatch(diceSentence)
      }
    }
  })

  it('feedback (correct line + concept summary + mistake rules) is drawn from fixed dictionaries', () => {
    // The concept summary is never the prompt and collapses to a tiny finite set
    // across seeds — it is canned copy (a fill-in template for dice that slots in
    // the die size), not freely generated explanation. The "correct" line is a
    // single hard-coded constant per template.
    for (const templateKind of ALL_TEMPLATES) {
      const summaries = new Set<string>()
      const correctLines = new Set<string>()
      for (let i = 0; i < 200; i += 1) {
        const { problem } = gen(templateKind, 3, `feedback-${i}`)
        summaries.add(problem.feedback.conceptSummary)
        correctLines.add(problem.feedback.correct)
        expect(problem.feedback.conceptSummary).not.toBe(problem.prompt)
        expect(problem.feedback.mistakeRules.length).toBeGreaterThan(0)
      }
      // 200 seeds -> at most a couple of templated summaries (dice slots in sides).
      expect(summaries.size).toBeLessThanOrEqual(4)
      // The correct-answer line is a single constant string per template.
      expect(correctLines.size).toBe(1)
    }
  })

  it('hint copy is a fixed pair of strings per template/difficulty (canned, not generated)', () => {
    for (const templateKind of ALL_TEMPLATES) {
      const hintBlobs = new Set<string>()
      for (let i = 0; i < 200; i += 1) {
        const hints = gen(templateKind, 2, `hints-${i}`).problem.hints
        expect(hints.length).toBe(2)
        hintBlobs.add(hints.map((h) => h.content).join('||'))
      }
      expect(hintBlobs.size).toBe(1)
    }
  })
})

// ============================================================================
// E. STRUCTURAL CONSISTENCY — templated output is rigidly well-formed every
//    time. (An LLM needs server-side validation precisely because it is not.)
// ============================================================================
describe('E. RIGID STRUCTURE: every generated instance is perfectly well-formed (no validation needed)', () => {
  it('produces a valid instance for every template x difficulty x many seeds', () => {
    for (const templateKind of ALL_TEMPLATES) {
      for (const difficulty of DIFFICULTIES) {
        for (const seed of seeds(20)) {
          const instance = gen(templateKind, difficulty, seed)
          expect(instance.problem.difficulty).toBe(difficulty)
          expect(instance.problem.schemaVersion).toBe('ev-practice-v1')
          expect(validateGeneratedPracticeInstance(instance)).toEqual([])
        }
      }
    }
  })

  it('answerInputs are hard-wired per template (not chosen by a model)', () => {
    const expected: Record<GeneratedTemplateKind, string[]> = {
      'weighted-average': ['expectedValue'],
      'payout-vs-profit': ['expectedProfit'],
      'fairness-classification': ['classification'],
      'compare-ev': ['bestChoice'],
      'same-ev-risk': ['riskChoice'],
      'card-hand-ev': ['expectedValue'],
      'card-deck-ev': ['expectedValue'],
      'dice-ev': ['expectedValue'],
      'profession-payout': ['expectedValue'],
      'fair-price-to-play': ['expectedValue'],
    }
    for (const templateKind of ALL_TEMPLATES) {
      for (let i = 0; i < 50; i += 1) {
        expect(gen(templateKind, 3, `inputs-${i}`).problem.answerInputs).toEqual(
          expected[templateKind],
        )
      }
    }
  })

  it('always self-labels source as "deterministic-fallback" and ids itself "local-<seed>"', () => {
    for (const templateKind of ALL_TEMPLATES) {
      const instance = gen(templateKind, 3, 'source-label')
      expect(instance.problem.source).toBe('deterministic-fallback')
      expect(instance.problem.id).toBe('local-source-label')
    }
  })

  it('difficulty scaling is a deterministic step function (monotonic complexity), not model-judged', () => {
    for (const templateKind of ALL_TEMPLATES) {
      const scores = DIFFICULTIES.map((d) =>
        practiceComplexityScore(templateKind, gen(templateKind, d, 'scale').problem.givenData),
      )
      for (let i = 1; i < scores.length; i += 1) {
        expect(scores[i]).toBeGreaterThan(scores[i - 1])
      }
    }
  })
})

// ============================================================================
// F. THE BUILDERS ARE PURE — buildPracticeBody, formatProbability and the theme
//    table are all hand-authored, side-effect-free data. No inference anywhere.
// ============================================================================
describe('F. PURE BUILDERS: the underlying generators are hand-authored pure functions', () => {
  it('buildPracticeBody is a pure function: identical (kind, difficulty, n, n2) -> identical body', () => {
    for (const templateKind of ALL_TEMPLATES) {
      for (const difficulty of DIFFICULTIES) {
        const a = buildPracticeBody(templateKind, difficulty, 12345, 67890)
        const b = buildPracticeBody(templateKind, difficulty, 12345, 67890)
        expect(JSON.stringify(b)).toBe(JSON.stringify(a))
      }
    }
  })

  it('formatProbability is a deterministic lookup (no model, no randomness)', () => {
    const cases: Array<[number, string]> = [
      [0.5, '1/2'],
      [1 / 3, '1/3'],
      [2 / 3, '2/3'],
      [1 / 6, '1/6'],
      [0.25, '1/4'],
      [0.1, '1/10'],
    ]
    for (const [input, output] of cases) {
      expect(formatProbability(input)).toBe(output)
      expect(formatProbability(input)).toBe(formatProbability(input))
    }
  })

  it('the Practice theme catalogue is a fixed, hand-authored finite list (no generated themes)', () => {
    expect(PRACTICE_THEMES.length).toBe(9)
    for (const theme of PRACTICE_THEMES) {
      expect(ALL_TEMPLATES).toContain(theme.templateKind)
    }
    // The set of template kinds the rotation can ever surface is a closed set.
    const kinds = new Set(PRACTICE_THEMES.map((t) => t.templateKind))
    expect(kinds.size).toBeLessThanOrEqual(ALL_TEMPLATES.length)
  })
})

// ============================================================================
// G. THE VERDICT, ENCODED AS A TEST — a compact summary assertion that states
//    the empirical conclusion: the reachable generator is deterministic/templated.
// ============================================================================
describe('G. VERDICT: the reachable Practice generator is DETERMINISTIC/TEMPLATED, not AI', () => {
  it('summarizes the evidence: full determinism + finite space + fixed text + no model call', () => {
    // 1) Determinism: a 64-seed sweep yields a finite output set far smaller than
    //    the input set for a representative seed-varying template.
    const distinct = new Set<string>()
    for (let i = 0; i < 4000; i += 1) {
      distinct.add(fingerprint(gen('weighted-average', 1, `verdict-${i}`).problem))
    }
    const isFiniteSmallSpace = distinct.size <= 64

    // 2) Repeatability: the same seed reproduces the exact same problem.
    const repeatable =
      fingerprint(gen('payout-vs-profit', 4, 'verdict-fixed').problem) ===
      fingerprint(gen('payout-vs-profit', 4, 'verdict-fixed').problem)

    // 3) Fixed text: the prompt is seed-invariant.
    const prompts = new Set(
      seeds(50).map((s) => gen('fairness-classification', 3, s).problem.prompt),
    )
    const fixedText = prompts.size === 1

    // 4) No model: generating never touched the network.
    const noModelCall = fetchSpy.mock.calls.length === 0

    expect(isFiniteSmallSpace).toBe(true)
    expect(repeatable).toBe(true)
    expect(fixedText).toBe(true)
    expect(noModelCall).toBe(true)

    // If all four hold, the generator we can actually run is a template engine.
    expect(isFiniteSmallSpace && repeatable && fixedText && noModelCall).toBe(true)
  })
})
