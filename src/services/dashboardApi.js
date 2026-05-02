const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function getAuthHeaders() {
  const token = localStorage.getItem('authToken')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

// Get dashboard statistics for charts
export const getDashboardStats = async (projectId = null) => {
  const params = projectId ? `?projectId=${projectId}` : ''
  const response = await fetch(`${API_BASE}/dashboard/stats${params}`, {
    headers: getAuthHeaders()
  })

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats')
  }

  return response.json()
}

// Get project-specific statistics
export const getProjectStats = async (projectId) => {
  const response = await fetch(`${API_BASE}/dashboard/project/${projectId}`, {
    headers: getAuthHeaders()
  })

  if (!response.ok) {
    throw new Error('Failed to fetch project stats')
  }

  return response.json()
}

// Get manager KPIs
export const getManagerKPIs = async () => {
  const response = await fetch(`${API_BASE}/dashboard/manager/kpis`, {
    headers: getAuthHeaders()
  })

  if (!response.ok) {
    throw new Error('Failed to fetch manager KPIs')
  }

  return response.json()
}
