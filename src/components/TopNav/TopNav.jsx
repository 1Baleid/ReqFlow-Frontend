import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../Avatar'
import {
  getCurrentProject,
  getProjects,
  setCurrentProject
} from '../../data/mockData'
import './TopNav.css'

function TopNav({ user, onMenuClick, onProjectChange, isMobileMenuOpen = false }) {
  const navigate = useNavigate()
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [projectList, setProjectList] = useState(getProjects)
  const [activeProject, setActiveProject] = useState(getCurrentProject())
  const searchInputRef = useRef(null)
  const userMenuRef = useRef(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.topnav__project-wrapper')) {
        setIsProjectDropdownOpen(false)
      }
      if (!e.target.closest('.topnav__user-wrapper')) {
        setIsUserMenuOpen(false)
      }
      if (!e.target.closest('.topnav__search') && !e.target.closest('.topnav__search-toggle')) {
        setIsMobileSearchOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Focus search input when mobile search opens
  useEffect(() => {
    if (isMobileSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isMobileSearchOpen])

  // Close mobile search on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMobileSearchOpen(false)
        setIsUserMenuOpen(false)
        setIsProjectDropdownOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  useEffect(() => {
    const syncProjects = () => {
      setProjectList(getProjects())
      setActiveProject(getCurrentProject())
    }

    window.addEventListener('projectsChanged', syncProjects)
    window.addEventListener('projectChanged', syncProjects)
    return () => {
      window.removeEventListener('projectsChanged', syncProjects)
      window.removeEventListener('projectChanged', syncProjects)
    }
  }, [])

  const handleProjectSelect = (project) => {
    setActiveProject(project)
    setCurrentProject(project.id)
    setIsProjectDropdownOpen(false)

    // Trigger callback if provided
    if (onProjectChange) {
      onProjectChange(project)
    }
  }

  const handleOpenCreateProject = () => {
    setIsProjectDropdownOpen(false)
    navigate('/projects/new')
  }

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  const handleProfileClick = () => {
    setIsUserMenuOpen(false)
    navigate('/settings')
  }

  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen)
  }

  return (
    <header className={`topnav ${isMobileSearchOpen ? 'topnav--search-open' : ''}`}>
      {/* Mobile Menu Button - Animated Hamburger */}
      <button
        className={`topnav__menu-btn ${isMobileMenuOpen ? 'topnav__menu-btn--active' : ''}`}
        onClick={onMenuClick}
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isMobileMenuOpen}
      >
        <span className="topnav__hamburger">
          <span className="topnav__hamburger-line"></span>
          <span className="topnav__hamburger-line"></span>
          <span className="topnav__hamburger-line"></span>
        </span>
      </button>

      {/* Mobile Search Toggle */}
      <button
        className="topnav__search-toggle"
        onClick={handleMobileSearchToggle}
        aria-label="Toggle search"
      >
        <span className="material-symbols-outlined">
          {isMobileSearchOpen ? 'close' : 'search'}
        </span>
      </button>

      {/* Search */}
      <div className={`topnav__search ${isMobileSearchOpen ? 'topnav__search--mobile-open' : ''}`}>
        <span className="material-symbols-outlined topnav__search-icon">search</span>
        <input
          ref={searchInputRef}
          type="text"
          className="topnav__search-input"
          placeholder="Search requirements, projects, or users..."
        />
        <button
          className="topnav__search-close"
          onClick={() => setIsMobileSearchOpen(false)}
          aria-label="Close search"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
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
                {projectList.map((project) => (
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
                <button className="topnav__dropdown-action" onClick={handleOpenCreateProject}>
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

        {/* User Avatar with Dropdown */}
        <div className="topnav__user-wrapper" ref={userMenuRef}>
          <button
            className="topnav__user"
            onClick={handleUserMenuToggle}
            aria-label="User menu"
            aria-expanded={isUserMenuOpen}
          >
            <Avatar
              src={user?.avatar}
              name={user?.name || 'User'}
              size="sm"
            />
          </button>

          {isUserMenuOpen && (
            <div className="topnav__user-dropdown">
              <div className="topnav__user-header">
                <Avatar
                  src={user?.avatar}
                  name={user?.name || 'User'}
                  size="md"
                />
                <div className="topnav__user-info">
                  <span className="topnav__user-name">{user?.name || 'User'}</span>
                  <span className="topnav__user-email">{user?.email || 'user@email.com'}</span>
                </div>
              </div>
              <div className="topnav__user-menu">
                <button className="topnav__user-menu-item" onClick={handleProfileClick}>
                  <span className="material-symbols-outlined">person</span>
                  Profile Settings
                </button>
                <button className="topnav__user-menu-item" onClick={handleProfileClick}>
                  <span className="material-symbols-outlined">notifications</span>
                  Notification Preferences
                </button>
                <button className="topnav__user-menu-item" onClick={handleProfileClick}>
                  <span className="material-symbols-outlined">help</span>
                  Help & Support
                </button>
              </div>
              <div className="topnav__user-footer">
                <button
                  className="topnav__user-logout"
                  onClick={() => {
                    setIsUserMenuOpen(false)
                    navigate('/login')
                  }}
                >
                  <span className="material-symbols-outlined">logout</span>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </header>
  )
}

export default TopNav
