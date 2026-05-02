import { Router } from 'express'
import mongoose from 'mongoose'

const router = Router()

router.get('/', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
})

export default router
