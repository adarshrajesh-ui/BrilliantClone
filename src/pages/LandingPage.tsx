import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  LandingCoursePreview,
  LandingFeatureRows,
  LandingFooterCta,
  LandingHero,
  LandingNav,
  LandingStats,
  LandingTestimonials,
} from '../features/landing/LandingSections'
import { PokerChipLoader } from '../components/PokerChipLoader'
import '../features/landing/landing.css'
import { useAuth } from '../hooks/useAuth'

export function LandingPage() {
  const { user, loading } = useAuth()
  const [isNavStuck, setIsNavStuck] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsNavStuck(window.scrollY > 8)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (loading) {
    return <PokerChipLoader label="Loading..." />
  }

  if (user) {
    return <Navigate to="/home" replace />
  }

  return (
    <div className="landing-page">
      <LandingNav isStuck={isNavStuck} />
      <main className="landing-main">
        <LandingHero />
        <LandingStats />
        <LandingFeatureRows />
        <LandingCoursePreview />
        <LandingTestimonials />
        <LandingFooterCta />
      </main>
    </div>
  )
}
