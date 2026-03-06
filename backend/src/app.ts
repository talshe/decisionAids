import cors from 'cors'
import express from 'express'
import type { AppStore } from './data/appStore'
import { createAppStore } from './data'
import { createAdminRouter } from './routes/admin'
import { createAuthRouter } from './routes/auth'
import { createPublicDecisionAidRouter } from './routes/publicDecisionAids'
import { createUserDecisionAidRouter } from './routes/userDecisionAids'

export const createApp = (store: AppStore = createAppStore()) => {
  const app = express()

  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : []

  app.use(
    cors({
      origin: allowedOrigins.length ? allowedOrigins : true,
    }),
  )
  app.use(express.json())

  app.get('/health', async (_req, res) => {
    await store.ensureSeedData()
    res.json({ status: 'ok' })
  })

  app.use('/api', createAuthRouter(store))
  app.use('/api', createPublicDecisionAidRouter(store))
  app.use('/api', createUserDecisionAidRouter(store))
  app.use('/api', createAdminRouter(store))

  return app
}
