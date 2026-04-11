// Mock data for ReqFlow - KFUPM Project Management System

// Organization info
export const organization = {
  name: 'KFUPM Software Engineering',
  project: 'SWE363 Web Project',
  department: 'Information & Computer Science'
}

// Projects
export const projects = [
  {
    id: 'proj-1',
    name: 'SWE363 Web Project',
    description: 'Requirements management system for web development course',
    color: '#1353d8',
    requirementsCount: 142
  },
  {
    id: 'proj-2',
    name: 'Mobile App Development',
    description: 'Cross-platform mobile application project',
    color: '#7c3aed',
    requirementsCount: 89
  },
  {
    id: 'proj-3',
    name: 'API Integration',
    description: 'Backend API services and integrations',
    color: '#059669',
    requirementsCount: 56
  },
  {
    id: 'proj-4',
    name: 'Database Migration',
    description: 'Legacy database migration to cloud',
    color: '#dc2626',
    requirementsCount: 34
  }
]

// Get current project from localStorage
export const getCurrentProject = () => {
  const projectId = localStorage.getItem('currentProjectId') || 'proj-1'
  return projects.find(p => p.id === projectId) || projects[0]
}

// Set current project
export const setCurrentProject = (projectId) => {
  localStorage.setItem('currentProjectId', projectId)
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
