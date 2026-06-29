import { describe, expect, it } from 'vitest'
import {
  PRACTICE_THEMES,
  cousinThemesFor,
  describeSelection,
  difficultyForPlan,
  difficultyForTheme,
  familyForThemeId,
  nextThemeIndex,
  selectNextTheme,
  themeAt,
  type PracticeFamily,
} from './practiceThemes'
import {
  createDeterministicPracticeInstance,
  type GeneratedTemplateKind,
} from './generatedPractice'
import { SKILL_CATALOG } from '../../core/adaptive/skillCatalog'
import { createInitialSkillStates } from '../../core/adaptive/masteryModel'
import { targetDifficultyForScore } from '../../core/adaptive/scheduler'
import type { PracticeRecommendation, SkillId, SkillState } from '../../core/adaptive/types'

// A clearly-past timestamp so every skill's spaced-review window is due during
// selection; the due bonus then applies equally and never skews relative need.
function freshSkillStates(): Record<SkillId, SkillState> {
  return createInitialSkillStates('2020-01-01T00:00:00.000Z')
}

function withScore(
  states: Record<SkillId, SkillState>,
  skillId: SkillId,
  score: number,
): Record<SkillId, SkillState> {
  return { ...states, [skillId]: { ...states[skillId], score } }
}

// All reviews scheduled far in the future, so no skill is due for review until
// one is explicitly made due — lets us isolate the spaced-retrieval path.
function notDueSkillStates(): Record<SkillId, SkillState> {
  return createInitialSkillStates('2999-01-01T00:00:00.000Z')
}

// Patch arbitrary fields on one skill's state (score, nextReviewAt, evidence…).
function withState(
  states: Record<SkillId, SkillState>,
  skillId: SkillId,
  patch: Partial<SkillState>,
): Record<SkillId, SkillState> {
  return { ...states, [skillId]: { ...states[skillId], ...patch } }
}

const VALID_SKILL_IDS = new Set(SKILL_CATALOG.map((skill) => skill.skillId))

// Mirrors GeneratedTemplateKind; typed so a removed union member becomes a compile error.
const KNOWN_TEMPLATE_KINDS: GeneratedTemplateKind[] = [
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

function recommendation(targetDifficulty: number): PracticeRecommendation {
  return {
    problemId: 'problem-1',
    canonicalSlug: 'problem-1',
    title: 'Recommendation',
    concept: 'expected-value',
    difficulty: targetDifficulty,
    globalProblemIndex: 0,
    lessonId: 'expected-value-intro',
    skillIds: ['weighted-average'],
    primarySkillId: 'weighted-average',
    score: 1,
    reason: 'test',
    dueReview: false,
    targetDifficulty,
  }
}

// Simulate a session the way PracticePage does: prepend each pick to a raw,
// most-recent-first log (no de-dup) and feed it back to selectNextTheme. When
// `missEvery` is set, every previous question is treated as a miss so the next
// pick is steered toward a same-family cousin.
function runSession(
  states: Record<SkillId, SkillState>,
  count: number,
  opts: { drillMode?: boolean; missEvery?: boolean } = {},
): string[] {
  let log: string[] = []
  const picks: string[] = []
  for (let step = 0; step < count; step += 1) {
    const cousinThemeId = opts.missEvery ? (picks[picks.length - 1] ?? null) : null
    const theme = selectNextTheme(states, log, { cousinThemeId, drillMode: opts.drillMode })
    picks.push(theme.id)
    log = [theme.id, ...log].slice(0, 24)
  }
  return picks
}

// Largest count of a key in any sliding window of `size` over the sequence.
function maxInWindow(picks: string[], size: number, keyOf: (id: string) => string): number {
  let max = 0
  for (let start = 0; start + size <= picks.length; start += 1) {
    const counts = new Map<string, number>()
    for (let i = start; i < start + size; i += 1) {
      const key = keyOf(picks[i])
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    for (const value of counts.values()) {
      max = Math.max(max, value)
    }
  }
  return max
}

describe('practice theme rotation', () => {
  it('rotates through every template kind in registry order', () => {
    expect(PRACTICE_THEMES.map((theme) => theme.templateKind)).toEqual([
      'card-hand-ev',
      'dice-ev',
      'card-deck-ev',
      'profession-payout',
      'payout-vs-profit',
      'fairness-classification',
      'compare-ev',
      'same-ev-risk',
      'fair-price-to-play',
    ])
  })

  it('wraps themeAt around the rotation length', () => {
    expect(themeAt(PRACTICE_THEMES.length)).toBe(themeAt(0))
    expect(themeAt(PRACTICE_THEMES.length + 1)).toBe(themeAt(1))
    expect(themeAt(-1)).toBe(themeAt(PRACTICE_THEMES.length - 1))
  })

  it('advances the rotation index one step at a time', () => {
    expect(nextThemeIndex(0)).toBe(1)
    expect(nextThemeIndex(3)).toBe(4)
    expect(themeAt(nextThemeIndex(PRACTICE_THEMES.length - 1))).toBe(themeAt(0))
  })

  it('maps every theme to a valid skill and an engine-known template kind', () => {
    for (const theme of PRACTICE_THEMES) {
      expect(VALID_SKILL_IDS.has(theme.skillId)).toBe(true)
      expect(KNOWN_TEMPLATE_KINDS).toContain(theme.templateKind)

      const instance = createDeterministicPracticeInstance({
        skillId: theme.skillId,
        difficulty: 2,
        seed: `theme-${theme.id}`,
        templateKind: theme.templateKind,
      })
      expect(instance.problem.templateKind).toBe(theme.templateKind)
    }
  })
})

describe('difficultyForPlan', () => {
  it('defaults to 2 when the plan is empty', () => {
    expect(difficultyForPlan([])).toBe(2)
  })

  it('uses the top recommendation target difficulty', () => {
    expect(difficultyForPlan([recommendation(4), recommendation(1)])).toBe(4)
  })
})

describe('selectNextTheme', () => {
  it('picks the theme whose mapped skill most needs work', () => {
    // dice-ev -> long-run-average; drop it well below the others so it leads.
    const states = withScore(freshSkillStates(), 'long-run-average', 0)
    // Previous theme is something else, so the most-needed theme is eligible.
    expect(selectNextTheme(states, ['card-hand-ev']).id).toBe('dice-ev')
  })

  it('never returns the immediately-previous theme, even with the highest need', () => {
    const states = withScore(freshSkillStates(), 'long-run-average', 0)
    // dice-ev now has the strongest need, but it was just shown.
    const chosen = selectNextTheme(states, ['dice-ev'])
    expect(chosen.id).not.toBe('dice-ev')
  })

  it('covers every theme and never repeats back-to-back over a session', () => {
    const states = freshSkillStates()
    let recent: string[] = []
    let previousId: string | null = null
    const seen = new Set<string>()

    for (let step = 0; step < PRACTICE_THEMES.length * 3; step += 1) {
      const theme = selectNextTheme(states, recent)
      expect(theme.id).not.toBe(previousId)
      seen.add(theme.id)
      previousId = theme.id
      // Mirror the page: prepend the chosen id, keep the most recent (themes - 1).
      recent = [theme.id, ...recent].slice(0, PRACTICE_THEMES.length - 1)
    }

    expect(seen.size).toBe(PRACTICE_THEMES.length)
    for (const theme of PRACTICE_THEMES) {
      expect(seen.has(theme.id)).toBe(true)
    }
  })

  it('emphasizes weak skills but still interleaves under diversity caps', () => {
    // Two skills mastered (low need) and two weak (high need). Weak skills should
    // be favored, but diversity caps must stop them from monopolizing the session
    // the way the old "weakest always wins" model did.
    let states = freshSkillStates()
    states = withScore(states, 'ev-from-table', 0.9) // card-hand-ev: strong
    states = withScore(states, 'long-run-average', 0.9) // dice-ev: strong
    states = withScore(states, 'probability-from-counts', 0.1) // card-deck-ev: weak
    states = withScore(states, 'weighted-average', 0.1) // profession-payout: weak

    const picks = runSession(states, 12)
    const distinct = new Set(picks)

    // Diversity: the session is no longer just the two weak themes on repeat.
    expect(distinct.size).toBeGreaterThanOrEqual(4)
    // But weak skills are still emphasized: their themes appear more than the
    // mastered ones over the session.
    const weak = picks.filter((id) => id === 'card-deck-ev' || id === 'profession-payout').length
    const strong = picks.filter((id) => id === 'card-hand-ev' || id === 'dice-ev').length
    expect(weak).toBeGreaterThan(strong)
  })

  it('lets a due-for-review skill win over plain rotation', () => {
    // Nothing is due except dice-ev's skill — and that skill is even mastered
    // (lowest raw need by score), yet its due review still makes it the pick.
    let states = notDueSkillStates()
    states = withState(states, 'long-run-average', {
      score: 0.95,
      nextReviewAt: '2000-01-01T00:00:00.000Z',
    })

    // The most-recent theme is something else, so dice-ev is eligible and wins.
    expect(selectNextTheme(states, ['card-hand-ev']).id).toBe('dice-ev')
  })

  it('does not repeat the most-recent theme even when it is the only one due', () => {
    let states = notDueSkillStates()
    states = withState(states, 'long-run-average', {
      nextReviewAt: '2000-01-01T00:00:00.000Z',
    })

    // dice-ev is due but was just shown; recency exclusion still prevents an
    // immediate back-to-back repeat, so a different theme is picked instead.
    const chosen = selectNextTheme(states, ['dice-ev'])
    expect(chosen.id).not.toBe('dice-ev')
  })
})

describe('selectNextTheme diversity caps', () => {
  it('never repeats a theme within 3 questions', () => {
    const picks = runSession(freshSkillStates(), 30)
    for (let i = 0; i < picks.length; i += 1) {
      const window = picks.slice(Math.max(0, i - 3), i)
      expect(window).not.toContain(picks[i])
    }
  })

  it('never shows one family more than 3 times in any 6-question window', () => {
    const picks = runSession(freshSkillStates(), 30)
    const maxFamily = maxInWindow(picks, 6, (id) => familyForThemeId(id) ?? 'unknown')
    expect(maxFamily).toBeLessThanOrEqual(3)
  })

  it('caps a weak skill at 50% of a 10-question window by default', () => {
    // payout-vs-profit is shared by two themes (Profit After Cost + Fair Price);
    // make it the weakest skill so it would otherwise dominate.
    const states = withScore(freshSkillStates(), 'payout-vs-profit', 0)
    const picks = runSession(states, 20)
    const maxSkill = maxInWindow(picks, 10, (id) => {
      const theme = PRACTICE_THEMES.filter((t) => t.id === id)[0]
      return theme.skillId
    })
    expect(maxSkill).toBeLessThanOrEqual(5)
  })

  it('lets Drill Mode push one weak skill past the session cap', () => {
    const states = withScore(freshSkillStates(), 'payout-vs-profit', 0)
    const capped = runSession(states, 20)
    const drilled = runSession(states, 20, { drillMode: true })
    const countSkill = (picks: string[]) =>
      maxInWindow(picks, 10, (id) => {
        const theme = PRACTICE_THEMES.filter((t) => t.id === id)[0]
        return theme.skillId
      })
    expect(countSkill(capped)).toBeLessThanOrEqual(5)
    expect(countSkill(drilled)).toBeGreaterThan(countSkill(capped))
  })

  it('covers at least 4 distinct themes in a 10-question session', () => {
    const picks = runSession(freshSkillStates(), 10)
    expect(new Set(picks).size).toBeGreaterThanOrEqual(4)
  })

  it('steers toward a same-family cousin right after a miss', () => {
    // Miss Profit After Cost (net-value): the only net-value cousin is Fair or Not.
    const chosen = selectNextTheme(freshSkillStates(), ['payout-vs-profit'], {
      cousinThemeId: 'payout-vs-profit',
    })
    expect(chosen.family).toBe<PracticeFamily>('net-value')
    expect(chosen.id).toBe('fairness-classification')
  })

  it('keeps the cousin in the same family when several cousins exist', () => {
    // dice-ev is ev-setup; cousins are Payday + Fair Price.
    const cousinIds = cousinThemesFor('dice-ev').map((theme) => theme.id)
    const chosen = selectNextTheme(freshSkillStates(), ['dice-ev'], { cousinThemeId: 'dice-ev' })
    expect(chosen.family).toBe<PracticeFamily>('ev-setup')
    expect(cousinIds).toContain(chosen.id)
  })

  it('falls back to a normal pick when no cousin is eligible', () => {
    // No cousinThemeId supplied → standard diversity selection still returns a theme.
    const chosen = selectNextTheme(freshSkillStates(), ['card-hand-ev'])
    expect(chosen.id).not.toBe('card-hand-ev')
  })
})

describe('describeSelection', () => {
  const NOW = '2026-06-25T12:00:00.000Z'
  const diceTheme = PRACTICE_THEMES.filter((theme) => theme.id === 'dice-ev')[0]

  it('flags a skill with history whose review is due as a review', () => {
    // Evidence + an overdue review window = a genuine re-encounter, not a first look.
    const states = withState(freshSkillStates(), 'long-run-average', {
      evidenceCount: 2,
      score: 0.3,
      nextReviewAt: '2026-06-25T11:00:00.000Z',
    })
    const result = describeSelection(diceTheme, states, NOW)

    expect(result.isReview).toBe(true)
    expect(result.reason).toMatch(/review/i)
  })

  it('does not flag a first-look skill (no history) as a review', () => {
    // freshSkillStates is due but has no evidence yet, so it is a new skill.
    const result = describeSelection(diceTheme, freshSkillStates(), NOW)

    expect(result.isReview).toBe(false)
    expect(result.reason).toMatch(/new skill/i)
  })

  it('does not flag a skill whose review is not yet due', () => {
    // A mid-mastery skill (not weak) that is not due reads as interleaving.
    const states = withState(notDueSkillStates(), 'long-run-average', {
      evidenceCount: 3,
      score: 0.6,
    })
    const result = describeSelection(diceTheme, states, NOW)

    expect(result.isReview).toBe(false)
    expect(result.kind).toBe('mixed')
    expect(result.reason).toMatch(/balanced/i)
  })

  it('labels a low-mastery, not-due skill as strengthening a weak skill', () => {
    const states = withState(notDueSkillStates(), 'long-run-average', {
      evidenceCount: 2,
      score: 0.2,
    })
    const result = describeSelection(diceTheme, states, NOW)

    expect(result.isReview).toBe(false)
    expect(result.kind).toBe('weak-skill')
    expect(result.reason).toMatch(/building/i)
  })

  it('labels a same-family pick after a miss as a cousin check', () => {
    // Profit After Cost (net-value) just missed → Fair or Not? is its cousin.
    const fairnessTheme = PRACTICE_THEMES.filter((theme) => theme.id === 'fairness-classification')[0]
    const result = describeSelection(fairnessTheme, freshSkillStates(), NOW, 'payout-vs-profit')

    expect(result.kind).toBe('cousin')
    expect(result.isReview).toBe(false)
    expect(result.reason).toMatch(/related/i)
  })

  it('does not treat a different-family pick as a cousin', () => {
    // dice-ev (ev-setup) is not a cousin of card-deck-ev (probability).
    const result = describeSelection(diceTheme, freshSkillStates(), NOW, 'card-deck-ev')
    expect(result.kind).not.toBe('cousin')
  })
})

describe('difficultyForTheme', () => {
  it('matches targetDifficultyForScore for the theme skill and stays within 1..5', () => {
    const states = freshSkillStates()
    for (const theme of PRACTICE_THEMES) {
      const score = states[theme.skillId].score
      const difficulty = difficultyForTheme(states, theme)
      expect(difficulty).toBe(targetDifficultyForScore(score))
      expect(difficulty).toBeGreaterThanOrEqual(1)
      expect(difficulty).toBeLessThanOrEqual(5)
    }
  })

  it('tracks score: low score yields low difficulty, high score yields high difficulty', () => {
    const theme = PRACTICE_THEMES[0]
    const low = withScore(freshSkillStates(), theme.skillId, 0)
    const mid = withScore(freshSkillStates(), theme.skillId, 0.5)
    const high = withScore(freshSkillStates(), theme.skillId, 1)

    expect(difficultyForTheme(low, theme)).toBe(1)
    expect(difficultyForTheme(mid, theme)).toBe(targetDifficultyForScore(0.5))
    expect(difficultyForTheme(high, theme)).toBe(5)
  })
})
