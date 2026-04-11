import { useMemo, useState } from 'react'
import MainLayout from '../../layouts/MainLayout'
import Button from '../../components/Button'
import { useProjectData } from '../../context/ProjectDataContext'
import './Team.css'

const ROLE_CONFIG = {
  manager: { label: 'Manager', className: 'team__role-badge--manager' },
  client: { label: 'Client', className: 'team__role-badge--client' },
  member: { label: 'Member', className: 'team__role-badge--editor' }
}

function formatAuditTimestamp(isoDate) {
  const parsed = new Date(isoDate)
  if (Number.isNaN(parsed.getTime())) {
    return 'Invalid time'
  }

  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function Team() {
  const {
    currentUser,
    projectUsers,
    activityLogs,
    addProjectUser,
    updateProjectUserRole
  } = useProjectData()

  const [searchQuery, setSearchQuery] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteTitle, setInviteTitle] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [inviteError, setInviteError] = useState('')
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [pendingRole, setPendingRole] = useState('member')
  const [showRoleConfirmation, setShowRoleConfirmation] = useState(false)
  const [modalError, setModalError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) {
      return projectUsers
    }

    const normalizedQuery = searchQuery.trim().toLowerCase()
    return projectUsers.filter(
      (member) =>
        member.name.toLowerCase().includes(normalizedQuery) ||
        member.email.toLowerCase().includes(normalizedQuery)
    )
  }, [projectUsers, searchQuery])

  const auditLogs = useMemo(
    () => activityLogs.filter((entry) => entry.type === 'role_change').slice(0, 10),
    [activityLogs]
  )

  const openRoleModal = (user) => {
    if (user.role === 'client') {
      return
    }
    setSelectedUser(user)
    setPendingRole(user.role)
    setShowRoleConfirmation(false)
    setModalError('')
    setShowRoleModal(true)
  }

  const openInviteModal = () => {
    setInviteName('')
    setInviteEmail('')
    setInviteTitle('')
    setInviteRole('member')
    setInviteError('')
    setShowInviteModal(true)
  }

  const closeInviteModal = () => {
    setShowInviteModal(false)
    setInviteError('')
  }

  const handleInviteMember = () => {
    const inviteResult = addProjectUser({
      name: inviteName,
      email: inviteEmail,
      title: inviteTitle,
      role: inviteRole,
      actorName: currentUser.name
    })

    if (!inviteResult.ok) {
      setInviteError(inviteResult.error || 'Unable to invite user.')
      return
    }

    closeInviteModal()
    setSuccessMessage(`${inviteResult.user.name} invited successfully.`)
    window.setTimeout(() => setSuccessMessage(''), 3000)
  }

  const closeRoleModal = () => {
    setShowRoleModal(false)
    setSelectedUser(null)
    setPendingRole('member')
    setShowRoleConfirmation(false)
    setModalError('')
  }

  const startRoleUpdateConfirmation = () => {
    if (!selectedUser) {
      return
    }
    setModalError('')
    setShowRoleConfirmation(true)
  }

  const confirmRoleUpdate = () => {
    if (!selectedUser) {
      return
    }

    const updateResult = updateProjectUserRole({
      userId: selectedUser.id,
      role: pendingRole,
      actorName: currentUser.name
    })

    if (!updateResult.ok) {
      setModalError(updateResult.error || 'Unable to update role.')
      return
    }

    setSuccessMessage(`Role updated for ${selectedUser.name}.`)
    closeRoleModal()
    window.setTimeout(() => setSuccessMessage(''), 3000)
  }

  return (
    <MainLayout user={currentUser} role={currentUser.role}>
      <div className="team">
        <div className="team__header">
          <div className="team__header-left">
            <span className="team__breadcrumb">Project Management</span>
            <h1 className="team__title">Project Users</h1>
          </div>
          <div className="team__header-actions">
            <Button variant="secondary">Export List</Button>
            <Button variant="primary" icon="person_add" iconPosition="left" onClick={openInviteModal}>
              Invite New User
            </Button>
          </div>
        </div>

        <div className="team__warning">
          <div className="team__warning-content">
            <span className="material-symbols-outlined team__warning-icon">warning</span>
            <p className="team__warning-text">
              Client role is locked and at least one Manager must remain in the project.
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="team__success">
            <span className="material-symbols-outlined">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}

        <div className="team__table-container">
          <div className="team__table-header">
            <div className="team__search">
              <span className="material-symbols-outlined team__search-icon">search</span>
              <input
                type="text"
                className="team__search-input"
                placeholder="Filter by name or email..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          </div>

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
                  const roleConfig = ROLE_CONFIG[member.role] || ROLE_CONFIG.member
                  return (
                    <tr key={member.id}>
                      <td>
                        <div className="team__user">
                          <div className="team__user-avatar">
                            {member.name.split(' ').map((name) => name[0]).join('')}
                          </div>
                          <div className="team__user-info">
                            <div className="team__user-name">{member.name}</div>
                            <div className="team__user-title">{member.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="team__email">{member.email}</td>
                      <td>
                        <span className={`team__role-badge ${roleConfig.className}`}>
                          {roleConfig.label}
                          {member.role === 'client' && (
                            <span className="material-symbols-outlined">lock</span>
                          )}
                        </span>
                      </td>
                      <td>
                        <div className="team__last-active">
                          {member.isOnline && <span className="team__online-dot"></span>}
                          {member.lastActive}
                        </div>
                      </td>
                      <td className="team__td--right">
                        <button
                          className="team__action-btn"
                          onClick={() => openRoleModal(member)}
                          disabled={member.role === 'client'}
                        >
                          <span className="material-symbols-outlined">manage_accounts</span>
                          Change Role
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="team__pagination">
            <span className="team__pagination-info">
              Showing {filteredMembers.length} users in the current project
            </span>
          </div>
        </div>

        <div className="team__info-grid">
          <div className="team__info-card">
            <div className="team__info-header team__info-header--secondary">
              <span className="material-symbols-outlined">history</span>
              <h4 className="team__info-title">Role Change Audit Log</h4>
            </div>
            <div className="team__audit-list">
              {auditLogs.length === 0 && (
                <div className="team__audit-empty">No role changes recorded yet.</div>
              )}
              {auditLogs.map((log) => (
                <div key={log.id} className="team__audit-item">
                  <div className="team__audit-icon">
                    <span className="material-symbols-outlined">rule</span>
                  </div>
                  <div className="team__audit-content">
                    <div className="team__audit-action">{log.action}</div>
                    <div className="team__audit-timestamp">
                      {formatAuditTimestamp(log.timestamp)} • by {log.actorName}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showRoleModal && selectedUser && (
          <div className="team__modal-overlay" onClick={closeRoleModal}>
            <div className="team__modal" onClick={(event) => event.stopPropagation()}>
              <div className="team__modal-header">
                <h3 className="team__modal-title">Update Role Permission</h3>
                <button className="team__modal-close" onClick={closeRoleModal}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="team__modal-body">
                <div className="team__modal-user">
                  <div className="team__user-avatar">
                    {selectedUser.name.split(' ').map((name) => name[0]).join('')}
                  </div>
                  <div className="team__user-info">
                    <div className="team__user-name">{selectedUser.name}</div>
                    <div className="team__user-title">{selectedUser.email}</div>
                  </div>
                </div>

                {!showRoleConfirmation && (
                  <div className="team__role-options">
                    <label className="team__modal-label">Select New Role</label>
                    {[
                      {
                        id: 'manager',
                        label: 'Manager',
                        desc: 'Can manage users, workflow, and requirement governance.'
                      },
                      {
                        id: 'member',
                        label: 'Member',
                        desc: 'Can work on assigned requirements only.'
                      }
                    ].map((roleOption) => (
                      <div
                        key={roleOption.id}
                        className={`team__role-option ${pendingRole === roleOption.id ? 'team__role-option--active' : ''}`}
                        onClick={() => setPendingRole(roleOption.id)}
                      >
                        <div className="team__role-content">
                          <div className="team__role-name">{roleOption.label}</div>
                          <div className="team__role-desc">{roleOption.desc}</div>
                        </div>
                        {pendingRole === roleOption.id && (
                          <span className="material-symbols-outlined team__checkmark">check_circle</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {showRoleConfirmation && (
                  <div className="team__confirmation">
                    <p>
                      Confirm changing <strong>{selectedUser.name}</strong> from{' '}
                      <strong>{ROLE_CONFIG[selectedUser.role]?.label || selectedUser.role}</strong> to{' '}
                      <strong>{ROLE_CONFIG[pendingRole]?.label || pendingRole}</strong>.
                    </p>
                    <p>The new access rights will be applied immediately.</p>
                  </div>
                )}

                {modalError && <p className="team__modal-error">{modalError}</p>}
              </div>
              <div className="team__modal-footer">
                <Button variant="secondary" onClick={closeRoleModal}>Cancel</Button>
                {!showRoleConfirmation && (
                  <Button variant="primary" onClick={startRoleUpdateConfirmation}>
                    Continue
                  </Button>
                )}
                {showRoleConfirmation && (
                  <Button variant="primary" onClick={confirmRoleUpdate}>
                    Confirm Change
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {showInviteModal && (
          <div className="team__modal-overlay" onClick={closeInviteModal}>
            <div className="team__modal" onClick={(event) => event.stopPropagation()}>
              <div className="team__modal-header">
                <h3 className="team__modal-title">Invite New User</h3>
                <button className="team__modal-close" onClick={closeInviteModal}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="team__modal-body">
                <div className="team__invite-field">
                  <label className="team__modal-label" htmlFor="invite-name">Full Name</label>
                  <input
                    id="invite-name"
                    className="team__invite-input"
                    type="text"
                    placeholder="Enter full name"
                    value={inviteName}
                    onChange={(event) => setInviteName(event.target.value)}
                  />
                </div>

                <div className="team__invite-field">
                  <label className="team__modal-label" htmlFor="invite-email">Email</label>
                  <input
                    id="invite-email"
                    className="team__invite-input"
                    type="email"
                    placeholder="name@kfupm.edu.sa"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                  />
                </div>

                <div className="team__invite-field">
                  <label className="team__modal-label" htmlFor="invite-title">Job Title (optional)</label>
                  <input
                    id="invite-title"
                    className="team__invite-input"
                    type="text"
                    placeholder="e.g., QA Engineer"
                    value={inviteTitle}
                    onChange={(event) => setInviteTitle(event.target.value)}
                  />
                </div>

                <div className="team__invite-field">
                  <label className="team__modal-label" htmlFor="invite-role">Role</label>
                  <select
                    id="invite-role"
                    className="team__invite-input"
                    value={inviteRole}
                    onChange={(event) => setInviteRole(event.target.value)}
                  >
                    <option value="member">Member</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>

                {inviteError && <p className="team__modal-error">{inviteError}</p>}
              </div>

              <div className="team__modal-footer">
                <Button variant="secondary" onClick={closeInviteModal}>Cancel</Button>
                <Button
                  variant="primary"
                  onClick={handleInviteMember}
                  disabled={!inviteName.trim() || !inviteEmail.trim()}
                >
                  Invite User
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default Team
