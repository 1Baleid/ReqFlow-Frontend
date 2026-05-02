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

// List all users
export const listUsers = async (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.role) params.set('role', filters.role)
  if (filters.projectId) params.set('projectId', filters.projectId)

  const queryString = params.toString()
  const response = await fetch(`${API_BASE}/users${queryString ? `?${queryString}` : ''}`, {
    headers: getAuthHeaders()
  })

  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }

  return response.json()
}

// Get single user
export const getUser = async (userId) => {
  const response = await fetch(`${API_BASE}/users/${userId}`, {
    headers: getAuthHeaders()
  })

  if (!response.ok) {
    throw new Error('Failed to fetch user')
  }

  return response.json()
}

// Get current user
export const getCurrentUser = async () => {
  const response = await fetch(`${API_BASE}/users/me`, {
    headers: getAuthHeaders()
  })

  if (!response.ok) {
    throw new Error('Failed to fetch current user')
  }

  return response.json()
}

// Update user
export const updateUser = async (userId, updates) => {
  const response = await fetch(`${API_BASE}/users/${userId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  })

  if (!response.ok) {
    throw new Error('Failed to update user')
  }

  return response.json()
}

// Get team members for a project
export const getTeamMembers = async (projectId = null) => {
  const params = projectId ? `?projectId=${projectId}` : ''
  const response = await fetch(`${API_BASE}/users/team${params}`, {
    headers: getAuthHeaders()
  })

  if (!response.ok) {
    throw new Error('Failed to fetch team members')
  }

  return response.json()
}
