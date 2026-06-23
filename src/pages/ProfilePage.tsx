import { useAuth } from '../hooks/useAuth'

function formatDate(iso: string | undefined) {
  if (!iso) {
    return '—'
  }
  return new Date(iso).toLocaleString()
}

export function ProfilePage() {
  const { profile, signOut } = useAuth()

  if (!profile) {
    return (
      <div className="page">
        <section className="card">
          <p>Profile not available.</p>
        </section>
      </div>
    )
  }

  return (
    <div className="page">
      <section className="card">
        <h1>Profile</h1>
        <dl className="profile-list">
          <div>
            <dt>Display name</dt>
            <dd>{profile.displayName || '—'}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{profile.email || '—'}</dd>
          </div>
          <div>
            <dt>User ID</dt>
            <dd className="mono">{profile.userId}</dd>
          </div>
          <div>
            <dt>Account created</dt>
            <dd>{formatDate(profile.createdAt)}</dd>
          </div>
          <div>
            <dt>Last login</dt>
            <dd>{formatDate(profile.lastLoginAt)}</dd>
          </div>
        </dl>
        <button type="button" className="btn-secondary" onClick={() => void signOut()}>
          Sign out
        </button>
      </section>
    </div>
  )
}
