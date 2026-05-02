// Mock data for ReqFlow - KFUPM Project Management System

// Organization info
export const organization = {
  name: 'KFUPM Software Engineering',
  project: 'SWE363 Web Project',
  department: 'Information & Computer Science'
}

const PROJECTS_STORAGE_KEY = 'reqflow-projects-v1'
const AUTH_USER_STORAGE_KEY = 'authUser'

// Projects
export const projects = [
  {
    id: 'proj-1',
    name: 'SWE363 Web Project',
    description: 'Requirements management system for web development course',
    color: '#1353d8',
    requirementsCount: 142,
    requirements: { total: 142, completed: 91 },
    status: 'active',
    progress: 64,
    team: [
      { id: 'user-1', name: 'Abdullah Al-Rashid', initials: 'AA' },
      { id: 'user-2', name: 'Khalid Hassan', initials: 'KH' },
      { id: 'user-3', name: 'Omar Faisal', initials: 'OF' }
    ],
    updatedAt: '2 hours ago'
  },
  {
    id: 'proj-2',
    name: 'Mobile App Development',
    description: 'Cross-platform mobile application project',
    color: '#7c3aed',
    requirementsCount: 89,
    requirements: { total: 89, completed: 39 },
    status: 'active',
    progress: 45,
    team: [
      { id: 'user-4', name: 'Nora Ahmed', initials: 'NA' },
      { id: 'user-5', name: 'Yusuf Malik', initials: 'YM' }
    ],
    updatedAt: 'Yesterday'
  },
  {
    id: 'proj-3',
    name: 'API Integration',
    description: 'Backend API services and integrations',
    color: '#059669',
    requirementsCount: 56,
    requirements: { total: 56, completed: 13 },
    status: 'on-hold',
    progress: 23,
    team: [
      { id: 'user-3', name: 'Omar Faisal', initials: 'OF' }
    ],
    updatedAt: '3 days ago'
  },
  {
    id: 'proj-4',
    name: 'Database Migration',
    description: 'Legacy database migration to cloud',
    color: '#dc2626',
    requirementsCount: 34,
    requirements: { total: 34, completed: 34 },
    status: 'completed',
    progress: 100,
    team: [
      { id: 'user-2', name: 'Khalid Hassan', initials: 'KH' },
      { id: 'user-5', name: 'Yusuf Malik', initials: 'YM' }
    ],
    updatedAt: '1 week ago'
  }
]

const projectColorPalette = ['#1353d8', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0891b2']

function toFiniteNumber(value, fallback = 0) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

function normalizeProject(project, index = 0) {
  const progress = Math.min(100, Math.max(0, toFiniteNumber(project.progress, 0)))
  const totalRequirements = Math.max(
    0,
    toFiniteNumber(project.requirements?.total ?? project.requirementsCount, 0)
  )
  const completedRequirements = Math.max(
    0,
    toFiniteNumber(project.requirements?.completed, Math.round(totalRequirements * (progress / 100)))
  )
  const projectUsers = Array.isArray(project.users) ? project.users : []
  const team = Array.isArray(project.team) && project.team.length > 0
    ? project.team
    : projectUsers.map((user) => ({
      id: user.id,
      name: user.name,
      initials: user.initials || String(user.name || 'User')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    }))

  return {
    ...project,
    id: project.id || `proj-${index + 1}`,
    name: project.name || 'Untitled Project',
    description: project.description || 'New requirements workspace',
    color: project.color || projectColorPalette[index % projectColorPalette.length],
    requirementsCount: totalRequirements,
    requirements: {
      total: totalRequirements,
      completed: Math.min(completedRequirements, totalRequirements)
    },
    status: project.status || 'active',
    progress,
    users: projectUsers,
    team,
    workflowStages: Array.isArray(project.workflowStages) ? project.workflowStages : [],
    startDate: project.startDate || null,
    targetCompletion: project.targetCompletion || null,
    updatedAt: project.updatedAt || 'Just now'
  }
}

function normalizeProjectList(projectList) {
  return projectList.map((project, index) => normalizeProject(project, index))
}

function emitProjectEvent(eventName, detail) {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent(eventName, { detail }))
}

function persistProjects(projectList) {
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(normalizeProjectList(projectList)))
}

export const getProjects = () => {
  try {
    const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY)
    if (!storedProjects) {
      return normalizeProjectList(projects)
    }

    const parsedProjects = JSON.parse(storedProjects)
    if (!Array.isArray(parsedProjects) || parsedProjects.length === 0) {
      return normalizeProjectList(projects)
    }

    return normalizeProjectList(parsedProjects)
  } catch {
    return normalizeProjectList(projects)
  }
}

// Get current project from localStorage
export const getCurrentProject = () => {
  const projectId = localStorage.getItem('currentProjectId') || 'proj-1'
  const projectList = getProjects()
  return projectList.find(p => p.id === projectId) || projectList[0]
}

// Set current project
export const setCurrentProject = (projectId) => {
  localStorage.setItem('currentProjectId', projectId)
  emitProjectEvent('projectChanged', { projectId })
}

export const createProject = ({ name, description, color, startDate, targetCompletion, users, team, workflowStages }) => {
  const normalizedName = String(name || '').trim()
  const normalizedDescription = String(description || '').trim()
  const normalizedUsers = Array.isArray(users) ? users : []
  const normalizedTeam = Array.isArray(team) ? team : []

  if (!normalizedName) {
    return { ok: false, error: 'Project name is required.' }
  }

  const projectList = getProjects()
  const duplicateProject = projectList.find(
    (project) => project.name.toLowerCase() === normalizedName.toLowerCase()
  )

  if (duplicateProject) {
    return { ok: false, error: 'A project with this name already exists.' }
  }

  const selectedColor = color || projectColorPalette[projectList.length % projectColorPalette.length]
  const newProject = {
    id: `proj-${Date.now()}`,
    name: normalizedName,
    description: normalizedDescription || 'New requirements workspace',
    color: selectedColor,
    requirementsCount: 0,
    requirements: { total: 0, completed: 0 },
    status: 'active',
    progress: 0,
    users: normalizedUsers,
    team: normalizedTeam,
    workflowStages: Array.isArray(workflowStages) ? workflowStages : [],
    startDate: startDate || null,
    targetCompletion: targetCompletion || null,
    updatedAt: 'Just now',
    createdAt: new Date().toISOString()
  }

  const nextProjects = [newProject, ...projectList]
  persistProjects(nextProjects)
  emitProjectEvent('projectsChanged', { project: newProject, projects: nextProjects })
  setCurrentProject(newProject.id)

  return { ok: true, project: newProject, projects: nextProjects }
}

export const updateProject = (projectId, { name, description, color, startDate, targetCompletion, users, team, workflowStages }) => {
  const normalizedName = String(name || '').trim()
  const normalizedDescription = String(description || '').trim()

  if (!normalizedName) {
    return { ok: false, error: 'Project name is required.' }
  }

  const projectList = getProjects()
  const existingProject = projectList.find((project) => project.id === projectId)

  if (!existingProject) {
    return { ok: false, error: 'Project was not found.' }
  }

  const duplicateProject = projectList.find(
    (project) =>
      project.id !== projectId &&
      project.name.toLowerCase() === normalizedName.toLowerCase()
  )

  if (duplicateProject) {
    return { ok: false, error: 'A project with this name already exists.' }
  }

  const updatedProject = normalizeProject({
    ...existingProject,
    name: normalizedName,
    description: normalizedDescription || 'New requirements workspace',
    color: color || existingProject.color,
    users: Array.isArray(users) ? users : existingProject.users,
    team: Array.isArray(team) ? team : existingProject.team,
    workflowStages: Array.isArray(workflowStages) ? workflowStages : existingProject.workflowStages,
    startDate: startDate || null,
    targetCompletion: targetCompletion || null,
    updatedAt: 'Just now'
  })

  const nextProjects = projectList.map((project) =>
    project.id === projectId ? updatedProject : project
  )

  persistProjects(nextProjects)
  emitProjectEvent('projectsChanged', { project: updatedProject, projects: nextProjects })

  return { ok: true, project: updatedProject, projects: nextProjects }
}

export const deleteProject = (projectId) => {
  const projectList = getProjects()
  const deletedProject = projectList.find((project) => project.id === projectId)

  if (!deletedProject) {
    return { ok: false, error: 'Project was not found.' }
  }

  if (projectList.length <= 1) {
    return { ok: false, error: 'At least one project must remain.' }
  }

  const nextProjects = projectList.filter((project) => project.id !== projectId)
  persistProjects(nextProjects)

  const currentProjectId = localStorage.getItem('currentProjectId') || 'proj-1'
  if (currentProjectId === projectId) {
    setCurrentProject(nextProjects[0].id)
  }

  emitProjectEvent('projectsChanged', {
    deletedProjectId: projectId,
    projects: nextProjects
  })

  return { ok: true, deletedProject, projects: nextProjects }
}

// Demo users for different roles
export const demoUsers = {
  'abdullah@kfupm.edu.sa': {
    id: 'user-1',
    name: 'Abdullah Al-Rashid',
    email: 'abdullah@kfupm.edu.sa',
    role: 'client',
    title: 'Project Owner',
    avatar: null
  },
  'khalid@kfupm.edu.sa': {
    id: 'user-2',
    name: 'Khalid Hassan',
    email: 'khalid@kfupm.edu.sa',
    role: 'manager',
    title: 'Project Manager',
    avatar: null
  },
  'omar@kfupm.edu.sa': {
    id: 'user-3',
    name: 'Omar Faisal',
    email: 'omar@kfupm.edu.sa',
    role: 'member',
    title: 'Senior Developer',
    avatar: null
  }
}

// Get current user based on localStorage (defaults to client)
export const getCurrentUser = () => {
  try {
    const storedAuthUser = localStorage.getItem(AUTH_USER_STORAGE_KEY)
    if (storedAuthUser) {
      const parsedUser = JSON.parse(storedAuthUser)
      if (parsedUser?.email && parsedUser?.role) {
        return parsedUser
      }
    }
  } catch {
    // Fall back to demo session behavior.
  }

  const email = localStorage.getItem('userEmail') || 'abdullah@kfupm.edu.sa'
  const user = demoUsers[email] || demoUsers['abdullah@kfupm.edu.sa']
  const roleOverride = localStorage.getItem('userRole')

  if (!roleOverride || roleOverride === user.role) {
    return user
  }

  const roleTitleMap = {
    client: 'Project Owner',
    manager: 'Project Manager',
    member: 'Team Member'
  }

  return {
    ...user,
    role: roleOverride,
    title: roleTitleMap[roleOverride] || user.title
  }
}

// Legacy export for backwards compatibility
export const currentUser = demoUsers['abdullah@kfupm.edu.sa']

// Team members
export const teamMembers = [
  {
    id: 'user-1',
    name: 'Abdullah Al-Rashid',
    title: 'Project Owner',
    email: 'abdullah@kfupm.edu.sa',
    role: 'client',
    lastActive: 'Active now',
    isOnline: true,
    avatar: null,
    activeTasks: 3,
    capacity: 45
  },
  {
    id: 'user-2',
    name: 'Khalid Hassan',
    title: 'Project Manager',
    email: 'khalid@kfupm.edu.sa',
    role: 'manager',
    lastActive: 'Active now',
    isOnline: true,
    avatar: null,
    activeTasks: 5,
    capacity: 70
  },
  {
    id: 'user-3',
    name: 'Omar Faisal',
    title: 'Senior Developer',
    email: 'omar@kfupm.edu.sa',
    role: 'member',
    lastActive: '30 mins ago',
    isOnline: true,
    avatar: null,
    activeTasks: 4,
    capacity: 60
  },
  {
    id: 'user-4',
    name: 'Nora Ahmed',
    title: 'UI/UX Designer',
    email: 'nora@kfupm.edu.sa',
    role: 'member',
    lastActive: '2 hours ago',
    isOnline: false,
    avatar: null,
    activeTasks: 2,
    capacity: 30
  },
  {
    id: 'user-5',
    name: 'Yusuf Malik',
    title: 'QA Engineer',
    email: 'yusuf@kfupm.edu.sa',
    role: 'member',
    lastActive: 'Yesterday',
    isOnline: false,
    avatar: null,
    activeTasks: 6,
    capacity: 85
  }
]

export const requirements = [
  {
    id: 'REQ-042',
    title: 'Cloud Data Encryption Protocol',
    description: 'Implement end-to-end encryption for all cloud-stored data using AES-256 standard.',
    status: 'under-review',
    priority: 'high',
    version: '2.4',
    createdAt: '2026-03-15',
    updatedAt: '2 hours ago',
    assignee: {
      id: 'user-3',
      name: 'Omar Faisal',
      avatar: null
    },
    createdBy: {
      id: 'user-1',
      name: 'Abdullah Al-Rashid'
    }
  },
  {
    id: 'REQ-039',
    title: 'API Rate Limiting for Third-Party Vendors',
    description: 'Implement rate limiting on all public APIs to prevent abuse and ensure fair usage.',
    status: 'approved',
    priority: 'medium',
    version: '1.8',
    createdAt: '2026-03-10',
    updatedAt: 'Yesterday',
    assignee: {
      id: 'user-5',
      name: 'Yusuf Malik',
      avatar: null
    },
    createdBy: {
      id: 'user-1',
      name: 'Abdullah Al-Rashid'
    }
  },
  {
    id: 'REQ-038',
    title: 'Multi-Factor Authentication for Admin Portal',
    description: 'Add MFA support for all administrator accounts using TOTP or hardware keys.',
    status: 'approved',
    priority: 'critical',
    version: '1.2',
    createdAt: '2026-03-08',
    updatedAt: '2 days ago',
    assignee: {
      id: 'user-4',
      name: 'Nora Ahmed',
      avatar: null
    },
    createdBy: {
      id: 'user-2',
      name: 'Khalid Hassan'
    }
  },
  {
    id: 'REQ-035',
    title: 'Real-time Dashboard Analytics',
    description: 'Build real-time analytics dashboard showing key business metrics.',
    status: 'draft',
    priority: 'medium',
    version: '0.3',
    createdAt: '2026-03-05',
    updatedAt: '3 days ago',
    assignee: null,
    createdBy: {
      id: 'user-1',
      name: 'Abdullah Al-Rashid'
    }
  },
  {
    id: 'REQ-033',
    title: 'Legacy System Data Migration',
    description: 'Migrate all historical data from legacy Oracle database to new PostgreSQL system.',
    status: 'rejected',
    priority: 'low',
    version: '1.0',
    createdAt: '2026-03-03',
    updatedAt: '5 days ago',
    assignee: {
      id: 'user-2',
      name: 'Khalid Hassan',
      avatar: null
    },
    createdBy: {
      id: 'user-3',
      name: 'Omar Faisal'
    }
  }
]

export const activities = [
  {
    id: 'act-1',
    type: 'approved',
    actor: 'Khalid Hassan',
    action: 'approved REQ-038',
    time: '15 mins ago'
  },
  {
    id: 'act-2',
    type: 'edited',
    actor: 'Abdullah Al-Rashid',
    action: 'edited REQ-042',
    time: '2 hours ago'
  },
  {
    id: 'act-3',
    type: 'comment',
    actor: 'Omar Faisal',
    action: 'commented on REQ-039',
    time: '3 hours ago'
  },
  {
    id: 'act-4',
    type: 'flagged',
    actor: 'System',
    action: 'flagged missing link in REQ-012',
    time: '5 hours ago'
  }
]

export const projectStats = {
  total: 142,
  pending: 28,
  approved: 91,
  rejected: 8,
  draft: 15,
  completionRate: 64
}

export const statusFilters = [
  { value: 'all', label: 'All Requirements' },
  { value: 'draft', label: 'Draft' },
  { value: 'under-review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'locked', label: 'Locked', icon: 'lock' }
]
