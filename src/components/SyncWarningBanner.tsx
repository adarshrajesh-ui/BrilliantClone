import { useAuth } from '../hooks/useAuth'

export function SyncWarningBanner() {
  const { profileSyncWarning } = useAuth()

  if (!profileSyncWarning) {
    return null
  }

  return (
    <div className="sync-banner" role="status">
      <strong>Cloud sync issue:</strong> {profileSyncWarning}
    </div>
  )
}

export function ChapterSyncBanner({ message }: { message: string | null }) {
  if (!message) {
    return null
  }

  return (
    <div className="sync-banner" role="status">
      <strong>Progress saved locally.</strong> {message}
    </div>
  )
}
