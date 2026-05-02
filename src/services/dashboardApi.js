const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Get dashboard statistics for charts
export const getDashboardStats = async (projectId = null) => {
  try {
    const params = projectId ? `?projectId=${projectId}` : ''
    const response = await fetch(`${API_BASE}/dashboard/stats${params}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats')
    }

    return await response.json()
  } catch (error) {
    console.error('Dashboard stats error:', error)
    // Return mock data as fallback
    return getMockDashboardStats()
  }
}

// Get project-specific statistics
export const getProjectStats = async (projectId) => {
  try {
    const response = await fetch(`${API_BASE}/dashboard/project/${projectId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch project stats')
    }

    return await response.json()
  } catch (error) {
    console.error('Project stats error:', error)
    return null
  }
}

// Get manager KPIs
export const getManagerKPIs = async () => {
  try {
    const response = await fetch(`${API_BASE}/dashboard/manager/kpis`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch manager KPIs')
    }

    return await response.json()
  } catch (error) {
    console.error('Manager KPIs error:', error)
    return getMockManagerKPIs()
  }
}

// Mock data fallback for development
const getMockDashboardStats = () => ({
  statusDistribution: [
    { label: 'Draft', value: 12, color: '#64748b' },
    { label: 'Review', value: 8, color: '#f59e0b' },
    { label: 'Approved', value: 25, color: '#10b981' },
    { label: 'Rejected', value: 3, color: '#ef4444' },
    { label: 'Locked', value: 5, color: '#8b5cf6' }
  ],
  priorityDistribution: [
    { label: 'Low', value: 15, color: '#94a3b8' },
    { label: 'Medium', value: 20, color: '#3b82f6' },
    { label: 'High', value: 12, color: '#f59e0b' },
    { label: 'Critical', value: 6, color: '#ef4444' }
  ],
  typeDistribution: [
    { label: 'Functional', value: 30 },
    { label: 'Non-functional', value: 12 },
    { label: 'Business', value: 8 },
    { label: 'Technical', value: 3 }
  ],
  timeline: [
    { date: '2024-01-15', count: 3 },
    { date: '2024-01-16', count: 5 },
    { date: '2024-01-17', count: 2 },
    { date: '2024-01-18', count: 7 },
    { date: '2024-01-19', count: 4 },
    { date: '2024-01-20', count: 6 },
    { date: '2024-01-21', count: 8 }
  ],
  summary: {
    totalRequirements: 53,
    totalProjects: 5,
    overdueCount: 4,
    completionRate: 47
  }
})

const getMockManagerKPIs = () => ({
  kpis: {
    draft: 12,
    review: 8,
    approved: 25,
    rejected: 3,
    overdue: 4
  },
  overdueRequirements: [
    {
      id: '1',
      title: 'User authentication flow',
      status: 'review',
      priority: 'high',
      deadline: new Date(Date.now() - 86400000 * 2),
      assignee: { name: 'Omar', email: 'omar@kfupm.edu.sa' },
      project: { name: 'ReqFlow', color: '#1353d8' }
    },
    {
      id: '2',
      title: 'Dashboard analytics',
      status: 'draft',
      priority: 'critical',
      deadline: new Date(Date.now() - 86400000),
      assignee: { name: 'Khalid', email: 'khalid@kfupm.edu.sa' },
      project: { name: 'ReqFlow', color: '#1353d8' }
    }
  ]
})
