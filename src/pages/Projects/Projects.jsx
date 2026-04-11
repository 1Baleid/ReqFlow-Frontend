import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Button from '../../components/Button'
import { deleteProject, getCurrentUser, getProjects, setCurrentProject } from '../../data/mockData'
import { useProjectData } from '../../context/ProjectDataContext'
import './Projects.css'

function Projects() {
  const { currentUser } = useProjectData()
  const navigate = useNavigate()
  const location = useLocation()
  const [filter, setFilter] = useState('all')
  const [projectList, setProjectList] = useState(getProjects)
  const [highlightedProjectId, setHighlightedProjectId] = useState('')
  const [openMenuProjectId, setOpenMenuProjectId] = useState('')
  const projectRefs = useRef({})
  const scrollTimeoutRef = useRef(null)
  const highlightTimeoutRef = useRef(null)

  const focusProjectCard = useCallback((projectId) => {
    if (!projectId) {
      return
    }

    setFilter('all')
    setHighlightedProjectId(projectId)
    window.clearTimeout(scrollTimeoutRef.current)
    window.clearTimeout(highlightTimeoutRef.current)

    scrollTimeoutRef.current = window.setTimeout(() => {
      projectRefs.current[projectId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }, 100)

    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightedProjectId('')
    }, 2200)
  }, [])

  useEffect(() => {
    const syncProjects = (event) => {
      setProjectList(getProjects())

      if (!event?.detail?.deletedProjectId && event?.detail?.project?.id) {
        focusProjectCard(event.detail.project.id)
      }
    }

    window.addEventListener('projectsChanged', syncProjects)
    return () => window.removeEventListener('projectsChanged', syncProjects)
  }, [focusProjectCard])

  useEffect(() => {
    const closeProjectMenu = () => setOpenMenuProjectId('')
    document.addEventListener('click', closeProjectMenu)
    return () => document.removeEventListener('click', closeProjectMenu)
  }, [])

  useEffect(() => () => {
    window.clearTimeout(scrollTimeoutRef.current)
    window.clearTimeout(highlightTimeoutRef.current)
  }, [])

  useEffect(() => {
    const createdProjectId = location.state?.highlightedProjectId || location.state?.createdProjectId

    if (!createdProjectId) {
      return
    }

    setProjectList(getProjects())
    focusProjectCard(createdProjectId)
    navigate('/projects', { replace: true, state: null })
  }, [focusProjectCard, location.state, navigate])

  const filteredProjects = useMemo(() => projectList.filter(project => {
    if (filter === 'all') return true
    return project.status === filter
  }), [filter, projectList])

  const projectCounts = useMemo(() => ({
    all: projectList.length,
    active: projectList.filter((project) => project.status === 'active').length,
    onHold: projectList.filter((project) => project.status === 'on-hold').length,
    completed: projectList.filter((project) => project.status === 'completed').length
  }), [projectList])

  const getStatusBadge = (status) => {
    const config = {
      'active': { label: 'Active', className: 'projects__status--active' },
      'on-hold': { label: 'On Hold', className: 'projects__status--hold' },
      'completed': { label: 'Completed', className: 'projects__status--completed' }
    }
    return config[status] || config['active']
  }

  const getProjectStats = (project) => {
    const total = project.requirements?.total ?? project.requirementsCount ?? 0
    const completed = project.requirements?.completed ?? Math.round(total * ((project.progress ?? 0) / 100))

    return { total, completed }
  }

  const handleProjectClick = (projectId) => {
    const selectedProject = projectList.find((project) => project.id === projectId)
    const sessionUser = getCurrentUser()
    const sessionEmail = String(sessionUser?.email || '').trim().toLowerCase()
    const projectUserMatch = selectedProject?.users?.find((user) => {
      if (sessionUser?.id && user.id === sessionUser.id) {
        return true
      }

      if (!sessionEmail) {
        return false
      }

      return String(user.email || '').trim().toLowerCase() === sessionEmail
    })
    const targetRole = projectUserMatch?.role || sessionUser?.role || 'client'

    setCurrentProject(projectId)
    navigate(targetRole === 'manager' ? '/manager' : '/dashboard')
  }

  const handleMenuToggle = (event, projectId) => {
    event.stopPropagation()
    setOpenMenuProjectId((previousProjectId) => (
      previousProjectId === projectId ? '' : projectId
    ))
  }

  const handleEditProject = (event, projectId) => {
    event.stopPropagation()
    setOpenMenuProjectId('')
    navigate(`/projects/${projectId}/edit`)
  }

  const handleDeleteProject = (event, project) => {
    event.stopPropagation()
    setOpenMenuProjectId('')

    const shouldDelete = window.confirm(`Delete "${project.name}"? This cannot be undone.`)
    if (!shouldDelete) {
      return
    }

    const deleteResult = deleteProject(project.id)
    if (!deleteResult.ok) {
      window.alert(deleteResult.error || 'Unable to delete project.')
      return
    }

    setProjectList(deleteResult.projects)
  }

  return (
    <MainLayout user={currentUser} role={currentUser.role}>
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
            <Button
              variant="primary"
              icon="add"
              onClick={() => navigate('/projects/new')}
            >
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
            <span className="projects__filter-count">{projectCounts.all}</span>
          </button>
          <button
            className={`projects__filter ${filter === 'active' ? 'projects__filter--active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active
            <span className="projects__filter-count">{projectCounts.active}</span>
          </button>
          <button
            className={`projects__filter ${filter === 'on-hold' ? 'projects__filter--active' : ''}`}
            onClick={() => setFilter('on-hold')}
          >
            On Hold
            <span className="projects__filter-count">{projectCounts.onHold}</span>
          </button>
          <button
            className={`projects__filter ${filter === 'completed' ? 'projects__filter--active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
            <span className="projects__filter-count">{projectCounts.completed}</span>
          </button>
        </div>

        {/* Projects Grid */}
        <div className="projects__grid">
          {filteredProjects.map((project) => {
            const statusConfig = getStatusBadge(project.status)
            const stats = getProjectStats(project)
            const team = project.team || []

            return (
              <div
                key={project.id}
                ref={(element) => {
                  projectRefs.current[project.id] = element
                }}
                className={`projects__card ${highlightedProjectId === project.id ? 'projects__card--highlighted' : ''}`}
                onClick={() => handleProjectClick(project.id)}
              >
                <div className="projects__card-header">
                  <div
                    className="projects__card-icon"
                    style={{ background: project.color }}
                  >
                    <span className="material-symbols-outlined">folder_open</span>
                  </div>
                  <div className="projects__card-controls" onClick={(event) => event.stopPropagation()}>
                    <span className={`projects__status ${statusConfig.className}`}>
                      {statusConfig.label}
                    </span>
                    <div className="projects__menu">
                      <button
                        type="button"
                        className="projects__menu-btn"
                        aria-label={`Project actions for ${project.name}`}
                        aria-haspopup="menu"
                        aria-expanded={openMenuProjectId === project.id}
                        onClick={(event) => handleMenuToggle(event, project.id)}
                      >
                        <span className="projects__menu-dots" aria-hidden="true"></span>
                      </button>
                      {openMenuProjectId === project.id && (
                        <div className="projects__menu-popover" role="menu">
                          <button
                            type="button"
                            className="projects__menu-item"
                            role="menuitem"
                            onClick={(event) => handleEditProject(event, project.id)}
                          >
                            Edit project
                          </button>
                          <button
                            type="button"
                            className="projects__menu-item projects__menu-item--danger"
                            role="menuitem"
                            onClick={(event) => handleDeleteProject(event, project)}
                          >
                            Delete project
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
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
                    <span>{stats.completed}/{stats.total} requirements</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="projects__card-footer">
                  <div className="projects__team">
                    {team.length > 0 ? (
                      team.slice(0, 3).map((member, index) => (
                        <div
                          key={member.id}
                          className="projects__team-avatar"
                          style={{ zIndex: 3 - index }}
                          title={member.name}
                        >
                          {member.initials}
                        </div>
                      ))
                    ) : (
                      <div className="projects__team-empty">New</div>
                    )}
                    {team.length > 3 && (
                      <div className="projects__team-more">
                        +{team.length - 3}
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
