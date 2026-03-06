import { Router } from 'express'
import type { AppStore } from '../data/appStore'
import { loadAppUser } from '../middleware/loadAppUser'
import {
  type AuthenticatedRequest,
  verifyFirebaseToken,
} from '../middleware/verifyFirebaseToken'

type ResponsePayload = {
  answers: Record<string, unknown>
  currentStepIndex: number
  status: 'in_progress' | 'completed'
}

const isResponsePayload = (value: unknown): value is ResponsePayload => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const payload = value as Partial<ResponsePayload>
  return (
    typeof payload.currentStepIndex === 'number' &&
    (payload.status === 'in_progress' || payload.status === 'completed') &&
    Boolean(payload.answers && typeof payload.answers === 'object')
  )
}

export const createUserDecisionAidRouter = (store: AppStore) => {
  const router = Router()

  router.use(verifyFirebaseToken, loadAppUser(store))

  router.get('/my-decision-aids', async (req: AuthenticatedRequest, res) => {
    if (!req.appUser) {
      return res.status(401).json({ error: 'Authentication is required.' })
    }

    const result = await store.getMyDecisionAids(req.appUser.uid)
    return res.json(result)
  })

  router.post('/decision-aids/:id/favorite', async (req: AuthenticatedRequest, res) => {
    if (!req.appUser) {
      return res.status(401).json({ error: 'Authentication is required.' })
    }

    const decisionAid = await store.getDecisionAidById(req.params.id as string)
    if (!decisionAid || decisionAid.publishStatus !== 'published') {
      return res.status(404).json({ error: 'Decision aid not found.' })
    }

    const favorite =
      typeof req.body?.favorite === 'boolean' ? req.body.favorite : true

    await store.toggleFavorite(req.appUser.uid, decisionAid.id, favorite)
    return res.json({ favorite })
  })

  router.get('/decision-aids/:id/responses', async (req: AuthenticatedRequest, res) => {
    if (!req.appUser) {
      return res.status(401).json({ error: 'Authentication is required.' })
    }

    const response = await store.getResponse(req.appUser.uid, req.params.id as string)
    return res.json({ response })
  })

  router.post('/decision-aids/:id/responses', async (req: AuthenticatedRequest, res) => {
    if (!req.appUser) {
      return res.status(401).json({ error: 'Authentication is required.' })
    }

    if (!isResponsePayload(req.body)) {
      return res.status(400).json({ error: 'Invalid response payload.' })
    }

    const decisionAid = await store.getDecisionAidById(req.params.id as string)
    if (!decisionAid || decisionAid.publishStatus !== 'published') {
      return res.status(404).json({ error: 'Decision aid not found.' })
    }

    const response = await store.saveResponse(req.appUser.uid, decisionAid.id, req.body)
    return res.json({ response })
  })

  return router
}
