// Reusable golf-course progress map (Agent 2). Derivation is pure; rendering is
// SVG/CSS only with original artwork. No progression logic lives here.

export { buildCourseMapView, flattenHoles } from './courseMapModel'
export { CompactCourseMap } from './CompactCourseMap'
export { CurrentChapterCard } from './CurrentChapterCard'
export type { CurrentChapterCardProps } from './CurrentChapterCard'
export { ExpandedCoursePathway } from './ExpandedCoursePathway'
export { LessonZone } from './LessonZone'
export { CourseHole } from './CourseHole'

export type {
  HoleState,
  CourseHoleView,
  CourseZoneView,
  CourseMapView,
} from './types'
