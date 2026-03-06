import type { NextFunction, Response } from 'express'
import type { DecodedIdToken } from 'firebase-admin/auth'
import { adminAuth } from '../lib/firebaseAdmin'
import type { UserProfile } from '../domain/models'

export type AuthenticatedRequest = Express.Request & {
  user?: DecodedIdToken
  appUser?: UserProfile
}

export const verifyFirebaseToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header.' })
  }

  if (!adminAuth) {
    return res.status(503).json({
      error:
        'Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.',
    })
  }

  const token = authHeader.replace('Bearer ', '')
  try {
    const decodedToken = await adminAuth.verifyIdToken(token)
    req.user = decodedToken
    return next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }
}
