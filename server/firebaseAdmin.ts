import { cert, getApps, initializeApp, type App, type ServiceAccount } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

function projectIdFromEnv(): string | undefined {
  return (
    process.env.FIREBASE_PROJECT_ID ??
    process.env.GCLOUD_PROJECT ??
    process.env.GOOGLE_CLOUD_PROJECT ??
    process.env.VITE_FIREBASE_PROJECT_ID
  )
}

function normalizePrivateKey(value: string | undefined): string | undefined {
  return value?.replace(/\\n/g, '\n')
}

function serviceAccountFromJson(): ServiceAccount | undefined {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!raw) {
    return undefined
  }

  const parsed = JSON.parse(raw) as {
    project_id?: string
    projectId?: string
    client_email?: string
    clientEmail?: string
    private_key?: string
    privateKey?: string
  }

  const projectId = parsed.project_id ?? parsed.projectId
  const clientEmail = parsed.client_email ?? parsed.clientEmail
  const privateKey = normalizePrivateKey(parsed.private_key ?? parsed.privateKey)

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is missing project_id, client_email, or private_key.')
  }

  return { projectId, clientEmail, privateKey }
}

function serviceAccountFromSplitEnv(): ServiceAccount | undefined {
  const projectId = projectIdFromEnv()
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY)

  if (!projectId || !clientEmail || !privateKey) {
    return undefined
  }

  return { projectId, clientEmail, privateKey }
}

function getAdminApp(): App {
  const existing = getApps()[0]
  if (existing) {
    return existing
  }

  const serviceAccount = serviceAccountFromJson() ?? serviceAccountFromSplitEnv()
  if (!serviceAccount) {
    throw new Error('Firebase Admin credentials are not configured for Vercel API routes.')
  }

  return initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.projectId ?? projectIdFromEnv(),
  })
}

export function getAdminDb() {
  return getFirestore(getAdminApp())
}

export async function getVerifiedUid(request: Request): Promise<string | undefined> {
  const authHeader = request.headers.get('authorization')
  const match = authHeader?.match(/^Bearer\s+(.+)$/i)
  if (!match) {
    return undefined
  }

  const decoded = await getAuth(getAdminApp()).verifyIdToken(match[1])
  return decoded.uid
}
