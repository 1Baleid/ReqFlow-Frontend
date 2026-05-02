import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import authRoutes from './routes/auth.routes.js'
import healthRoutes from './routes/health.routes.js'
import requirementsRoutes from './routes/requirements.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import projectsRoutes from './routes/projects.routes.js'
import usersRoutes from './routes/users.routes.js'
import activitiesRoutes from './routes/activities.routes.js'
import notificationsRoutes from './routes/notifications.routes.js'

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
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/projects', projectsRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/activities', activitiesRoutes)
app.use('/api/notifications', notificationsRoutes)

app.use((error, _request, response, _next) => {
  void _next
  console.error(error)
  response.status(500).json({
    message: 'Internal server error.'
  })
})

export default app
