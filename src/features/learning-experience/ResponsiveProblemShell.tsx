import type { ReactNode } from 'react'

interface ResponsiveProblemShellProps {
  /** Banner row above the grid (e.g. restart-practice notice). */
  banner?: ReactNode
  /** Current-task panel (grid area: task). */
  taskPanel?: ReactNode
  /** Learning Coach panel (grid area: coach — right rail on desktop, high on mobile). */
  coachPanel?: ReactNode
  /** Hint panel (grid area: hints). */
  hintPanel?: ReactNode
  /** The interactive problem work area (grid area: work). */
  children: ReactNode
}

/**
 * Two-column problem layout.
 *
 * Desktop: a wide work column on the left and a sticky right rail holding the
 * Learning Coach, so feedback is always visible without scrolling.
 * Mobile: a single column ordered task → coach → work → hints, keeping feedback
 * high (below the current task, above the answer controls) and never buried.
 *
 * The coach panel is a single DOM node repositioned purely via CSS grid areas,
 * so there is exactly one live region (no double announcements).
 */
export function ResponsiveProblemShell({
  banner,
  taskPanel,
  coachPanel,
  hintPanel,
  children,
}: ResponsiveProblemShellProps) {
  return (
    <div className="problem-shell">
      {banner && <div className="problem-shell-banner">{banner}</div>}
      <div className="problem-shell-grid">
        {taskPanel && <div className="problem-shell-task">{taskPanel}</div>}
        {coachPanel && <div className="problem-shell-coach">{coachPanel}</div>}
        <div className="problem-shell-work">{children}</div>
        {hintPanel && <div className="problem-shell-hints">{hintPanel}</div>}
      </div>
    </div>
  )
}
