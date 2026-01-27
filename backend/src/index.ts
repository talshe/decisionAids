import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import authRoutes from './routes/auth'

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

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', authRoutes)

const port = Number(process.env.PORT) || 5000
app.listen(port, () => {
  console.log(`API server listening on port ${port}`)
})
