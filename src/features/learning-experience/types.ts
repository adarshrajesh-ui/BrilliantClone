import type { ReactNode } from 'react'

/**
 * Presentation-layer types for the reusable learning shell. These intentionally
 * live in the feature folder (not in the shared `types/` directory) so this
 * agent never edits shared schema files. Agent 1 / Agents 3-4 may later promote
 * the demo + current-task contracts into the central problem schema; see the
 * handoff doc for the mapping.
 */

/** A single step in a pre-problem mini-demo. */
export interface DemoStepConfig {
  id: string
  /** Optional short heading for the step. */
  title?: string
  /** Body content — plain string or rich nodes (e.g. a small SVG callout). */
  body: ReactNode
  /**
   * Optional id of a DOM element in the problem work area to visually
   * emphasize while this step is active. The shell maps this to a CSS hook;
   * highlighting is best-effort and never required for correctness.
   */
  highlightTargetId?: string
  /** Optional inline media/illustration rendered above the body. */
  media?: ReactNode
}

/** Full demo configuration for a problem (owned by Agents 3/4 at runtime). */
export interface DemoConfig {
  steps: DemoStepConfig[]
  /** Closing call-to-action shown on the last step (e.g. "Run 100 spins"). */
  finalCallToAction?: string
}

/** Checklist step status used by the current-task panel. */
export type ChecklistStepStatus = 'todo' | 'active' | 'done' | 'needs-correction'

export interface ChecklistStepView {
  id: string
  label: string
  /** Convenience flag preserved for the existing TaskGuide API. */
  done?: boolean
  /** Explicit status; when omitted it is derived from `done` + position. */
  status?: ChecklistStepStatus
}

/** Tone of a Learning Coach message. */
export type CoachTone = 'correct' | 'incorrect' | 'info' | 'idle'

/**
 * Display model for the Learning Coach panel. Supports both a structured
 * wrong-answer layout (what happened / why / what next) and a single-string
 * fallback for problem packs that have not yet supplied structured copy.
 */
export interface CoachFeedback {
  tone: CoachTone
  title?: string
  /** Friendly mistake label, e.g. "Picked the biggest payout". */
  mistakeLabel?: string | null
  /** Structured wrong-answer fields (optional). */
  whatHappened?: string
  whyWrong?: string
  whatNext?: string
  /** Single-message fallback when structured copy is unavailable. */
  message?: string
  /** Short concept reinforcement shown on correct answers. */
  conceptSummary?: string
}

/** Inline field status mirroring `lib/fieldStatus.ts` plus a neutral default. */
export type InlineStatus = 'empty' | 'current' | 'needs-correction' | 'correct'
