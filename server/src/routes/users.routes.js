import { Router } from 'express'
import {
  listUsers,
  getUser,
  getCurrentUser,
  updateUser,
  getTeamMembers
} from '../controllers/users.controller.js'

const router = Router()

// GET /api/users - List all users
router.get('/', listUsers)

// GET /api/users/me - Get current authenticated user
router.get('/me', getCurrentUser)

// GET /api/users/team - Get team members (for a project)
router.get('/team', getTeamMembers)

// GET /api/users/:id - Get single user
router.get('/:id', getUser)

// PATCH /api/users/:id - Update user
router.patch('/:id', updateUser)

export default router
