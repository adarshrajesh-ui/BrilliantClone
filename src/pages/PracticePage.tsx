import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useChapterData } from '../hooks/useChapterData'
import { getAdaptivePracticePlan } from '../lib/adaptivePracticeService'
import { isGradedAttempt } from '../lib/answerChecker'
import { recordProblemAttempt } from '../lib/problemAttemptService'
import { LearningCoachPanel } from '../features/learning-experience/LearningCoachPanel'
import { QuestionPrompt } from '../features/learning-experience/QuestionPrompt'
import { checkResultToCoachFeedback } from '../features/learning-experience/feedbackModel'
import type { PracticeRecommendation } from '../core/adaptive/types'
import type { CheckResult } from '../types/problem'
import {
  generatePracticeQuestion,
  checkPracticeQuestionAnswer,
} from '../features/practice/practiceApi'
import type {
  GeneratedAnswerSubmission,
  GeneratedPracticeInstance,
} from '../features/practice/generatedPractice'

const EMPTY_SUBMISSION: GeneratedAnswerSubmission = {}

export function PracticePage() {
  const { user } = useAuth()
  const { progress, loading } = useChapterData()
  const [recommendations, setRecommendations] = useState<PracticeRecommendation[]>([])
  const [selected, setSelected] = useState<PracticeRecommendation | null>(null)
  const [instance, setInstance] = useState<GeneratedPracticeInstance | null>(null)
  const [submission, setSubmission] = useState<GeneratedAnswerSubmission>(EMPTY_SUBMISSION)
  const [feedback, setFeedback] = useState<CheckResult | null>(null)
  const [loadingPlan, setLoadingPlan] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attemptNumber, setAttemptNumber] = useState(1)

  useEffect(() => {
    if (!user || loading) {
      return
    }
    let cancelled = false
    setLoadingPlan(true)
    void getAdaptivePracticePlan({ userId: user.uid, progress, limit: 4 })
      .then((plan) => {
        if (cancelled) {
          return
        }
        setRecommendations(plan)
        setSelected((current) => current ?? plan[0] ?? null)
      })
      .catch(() => {
        if (!cancelled) {
          setError('Practice recommendations could not load. Try again in a moment.')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingPlan(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [user, progress, loading])

  const coachFeedback = useMemo(
    () =>
      feedback
        ? checkResultToCoachFeedback(feedback, {
            conceptSummary: instance?.problem.prompt,
            nextActionText: 'Update your answer, then check again.',
          })
        : null,
    [feedback, instance],
  )

  const startQuestion = useCallback(
    async (recommendation: PracticeRecommendation | null = selected) => {
      if (!user || !recommendation) {
        return
      }
      setGenerating(true)
      setError(null)
      setFeedback(null)
      setSubmission(EMPTY_SUBMISSION)
      try {
        const generated = await generatePracticeQuestion({
          userId: user.uid,
          skillId: recommendation.primarySkillId,
          difficulty: recommendation.targetDifficulty,
        })
        setSelected(recommendation)
        setInstance(generated)
      } catch {
        setError('Could not generate a practice question. Try another skill.')
      } finally {
        setGenerating(false)
      }
    },
    [selected, user],
  )

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
      if (isGradedAttempt(result)) {
        await recordProblemAttempt({
          userId: user.uid,
          chapterId: 'expected-value-intro',
          problemId: instance.problem.id,
          stepId: 'final',
          submittedAnswer: JSON.stringify(submission),
          normalizedAnswer: { ...submission },
          isCorrect: result.isCorrect,
          attemptNumber,
          attemptMode: 'practice_restart',
          hintUsed: false,
          mistakeType: result.mistakeType,
          masteryTagsTested: instance.problem.skillIds,
        })
        setAttemptNumber((current) => current + 1)
      }
    } finally {
      setChecking(false)
    }
  }, [attemptNumber, instance, submission, user])

  const updateSubmission = (patch: GeneratedAnswerSubmission) => {
    setSubmission((current) => ({ ...current, ...patch }))
    setFeedback(null)
  }

  return (
    <div className="practice-page">
      <section className="card practice-hero">
        <p className="chapter-eyebrow">Practice Mode</p>
        <h1>Adaptive EV practice</h1>
        <p>
          Practice chooses a skill from your attempts first. AI only supplies the
          scenario and numbers after the server validates the generated question.
        </p>
        <div className="practice-actions">
          <button
            type="button"
            className="btn-primary"
            disabled={!selected || generating}
            onClick={() => void startQuestion()}
          >
            {generating ? 'Generating...' : 'Generate next question'}
          </button>
          <span className="practice-source-note">
            {instance?.problem.source === 'ai'
              ? 'Generated by AI and checked on the server.'
              : 'Using deterministic fallback until AI generation is available.'}
          </span>
        </div>
      </section>

      {error && <div className="sync-banner sync-banner-error">{error}</div>}

      <div className="practice-grid">
        <section className="card practice-recommendations">
          <h2>Recommended skills</h2>
          {loadingPlan ? (
            <p className="section-note">Loading your practice plan...</p>
          ) : (
            <div className="practice-recommendation-list">
              {recommendations.map((recommendation) => (
                <button
                  type="button"
                  key={recommendation.problemId}
                  className={`practice-recommendation${
                    selected?.problemId === recommendation.problemId ? ' selected' : ''
                  }`}
                  onClick={() => {
                    setSelected(recommendation)
                    void startQuestion(recommendation)
                  }}
                >
                  <span className="practice-rec-title">{recommendation.title}</span>
                  <span className="practice-rec-meta">
                    {recommendation.primarySkillId} · difficulty {recommendation.targetDifficulty}
                  </span>
                  <span className="practice-rec-reason">{recommendation.reason}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="card practice-session" aria-label="Generated practice question">
          {!instance ? (
            <div className="practice-empty">
              <h2>Ready for a question?</h2>
              <p>Choose a recommendation or generate the next suggested practice item.</p>
            </div>
          ) : (
            <>
              <div className="practice-question-header">
                <span className="stat-label">{instance.problem.templateKind}</span>
                <h2>{instance.problem.title}</h2>
                <p>{instance.problem.scenarioText}</p>
              </div>

              <QuestionPrompt>{instance.problem.prompt}</QuestionPrompt>

              <PracticeGivenData instance={instance} />

              <PracticeAnswerForm
                instance={instance}
                submission={submission}
                onChange={updateSubmission}
              />

              <div className="practice-actions">
                <button
                  type="button"
                  className="btn-primary"
                  disabled={checking}
                  onClick={() => void checkAnswer()}
                >
                  {checking ? 'Checking...' : 'Check answer'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={generating}
                  onClick={() => void startQuestion()}
                >
                  New question
                </button>
              </div>

              <LearningCoachPanel
                feedback={coachFeedback}
                onContinue={() => void startQuestion()}
                continueLabel="Generate another"
              />
            </>
          )}
        </section>
      </div>
    </div>
  )
}

function PracticeGivenData({ instance }: { instance: GeneratedPracticeInstance }) {
  const { outcomes = [], games = [], cost } = instance.problem.givenData
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
                <td>{Math.round(outcome.probability * 100)}%</td>
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
                    {outcome.label}: ${outcome.value} ({Math.round(outcome.probability * 100)}%)
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
  return (
    <div className="practice-answer-form">
      {inputs.includes('expectedValue') && (
        <label className="ws-field">
          Expected value
          <input
            className="touch-input"
            value={submission.expectedValue ?? ''}
            onChange={(event) => onChange({ expectedValue: event.target.value })}
            placeholder="$4.50"
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
            placeholder="$1.25"
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
