import { NavLink, useNavigate } from 'react-router-dom'
import { clearStoredAuthSession } from '../../member-a-auth-entry/session'
import './Sidebar.css'

function Sidebar({ role = 'client', isCollapsed, onToggle, isMobileOpen, onMobileClose }) {
  const navigate = useNavigate()

  // Menu items based on role
  const menuItems = {
    client: [
      { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { path: '/requirements', icon: 'assignment', label: 'Requirements' },
      { path: '/projects', icon: 'folder_open', label: 'Projects' }
    ],
    manager: [
      { path: '/manager', icon: 'dashboard', label: 'Dashboard' },
      { path: '/manager/requirements', icon: 'assignment', label: 'Requirements' },
      { path: '/team', icon: 'group', label: 'Project Users' },
      { path: '/projects', icon: 'folder_open', label: 'Projects' },
      { path: '/settings', icon: 'settings', label: 'Settings' }
    ],
    member: [
      { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { path: '/requirements', icon: 'assignment', label: 'Requirements' },
      { path: '/projects', icon: 'folder_open', label: 'Projects' }
    ]
  }

  const items = menuItems[role] || menuItems.client

  const handleNewRequirement = () => {
    navigate('/requirements/new')
    if (onMobileClose) onMobileClose()
  }

  const handleLogout = () => {
    clearStoredAuthSession()
    navigate('/login', { replace: true })
  }

  const handleNavClick = () => {
    if (onMobileClose) onMobileClose()
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="sidebar__overlay" onClick={onMobileClose} />
      )}

      <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''} ${isMobileOpen ? 'sidebar--mobile-open' : ''}`}>
        {/* Toggle Button - Desktop */}
        <button
          className="sidebar__toggle"
          onClick={onToggle}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="material-symbols-outlined">
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>

        {/* Mobile Close Button */}
        <button className="sidebar__mobile-close" onClick={onMobileClose}>
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Logo */}
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <div className="sidebar__logo-icon">
              <span className="material-symbols-outlined">account_tree</span>
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="sidebar__logo-text">
                <span className="sidebar__brand">ReqFlow</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
              title={isCollapsed && !isMobileOpen ? item.label : undefined}
              onClick={handleNavClick}
            >
              <span className="material-symbols-outlined sidebar__link-icon">
                {item.icon}
              </span>
              {(!isCollapsed || isMobileOpen) && (
                <span className="sidebar__link-label">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar__footer">
          <button
            className="sidebar__cta"
            onClick={handleNewRequirement}
            title={isCollapsed && !isMobileOpen ? 'New Requirement' : undefined}
          >
            <span className="material-symbols-outlined">add</span>
            {(!isCollapsed || isMobileOpen) && <span>New Requirement</span>}
          </button>

          <button
            className="sidebar__logout"
            onClick={handleLogout}
            title={isCollapsed && !isMobileOpen ? 'Logout' : undefined}
          >
            <span className="material-symbols-outlined">logout</span>
            {(!isCollapsed || isMobileOpen) && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
