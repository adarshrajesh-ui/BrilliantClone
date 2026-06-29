import { GoogleSignInButton } from '../components/GoogleSignInButton'
import { useAuth } from '../hooks/useAuth'
import '../features/landing/landing.css'

export function LoginPage() {
  const { firebaseConfigured, signInAsGuest } = useAuth()

  return (
    <div className="login-page">
      <main className="login-card">
        <div className="login-wordmark">
          <span className="landing-wordmark-mark" aria-hidden="true">M</span>
          <span>Midpoint</span>
        </div>

        <div className="login-heading">
          <h1 className="login-title">Get started</h1>
          <p className="login-subtitle">
            Learn expected value by playing the games.
          </p>
        </div>

        {!firebaseConfigured ? (
          <div className="setup-notice">
            <p>Sign-in is temporarily unavailable. You can still continue as a guest.</p>
          </div>
        ) : (
          <GoogleSignInButton />
        )}

        {firebaseConfigured && (
          <div className="login-divider" aria-hidden="true">
            <span>or</span>
          </div>
        )}

        <div className="guest-sign-in">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => signInAsGuest()}
          >
            Continue without signing in
          </button>
          <p className="guest-note">
            Guest progress is saved only on this device.
          </p>
        </div>
      </main>
    </div>
  )
}
