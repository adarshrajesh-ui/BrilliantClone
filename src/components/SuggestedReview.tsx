import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getSuggestedReview, type ReviewSuggestion } from '../lib/masteryService'

const CHAPTER_PATH = '/chapter/expected-value-intro'

export function SuggestedReview() {
  const { user } = useAuth()
  const [suggestions, setSuggestions] = useState<ReviewSuggestion[]>([])

  useEffect(() => {
    if (!user) {
      return
    }
    void getSuggestedReview(user.uid).then(setSuggestions)
  }, [user])

  if (suggestions.length === 0) {
    return null
  }

  return (
    <section className="card review-section">
      <h2>Suggested review</h2>
      <p className="section-note">
        Based on your attempts and hints, these areas are worth revisiting.
      </p>
      <ul className="review-list">
        {suggestions.map((s) => (
          <li key={s.problemId} className="review-item">
            <Link to={`${CHAPTER_PATH}/problem/${s.problemId}`} className="review-link">
              {s.title}
            </Link>
            <p>{s.reason}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
