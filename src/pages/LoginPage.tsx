import { GoogleSignInButton } from '../components/GoogleSignInButton'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { firebaseConfigured, signInAsGuest } = useAuth()

  return (
    <div className="page-center">
      <div className="card login-card">
        <h1>Expected Value Lab</h1>
        <p className="subtitle">
          Learn expected value through visual, interactive problems.
        </p>

        {!firebaseConfigured ? (
          <div className="setup-notice">
            <p>
              Firebase is not configured yet. Copy <code>.env.example</code> to{' '}
              <code>.env</code> and add your Firebase web app credentials.
            </p>
            <p>See README.md for step-by-step Firebase console setup.</p>
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
