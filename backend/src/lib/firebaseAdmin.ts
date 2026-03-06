import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const projectId = process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

export const firebaseAdminAvailable = Boolean(projectId && clientEmail && privateKey)

const adminApp =
  firebaseAdminAvailable && !getApps().length
    ? initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      })
    : getApps()[0] ?? null

if (firebaseAdminAvailable && !adminApp) {
  throw new Error('Firebase Admin failed to initialize.')
}

export const adminAuth = adminApp ? getAuth(adminApp) : null

export const adminDb = adminApp ? getFirestore(adminApp) : null

export const getConfiguredAdminEmails = () =>
  (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)

export const getConfiguredAdminUids = () =>
  (process.env.ADMIN_UIDS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

export const syncUserRoleClaim = async (uid: string, role: 'user' | 'admin') => {
  if (!adminAuth) {
    return
  }

  const userRecord = await adminAuth.getUser(uid)
  const currentClaims = userRecord.customClaims ?? {}

  if (currentClaims.role === role) {
    return
  }

  await adminAuth.setCustomUserClaims(uid, {
    ...currentClaims,
    role,
  })
}
