import { useState } from 'react'
import MainLayout from '../../layouts/MainLayout'
import Button from '../../components/Button'
import { getCurrentUser, teamMembers } from '../../data/mockData'
import './Team.css'

const ROLE_CONFIG = {
  manager: { label: 'Manager', className: 'team__role-badge--manager', editable: true },
  client: { label: 'Owner', className: 'team__role-badge--client', editable: false, locked: true },
  member: { label: 'Member', className: 'team__role-badge--editor', editable: true },
  editor: { label: 'Editor', className: 'team__role-badge--editor', editable: true },
  viewer: { label: 'Viewer', className: 'team__role-badge--viewer', editable: true }
}

const TABS = [
  { id: 'all', label: 'All Users', count: null },
  { id: 'pending', label: 'Pending Invites', count: 12 },
  { id: 'permissions', label: 'Permissions', count: null },
  { id: 'audit', label: 'Audit Logs', count: null }
]

function Team() {
  const currentUser = getCurrentUser()
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showWarning, setShowWarning] = useState(true)

  const filteredMembers = teamMembers.filter(member => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query)
    )
  })

  return (
    <MainLayout user={currentUser} role={currentUser.role}>
      <div className="team">
        {/* Header */}
        <div className="team__header">
          <div className="team__header-left">
            <span className="team__breadcrumb">Project Management</span>
            <h1 className="team__title">Users & Roles</h1>
          </div>
          <div className="team__header-actions">
            <Button variant="secondary">Export List</Button>
            <Button variant="primary" icon="person_add" iconPosition="left">
              Invite New User
            </Button>
          </div>
        </div>

        {/* Warning Banner */}
        {showWarning && (
          <div className="team__warning">
            <div className="team__warning-content">
              <span className="material-symbols-outlined team__warning-icon">warning</span>
              <p className="team__warning-text">At least one Manager must remain in the project.</p>
            </div>
            <button className="team__warning-close" onClick={() => setShowWarning(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="team__tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`team__tab ${activeTab === tab.id ? 'team__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.count && <span className="team__tab-count">{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Table Container */}
        <div className="team__table-container">
          {/* Search Bar */}
          <div className="team__table-header">
            <div className="team__search">
              <span className="material-symbols-outlined team__search-icon">search</span>
              <input
                type="text"
                className="team__search-input"
                placeholder="Filter by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="team__filter-btn">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>

          {/* Table */}
          <div className="team__table-wrapper">
            <table className="team__table">
              <thead>
                <tr>
                  <th>Name & Details</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Last Active</th>
                  <th className="team__th--right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => {
                  const roleConfig = ROLE_CONFIG[member.role] || ROLE_CONFIG.viewer
                  return (
                    <tr key={member.id}>
                      <td>
                        <div className="team__user">
                          <div className="team__user-avatar">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="team__user-info">
                            <div className="team__user-name">{member.name}</div>
                            <div className="team__user-title">{member.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="team__email">{member.email}</td>
                      <td>
                        <div className={`team__role-badge ${roleConfig.className}`}>
                          {roleConfig.label}
                          {roleConfig.locked ? (
                            <span className="material-symbols-outlined">lock</span>
                          ) : (
                            <span className="material-symbols-outlined">expand_more</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="team__last-active">
                          {member.isOnline && (
                            <span className="team__online-dot"></span>
                          )}
                          {member.lastActive}
                        </div>
                      </td>
                      <td className="team__td--right">
                        {member.role === 'manager' ? (
                          <button className="team__action-btn team__action-btn--danger">
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        ) : (
                          <button className="team__action-btn">
                            <span className="material-symbols-outlined">more_vert</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="team__pagination">
            <span className="team__pagination-info">Showing 1-{filteredMembers.length} of 38 users</span>
            <div className="team__pagination-controls">
              <button className="team__pagination-btn" disabled>Previous</button>
              <button className="team__pagination-btn">Next</button>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="team__info-grid">
          <div className="team__info-card">
            <div className="team__info-header team__info-header--primary">
              <span className="material-symbols-outlined">shield</span>
              <h4 className="team__info-title">Security Note</h4>
            </div>
            <p className="team__info-text">
              Roles control global project permissions. Only Managers can invite new members or change role assignments.
            </p>
          </div>
          <div className="team__info-card">
            <div className="team__info-header team__info-header--tertiary">
              <span className="material-symbols-outlined">group_add</span>
              <h4 className="team__info-title">Bulk Invites</h4>
            </div>
            <p className="team__info-text">
              Manage large teams by uploading a CSV of emails. Invited users will default to the 'Viewer' role until approved.
            </p>
          </div>
          <div className="team__info-card">
            <div className="team__info-header team__info-header--secondary">
              <span className="material-symbols-outlined">history</span>
              <h4 className="team__info-title">Recent Changes</h4>
            </div>
            <ul className="team__changes-list">
              <li className="team__changes-item">
                <span>Yusuf Malik invited</span>
                <span className="team__changes-time">2m ago</span>
              </li>
              <li className="team__changes-item">
                <span>Omar promoted to Senior</span>
                <span className="team__changes-time">1h ago</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Team
