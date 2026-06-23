/** View-model types for the golf-course progress map (presentation only). */

export type HoleState = 'complete' | 'current' | 'future' | 'final'

export interface CourseHoleView {
  problemId: string
  /** 1-based global hole number. */
  order: number
  title: string
  /** Visual state. `final` is the capstone; it may also be complete/current —
   * see `isComplete` / `isCurrent` for those orthogonal flags. */
  state: HoleState
  isFinal: boolean
  isComplete: boolean
  isCurrent: boolean
}

export interface CourseZoneView {
  lessonId: string
  title: string
  /** 1-based lesson order. */
  order: number
  holes: CourseHoleView[]
  completedCount: number
  total: number
  isComplete: boolean
  isCurrent: boolean
}

export interface CourseMapView {
  zones: CourseZoneView[]
  /** 1-based number of the current/next hole (or total when all complete). */
  currentHoleOrder: number
  totalHoles: number
  completedCount: number
  allComplete: boolean
}
