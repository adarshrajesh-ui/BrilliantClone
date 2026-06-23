import { useAuth } from '../hooks/useAuth'

export function GoogleSignInButton() {
  const { signInWithGoogle, authError, clearAuthError } = useAuth()

  return (
    <div className="sign-in-actions">
      <button
        type="button"
        className="btn-google"
        onClick={() => {
          clearAuthError()
          void signInWithGoogle()
        }}
      >
        <span className="google-icon" aria-hidden="true">
          G
        </span>
        Sign in with Google
      </button>
      {authError && <p className="error-message">{authError}</p>}
    </div>
  )
}
