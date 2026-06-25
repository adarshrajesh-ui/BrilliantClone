import { Link } from 'react-router-dom'
import { CHAPTER_PROBLEMS } from '../data/chapter'
import type { ChapterProgress, Milestones } from '../types/chapter'

const CHAPTER_PATH = '/chapter/expected-value-intro'

interface ChapterProgressCardProps {
  progress: ChapterProgress
  milestones: Milestones | null
  continueProblemId: string
}

type HoleState = 'complete' | 'current' | 'upcoming'

// Geometry for the winding mini course. Holes alternate side-to-side and the
// fairway is drawn as one smooth path threading through every cup.
const HOLE_GAP = 58
const TOP = 34
const LEFT_X = 52
const RIGHT_X = 148
const VIEW_W = 200

function holePoint(index: number) {
  return {
    x: index % 2 === 0 ? LEFT_X : RIGHT_X,
    y: TOP + index * HOLE_GAP,
  }
}

function buildFairway(count: number): string {
  if (count === 0) return ''
  const start = holePoint(0)
  let d = `M ${start.x} ${start.y}`
  for (let i = 1; i < count; i += 1) {
    const prev = holePoint(i - 1)
    const curr = holePoint(i)
    const midY = (prev.y + curr.y) / 2
    d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`
  }
  return d
}

export function ChapterProgressCard({
  progress,
  milestones,
  continueProblemId,
}: ChapterProgressCardProps) {
  const total = CHAPTER_PROBLEMS.length
  const completedCount = progress.completedProblemIds.length
  const allComplete = completedCount === total
  const hasProgress = completedCount > 0

  const continueIndex = CHAPTER_PROBLEMS.findIndex(
    (p) => p.problemId === continueProblemId,
  )
  const currentNumber = allComplete ? total : continueIndex + 1
  const currentProblem = CHAPTER_PROBLEMS[allComplete ? total - 1 : continueIndex]

  const unlockedMilestones = milestones?.unlockedMilestones.length ?? 0
  const totalMilestones = 5

  const viewH = TOP + (total - 1) * HOLE_GAP + 44
  const fairway = buildFairway(total)

  return (
    <aside className="chapter-progress-card" aria-label="Current chapter progress">
      <div className="cpc-header">
        <p className="cpc-eyebrow">Current chapter</p>
        <h2 className="cpc-title">Midpoint</h2>
        <p className="cpc-subtitle">
          Interactive expected value course.
        </p>
      </div>

      <div className="cpc-stats">
        <div className="cpc-stat cpc-stat-pct">
          <span className="cpc-stat-value">{progress.completionPercentage}%</span>
          <span className="cpc-stat-label">Complete</span>
        </div>
        <div className="cpc-stat">
          <span className="cpc-stat-value">🔥 {progress.streakCount}</span>
          <span className="cpc-stat-label">Day streak</span>
        </div>
        <div className="cpc-stat">
          <span className="cpc-stat-value">{progress.masteryStatus}</span>
          <span className="cpc-stat-label">Mastery</span>
        </div>
      </div>

      <p className="cpc-current">
        {allComplete ? (
          <span className="cpc-current-text">Course complete — replay any problem to review.</span>
        ) : (
          <>
            <span className="cpc-current-flag" aria-hidden="true" />
            <span className="cpc-current-text">
              Next up: <strong>Problem {currentNumber}</strong> · {currentProblem?.title}
            </span>
          </>
        )}
      </p>

      <div className="cpc-course" role="img" aria-label={`Course map: ${completedCount} of ${total} problems complete`}>
        <svg viewBox={`0 0 ${VIEW_W} ${viewH}`} className="cpc-course-svg" preserveAspectRatio="xMidYMin meet">
          <defs>
            <linearGradient id="cpc-grass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#166534" />
              <stop offset="100%" stopColor="#052e16" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width={VIEW_W} height={viewH} rx="18" fill="url(#cpc-grass)" />

          <path d={fairway} className="cpc-fairway-base" />
          <path d={fairway} className="cpc-fairway" />

          {CHAPTER_PROBLEMS.map((problem, i) => {
            const { x, y } = holePoint(i)
            const isComplete = progress.completedProblemIds.includes(problem.problemId)
            const isCurrent = !allComplete && problem.problemId === continueProblemId
            const isFinal = i === total - 1
            const state: HoleState = isComplete
              ? 'complete'
              : isCurrent
                ? 'current'
                : 'upcoming'
            const r = isFinal ? 17 : 13

            return (
              <g
                key={problem.problemId}
                className={`cpc-hole cpc-hole-${state}${isFinal ? ' cpc-hole-final' : ''}`}
              >
                <title>
                  {`Problem ${problem.order}: ${problem.title} — ${
                    isComplete ? 'complete' : isCurrent ? 'current' : 'upcoming'
                  }`}
                </title>
                {isCurrent && <circle cx={x} cy={y} r={r + 7} className="cpc-hole-glow" />}
                <circle cx={x} cy={y} r={r} className="cpc-hole-cup" />
                {/* tiny flag for upcoming holes */}
                {state === 'upcoming' && !isFinal && (
                  <g className="cpc-hole-flagmark" aria-hidden="true">
                    <line x1={x} y1={y - r} x2={x} y2={y - r - 9} />
                    <polygon points={`${x},${y - r - 9} ${x + 8},${y - r - 6} ${x},${y - r - 3}`} />
                  </g>
                )}
                <text x={x} y={y} className="cpc-hole-text" textAnchor="middle" dominantBaseline="central">
                  {isFinal ? '🏆' : isComplete ? '✓' : problem.order}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="cpc-milestones" aria-label="Milestones unlocked">
        <span className="cpc-milestones-label">Milestones</span>
        <span className="cpc-milestones-track" aria-hidden="true">
          {Array.from({ length: totalMilestones }).map((_, i) => (
            <span
              key={i}
              className={`cpc-milestone-dot${i < unlockedMilestones ? ' cpc-milestone-on' : ''}`}
            />
          ))}
        </span>
        <span className="cpc-milestones-count">
          {unlockedMilestones}/{totalMilestones}
        </span>
      </div>

      <div className="cpc-actions">
        <Link to={`${CHAPTER_PATH}/problem/${continueProblemId}`} className="cpc-btn-primary touch-target">
          {allComplete ? 'Review course' : hasProgress ? 'Continue' : 'Start course'}
        </Link>
        {hasProgress && !allComplete && (
          <Link to={CHAPTER_PATH} className="cpc-btn-ghost touch-target">
            Review previous
          </Link>
        )}
      </div>
    </aside>
  )
}
