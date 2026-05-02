const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function getAuthHeaders() {
  const token = localStorage.getItem('authToken')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

function getUserId() {
  const user = JSON.parse(localStorage.getItem('authUser') || '{}')
  return user.id || user._id
}

// List all projects
export const listProjects = async (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.userId) params.set('userId', filters.userId)

  const queryString = params.toString()
  const response = await fetch(`${API_BASE}/projects${queryString ? `?${queryString}` : ''}`, {
    headers: getAuthHeaders()
  })

  if (!response.ok) {
    throw new Error('Failed to fetch projects')
  }

  return response.json()
}

// Get single project
export const getProject = async (projectId) => {
  const response = await fetch(`${API_BASE}/projects/${projectId}`, {
    headers: getAuthHeaders()
  })

  if (!response.ok) {
    throw new Error('Failed to fetch project')
  }

  return response.json()
}

// Create project
export const createProject = async (projectData) => {
  const response = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      ...projectData,
      ownerId: projectData.ownerId || getUserId()
    })
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.message || 'Failed to create project')
  }

  return response.json()
}

// Update project
export const updateProject = async (projectId, updates) => {
  const response = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.message || 'Failed to update project')
  }

  return response.json()
}

// Delete project
export const deleteProject = async (projectId) => {
  const response = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })

  if (!response.ok) {
    throw new Error('Failed to delete project')
  }

  return response.json()
}

// Add member to project
export const addProjectMember = async (projectId, userId, role = 'member') => {
  const response = await fetch(`${API_BASE}/projects/${projectId}/members`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ userId, role })
  })

  if (!response.ok) {
    throw new Error('Failed to add member')
  }

  return response.json()
}

// Remove member from project
export const removeProjectMember = async (projectId, userId) => {
  const response = await fetch(`${API_BASE}/projects/${projectId}/members/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })

  if (!response.ok) {
    throw new Error('Failed to remove member')
  }

  return response.json()
}
