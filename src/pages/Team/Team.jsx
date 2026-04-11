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
  const [members, setMembers] = useState(teamMembers)
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, action: 'Yusuf Malik invited to the project', time: '2m ago', type: 'invite' },
    { id: 2, action: 'Omar Faisal promoted to Senior Developer', time: '1h ago', type: 'promote' },
    { id: 3, action: 'Security policy updated by Manager', time: '3h ago', type: 'security' }
  ])
  const [selectedUser, setSelectedUser] = useState(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [tempRole, setTempRole] = useState('')

  const filteredMembers = members.filter(member => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query)
    )
  })

  const openRoleModal = (user) => {
    if (user.role === 'client') return
    setSelectedUser(user)
    setTempRole(user.role)
    setShowRoleModal(true)
  }

  const handleRoleUpdate = () => {
    if (!selectedUser || tempRole === selectedUser.role) {
      setShowRoleModal(false)
      return
    }

    // Validation: At least one Manager remains
    if (selectedUser.role === 'manager' && tempRole !== 'manager') {
      const managers = members.filter(m => m.role === 'manager')
      if (managers.length <= 1) {
        alert("Cannot demote the last manager. At least one Manager must remain in the project.")
        return
      }
    }

    // Update members
    const updatedMembers = members.map(m => 
      m.id === selectedUser.id ? { ...m, role: tempRole } : m
    )
    setMembers(updatedMembers)

    // Log the action
    const newLog = {
      id: Date.now(),
      action: `${selectedUser.name}'s role updated from ${selectedUser.role} to ${tempRole}`,
      time: 'Just now',
      type: 'role_change'
    }
    setAuditLogs([newLog, ...auditLogs])
    setShowRoleModal(false)
    setSelectedUser(null)
  }

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
                        <div 
                          className={`team__role-badge ${roleConfig.className} ${!roleConfig.locked ? 'team__role-badge--editable' : ''}`}
                          onClick={() => openRoleModal(member)}
                        >
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
              <h4 className="team__info-title">Recent Activity</h4>
            </div>
            <ul className="team__changes-list">
              {auditLogs.slice(0, 3).map(log => (
                <li key={log.id} className="team__changes-item">
                  <span>{log.action}</span>
                  <span className="team__changes-time">{log.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Role Selection Modal */}
        {showRoleModal && selectedUser && (
          <div className="team__modal-overlay" onClick={() => setShowRoleModal(false)}>
            <div className="team__modal" onClick={e => e.stopPropagation()}>
              <div className="team__modal-header">
                <h3 className="team__modal-title">Change User Role</h3>
                <button className="team__modal-close" onClick={() => setShowRoleModal(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="team__modal-body">
                <div className="team__modal-user">
                  <div className="team__user-avatar">
                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="team__user-info">
                    <div className="team__user-name">{selectedUser.name}</div>
                    <div className="team__user-title">{selectedUser.email}</div>
                  </div>
                </div>

                <div className="team__role-options">
                  <label className="team__modal-label">Select New Role</label>
                  {[
                    { id: 'manager', label: 'Manager', desc: 'Full project access and team management' },
                    { id: 'member', label: 'Member', desc: 'Can edit and refine requirements' },
                    { id: 'viewer', label: 'Viewer', desc: 'Read-only access to progress' }
                  ].map(role => (
                    <div 
                      key={role.id}
                      className={`team__role-option ${tempRole === role.id ? 'team__role-option--active' : ''}`}
                      onClick={() => setTempRole(role.id)}
                    >
                      <div className="team__role-content">
                        <div className="team__role-name">{role.label}</div>
                        <div className="team__role-desc">{role.desc}</div>
                      </div>
                      {tempRole === role.id && (
                        <span className="material-symbols-outlined team__checkmark">check_circle</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="team__modal-footer">
                <Button variant="secondary" onClick={() => setShowRoleModal(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleRoleUpdate}>Update Role</Button>
              </div>
            </div>
          </div>
        )}

        {/* Audit Logs View (Overlay for Audit Tab) */}
        {activeTab === 'audit' && (
          <div className="team__audit-view">
            <div className="team__audit-list">
              {auditLogs.map(log => (
                <div key={log.id} className="team__audit-item">
                  <div className="team__audit-icon">
                    <span className="material-symbols-outlined">
                      {log.type === 'role_change' ? 'rule' : 
                       log.type === 'invite' ? 'person_add' : 
                       log.type === 'security' ? 'shield' : 'info'}
                    </span>
                  </div>
                  <div className="team__audit-content">
                    <div className="team__audit-action">{log.action}</div>
                    <div className="team__audit-timestamp">{log.time} • Recorded in system logs</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default Team
