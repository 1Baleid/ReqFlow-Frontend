import { useState, useEffect } from 'react'
import Avatar from '../Avatar'
import { projects, getCurrentProject, setCurrentProject } from '../../data/mockData'
import './TopNav.css'

function TopNav({ user, onMenuClick, onProjectChange }) {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false)
  const [activeProject, setActiveProject] = useState(getCurrentProject())

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.topnav__project-wrapper')) {
        setIsProjectDropdownOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleProjectSelect = (project) => {
    setActiveProject(project)
    setCurrentProject(project.id)
    setIsProjectDropdownOpen(false)

    // Trigger callback if provided
    if (onProjectChange) {
      onProjectChange(project)
    }

    // Reload to reflect project change across the app
    window.location.reload()
  }

  return (
    <header className="topnav">
      {/* Mobile Menu Button */}
      <button className="topnav__menu-btn" onClick={onMenuClick} aria-label="Open menu">
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Search */}
      <div className="topnav__search">
        <span className="material-symbols-outlined topnav__search-icon">search</span>
        <input
          type="text"
          className="topnav__search-input"
          placeholder="Search requirements, projects, or users..."
        />
      </div>

      {/* Right Section */}
      <div className="topnav__actions">
        {/* Project Switcher */}
        <div className="topnav__project-wrapper">
          <button
            className="topnav__switcher"
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
          >
            <span
              className="topnav__project-dot"
              style={{ background: activeProject.color }}
            />
            <span className="topnav__project-name">{activeProject.name}</span>
            <span className="material-symbols-outlined topnav__switcher-arrow">
              {isProjectDropdownOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {isProjectDropdownOpen && (
            <div className="topnav__project-dropdown">
              <div className="topnav__dropdown-header">
                <span className="topnav__dropdown-title">Switch Project</span>
              </div>
              <div className="topnav__dropdown-list">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    className={`topnav__dropdown-item ${project.id === activeProject.id ? 'topnav__dropdown-item--active' : ''}`}
                    onClick={() => handleProjectSelect(project)}
                  >
                    <div className="topnav__dropdown-item-left">
                      <span
                        className="topnav__dropdown-dot"
                        style={{ background: project.color }}
                      />
                      <div className="topnav__dropdown-item-info">
                        <span className="topnav__dropdown-item-name">{project.name}</span>
                        <span className="topnav__dropdown-item-count">
                          {project.requirementsCount} requirements
                        </span>
                      </div>
                    </div>
                    {project.id === activeProject.id && (
                      <span className="material-symbols-outlined topnav__dropdown-check">check</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="topnav__dropdown-footer">
                <button className="topnav__dropdown-action">
                  <span className="material-symbols-outlined">add</span>
                  Create New Project
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Icons */}
        <div className="topnav__icons">
          <button className="topnav__icon-btn" aria-label="Notifications">
            <span className="material-symbols-outlined">notifications</span>
            <span className="topnav__notification-dot"></span>
          </button>
          <button className="topnav__icon-btn" aria-label="Help">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
        </div>

        {/* User Avatar */}
        <div className="topnav__user">
          <Avatar
            src={user?.avatar}
            name={user?.name || 'User'}
            size="sm"
          />
        </div>
      </div>
    </header>
  )
}

export default TopNav
