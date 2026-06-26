import type { SkillDefinition, SkillId } from './types'

export const SKILL_CATALOG: readonly SkillDefinition[] = [
  {
    skillId: 'long-run-average',
    label: 'Long-run average',
    domain: 'foundations',
    level: 1,
    prerequisites: [],
  },
  {
    skillId: 'sampling-variation',
    label: 'Sampling variation',
    domain: 'foundations',
    level: 1,
    prerequisites: ['long-run-average'],
  },
  {
    skillId: 'weighted-average',
    label: 'Weighted average',
    domain: 'foundations',
    level: 2,
    prerequisites: ['long-run-average'],
  },
  {
    skillId: 'outcome-probability-pairing',
    label: 'Outcome-probability pairing',
    domain: 'foundations',
    level: 2,
    prerequisites: ['weighted-average'],
  },
  {
    skillId: 'compare-ev',
    label: 'Compare expected values',
    domain: 'foundations',
    level: 3,
    prerequisites: ['weighted-average'],
  },
  {
    skillId: 'complete-ev-model',
    label: 'Complete EV model',
    domain: 'foundations',
    level: 3,
    prerequisites: ['weighted-average'],
  },
  {
    skillId: 'probability-from-counts',
    label: 'Probability from counts',
    domain: 'discrete-models',
    level: 1,
    prerequisites: ['weighted-average'],
  },
  {
    skillId: 'ev-from-table',
    label: 'EV from a table',
    domain: 'discrete-models',
    level: 2,
    prerequisites: ['probability-from-counts', 'weighted-average'],
  },
  {
    skillId: 'payout-vs-profit',
    label: 'Payout vs profit',
    domain: 'game-economics',
    level: 1,
    prerequisites: ['weighted-average'],
  },
  {
    skillId: 'fairness-classification',
    label: 'Fairness classification',
    domain: 'game-economics',
    level: 2,
    prerequisites: ['payout-vs-profit'],
  },
  {
    skillId: 'compare-expected-profit',
    label: 'Compare expected profit',
    domain: 'game-economics',
    level: 3,
    prerequisites: ['payout-vs-profit', 'fairness-classification'],
  },
  {
    skillId: 'same-ev-different-risk',
    label: 'Same EV, different risk',
    domain: 'risk-integration',
    level: 1,
    prerequisites: ['compare-ev'],
  },
  {
    skillId: 'risk-spread',
    label: 'Risk spread',
    domain: 'risk-integration',
    level: 2,
    prerequisites: ['same-ev-different-risk'],
  },
  {
    skillId: 'full-ev-model',
    label: 'Full EV model',
    domain: 'risk-integration',
    level: 3,
    prerequisites: ['ev-from-table', 'payout-vs-profit', 'same-ev-different-risk'],
  },
]

const SKILL_IDS = new Set<SkillId>(SKILL_CATALOG.map((skill) => skill.skillId))

const SKILL_ALIASES: Record<string, SkillId> = {
  fairness: 'fairness-classification',
  'counts-to-probability': 'probability-from-counts',
  'model-completeness': 'complete-ev-model',
  'complete-ev-model': 'complete-ev-model',
  'compare-after-cost': 'compare-expected-profit',
}

export function normalizeSkillId(raw: string): SkillId | null {
  if (SKILL_IDS.has(raw as SkillId)) {
    return raw as SkillId
  }
  return SKILL_ALIASES[raw] ?? null
}

export function normalizeSkillIds(rawSkillIds: readonly string[]): SkillId[] {
  const normalized = rawSkillIds
    .map((skillId) => normalizeSkillId(skillId))
    .filter((skillId): skillId is SkillId => Boolean(skillId))
  return [...new Set(normalized)]
}

export function getSkillDefinition(skillId: SkillId): SkillDefinition {
  const definition = SKILL_CATALOG.find((skill) => skill.skillId === skillId)
  if (!definition) {
    throw new Error(`Unknown practice skill: ${skillId}`)
  }
  return definition
}
