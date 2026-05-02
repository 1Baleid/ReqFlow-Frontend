import { Router } from 'express'
import {
  getDashboardStats,
  getProjectStats,
  getManagerKPIs
} from '../controllers/dashboard.controller.js'

const router = Router()

// GET /api/dashboard/stats - Get overall dashboard statistics
router.get('/stats', getDashboardStats)

// GET /api/dashboard/project/:projectId - Get project-specific stats
router.get('/project/:projectId', getProjectStats)

// GET /api/dashboard/manager/kpis - Get manager KPIs
router.get('/manager/kpis', getManagerKPIs)

export default router
