import { Link } from 'react-router-dom'
import { resolveToImplementedProblemId } from '../data/implementedProblems'
import { useAuth } from '../hooks/useAuth'
import { useChapterData } from '../hooks/useChapterData'
import { useStreak } from '../hooks/useStreak'
import { getDisplayStreak, localDateString } from '../lib/streakService'
import { ChapterSyncBanner } from '../components/SyncWarningBanner'
import { CHAPTER_LESSONS, CHAPTER_TITLE, TOTAL_PROBLEMS, getContinueProblemId, getCurrentLessonId } from '../data/chapter'

const CHAPTER_PATH = '/chapter/expected-value-intro'
const problemHref = (problemId: string) => `${CHAPTER_PATH}/problem/${problemId}`

const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

interface MonthCell {
  /** Stable React key (date string for real days, a synthetic id for blanks). */
  key: string
  /** Day-of-month number, or null for a leading blank alignment cell. */
  day: number | null
  active: boolean
  isToday: boolean
}

/**
 * Calendar cells for the learner's current LOCAL month. Leading blank cells pad
 * the grid so day 1 lands under its correct weekday column (Sunday-first).
 */
function buildMonthCells(activity: Record<string, number>): MonthCell[] {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const todayKey = localDateString(today)

  const leadingBlanks = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: MonthCell[] = []
  for (let i = 0; i < leadingBlanks; i += 1) {
    cells.push({ key: `blank-${i}`, day: null, active: false, isToday: false })
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = localDateString(new Date(year, month, day))
    cells.push({
      key,
      day,
      active: (activity[key] ?? 0) > 0,
      isToday: key === todayKey,
    })
  }
  return cells
}

/**
 * Consistency-first daily streak card. The month calendar is the PRIMARY visual;
 * the streak number is deliberately secondary. Surfaces a banked freeze (grace
 * day) and, after a lapse, compassionate "habit strength" framing that surfaces
 * longest streak / total active days instead of shaming a broken one.
 */
function StreakCard() {
  const { streak, weekActivity } = useStreak()
  const monthCells = buildMonthCells(weekActivity)
  const now = new Date()
  const monthLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`
  const activeDaysThisMonth = monthCells.filter((cell) => cell.active).length
  const displayStreak = getDisplayStreak(streak)
  const activeToday = (weekActivity[localDateString()] ?? 0) > 0
  const hasHistory = (streak?.totalActiveDays ?? 0) > 0
  const lapsed = displayStreak === 0 && hasHistory
  const freezeReady = (streak?.freezeAvailable ?? false) && displayStreak > 0

  let caption: string
  if (displayStreak > 0) {
    caption = activeToday
      ? `${displayStreak}-day streak — see you tomorrow!`
      : `Practice today to keep your ${displayStreak}-day streak.`
  } else if (lapsed) {
    caption = 'Your habit strength is intact — pick up where you left off.'
  } else {
    caption = 'Complete a problem to start your streak.'
  }

  return (
    <section className="br-streak-card" aria-label="Daily streak and monthly consistency">
      <p className="br-month-label">{monthLabel}</p>

      <div className="br-month-weekdays" aria-hidden="true">
        {WEEKDAY_INITIALS.map((initial, index) => (
          <span key={`${initial}-${index}`}>{initial}</span>
        ))}
      </div>

      <div
        className="br-month-grid"
        role="img"
        aria-label={`${activeDaysThisMonth} active days in ${monthLabel}`}
      >
        {monthCells.map((cell) =>
          cell.day === null ? (
            <span key={cell.key} className="br-month-cell br-month-blank" aria-hidden="true" />
          ) : (
            <span
              key={cell.key}
              className={`br-month-cell${cell.active ? ' br-month-on' : ''}${
                cell.isToday ? ' br-month-today' : ''
              }`}
            >
              {cell.day}
            </span>
          ),
        )}
      </div>

      <div className="br-streak-summary">
        <span
          className={`br-streak-count${displayStreak === 0 ? ' br-streak-count-zero' : ''}`}
          aria-hidden="true"
        >
          <strong>{displayStreak}</strong>
          <span>🔥</span>
        </span>
        <p className="br-streak-caption">{caption}</p>
      </div>

      {freezeReady && (
        <p className="br-streak-note">
          <span aria-hidden="true">❄️</span> Streak freeze ready — one missed day is covered.
        </p>
      )}
      {lapsed && (
        <p className="br-streak-note br-streak-note-recover">
          <span aria-hidden="true">🛡️</span> Best {streak?.longestStreak ?? 0} days ·{' '}
          {streak?.totalActiveDays ?? 0} active days banked
        </p>
      )}
    </section>
  )
}

function DiceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8" cy="8" r="1.35" fill="currentColor" />
      <circle cx="16" cy="8" r="1.35" fill="currentColor" />
      <circle cx="12" cy="12" r="1.35" fill="currentColor" />
      <circle cx="8" cy="16" r="1.35" fill="currentColor" />
      <circle cx="16" cy="16" r="1.35" fill="currentColor" />
    </svg>
  )
}

function ScaleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3.5v15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5 7h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 20h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M5 7 2.6 12a2.4 2.4 0 0 0 4.8 0L5 7Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M19 7l-2.4 5a2.4 2.4 0 0 0 4.8 0L19 7Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TableIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 9.5h17" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 14.5h17" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9 9.5v10" stroke="currentColor" strokeWidth="1.3" />
      <path d="M15 9.5v10" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function CoinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 7v10M14.4 9.1c-.5-.7-1.4-1.1-2.4-1.1-1.3 0-2.4.8-2.4 1.9 0 2.5 4.8 1.3 4.8 3.8 0 1.1-1.1 1.9-2.4 1.9-1 0-1.9-.4-2.4-1.1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 20h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="5.5" y="12" width="3.4" height="6" rx="1" fill="currentColor" />
      <rect x="10.3" y="6.5" width="3.4" height="11.5" rx="1" fill="currentColor" />
      <rect x="15.1" y="14" width="3.4" height="4" rx="1" fill="currentColor" />
    </svg>
  )
}

const THUMBNAIL_ICONS = {
  dice: DiceIcon,
  scale: ScaleIcon,
  table: TableIcon,
  coin: CoinIcon,
  chart: ChartIcon,
} as const

type ThumbnailIconKey = keyof typeof THUMBNAIL_ICONS

const LESSON_THUMBNAIL_ICONS: Record<string, ThumbnailIconKey> = {
  'lesson-1': 'dice',
  'lesson-2': 'scale',
  'lesson-3': 'table',
  'lesson-4': 'coin',
  'lesson-5': 'chart',
}

const lessonThumbnails = CHAPTER_LESSONS.map((lesson) => ({
  lessonId: lesson.lessonId,
  title: lesson.title,
  icon: LESSON_THUMBNAIL_ICONS[lesson.lessonId] ?? 'dice',
  targetProblemId: resolveToImplementedProblemId(lesson.problemIds[0]),
}))

function CourseHeroArt() {
  return (
    <div className="br-course-art" aria-hidden="true">
      <div className="br-coin br-coin-back" />
      <div className="br-coin br-coin-front">
        <span>★</span>
      </div>
      <div className="br-dice br-dice-one">
        <span />
        <span />
        <span />
      </div>
      <div className="br-dice br-dice-two">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="br-ribbon" />
    </div>
  )
}

function ThumbnailArt({ icon }: { icon: ThumbnailIconKey }) {
  const Icon = THUMBNAIL_ICONS[icon]
  return (
    <span className="br-thumb-art" aria-hidden="true">
      <Icon />
    </span>
  )
}

export function HomePage() {
  const { profile, isGuest } = useAuth()
  // First name keeps the greeting short ("Hi, Adarsh"); guests read "Hi, Guest".
  const greetingName = (profile?.displayName?.trim() || (isGuest ? 'Guest' : 'there')).split(
    /\s+/,
  )[0]
  const { progress, loading, syncWarning } = useChapterData()
  const continueProblemId = resolveToImplementedProblemId(
    progress ? getContinueProblemId(progress) : 'problem-1',
  )
  const completedCount = progress?.completedProblemIds.length ?? 0
  const isStarted = completedCount > 0
  const startLabel = loading ? 'Loading…' : isStarted ? 'Continue' : 'Start'
  const currentLessonId = getCurrentLessonId(continueProblemId)
  const activeLesson = CHAPTER_LESSONS.find((lesson) => lesson.lessonId === currentLessonId) ?? CHAPTER_LESSONS[0]
  const nextLesson = CHAPTER_LESSONS.find((lesson) => lesson.order === activeLesson.order + 1)
  const ActiveLessonIcon = THUMBNAIL_ICONS[LESSON_THUMBNAIL_ICONS[activeLesson.lessonId] ?? 'dice']

  return (
    <div className="br-home-page">
      <ChapterSyncBanner message={syncWarning} />

      <div className="br-home-shell">
        <aside className="br-side-rail" aria-label="Learning status">
          <p className="br-greeting">
            Hi, <span className="br-greeting-name">{greetingName}</span>
          </p>

          <StreakCard />
        </aside>

        <main className="br-course-stage" aria-label="Current course">
          <section className="br-course-card">
            <div className="br-card-stack br-card-stack-one" aria-hidden="true" />
            <div className="br-card-stack br-card-stack-two" aria-hidden="true" />

            <div className="br-course-content">
              <p className="br-course-title">{CHAPTER_TITLE}</p>
              <p className="br-level">{CHAPTER_LESSONS.length} lessons • {TOTAL_PROBLEMS} problems</p>
              <CourseHeroArt />

              <div className="br-lesson-list">
                <div className="br-lesson-row br-lesson-active">
                  <span className="br-lesson-icon" aria-hidden="true">
                    <ActiveLessonIcon />
                  </span>
                  <span>{activeLesson.title}</span>
                  <i aria-hidden="true" />
                </div>
                {nextLesson && (
                  <div className="br-lesson-row br-lesson-locked">
                    <span className="br-lesson-icon" aria-hidden="true" />
                    <span>{nextLesson.title}</span>
                    <i aria-hidden="true" />
                  </div>
                )}
              </div>

              <Link to={problemHref(continueProblemId)} className="br-start-button">
                {startLabel}
              </Link>
            </div>
          </section>

          <div className="br-thumbnail-row" aria-label="Course sections">
            {lessonThumbnails.map((item) => (
              <Link
                key={item.lessonId}
                to={problemHref(item.targetProblemId)}
                className={
                  item.lessonId === currentLessonId ? 'br-thumb br-thumb-active' : 'br-thumb'
                }
                aria-label={item.title}
              >
                <ThumbnailArt icon={item.icon} />
              </Link>
            ))}
          </div>

          {isStarted && (
            <p className="br-progress-note">
              {completedCount} problems complete. Continue where you left off.
            </p>
          )}
        </main>
      </div>
    </div>
  )
}
