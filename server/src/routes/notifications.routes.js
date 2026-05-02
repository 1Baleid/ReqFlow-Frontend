import { Router } from 'express'
import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification
} from '../controllers/notifications.controller.js'

const router = Router()

// GET /api/notifications - List notifications for user
router.get('/', listNotifications)

// GET /api/notifications/unread-count - Get unread count
router.get('/unread-count', getUnreadCount)

// POST /api/notifications - Create notification (internal use)
router.post('/', createNotification)

// PATCH /api/notifications/:id/read - Mark as read
router.patch('/:id/read', markAsRead)

// POST /api/notifications/mark-all-read - Mark all as read
router.post('/mark-all-read', markAllAsRead)

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', deleteNotification)

export default router
