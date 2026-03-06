import { Router } from 'express'
import type { AppStore } from '../data/appStore'
import { toDecisionAidSummary } from '../data/helpers'

export const createPublicDecisionAidRouter = (store: AppStore) => {
  const router = Router()

  router.get('/explore', async (req, res) => {
    const search = req.query.search?.toString()
    const tag = req.query.tag?.toString()

    const items = await store.listExploreDecisionAids({ search, tag })
    const availableTags = [...new Set(items.flatMap((item) => item.tags))].sort()

    return res.json({
      items: items.map(toDecisionAidSummary),
      availableTags,
    })
  })

  router.get('/decision-aids/:slug', async (req, res) => {
    const item = await store.getPublishedDecisionAidBySlug(req.params.slug)
    if (!item) {
      return res.status(404).json({ error: 'Decision aid not found.' })
    }

    return res.json({ item })
  })

  return router
}
