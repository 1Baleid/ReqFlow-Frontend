import { Router } from 'express'
import {
  listActivities,
  getRecentActivities,
  createActivity
} from '../controllers/activities.controller.js'

const router = Router()

// GET /api/activities - List all activities
router.get('/', listActivities)

// GET /api/activities/recent - Get recent activities for dashboard
router.get('/recent', getRecentActivities)

// POST /api/activities - Create activity (internal use)
router.post('/', createActivity)

export default router
