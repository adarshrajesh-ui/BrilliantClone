interface DemoProgressProps {
  /** 0-based current step index. */
  index: number
  total: number
  onGoto?: (index: number) => void
}

/** Visible step progress for the mini-demo (dots + "Step X of N"). */
export function DemoProgress({ index, total, onGoto }: DemoProgressProps) {
  return (
    <div className="demo-progress">
      <ol className="demo-progress-dots" aria-hidden="true">
        {Array.from({ length: total }).map((_, i) => {
          const state = i === index ? 'current' : i < index ? 'done' : 'todo'
          const className = `demo-dot demo-dot-${state}`
          if (onGoto) {
            return (
              <li key={i}>
                <button
                  type="button"
                  className={className}
                  onClick={() => onGoto(i)}
                  tabIndex={-1}
                />
              </li>
            )
          }
          return (
            <li key={i}>
              <span className={className} />
            </li>
          )
        })}
      </ol>
      <span className="demo-progress-label">
        Step {Math.min(index + 1, total)} of {total}
      </span>
    </div>
  )
}
