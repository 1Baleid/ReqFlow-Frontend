import { Notification } from '../models/Notification.js'

// List notifications for a user
export const listNotifications = async (request, response) => {
  try {
    const userId = request.headers['x-user-id'] || request.query.userId
    const { unreadOnly, limit = 20, offset = 0 } = request.query

    if (!userId) {
      return response.status(401).json({ message: 'User ID required' })
    }

    const filter = { userId }
    if (unreadOnly === 'true') {
      filter.read = false
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))

    const total = await Notification.countDocuments(filter)
    const unreadCount = await Notification.countDocuments({ userId, read: false })

    response.json({
      notifications: notifications.map(formatNotification),
      total,
      unreadCount,
      hasMore: parseInt(offset) + notifications.length < total
    })
  } catch (error) {
    console.error('List notifications error:', error)
    response.status(500).json({ message: 'Failed to fetch notifications' })
  }
}

// Get unread count
export const getUnreadCount = async (request, response) => {
  try {
    const userId = request.headers['x-user-id'] || request.query.userId

    if (!userId) {
      return response.status(401).json({ message: 'User ID required' })
    }

    const count = await Notification.countDocuments({ userId, read: false })

    response.json({ unreadCount: count })
  } catch (error) {
    console.error('Get unread count error:', error)
    response.status(500).json({ message: 'Failed to fetch unread count' })
  }
}

// Mark notification as read
export const markAsRead = async (request, response) => {
  try {
    const { id } = request.params
    const userId = request.headers['x-user-id'] || request.body.userId

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { $set: { read: true } },
      { new: true }
    )

    if (!notification) {
      return response.status(404).json({ message: 'Notification not found' })
    }

    response.json({
      message: 'Notification marked as read',
      notification: formatNotification(notification)
    })
  } catch (error) {
    console.error('Mark as read error:', error)
    response.status(500).json({ message: 'Failed to mark notification as read' })
  }
}

// Mark all notifications as read
export const markAllAsRead = async (request, response) => {
  try {
    const userId = request.headers['x-user-id'] || request.body.userId

    if (!userId) {
      return response.status(401).json({ message: 'User ID required' })
    }

    await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    )

    response.json({ message: 'All notifications marked as read' })
  } catch (error) {
    console.error('Mark all as read error:', error)
    response.status(500).json({ message: 'Failed to mark notifications as read' })
  }
}

// Create notification (usually called internally)
export const createNotification = async (request, response) => {
  try {
    const { userId, type, title, message, relatedType, relatedId, actorId, actorName } = request.body

    if (!userId || !type || !title || !message) {
      return response.status(400).json({ message: 'Missing required fields' })
    }

    const notification = new Notification({
      userId,
      type,
      title,
      message,
      relatedType: relatedType || 'requirement',
      relatedId,
      actorId,
      actorName,
      read: false
    })

    await notification.save()

    response.status(201).json({
      message: 'Notification created',
      notification: formatNotification(notification)
    })
  } catch (error) {
    console.error('Create notification error:', error)
    response.status(500).json({ message: 'Failed to create notification' })
  }
}

// Delete notification
export const deleteNotification = async (request, response) => {
  try {
    const { id } = request.params
    const userId = request.headers['x-user-id'] || request.query.userId

    const notification = await Notification.findOneAndDelete({ _id: id, userId })

    if (!notification) {
      return response.status(404).json({ message: 'Notification not found' })
    }

    response.json({ message: 'Notification deleted' })
  } catch (error) {
    console.error('Delete notification error:', error)
    response.status(500).json({ message: 'Failed to delete notification' })
  }
}

// Helper to send notification to user
export const sendNotification = async (userId, type, title, message, options = {}) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      relatedType: options.relatedType || 'requirement',
      relatedId: options.relatedId,
      actorId: options.actorId,
      actorName: options.actorName,
      read: false
    })

    await notification.save()
    return notification
  } catch (error) {
    console.error('Send notification error:', error)
    return null
  }
}

function formatNotification(notification) {
  const icons = {
    approval: 'check_circle',
    rejection: 'cancel',
    comment: 'comment',
    assignment: 'person_add',
    deadline: 'schedule',
    mention: 'alternate_email',
    status_change: 'sync'
  }

  const colors = {
    approval: 'success',
    rejection: 'error',
    comment: 'info',
    assignment: 'primary',
    deadline: 'warning',
    mention: 'info',
    status_change: 'primary'
  }

  return {
    id: notification._id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    relatedType: notification.relatedType,
    relatedId: notification.relatedId,
    read: notification.read,
    icon: icons[notification.type] || 'notifications',
    color: colors[notification.type] || 'default',
    time: formatTimeAgo(notification.createdAt),
    createdAt: notification.createdAt
  }
}

function formatTimeAgo(date) {
  if (!date) return 'Just now'

  const now = new Date()
  const past = new Date(date)
  const diffMs = now - past
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
