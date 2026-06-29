import { useCallback, useMemo, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useChapterData } from '../hooks/useChapterData'
import { useStreak } from '../hooks/useStreak'
import { buildAdaptiveSnapshot } from '../lib/adaptivePracticeService'
import { isGradedAttempt } from '../lib/answerChecker'
import { recordProblemAttempt } from '../lib/problemAttemptService'
import { LearningCoachPanel } from '../features/learning-experience/LearningCoachPanel'
import { QuestionPrompt } from '../features/learning-experience/QuestionPrompt'
import { checkResultToCoachFeedback } from '../features/learning-experience/feedbackModel'
import { createInitialSkillStates, updateSkillState } from '../core/adaptive/masteryModel'
import { scaffoldTierForScore, type ScaffoldTier } from '../core/adaptive/scheduler'
import type { SkillId, SkillState } from '../core/adaptive/types'
import type { CheckResult, ProblemAttempt } from '../types/problem'
import {
  clearPracticePrefetch,
  generatePracticeQuestion,
  prefetchPracticeQuestion,
  checkPracticeQuestionAnswer,
  type PracticeGenerationMode,
} from '../features/practice/practiceApi'
import type {
  GeneratedAnswerSubmission,
  GeneratedPracticeInstance,
  GeneratedTemplateKind,
} from '../features/practice/generatedPractice'
import {
  PRACTICE_THEMES,
  describeSelection,
  difficultyForTheme,
  familyForThemeId,
  selectNextTheme,
  type PracticeTheme,
  type SelectionInfo,
} from '../features/practice/practiceThemes'
import { formatProbability } from '../features/practice/formatProbability'
import { CardDealScene, DeckSpread } from '../components/visuals/cards'
import { DiceScene } from '../components/visuals/dice/DiceScene'
import { makeCard, buildValueGroups } from '../data/cards'

const EMPTY_SUBMISSION: GeneratedAnswerSubmission = {}

// Persisted, inconspicuous practice testing switch. When true the OpenAI-backed
// generation is bypassed in favour of the deterministic local generator. Default
// is AI on (key absent / not "true"), preserving the normal production behavior.
const PRACTICE_AI_DISABLED_KEY = 'evl_practice_ai_disabled'

function readAiDisabledPreference(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  try {
    return window.localStorage.getItem(PRACTICE_AI_DISABLED_KEY) === 'true'
  } catch {
    return false
  }
}

// Raw, most-recent-first session log of shown theme ids (NOT de-duplicated, so
// the diversity scheduler can count theme/family/skill repeats inside its
// windows). Capped well beyond the windows it inspects.
const SESSION_LOG_CAP = 24

// Scaffolding tiers from most support to least. Fading walks this order: a wrong
// answer steps toward `guided`, mastery (rising score) carries toward `independent`.
const SCAFFOLD_TIER_ORDER: ScaffoldTier[] = ['guided', 'supported', 'independent']

const SCAFFOLD_TIER_LABEL: Record<ScaffoldTier, string> = {
  guided: 'Guided',
  supported: 'Supported',
  independent: 'Fluency',
}

/** Step one tier toward more support or toward independence, clamped to the ends. */
function stepScaffoldTier(tier: ScaffoldTier, toward: 'support' | 'independent'): ScaffoldTier {
  const index = SCAFFOLD_TIER_ORDER.indexOf(tier)
  const nextIndex = Math.min(
    SCAFFOLD_TIER_ORDER.length - 1,
    Math.max(0, index + (toward === 'support' ? -1 : 1)),
  )
  return SCAFFOLD_TIER_ORDER[nextIndex]
}

function fallbackSkillStates(): Record<SkillId, SkillState> {
  return createInitialSkillStates(new Date().toISOString())
}

export function PracticePage() {
  const { user } = useAuth()
  const { progress, loading } = useChapterData()
  const { recordActivity: recordStreakActivity } = useStreak()
  // Inconspicuous testing switch: when AI is disabled, generation uses the
  // deterministic local generator and skips the OpenAI-backed callable. Persisted
  // so it survives reloads; default is AI on.
  const [aiDisabled, setAiDisabled] = useState<boolean>(readAiDisabledPreference)
  const generationMode: PracticeGenerationMode = aiDisabled ? 'deterministic' : 'ai'
  // Mastery snapshot for this session; selection + difficulty derive from it.
  const [skillStates, setSkillStates] = useState<Record<SkillId, SkillState> | null>(null)
  const [recentThemeIds, setRecentThemeIds] = useState<string[]>([])
  const [currentTheme, setCurrentTheme] = useState<PracticeTheme | null>(null)
  const [difficulty, setDifficulty] = useState(2)
  // The pre-decided + prefetched FOLLOWING question (with its frozen selection
  // reason), so Next is an instant cache hit that can explain itself.
  const [pendingNext, setPendingNext] = useState<{
    theme: PracticeTheme
    difficulty: number
    selection: SelectionInfo
  } | null>(null)
  const [instance, setInstance] = useState<GeneratedPracticeInstance | null>(null)
  // Why the current theme was chosen (frozen at load) — drives the "why this
  // question?" label + the Review / Related pills.
  const [selectionInfo, setSelectionInfo] = useState<SelectionInfo | null>(null)
  // Live scaffolding level for the current question: seeded from the skill's score,
  // dropped one step (more support) on a wrong answer, and fading up as score rises.
  const [scaffoldTier, setScaffoldTier] = useState<ScaffoldTier>('supported')
  const [submission, setSubmission] = useState<GeneratedAnswerSubmission>(EMPTY_SUBMISSION)
  const [feedback, setFeedback] = useState<CheckResult | null>(null)
  const [revealedHintCount, setRevealedHintCount] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attemptNumber, setAttemptNumber] = useState(1)
  // In-session difficulty per skill: seeded from course-map scores at Start, then
  // nudged by graded answers (correct +1, correct-with-hint stays, wrong -1). A
  // ref avoids stale closures so every load/prefetch reads the latest value.
  const difficultyBySkillRef = useRef<Partial<Record<SkillId, number>>>({})
  // Did the learner miss the CURRENT question at any point? If so, the next
  // selection prefers a same-family cousin surface. Reset when a question loads.
  const missedCurrentRef = useRef(false)
  // ISO time the current question was shown — stamped into the attempt metadata
  // (alongside answeredAt) so review-delay and time-on-task are measurable.
  const questionStartedAtRef = useRef<string>(new Date().toISOString())

  const coachFeedback = useMemo(() => {
    if (!feedback) {
      return null
    }
    const explanation = feedback.explanation
    const hasStructured = Boolean(
      explanation?.whatHappened || explanation?.whyItMatters || explanation?.repairStep,
    )
    return checkResultToCoachFeedback(feedback, {
      // Never reuse the prompt as the explanation — use the deterministic concept
      // summary + worked solution that the checker attaches to the result.
      conceptSummary: explanation?.conceptSummary,
      workedSolution: explanation?.workedSolution,
      structured: hasStructured
        ? {
            whatHappened: explanation?.whatHappened,
            whyWrong: explanation?.whyItMatters,
            whatNext: explanation?.repairStep,
          }
        : undefined,
      nextActionText: 'Update your answer, then check again.',
    })
  }, [feedback])

  const sourceNote = useMemo(() => {
    if (!instance) {
      return ''
    }
    if (instance.generationNote) {
      return instance.generationNote
    }
    return instance.problem.source === 'ai'
      ? 'Generated by AI and checked on the server.'
      : 'Using deterministic fallback until AI generation is available.'
  }, [instance])

  const hints = instance?.problem.hints ?? []
  const revealedHints = hints.slice(0, revealedHintCount)
  const hasMoreHints = revealedHintCount < hints.length

  // Until the learner checks a correct answer the forward control is a "Skip"
  // (advancing without solving). A correct check flips it to "Next". Editing the
  // answer clears feedback (see updateSubmission), so it reverts to "Skip".
  const hasCorrectAnswer = feedback?.isCorrect === true

  // At-a-glance count of distinct skills whose spaced-review window is due now,
  // recomputed whenever the live skill states advance after a graded answer.
  const dueReviewCount = useMemo(() => {
    if (!skillStates) {
      return 0
    }
    const nowIso = new Date().toISOString()
    const dueSkillIds = new Set<SkillId>()
    for (const theme of PRACTICE_THEMES) {
      if (describeSelection(theme, skillStates, nowIso).isReview) {
        dueSkillIds.add(theme.skillId)
      }
    }
    return dueSkillIds.size
  }, [skillStates])

  // Generate the chosen theme at its difficulty and append it to the raw session
  // log. The FOLLOWING question is decided + prefetched only AFTER grading (see
  // checkAnswer), so it can react to the updated skill state, the adapted
  // difficulty, and whether this question was missed (cousin review).
  const loadQuestion = useCallback(
    async (
      theme: PracticeTheme,
      diff: number,
      states: Record<SkillId, SkillState>,
      priorRecent: string[],
      selection?: SelectionInfo,
    ) => {
      if (!user) {
        return
      }
      setGenerating(true)
      setError(null)
      setFeedback(null)
      setSubmission(EMPTY_SUBMISSION)
      setAttemptNumber(1)
      setRevealedHintCount(0)
      missedCurrentRef.current = false
      try {
        const generated = await generatePracticeQuestion({
          userId: user.uid,
          skillId: theme.skillId,
          difficulty: diff,
          templateKind: theme.templateKind,
          generationMode,
        })
        setInstance(generated)
        setCurrentTheme(theme)
        setDifficulty(diff)
        // Stamp when this question became visible (for review-delay / time-on-task).
        questionStartedAtRef.current = new Date().toISOString()
        // Freeze why this theme was chosen + seed the scaffold tier from the live
        // score, so the header reflects the state at the moment of selection. Use
        // the precomputed selection (which can know about cousin picks) when given.
        const nowIso = new Date().toISOString()
        setSelectionInfo(selection ?? describeSelection(theme, states, nowIso))
        setScaffoldTier(scaffoldTierForScore(states[theme.skillId]?.score ?? 0))

        // Raw, most-recent-first log (no de-dup) so the scheduler can count
        // theme/family/skill repeats inside its diversity windows.
        setRecentThemeIds([theme.id, ...priorRecent].slice(0, SESSION_LOG_CAP))
      } catch {
        setError('Could not generate a practice question. Try again in a moment.')
      } finally {
        setGenerating(false)
      }
    },
    [generationMode, user],
  )

  const startPractice = useCallback(async () => {
    if (!user) {
      return
    }
    setGenerating(true)
    let states: Record<SkillId, SkillState>
    try {
      const snapshot = await buildAdaptiveSnapshot(user.uid, progress)
      states = snapshot.skillStates
    } catch {
      states = fallbackSkillStates()
    }
    setSkillStates(states)
    // Seed in-session difficulty for every theme's skill from the course-map score.
    for (const theme of PRACTICE_THEMES) {
      difficultyBySkillRef.current[theme.skillId] = difficultyForTheme(states, theme)
    }
    const theme = selectNextTheme(states, [])
    const diff = difficultyBySkillRef.current[theme.skillId] ?? difficultyForTheme(states, theme)
    await loadQuestion(theme, diff, states, [])
  }, [loadQuestion, progress, user])

  const continueToNextQuestion = useCallback(async () => {
    if (!user) {
      return
    }
    const states = skillStates ?? fallbackSkillStates()
    // Serve the question we pre-decided + prefetched after grading (instant cache
    // hit). If the learner skipped without checking, nothing is queued, so select
    // fresh now from the live states + session log.
    const queued = pendingNext
    const theme = queued?.theme ?? selectNextTheme(states, recentThemeIds)
    // Keep the prefetched difficulty so the prefetch cache key still matches; only
    // recompute (from the adapted ref, then the static seed) when nothing is queued.
    const diff =
      queued?.difficulty ??
      difficultyBySkillRef.current[theme.skillId] ??
      difficultyForTheme(states, theme)
    setPendingNext(null)
    await loadQuestion(theme, diff, states, recentThemeIds, queued?.selection)
  }, [loadQuestion, pendingNext, recentThemeIds, skillStates, user])

  const checkAnswer = useCallback(async () => {
    if (!user || !instance) {
      return
    }
    setChecking(true)
    try {
      const result = await checkPracticeQuestionAnswer({
        userId: user.uid,
        problem: instance.problem,
        answerKey: instance.answerKey,
        submission,
      })
      setFeedback(result)
      // A genuinely wrong (graded) answer surfaces the first directional hint.
      if (isGradedAttempt(result) && !result.isCorrect) {
        setRevealedHintCount((count) => Math.max(count, 1))
      }
      // A CORRECT graded answer is a genuine learning event → record daily
      // activity for the streak. Fire-and-forget so feedback isn't delayed.
      if (isGradedAttempt(result) && result.isCorrect) {
        void recordStreakActivity()
      }
      if (isGradedAttempt(result)) {
        // One graded attempt: recorded once and replayed into the live skill state
        // so review scheduling + scaffold tier advance exactly as a cold derive would.
        const answeredAt = new Date().toISOString()
        const gradedAttempt: ProblemAttempt = {
          attemptId: `${user.uid}_${instance.problem.id}_${Date.now()}`,
          userId: user.uid,
          chapterId: 'expected-value-intro',
          problemId: instance.problem.id,
          stepId: 'final',
          submittedAnswer: JSON.stringify(submission),
          normalizedAnswer: { ...submission },
          isCorrect: result.isCorrect,
          attemptNumber,
          attemptMode: 'practice_restart',
          hintUsed: revealedHintCount > 0,
          mistakeType: result.mistakeType,
          masteryTagsTested: instance.problem.skillIds,
          createdAt: answeredAt,
          // Lightweight analytics payload (no undefined fields → Firestore-safe).
          practice: {
            templateKind: instance.problem.templateKind,
            difficulty,
            skillFamily: (currentTheme && familyForThemeId(currentTheme.id)) ?? 'unknown',
            selectionReason: selectionInfo?.kind ?? 'new-skill',
            isReview: selectionInfo?.isReview ?? false,
            scaffoldTier,
            hintCount: revealedHintCount,
            wasSkipped: false,
            questionStartedAt: questionStartedAtRef.current,
            answeredAt,
          },
        }

        // Adapt in-session difficulty for this theme's skill: wrong eases off,
        // a clean correct (no hint) pushes harder, correct-with-hint holds steady.
        if (currentTheme) {
          const skillId = currentTheme.skillId
          const delta = !result.isCorrect ? -1 : revealedHintCount === 0 ? 1 : 0
          if (delta !== 0) {
            const current = difficultyBySkillRef.current[skillId] ?? difficulty
            difficultyBySkillRef.current[skillId] = Math.min(5, Math.max(1, current + delta))
          }
        }

        // Advance the held skill states for every tested skill so spaced-review
        // urgency and scaffold tier evolve mid-session (matches deriveSkillStates).
        const baseStates = skillStates ?? fallbackSkillStates()
        const nextStates: Record<SkillId, SkillState> = { ...baseStates }
        for (const skillId of instance.problem.skillIds) {
          const current = nextStates[skillId]
          if (current) {
            nextStates[skillId] = updateSkillState(current, gradedAttempt)
          }
        }
        setSkillStates(nextStates)

        if (!result.isCorrect) {
          // Remember a miss on this question so the next selection prefers a cousin.
          missedCurrentRef.current = true
          // Fade scaffolding: a wrong answer drops one tier (more support) right now;
          // the updated score reseeds the base tier when the next question loads.
          setScaffoldTier((tier) => stepScaffoldTier(tier, 'support'))
        }

        await recordProblemAttempt(gradedAttempt)
        setAttemptNumber((current) => current + 1)

        // Decide + prefetch the FOLLOWING question now that grading is done so it
        // reflects the updated mastery, the adapted difficulty, and (after a miss)
        // a same-family cousin surface. recentThemeIds already has the current
        // theme at index 0, so it counts toward the diversity windows.
        const cousinThemeId = missedCurrentRef.current ? currentTheme?.id ?? null : null
        const followingTheme = selectNextTheme(nextStates, recentThemeIds, { cousinThemeId })
        const followingDifficulty =
          difficultyBySkillRef.current[followingTheme.skillId] ??
          difficultyForTheme(nextStates, followingTheme)
        const followingSelection = describeSelection(
          followingTheme,
          nextStates,
          new Date().toISOString(),
          cousinThemeId,
        )
        prefetchPracticeQuestion({
          userId: user.uid,
          skillId: followingTheme.skillId,
          difficulty: followingDifficulty,
          templateKind: followingTheme.templateKind,
          generationMode,
        })
        setPendingNext({
          theme: followingTheme,
          difficulty: followingDifficulty,
          selection: followingSelection,
        })
      }
    } finally {
      setChecking(false)
    }
  }, [
    attemptNumber,
    currentTheme,
    difficulty,
    generationMode,
    instance,
    recentThemeIds,
    revealedHintCount,
    scaffoldTier,
    selectionInfo,
    skillStates,
    submission,
    user,
    recordStreakActivity,
  ])

  const updateSubmission = (patch: GeneratedAnswerSubmission) => {
    setSubmission((current) => ({ ...current, ...patch }))
    setFeedback(null)
  }

  const revealNextHint = () => {
    setRevealedHintCount((count) => Math.min(count + 1, hints.length))
  }

  const toggleAiGeneration = useCallback(() => {
    setAiDisabled((current) => {
      const next = !current
      try {
        window.localStorage.setItem(PRACTICE_AI_DISABLED_KEY, String(next))
      } catch {
        // Persistence is best-effort (e.g. private browsing); the in-session toggle still applies.
      }
      return next
    })
    // A question pre-decided/prefetched under the previous mode must not be served
    // now: forget the queued next question and drop every cached (possibly AI) one.
    setPendingNext(null)
    clearPracticePrefetch()
  }, [])

  return (
    <div className="practice-page">
      <section className="card practice-hero">
        <div className="practice-hero-copy">
          <p className="chapter-eyebrow">Practice Mode</p>
          <h1>Adaptive EV practice</h1>
          <p>
            Keep expected value sharp with short, focused questions chosen from your current
            progress. We tune the difficulty, rotate the theme, and prepare the next prompt
            before you need it.
          </p>
          <label
            className="practice-ai-toggle"
            title="Turn AI off to build questions with the deterministic local generator (for testing)."
          >
            <input
              type="checkbox"
              className="practice-ai-toggle-input"
              checked={!aiDisabled}
              onChange={toggleAiGeneration}
            />
            <span className="practice-ai-toggle-text">
              AI generation: {aiDisabled ? 'off' : 'on'}
            </span>
          </label>
        </div>
        <div className="practice-hero-art" aria-hidden="true">
          <span className="practice-orbit practice-orbit-one" />
          <span className="practice-orbit practice-orbit-two" />
          <span className="practice-coin practice-coin-one">$</span>
          <span className="practice-coin practice-coin-two">EV</span>
          <span className="practice-die">
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>
      </section>

      {error && <div className="sync-banner sync-banner-error">{error}</div>}

      <section className="card practice-session" aria-label="Generated practice question">
        {generating ? (
          <div className="practice-empty practice-generating" role="status" aria-live="polite">
            <h2>Loading your next question...</h2>
            <p>Picking a theme and preparing a fresh scenario.</p>
          </div>
        ) : !instance ? (
          <div className="practice-launch">
            <div className="practice-launch-main">
              <span className="practice-launch-kicker">Your next best rep</span>
              <h2>Warm up with one adaptive question.</h2>
              <p>
                Start a session and we&apos;ll choose the highest-impact EV skill, serve a
                fresh scenario, and keep a follow-up ready so practice keeps moving.
              </p>
              <div className="practice-launch-actions">
                <button
                  type="button"
                  className="practice-start-button"
                  disabled={!user || loading}
                  onClick={() => void startPractice()}
                >
                  {loading ? 'Loading progress...' : 'Start practice'}
                </button>
                <span className="practice-launch-note">Usually under 2 minutes</span>
              </div>
            </div>

            <aside className="practice-launch-panel" aria-label="Practice session preview">
              <div className="practice-mini-card practice-mini-card-active">
                <span className="practice-mini-icon" aria-hidden="true">
                  1
                </span>
                <div>
                  <strong>Adaptive pick</strong>
                  <p>Difficulty adjusts from your course progress.</p>
                </div>
              </div>
              <div className="practice-mini-card">
                <span className="practice-mini-icon" aria-hidden="true">
                  2
                </span>
                <div>
                  <strong>Instant next</strong>
                  <p>The next question is queued in the background.</p>
                </div>
              </div>
              <div className="practice-theme-strip" aria-label="Practice themes">
                {PRACTICE_THEMES.slice(0, 5).map((theme) => (
                  <span key={theme.id}>{theme.label}</span>
                ))}
              </div>
            </aside>
          </div>
        ) : (
          <div key={instance.problem.id} className="practice-question-body">
            <div className="practice-question-header">
              <div className="practice-caption-row">
                <span className="practice-caption">
                  {currentTheme?.label ?? 'Practice'} · difficulty {difficulty}
                </span>
                {selectionInfo?.kind === 'due-review' && (
                  <span className="practice-review-pill">Review</span>
                )}
                {selectionInfo?.kind === 'cousin' && (
                  <span className="practice-review-pill practice-cousin-pill">Related</span>
                )}
                <span className={`practice-tier-label practice-tier-${scaffoldTier}`}>
                  {SCAFFOLD_TIER_LABEL[scaffoldTier]}
                </span>
                {dueReviewCount > 0 && (
                  <span className="practice-due-count">
                    {dueReviewCount} {dueReviewCount === 1 ? 'skill' : 'skills'} due for review
                  </span>
                )}
              </div>
              {selectionInfo && (
                <p className="practice-review-reason">
                  <span className="practice-why-label">Why this question?</span> {selectionInfo.reason}
                </p>
              )}
              <h2>{instance.problem.title}</h2>
              <p>{instance.problem.scenarioText}</p>
              {sourceNote && <span className="practice-source-note">{sourceNote}</span>}
            </div>

            <QuestionPrompt>{instance.problem.prompt}</QuestionPrompt>

            <PracticeGivenData instance={instance} tier={scaffoldTier} />

            <PracticeAnswerForm
              instance={instance}
              submission={submission}
              onChange={updateSubmission}
            />

            <LearningCoachPanel feedback={coachFeedback} />

            <div className="practice-bottom-bar">
              <div className="practice-bottom-hint">
                {revealedHints.map((hint, index) => (
                  <p key={hint.id} className="practice-hint-text">
                    <span className="practice-hint-tag">Hint {index + 1}</span>
                    {hint.content}
                  </p>
                ))}
                {hasMoreHints && (
                  <button type="button" className="practice-hint-toggle" onClick={revealNextHint}>
                    {revealedHintCount === 0 ? 'Show a hint' : 'Show another hint'}
                  </button>
                )}
              </div>
              <div className="practice-bottom-nav">
                <button
                  type="button"
                  className="btn-secondary practice-check-btn"
                  disabled={checking}
                  onClick={() => void checkAnswer()}
                >
                  {checking ? 'Checking...' : 'Check answer'}
                </button>
                <button
                  type="button"
                  className="practice-next-btn"
                  disabled={generating}
                  onClick={() => void continueToNextQuestion()}
                >
                  {hasCorrectAnswer ? 'Next →' : 'Skip →'}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

/** Per-template label + placeholder for the expected-value input. */
function expectedValueField(templateKind: GeneratedTemplateKind): {
  label: string
  placeholder: string
} {
  switch (templateKind) {
    case 'dice-ev':
      return { label: 'Expected sum', placeholder: 'Enter a number' }
    case 'card-deck-ev':
      return { label: 'Expected value per draw', placeholder: 'Enter a number' }
    case 'profession-payout':
      return { label: 'Expected payout', placeholder: 'Enter a dollar amount' }
    case 'card-hand-ev':
      return { label: 'Expected value per card', placeholder: 'Enter a number' }
    case 'fair-price-to-play':
      return { label: 'Fair price to play', placeholder: 'Enter a dollar amount' }
    default:
      return { label: 'Expected value', placeholder: 'Enter a dollar amount' }
  }
}

function PracticeGivenData({
  instance,
  tier,
}: {
  instance: GeneratedPracticeInstance
  tier: ScaffoldTier
}) {
  const { templateKind, givenData } = instance.problem

  if (templateKind === 'card-hand-ev' && givenData.cards?.length) {
    const cards = givenData.cards.map((card) => makeCard(card.rank, card.suit))
    return (
      <div className="practice-given-data">
        <div className="ws-visual">
          <CardDealScene
            cards={cards}
            groups={buildValueGroups(cards)}
            showCounts
            visualCap={4}
            caption={`A ${cards.length}-card hand, grouped by value`}
          />
        </div>
      </div>
    )
  }

  if (templateKind === 'dice-ev') {
    const count = givenData.dice?.count ?? 1
    const sides = givenData.dice?.sides ?? 6
    return (
      <div className="practice-given-data">
        <div className="ws-visual">
          <DiceScene
            count={count}
            caption={`${count} fair ${sides}-sided ${count === 1 ? 'die' : 'dice'}`}
          />
        </div>
        {tier !== 'independent' && (
          <p className="practice-note">
            Every face is equally likely, so each die averages {(sides + 1) / 2}.
          </p>
        )}
      </div>
    )
  }

  if (templateKind === 'card-deck-ev') {
    // The deck composition is stated in scenarioText, so the visual stands alone.
    return (
      <div className="practice-given-data">
        <div className="ws-visual">
          <DeckSpread caption="A face-down deck spread across the table" />
        </div>
      </div>
    )
  }

  const { outcomes = [], games = [], cost } = givenData
  return (
    <div className="practice-given-data">
      {outcomes.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Outcome</th>
              <th>Value</th>
              <th>Probability</th>
            </tr>
          </thead>
          <tbody>
            {outcomes.map((outcome) => (
              <tr key={outcome.label}>
                <td>{outcome.label}</td>
                <td>${outcome.value}</td>
                <td>{formatProbability(outcome.probability)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {cost !== undefined && <p className="practice-cost">Cost to play: ${cost}</p>}
      {games.length > 0 && (
        <div className="practice-game-list">
          {games.map((game) => (
            <div key={game.id} className="practice-game-card">
              <h3>{game.label}</h3>
              <ul>
                {game.outcomes.map((outcome) => (
                  <li key={outcome.label}>
                    {outcome.label}: ${outcome.value} ({formatProbability(outcome.probability)})
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PracticeAnswerForm({
  instance,
  submission,
  onChange,
}: {
  instance: GeneratedPracticeInstance
  submission: GeneratedAnswerSubmission
  onChange: (patch: GeneratedAnswerSubmission) => void
}) {
  const inputs = instance.problem.answerInputs
  const games = instance.problem.givenData.games ?? []
  const { label, placeholder } = expectedValueField(instance.problem.templateKind)
  return (
    <div className="practice-answer-form">
      {inputs.includes('expectedValue') && (
        <label className="ws-field">
          {label}
          <input
            className="touch-input"
            value={submission.expectedValue ?? ''}
            onChange={(event) => onChange({ expectedValue: event.target.value })}
            placeholder={placeholder}
            autoComplete="off"
            inputMode="decimal"
          />
        </label>
      )}
      {inputs.includes('expectedProfit') && (
        <label className="ws-field">
          Expected profit
          <input
            className="touch-input"
            value={submission.expectedProfit ?? ''}
            onChange={(event) => onChange({ expectedProfit: event.target.value })}
            placeholder="Enter a dollar amount"
            autoComplete="off"
            inputMode="decimal"
          />
        </label>
      )}
      {inputs.includes('classification') && (
        <label className="ws-field">
          Classification
          <select
            className="touch-input"
            value={submission.classification ?? ''}
            onChange={(event) => onChange({ classification: event.target.value })}
          >
            <option value="">Choose...</option>
            <option value="favorable">Favorable</option>
            <option value="fair">Fair</option>
            <option value="unfavorable">Unfavorable</option>
          </select>
        </label>
      )}
      {inputs.includes('bestChoice') && (
        <ChoiceSelect
          label="Best game"
          value={submission.bestChoice ?? ''}
          games={games}
          onChange={(bestChoice) => onChange({ bestChoice })}
        />
      )}
      {inputs.includes('riskChoice') && (
        <ChoiceSelect
          label="Riskier game"
          value={submission.riskChoice ?? ''}
          games={games}
          onChange={(riskChoice) => onChange({ riskChoice })}
        />
      )}
    </div>
  )
}

function ChoiceSelect({
  label,
  value,
  games,
  onChange,
}: {
  label: string
  value: string
  games: Array<{ id: string; label: string }>
  onChange: (value: string) => void
}) {
  return (
    <label className="ws-field">
      {label}
      <select
        className="touch-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Choose...</option>
        {games.map((game) => (
          <option key={game.id} value={game.id}>
            {game.label}
          </option>
        ))}
      </select>
    </label>
  )
}
