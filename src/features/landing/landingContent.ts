import {
  CHAPTER_DESCRIPTION,
  CHAPTER_LESSONS,
  CHAPTER_PROBLEMS,
  CHAPTER_SUBTITLE,
  TOTAL_LESSONS,
  TOTAL_PROBLEMS,
} from '../../data/chapter'

export const landingHero = {
  eyebrow: 'Interactive math for real decisions',
  title: 'A world-class expected value lesson, built to play with.',
  subtitle:
    'Midpoint turns probability into a hands-on course: spin wheels, compare payouts, build models, and see why the long-run average matters.',
}

export const landingStats = [
  { value: `${TOTAL_LESSONS}`, label: 'guided lessons' },
  { value: `${TOTAL_PROBLEMS}`, label: 'interactive problems' },
  { value: 'Step by step', label: 'feedback on every attempt' },
]

export const landingFeatures = [
  {
    id: 'click',
    eyebrow: 'Concepts that click',
    title: 'See averages form before you calculate them.',
    body:
      'Start with playful simulations, then watch the data settle into the long-run value you are trying to predict.',
    visualTitle: 'Long-run average',
    visualKind: 'graph',
  },
  {
    id: 'think',
    eyebrow: 'Built to make you think',
    title: 'Every choice asks for a reason, not just an answer.',
    body:
      'The workspace keeps the question, model, and feedback together so learners can repair mistakes while the idea is still fresh.',
    visualTitle: 'Model builder',
    visualKind: 'equation',
  },
  {
    id: 'decide',
    eyebrow: 'Designed for judgment',
    title: 'Compare payout, profit, fairness, and risk side by side.',
    body:
      'Expected value is not a memorized formula here. It becomes a decision tool for games, offers, and uncertain outcomes.',
    visualTitle: 'Decision table',
    visualKind: 'cards',
  },
]

export const landingLessons = CHAPTER_LESSONS.map((lesson) => ({
  id: lesson.lessonId,
  order: lesson.order,
  title: lesson.title,
  problemCount: lesson.problemIds.length,
}))

export const landingCourse = {
  title: 'Expected Value',
  subtitle: CHAPTER_SUBTITLE,
  description: CHAPTER_DESCRIPTION,
  problemTitles: CHAPTER_PROBLEMS.slice(0, 6).map((problem) => problem.title),
}

export const landingTestimonials = [
  {
    quote:
      'The animations made expected value feel concrete. I could finally see why a game can look exciting and still be a bad bet.',
    name: 'Maya',
    role: 'Student',
  },
  {
    quote:
      'The course keeps learners active. They test an idea, get feedback, and revise instead of reading a wall of explanation.',
    name: 'Jordan',
    role: 'Tutor',
  },
  {
    quote:
      'It feels like a small lab for probability. The blue cards, models, and checkpoints make progress easy to follow.',
    name: 'Priya',
    role: 'Parent',
  },
]
