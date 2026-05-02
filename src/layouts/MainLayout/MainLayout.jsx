import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import TopNav from '../../components/TopNav'
import './MainLayout.css'

function getStoredUser() {
  try {
    const stored = localStorage.getItem('authUser')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to parse stored user:', e)
  }
  return { name: 'User', email: '', role: 'client' }
}

function MainLayout({ children, user: propUser, role: propRole }) {
  // Use props if provided, otherwise get from localStorage
  const currentUser = propUser || getStoredUser()
  const role = propRole || currentUser.role || 'client'
  const user = currentUser

  // Sidebar collapsed state - persist in localStorage
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved === 'true'
  })

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(prev => {
      const newValue = !prev
      localStorage.setItem('sidebarCollapsed', String(newValue))
      return newValue
    })
  }

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(prev => !prev)
  }

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className={`main-layout ${isSidebarCollapsed ? 'main-layout--sidebar-collapsed' : ''}`}>
      <Sidebar
        role={role}
        isCollapsed={isSidebarCollapsed}
        onToggle={handleSidebarToggle}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={handleMobileMenuClose}
      />
      <TopNav
        user={user}
        onMenuClick={handleMobileMenuToggle}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      <main className="main-layout__content">
        <div className="main-layout__container">
          {children}
        </div>
      </main>
    </div>
  )
}

export default MainLayout
