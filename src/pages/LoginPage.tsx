import { GoogleSignInButton } from '../components/GoogleSignInButton'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { firebaseConfigured, signInAsGuest } = useAuth()

  return (
    <div className="page-center">
      <div className="card login-card">
        <h1>Midpoint</h1>
        <p className="subtitle">
          A hands-on course on expected value.
        </p>

        {!firebaseConfigured ? (
          <div className="setup-notice">
            <p>Sign-in is temporarily unavailable. You can still continue as a guest.</p>
          </div>
        ) : (
          <GoogleSignInButton />
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
      </div>
    </div>
  )
}
