import { NavLink, useNavigate } from 'react-router-dom'
import { useRef, useState, useEffect, useCallback } from 'react'
import { clearStoredAuthSession } from '../../member-a-auth-entry/session'
import './Sidebar.css'

function Sidebar({ role = 'client', isCollapsed, onToggle, isMobileOpen, onMobileClose, notificationCounts = {} }) {
  const navigate = useNavigate()
  const navRef = useRef(null)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [tooltipVisible, setTooltipVisible] = useState(null)
  const tooltipTimeoutRef = useRef(null)

  // Menu items based on role with optional badge counts
  const menuItems = {
    client: [
      { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { path: '/requirements', icon: 'assignment', label: 'Requirements', badgeKey: 'requirements' },
      { path: '/projects', icon: 'folder_open', label: 'Projects' }
    ],
    manager: [
      { path: '/manager', icon: 'dashboard', label: 'Dashboard' },
      { path: '/manager/requirements', icon: 'assignment', label: 'Requirements', badgeKey: 'requirements' },
      { path: '/team', icon: 'group', label: 'Project Users', badgeKey: 'team' },
      { path: '/projects', icon: 'folder_open', label: 'Projects' },
      { path: '/settings', icon: 'settings', label: 'Settings' }
    ],
    member: [
      { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { path: '/requirements', icon: 'assignment', label: 'Requirements', badgeKey: 'requirements' },
      { path: '/projects', icon: 'folder_open', label: 'Projects' }
    ]
  }

  const items = menuItems[role] || menuItems.client

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e) => {
    if (!navRef.current) return

    const links = navRef.current.querySelectorAll('.sidebar__link')
    const currentIndex = focusedIndex

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        const nextIndex = currentIndex < links.length - 1 ? currentIndex + 1 : 0
        setFocusedIndex(nextIndex)
        links[nextIndex]?.focus()
        break
      case 'ArrowUp':
        e.preventDefault()
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : links.length - 1
        setFocusedIndex(prevIndex)
        links[prevIndex]?.focus()
        break
      case 'Home':
        e.preventDefault()
        setFocusedIndex(0)
        links[0]?.focus()
        break
      case 'End':
        e.preventDefault()
        setFocusedIndex(links.length - 1)
        links[links.length - 1]?.focus()
        break
      default:
        break
    }
  }, [focusedIndex])

  // Show tooltip with delay
  const handleMouseEnter = (index, label) => {
    if (!isCollapsed || isMobileOpen) return

    tooltipTimeoutRef.current = setTimeout(() => {
      setTooltipVisible({ index, label })
    }, 300)
  }

  // Hide tooltip
  const handleMouseLeave = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
    }
    setTooltipVisible(null)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
      }
    }
  }, [])

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
        <nav
          className="sidebar__nav"
          ref={navRef}
          onKeyDown={handleKeyDown}
          role="navigation"
          aria-label="Main navigation"
        >
          {items.map((item, index) => {
            const badgeCount = item.badgeKey ? notificationCounts[item.badgeKey] : 0
            return (
              <div
                key={item.path}
                className="sidebar__link-wrapper"
                onMouseEnter={() => handleMouseEnter(index, item.label)}
                onMouseLeave={handleMouseLeave}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                  }
                  onClick={handleNavClick}
                  onFocus={() => setFocusedIndex(index)}
                  tabIndex={0}
                >
                  <span className="sidebar__link-ripple" />
                  <span className="material-symbols-outlined sidebar__link-icon">
                    {item.icon}
                  </span>
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="sidebar__link-label">{item.label}</span>
                  )}
                  {badgeCount > 0 && (
                    <span className={`sidebar__badge ${isCollapsed && !isMobileOpen ? 'sidebar__badge--collapsed' : ''}`}>
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </NavLink>
                {/* Tooltip for collapsed state */}
                {tooltipVisible?.index === index && isCollapsed && !isMobileOpen && (
                  <div className="sidebar__tooltip">
                    {item.label}
                    {badgeCount > 0 && <span className="sidebar__tooltip-badge">{badgeCount}</span>}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar__footer">
          <div
            className="sidebar__footer-item"
            onMouseEnter={() => handleMouseEnter('cta', 'New Requirement')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className="sidebar__cta"
              onClick={handleNewRequirement}
              aria-label="Create new requirement"
            >
              <span className="sidebar__link-ripple" />
              <span className="material-symbols-outlined">add</span>
              {(!isCollapsed || isMobileOpen) && <span>New Requirement</span>}
            </button>
            {tooltipVisible?.index === 'cta' && isCollapsed && !isMobileOpen && (
              <div className="sidebar__tooltip">New Requirement</div>
            )}
          </div>

          <div
            className="sidebar__footer-item"
            onMouseEnter={() => handleMouseEnter('logout', 'Logout')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className="sidebar__logout"
              onClick={handleLogout}
              aria-label="Logout from application"
            >
              <span className="material-symbols-outlined">logout</span>
              {(!isCollapsed || isMobileOpen) && <span>Logout</span>}
            </button>
            {tooltipVisible?.index === 'logout' && isCollapsed && !isMobileOpen && (
              <div className="sidebar__tooltip sidebar__tooltip--danger">Logout</div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
