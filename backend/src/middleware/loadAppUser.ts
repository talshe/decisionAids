import type { Response, NextFunction } from 'express'
import type { AppStore } from '../data/appStore'
import type { AuthenticatedRequest } from './verifyFirebaseToken'

export const loadAppUser =
  (store: AppStore) =>
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication is required.' })
    }

    const appUser = await store.bootstrapUser(req.user)
    req.appUser = appUser
    return next()
  }
