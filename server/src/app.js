import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import authRoutes from './routes/auth.routes.js'
import healthRoutes from './routes/health.routes.js'
import requirementsRoutes from './routes/requirements.routes.js'

const app = express()

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
)
app.use(express.json())

app.get('/', (_request, response) => {
  response.json({
    message: 'ReqFlow API is running.'
  })
})

app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/requirements', requirementsRoutes)

app.use((error, _request, response, _next) => {
  void _next
  console.error(error)
  response.status(500).json({
    message: 'Internal server error.'
  })
})

export default app
