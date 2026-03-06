import { Router } from 'express'
import type { AppStore } from '../data/appStore'
import type { AdminDecisionAidInput, UserRole } from '../domain/models'
import { loadAppUser } from '../middleware/loadAppUser'
import { requireAdmin } from '../middleware/requireAdmin'
import {
  type AuthenticatedRequest,
  verifyFirebaseToken,
} from '../middleware/verifyFirebaseToken'
import { syncUserRoleClaim } from '../lib/firebaseAdmin'

const isUserRole = (value: unknown): value is UserRole =>
  value === 'user' || value === 'admin'

const isDecisionAidInput = (value: unknown): value is AdminDecisionAidInput => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const decisionAid = value as Partial<AdminDecisionAidInput>
  return Boolean(
    decisionAid.slug &&
      decisionAid.title &&
      decisionAid.summary &&
      decisionAid.publishStatus &&
      Array.isArray(decisionAid.tags) &&
      Array.isArray(decisionAid.steps) &&
      typeof decisionAid.estimatedMinutes === 'number' &&
      decisionAid.createdBy,
  )
}

export const createAdminRouter = (store: AppStore) => {
  const router = Router()

  router.use(verifyFirebaseToken, loadAppUser(store), requireAdmin)

  router.get('/admin/decision-aids', async (_req, res) => {
    const items = await store.listAdminDecisionAids()
    return res.json({ items })
  })

  router.post('/admin/decision-aids', async (req: AuthenticatedRequest, res) => {
    if (!isDecisionAidInput(req.body)) {
      return res.status(400).json({ error: 'Invalid decision aid payload.' })
    }

    const item = await store.saveDecisionAid(req.body)
    return res.status(201).json({ item })
  })

  router.put('/admin/decision-aids/:id', async (req: AuthenticatedRequest, res) => {
    if (!isDecisionAidInput(req.body)) {
      return res.status(400).json({ error: 'Invalid decision aid payload.' })
    }

    const item = await store.saveDecisionAid({
      ...req.body,
      id: req.params.id,
    })
    return res.json({ item })
  })

  router.get('/admin/users', async (req, res) => {
    const search = req.query.search?.toString()
    const users = await store.listUsers(search)
    return res.json({ users })
  })

  router.post('/admin/users/:uid/role', async (req, res) => {
    const role = req.body?.role
    if (!isUserRole(role)) {
      return res.status(400).json({ error: 'Invalid role.' })
    }

    const user = await store.setUserRole(req.params.uid, role)
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }

    await syncUserRoleClaim(user.uid, role)
    return res.json({ user })
  })

  router.get('/admin/assignments', async (_req, res) => {
    const assignments = await store.listAllAssignments()
    return res.json({ assignments })
  })

  router.post('/admin/assignments', async (req: AuthenticatedRequest, res) => {
    const userId = req.body?.userId?.toString()
    const decisionAidId = req.body?.decisionAidId?.toString()

    if (!userId || !decisionAidId || !req.appUser) {
      return res.status(400).json({ error: 'userId and decisionAidId are required.' })
    }

    const user = await store.getUserById(userId)
    const decisionAid = await store.getDecisionAidById(decisionAidId)
    if (!user || !decisionAid) {
      return res
        .status(404)
        .json({ error: 'User or decision aid could not be found.' })
    }

    const assignment = await store.assignDecisionAid(
      userId,
      decisionAidId,
      req.appUser.uid,
    )
    return res.status(201).json({ assignment })
  })

  router.delete('/admin/assignments/:assignmentId', async (req, res) => {
    await store.removeAssignment(req.params.assignmentId)
    return res.status(204).send()
  })

  return router
}
