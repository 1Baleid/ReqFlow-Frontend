import { Router } from 'express'
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember
} from '../controllers/projects.controller.js'

const router = Router()

// GET /api/projects - List all projects
router.get('/', listProjects)

// POST /api/projects - Create new project
router.post('/', createProject)

// GET /api/projects/:id - Get single project
router.get('/:id', getProject)

// PATCH /api/projects/:id - Update project
router.patch('/:id', updateProject)

// DELETE /api/projects/:id - Delete project
router.delete('/:id', deleteProject)

// POST /api/projects/:id/members - Add member to project
router.post('/:id/members', addProjectMember)

// DELETE /api/projects/:id/members/:userId - Remove member from project
router.delete('/:id/members/:userId', removeProjectMember)

export default router
