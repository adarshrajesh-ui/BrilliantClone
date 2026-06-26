import { Link } from 'react-router-dom'
import {
  landingCourse,
  landingFeatures,
  landingHero,
  landingLessons,
  landingStats,
  landingTestimonials,
} from './landingContent'

interface LandingNavProps {
  isStuck: boolean
}

export function LandingNav({ isStuck }: LandingNavProps) {
  return (
    <header className="landing-nav-shell">
      <nav className="landing-nav" data-stuck={isStuck || undefined} aria-label="Landing page">
        <Link className="landing-wordmark" to="/" aria-label="Midpoint home">
          <span className="landing-wordmark-mark" aria-hidden="true">M</span>
          <span>Midpoint</span>
        </Link>
        <div className="landing-nav-actions">
          <Link className="landing-button landing-button-secondary" to="/login">
            Sign in
          </Link>
          <Link className="landing-button landing-button-primary" to="/login">
            Get started
          </Link>
        </div>
      </nav>
    </header>
  )
}

export function LandingHero() {
  return (
    <section className="landing-hero" aria-labelledby="landing-hero-title">
      <div className="landing-hero-copy">
        <p className="landing-eyebrow">{landingHero.eyebrow}</p>
        <h1 id="landing-hero-title">{landingHero.title}</h1>
        <p className="landing-hero-subtitle">{landingHero.subtitle}</p>
        <div className="landing-hero-actions">
          <Link className="landing-button landing-button-primary landing-button-large" to="/login">
            Get started
          </Link>
          <Link className="landing-button landing-button-secondary landing-button-large" to="/login">
            Sign in
          </Link>
        </div>
      </div>

      <div className="landing-hero-card" aria-label="Expected value course preview">
        <div className="landing-orbit landing-orbit-one" aria-hidden="true" />
        <div className="landing-orbit landing-orbit-two" aria-hidden="true" />
        <div className="landing-demo-window">
          <div className="landing-demo-toolbar">
            <span />
            <span />
            <span />
          </div>
          <div className="landing-demo-problem">
            <span className="landing-demo-chip">Question</span>
            <h2>Which game is better in the long run?</h2>
            <div className="landing-demo-games">
              <div className="landing-game-card landing-game-card-active">
                <strong>Wheel A</strong>
                <span>3 winning sections</span>
                <b>$8 average payout</b>
              </div>
              <div className="landing-game-card">
                <strong>Wheel B</strong>
                <span>1 jackpot section</span>
                <b>$6 average payout</b>
              </div>
            </div>
            <div className="landing-demo-feedback">
              <span className="landing-feedback-dot" aria-hidden="true" />
              Expected value compares all outcomes by their weight.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function LandingStats() {
  return (
    <section className="landing-stats" aria-label="Course highlights">
      {landingStats.map((stat) => (
        <div className="landing-stat-card" key={stat.label}>
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
        </div>
      ))}
    </section>
  )
}

export function LandingFeatureRows() {
  return (
    <section className="landing-section landing-features" aria-labelledby="landing-features-title">
      <div className="landing-section-heading">
        <p className="landing-eyebrow">Learn by doing</p>
        <h2 id="landing-features-title">The lesson reacts as you reason.</h2>
      </div>
      <div className="landing-feature-list">
        {landingFeatures.map((feature, index) => (
          <article className="landing-feature-row" data-reverse={index % 2 === 1 || undefined} key={feature.id}>
            <LandingFeatureVisual title={feature.visualTitle} kind={feature.visualKind} />
            <div className="landing-feature-copy">
              <p className="landing-eyebrow">{feature.eyebrow}</p>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function LandingFeatureVisual({ title, kind }: { title: string; kind: string }) {
  return (
    <div className={`landing-feature-visual landing-feature-visual-${kind}`} aria-label={title}>
      <div className="landing-visual-header">
        <span>{title}</span>
        <b>EV</b>
      </div>
      {kind === 'graph' && (
        <div className="landing-mini-graph" aria-hidden="true">
          <span style={{ height: '38%' }} />
          <span style={{ height: '58%' }} />
          <span style={{ height: '46%' }} />
          <span style={{ height: '68%' }} />
          <span style={{ height: '63%' }} />
          <span style={{ height: '72%' }} />
        </div>
      )}
      {kind === 'equation' && (
        <div className="landing-equation-stack" aria-hidden="true">
          <span>0.5 x $10</span>
          <span>+</span>
          <span>0.5 x $2</span>
          <strong>= $6</strong>
        </div>
      )}
      {kind === 'cards' && (
        <div className="landing-card-table" aria-hidden="true">
          <span>Pay</span>
          <span>Cost</span>
          <span>Profit</span>
          <b>$12</b>
          <b>$5</b>
          <b>$7</b>
        </div>
      )}
    </div>
  )
}

export function LandingCoursePreview() {
  return (
    <section className="landing-course" aria-labelledby="landing-course-title">
      <div className="landing-course-heading">
        <p className="landing-eyebrow">From intuition to decisions</p>
        <h2 id="landing-course-title">{landingCourse.title}</h2>
        <p>{landingCourse.description}</p>
      </div>

      <div className="landing-course-panel">
        <div className="landing-course-tabs" aria-label="Course subjects">
          <button type="button" className="landing-course-tab landing-course-tab-active">Expected Value</button>
          <button type="button" className="landing-course-tab" disabled>Risk</button>
          <button type="button" className="landing-course-tab" disabled>Fairness</button>
        </div>
        <div className="landing-course-body">
          <div className="landing-lesson-list">
            <h3>Covered lessons</h3>
            <ul>
              {landingLessons.map((lesson) => (
                <li key={lesson.id}>
                  <span>{lesson.order}</span>
                  <div>
                    <strong>{lesson.title}</strong>
                    <small>{lesson.problemCount} problems</small>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="landing-course-card">
            <span className="landing-demo-chip">Course preview</span>
            <h3>{landingCourse.subtitle}</h3>
            <ul>
              {landingCourse.problemTitles.map((title) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export function LandingTestimonials() {
  return (
    <section className="landing-section landing-testimonials" aria-labelledby="landing-testimonials-title">
      <div className="landing-section-heading">
        <p className="landing-eyebrow">What it feels like</p>
        <h2 id="landing-testimonials-title">A focused tutor-style course without the passive reading.</h2>
      </div>
      <div className="landing-testimonial-grid">
        {landingTestimonials.map((testimonial) => (
          <figure className="landing-testimonial-card" key={testimonial.name}>
            <blockquote>{testimonial.quote}</blockquote>
            <figcaption>
              <strong>{testimonial.name}</strong>
              <span>{testimonial.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

export function LandingFooterCta() {
  return (
    <section className="landing-footer-cta" aria-labelledby="landing-footer-title">
      <p className="landing-eyebrow">Ready when you are</p>
      <h2 id="landing-footer-title">The clearest expected value lesson is already here.</h2>
      <Link className="landing-button landing-button-light landing-button-large" to="/login">
        Get started
      </Link>
    </section>
  )
}
