const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function getAuthHeaders() {
  const token = localStorage.getItem('authToken')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

// List activities
export const listActivities = async (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.projectId) params.set('projectId', filters.projectId)
  if (filters.limit) params.set('limit', filters.limit)
  if (filters.offset) params.set('offset', filters.offset)

  const queryString = params.toString()
  const response = await fetch(`${API_BASE}/activities${queryString ? `?${queryString}` : ''}`, {
    headers: getAuthHeaders()
  })

  if (!response.ok) {
    throw new Error('Failed to fetch activities')
  }

  return response.json()
}

// Get recent activities for dashboard
export const getRecentActivities = async (projectId = null, limit = 10) => {
  const params = new URLSearchParams()
  if (projectId) params.set('projectId', projectId)
  params.set('limit', limit)

  const response = await fetch(`${API_BASE}/activities/recent?${params.toString()}`, {
    headers: getAuthHeaders()
  })

  if (!response.ok) {
    throw new Error('Failed to fetch recent activities')
  }

  return response.json()
}

// Create activity (usually internal use)
export const createActivity = async (activityData) => {
  const response = await fetch(`${API_BASE}/activities`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(activityData)
  })

  if (!response.ok) {
    throw new Error('Failed to create activity')
  }

  return response.json()
}
