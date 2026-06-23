// Firestore document-ID derivation (Agent 1 — Core Architecture).
//
// PRD schema (Page 9) documents chapter-scoped doc IDs as
// `{userId}_expected_value_intro` (UNDERSCORES), and firestore.rules already
// require that exact suffix. Earlier code derived the suffix from
// CHAPTER_ID ('expected-value-intro', HYPHENS), producing
// `{userId}_expected-value-intro`, which the rules reject — every chapter /
// milestone write silently fell back to local storage.
//
// New writes use the PRD-correct underscore ID. Reads tolerate the legacy
// hyphenated ID for safety; see migration.mergeChapterProgress for the rule
// used when both exist.

/** PRD-correct, rules-approved chapter doc suffix. */
export const CHAPTER_DOC_SUFFIX = 'expected_value_intro'

/** Legacy (pre-fix) suffix that the security rules reject. */
export const LEGACY_CHAPTER_DOC_SUFFIX = 'expected-value-intro'

/** Canonical chapter-scoped document ID for chapterProgress / milestones. */
export function chapterScopedDocId(userId: string): string {
  return `${userId}_${CHAPTER_DOC_SUFFIX}`
}

/** Legacy chapter-scoped document ID kept only for tolerant reads. */
export function legacyChapterScopedDocId(userId: string): string {
  return `${userId}_${LEGACY_CHAPTER_DOC_SUFFIX}`
}
