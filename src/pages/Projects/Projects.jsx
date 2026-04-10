import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Button from '../../components/Button'
import './Projects.css'

// Mock projects data
const mockProjects = [
  {
    id: 'proj-1',
    name: 'Project Alpha',
    description: 'Enterprise core system modernization initiative',
    status: 'active',
    progress: 68,
    requirements: { total: 142, completed: 91 },
    team: [
      { id: 'u1', name: 'Sarah Jenkins', initials: 'SJ' },
      { id: 'u2', name: 'Marcus Thorne', initials: 'MT' },
      { id: 'u3', name: 'Alex Chen', initials: 'AC' }
    ],
    updatedAt: '2 hours ago',
    color: '#1353d8'
  },
  {
    id: 'proj-2',
    name: 'Mobile App v2',
    description: 'Complete redesign of the mobile application',
    status: 'active',
    progress: 45,
    requirements: { total: 87, completed: 39 },
    team: [
      { id: 'u4', name: 'Elena Rodriguez', initials: 'ER' },
      { id: 'u5', name: 'James Smith', initials: 'JS' }
    ],
    updatedAt: 'Yesterday',
    color: '#059669'
  },
  {
    id: 'proj-3',
    name: 'API Gateway',
    description: 'Unified API management and gateway service',
    status: 'on-hold',
    progress: 23,
    requirements: { total: 56, completed: 13 },
    team: [
      { id: 'u6', name: 'David Miller', initials: 'DM' }
    ],
    updatedAt: '3 days ago',
    color: '#d97706'
  },
  {
    id: 'proj-4',
    name: 'Analytics Dashboard',
    description: 'Real-time business intelligence platform',
    status: 'completed',
    progress: 100,
    requirements: { total: 64, completed: 64 },
    team: [
      { id: 'u1', name: 'Sarah Jenkins', initials: 'SJ' },
      { id: 'u4', name: 'Elena Rodriguez', initials: 'ER' }
    ],
    updatedAt: '1 week ago',
    color: '#7c3aed'
  }
]

function Projects() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')

  const filteredProjects = mockProjects.filter(project => {
    if (filter === 'all') return true
    return project.status === filter
  })

  const getStatusBadge = (status) => {
    const config = {
      'active': { label: 'Active', className: 'projects__status--active' },
      'on-hold': { label: 'On Hold', className: 'projects__status--hold' },
      'completed': { label: 'Completed', className: 'projects__status--completed' }
    }
    return config[status] || config['active']
  }

  const handleProjectClick = (projectId) => {
    // For now, just navigate to requirements filtered by project
    navigate('/requirements')
  }

  return (
    <MainLayout>
      <div className="projects">
        {/* Header */}
        <div className="projects__header">
          <div className="projects__header-content">
            <h1 className="projects__title">Projects</h1>
            <p className="projects__subtitle">
              Manage and track all your requirements projects
            </p>
          </div>
          <div className="projects__header-actions">
            <Button variant="primary" icon="add">
              New Project
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="projects__filters">
          <button
            className={`projects__filter ${filter === 'all' ? 'projects__filter--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Projects
            <span className="projects__filter-count">{mockProjects.length}</span>
          </button>
          <button
            className={`projects__filter ${filter === 'active' ? 'projects__filter--active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active
            <span className="projects__filter-count">
              {mockProjects.filter(p => p.status === 'active').length}
            </span>
          </button>
          <button
            className={`projects__filter ${filter === 'on-hold' ? 'projects__filter--active' : ''}`}
            onClick={() => setFilter('on-hold')}
          >
            On Hold
            <span className="projects__filter-count">
              {mockProjects.filter(p => p.status === 'on-hold').length}
            </span>
          </button>
          <button
            className={`projects__filter ${filter === 'completed' ? 'projects__filter--active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
            <span className="projects__filter-count">
              {mockProjects.filter(p => p.status === 'completed').length}
            </span>
          </button>
        </div>

        {/* Projects Grid */}
        <div className="projects__grid">
          {filteredProjects.map((project) => {
            const statusConfig = getStatusBadge(project.status)
            return (
              <div
                key={project.id}
                className="projects__card"
                onClick={() => handleProjectClick(project.id)}
              >
                <div className="projects__card-header">
                  <div
                    className="projects__card-icon"
                    style={{ background: project.color }}
                  >
                    <span className="material-symbols-outlined">folder_open</span>
                  </div>
                  <span className={`projects__status ${statusConfig.className}`}>
                    {statusConfig.label}
                  </span>
                </div>

                <h3 className="projects__card-title">{project.name}</h3>
                <p className="projects__card-description">{project.description}</p>

                {/* Progress */}
                <div className="projects__progress">
                  <div className="projects__progress-header">
                    <span className="projects__progress-label">Progress</span>
                    <span className="projects__progress-value">{project.progress}%</span>
                  </div>
                  <div className="projects__progress-bar">
                    <div
                      className="projects__progress-fill"
                      style={{
                        width: `${project.progress}%`,
                        background: project.color
                      }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="projects__stats">
                  <div className="projects__stat">
                    <span className="material-symbols-outlined">assignment</span>
                    <span>{project.requirements.completed}/{project.requirements.total} requirements</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="projects__card-footer">
                  <div className="projects__team">
                    {project.team.slice(0, 3).map((member, index) => (
                      <div
                        key={member.id}
                        className="projects__team-avatar"
                        style={{ zIndex: 3 - index }}
                        title={member.name}
                      >
                        {member.initials}
                      </div>
                    ))}
                    {project.team.length > 3 && (
                      <div className="projects__team-more">
                        +{project.team.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="projects__updated">
                    Updated {project.updatedAt}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </MainLayout>
  )
}

export default Projects
