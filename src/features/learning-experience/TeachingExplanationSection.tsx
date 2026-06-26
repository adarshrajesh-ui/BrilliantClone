import type { TeachingExplanation } from '../../types/problem'

export interface TeachingExplanationSectionProps {
  explanation: TeachingExplanation
  className?: string
  id?: string
}

/**
 * Hand-written post-completion teaching block. Shown after a correct answer or
 * in review mode — never as a bare "your final answer" recap.
 */
export function TeachingExplanationSection({
  explanation,
  className = '',
  id,
}: TeachingExplanationSectionProps) {
  return (
    <section
      id={id}
      className={`teaching-explanation${className ? ` ${className}` : ''}`}
      aria-label={explanation.title}
    >
      <h3 className="teaching-explanation-title">{explanation.title}</h3>
      <div className="teaching-explanation-body">
        {explanation.body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
      {explanation.takeaway && (
        <p className="teaching-explanation-takeaway">
          <span className="teaching-explanation-takeaway-label">Key takeaway</span>
          {explanation.takeaway}
        </p>
      )}
    </section>
  )
}
