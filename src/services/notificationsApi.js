const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function getAuthHeaders() {
  const token = localStorage.getItem('authToken')
  const userId = getUserId()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(userId ? { 'X-User-Id': userId } : {})
  }
}

function getUserId() {
  const user = JSON.parse(localStorage.getItem('authUser') || '{}')
  return user.id || user._id
}

// List notifications
export const listNotifications = async (filters = {}) => {
  const params = new URLSearchParams()
  params.set('userId', getUserId())
  if (filters.unreadOnly) params.set('unreadOnly', 'true')
  if (filters.limit) params.set('limit', filters.limit)
  if (filters.offset) params.set('offset', filters.offset)

  const response = await fetch(`${API_BASE}/notifications?${params.toString()}`, {
    headers: getAuthHeaders()
  })

  if (!response.ok) {
    throw new Error('Failed to fetch notifications')
  }

  return response.json()
}

// Get unread count
export const getUnreadCount = async () => {
  const params = new URLSearchParams()
  params.set('userId', getUserId())

  const response = await fetch(`${API_BASE}/notifications/unread-count?${params.toString()}`, {
    headers: getAuthHeaders()
  })

  if (!response.ok) {
    throw new Error('Failed to fetch unread count')
  }

  return response.json()
}

// Mark notification as read
export const markAsRead = async (notificationId) => {
  const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ userId: getUserId() })
  })

  if (!response.ok) {
    throw new Error('Failed to mark notification as read')
  }

  return response.json()
}

// Mark all notifications as read
export const markAllAsRead = async () => {
  const response = await fetch(`${API_BASE}/notifications/mark-all-read`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ userId: getUserId() })
  })

  if (!response.ok) {
    throw new Error('Failed to mark all as read')
  }

  return response.json()
}

// Delete notification
export const deleteNotification = async (notificationId) => {
  const params = new URLSearchParams()
  params.set('userId', getUserId())

  const response = await fetch(`${API_BASE}/notifications/${notificationId}?${params.toString()}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })

  if (!response.ok) {
    throw new Error('Failed to delete notification')
  }

  return response.json()
}
