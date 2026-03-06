import { Router } from 'express'
import type { AppStore } from '../data/appStore'
import { loadAppUser } from '../middleware/loadAppUser'
import {
  type AuthenticatedRequest,
  verifyFirebaseToken,
} from '../middleware/verifyFirebaseToken'
import { syncUserRoleClaim } from '../lib/firebaseAdmin'
import { resolveRoleForToken } from '../services/userRoles'

export const createAuthRouter = (store: AppStore) => {
  const router = Router()

  router.post(
    '/auth/session',
    verifyFirebaseToken,
    loadAppUser(store),
    async (req: AuthenticatedRequest, res) => {
      const user = req.user
      const appUser = req.appUser
      if (!user || !appUser) {
        return res.status(401).json({ error: 'Authentication is required.' })
      }

      const resolvedRole = resolveRoleForToken(user)
      const profile =
        appUser.role === resolvedRole
          ? appUser
          : await store.setUserRole(user.uid, resolvedRole)

      if (profile) {
        await syncUserRoleClaim(profile.uid, profile.role)
      }

      return res.json({
        uid: user.uid,
        email: user.email,
        name: user.name,
        provider: user.firebase?.sign_in_provider,
        role: profile?.role ?? resolvedRole,
        profile,
      })
    },
  )

  router.get(
    '/me',
    verifyFirebaseToken,
    loadAppUser(store),
    (req: AuthenticatedRequest, res) => {
      const user = req.user
      const appUser = req.appUser
      res.json({
        uid: user?.uid,
        email: user?.email,
        name: user?.name,
        provider: user?.firebase?.sign_in_provider,
        role: appUser?.role,
        profile: appUser,
      })
    },
  )

  return router
}
